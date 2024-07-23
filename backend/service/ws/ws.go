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
	log.Debugf("websocket connected")

	hid.Open()
	defer func() {
		_ = ws.Close()
		hid.Close()
		log.Debugf("websocket closed")
	}()

	var zeroTime time.Time
	_ = ws.SetReadDeadline(zeroTime)

	keyboardQueue := make(chan []int, 200)
	mouseQueue := make(chan []int, 300)

	go hid.Keyboard(keyboardQueue)
	go hid.Mouse(mouseQueue)

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
			if len(keyboardQueue) == cap(keyboardQueue) {
				clearQueue(keyboardQueue)
			}

			keyboardQueue <- event[1:]
		} else if event[0] == MouseEvent {
			if len(mouseQueue) == cap(mouseQueue) {
				clearQueue(mouseQueue)
			}

			mouseQueue <- event[1:]
		}
	}
}

func clearQueue(queue chan []int) {
	for len(queue) > 0 {
		<-queue
	}
}
