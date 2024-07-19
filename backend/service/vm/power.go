package vm

import (
	"NanoKVM-Server/backend/protocol"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
	"time"
)

type PowerReq struct {
	Type   string `validate:"required"`  // restart:重启键 power-short：短按开机键 power-long：长按开机键
	Second uint   `validate:"omitempty"` // power 按下时间（单位：秒）
}

func Power(c *gin.Context) {
	var req PowerReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	var device string
	if req.Type == "power-short" || req.Type == "power-long" {
		device = GPIO_PWR
	} else if req.Type == "restart" {
		device = GPIO_RST
	} else {
		rsp.ErrRsp(c, -2, "invalid power event")
		return
	}

	var duration time.Duration
	if req.Second > 0 {
		duration = time.Duration(req.Second) * time.Second
	} else if req.Type == "power-long" {
		duration = 5 * time.Second
	} else {
		duration = 800 * time.Millisecond
	}

	if err := writeGpio(device, duration); err != nil {
		rsp.ErrRsp(c, -3, "operation failed")
		return
	}

	log.Debugf("power %s success", req.Type)
	rsp.OkRsp(c)
}

func writeGpio(device string, duration time.Duration) error {
	if err := os.WriteFile(device, []byte("1"), 0666); err != nil {
		log.Errorf("write gpio %s failed: %s", device, err)
		return err
	}

	time.Sleep(duration)

	if err := os.WriteFile(device, []byte("0"), 0666); err != nil {
		log.Errorf("write gpio %s failed: %s", device, err)
		return err
	}

	return nil
}
