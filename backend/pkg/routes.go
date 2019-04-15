package pkg

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

type ScoreStr struct {
	Name  string `bson:name json:name binding:"required"`
	Value string `bson:value json:value binding:"required"`
}

type Routes struct {
}

func (rt Routes) Serve() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.POST("/scores", func(c *gin.Context) {
		score := &ScoreStr{}
		err := c.BindJSON(score)
		if err != nil {
			fmt.Printf("Err: %v", err)
		}
	})
	r.Run(":8088")
}
