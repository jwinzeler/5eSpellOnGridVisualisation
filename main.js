let gridSize;
const width = 800;

let grid;
let spells = [];

let requiredCorners = 2;
let lastCorners = 2;
let cornersInput;

let size = 15;
let lastSize = 15;
let sizeInput;

let centeredOnSquare = true;
let aura = true;

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
    reset();
}

function auraTicked() {
    aura = !aura;
    reset();
}

function reset() {
    const offset = centeredOnSquare ? 3 : 2;
    const tempSize = !centeredOnSquare || !aura ? Number(size) + 4 : Number(size) + 2;
    gridSize = width / ((floor(tempSize / 5) * 2) + offset);
    grid = new Grid(width / gridSize);
    spells = [
        new Spell(floor(tempSize / 5) + 1, floor(tempSize / 5) + 1, size, centeredOnSquare, aura),
    ];
}

function draw() {
    requiredCorners = cornersInput.value;
    size = sizeInput.value;
    reset();
    if (lastCorners !== requiredCorners) {
        document.getElementById('cornersOut').innerHTML = requiredCorners;
    }

    background(55);
    grid.draw();
    for(let spell of spells) {
        spell.draw();
    }
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
}

class Spell {
    x;
    y;
    diameter;

    isPlacedOnCenter;

    initialRadius;

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

        for (let cell of grid.cells) {
            if (cell.isInsideCircle(this.x, this.y, this.diameter / 2)) {
                cell.color = color(150, 150, 255);
            }
        }

        if (isPlacedOnCenter) {
            grid.getCellFromCoordinate(x, y).color = color(150, 255, 150);
        }
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
    }
}