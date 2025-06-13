// 점(Point) 객체를 위한 간단한 클래스
export class Point {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.data = data; // 점에 연결된 실제 객체 (Creature)
  }
}

// 영역(Rectangle) 객체를 위한 클래스
export class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point) {
    return (
      point.x >= this.x - this.w &&
      point.x < this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y < this.y + this.h
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}

// 쿼드트리 클래스
export class Quadtree {
  constructor(boundary, capacity) {
    this.boundary = boundary; // new Rectangle
    this.capacity = capacity; // 노드가 가질 수 있는 최대 점의 수
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    let { x, y, w, h } = this.boundary;
    let hw = w / 2;
    let hh = h / 2;

    let ne = new Rectangle(x + hw, y - hh, hw, hh);
    this.northeast = new Quadtree(ne, this.capacity);
    let nw = new Rectangle(x - hw, y - hh, hw, hh);
    this.northwest = new Quadtree(nw, this.capacity);
    let se = new Rectangle(x + hw, y + hh, hw, hh);
    this.southeast = new Quadtree(se, this.capacity);
    let sw = new Rectangle(x - hw, y + hh, hw, hh);
    this.southwest = new Quadtree(sw, this.capacity);

    this.divided = true;
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northeast.insert(point) ||
      this.northwest.insert(point) ||
      this.southeast.insert(point) ||
      this.southwest.insert(point)
    );
  }

  query(range, found = []) {
    if (!this.boundary.intersects(range)) {
      return found;
    }

    for (let p of this.points) {
      if (range.contains(p)) {
        found.push(p.data);
      }
    }

    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }
}
