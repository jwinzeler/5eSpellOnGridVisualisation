let gridSize;
const width = 800;

let grid;
let spell;

let requiredCorners = 2;
let lastCorners = 2;
let cornersInput;

let size = 15;
let lastSize = 15;
let sizeInput;

let centeredOnSquare = true;
let aura = true;
let draggable = false;

let spellX = 0;
let spellY = 0;

function setup() {
    createCanvas(width, width);
    reset();
    frameRate(10);
    
    cornersInput = document.getElementById('corners');
    cornersInput.value = requiredCorners;
    
    sizeInput = document.getElementById('radius');
    sizeInput.value = size;
}

function centeredOnSquareTicked() {
    centeredOnSquare = !centeredOnSquare;
    resetDraggable();
}

function auraTicked() {
    aura = !aura;
    resetDraggable();
}

function placeAnywhereTicked() {
    aura = true;
    document.getElementById('aura').checked = false;
    centeredOnSquare = true;
    document.getElementById('centered').checked = false;
    draggable = !draggable;
    frameRate(draggable ? 30 : 10)
    reset();
}

function resetDraggable() {
    if (draggable) {
        spellX = 0;
        spellY = 0;
        draggable = false;
        document.getElementById('anywhere').checked = false;
    }
    reset();
}

function reset() {
    let offsetX = 0;
    let offsetY = 0;
    if (spellX !== 0 && spellY !== 0) {
        offsetX = spellX - spell.x;
        offsetY = spellY - spell.y;
    }
    const offset = centeredOnSquare ? 3 : 2;
    const tempSize = !centeredOnSquare || !aura ? Number(size) + 4 : Number(size) + 2;
    gridSize = width / ((floor(tempSize / 5) * 2) + offset);
    grid = new Grid(width / gridSize);
    spell = new Spell(floor(tempSize / 5) + 1, floor(tempSize / 5) + 1, size, centeredOnSquare, aura);

    if (draggable) {
        spell.x -= offsetX;
        spell.y -= offsetY;
    }
}

function draw() {
    update();
    background(55);
    grid.draw();
    spell.draw();
}

function update() {
    requiredCorners = Number(cornersInput.value);
    size = Number(sizeInput.value);
    if (lastCorners !== requiredCorners || lastSize !== size) {
        if (size > 100) {
            size = 100;
            sizeInput.value = 100;
        }
        document.getElementById('cornersOut').innerHTML = requiredCorners;
        reset();
    }
    spell.update();
    lastCorners = requiredCorners;
    lastSize = size;
}

class Grid {
    cells = [];

    constructor(cellCount) {
        for (let i = 0; i < cellCount; i++) {
            for (let j = 0; j < cellCount; j++) {
                this.cells.push(new Cell(i, j, gridSize));
            }
        }
    }

    draw() {
        for (let cell of this.cells) {
            cell.draw();
        }
    }

    getCellFromCoordinate(x, y) {
        return this.cells[x * Math.sqrt(this.cells.length) + y];
    }
}

class Cell {
    x;
    y;
    color = color(255, 200, 150);

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw() {
        stroke(200, 150, 100);
        strokeWeight(1);
        fill(this.color);
        square(this.x * gridSize, this.y * gridSize, this.x + 1 * gridSize);
    }

    isInsideCircle(pixelX, pixelY, circlePixleRadius) {
        const center = createVector(pixelX, pixelY);
        const corners = [
            createVector(this.x * gridSize + 1, this.y * gridSize + 1),
            createVector(this.x * gridSize + gridSize - 1, this.y * gridSize + 1),
            createVector(this.x * gridSize + gridSize - 1, this.y * gridSize + gridSize - 1),
            createVector(this.x * gridSize + 1, this.y * gridSize + gridSize - 1),
        ];

        let count = 0;
        
        for (let corner of corners) {
            let dist = corner.dist(center);
            if (dist < circlePixleRadius) {
                count++;
            }
        }

        return count >= requiredCorners;
    }

    contains(pixelX, pixelY) {
        return pixelX > this.x * gridSize && pixelX < this.x * gridSize + gridSize && pixelY > this.y * gridSize && pixelY < this.y * gridSize + gridSize;
    }

    containX(pixelX) {
        const boundaryA = this.x * gridSize;
        const boundaryB = this.x * gridSize + gridSize;
        if (pixelX > boundaryA && pixelX < boundaryB) {
            return pixelX;
        } else {
            if (pixelX > boundaryA) {
                return boundaryB;
            }
        }
        return boundaryA;
    }

    containY(pixelY) {
        const boundaryA = this.y * gridSize;
        const boundaryB = this.y * gridSize + gridSize;
        if (pixelY > boundaryA && pixelY < boundaryB) {
            return pixelY;
        } else {
            if (pixelY > boundaryA) {
                return boundaryB;
            }
        }
        return boundaryA;
    }
}

class Spell {
    x;
    y;
    diameter;

    isPlacedOnCenter;

    initialRadius;

    centerCell;

    lastMouseDown = false;
    dragging = false;
    lastMouseX = 0;
    lastMouseY = 0;

    affectedSquares = 0;

    constructor(x, y, radius, isPlacedOnCenter = true, isRadiusFromCenter = true) {
        this.isPlacedOnCenter = isPlacedOnCenter;
        this.initialRadius = radius / 5 * gridSize;

        if (isPlacedOnCenter) {
            this.x = x * gridSize + gridSize / 2;
            this.y = y * gridSize + gridSize / 2;
        } else {
            this.x = x * gridSize;
            this.y = y * gridSize;
        }

        if (!isRadiusFromCenter && isPlacedOnCenter) {
            this.diameter = (radius / 5 * 2 + 1) * gridSize;
        } else {
            this.diameter = radius / 5 * 2 * gridSize;
        }

        if (this.isPlacedOnCenter) {
            this.centerCell = grid.getCellFromCoordinate(x, y);
        }

        spellX = this.x;
        spellY = this.y;
    }

    update() {
        this.affectedSquares = 0;
        for (let cell of grid.cells) {
            if (cell.isInsideCircle(this.x, this.y, this.diameter / 2)) {
                cell.color = color(150, 150, 255);
                this.affectedSquares++;
            } else {
                cell.color = color(255, 200, 150);
            }
        }

        if (this.isPlacedOnCenter) {
            this.centerCell.color = color(150, 255, 150);
        }

        const contained = draggable && this.centerCell.contains(mouseX, mouseY);

        if (contained) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'inherit';
        }

        if (mouseIsPressed && contained) {
            this.dragging = true;
        } else if (!mouseIsPressed && this.lastMouseDown) {
            this.dragging = false;
        }



        if (this.dragging) {
            this.x = this.centerCell.containX(this.x + mouseX - this.lastMouseX);
            this.y = this.centerCell.containY(this.y + mouseY - this.lastMouseY);
        }
        
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
        this.lastMouseDown = mouseIsPressed;
    }

    draw() {
        if (!this.isPlacedOnCenter) {
            strokeWeight(4);
            stroke(150, 255, 150);

            const length = gridSize / 5;
            line(this.x - length, this.y, this.x + length, this.y);
            line(this.x, this.y - length, this.x, this.y + length);
        }

        strokeWeight(1);
        stroke(0);
        noFill();
        ellipse(this.x, this.y, this.diameter, this.diameter);

        line(this.x, this.y - this.diameter / 2, this.x, this.y - this.diameter / 2 + this.initialRadius);

        noStroke();
        fill(0);
        textSize(20);
        text(`Hits ${this.affectedSquares} Squares`, 5, 20);
    }
}