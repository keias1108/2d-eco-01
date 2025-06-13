import { CONFIG } from "./config.js";

class Creature {
  constructor(p, x, y, energy, maxSpeed, maxForce) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(maxSpeed);
    this.acceleration = p.createVector();
    this.energy = energy;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  _updatePhysics() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.borders();
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  isDead() {
    return this.energy <= 0;
  }

  borders() {
    if (this.position.x < 0) this.position.x = this.p.width;
    if (this.position.y < 0) this.position.y = this.p.height;
    if (this.position.x > this.p.width) this.position.x = 0;
    if (this.position.y > this.p.height) this.position.y = 0;
  }
}

export class Grazer extends Creature {
  constructor(p, x, y) {
    super(
      p,
      x,
      y,
      CONFIG.GRAZER.INITIAL_ENERGY,
      CONFIG.GRAZER.MAX_SPEED,
      CONFIG.GRAZER.MAX_FORCE
    );
  }

  update(world, hunters, grazers) {
    this.energy -= 0.2;

    let fleeForce = this.flee(hunters);
    fleeForce.mult(2.5);
    this.applyForce(fleeForce);

    if (fleeForce.magSq() === 0) {
      this.applyForce(
        this.seek(
          this.p.createVector(
            this.position.x + this.p.random(-50, 50),
            this.position.y + this.p.random(-50, 50)
          )
        )
      );
    }

    this._updatePhysics();
    this.eat(world);

    if (this.energy > CONFIG.GRAZER.REPRODUCTION_ENERGY) {
      this.energy /= 2;
      grazers.push(new Grazer(this.p, this.position.x, this.position.y));
    }
  }

  flee(hunters) {
    let steering = this.p.createVector();
    let total = 0;
    for (let hunter of hunters) {
      let d = this.p.dist(
        this.position.x,
        this.position.y,
        hunter.position.x,
        hunter.position.y
      );
      if (d > 0 && d < CONFIG.GRAZER.FLEE_RADIUS) {
        let diff = p5.Vector.sub(this.position, hunter.position);
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce * 1.5);
    }
    return steering;
  }

  eat(world) {
    world.consumeEnergy(this.position.x, this.position.y, 0.05);
    this.energy += 0.5;
  }

  display() {
    let size = this.p.map(
      this.energy,
      0,
      CONFIG.GRAZER.REPRODUCTION_ENERGY,
      2,
      12,
      true
    );
    let c = this.p.color(100, 255, 150, 220);
    this.p.noStroke();
    this.p.fill(c);
    let pulse = this.p.sin(this.p.frameCount * 0.1 + this.position.x) * 2;
    this.p.ellipse(
      this.position.x,
      this.position.y,
      size + pulse,
      size + pulse
    );
  }
}

export class Hunter extends Creature {
  constructor(p, x, y) {
    super(
      p,
      x,
      y,
      CONFIG.HUNTER.INITIAL_ENERGY,
      CONFIG.HUNTER.MAX_SPEED,
      CONFIG.HUNTER.MAX_FORCE
    );
  }

  update(nearbyGrazers, hunters) {
    this.energy -= 0.35;

    let target = this.findTarget(nearbyGrazers);
    if (target) {
      let seekForce = this.seek(target.position);
      this.applyForce(seekForce);
      if (
        this.p.dist(
          this.position.x,
          this.position.y,
          target.position.x,
          target.position.y
        ) < this.maxSpeed
      ) {
        this.eat(target);
      }
    }

    this._updatePhysics();

    if (this.energy > CONFIG.HUNTER.REPRODUCTION_ENERGY) {
      this.energy /= 2;
      hunters.push(new Hunter(this.p, this.position.x, this.position.y));
    }
  }

  findTarget(grazers) {
    let closestDist = Infinity;
    let closest = null;
    for (let grazer of grazers) {
      let d = this.p.dist(
        this.position.x,
        this.position.y,
        grazer.position.x,
        grazer.position.y
      );
      if (d < closestDist) {
        closestDist = d;
        closest = grazer;
      }
    }
    return closest;
  }

  eat(grazer) {
    this.energy += grazer.energy * 0.9;
    grazer.energy = 0;
  }

  display() {
    let size = this.p.map(
      this.energy,
      0,
      CONFIG.HUNTER.REPRODUCTION_ENERGY,
      4,
      15,
      true
    );
    let c = this.p.color(255, 80, 80, 230);
    this.p.push();
    this.p.translate(this.position.x, this.position.y);
    this.p.rotate(this.velocity.heading() + this.p.PI / 2);
    this.p.noStroke();
    this.p.fill(c);
    this.p.triangle(0, -size, -size * 0.6, size, size * 0.6, size);
    this.p.pop();
  }
}
