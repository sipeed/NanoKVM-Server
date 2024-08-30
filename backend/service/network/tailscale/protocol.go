package tailscale

type Status struct {
	BackendState string `json:"BackendState"`

	Self struct {
		HostName     string   `json:"HostName"`
		TailscaleIPs []string `json:"TailscaleIPs"`
	} `json:"Self"`

	CurrentTailnet struct {
		Name string `json:"Name"`
	} `json:"CurrentTailnet"`
}

type GetStatusRsp struct {
	Status  string `json:"status"` // notInstall | notLogin | stopped | running
	Name    string `json:"name"`
	IP      string `json:"ip"`
	Account string `json:"account"`
}

type UpdateStatusReq struct {
	Command string // up | down
}

type UpdateStatusRsp struct {
	Status string `json:"status"` // stopped | running
}

type LoginRsp struct {
	Status string `json:"status"`
	Url    string `json:"url"`
}
