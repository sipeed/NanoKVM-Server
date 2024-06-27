package extensions

import (
	"NanoKVM-Server/backend/protocol"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"gopkg.in/yaml.v3"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const ConfigDirectory = "/root/server/extensions"

type Service struct {
	Name    string `yaml:"name"`    // 服务名称
	Port    int    `yaml:"port"`    // 服务端口
	Command string `yaml:"command"` // 服务启动命令
}

type ServiceInfo struct {
	Name string `json:"name"` // 服务名称
	Port int    `json:"port"` // 服务端口
}

type GetServiceRsp struct {
	Services []*ServiceInfo `json:"services"`
}

// StartServices 启动用户的扩展服务
func StartServices() {
	configFiles, err := getConfigFiles()
	if err != nil {
		return
	}
	if len(configFiles) == 0 {
		return
	}

	for _, configFile := range configFiles {
		service, err := readConfigFile(configFile)
		if err == nil {
			cmd := exec.Command(service.Command)
			err = cmd.Start()
			if err != nil {
				log.Errorf("start extension service %s failed: %s", service.Name, err)
			} else {
				log.Debugf("start extension service %s success", service.Name)
			}
		}
	}
}

// GetService 获取用户的扩展服务
func GetService(c *gin.Context) {
	var rsp protocol.Response

	configFiles, err := getConfigFiles()

	if err != nil || len(configFiles) == 0 {
		rsp.OkRsp(c)
		return
	}

	var serviceInfos []*ServiceInfo

	for _, configFile := range configFiles {
		service, err := readConfigFile(configFile)
		if err == nil {
			serviceInfos = append(serviceInfos, &ServiceInfo{
				Name: service.Name,
				Port: service.Port,
			})
		}
	}

	rsp.OkRspWithData(c, &GetServiceRsp{
		Services: serviceInfos,
	})
	log.Debugf("get extension service success, total: %d", len(serviceInfos))
}

// 获取服务配置文件
func getConfigFiles() ([]string, error) {
	var files []string

	err := filepath.Walk(ConfigDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && strings.HasSuffix(info.Name(), ".yaml") {
			files = append(files, path)
		}
		return nil
	})

	return files, err
}

// 读取配置文件
func readConfigFile(configFile string) (Service, error) {
	var service Service

	config, err := os.ReadFile(configFile)
	if err != nil {
		return service, err
	}

	err = yaml.Unmarshal(config, &service)
	if err != nil {
		log.Errorf("unmarshal config %s failed: %s", configFile, err)
		return service, err
	}

	return service, nil
}
