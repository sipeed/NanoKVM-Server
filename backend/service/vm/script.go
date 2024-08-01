package vm

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const ScriptDirectory = "/etc/kvm/scripts"

type UploadScriptRsp struct {
	File string `json:"file"`
}

type GetScriptsRsp struct {
	Files []string `json:"files"`
}

type RunScriptReq struct {
	Name string `validate:"required"`
	Type string `validate:"required"` // foreground | background
}

type RunScriptRsp struct {
	Log string `json:"log"`
}

type DeleteScriptReq struct {
	Name string `validate:"required"`
}

func UploadScript(c *gin.Context) {
	var rsp protocol.Response

	_, header, err := c.Request.FormFile("file")
	if err != nil {
		rsp.ErrRsp(c, -1, "bad request")
		return
	}

	if !isScript(header.Filename) {
		rsp.ErrRsp(c, -2, "invalid arguments")
		return
	}

	if _, err = os.Stat(ScriptDirectory); err != nil {
		_ = os.MkdirAll(ScriptDirectory, 0755)
	}

	target := fmt.Sprintf("%s/%s", ScriptDirectory, header.Filename)
	err = c.SaveUploadedFile(header, target)
	if err != nil {
		rsp.ErrRsp(c, -2, "save failed")
		return
	}

	_ = utils.RunCommand(fmt.Sprintf("chmod +x %s", target))

	data := &UploadScriptRsp{
		File: header.Filename,
	}
	rsp.OkRspWithData(c, data)

	log.Debugf("upload script %s success", header.Filename)
}

func GetScripts(c *gin.Context) {
	var rsp protocol.Response

	var files []string
	err := filepath.Walk(ScriptDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && isScript(info.Name()) {
			files = append(files, info.Name())
		}

		return nil
	})

	if err != nil {
		log.Errorf("get scripts failed: %s", err)
		rsp.ErrRsp(c, -1, "get scripts failed")
		return
	}

	rsp.OkRspWithData(c, &GetScriptsRsp{
		Files: files,
	})

	log.Debugf("get scripts success")
}

func RunScript(c *gin.Context) {
	var req RunScriptReq
	var rsp protocol.Response

	err := protocol.ParseFormRequest(c, &req)
	if err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	command := fmt.Sprintf("%s/%s", ScriptDirectory, req.Name)

	name := strings.ToLower(req.Name)
	if strings.HasSuffix(name, ".py") {
		command = fmt.Sprintf("python %s", command)
	}

	cmd := exec.Command("sh", "-c", command)
	var output []byte

	if req.Type == "foreground" {
		output, err = cmd.CombinedOutput()
	} else {
		cmd.Stdout = nil
		cmd.Stderr = nil
		go cmd.Run()
	}

	if err != nil {
		log.Errorf("run script %s faile: %s", req.Name, err)
		rsp.ErrRsp(c, -2, "run script failed")
		return
	}

	rsp.OkRspWithData(c, &RunScriptRsp{
		Log: string(output),
	})

	log.Debugf("run script %s success", req.Name)
}

func DeleteScript(c *gin.Context) {
	var req DeleteScriptReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	file := fmt.Sprintf("%s/%s", ScriptDirectory, req.Name)

	if err := os.Remove(file); err != nil {
		log.Errorf("delete script %s failed: %s", file, err)
		rsp.ErrRsp(c, -3, "delete failed")
		return
	}

	rsp.OkRsp(c)
	log.Debugf("delete script %s success", file)
}

func isScript(name string) bool {
	nameLower := strings.ToLower(name)
	if strings.HasSuffix(nameLower, ".sh") || strings.HasSuffix(nameLower, ".py") {
		return true
	}

	return false
}
