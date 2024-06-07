package protocol

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Response struct {
	Code int         `json:"code"` // 状态码。0成功，其他失败
	Msg  string      `json:"msg"`  // 状态详情
	Data interface{} `json:"data"` // 返回的数据
}

// Ok 请求成功，没有返回数据
func (r *Response) Ok() {
	r.Code = 0
	r.Msg = "success"
}

// OkWithData 请求成功，有返回数据
func (r *Response) OkWithData(data interface{}) {
	r.Ok()
	r.Data = data
}

// OkRsp 请求成功，没有返回数据，直接返回响应
func (r *Response) OkRsp(c *gin.Context) {
	r.Ok()

	c.JSON(http.StatusOK, r)
}

// OkRspWithData 请求成功，有返回数据，直接返回响应
func (r *Response) OkRspWithData(c *gin.Context, data interface{}) {
	r.Ok()
	r.Data = data

	c.JSON(http.StatusOK, r)
}

// Err 请求失败，没有返回数据
func (r *Response) Err(code int, msg string) {
	r.Code = code
	r.Msg = msg
}

// ErrRsp 请求失败，没有返回数据，直接返回响应
func (r *Response) ErrRsp(c *gin.Context, code int, msg string) {
	r.Err(code, msg)

	c.JSON(http.StatusOK, r)
}
