package network

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils"
	"bufio"
	"fmt"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"io"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strings"
)

func GetTailscale(c *gin.Context) {
	var rsp protocol.Response

	exist := isTailscaleExist()

	rsp.OkRspWithData(c, &GetTailscaleRsp{
		Exist: exist,
	})
	log.Debugf("get tailscale success. exist: %t", exist)
}

func InstallTailscale(c *gin.Context) {
	var rsp protocol.Response

	exist := isTailscaleExist()
	if exist {
		rsp.OkRsp(c)
		return
	}

	const (
		url       = "http://cdn.sipeed.com/nanokvm/resources/tailscale_riscv64.zip"
		workspace = "/root/.tailscale"
	)

	zipFile := fmt.Sprintf("%s/tailscale_riscv64.zip", workspace)
	tailscale := fmt.Sprintf("%s/tailscale_riscv64/tailscale", workspace)
	tailscaled := fmt.Sprintf("%s/tailscale_riscv64/tailscaled", workspace)

	_ = os.MkdirAll(workspace, 0755)
	defer utils.RunCommand(fmt.Sprintf("rm -rf %s", workspace))

	req, err := http.NewRequest("GET", url, nil)
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

	_ = utils.RunCommand(fmt.Sprintf("chmod -R 755 %s", workspace))

	err = os.Rename(tailscale, Tailscale)
	if err != nil {
		log.Debugf("rename %s failed: %s", tailscale, err)
	}
	err = os.Rename(tailscaled, Tailscaled)
	if err != nil {
		log.Debugf("rename %s failed: %s", tailscaled, err)
	}

	rsp.OkRsp(c)
	log.Debugf("install tailscaled success")
}

func RunTailscale(c *gin.Context) {
	var rsp protocol.Response

	command := "/etc/init.d/S98tailscaled restart"
	err := utils.RunCommand(command)
	if err != nil {
		rsp.ErrRsp(c, -1, "start tailsacle failed")
		return
	}

	cmd := exec.Command("sh", "-c", "tailscale login --timeout=10m")
	stderr, err := cmd.StderrPipe()
	defer stderr.Close()

	go cmd.Run()

	url := getLoginUrl(stderr)
	rsp.OkRspWithData(c, &RunTailscaleRsp{
		Url: url,
	})
	log.Debugf("tailscale login url: %s", url)
}

func getLoginUrl(r io.Reader) string {
	reader := bufio.NewReader(r)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			log.Errorf("reading line failed: %s", err)
			return ""
		}

		if strings.Contains(line, "https") {
			reg := regexp.MustCompile("\\s+")
			return reg.ReplaceAllString(line, "")
		}
	}
}

func isTailscaleExist() bool {
	_, err1 := os.Stat(Tailscale)
	_, err2 := os.Stat(Tailscaled)

	return err1 == nil && err2 == nil
}
