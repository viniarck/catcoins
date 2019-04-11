import "phaser";
import { GameScene } from "./scene";

const width = 1000;
const height = 800;

const config: GameConfig = {
  type: Phaser.AUTO,
  title: "Pacman",
  width: width,
  height: height,
  parent: "game",
  backgroundColor: "#d3d3d3",
  input: { keyboard: true },
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
};

// TODO highscores with mongodb
export class CatcoinsGame extends Phaser.Game {
  player: Phaser.Physics.Arcade.Sprite
  score = 0;
  level = 1;
  difficultyFactor: 1;
  coinValue = this.level;

  // speed values
  playerSpeed = 100;
  ghostSpeed = 40;

  // ghost mistake prob
  ghostMistakeProb = 0.20;

  /** Set the game level. */
  setLevel(level: number) {
    if (level === 1) {
      this.score = 0;
    }
    this.level = level;
    this.coinValue = this.level;
    this.setGhostSpeed(level);
    this.decreaseGhostMistakeProb();
  }

  /** Decrease the likely head by 0.03 in terms of ghosts mistakes. */
  decreaseGhostMistakeProb() {
    let prob = this.ghostMistakeProb - 0.03;
    if (prob >= 0) {
      this.ghostMistakeProb = prob;
    }
  }

  /** Set the ghost speed based on a level. */
  setGhostSpeed(level: number) {
    this.ghostSpeed = this.level * 4 + 40;
    if (this.ghostSpeed > this.playerSpeed) {
      this.ghostSpeed = this.playerSpeed;
    }
  }

  constructor(config: GameConfig) {
    super(config);
  }
}

let game: Phaser.Game = undefined;

window.onload = () => {
  game = new CatcoinsGame(config);
};
