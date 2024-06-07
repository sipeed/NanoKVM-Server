package main

import (
	"NanoKVM-Server/backend"
	"NanoKVM-Server/backend/events"
	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
)

func main() {
	backend.InitLog()

	if err := events.OpenHid(); err != nil {
		panic("open hid failed")
	}
	defer events.CloseHid()

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(cors.AllowAll())
	backend.InitRouter(r)

	if err := r.Run("0.0.0.0:80"); err != nil {
		panic("start server failed")
	}
}
