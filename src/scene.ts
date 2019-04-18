import "phaser";
import axios from "axios";
import { CatcoinsGame } from "./app";
import { Maze, MazeCell } from "./maze";
import { genRand, pointDistance } from "./utils";
export class GameScene extends Phaser.Scene {
  public game: CatcoinsGame;
  private coinsInfo: Phaser.GameObjects.Text;
  private scoreInfo: Phaser.GameObjects.Text;
  private levelInfo: Phaser.GameObjects.Text;
  private keysInfo: Phaser.GameObjects.Text;
  private msgInfo: Phaser.GameObjects.Text;
  private maze: Maze;
  private brickSize = 40;
  private gameFont = "20px Arial Bold";
  private gameFontBig = "40px Arial Bold";
  private ghost: Phaser.Physics.Arcade.Sprite;
  private walls: Phaser.Physics.Arcade.StaticGroup;
  private coins: Phaser.Physics.Arcade.StaticGroup;
  private cursors: Phaser.Input.Keyboard.CursorKeys;
  private player: Phaser.Physics.Arcade.Sprite;
  private rKey: Phaser.Input.Keyboard.Key;
  private pKey: Phaser.Input.Keyboard.Key;
  private sKey: Phaser.Input.Keyboard.Key;
  private paused = false;
  private gameOver = false;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  /** base game method init. */
  public init(): void {
    this.add.rectangle(0, this.game.scale.height, this.game.scale.width * 2, 100, 0x0);
    this.coinsInfo = this.add.text(10, 765, "Coins left",
      { font: this.gameFont, fill: "#ffffff" });
    this.levelInfo = this.add.text(140, 765, "Level",
      { font: this.gameFont, fill: "#ffffff" });
    this.scoreInfo = this.add.text(240, 765, "Score",
      { font: this.gameFont, fill: "#ffffff" });
    this.keysInfo = this.add.text(500, 765, " Commands: <P> pause, <R> restart, <S> show high scores",
      { font: this.gameFont, fill: "#ffffff" });
    this.loadAttrs();
  }

  /** base game method preload. */
  public preload(): void {
    this.load.image("brick", "assets/brick4040.png");
    this.load.image("player", "assets/cat4040.png");
    this.load.image("ghost1", "assets/ghost4040_1.png");
    for (let i = 1; i < 7; i++) {
      const image = `assets/coin/coin4040_0${i}.png`;
      this.load.image(`coin${i}`, image);
    }
  }

