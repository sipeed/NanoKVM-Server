package middleware

import (
	"NanoKVM-Server/backend/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

func CheckToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		conf := utils.GetConfig()

		if conf.Authentication == "disable" {
			c.Next()
			return
		}

		cookie, err := c.Cookie("nano-kvm-token")
		if err == nil {
			_, err = utils.ParseJWT(cookie)
			if err == nil {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusUnauthorized, "unauthorized")
		c.Abort()
		return
	}
}
