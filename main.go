package main

import (
	"NanoKVM-Server/backend"
	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
)

func main() {
	backend.InitLog()

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(cors.AllowAll())
	backend.InitRouter(r)

	if err := r.Run("0.0.0.0:80"); err != nil {
		panic("start server failed")
	}
}
