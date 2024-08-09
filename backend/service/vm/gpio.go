package vm

import (
	"NanoKVM-Server/backend/protocol"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
	"strconv"
	"strings"
	"time"
)

type SetGpioReq struct {
	Type     string `validate:"required"`  // reset:重启键 power 电源键
	Duration uint   `validate:"omitempty"` // 按键按下时间（单位：毫秒）
}

type GetLedGpioRsp struct {
	PWR bool `json:"pwr"` // 电源灯
	HDD bool `json:"hdd"` // 硬盘灯
}

func SetGpio(c *gin.Context) {
	var req SetGpioReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	version := getHwVersion()
	device := ""

	if req.Type == "power" {
		device = GPIO_PWR
	} else if req.Type == "reset" {
		if version == "alpha" {
			device = GPIO_RST_ALPHA
		} else {
			device = GPIO_RST_BETA
		}
	} else {
		rsp.ErrRsp(c, -2, "invalid power event")
		return
	}

	var duration time.Duration
	if req.Duration > 0 {
		duration = time.Duration(req.Duration) * time.Millisecond
	} else {
		duration = 800 * time.Millisecond
	}

	if err := writeGpio(device, duration); err != nil {
		rsp.ErrRsp(c, -3, "operation failed")
		return
	}

	log.Debugf("set gpio %s success", device)
	rsp.OkRsp(c)
}

func GetLedGpio(c *gin.Context) {
	var rsp protocol.Response

	pwr, err := readGpio(GPIO_PWR_LED)
	if err != nil {
		rsp.ErrRsp(c, -2, "read led failed")
		return
	}

	hdd := false
	version := getHwVersion()
	if version == "alpha" {
		hdd, err = readGpio(GPIO_HDD_LED_ALPHA)
	}

	data := &GetLedGpioRsp{
		PWR: pwr,
		HDD: hdd,
	}
	rsp.OkRspWithData(c, data)
}

func getHwVersion() string {
	content, err := os.ReadFile(HW_VERSION_FILE)
	if err == nil {
		version := strings.ReplaceAll(string(content), "\n", "")
		if version == "beta" {
			return "beta"
		}
	}

	return "alpha"
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

func readGpio(device string) (bool, error) {
	content, err := os.ReadFile(device)
	if err != nil {
		log.Errorf("read gpio %s failed: %s", device, err)
		return false, err
	}

	contentStr := string(content)
	if len(contentStr) > 1 {
		contentStr = contentStr[:len(contentStr)-1]
	}

	value, err := strconv.Atoi(contentStr)
	if err != nil {
		log.Errorf("invalid gpio content: %s", content)
		return false, nil
	}

	return value == 0, nil
}
