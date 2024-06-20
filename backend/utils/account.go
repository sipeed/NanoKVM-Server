package utils

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"os"
	"path/filepath"
)

const AccountFile = "/etc/kvm/pwd"

type Account struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func GetAccount() *Account {
	account := &Account{
		Username: "admin",
		Password: "admin",
	}

	content, err := os.ReadFile(AccountFile)
	if err != nil {
		return account
	}

	err = json.Unmarshal(content, account)
	if err != nil {
		log.Errorf("unmarshal account failed: %s", err)
		return account
	}

	password, _ := DecodeDecrypt(account.Password)
	if password != "" {
		account.Password = password
	}

	return account
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

func Cookie2Account(cookie string) (Account, error) {
	var account Account

	cookieDecrypt, err := DecodeDecrypt(cookie)
	if err != nil {
		return account, err
	}

	err = json.Unmarshal([]byte(cookieDecrypt), &account)
	if err != nil {
		return account, err
	}

	return account, err
}
