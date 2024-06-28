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
	MouseLeft = iota
	MouseWheel
	MouseRight
)

// 键盘事件由按键和五个数字组成：
// 五位数字：0-keydown/keyup, 1-ctrl, 2-shift, 3-alt, 4-meta
