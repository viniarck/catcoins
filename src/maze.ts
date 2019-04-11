
/** Represents a cell of the Maze. */
export enum MazeCell { Wall = 0, Ground = 1, Flooded = 2 };

export class Maze {
  rows: number;
  columns: number;
  maze: Array<Array<MazeCell>> = [];

  constructor(width: number, height: number, brickSize = 40) {
    this.rows = width / brickSize;
    this.columns = height / brickSize;
    for (let i = 0; i < this.rows; i++) {
      this.maze[i] = [];
    }
  }

  /** Generate a random maze composed of MazeCell.Wall and MazeCell.Ground based on a probability between 0 to 1. */
  generate(prob: number = 0.03): Array<Array<MazeCell>> {
    let maze = this.generate_random(prob);
    let maxRetries = 1000;
    for (let i = 0; i < maxRetries; i++) {
      if (!this.hasGroundIslands(maze)) {
        this.maze = maze;
        return this.maze;
      } else {
        maze = this.generate_random(prob);
      }
    }
    alert("Failed to generate a valid maze! You can try again by refreshing this page.");
    return this.maze;
  }

  /** Perform a graph search to detect any island composed of MazeCell.Ground. */
  hasGroundIslands(maze: Array<Array<MazeCell>>): boolean {
    let m = JSON.parse(JSON.stringify(maze));
    for (let i = 0; i < this.rows - 1; i++) {
      for (let j = 1; j < this.columns - 1; j++) {
        if (maze[i][j] === MazeCell.Ground) {
          if (maze[i + 1][j] === MazeCell.Ground) {
            m[i][j] = MazeCell.Flooded;
            continue;
          } else if (maze[i][j + 1] === MazeCell.Ground) {
            m[i][j] = MazeCell.Flooded;
            continue;
          }
          if (i > 0) {
            if (maze[i - 1][j] === MazeCell.Ground) {
              m[i][j] = MazeCell.Flooded;
            } else if (m[i][j - 1] === MazeCell.Ground) {
              m[i][j] = MazeCell.Flooded;
            }
          }
        }
      }
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 1; j < this.columns; j++) {
        if (m[i][j] === MazeCell.Ground) {
          return true;
        }
      }
    }
    return false;
  }

  /** Generate a random maze composed of MazeCell.Wall and MazeCell.Ground based on a probability between 0 to 1. */
  private generate_random(prob: number): Array<Array<MazeCell>> {
    let maze: Array<Array<MazeCell>> = [];
    for (let i = 0; i < this.rows; i++) {
      maze[i] = [];
      for (let j = 1; j < this.columns; j++) {
        if (i === 0 || j === 1 || i === this.rows - 1 || j === this.columns - 1) {
          maze[i][j] = MazeCell.Wall;
        } else {
          if (Math.random() < prob) {
            maze[i][j] = MazeCell.Wall;
          } else {
            maze[i][j] = MazeCell.Ground;
          }
        }
      }
    }
    return maze;
  }
}
