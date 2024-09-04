package hid

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

func Reset(c *gin.Context) {
	var rsp protocol.Response

	// 重新拔插 USB
	commands := []string{
		"echo > /sys/kernel/config/usb_gadget/g0/UDC",
		"ls /sys/class/udc/ | cat > /sys/kernel/config/usb_gadget/g0/UDC",
	}

	for _, command := range commands {
		err := utils.RunCommand(command)
		if err != nil {
			rsp.ErrRsp(c, -2, "execute command failed")
			return
		}
	}

	rsp.OkRsp(c)
	log.Debugf("reset hid success")
}
