package firmware

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
)

type GetLibRsp struct {
	Exist bool `json:"exist"`
}

// GetLib 检查 lib 是否存在
func GetLib(c *gin.Context) {
	var rsp protocol.Response

	exist, err := isLibExist()
	if err != nil {
		rsp.ErrRsp(c, -1, "check lib error")
		return
	}

	data := &GetLibRsp{
		Exist: exist,
	}

	rsp.OkRspWithData(c, data)
	log.Debugf("get lib success, exist: %t", exist)
}

// UpdateLib 更新 lib
func UpdateLib(c *gin.Context) {
	var rsp protocol.Response

	exist, _ := isLibExist()
	if exist {
		rsp.OkRsp(c)
		return
	}

	_ = utils.RunCommand(fmt.Sprintf("rm -rf %s", Temporary))
	_ = os.MkdirAll(Temporary, 0755)

	if err := downloadLib(); err != nil {
		rsp.ErrRsp(c, -1, "download lib failed")
		return
	}

	commands := []string{
		fmt.Sprintf("mv -f %s/%s %s/", Temporary, LibMaixcamName, LibMaixcamDir), // 更新 libmaixcam
		fmt.Sprintf("rm -rf %s", Temporary),                                      // 删除临时文件
	}

	for _, command := range commands {
		err := utils.RunCommand(command)
		if err != nil {
			rsp.ErrRsp(c, -2, "update lib failed")
			return
		}
	}

	rsp.OkRsp(c)
	log.Debugf("update lib success")

	utils.RunCommandBackend("/etc/init.d/S95webkvm restart")
}

func isLibExist() (bool, error) {
	libPath := fmt.Sprintf("%s/%s", LibMaixcamDir, LibMaixcamName)
	_, err := os.Stat(libPath)

	if err == nil {
		return true, nil
	}

	if errors.Is(err, os.ErrNotExist) {
		return false, nil
	}

	return false, err
}
