package auth

import (
	"NanoKVM-Server/backend/utils"
	"encoding/json"
	"errors"
	log "github.com/sirupsen/logrus"
	"os"
	"path/filepath"
)

const AccountFile = "/etc/kvm/pwd"

type Account struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// GetAccount 获取文件中保存的账户信息
func GetAccount() (*Account, error) {
	if _, err := os.Stat(AccountFile); err != nil {
		// 文件不存在时，返回默认账户
		if errors.Is(err, os.ErrNotExist) {
			return &Account{
				Username: "admin",
				Password: "admin",
			}, nil
		}

		return nil, err
	}

	content, err := os.ReadFile(AccountFile)
	if err != nil {
		return nil, err
	}

	var account Account
	err = json.Unmarshal(content, &account)
	if err != nil {
		log.Errorf("unmarshal account failed: %s", err)
		return nil, err
	}

	password, err := utils.DecodeDecrypt(account.Password)
	if err != nil {
		return nil, err
	}

	account.Password = password

	return &account, nil
}

func SetAccount(username string, password string) error {
	account, err := json.Marshal(&Account{
		Username: username,
		Password: password,
	})

	err = os.MkdirAll(filepath.Dir(AccountFile), 0644)
	if err != nil {
		log.Errorf("create directory %s failed: %s", AccountFile, err)
		return err
	}

	err = os.WriteFile(AccountFile, account, 0644)
	if err != nil {
		log.Errorf("write password failed: %s", err)
		return err
	}

	return nil
}
