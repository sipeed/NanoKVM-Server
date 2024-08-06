package network

const (
	WolHistory = "/etc/kvm/cache/wol"
	Tailscale  = "/usr/bin/tailscale"
	Tailscaled = "/usr/sbin/tailscaled"
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

type GetTailscaleRsp struct {
	Exist bool `json:"exist"`
}

type RunTailscaleRsp struct {
	Url string `json:"url"`
}
