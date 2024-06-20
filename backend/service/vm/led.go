package vm

import (
	"NanoKVM-Server/backend/protocol"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
	"strconv"
)

type LedRsp struct {
	PWR bool `json:"pwr"` // 电源灯
	HDD bool `json:"hdd"` // 硬盘灯
}

func Led(c *gin.Context) {
	var rsp protocol.Response

	pwr, err := getState(GPIO_LED_PWR)
	if err != nil {
		rsp.ErrRsp(c, -2, "read led failed")
		return
	}

	hdd, err := getState(GPIO_LED_HDD)
	if err != nil {
		rsp.ErrRsp(c, -3, "read led failed")
		return
	}

	data := &LedRsp{
		PWR: pwr,
		HDD: hdd,
	}
	rsp.OkRspWithData(c, data)
}

func getState(device string) (bool, error) {
	data, err := os.ReadFile(device)
	if err != nil {
		log.Errorf("read gpio %s failed: %s", device, err)
		return false, err
	}

	content := string(data)
	if len(content) > 1 {
		content = content[:len(content)-1]
	}
	value, err := strconv.Atoi(content)
	if err != nil {
		log.Errorf("invalid gpio content: %s", content)
		return false, nil
	}

	return value == 0, nil
}
