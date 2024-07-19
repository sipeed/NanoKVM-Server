package hid

import (
	log "github.com/sirupsen/logrus"
	"os"
)

var (
	Hidg0 *os.File
	Hidg1 *os.File
	Hidg2 *os.File
)

func Open() (err error) {
	Close()

	Hidg0, err = os.OpenFile("/dev/hidg0", os.O_WRONLY, 0666)
	if err != nil {
		log.Errorf("open hidg0 failed: %s", err)
		return
	}
	Hidg1, err = os.OpenFile("/dev/hidg1", os.O_WRONLY, 0666)
	if err != nil {
		log.Errorf("open hidg1 failed: %s", err)
		return
	}
	Hidg2, err = os.OpenFile("/dev/hidg2", os.O_WRONLY, 0666)
	if err != nil {
		log.Errorf("open hidg2 failed: %s", err)
		return
	}

	log.Debugf("hid opened")
	return
}

func Close() {
	if Hidg0 != nil {
		_ = Hidg0.Close()
	}
	if Hidg1 != nil {
		_ = Hidg1.Close()
	}
	if Hidg2 != nil {
		_ = Hidg2.Close()
	}

	log.Debug("hid closed")
}
