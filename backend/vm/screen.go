package vm

import (
	"NanoKVM-Server/backend/protocol"
	"fmt"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
)

type ScreenReq struct {
	Type  string `validate:"required"` // 参数类型：resolution, fps, quality
	Value int    `validate:"required"` // 设置值
}

func Screen(c *gin.Context) {
	var req ScreenReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	device, ok := kvmMap[req.Type]
	if !ok {
		rsp.ErrRsp(c, -2, "invalid arguments")
		return
	}

	data := fmt.Sprintf("%d", req.Value)
	err := os.WriteFile(device, []byte(data), 0666)
	if err != nil {
		log.Errorf("write kvm %s failed: %s", device, err)
		rsp.ErrRsp(c, -3, "update screen failed")
		return
	}

	log.Debug("update screen: %+v", req)
	rsp.OkRsp(c)
}
