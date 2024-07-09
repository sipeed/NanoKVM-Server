package events

const (
	Hidg0 = "/dev/hidg0"
	Hidg1 = "/dev/hidg1"
	Hidg2 = "/dev/hidg2"
)

// 鼠标事件为四个数字组成：
// 第一个数字-事件类型：0-鼠标抬起，1-鼠标按下，2-鼠标移动，3-滚轮滚动
// 第二个数字-鼠标按键：0-左键，1-中键，2-右键
// 第三个数字-x坐标
// 第四个数字-y坐标
const (
	MouseUp = iota
	MouseDown
	MouseMove
	MouseScroll
)

const (
	MouseLeft  = 1
	MouseRight = 2
)

const (
	HidMouseNone  = 0x00
	HidMouseLeft  = 0x01
	HidMouseRight = 0x02
)

const (
	ModifierLCtrl  uint16 = 0x01
	ModifierLShift uint16 = 0x02
	ModifierLAlt   uint16 = 0x04
	ModifierLGUI   uint16 = 0x08
	//ModifierLWIN          = ModifierLGUI
)
