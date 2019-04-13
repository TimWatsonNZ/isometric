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

context.fillStyle = '#FF0000';

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
  ctx.fill();
}

rotate45 = (point) => {
  return point.rotate(Math.PI/4);
}
shift = (point) => {
  return point.add(diagonal/2, diagonal/2);
}
rotateX45 = (point) => point.rotateX(Math.PI/4);
position = (point, row, column) => {
  const isSecondRow = (row + 1) % 2 == 0;

  if (isSecondRow) {
    return point.add(column * diagonal + diagonal/2, row/2 * diagonal);
  }
  return point.add(column * diagonal, row/2 * diagonal);
}

const funcs = [rotate45, rotateX45, shift, position];
const renderPipe = (point, row, column) => {
  return funcs.reduce((transformedPoint, transform) => transform(transformedPoint, row, column), point);
}

const diagonal = Math.sqrt(tileSize*tileSize*2);
function draw() {
  for (let row = 0; row < tiles.length; row++) {
    for (let column = 0;column < tiles[row].length; column++) {
      context.strokeRect(row*diagonal, column*diagonal, diagonal, diagonal)
      const tile = tiles[row][column];
  
      const p1 = renderPipe(new Point(-tileSize/2, -tileSize/2), row, column);
      const p2 = renderPipe(new Point(tileSize/2, -tileSize/2), row, column);
      const p3 = renderPipe(new Point(tileSize/2, tileSize/2), row, column);
      const p4 = renderPipe(new Point(-tileSize/2, tileSize/2), row, column);
  
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
        context.stroke();
      } else {
        context.stroke();
      }
    }
  }
}

draw();
const hyp = Math.sqrt(tileSize*2*tileSize);
const rotatePoint = (point) => {
  // const row = 
  const column = Math.floor(point.x / hyp);
  const row = Math.floor(point.y / hyp);
  const normalised = new Point(point.x % hyp, point.y % hyp);
  const toOrigin = normalised.add(-tileSize / 2, -tileSize / 2);
  const rotated = toOrigin.rotate(-Math.PI/4);
  
  const backAgain = rotated.add(tileSize/2, tileSize/2);
  console.log(`Column ${column}, Row ${row}`)
  return backAgain;
}

canvas.addEventListener('click', (event) => {
  const { layerX, layerY } = event;
  context.fillStyle = '#000000';
  context.fillRect(layerX, layerY, 2, 2);
  context.fillStyle = '#FF0000';

  const clickPoint = new Point(layerX, layerY);

  const column = Math.floor(clickPoint.x / hyp);
  const row = Math.floor(clickPoint.y / hyp);

  const getNeighbours = (x, y) => {
    const norm = { x:x, y: y*2 };
    return [
      { x: norm.x-1, y: norm.y-1}, { x: norm.x, y: norm.y-1},
      { x: norm.x-1, y: norm.y+1},{ x: norm.x, y: norm.y+1}]
      .filter(pair => pair.x >=0 && pair.y >= 0 && pair.x < tilesWidth && pair.y < tilesWidth);
  }

  const dist = (p1, p2) => (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y);

  const centreTile = { x: column, y: row*2 };
  const indexToTileCenter = (p) => ({ x: p.x * diagonal + diagonal/2 + (p.y % 2)*diagonal/2, y: p.y * diagonal/2 + diagonal/2 });
  
  const neighbours = [centreTile].concat(getNeighbours(column, row))
    .map((p,i) => {
      const neighbourCenter = indexToTileCenter(p); 
      return { index: p, tileCenter: neighbourCenter, distance: -1 };
    });

    const closestTile = neighbours.reduce((closest, current) => {
      const distance = dist(current.tileCenter, clickPoint);
      if (distance < closest.distance) {
        current.distance = distance;
        closest = current;
      }
      return closest;
    }, { ...neighbours[0], distance: dist(neighbours[0].tileCenter, clickPoint)});
  tiles[closestTile.index.y][closestTile.index.x].selected = true;
  draw();
});