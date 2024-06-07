package backend

import (
	"NanoKVM-Server/backend/auth"
	"NanoKVM-Server/backend/events"
	"NanoKVM-Server/backend/vm"
	"fmt"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"os"
	"path/filepath"
)

func InitRouter(r *gin.Engine) {
	// 前端
	initFrontend(r)

	// 后端
	api := r.Group("/api")

	api.POST("/auth/login", auth.Login)             // 登录
	api.POST("/auth/password", auth.ChangePassword) // 修改密码

	api.POST("/vm/power", vm.Power)   // 虚拟机开机/关机/重启
	api.GET("/vm/led", vm.Led)        // 获取虚拟机 led 灯状态
	api.POST("/vm/screen", vm.Screen) // 更新虚拟机屏幕设置
	api.GET("/vm/ws-ssh", vm.WsSsh)   // 通过 websocket 转发 ssh 数据

	api.POST("/events/mouse", events.Mouse)       // 鼠标事件
	api.POST("/events/keyboard", events.Keyboard) // 键盘事件
}

func initFrontend(r *gin.Engine) {
	execPath, err := os.Executable()
	if err != nil {
		panic("invalid executable path")
	}

	execDir := filepath.Dir(execPath)
	webPath := fmt.Sprintf("%s/web", execDir)

	r.Use(static.Serve("/", static.LocalFile(webPath, true)))
}
