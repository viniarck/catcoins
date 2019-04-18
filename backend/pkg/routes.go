package pkg

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
)

type ScoreStr struct {
	Name  string `bson:name json:name binding:"required"`
	Value string `bson:value json:value binding:"required"`
}

type Routes struct {
	d *Driver
}

// Start serving the routes.
func (rt Routes) Serve() {
	r := gin.Default()
	r.Use(cors.Default())
	rt.d = NewDriver()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	r.GET("/scores", func(c *gin.Context) {
		scores, err := rt.d.GetTopRecords(5)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		}
		c.JSON(http.StatusOK, gin.H{"result": scores})
	})
	r.POST("/scores", func(c *gin.Context) {
		score := &ScoreStr{}
		err := c.BindJSON(score)
		val, _ := strconv.Atoi(score.Value)
		if err == nil {
			sc := Score{Name: score.Name, Value: val}
			rt.d.CreateOrUpdateScore(sc)
		}
	})
	r.Run(":8088")
}
