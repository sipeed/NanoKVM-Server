package hid

const (
	Hidg0 = "/dev/hidg0"
	Hidg1 = "/dev/hidg1"
	Hidg2 = "/dev/hidg2"
)

const (
	MouseUp = iota
	MouseDown
	MouseMoveAbsolute
	MouseMoveRelative
	MouseScroll
)

const (
	MouseLeft  = 1
	MouseRight = 2
	MouseWheel = 3
)

const (
	HidMouseLeft  byte = 0x01
	HidMouseRight byte = 0x02
	HidMouseWheel byte = 0x04
)

const (
	ModifierLCtrl  byte = 0x01
	ModifierLShift byte = 0x02
	ModifierLAlt   byte = 0x04
	ModifierLGUI   byte = 0x08
)
