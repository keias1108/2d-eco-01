// 이전과 동일하지만, consumeEnergy가 이제 실제로 사용됩니다.
import { CONFIG } from "./config.js";

export class World {
  constructor(p, w, h) {
    this.p = p;
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
    // p.background()를 호출하지 않고, 이 함수 자체가 배경 역할을 하도록 합니다.
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const x = i * this.resolution;
        const y = j * this.resolution;
        // 마지막 셀이 경계를 넘어서는 것을 방지하고 캔버스 끝까지 채우도록 함
        const w = i === this.cols - 1 ? this.w - x : this.resolution;
        const h = j === this.rows - 1 ? this.h - y : this.resolution;

        const energy = this.field[i][j];
        const c = this.p.lerpColor(this.colorFrom, this.colorTo, energy);
        this.p.noStroke();
        this.p.fill(c);
        this.p.rect(x, y, w, h);
      }
    }
  }

  getEnergyAt(x, y) {
    let worldX = this.p.constrain(
      this.p.floor(x / this.resolution),
      0,
      this.cols - 1
    );
    let worldY = this.p.constrain(
      this.p.floor(y / this.resolution),
      0,
      this.rows - 1
    );
    return this.field[worldX] && this.field[worldX][worldY]
      ? this.field[worldX][worldY]
      : 0;
  }

  consumeEnergy(x, y, amount) {
    let worldX = this.p.constrain(
      this.p.floor(x / this.resolution),
      0,
      this.cols - 1
    );
    let worldY = this.p.constrain(
      this.p.floor(y / this.resolution),
      0,
      this.rows - 1
    );
    if (this.field[worldX] && this.field[worldX][worldY]) {
      this.field[worldX][worldY] -= amount;
      if (this.field[worldX][worldY] < 0) this.field[worldX][worldY] = 0;
    }
  }
}
