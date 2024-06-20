package backend

import (
	"NanoKVM-Server/backend/middleware"
	"NanoKVM-Server/backend/service/auth"
	"NanoKVM-Server/backend/service/events"
	"NanoKVM-Server/backend/service/extensions"
	"NanoKVM-Server/backend/service/mjpeg"
	"NanoKVM-Server/backend/service/storage"
	"NanoKVM-Server/backend/service/vm"
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
	apiAuth := r.Group("/api").Use(middleware.CheckToken())

	api.POST("/auth/login", auth.Login)                 // 登录
	apiAuth.POST("/auth/password", auth.ChangePassword) // 修改密码

	api.GET("/vm/led", vm.Led)            // 获取虚拟机 led 灯状态
	apiAuth.POST("/vm/power", vm.Power)   // 虚拟机开机/关机/重启
	apiAuth.POST("/vm/screen", vm.Screen) // 更新虚拟机屏幕设置
	apiAuth.GET("/vm/ws-ssh", vm.WsSsh)   // 通过 websocket 转发 ssh 数据

	api.POST("/events/mouse", events.Mouse)       // 鼠标事件
	api.POST("/events/keyboard", events.Keyboard) // 键盘事件

	api.GET("/storage/iso", storage.GetIso)                // 获取 iso 文件列表
	api.GET("/storage/iso/mounted", storage.GetMountedIso) // 获取已挂载的 iso
	apiAuth.POST("/storage/iso", storage.MountIso)         // 挂载 iso 镜像

	api.GET("extensions/service", extensions.GetService) // 获取用户的扩展服务

	apiAuth.GET("/mjpeg", mjpeg.Proxy) // mjpeg 代理
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
