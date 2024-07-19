package hid

import (
	log "github.com/sirupsen/logrus"
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

	if Hidg0 == nil {
		log.Errorf("write to hidg0 failed: not opened")
		return
	}

	_, err := Hidg0.Write(data)
	if err != nil {
		log.Errorf("write to hidg0 failed: %s", err)
		return
	}

	log.Debugf("write to hidg0: %+v", data)
	return
}
