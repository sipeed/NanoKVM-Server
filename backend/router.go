package backend

import (
	"NanoKVM-Server/backend/middleware"
	"NanoKVM-Server/backend/service/auth"
	"NanoKVM-Server/backend/service/firmware"
	"NanoKVM-Server/backend/service/mjpeg"
	"NanoKVM-Server/backend/service/network"
	"NanoKVM-Server/backend/service/storage"
	"NanoKVM-Server/backend/service/vm"
	"NanoKVM-Server/backend/service/ws"
	"fmt"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"os"
	"path/filepath"
)

func InitRouter(r *gin.Engine) {
	initFrontend(r)
	initBackend(r)
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

func initBackend(r *gin.Engine) {
	api := r.Group("/api")
	apiAuth := r.Group("/api").Use(middleware.CheckToken())

	apiAuth.GET("/ws", ws.HandleWebSocket)

	api.POST("/auth/login", auth.Login)                 // 登录
	apiAuth.POST("/auth/password", auth.ChangePassword) // 修改密码

	api.GET("/vm/led", vm.Led) // 获取虚拟机 led 灯状态

	apiAuth.POST("/vm/power", vm.Power)                        // 虚拟机开机/关机/重启
	apiAuth.POST("/vm/screen", vm.Screen)                      // 更新虚拟机屏幕设置
	apiAuth.GET("/vm/terminal", vm.Terminal)                   // 连接虚拟机终端
	apiAuth.POST("/vm/script/upload", vm.UploadScript)         //上传脚本
	apiAuth.POST("/vm/script/run", vm.RunScript)               // 运行脚本
	apiAuth.GET("/vm/script", vm.GetScripts)                   // 获取脚本
	apiAuth.DELETE("/vm/script", vm.DeleteScript)              // 删除脚本
	apiAuth.GET("/vm/device/virtual", vm.GetVirtualDevice)     // 获取虚拟设备
	apiAuth.POST("/vm/device/virtual", vm.UpdateVirtualDevice) // 更新虚拟设备
	apiAuth.GET("/vm/info", vm.GetInfo)                        // 获取设备信息

	apiAuth.GET("/storage/images", storage.GetImages)               // 获取镜像列表
	apiAuth.GET("/storage/images/mounted", storage.GetMountedImage) // 获取已挂载的镜像
	apiAuth.POST("/storage/image/mount", storage.MountImage)        // 挂载镜像
	apiAuth.POST("/storage/hid/reset", storage.ResetHid)            // 重置 hid

	apiAuth.GET("/mjpeg", mjpeg.Proxy) // mjpeg 代理

	apiAuth.GET("/firmware/version", firmware.GetVersion)    // 获取当前固件版本
	apiAuth.POST("/firmware/update", firmware.Update)        // 更新固件
	apiAuth.GET("/firmware/lib", firmware.GetLib)            // 检查 lib 是否存在
	apiAuth.POST("/firmware/lib/update", firmware.UpdateLib) // 更新 lib 文件

	apiAuth.POST("/network/wol", network.WakeOnLAN)                      // 远程唤醒
	apiAuth.GET("/network/wol/mac", network.GetMac)                      // 获取保存的mac地址
	apiAuth.DELETE("/network/wol/mac", network.DeleteMac)                // 删除保存的mac地址
	apiAuth.GET("/network/tailscale", network.GetTailscale)              // 获取 tailscale 状态
	apiAuth.POST("/network/tailscale/install", network.InstallTailscale) // 安装 tailscale
	apiAuth.POST("/network/tailscale/run", network.RunTailscale)         // 运行 tailscale
}
