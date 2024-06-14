package auth

import (
	"NanoKVM-Server/backend/protocol"
	"encoding/json"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
)

type ChangePasswordReq struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func ChangePassword(c *gin.Context) {
	var req ChangePasswordReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid parameters")
		return
	}

	content, err := json.Marshal(&req)
	if err != nil {
		rsp.ErrRsp(c, -2, "parse password failed")
		return
	}

	file, err := os.OpenFile(PasswordFile, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
	defer file.Close()
	if err != nil {
		log.Errorf("open password failed: %s", err)
		rsp.ErrRsp(c, -3, "open password failed")
		return
	}

	if _, err = file.Write(content); err != nil {
		log.Errorf("write password failed: %s", err)
		rsp.ErrRsp(c, -4, "write password failed")
		return
	}

	rsp.OkRsp(c)
}
