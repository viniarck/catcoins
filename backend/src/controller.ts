import * as mongoose from 'mongoose';
import { ScoreSchema } from './models';
import { Request, Response } from 'express';

const Score = mongoose.model('Score', ScoreSchema);
export class Controller {

  public addScore(req: Request, res: Response) {
    let newScore = new Score(req.body);

    newScore.save((err, Score) => {
      if (err) {
        res.send(err);
      }
      res.json(newScore);
    });
  }

  public getScores(req: Request, res: Response) {
    Score.find({}, (err, score) => {
      if (err) {
        res.send(err);
      }
      res.json(score);
    });
  }
}
