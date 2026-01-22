export class Vector2Int {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = Math.round(x);
    this.y = Math.round(y);
  }

  add(v: Vector2Int): Vector2Int {
    return new Vector2Int(this.x + v.x, this.y + v.y);
  }

  equals(v: Vector2Int): boolean {
    return this.x == v.x && this.y == v.y;
  }

  zero(): Vector2Int {
    return new Vector2Int(0, 0);
  }
}
