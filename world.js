import { CONFIG } from "./config.js";

export class World {
  constructor(p, w, h) {
    this.p = p; // p5 instance
    this.w = w;
    this.h = h;
    this.resolution = CONFIG.WORLD_RESOLUTION;
    this.cols = Math.floor(w / this.resolution);
    this.rows = Math.floor(h / this.resolution);
    this.field = new Array(this.cols)
      .fill(0)
      .map(() => new Array(this.rows).fill(0));
    this.noiseOffsetX = this.p.random(1000);
    this.noiseOffsetY = this.p.random(1000);

    this.colorFrom = this.p.color(20, 30, 80);
    this.colorTo = this.p.color(255, 220, 50);
  }

  update() {
    let xoff = this.noiseOffsetX;
    for (let i = 0; i < this.cols; i++) {
      xoff += 0.01;
      let yoff = this.noiseOffsetY;
      for (let j = 0; j < this.rows; j++) {
        yoff += 0.01;
        this.field[i][j] = this.p.pow(this.p.noise(xoff, yoff), 2);
      }
    }
    this.noiseOffsetX += 0.003;
    this.noiseOffsetY += 0.003;
  }

  display() {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let energy = this.field[i][j];
        let c = this.p.lerpColor(this.colorFrom, this.colorTo, energy);
        this.p.noStroke();
        this.p.fill(c);
        this.p.rect(
          i * this.resolution,
          j * this.resolution,
          this.resolution,
          this.resolution
        );
      }
    }
  }

  consumeEnergy(x, y, amount) {
    let worldX = this.p.floor(x / this.resolution);
    let worldY = this.p.floor(y / this.resolution);
    if (this.field[worldX] && this.field[worldX][worldY] !== undefined) {
      this.field[worldX][worldY] -= amount;
      if (this.field[worldX][worldY] < 0) this.field[worldX][worldY] = 0;
    }
  }
}
