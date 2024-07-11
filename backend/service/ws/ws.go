package ws

import (
	"NanoKVM-Server/backend/service/events"
	"encoding/json"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

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
	defer ws.Close()

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

		if event[0] == 1 && len(event) == 6 {
			events.WriteKeyboard(event[1:])
		} else if event[0] == 2 && len(event) == 5 {
			events.WriteMouse(event[1:])
		}
	}
}
