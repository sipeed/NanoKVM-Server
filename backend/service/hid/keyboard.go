package hid

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

	Write(Hidg0, data)
}
