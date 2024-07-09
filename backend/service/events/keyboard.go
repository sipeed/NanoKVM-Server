package events

import (
	log "github.com/sirupsen/logrus"
	"os"
)

func WriteKeyboard(event []int) {
	var data []byte

	if event[0] > 0 {
		var modifier uint16 = 0x00
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

		data = []byte{byte(modifier), 0x00, byte(event[0]), 0x00, 0x00, 0x00, 0x00, 0x00}
	} else {
		data = []byte{0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
	}

	hidg0, err := os.OpenFile(Hidg0, os.O_WRONLY, 0666)
	if err != nil {
		return
	}
	defer hidg0.Close()

	_, err = hidg0.Write(data)
	if err != nil {
		log.Errorf("write to hidg0 failed: %s", err)
		return
	}

	log.Debugf("write to hidg0: %+v", data)
	return
}
