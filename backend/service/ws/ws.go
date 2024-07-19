package ws

import (
	"NanoKVM-Server/backend/service/hid"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"
)

const (
	KeyboardEvent int = 1
	MouseEvent    int = 2
)

type WsClient struct {
	conn *websocket.Conn
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleWebSocket(c *gin.Context) {
	ws, er := upgrader.Upgrade(c.Writer, c.Request, nil)
	if er != nil {
		log.Errorf("create websocket failed: %s", er)
		return
	}

	if err := hid.Open(); err != nil {
		return
	}

	log.Debugf("websocket connected")
	defer func() {
		_ = ws.Close()
		//hid.Close()
		log.Debugf("websocket closed")
	}()

	var zeroTime time.Time
	_ = ws.SetReadDeadline(zeroTime)

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			break
		}

		var event []int
		err = json.Unmarshal(message, &event)
		if err != nil {
			log.Debugf("receive invalid message: %s", message)
			continue
		}

		log.Debugf("receive message: %s", message)

		if event[0] == KeyboardEvent {
			hid.WriteKeyboard(event[1:])
		} else if event[0] == MouseEvent {
			hid.WriteMouse(event[1:])
		}
	}
}
