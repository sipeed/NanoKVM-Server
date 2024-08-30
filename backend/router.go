package backend

import (
	"NanoKVM-Server/backend/middleware"
	"NanoKVM-Server/backend/service/auth"
	"NanoKVM-Server/backend/service/firmware"
	"NanoKVM-Server/backend/service/network"
	"NanoKVM-Server/backend/service/network/tailscale"
	"NanoKVM-Server/backend/service/storage"
	"NanoKVM-Server/backend/service/stream"
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
	r.POST("/api/auth/login", auth.Login) // 登录

	api := r.Group("/api").Use(middleware.CheckToken())

	api.GET("/ws", ws.HandleWebSocket)

	api.POST("/auth/password", auth.ChangePassword) // 修改密码

	api.POST("/vm/gpio", vm.SetGpio)                       // 更新 gpio
	api.GET("/vm/gpio/led", vm.GetLedGpio)                 // 获取 gpio 指示灯状态
	api.POST("/vm/screen", vm.Screen)                      // 更新虚拟机屏幕设置
	api.GET("/vm/terminal", vm.Terminal)                   // 连接虚拟机终端
	api.POST("/vm/script/upload", vm.UploadScript)         //上传脚本
	api.POST("/vm/script/run", vm.RunScript)               // 运行脚本
	api.GET("/vm/script", vm.GetScripts)                   // 获取脚本
	api.DELETE("/vm/script", vm.DeleteScript)              // 删除脚本
	api.GET("/vm/device/virtual", vm.GetVirtualDevice)     // 获取虚拟设备
	api.POST("/vm/device/virtual", vm.UpdateVirtualDevice) // 更新虚拟设备
	api.GET("/vm/info", vm.GetInfo)                        // 获取设备信息

	api.GET("/storage/images", storage.GetImages)               // 获取镜像列表
	api.GET("/storage/images/mounted", storage.GetMountedImage) // 获取已挂载的镜像
	api.POST("/storage/image/mount", storage.MountImage)        // 挂载镜像
	api.POST("/storage/hid/reset", storage.ResetHid)            // 重置 hid

	api.GET("/stream/mjpeg", stream.Mjpeg)                        // mjpeg stream
	api.GET("/stream/mjpeg/detect", stream.GetFrameDetect)        // 获取 frame detect 状态
	api.POST("/stream/mjpeg/detect", stream.UpdateFrameDetect)    // 更新 frame detect 状态
	api.POST("/stream/mjpeg/detect/stop", stream.StopFrameDetect) // 临时停止 frame detect

	api.GET("/firmware/version", firmware.GetVersion)    // 获取当前固件版本
	api.POST("/firmware/update", firmware.Update)        // 更新固件
	api.GET("/firmware/lib", firmware.GetLib)            // 检查 lib 是否存在
	api.POST("/firmware/lib/update", firmware.UpdateLib) // 更新 lib 文件

	api.POST("/network/wol", network.WakeOnLAN)       // 远程唤醒
	api.GET("/network/wol/mac", network.GetMac)       // 获取保存的mac地址
	api.DELETE("/network/wol/mac", network.DeleteMac) // 删除保存的mac地址

	api.POST("/network/tailscale/install", tailscale.Install)     // 安装 tailscale
	api.GET("/network/tailscale/status", tailscale.GetStatus)     // 获取 tailscale 状态
	api.POST("/network/tailscale/status", tailscale.UpdateStatus) // 更新 tailscale 状态
	api.POST("/network/tailscale/login", tailscale.Login)         // 登录 tailscale
	api.POST("/network/tailscale/logout", tailscale.Logout)       // 登出 tailscale
}
