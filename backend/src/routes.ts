import { Request, Response } from "express";
import { Controller } from "./controller";

export class Routes {

  public controller: Controller;
  private apiVer = "/v1";

  constructor() {
    this.controller = new Controller();
  }

  public routes(app): void {
    app.route(`${this.apiVer}`)
    .get((req: Request, res: Response) => {
      res.status(200).send(":)")
    })
    app.route(`${this.apiVer}/scores/`)
      .get(this.controller.getScores)
      .post(this.controller.addScore)
  }
}
