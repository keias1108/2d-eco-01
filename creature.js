import { CONFIG } from "./config.js";

class Creature {
  // ... 생성자, applyForce, isDead, seek 등은 이전과 동일 ...
  constructor(p, x, y, energy, maxSpeed, maxForce) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(maxSpeed);
    this.acceleration = p.createVector();
    this.energy = energy;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.size = p.map(energy, 0, 200, 4, 15);
  }
  applyForce(force) {
    this.acceleration.add(force);
  }
  isDead() {
    return this.energy <= 0;
  }
  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    if (desired.magSq() === 0) return this.p.createVector(0, 0);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }
  // ...

  // [수정 4] run 메소드가 이제 새로운 개체를 반환(return)합니다.
  run(neighbors, world) {
    this.energy -= CONFIG.CREATURE.METABOLISM_COST;
    const totalForce = this.calculateBehavioralForces(neighbors, world);
    this.applyForce(totalForce);
    this.update();
    this.interact(neighbors, world);
    return this.reproduce(); // 번식 결과를 반환
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.borders();
    this.size = this.p.map(this.energy, 0, 200, 4, 15, true);
  }

  borders() {
    // [수정 5] 미세한 버퍼를 주어 경계면 렌더링 아티팩트를 방지
    const buffer = this.size;
    if (this.position.x > this.p.width + buffer) this.position.x = -buffer;
    else if (this.position.x < -buffer) this.position.x = this.p.width + buffer;
    if (this.position.y > this.p.height + buffer) this.position.y = -buffer;
    else if (this.position.y < -buffer)
      this.position.y = this.p.height + buffer;
  }

  calculateBehavioralForces(neighbors, world) {
    return this.p.createVector(0, 0);
  }
  interact(neighbors, world) {
    /* 서브클래스에서 구현 */
  }

  // [수정 6] reproduce 메소드가 더 이상 creatures 배열을 직접 수정하지 않습니다.
  reproduce() {
    return null; /* 서브클래스에서 구현 */
  }
}

export class Grazer extends Creature {
  // ... 생성자 및 기타 메소드들은 이전과 거의 동일 ...
  constructor(p, x, y) {
    super(p, x, y, 100, CONFIG.CREATURE.MAX_SPEED, CONFIG.CREATURE.MAX_FORCE);
    this.color = p.color(100, 255, 150, 220);
  }
  calculateBehavioralForces(neighbors, world) {
    const nearbyHunters = neighbors.filter((c) => c instanceof Hunter);
    const nearbyGrazers = neighbors.filter(
      (c) => c instanceof Grazer && c !== this
    );
    const fleeForce = this.flee(nearbyHunters).mult(CONFIG.GRAZER.FLEE_FORCE);
    if (fleeForce.magSq() > 0) return fleeForce;
    const separationForce = this.separate(nearbyGrazers).mult(
      CONFIG.GRAZER.SEPARATION_FORCE
    );
    const foodForce = this.seekFood(world).mult(CONFIG.GRAZER.FOOD_SEEK_FORCE);
    return separationForce.add(foodForce);
  }
  flee(hunters) {
    let steer = this.p.createVector(0, 0);
    for (let hunter of hunters) {
      let d = this.p.dist(
        this.position.x,
        this.position.y,
        hunter.position.x,
        hunter.position.y
      );
      if (d > 0 && d < CONFIG.GRAZER.FLEE_RADIUS) {
        let diff = p5.Vector.sub(this.position, hunter.position);
        diff.mult(1 / (d * d));
        steer.add(diff);
      }
    }
    return steer;
  }
  separate(grazers) {
    let steer = this.p.createVector(0, 0);
    let count = 0;
    for (let other of grazers) {
      let d = this.p.dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (d > 0 && d < CONFIG.GRAZER.SEPARATION_RADIUS) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) steer.div(count);
    return steer;
  }
  seekFood(world) {
    let predict = this.velocity.copy();
    predict.normalize();
    predict.mult(25);
    let predictedPos = p5.Vector.add(this.position, predict);
    let bestEnergy = -1;
    let bestSteer = this.p.createVector(0, 0);
    for (let i = 0; i < 8; i++) {
      let angle = this.p.map(i, 0, 8, 0, this.p.TWO_PI);
      let checkPos = p5.Vector.fromAngle(angle, 30).add(predictedPos);
      let energy = world.getEnergyAt(checkPos.x, checkPos.y);
      if (energy > bestEnergy) {
        bestEnergy = energy;
        bestSteer = p5.Vector.sub(checkPos, this.position);
      }
    }
    return bestSteer;
  }

