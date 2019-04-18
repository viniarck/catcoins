package main

import (
	"catcoins/pkg"
	"fmt"
)

func main() {
	d := pkg.NewDriver()
	d.Connect()
	d.CreateOrUpdateScore(pkg.Score{Name: "arch", Value: 1002})
	d.CreateOrUpdateScore(pkg.Score{Name: "vinie", Value: 10})
	fmt.Println(d.GetTopRecords(5))

	r := pkg.Routes{}
	r.Serve()
}
