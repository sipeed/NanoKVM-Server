package events

import (
	"NanoKVM-Server/backend/protocol"
	"NanoKVM-Server/backend/utils/keyboard"
	"errors"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"os"
)

type KeyboardReq struct {
	Type  string `validate:"required"`  // 键盘事件：keydown，keyup
	Key   string `validate:"required"`  // 键盘按键
	Ctrl  bool   `validate:"omitempty"` // ctrl 键是否按下
	Shift bool   `validate:"omitempty"` // shift 键是否按下
	Alt   bool   `validate:"omitempty"` // alt 键是否按下
	Meta  bool   `validate:"omitempty"` // meta 键是否按下
}

func Keyboard(c *gin.Context) {
	var req KeyboardReq
	var rsp protocol.Response

	if err := protocol.ParseFormRequest(c, &req); err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	if err := writeKeyboard(&req); err != nil {
		rsp.ErrRsp(c, -2, "operation failed")
		return
	}

	rsp.OkRsp(c)
}

func writeKeyboard(req *KeyboardReq) error {
	var data []byte
	if req.Type == "keydown" {
		var modifier uint16 = 0x00
		if req.Ctrl {
			modifier = modifier | keyboard.ModifierLCtrl
		}
		if req.Shift {
			modifier = modifier | keyboard.ModifierLShift
		}
		if req.Alt {
			modifier = modifier | keyboard.ModifierLAlt
		}
		if req.Meta {
			modifier = modifier | keyboard.ModifierLGUI
		}

		key, ok := keyboard.CodeMap[req.Key]
		if !ok {
			log.Errorf("invalid key: %s", req.Key)
			return errors.New("invalid key")
		}

		data = []byte{byte(modifier), 0x00, byte(key), 0x00, 0x00, 0x00, 0x00, 0x00}
	} else {
		data = []byte{0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
	}

	hidg0, err := os.OpenFile(Hidg0, os.O_WRONLY, 0666)
	if err != nil {
		return err
	}
	defer hidg0.Close()

	_, err = hidg0.Write(data)
	if err != nil {
		log.Errorf("write to hidg0 failed: %s", err)
		return err
	}

	log.Debugf("write to hidg0: %+v", data)
	return nil
}
