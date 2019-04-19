import axios from "axios";
import "phaser";
import { CatcoinsGame } from "./app";


export class ScoreScene extends Phaser.Scene {

  public game: CatcoinsGame;
  private gameFont = "20px Arial Bold";
  private sKey: Phaser.Input.Keyboard.Key;
  private highScoresInfo: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "ScoreScene"
    });
  }

  public init(): void {
    this.add.rectangle(0, this.game.scale.height, this.game.scale.width * 2, 80, 0x0);
    this.add.text(670, 765, " Commands: <S> Go back to the game",
      { font: this.gameFont, fill: "#ffffff" });

    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.highScoresInfo = this.add.text(this.game.scale.width / 2 - 70, this.game.scale.height / 2 - 200, "", { front: this.gameFont, fill: "#000000" });
    this.requestScores();
  }

  public update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
      this.game.scene.switch("ScoreScene", "GameScene");
      this.game.paused = false;
      this.highScoresInfo.setText("");
    }
    if (this.highScoresInfo.text === "") {
      this.requestScores();
    }
  }

  private requestScores(): void {
    const getAsync = async () => {
      const res = await axios.get(`http://${this.game.serverAddr}/scores`);
      const values = res.data.result;
      if (values !== null) {
        let names = "";
        console.log("values", values);
        for (const i in values) {
          names += `${values[i].Name}, ${values[i].Value}\n`;
        }
        this.highScoresInfo.setText(`Top 5 high scores: \n\n${names}`);
      } else {
        this.highScoresInfo.setText("High scores unavailable");
      }
    };
    getAsync();
  }
}
