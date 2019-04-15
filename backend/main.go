package main

import (
	"catcoins/pkg"
)

func main() {
	d := pkg.NewDriver()
	d.Connect()
	d.CreateOrUpdateScore(pkg.Score{Name: "arch", Value: 1002})

	r := pkg.Routes{}
	r.Serve()
}
