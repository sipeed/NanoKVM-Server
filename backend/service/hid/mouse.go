package hid

import (
	"encoding/binary"
	log "github.com/sirupsen/logrus"
)

func Mouse(queue <-chan []int) {
	for event := range queue {
		switch event[0] {
		case MouseDown:
			mousedown(event)
		case MouseUp:
			mouseup()
		case MouseMoveAbsolute:
			mousemoveAbsolute(event)
		case MouseMoveRelative:
			mousemoveRelative(event)
		case MouseScroll:
			scroll(event)
		default:
			log.Debugf("invalid mouse event: %+v", event)
		}
	}
}

func mousedown(event []int) {
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
	Write(Hidg1, data)
}

func mouseup() {
	data := []byte{0, 0, 0, 0}
	Write(Hidg1, data)
}

func scroll(event []int) {
	direction := 0x01
	if event[3] > 0 {
		direction = -0x1
	}

	data := []byte{0, 0, 0, byte(direction)}
	Write(Hidg1, data)
}

func mousemoveAbsolute(event []int) {
	x := make([]byte, 2)
	y := make([]byte, 2)
	binary.LittleEndian.PutUint16(x, uint16(event[2]))
	binary.LittleEndian.PutUint16(y, uint16(event[3]))

	data := []byte{0, x[0], x[1], y[0], y[1], 0}
	Write(Hidg2, data)

}

func mousemoveRelative(event []int) {
	data := []byte{byte(event[1]), byte(event[2]), byte(event[3]), 0}
	Write(Hidg1, data)
}
