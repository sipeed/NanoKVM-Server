package vm

import (
	"NanoKVM-Server/backend/protocol"
	"errors"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
)

const (
	VirtualNetwork = "/boot/usb.rndis0"
	VirtualUSB     = "/boot/usb.disk0"
)

type GetVirtualDeviceRsp struct {
	Network bool `json:"network"`
	USB     bool `json:"usb"`
}

type UpdateVirtualDeviceReq struct {
	Device string `validate:"required"`
}

type UpdateVirtualDeviceRsp struct {
	On bool `json:"on"`
}

func GetVirtualDevice(c *gin.Context) {
	var rsp protocol.Response

	network, _ := isDeviceExist(VirtualNetwork)
	usb, _ := isDeviceExist(VirtualUSB)

	rsp.OkRspWithData(c, &GetVirtualDeviceRsp{
		Network: network,
		USB:     usb,
	})
	log.Debugf("get virtual device success")
}

func UpdateVirtualDevice(c *gin.Context) {
	var req UpdateVirtualDeviceReq
	var rsp protocol.Response

	err := protocol.ParseFormRequest(c, &req)
	if err != nil {
		rsp.ErrRsp(c, -1, "invalid argument")
		return
	}

	device := ""

	if req.Device == "network" {
		device = VirtualNetwork
	} else if req.Device == "usb" {
		device = VirtualUSB
	} else {
		rsp.ErrRsp(c, -2, "invalid arguments")
		return
	}

	err = mountVirtualDevice(device)

	if err != nil {
		rsp.ErrRsp(c, -3, "operation failed")
		return
	}

	on, _ := isDeviceExist(device)

	rsp.OkRspWithData(c, &UpdateVirtualDeviceRsp{
		On: on,
	})

	log.Debugf("update virtual device %s success", req.Device)
}

func mountVirtualDevice(device string) error {
	exist, err := isDeviceExist(device)
	if err != nil {
		return err
	}

	if exist {
		return os.Remove(device)
	}

	file, err := os.Create(device)
	defer file.Close()

	return err
}

func isDeviceExist(device string) (bool, error) {
	_, err := os.Stat(device)

	if err == nil {
		return true, nil
	}

	if errors.Is(err, os.ErrNotExist) {
		return false, nil
	}

	log.Errorf("check file %s err: %s", device, err)
	return false, err
}
