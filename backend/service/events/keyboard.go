package events

import (
	"NanoKVM-Server/backend/utils/keyboard"
	log "github.com/sirupsen/logrus"
	"os"
)

func WriteKeyboard(key string, options []int) {
	var data []byte

	if options[0] == 1 {
		var modifier uint16 = 0x00
		if options[1] == 1 {
			modifier = modifier | keyboard.ModifierLCtrl
		}
		if options[2] == 1 {
			modifier = modifier | keyboard.ModifierLShift
		}
		if options[3] == 1 {
			modifier = modifier | keyboard.ModifierLAlt
		}
		if options[4] == 1 {
			modifier = modifier | keyboard.ModifierLGUI
		}

		keyCode, ok := keyboard.CodeMap[key]
		if !ok {
			log.Errorf("invalid key: %s", key)
			return
		}

		data = []byte{byte(modifier), 0x00, byte(keyCode), 0x00, 0x00, 0x00, 0x00, 0x00}
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