  /** base game method create. */
  public create(): void {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.registerKeys();
    this.anims.create({
      key: "coin",
      frames: [
        { key: "coin1", frame: null },
        { key: "coin2", frame: null },
        { key: "coin3", frame: null },
        { key: "coin4", frame: null },
        { key: "coin5", frame: null },
        { key: "coin6", frame: null },
      ],
      frameRate: 10,
      repeat: -1
    });

    // static groups
    this.walls = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.maze = new Maze(this.game.scale.width, this.game.scale.height);

    const array = this.maze.generate();
    for (let i = 0; i < this.maze.rows; i++) {
      let coinGen = false;
      for (let j = 0; j < this.maze.columns; j++) {
        if (i === 0) {
          this.walls.create(i * this.brickSize + this.brickSize / 2, j * this.brickSize - this.brickSize / 2, "brick");
          continue;
        } else if (i === this.maze.rows - 1) {
          this.walls.create(i * this.brickSize + this.brickSize / 2, j * this.brickSize - this.brickSize / 2, "brick");
          continue;
        } else if (j === 0) {
          this.walls.create(i * this.brickSize + this.brickSize / 2, j * this.brickSize + this.brickSize / 2, "brick");
          continue;
        } else if (j === this.maze.columns - 1) {
          this.walls.create(i * this.brickSize + this.brickSize / 2, j * this.brickSize - this.brickSize / 2, "brick");
          continue;
        }

        if (array[i][j] === MazeCell.Wall) {
          this.walls.create(i * this.brickSize + this.brickSize / 2, j * this.brickSize - this.brickSize / 2, "brick");
        } else {
          if (i % 2 === 0 && !coinGen) {
            while (!coinGen) {
              const column = genRand(1, this.maze.columns);
              if (array[i][column] === MazeCell.Ground) {
                this.coins.create(i * this.brickSize + this.brickSize / 2, column * this.brickSize - this.brickSize / 2, "coin1").play("coin");
                coinGen = true;
              }
            }
          }
        }
      }
    }

    // assumes any position at first
    this.player = this.physics.add.sprite(80, 80, "player").setOrigin(0);
    this.setPlayerPos();
    this.player.setBounce(0.0);
    this.player.setCollideWorldBounds(true);
    // assumes any position at first
    this.ghost = this.physics.add.sprite(280, 280, "ghost1");
    this.ghost.setBounce(0.0);
    this.ghost.setCollideWorldBounds(true);
    this.setGhostPos(this.game.level);
    // collision setup and callbacks
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.ghost, this.walls);
    this.physics.add.collider(this.ghost, this.player, this.ghostCollision, null, this);
    this.physics.add.collider(this.player, this.coins, this.coinCollision, null, this);
    this.msgInfo = this.add.text(this.game.scale.height / 2, this.game.scale.width / 2 - 150, "", { font: this.gameFontBig, fill: "#000000" });
    this.updateLabels();
  }

  /** base game method update. */
  public update(): void {
    this.updateLabels();

    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.updateLabels();
      this.game.setLevel(1);
      this.scene.start("GameScene");
      this.gameOver = false;
      this.paused = false;
    } else if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
      const getAsync = async () => {
        const res = await axios.get("http://localhost:8088/scores");
        const values = res.data.result;
        if (values !== null) {
          let names = "";
          console.log("values", values);
          for (const i in values) {
            names += `${values[i].Name}, ${values[i].Value}\n`;
          }
          alert(`Top 5 scores: \n\n${names}`);
        }
      };
      getAsync();
    }

    if (this.gameOver) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
      this.togglePause();
    }

    if (this.paused) {
      return;
    }

    this.chase();
    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      this.player.setVelocityX(-this.game.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      this.player.setVelocityX(this.game.playerSpeed);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.game.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.game.playerSpeed);
    } else {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
    }
  }

  private promptName(): string {
    const name = prompt("Congratulations!\nYou made to the top 5 scores.\nEnter your name:");
    if (name !== null) {
      return name.substr(0, 40);
    }
    return null;
  }

  private async tryToPostHighScore(score: number) {
    const name = this.promptName();
    if (name !== null) {
      await axios.post("http://localhost:8088/scores", { "name": name, "value": score.toString() });
    }
  }

  private tryToSetHighScore() {
    let getUsers = async () => {
      const res = await axios.get("http://localhost:8088/scores");
      const values = res.data.result;
      const score = this.game.score;
      if (values === null) {
        this.tryToPostHighScore(score);
        return;
      }
      const lowestScore = values[values.length - 1];
      if (values.length < 5 && score > 0) {
        this.tryToPostHighScore(score);
        return;
      }
      if (lowestScore.hasOwnProperty("Value")) {
        if (score > 0 && score > lowestScore.Value) {
          this.tryToPostHighScore(score);
          return;
        }
      }
    };
    getUsers();
  }

  private togglePause() {

    const vec = this.ghost.body.velocity;
    console.log(vec);

    if (!this.paused) {
      this.game.ghostOldVelX = vec.x;
      this.game.ghostOldVelY = vec.y;
      this.ghost.setVelocityY(0);
      this.ghost.setVelocityX(0);
      this.paused = true;
      this.msgInfo.setText("Game Paused");
    } else {
      this.ghost.setVelocityX(this.game.ghostOldVelX);
      this.ghost.setVelocityY(this.game.ghostOldVelY);
      this.paused = false;
      this.msgInfo.setText("");
    }
  }

  /** Register custom key events. */
  private registerKeys() {
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  }

  /** Load game attributes and assign local vars to shorten variable names. */
  private loadAttrs() {
    this.player = this.game.player;
  }

  /** Set the player position in the second row. */
  private setPlayerPos() {
    for (let j = 0; j < this.maze.columns; j++) {
      if (this.maze.maze[1][j] === MazeCell.Ground) {
        this.player.setPosition(40, j * 40);
        return;
      }
    }
  }

  /** Set the ghost position as close as possible depending on the level difficulty. */
  private setGhostPos(level: number) {
    let i = Math.max(this.maze.rows - 1 - level, 3);
    for (let j = 0; j < this.maze.columns && i > 3; j++) {
      if (this.maze.maze[i][j] === MazeCell.Ground) {
        this.ghost.setPosition(i * 40, j * 40);
        return;
      }
      i -= 1;
    }
  }

  /** Update the coins text label. */
  private updateCoinsInfo() {
    const nCoins = this.coins.children.getArray().length;
    this.coinsInfo.setText(`Coins left: ${nCoins}`);
  }

  /** Update the score text label. */
  private updateScoreInfo() {
    this.scoreInfo.setText(`Score: ${this.game.score}`);
  }

  /** Update the level text label. */
  private updateLevelInfo() {
    this.levelInfo.setText(`Level: ${this.game.level}`);
  }

  /** Update all labels. */
  private updateLabels() {
    this.updateScoreInfo();
    this.updateCoinsInfo();
    this.updateLevelInfo();
  }

  /** Verify whether the user has won the level. */
  private hasWon(): boolean {
    if (this.coins.children.getArray().length === 0) {
      return true;
    }
    return false;
  }

  /** Compute coin collions with the player. */
  private coinCollision(): void {
    const x = Math.floor(this.player.x);
    const y = Math.floor(this.player.y);
    const coins = this.coins.children.getArray();
    coins.forEach((coin) => {
      if (pointDistance(coin.x, x, coin.y, y) <= this.brickSize + 20) {
        this.game.score += this.game.coinValue;
        coin.destroy();
      }
    })
    if (this.hasWon()) {
      this.updateLabels();
      this.game.setLevel(this.game.level + 1);
      this.scene.start("GameScene");
    }
  }

  /** Compute ghost collisions with the player. */
  private ghostCollision(): void {
    this.gameOver = true;
    this.ghost.setVelocityY(0);
    this.ghost.setVelocityX(0);
    this.player.setVelocityY(0);
    this.player.setVelocityX(0);
    this.msgInfo.setText("Game Over!");
    this.tryToSetHighScore();
  }

  /** Make the ghost chase the player by computing the vector distance. The higher the level number, the higher the ghost speeds and also the less likely ghosts will make mistakes in the following the right direction. */
  private chase() {
    const factor = 5;
    const x = Math.floor(this.player.x);
    const y = Math.floor(this.player.y);
    const xDiff = Math.abs(x - this.ghost.x);
    const yDiff = Math.abs(y - this.ghost.y);

    const rightMoveProb = Math.random();
    if (yDiff > xDiff) {
      if (rightMoveProb < this.game.ghostMistakeProb) {
        if (this.ghost.y + factor > y) {
          this.ghost.setVelocityY(this.game.ghostSpeed);
        } else if (this.ghost.y + factor < y) {
          this.ghost.setVelocityY(-this.game.ghostSpeed);
        }
      } else {
        if (this.ghost.y + factor > y) {
          this.ghost.setVelocityY(-this.game.ghostSpeed);
        } else if (this.ghost.y + factor < y) {
          this.ghost.setVelocityY(this.game.ghostSpeed);
        }
      }
    } else {
      if (rightMoveProb < this.game.ghostMistakeProb) {
        if (this.ghost.x + factor < x) {
          this.ghost.setVelocityX(-this.game.ghostSpeed);
          this.ghost.flipX = true;
        } else if (this.ghost.x + factor > x) {
          this.ghost.setVelocityX(this.game.ghostSpeed);
          this.ghost.flipX = false;
        }
      } else {
        if (this.ghost.x + factor < x) {
          this.ghost.setVelocityX(this.game.ghostSpeed);
          this.ghost.flipX = true;
        } else if (this.ghost.x + factor > x) {
          this.ghost.setVelocityX(-this.game.ghostSpeed);
          this.ghost.flipX = false;
        }
      }
    }
  }
}
