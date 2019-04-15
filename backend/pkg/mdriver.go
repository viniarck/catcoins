package pkg

import (
	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

type M map[string]interface{}

type Score struct {
	Name  string `bson:name json:name binding:"required"`
	Value int    `bson:value json:value binding:"required"`
}

type Driver struct {
	Host string
	Db   string
	Coll string
}

func NewDriver() *Driver {
	return &Driver{Host: "localhost:27017", Db: "scoresDb", Coll: "scores"}
}

func (d *Driver) Connect() (*mgo.Collection, error) {
	session, err := mgo.Dial(d.Host)
	if err != nil {
		return nil, err
	}
	c := session.DB(d.Db).C(d.Coll)
	return c, nil
}

func (d *Driver) CreateOrUpdateScore(score Score) error {
	coll, err := d.Connect()
	if err != nil {
		return err
	}

	var res Score
	err = coll.Find(bson.M{"name": score.Name}).One(&res)
	if err != nil {
		coll.Insert(score)
	} else {
		if res.Value < score.Value {
			coll.Update(res, score)
		}
	}
	return nil
}
