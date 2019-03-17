const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

document.body.appendChild(canvas);

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  addPoint (point) {
    return new Point(this.x + point.x, this.y + point.y);
  }

  add(x = 0, y = 0) {
    return new Point(this.x + x, this.y + y)
  }

  copy() {
    return this.add();
  }

  mult(x = 1, y = 1) {
    return new Point(this.x * x, this.y * y);
  }

  rotate(theta) {
    const x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
    const y = this.x * Math.sin(theta) + this.y * Math.cos(theta);
    return new Point(x, y);
  }

  rotateX(theta) {
    const x = this.x;
    const y = Math.cos(theta) * this.y;
    return new Point(x, y);
  }

  rotateY(theta) {
    const x = this.x * Math.cos(theta);
    const y = this.y;
    return new Point(x, y);
  }

  rotateZ(theta) {

  }

  negative() {
    return new Point(-this.x, -this.y);
  }
}

class Tile {
  constructor(point) {
    this.point = point;
    this.selected = false;
  }
}

const tilesWidth = 10;
const tileSize = 40;

const tiles = [];
for (let h = 0; h < tilesWidth; h++) {
  const tileRow = [];
  for (let w = 0; w < tilesWidth; w++) {
    tileRow.push(new Tile(new Point(w * tileSize, h * tileSize)));
  }
  tiles.push(tileRow);
}

function drawQuad(tile, width, height, ctx, row, col) {
  const p1 = tile.point;
  const p4 = tile.point.add(0, height);
  const p3 = tile.point.add(width, height);
  const p2 = tile.point.add(width, 0);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.stroke();
}

const center = new Point(tileSize * tilesWidth / 2 + tilesWidth/2, tileSize * tilesWidth / 2 + tilesWidth/2);
const rotate = (point) => translateCenter(point).rotate(Math.PI/4).addPoint(center);
const translateCenter = (point) => point.addPoint(center.negative());

function draw() {
  for (let row = 0; row < tiles.length; row++) {
    for (let column = 0;column < tiles[row].length; column++) {
      const tile = tiles[row][column];
  
      const p1 = rotate(tile.point.copy()).add(100, 100);
      const p2 = rotate(tile.point.add(tileSize, 0)).add(100, 100);;
      const p3 = rotate(tile.point.add(tileSize, tileSize)).add(100, 100);;
      const p4 = rotate(tile.point.add(0, tileSize)).add(100, 100);;
  
      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.lineTo(p3.x, p3.y);
      context.lineTo(p4.x, p4.y);
      context.closePath();
      if (tile.selected) {
        context.fillStyle = '#FF0000';
        context.fill();
        context.fillStyle = '#000000';
      } else {
        context.stroke();
      }
    }
  }
}

draw();

canvas.addEventListener('click', (event) => {
  const { layerX, layerY } = event;
  context.fillStyle = '#000000';
  context.fillRect(layerX, layerY, 2, 2);
  context.fillStyle = '#FF0000';

  const transformedPoint = new Point(layerX, layerY).add(-100, -100)
    .addPoint(center.negative()).rotate(-Math.PI/4).addPoint(center);
  context.fillRect(transformedPoint.x, transformedPoint.y, 2, 2);

  const rowIndex = Math.floor(transformedPoint.y / tileSize);
  const colIndex = Math.floor(transformedPoint.x / tileSize);
  
  console.log(`${colIndex}, ${rowIndex}`);
  tiles[rowIndex][colIndex].selected = true;
  draw();
});