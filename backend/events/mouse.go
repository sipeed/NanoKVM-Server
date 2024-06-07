package events

import (
	"NanoKVM-Server/backend/protocol"
	"encoding/binary"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

type MouseReq struct {
	Type   string `validate:"required"`  // 事件类型：mousemove，mousedown，mouseup, scroll
	Button string `validate:"omitempty"` // 鼠标按键：left，right，wheel
	X      int    `validate:"omitempty"` // 鼠标x坐标
	Y      int    `validate:"omitempty"` // 鼠标y坐标
}

func Mouse(c *gin.Context) {
	var req MouseReq
	var rsp protocol.Response

	err := protocol.ParseFormRequest(c, &req)
	if err != nil {
		rsp.ErrRsp(c, -1, "invalid arguments")
		return
	}

	if req.Type == "mousemove" {
		err = move(&req)
	} else if req.Type == "scroll" {
		err = scroll(&req)
	} else {
		err = click(&req)
	}

	if err != nil {
		log.Errorf("write to hid failed: %s", err)
		rsp.ErrRsp(c, -2, "operation failed")
		return
	}

	rsp.OkRsp(c)
}

func click(req *MouseReq) (err error) {
	button := 0x00
	if req.Type == "mousedown" {
		if req.Button == "left" {
			button = 0x01
		} else if req.Button == "right" {
			button = 0x12
		}
	}

	data := []byte{byte(button), 0x00, 0x00, 0x00}

	_, err = hidg1.Write(data)
	return
}

func scroll(req *MouseReq) (err error) {
	direction := 0x01
	if req.Y > 0 {
		direction = -0x1
	}

	data := []byte{0x00, 0x00, 0x00, byte(direction)}

	_, err = hidg1.Write(data)
	return
}

func move(req *MouseReq) (err error) {
	button := 0x00
	if req.Button == "left" {
		button = 0x01
	} else if req.Button == "right" {
		button = 0x12
	}

	x := make([]byte, 2)
	y := make([]byte, 2)
	binary.LittleEndian.PutUint16(x, uint16(req.X))
	binary.LittleEndian.PutUint16(y, uint16(req.Y))

	data := []byte{byte(button), x[0], x[1], y[0], y[1], 0x00}

	_, err = hidg2.Write(data)
	return
}
