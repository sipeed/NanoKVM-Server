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
	button := 0x00
	if event[0] == MouseDown {
		if event[1] == MouseLeft {
			button = 0x01
		} else if event[1] == MouseRight {
			button = 0x12
		}
	}

	data := []byte{byte(button), 0x00, 0x00, 0x00}

	hidg1, err := os.OpenFile(Hidg1, os.O_WRONLY, 0666)
	if err != nil {
		return err
	}
	defer hidg1.Close()

	_, err = hidg1.Write(data)
	return err
}

func scroll(event []int) error {
	direction := 0x01
	if event[3] > 0 {
		direction = -0x1
	}

	data := []byte{0x00, 0x00, 0x00, byte(direction)}

	hidg1, err := os.OpenFile(Hidg1, os.O_WRONLY, 0666)
	if err != nil {
		return err
	}
	defer hidg1.Close()

	_, err = hidg1.Write(data)
	return err
}

func move(event []int) error {
	button := 0x00
	if event[1] == MouseLeft {
		button = 0x01
	} else if event[1] == MouseRight {
		button = 0x12
	}

	x := make([]byte, 2)
	y := make([]byte, 2)
	binary.LittleEndian.PutUint16(x, uint16(event[2]))
	binary.LittleEndian.PutUint16(y, uint16(event[3]))

	data := []byte{byte(button), x[0], x[1], y[0], y[1], 0x00}

	hidg2, err := os.OpenFile(Hidg2, os.O_WRONLY, 0666)
	if err != nil {
		return err
	}
	defer hidg2.Close()

	_, err = hidg2.Write(data)
	return err
}
