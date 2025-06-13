import { CONFIG } from "./config.js";
import { World } from "./world.js";
import { Quadtree, Rectangle, Point } from "./quadtree.js";
import { Grazer, Hunter } from "./creature.js";

const sketch = (p) => {
  let world;
  let creatures = [];

  p.setup = function () {
    p.createCanvas(window.innerWidth * 0.9, window.innerHeight * 0.9);
    world = new World(p, p.width, p.height);

    for (let i = 0; i < CONFIG.INITIAL_GRAZERS; i++) {
      creatures.push(new Grazer(p, p.random(p.width), p.random(p.height)));
    }
    for (let i = 0; i < CONFIG.INITIAL_HUNTERS; i++) {
      creatures.push(new Hunter(p, p.random(p.width), p.random(p.height)));
    }
  };

  p.draw = function () {
    p.background(13, 17, 23);

    // --- [수정된 부분] ---
    // 매 프레임마다 월드의 에너지 필드를 업데이트하여 동적으로 변화시킵니다.
    world.update();
    // --- 수정 끝 ---

    world.display();

    const boundary = new Rectangle(
      p.width / 2,
      p.height / 2,
      p.width / 2,
      p.height / 2
    );
    const qtree = new Quadtree(boundary, CONFIG.QUADTREE_CAPACITY);
    for (const c of creatures) {
      qtree.insert(new Point(c.position.x, c.position.y, c));
    }

    let newCreatures = [];

    for (let i = creatures.length - 1; i >= 0; i--) {
      const creature = creatures[i];

      const perceptionRadius =
        creature instanceof Hunter
          ? CONFIG.HUNTER.HUNT_RADIUS
          : CONFIG.GRAZER.FLEE_RADIUS;
      const range = new Rectangle(
        creature.position.x,
        creature.position.y,
        perceptionRadius,
        perceptionRadius
      );
      const neighbors = qtree.query(range);

      const offspring = creature.run(neighbors, world);
      if (offspring) {
        newCreatures.push(offspring);
      }

      creature.display();

      if (creature.isDead()) {
        creatures.splice(i, 1);
      }
    }

    creatures.push(...newCreatures);

    displayInfo();
  };

  function displayInfo() {
    const grazerCount = creatures.filter((c) => c instanceof Grazer).length;
    const hunterCount = creatures.filter((c) => c instanceof Hunter).length;
    p.noStroke();
    p.fill(200);
    p.textSize(16);
    p.text(`Total: ${creatures.length}`, 10, 20);
    p.text(`Grazers: ${grazerCount}`, 10, 40);
    p.text(`Hunters: ${hunterCount}`, 10, 60);
    p.text(`FPS: ${p.floor(p.frameRate())}`, 10, 80);
  }

  p.mousePressed = function () {
    if (
      p.mouseX > 0 &&
      p.mouseX < p.width &&
      p.mouseY > 0 &&
      p.mouseY < p.height
    ) {
      if (p.keyIsDown(p.SHIFT)) {
        creatures.push(new Hunter(p, p.mouseX, p.mouseY));
      } else {
        creatures.push(new Grazer(p, p.mouseX, p.mouseY));
      }
    }
  };
};

new p5(sketch, document.querySelector("main"));
