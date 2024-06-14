package vm

import (
	"NanoKVM-Server/backend/protocol"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
	"time"
)

type PowerReq struct {
	Type string `validate:"required"` // on / off / restart
}

func Power(c *gin.Context) {
	var req PowerReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	device := ""
	if req.Type == "on" || req.Type == "off" {
		device = GPIO_PWR
	} else if req.Type == "restart" {
		device = GPIO_RST
	} else {
		rsp.ErrRsp(c, -2, "invalid power event")
		return
	}

	if err := writeGpio(device); err != nil {
		rsp.ErrRsp(c, -3, "operation failed")
		return
	}

	log.Debugf("power %s success", req.Type)
	rsp.OkRsp(c)
}

func writeGpio(device string) error {
	gpio, err := os.OpenFile(device, os.O_WRONLY, 0666)
	defer gpio.Close()

	if err != nil {
		log.Errorf("open gpio %s failed: %s", device, err)
		return err
	}

	if _, err = gpio.Write([]byte{1}); err != nil {
		log.Errorf("write gpio %s failed: %s", device, err)
		return err
	}

	time.Sleep(800 * time.Millisecond)

	if _, err = gpio.Write([]byte{0}); err != nil {
		log.Errorf("write gpio %s failed: %s", device, err)
		return err
	}

	return nil
}
