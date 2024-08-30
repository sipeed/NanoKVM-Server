package network

const (
	WolHistory = "/etc/kvm/cache/wol"
)

type GetMacRsp struct {
	Macs []string `json:"macs"`
}

type DeleteMacReq struct {
	Mac string `form:"mac" validate:"required"`
}

type WakeOnLANReq struct {
	Mac string `form:"mac" validate:"required"`
}
