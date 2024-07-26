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
		r.Use(middleware.Tls())

		httpAddress := fmt.Sprintf(":%d", conf.Port.Http)
		httpsAddress := fmt.Sprintf(":%d", conf.Port.Https)
		log.Debugf("server started at %d, %d", conf.Port.Http, conf.Port.Https)

		go func() {
			if err := r.Run(httpAddress); err != nil {
				log.Errorf("%s", err)
			}
		}()

		if err := r.RunTLS(httpsAddress, conf.Cert.Crt, conf.Cert.Key); err != nil {
			panic("start server failed")
		}
	} else {
		address := fmt.Sprintf(":%d", conf.Port.Http)
		log.Debugf("server started at %d", conf.Port.Http)

		if err := r.Run(address); err != nil {
			panic("start server failed")
		}
	}
}
