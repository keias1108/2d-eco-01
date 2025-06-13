import { CONFIG } from "./config.js";
import { World } from "./world.js";
import { Quadtree, Rectangle, Point } from "./quadtree.js";
import { Grazer, Hunter } from "./creature.js";

const sketch = (p) => {
  let world;
  let grazers = [];
  let hunters = [];
  let qtree;

  p.setup = function () {
    // p.createCanvas가 반환한 렌더러를 직접 사용하지 않고,
    // new p5() 생성자의 두 번째 인자로 부모 요소를 전달합니다.
    p.createCanvas(window.innerWidth * 0.9, window.innerHeight * 0.9);
    world = new World(p, p.width, p.height);

    for (let i = 0; i < CONFIG.INITIAL_GRAZERS; i++) {
      grazers.push(new Grazer(p, p.random(p.width), p.random(p.height)));
    }
    for (let i = 0; i < CONFIG.INITIAL_HUNTERS; i++) {
      hunters.push(new Hunter(p, p.random(p.width), p.random(p.height)));
    }
  };

  p.draw = function () {
    world.update();
    world.display();

    let boundary = new Rectangle(
      p.width / 2,
      p.height / 2,
      p.width / 2,
      p.height / 2
    );
    qtree = new Quadtree(boundary, CONFIG.QUADTREE_CAPACITY);

    for (let g of grazers)
      qtree.insert(new Point(g.position.x, g.position.y, g));
    for (let h of hunters)
      qtree.insert(new Point(h.position.x, h.position.y, h));

    updateAndDisplay(hunters, (h) => {
      let range = new Rectangle(
        h.position.x,
        h.position.y,
        CONFIG.HUNTER.HUNT_RADIUS,
        CONFIG.HUNTER.HUNT_RADIUS
      );
      let nearbyGrazers = qtree.query(range).filter((c) => c instanceof Grazer);
      h.update(nearbyGrazers, hunters);
    });

    updateAndDisplay(grazers, (g) => {
      let range = new Rectangle(
        g.position.x,
        g.position.y,
        CONFIG.GRAZER.FLEE_RADIUS,
        CONFIG.GRAZER.FLEE_RADIUS
      );
      let nearbyHunters = qtree.query(range).filter((c) => c instanceof Hunter);
      g.update(world, nearbyHunters, grazers);
    });

    displayInfo();
  };

  function updateAndDisplay(agentArray, updateLogic) {
    for (let i = agentArray.length - 1; i >= 0; i--) {
      let agent = agentArray[i];
      updateLogic(agent);
      agent.display();
      if (agent.isDead()) {
        agentArray.splice(i, 1);
      }
    }
  }

  function displayInfo() {
    p.noStroke();
    p.fill(200);
    p.textSize(16);
    p.text(`Grazers: ${grazers.length}`, 10, 20);
    p.text(`Hunters: ${hunters.length}`, 10, 40);
    p.text(`FPS: ${p.floor(p.frameRate())}`, 10, 60);
  }

  p.mousePressed = function () {
    if (
      p.mouseX > 0 &&
      p.mouseX < p.width &&
      p.mouseY > 0 &&
      p.mouseY < p.height
    ) {
      if (p.keyIsDown(p.SHIFT)) {
        hunters.push(new Hunter(p, p.mouseX, p.mouseY));
      } else {
        for (let i = 0; i < 5; i++) {
          grazers.push(
            new Grazer(
              p,
              p.mouseX + p.random(-10, 10),
              p.mouseY + p.random(-10, 10)
            )
          );
        }
      }
    }
  };
};

// 'main' 태그를 찾아 그 안에 p5 캔버스를 생성합니다.
new p5(sketch, document.querySelector("main"));
