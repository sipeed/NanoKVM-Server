package auth

import (
	"NanoKVM-Server/backend/protocol"
	"encoding/json"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
)

type LoginReq struct {
	Username string `validate:"required"` // 用户名
	Password string `validate:"required"` // 密码
}

func Login(c *gin.Context) {
	var req LoginReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid parameters")
		return
	}

	exists, err := isFileExists(PasswordFile)
	if err != nil {
		rsp.ErrRsp(c, -2, "get password failed")
		return
	}

	if exists {
		var content []byte
		var user User

		if content, err = os.ReadFile(PasswordFile); err != nil {
			log.Errorf("read password failed: %s", err)
			rsp.ErrRsp(c, -3, "read password failed")
			return
		}

		if err = json.Unmarshal(content, &user); err != nil {
			rsp.ErrRsp(c, -4, "parse password failed")
			return
		}

		if req.Username != user.Username || req.Password != user.Password {
			rsp.ErrRsp(c, -5, "invalid username or password")
			return
		}
	} else {
		if req.Username != "admin" || req.Password != "admin" {
			rsp.ErrRsp(c, -5, "invalid username or password")
			return
		}
	}

	rsp.OkRsp(c)
}

func isFileExists(file string) (bool, error) {
	_, err := os.Stat(file)
	if err == nil {
		return true, nil
	}

	if os.IsNotExist(err) {
		return false, nil
	}

	log.Errorf("check %s exits failed: %s", file, err)
	return false, err
}
