package firmware

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"io"
	"net/http"
	"os"
	"strings"
)

type GetVersionReq struct {
	Type string `form:"type" validate:"omitempty"`
}

type GetVersionRsp struct {
	Current string `json:"current"`
	Latest  string `json:"latest"`
}

// GetVersion 获取最新版本号
func GetVersion(c *gin.Context) {
	var req GetVersionReq
	var rsp protocol.Response

	if err := protocol.ParseQueryRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid parameters")
		return
	}

	// 获取当前版本号
	currentVersion := "1.0.0"
	content, err := os.ReadFile(VersionFile)
	if err == nil {
		currentVersion = strings.ReplaceAll(string(content), "\n", "")
	}

	if req.Type == "current" {
		rsp.OkRspWithData(c, &GetVersionRsp{
			Current: currentVersion,
		})
		return
	}

	// 获取最新版本号
	resp, err := http.Get(VersionURL)
	if err != nil {
		rsp.ErrRsp(c, -2, "Unable to access sipeed.com. Please check your network.")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		rsp.ErrRsp(c, -3, "get version failed")
		return
	}

	body, err := io.ReadAll(resp.Body)
	latestVersion := strings.Replace(string(body), "\n", "", -1)

	rsp.OkRspWithData(c, &GetVersionRsp{
		Current: currentVersion,
		Latest:  latestVersion,
	})
}

// Update 更新到最新版本
func Update(c *gin.Context) {
	var rsp protocol.Response

	if err := updateFirmware(); err != nil {
		rsp.ErrRsp(c, -1, "update ")
	}

	rsp.OkRsp(c)
	log.Debugf("update firmware success")

	utils.RunCommandBackend("/etc/init.d/S95webkvm restart")
}

func updateFirmware() error {
	_ = utils.RunCommand(fmt.Sprintf("rm -rf %s", Temporary))
	_ = os.MkdirAll(Temporary, 0755)

	if err := downloadLib(); err != nil {
		return err
	}

	if err := downloadFirmware(); err != nil {
		return err
	}

	commands := []string{
		fmt.Sprintf("mv -f %s/%s %s/latest/kvm_system/dl_lib/", Temporary, LibMaixcamName, Temporary), // 移动 libmaixcam 到指定位置
		fmt.Sprintf("rm -rf %s && mv %s %s", Backup, Workspace, Backup),                               // 备份原固件
		fmt.Sprintf("rm -rf %s && mv %s/latest %s", Workspace, Temporary, Workspace),                  // 更新固件
		fmt.Sprintf("chmod -R 755 %s", Workspace),                                                     // 修改文件权限
	}
	for _, command := range commands {
		if err := utils.RunCommand(command); err != nil {
			return err
		}
	}

	return nil
}

func downloadLib() error {
	content, err := os.ReadFile(DeviceKeyFile)
	if err != nil {
		log.Errorf("read devcie key err: %s", err)
		return err
	}
	deviceKey := strings.ReplaceAll(string(content), "\n", "")

	url := fmt.Sprintf("%s?uid=%s", LibMaixcamURL, deviceKey)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Errorf("new request err: %s", err)
		return err
	}
	req.Header.Set("token", "MaixVision2024")

	target := fmt.Sprintf("%s/%s", Temporary, LibMaixcamName)

	return download(req, target)
}

func downloadFirmware() error {
	req, err := http.NewRequest("GET", FirmwareURL, nil)
	if err != nil {
		log.Errorf("new request err: %s", err)
		return err
	}

	zipFile := fmt.Sprintf("%s/latest.zip", Temporary)

	err = download(req, zipFile)
	if err != nil {
		return err
	}

	err = utils.RunCommand(fmt.Sprintf("unzip %s -d %s", zipFile, Temporary))
	if err != nil {
		log.Errorf("run command err: %s", err)
		return err
	}

	return nil
}

func download(req *http.Request, target string) error {
	out, err := os.OpenFile(target, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0755)
	if err != nil {
		log.Errorf("create file %s err: %s", target, err)
		return err
	}
	defer out.Close()

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		log.Errorf("download file err: %s", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.New("request error")
	}

	contentType := resp.Header.Get("Content-Type")
	if contentType != "application/octet-stream" && contentType != "application/zip" {
		return errors.New("download error")
	}

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		log.Errorf("download file to %s err: %s", target, err)
		return err
	}

	return nil
}
