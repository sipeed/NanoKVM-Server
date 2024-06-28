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

type Event struct {
	Key   string `json:"key"`
	Array []int  `json:"array"`
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
	defer ws.Close()

	var zeroTime time.Time
	_ = ws.SetReadDeadline(zeroTime)

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			break
		}

		var event Event
		err = json.Unmarshal(message, &event)
		if err != nil {
			log.Debugf("receive invalid message: %s", message)
			continue
		}

		if event.Key == "" {
			go events.WriteMouse(event.Array)
		} else {
			go events.WriteKeyboard(event.Key, event.Array)
		}

		log.Debugf("receive event: %+v", event)
	}
}
