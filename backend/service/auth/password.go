package auth

import (
	"NanoKVM-Server/backend/protocol"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
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

	if err := SetAccount(req.Username, req.Password); err != nil {
		rsp.ErrRsp(c, -2, "change password failed")
		return
	}

	log.Debugf("change password success, username: %s", req.Username)
	rsp.OkRsp(c)
}
