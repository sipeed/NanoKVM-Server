package vm

const (
	GPIO_PWR     = "/sys/class/gpio/gpio503/value"
	GPIO_RST     = "/sys/class/gpio/gpio507/value"
	GPIO_LED_PWR = "/sys/class/gpio/gpio504/value"
	GPIO_LED_HDD = "/sys/class/gpio/gpio505/value"

	KVM_FPS        = "/kvmapp/kvm/fps"
	KVM_QUALITY    = "/kvmapp/kvm/qlty"
	KVM_RESOLUTION = "/kvmapp/kvm/res"
)

var kvmMap = map[string]string{
	"fps":        KVM_FPS,
	"quality":    KVM_QUALITY,
	"resolution": KVM_RESOLUTION,
}

var imageVersionMap = map[string]string{
	"2024-06-23-20-59-2d2bfb.img": "v1.0.0",
	"2024-07-23-20-18-587710.img": "v1.1.0",
}
