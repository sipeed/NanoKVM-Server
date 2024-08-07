package utils

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/spf13/viper"
	"os"
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
	SecretKey string
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

	viper.Set("SecretKey", generateRandomString())

	if err := viper.Unmarshal(&config); err != nil {
		panic(fmt.Sprintf("Can't read configuration file /etc/kvm/nanokvm.yaml.\n%s", err))
	}

	fmt.Printf("load config success\n")
}

func generateRandomString() string {
	b := make([]byte, 64)
	if _, err := rand.Read(b); err != nil {
		return "cH7xB0zO4rR0fK1gI1fD0qF6vH5yD6mU5uF9hK7lF4wR6kP5rU7lM0rH7dL4vC1g"
	}
	return base64.URLEncoding.EncodeToString(b)
}
