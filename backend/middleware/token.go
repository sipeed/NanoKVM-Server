package middleware

import (
	"NanoKVM-Server/backend/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

// CheckToken 检验 token
func CheckToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("nano-kvm-token")

		if err == nil {
			cookieAccount, err := utils.Cookie2Account(cookie)
			account := utils.GetAccount()

			if err == nil && cookieAccount.Username == account.Username && cookieAccount.Password == account.Password {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusUnauthorized, "unauthorized")
		c.Abort()
		return
	}
}
