package hid

import (
	"encoding/binary"
	log "github.com/sirupsen/logrus"
)

func WriteMouse(event []int) {
	switch event[0] {
	case MouseDown:
		down(event)
	case MouseUp:
		up()
	case MouseMove:
		move(event)
	case MouseScroll:
		scroll(event)
	default:
		log.Debugf("invalid mouse event: %+v", event)
	}
}

func down(event []int) {
	var button byte

	switch event[1] {
	case MouseLeft:
		button = HidMouseLeft
	case MouseRight:
		button = HidMouseRight
	case MouseWheel:
		button = HidMouseWheel
	default:
		log.Debugf("invalid mouse button: %+v", event)
		return
	}

	data := []byte{button, 0, 0, 0}

	_, err := Hidg1.Write(data)
	if err != nil {
		log.Errorf("write to hidg1 failed: %s", err)
	}
}

func up() {
	data := []byte{0, 0, 0, 0}

	_, err := Hidg1.Write(data)
	if err != nil {
		log.Errorf("write to hidg1 failed: %s", err)
	}
}

func scroll(event []int) {
	direction := 0x01
	if event[3] > 0 {
		direction = -0x1
	}

	data := []byte{0, 0, 0, byte(direction)}

	_, err := Hidg1.Write(data)
	if err != nil {
		log.Errorf("write to hidg2 failed: %s", err)
	}
}

func move(event []int) {
	x := make([]byte, 2)
	y := make([]byte, 2)
	binary.LittleEndian.PutUint16(x, uint16(event[2]))
	binary.LittleEndian.PutUint16(y, uint16(event[3]))

	data := []byte{0, x[0], x[1], y[0], y[1], 0}

	_, err := Hidg2.Write(data)
	if err != nil {
		log.Errorf("write to hidg2 failed: %s", err)
	}
}
