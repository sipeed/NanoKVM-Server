package main

import (
	"NanoKVM-Server/backend"
	"NanoKVM-Server/backend/middleware"
	"NanoKVM-Server/backend/utils"
	"fmt"

	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
	log "github.com/sirupsen/logrus"
)

func main() {
	gin.SetMode(gin.ReleaseMode)

	conf := utils.GetConfig()
	utils.InitLog()

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(cors.AllowAll())
	backend.InitRouter(r)

	if conf.Protocol == "https" {
		runTls(r)
	} else {
		run(r)
	}
}

func run(r *gin.Engine) {
	conf := utils.GetConfig()

	address := fmt.Sprintf(":%d", conf.Port.Http)
	log.Debugf("server started at %s", address)

	err := r.Run(address)
	if err != nil {
		panic("start server failed")
	}
}

func runTls(r *gin.Engine) {
	conf := utils.GetConfig()

	httpAddr := fmt.Sprintf(":%d", conf.Port.Http)
	httpsAddr := fmt.Sprintf(":%d", conf.Port.Https)
	log.Debugf("server started at %s, %s", httpsAddr, httpAddr)

	r.Use(middleware.Tls())

	go run(r)

	err := r.RunTLS(httpsAddr, conf.Cert.Crt, conf.Cert.Key)
	if err != nil {
		panic("start server failed")
	}
}
