package network

import (
	"NanoKVM-Server/backend/protocol"
	"fmt"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func WakeOnLAN(c *gin.Context) {
	var req WakeOnLANReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	command := fmt.Sprintf("ether-wake %s", req.Mac)
	cmd := exec.Command("sh", "-c", command)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Errorf("wake on lan failed: %s", err)
		rsp.ErrRsp(c, -2, string(output))
		return
	}

	go saveMac(req.Mac)

	rsp.OkRsp(c)
	log.Debugf("wake on lan %s success", req.Mac)
}

func GetMac(c *gin.Context) {
	var rsp protocol.Response

	content, err := os.ReadFile(WolFile)
	if err != nil {
		rsp.ErrRsp(c, -2, "open file error")
		return
	}

	macs := strings.Split(string(content), "\n")
	data := &GetMacRsp{
		Macs: macs,
	}

	rsp.OkRspWithData(c, data)
}

func DeleteMac(c *gin.Context) {
	var req DeleteMacReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	content, err := os.ReadFile(WolFile)
	if err != nil {
		log.Errorf("open %s failed: %s", WolFile, err)
		rsp.ErrRsp(c, -2, "read failed")
		return
	}

	macs := strings.Split(string(content), "\n")
	var newMacs []string

	for _, mac := range macs {
		if req.Mac != mac {
			newMacs = append(newMacs, mac)
		}
	}

	data := strings.Join(newMacs, "\n")
	err = os.WriteFile(WolFile, []byte(data), 0644)
	if err != nil {
		log.Errorf("write %s failed: %s", WolFile, err)
		rsp.ErrRsp(c, -3, "write failed")
		return
	}

	rsp.OkRsp(c)
	log.Debugf("delete mac %s success", req.Mac)
}

func saveMac(mac string) {
	if isMacSaved(mac) {
		return
	}

	err := os.MkdirAll(filepath.Dir(WolFile), 0644)
	if err != nil {
		log.Errorf("create dir failed: %s", err)
		return
	}

	file, err := os.OpenFile(WolFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Errorf("open %s failed: %s", WolFile, err)
		return
	}
	defer file.Close()

	content := fmt.Sprintf("%s\n", mac)
	_, err = file.WriteString(content)
	if err != nil {
		log.Errorf("write %s failed: %s", WolFile, err)
		return
	}
}

func isMacSaved(mac string) bool {
	content, err := os.ReadFile(WolFile)
	if err != nil {
		return false
	}

	macs := strings.Split(string(content), "\n")
	for _, item := range macs {
		if mac == item {
			return true
		}
	}

	return false
}
