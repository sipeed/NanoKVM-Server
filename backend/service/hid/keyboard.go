package hid

import (
	log "github.com/sirupsen/logrus"
	"os"
)

func WriteKeyboard(event []int) {
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

	file, err := os.OpenFile(Hidg0, os.O_WRONLY, 0600)
	if err != nil {
		log.Errorf("open %s failed: %s", Hidg0, err)
		return
	}
	defer file.Close()

	_, err = file.Write(data)
	if err != nil {
		log.Errorf("write to %s failed: %s", Hidg0, err)
		return
	}

	log.Debugf("write to %s: %+v", Hidg0, data)
	return
}
