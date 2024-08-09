package vm

const (
	HW_VERSION_FILE = "/etc/kvm/hw"

	GPIO_PWR     = "/sys/class/gpio/gpio503/value"
	GPIO_PWR_LED = "/sys/class/gpio/gpio504/value"

	GPIO_RST_ALPHA     = "/sys/class/gpio/gpio507/value"
	GPIO_HDD_LED_ALPHA = "/sys/class/gpio/gpio505/value"

	GPIO_RST_BETA = "/sys/class/gpio/gpio505/value"

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
