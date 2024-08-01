package vm

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/service/hid"
	"NanoKVM-Server/backend/utils"
	"errors"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
)

const (
	VirtualNetwork = "/boot/usb.rndis0"
	VirtualUSB     = "/boot/usb.disk0"
)

var (
	mountNetworkCommands = []string{
		"touch /boot/usb.rndis0",
		"/etc/init.d/S03usbdev start",
		"/etc/init.d/S03usbdev stop",
	}

	unmountNetworkCommands = []string{
		"rm -rf /sys/kernel/config/usb_gadget/g0/configs/c.1/rndis.usb0",
		"rm /boot/usb.rndis0",
		"/etc/init.d/S03usbdev start",
	}

	mountUSBCommands = []string{
		"touch /boot/usb.disk0",
		"/etc/init.d/S03usbdev stop",
		"/etc/init.d/S03usbdev start",
	}

	unmountUSBCommands = []string{
		"rm -rf /sys/kernel/config/usb_gadget/g0/configs/c.1/mass_storage.disk0",
		"rm /boot/usb.disk0",
		"/etc/init.d/S03usbdev start",
	}
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

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid argument")
		return
	}

	var device string
	var commands []string

	if req.Device == "network" {
		device = VirtualNetwork

		exist, _ := isDeviceExist(device)
		if !exist {
			commands = mountNetworkCommands
		} else {
			commands = unmountNetworkCommands
		}
	} else if req.Device == "usb" {
		device = VirtualUSB

		exist, _ := isDeviceExist(device)
		if !exist {
			commands = mountUSBCommands
		} else {
			commands = unmountUSBCommands
		}
	} else {
		rsp.ErrRsp(c, -2, "invalid arguments")
		return
	}

	hid.Close()
	defer hid.Open()

	for _, command := range commands {
		err := utils.RunCommand(command)
		if err != nil {
			rsp.ErrRsp(c, -3, "operation failed")
			return
		}
	}

	on, _ := isDeviceExist(device)
	rsp.OkRspWithData(c, &UpdateVirtualDeviceRsp{
		On: on,
	})

	log.Debugf("update virtual device %s success", req.Device)
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
