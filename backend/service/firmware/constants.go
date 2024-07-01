package firmware

const (
	Version   = "1.6.0"
	DeviceKey = "/device_key"

	VersionURL    = "https://cdn.sipeed.com/nanokvm/latest"
	FirmwareURL   = "https://cdn.sipeed.com/nanokvm/latest.zip"
	LibMaixcamURL = "https://maixvision.sipeed.com/api/v1/nanokvm/encryption"

	Temporary      = "/tmp/firmware"
	Workspace      = "/kvmapp"
	Backup         = "/root/old"
	LibMaixcamDir  = "/kvmapp/jpg_stream/dl_lib"
	LibMaixcamName = "libmaixcam_lib.so"
)
