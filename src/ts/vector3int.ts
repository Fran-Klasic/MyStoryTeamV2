export class Vector3Int {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.z = Math.round(z);
  }

  add(v: Vector3Int): Vector3Int {
    return new Vector3Int(this.x + v.x, this.y + v.y, 0);
  }

  equals(v: Vector3Int): boolean {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  }

  zero(): Vector3Int {
    return new Vector3Int(0, 0, 0);
  }
}