  interact(neighbors, world) {
    const energyHere = world.getEnergyAt(this.position.x, this.position.y);
    if (energyHere > 0.1) {
      const consumed = Math.min(energyHere, 0.5);
      this.energy += consumed;
      world.consumeEnergy(this.position.x, this.position.y, consumed * 0.1);
    }
  }

  // [수정 7] reproduce가 새로운 Grazer 객체를 반환합니다.
  reproduce() {
    if (this.energy > CONFIG.GRAZER.REPRODUCTION_THRESHOLD) {
      this.energy *= CONFIG.CREATURE.REPRODUCTION_ENERGY_COST;
      return new Grazer(this.p, this.position.x, this.position.y);
    }
    return null;
  }

  display() {
    this.p.noStroke();
    this.p.fill(this.color);
    this.p.ellipse(this.position.x, this.position.y, this.size, this.size);
  }
}

export class Hunter extends Creature {
  // ... 헌터 클래스도 reproduce 메소드만 동일하게 수정 ...
  constructor(p, x, y) {
    super(
      p,
      x,
      y,
      CONFIG.HUNTER.INITIAL_ENERGY,
      CONFIG.CREATURE.MAX_SPEED * 0.9,
      CONFIG.CREATURE.MAX_FORCE
    );
    this.color = p.color(255, 80, 80, 230);
  }
  calculateBehavioralForces(neighbors, world) {
    const nearbyHunters = neighbors.filter(
      (c) => c instanceof Hunter && c !== this
    );
    const nearbyGrazers = neighbors.filter((c) => c instanceof Grazer);
    const separationForce = this.separate(nearbyHunters).mult(
      CONFIG.HUNTER.SEPARATION_FORCE
    );
    const huntForce = this.hunt(nearbyGrazers).mult(CONFIG.HUNTER.HUNT_FORCE);
    return separationForce.add(huntForce);
  }
  separate(hunters) {
    let steer = this.p.createVector(0, 0);
    let count = 0;
    for (let other of hunters) {
      let d = this.p.dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (d > 0 && d < CONFIG.HUNTER.SEPARATION_RADIUS) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) steer.div(count);
    return steer;
  }
  hunt(grazers) {
    let closestDist = Infinity;
    let closest = null;
    for (let grazer of grazers) {
      let d = this.p.dist(
        this.position.x,
        this.position.y,
        grazer.position.x,
        grazer.position.y
      );
      if (d < closestDist && d < CONFIG.HUNTER.HUNT_RADIUS) {
        closestDist = d;
        closest = grazer;
      }
    }
    if (closest) return this.seek(closest.position);
    return this.p.createVector(0, 0);
  }
  interact(neighbors, world) {
    const nearbyGrazers = neighbors.filter((c) => c instanceof Grazer);
    for (let grazer of nearbyGrazers) {
      let d = this.p.dist(
        this.position.x,
        this.position.y,
        grazer.position.x,
        grazer.position.y
      );
      if (d > 0 && d < CONFIG.HUNTER.ATTACK_RADIUS) {
        const drained = Math.min(
          grazer.energy,
          CONFIG.HUNTER.ENERGY_DRAIN_RATE
        );
        grazer.energy -= drained;
        this.energy += drained;
      }
    }
  }

  // [수정 8] reproduce가 새로운 Hunter 객체를 반환합니다.
  reproduce() {
    if (this.energy > CONFIG.HUNTER.REPRODUCTION_THRESHOLD) {
      this.energy *= CONFIG.CREATURE.REPRODUCTION_ENERGY_COST;
      return new Hunter(this.p, this.position.x, this.position.y);
    }
    return null;
  }

  display() {
    this.p.push();
    this.p.translate(this.position.x, this.position.y);
    this.p.rotate(this.velocity.heading() + this.p.PI / 2);
    this.p.noStroke();
    this.p.fill(this.color);
    this.p.triangle(
      0,
      -this.size,
      -this.size * 0.6,
      this.size,
      this.size * 0.6,
      this.size
    );
    this.p.pop();
  }
}
