package protocol

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	log "github.com/sirupsen/logrus"
	"os"
)

var env = os.Getenv(gin.EnvGinMode)

// ValidateRequest 校验参数
func ValidateRequest(req interface{}) (err error) {
	validate := validator.New()

	if err = validate.Struct(req); err != nil {
		log.Errorf("validate request failed, err: %s", err)
		return
	}

	if env == "" || env == "debug" {
		log.Debugf("request: %+v\n", req)
	}

	return
}

// ParseQueryRequest 解析GET请求
func ParseQueryRequest(c *gin.Context, req interface{}) (err error) {
	if err = c.ShouldBindQuery(req); err != nil {
		log.Errorf("parse request failed, err: %s", err)
		return
	}

	if err = ValidateRequest(req); err != nil {
		return
	}

	return
}

// ParseFormRequest 解析POST请求
func ParseFormRequest(c *gin.Context, req interface{}) (err error) {
	if err = c.ShouldBind(req); err != nil {
		log.Errorf("parse request failed, err: %s", err)
		return
	}

	if err = ValidateRequest(req); err != nil {
		return
	}

	return
}
