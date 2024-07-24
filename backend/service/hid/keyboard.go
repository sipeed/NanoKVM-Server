package hid

import (
	"errors"
	log "github.com/sirupsen/logrus"
	"os"
	"time"
)

func Keyboard(queue <-chan []int) {
	for event := range queue {
		writeKeyboard(event)
	}
}

func writeKeyboard(event []int) {
	var data []byte

	if event[0] > 0 {
		var modifier byte = 0x00
		if event[1] == 1 {
			modifier = modifier | ModifierLCtrl
		}
		if event[2] == 1 {
			modifier = modifier | ModifierLShift
		}
		if event[3] == 1 {
			modifier = modifier | ModifierLAlt
		}
		if event[4] == 1 {
			modifier = modifier | ModifierLGUI
		}

		data = []byte{modifier, 0x00, byte(event[0]), 0x00, 0x00, 0x00, 0x00, 0x00}
	} else {
		data = []byte{0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
	}

	_ = Hidg0.SetDeadline(time.Now().Add(200 * time.Millisecond))

	_, err := Hidg0.Write(data)
	if err != nil {
		if errors.Is(err, os.ErrDeadlineExceeded) {
			log.Debugf("write keyboard data timeout")
		} else {
			log.Errorf("write keyboard data failed: %s", err)
		}
		return
	}

	log.Debugf("write keyboard data: %+v", data)
	return
}
