package utils

import (
	"bytes"
	"errors"
	"fmt"
	"github.com/spf13/viper"
	"os"
	"strings"
	"sync"
)

type Port struct {
	Http  int `yaml:"http"`
	Https int `yaml:"https"`
}
type Cert struct {
	Crt string `yaml:"crt"`
	Key string `yaml:"key"`
}

type Config struct {
	Protocol  string `yaml:"protocol"`
	Port      Port   `yaml:"port"`
	Cert      Cert   `yaml:"cert"`
	Log       string `yaml:"log"`
	DeviceKey string
}

var (
	config Config
	once   sync.Once
)

var defaultConfig = []byte(`protocol: http
port:
  http: 80 
  https: 443
cert:
  crt: server.crt
  key: server.key
`)

func GetConfig() *Config {
	once.Do(loadConfig)

	return &config
}

func loadConfig() {
	viper.SetConfigName("server")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("/etc/kvm/")

	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &viper.ConfigFileNotFoundError{}) {
			_ = os.MkdirAll("/etc/kvm", 0644)
			_ = os.WriteFile("/etc/kvm/server.yaml", defaultConfig, 0755)
			fmt.Printf("File /etc/kvm/server.yaml not exists. Use default configuration.\n")
		} else {
			fmt.Printf("Read file /etc/kvm/server.yaml failed. Use default configuration.\n")
		}

		// 使用默认配置
		err = viper.ReadConfig(bytes.NewBuffer(defaultConfig))
		if err != nil {
			panic(fmt.Sprintf("load default config failed.\n%s", err))
		}
	}

	viper.Set("DeviceKey", getDeviceKey())

	if err := viper.Unmarshal(&config); err != nil {
		panic(fmt.Sprintf("Can't read configuration file /etc/kvm/nanokvm.yaml.\n%s", err))
	}

	fmt.Printf("load config success\n")
}

func getDeviceKey() string {
	content, err := os.ReadFile("/device_key")
	if err != nil {
		return ""
	}
	return strings.ReplaceAll(string(content), "\n", "")
}
