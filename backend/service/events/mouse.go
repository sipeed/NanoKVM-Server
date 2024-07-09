package events

import (
	"encoding/binary"
	log "github.com/sirupsen/logrus"
	"os"
)

func WriteMouse(event []int) {
	var err error

	if event[0] == MouseDown || event[0] == MouseUp {
		err = click(event)
	} else if event[0] == MouseMove {
		err = move(event)
	} else if event[0] == MouseScroll {
		err = scroll(event)
	} else {
		log.Debugf("invalid mouse event: %+v", event)
		return
	}

	if err != nil {
		log.Errorf("write to hid failed: %s", err)
	}
}

func click(event []int) error {
	button := HidMouseNone

	if event[0] == MouseDown {
		if event[1] == MouseLeft {
			button = HidMouseLeft
		} else if event[1] == MouseRight {
			button = HidMouseRight
		}
	}

	data := []byte{byte(button), 0, 0, 0}
	return writeHid(Hidg1, data)
}

func scroll(event []int) error {
	direction := 0x01
	if event[3] > 0 {
		direction = -0x1
	}

	data := []byte{0x00, 0x00, 0x00, byte(direction)}
	return writeHid(Hidg1, data)
}

func move(event []int) error {
	button := HidMouseNone

	if event[1] == MouseLeft {
		button = HidMouseLeft
	} else if event[1] == MouseRight {
		button = HidMouseRight
	}

	x := make([]byte, 2)
	y := make([]byte, 2)
	binary.LittleEndian.PutUint16(x, uint16(event[2]))
	binary.LittleEndian.PutUint16(y, uint16(event[3]))

	data := []byte{byte(button), x[0], x[1], y[0], y[1], 0x00}
	return writeHid(Hidg2, data)
}

func writeHid(hid string, data []byte) error {
	file, err := os.OpenFile(hid, os.O_WRONLY, 0600)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	return err
}
