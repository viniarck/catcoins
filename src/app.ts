import "phaser";
import { GameScene } from "./scene";

const width = 1000;
const height = 800;

const config: GameConfig = {
  backgroundColor: "#d3d3d3",
  input: { keyboard: true },
  height: height,
  parent: "game",
  physics: {
    arcade: {
      debug: false
    },
    default: "arcade"
  },
  scene: [GameScene],
  title: "Catcoins",
  type: Phaser.AUTO,
  width: width
};

// TODO highscores with mongodb
export class CatcoinsGame extends Phaser.Game {
  public player: Phaser.Physics.Arcade.Sprite;
  public score = 0;
  public level = 1;
  public coinValue = this.level;
  // speed values
  public playerSpeed = 100;
  public ghostSpeed = 40;
  public ghostOldVelX = 0;
  public ghostOldVelY = 0;
  // ghost mistake prob
  public ghostMistakeProb = 0.20;

  constructor(config: GameConfig) {
    super(config);
  }

  /** Set the game level. */
  public setLevel(level: number) {
    if (level === 1) {
      this.score = 0;
    }
    this.level = level;
    this.coinValue = this.level;
    this.setGhostSpeed(level);
    this.decreaseGhostMistakeProb();
  }

  /** Decrease the likely head by 0.03 in terms of ghosts mistakes. */
  private decreaseGhostMistakeProb() {
    const prob = this.ghostMistakeProb - 0.03;
    if (prob >= 0) {
      this.ghostMistakeProb = prob;
    }
  }

  /** Set the ghost speed based on a level. */
  private setGhostSpeed(level: number) {
    this.ghostSpeed = level * 4 + 40;
    if (this.ghostSpeed > this.playerSpeed) {
      this.ghostSpeed = this.playerSpeed;
    }
  }
}

// bootstrap on window load
window.onload = () => {
  new CatcoinsGame(config);
};
