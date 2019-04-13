import "phaser";
import { Maze, MazeCell } from "./maze";
import { genRand, pointDistance } from "./utils";
import { CatcoinsGame } from "./app";
export class GameScene extends Phaser.Scene {
  coinsInfo: Phaser.GameObjects.Text;
  scoreInfo: Phaser.GameObjects.Text;
  levelInfo: Phaser.GameObjects.Text;

  maze: Maze;
  brickSize = 40;
  coinScore = 10;
  ghost: Phaser.Physics.Arcade.Sprite;
  walls: Phaser.Physics.Arcade.StaticGroup;
  coins: Phaser.Physics.Arcade.StaticGroup;
  coin: Phaser.Physics.Arcade.Sprite;
  cursors: Phaser.Input.Keyboard.CursorKeys;
  game: CatcoinsGame;
  player: Phaser.Physics.Arcade.Sprite

  constructor() {
    super({
      key: "GameScene"
    });
  }

  /** Load game attributes and assign local vars to shorten variable names. */
  loadAttrs() {
    this.player = this.game.player;
  }

  /** base game method init. */
  init(): void {
    this.add.rectangle(0, this.game.scale.height, this.game.scale.width * 2, 100, 0x0),
    this.coinsInfo = this.add.text(10, 765, 'Coins left',
      { font: '20px Arial Bold', fill: '#ffffff' }),
      this.levelInfo = this.add.text(140, 765, 'Level',
        { font: '20px Arial Bold', fill: '#ffffff' }),
    this.scoreInfo = this.add.text(240, 765, 'Score',
      { font: '20px Arial Bold', fill: '#ffffff' });
    this.loadAttrs();
  }

  /** base game method preload. */
  preload(): void {
    this.load.image('brick', 'assets/brick4040.png');
    this.load.image('player', 'assets/cat4040.png');
    this.load.image('ghost1', 'assets/ghost4040_1.png');
    for (let i = 1; i < 7; i++) {
      let image = `assets/coin/coin4040_0${i}.png`;
      this.load.image(`coin${i}`, image);
    }
  }

  /** base game method create. */
  create(): void {
    this.cursors = this.input.keyboard.createCursorKeys();;
    this.anims.create({
      key: 'coin',
      frames: [
        { key: 'coin1', frame: null },
        { key: 'coin2', frame: null },
        { key: 'coin3', frame: null },
        { key: 'coin4', frame: null },
        { key: 'coin5', frame: null },
        { key: 'coin6', frame: null },
      ],
      frameRate: 10,
      repeat: -1
    });

    // static groups
    this.walls = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.maze = new Maze(this.game.scale.width, this.game.scale.height);

    let array = this.maze.generate();
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
          if (i % 2 == 0 && !coinGen) {
            while (!coinGen) {
              let column = genRand(1, this.maze.columns);
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
    this.updateLabels();
  }

  /**Set the player position in the second row.*/
  private setPlayerPos() {
    for (let j = 0; j < this.maze.columns; j++) {
      if (this.maze.maze[1][j] === MazeCell.Ground) {
        this.player.setPosition(40, j*40);
        return;
      }
    }
  }

  /**Set the ghost position as close as possible depending on the level difficulty.*/
  private setGhostPos(level: number) {
    let i = Math.max(this.maze.rows -1 - level, 3);
    for (let j = 0; j < this.maze.columns && i > 3; j++) {
      if (this.maze.maze[i][j] === MazeCell.Ground) {
        this.ghost.setPosition(i*40, j*40);
        return;
      }
      i -= 1;
    }
  }

  /** Update the coins text label. */
  private updateCoinsInfo() {
    let nCoins = this.coins.children.getArray().length;
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
  updateLabels() {
    this.updateScoreInfo();
    this.updateCoinsInfo();
    this.updateLevelInfo();
  }

  /** Verify whether the user has won the level. */
  hasWon(): boolean {
    if (this.coins.children.getArray().length == 0) {
      return true;
    }
    return false;
  }

  /** Compute coin collions with the player. */
  coinCollision(): void {
    let x = Math.floor(this.player.x);
    let y = Math.floor(this.player.y);
    let coins = this.coins.children.getArray();
    coins.forEach(coin => {
      if (pointDistance(coin.x, x, coin.y, y) <= this.brickSize + 20) {
        this.game.score += this.game.coinValue;
        coin.destroy();
      }
    })
    if (this.hasWon()) {
      console.log(this.game.score);
      this.updateLabels();
      this.game.setLevel(this.game.level + 1);
      this.scene.start("GameScene");
    }
  }

  /** Compute ghost collisions with the player. */
  ghostCollision(): void {
    alert("over");
    this.game.setLevel(1);
    this.scene.start("GameScene");
  }

  /** Make the ghost chase the player by computing the vector distance. The higher the level number, the higher the ghost speeds and also the less likely ghosts will make mistakes in the following the right direction. */
  chase() {
    let factor = 5;
    let x = Math.floor(this.player.x);
    let y = Math.floor(this.player.y);
    let xDiff = Math.abs(x - this.ghost.x);
    let yDiff = Math.abs(y - this.ghost.y);

    let rightMoveProb = Math.random();
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

  /** base game method update. */
  update(): void {
    this.updateLabels();
    this.chase();
    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      this.player.setVelocityX(-this.game.playerSpeed);
    }
    else if (this.cursors.right.isDown) {
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
};
