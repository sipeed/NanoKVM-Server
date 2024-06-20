package storage

import (
	"NanoKVM-Server/backend/protocol"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const MountDevice = "/sys/kernel/config/usb_gadget/g0/functions/mass_storage.disk0/lun.0/file"

type GetIsoRsp struct {
	Files []string `json:"files"`
}

type MountIsoReq struct {
	File string `json:"file" validate:"omitempty"`
}

type GetMountedIsoRsp struct {
	File string `json:"file"`
}

// GetIso 获取 iso 文件列表
func GetIso(c *gin.Context) {
	var rsp protocol.Response
	var isoFiles []string

	err := filepath.Walk("/data", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && strings.HasSuffix(info.Name(), ".iso") {
			isoFiles = append(isoFiles, path)
		}

		return nil
	})

	if err != nil {
		rsp.ErrRsp(c, -2, "get iso failed")
		return
	}

	rsp.OkRspWithData(c, &GetIsoRsp{
		Files: isoFiles,
	})
	log.Debugf("get iso list success, total %d", len(isoFiles))
}

// MountIso 挂载 iso 文件
func MountIso(c *gin.Context) {
	var req MountIsoReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	mountFile := req.File
	if mountFile == "" {
		mountFile = "/dev/mmcblk0p3"
	}

	// 挂载文件
	if err := os.WriteFile(MountDevice, []byte(mountFile), 0666); err != nil {
		log.Errorf("mount file %s failed: %s", mountFile, err)
		rsp.ErrRsp(c, -2, "mount file failed")
		return
	}

	// 重新拔插 USB
	commands := []string{
		"echo > /sys/kernel/config/usb_gadget/g0/UDC",
		"ls /sys/class/udc/ | cat > /sys/kernel/config/usb_gadget/g0/UDC",
	}

	for _, command := range commands {
		err := runCommand(command)
		if err != nil {
			rsp.ErrRsp(c, -2, "execute command failed")
			return
		}
	}

	rsp.OkRsp(c)
	log.Debugf("mount iso success: %s", req.File)
}

// GetMountedIso 获取已挂载的 iso
func GetMountedIso(c *gin.Context) {
	var rsp protocol.Response

	content, err := os.ReadFile(MountDevice)
	if err != nil {
		rsp.ErrRsp(c, -2, "read failed")
		return
	}

	iso := strings.ReplaceAll(string(content), "\n", "")

	data := &GetMountedIsoRsp{
		File: iso,
	}

	rsp.OkRspWithData(c, data)
}

// 执行 shell 命令
func runCommand(command string) error {
	cmd := exec.Command("sh", "-c", command)
	_, err := cmd.CombinedOutput()
	if err != nil {
		log.Errorf("run command %s failed: %s", command, err)
		return err
	}

	return nil
}
