package events

import (
	log "github.com/sirupsen/logrus"
	"os"
)

var (
	hidg0 *os.File // 键盘
	hidg1 *os.File // 鼠标
	hidg2 *os.File // 触控板
)

func OpenHid() (err error) {
	if hidg0 == nil {
		hidg0, err = os.OpenFile("/dev/hidg0", os.O_WRONLY, 0666)
		if err != nil {
			log.Errorf("open hidg0 failed: %s", err)
			return
		}
	}

	if hidg1 == nil {
		hidg1, err = os.OpenFile("/dev/hidg1", os.O_WRONLY, 0666)
		if err != nil {
			log.Errorf("open hidg1 failed: %s", err)
			return
		}
	}

	if hidg2 == nil {
		hidg2, err = os.OpenFile("/dev/hidg2", os.O_WRONLY, 0666)
		if err != nil {
			log.Errorf("open hidg2 failed: %s", err)
			return
		}
	}

	log.Debugf("hid opened")
	return
}

func CloseHid() {
	if hidg0 != nil {
		if err := hidg0.Close(); err != nil {
			log.Errorf("close hidg0 faile: %s", err)
		}
		hidg0 = nil
	}

	if hidg1 != nil {
		if err := hidg1.Close(); err != nil {
			log.Errorf("close hidg1 faile: %s", err)
		}
		hidg1 = nil
	}

	if hidg2 != nil {
		if err := hidg2.Close(); err != nil {
			log.Errorf("close hidg2 faile: %s", err)
		}
		hidg2 = nil
	}

	log.Debugf("hid closed")
	return
}
