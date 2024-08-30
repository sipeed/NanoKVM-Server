package tailscale

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"net"
	"net/http"
	"os"
	"os/exec"
)

const (
	TailscalePath  = "/usr/bin/tailscale"
	TailscaledPath = "/usr/sbin/tailscaled"
)

func Install(c *gin.Context) {
	var rsp protocol.Response

	if exist := isTailscaleExist(); exist {
		rsp.OkRsp(c)
		return
	}

	downloadUrl := "http://cdn.sipeed.com/nanokvm/resources/tailscale_riscv64.zip"
	workspace := "/root/.tailscale"

	zipFile := fmt.Sprintf("%s/tailscale_riscv64.zip", workspace)
	tailscale := fmt.Sprintf("%s/tailscale_riscv64/tailscale", workspace)
	tailscaled := fmt.Sprintf("%s/tailscale_riscv64/tailscaled", workspace)

	_ = os.MkdirAll(workspace, 0755)
	defer utils.RunCommand(fmt.Sprintf("rm -rf %s", workspace))

	req, err := http.NewRequest("GET", downloadUrl, nil)
	if err != nil {
		log.Errorf("new request err: %s", err)
		rsp.ErrRsp(c, -1, "request failed")
		return
	}

	err = utils.Download(req, zipFile)
	if err != nil {
		rsp.ErrRsp(c, -2, "download failed")
		return
	}

	err = utils.RunCommand(fmt.Sprintf("unzip %s -d %s", zipFile, workspace))
	if err != nil {
		log.Errorf("unzip failed: %s", err)
		rsp.ErrRsp(c, -3, "unzip failed")
		return
	}

	err = os.Rename(tailscale, TailscalePath)
	if err != nil {
		log.Debugf("rename %s failed: %s", tailscale, err)
	}
	err = os.Rename(tailscaled, TailscaledPath)
	if err != nil {
		log.Debugf("rename %s failed: %s", tailscaled, err)
	}

	_ = startService()

	rsp.OkRsp(c)
	log.Debugf("install tailscaled success")
}

func GetStatus(c *gin.Context) {
	var rsp protocol.Response
	var data GetStatusRsp

	if exist := isTailscaleExist(); !exist {
		data.Status = "notInstall"
		rsp.OkRspWithData(c, data)
		return
	}

	status, err := getStatus()
	if err != nil {
		data.Status = "notLogin"
		rsp.OkRspWithData(c, data)
		return
	}

	switch status.BackendState {
	case "NeedsLogin":
		data.Status = "notLogin"
	case "Running":
		data.Status = "running"
	case "Stopped":
		data.Status = "stopped"
	default:
		rsp.ErrRsp(c, -1, "unknown state")
		return
	}

	for _, tailscaleIp := range status.Self.TailscaleIPs {
		ip := net.ParseIP(tailscaleIp)
		if ip != nil && ip.To4() != nil {
			data.IP = ip.String()
		}
	}

	data.Name = status.Self.HostName
	data.Account = status.CurrentTailnet.Name

	rsp.OkRspWithData(c, data)
	log.Debugf("tailscale status: %s", data.Status)
}

func UpdateStatus(c *gin.Context) {
	var (
		req UpdateStatusReq
		rsp protocol.Response
	)

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	cmd := exec.Command("tailscale", req.Command)
	err := cmd.Run()
	if err != nil {
		msg := fmt.Sprintf("tailscale %s failed", req.Command)
		rsp.ErrRsp(c, -2, msg)
		return
	}

	status, err := getStatus()
	if err != nil {
		rsp.ErrRsp(c, -3, "get tailscale status failed")
		return
	}

	data := &UpdateStatusRsp{}
	if status.BackendState == "Running" {
		data.Status = "running"
	} else if status.BackendState == "Stopped" {
		data.Status = "stopped"
	} else {
		rsp.ErrRsp(c, -4, "unknown tailscale status")
		return
	}

	rsp.OkRspWithData(c, data)
	log.Debugf("tailscale %s success", req.Command)
}

func Login(c *gin.Context) {
	var rsp protocol.Response

	status, err := getStatus()
	if err != nil {
		_ = startService()
		status, err = getStatus()
	}

	if err != nil {
		rsp.ErrRsp(c, -1, "tailscale unknown status")
		return
	}

	if status.BackendState == "Running" {
		rsp.OkRspWithData(c, &LoginRsp{Status: "running"})
		return
	}

	cmd := exec.Command("tailscale", "login", "--timeout=10m")
	stderr, err := cmd.StderrPipe()
	if err != nil {
		rsp.ErrRsp(c, -2, "tailscale login failed")
		return
	}

	defer stderr.Close()

	go cmd.Run()

	url := parseLoginUrl(stderr)
	rsp.OkRspWithData(c, &LoginRsp{
		Status: "notLogin",
		Url:    url,
	})
	log.Debugf("tailscale login url: %s", url)
}

func Logout(c *gin.Context) {
	var rsp protocol.Response

	cmd := exec.Command("tailscale", "logout")
	err := cmd.Run()
	if err != nil {
		rsp.ErrRsp(c, -2, "tailscale logout failed")
		return
	}

	rsp.OkRsp(c)
	log.Debugf("tailscale logout success")
}
