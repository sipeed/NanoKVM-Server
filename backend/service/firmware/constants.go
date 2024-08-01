package firmware

const (
	DeviceKeyFile = "/device_key"

	VersionURL    = "https://cdn.sipeed.com/nanokvm/latest"
	FirmwareURL   = "https://cdn.sipeed.com/nanokvm/latest.zip"
	LibMaixcamURL = "https://maixvision.sipeed.com/api/v1/nanokvm/encryption"

	Temporary      = "/tmp/firmware"
	Workspace      = "/kvmapp"
	Backup         = "/root/old"
	LibMaixcamDir  = "/kvmapp/kvm_system/dl_lib"
	LibMaixcamName = "libmaixcam_lib.so"
	VersionFile    = "/kvmapp/version"
)
