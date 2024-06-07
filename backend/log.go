package backend

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"

	"github.com/sirupsen/logrus"
)

type formatter struct{}

// Format 自定义日志输出格式
func (f *formatter) Format(entry *logrus.Entry) ([]byte, error) {
	var (
		text   string
		buffer *bytes.Buffer
	)

	if entry.Buffer != nil {
		buffer = entry.Buffer
	} else {
		buffer = &bytes.Buffer{}
	}

	now := entry.Time.Format("2006-01-02 15:04:05")

	if entry.HasCaller() {
		fileName := filepath.Base(entry.Caller.File)
		text = fmt.Sprintf(
			"[%s] [%s] [%s:%d] %s\n",
			now, entry.Level, fileName, entry.Caller.Line, entry.Message,
		)
	} else {
		text = fmt.Sprintf(
			"[%s] [%s] %s \n",
			now, entry.Level, entry.Message,
		)
	}

	buffer.WriteString(text)
	return buffer.Bytes(), nil
}

// InitLog 初始化日志
func InitLog() {
	// 设置日志级别
	level, err := logrus.ParseLevel("error")
	if err == nil {
		logrus.SetLevel(level)
	} else {
		logrus.SetLevel(logrus.InfoLevel)
		logrus.Info("set logger level failed, use info level")
	}

	logrus.SetOutput(os.Stdout)

	// 设置日志输出格式
	logrus.SetReportCaller(true)
	logrus.SetFormatter(&formatter{})

	logrus.Info("logger set success")
}
