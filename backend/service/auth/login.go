package auth

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils"
	"github.com/gin-gonic/gin"
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

	passwordDecrypt, err := utils.DecodeDecrypt(req.Password)
	if err != nil {
		rsp.ErrRsp(c, -2, "decrypt password failed")
		return
	}

	account := utils.GetAccount()

	if req.Username != account.Username || passwordDecrypt != account.Password {
		rsp.ErrRsp(c, -3, "invalid username or password")
		return
	}

	rsp.OkRsp(c)
}
