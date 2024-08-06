package vm

import (
	"NanoKVM-Server/backend/protocol"
	"fmt"
	"github.com/gin-gonic/gin"
	"net"
	"os"
	"strings"
)

type GetInfoRsp struct {
	Ip       string `json:"ip"`
	Mdns     string `json:"mdns"`
	Image    string `json:"image"`
	Firmware string `json:"firmware"`
}

func GetInfo(c *gin.Context) {
	var rsp protocol.Response

	data := &GetInfoRsp{
		Ip:       getIp(),
		Mdns:     getMdns(),
		Image:    getImageVersion(),
		Firmware: getFirmwareVersion(),
	}

	rsp.OkRspWithData(c, data)
}

func getFirmwareVersion() string {
	content, err := os.ReadFile("/kvmapp/version")
	if err != nil {
		return "1.0.0"
	}

	return strings.ReplaceAll(string(content), "\n", "")
}

func getImageVersion() string {
	content, err := os.ReadFile("/boot/ver")
	if err != nil {
		return ""
	}

	image := strings.ReplaceAll(string(content), "\n", "")

	if version, ok := imageVersionMap[image]; ok {
		return version
	}

	return image
}

func getIp() string {
	addressList, err := net.InterfaceAddrs()
	if err != nil {
		return ""
	}

	for _, address := range addressList {
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() && ipnet.IP.To4() != nil {
			ip := ipnet.IP.String()
			return ip
		}
	}

	return ""
}

func getMdns() string {
	content, err := os.ReadFile("/etc/hostname")
	if err != nil {
		return ""
	}

	mdns := strings.ReplaceAll(string(content), "\n", "")
	return fmt.Sprintf("%s.local", mdns)
}
