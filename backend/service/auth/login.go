package auth

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

type LoginReq struct {
	Username string `validate:"required"` // 用户名
	Password string `validate:"required"` // 密码
}

type LoginRsp struct {
	Token string `json:"token"`
}

func Login(c *gin.Context) {
	var req LoginReq
	var rsp protocol.Response

	conf := utils.GetConfig()
	if conf.Authentication == "disable" {
		rsp.OkRspWithData(c, &LoginRsp{
			Token: "Disabled",
		})
		return
	}

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid parameters")
		return
	}

	passwordDecrypt, err := utils.DecodeDecrypt(req.Password)
	if err != nil {
		rsp.ErrRsp(c, -2, "decrypt password failed")
		return
	}

	account, err := GetAccount()
	if err != nil {
		rsp.ErrRsp(c, -3, "get account failed")
		return
	}

	if req.Username != account.Username || passwordDecrypt != account.Password {
		rsp.ErrRsp(c, -4, "invalid username or password")
		return
	}

	token, err := utils.GenerateJWT(req.Username)
	if err != nil {
		rsp.ErrRsp(c, -5, "generate token failed")
		return
	}

	rsp.OkRspWithData(c, &LoginRsp{
		Token: token,
	})

	log.Debugf("login success, username: %s", req.Username)
}
