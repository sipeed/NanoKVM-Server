package storage

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
	"path/filepath"
	"strings"
)

const MountDevice = "/sys/kernel/config/usb_gadget/g0/functions/mass_storage.disk0/lun.0/file"

type GetImagesRsp struct {
	Files []string `json:"files"`
}

type MountImageReq struct {
	File string `json:"file" validate:"omitempty"`
}

type GetMountedImageRsp struct {
	File string `json:"file"`
}

// GetImages 获取镜像列表
func GetImages(c *gin.Context) {
	var rsp protocol.Response
	var images []string

	err := filepath.Walk(ImageDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			name := strings.ToLower(info.Name())
			if strings.HasSuffix(name, ".iso") || strings.HasSuffix(name, ".img") {
				images = append(images, path)
			}
		}

		return nil
	})

	if err != nil {
		rsp.ErrRsp(c, -2, "get images failed")
		return
	}

	rsp.OkRspWithData(c, &GetImagesRsp{
		Files: images,
	})
	log.Debugf("get images success, total %d", len(images))
}

// MountImage 挂载镜像文件
func MountImage(c *gin.Context) {
	var req MountImageReq
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
		err := utils.RunCommand(command)
		if err != nil {
			rsp.ErrRsp(c, -2, "execute command failed")
			return
		}
	}

	rsp.OkRsp(c)
	log.Debugf("mount image %s success", req.File)
}

// GetMountedImage 获取已挂载的镜像
func GetMountedImage(c *gin.Context) {
	var rsp protocol.Response

	content, err := os.ReadFile(MountDevice)
	if err != nil {
		rsp.ErrRsp(c, -2, "read failed")
		return
	}

	image := strings.ReplaceAll(string(content), "\n", "")

	data := &GetMountedImageRsp{
		File: image,
	}

	rsp.OkRspWithData(c, data)
}
