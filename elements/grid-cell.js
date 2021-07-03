//types
let barren = {name: 'barren', imgs: '', bgImgs: ['farm1', 'farm2', 'farm3', 'farm4', 'farm4'], bg: 'yellow'}
let tree = {name: 'tree', imgs: ['tree1', 'tree2', 'tree3', 'tree4', 'tree5', 'tree6', 'tree7', 'tree8', 'tree9'], bgImgs: ['grass'], bg: 'green'};
// let forest = {name: 'forest', imgs: ['tree1', 'tree2', 'tree3', 'tree4', 'tree5', 'tree6', 'tree7', 'tree8', 'tree9'], bgImgs: ['grass'], bg: 'green'};
let forest = {name: 'forest', imgs: ['forest1', 'forest2', 'forest3'], bgImgs: ['grass'], bg: 'green'};
let townCentre = {name: 'town centre', imgs: '', bgImgs: ['path1', 'path2', 'path3'], bg: 'black'};
let path = {name: 'path', imgs: '', bgImgs: ['path1', 'path2', 'path3'], bg: 'brown'};
let house = {name: 'house', imgs: ['house1', 'house2'], bgImgs: ['grass'], bg: 'green'};
let city = {name: 'city', imgs: ['city1', 'city2', 'city3'], bgImgs: ['bitumen'], bg: 'grey'};

let treeImgs = [
    'tree1',
    'tree2',
    'tree3'
];

let forestImgs = [
    'forest1',
    'forest2',
    'forest3'
];


//used by clearTrunk() to keep patterns together. Try to keep at three or fewer indexes
let trunks = [0, 1, 0];
let patternNum = 0;

//max allowable number of path tiles. Decrements with each new path tile
let paths = 300;

//max allowable distance for a house to exist from a path tile. Passed into initial spreadHouse() but doesn't change globally
let maxDistanceFromPath = 3;

//max allowable city tiles
let maxCityTiles = 250;

//total tiles in grid. Used to know when to refresh grid
let totalTiles;

let overlay;

//amount of time to sit on completed pattern before reloading
let ponderTime = 15000; // prod
// let ponderTime = 7000; // dev

class GridCell extends HTMLElement {
    constructor(x, y, type) {
        super();
        

        this.x = x;
        this.y = y;

        this.type = type;
        
        type.imgs ? this.innerHTML = `<img src="./img/${this.randomFrom(type.imgs)}.png" />` : this.innerHTML = '';
        type.bgImgs ? this.style.backgroundImage = `url("./img/${this.randomFrom(type.bgImgs)}.png")` : this.style.backgroundColor = type.bg;

        this.setAttribute('x', x);
        this.setAttribute('y', y);

        this.tickSpeed = 1000;

        // this.addEventListener('click', () => this.test());

        //has setType been called yet?
        // this.setTypeCalled = false;
    }

    test() {
        // console.log(typeof(this));
        // this.setType(barren);
        // this.clear();

        // this.clearTrunk(patternNum);
        // patternNum++;

        // this.spreadCity(this.tickSpeed);
        // this.placeTownCentre();
        // this.spreadLike(tree, [tree]);
    }

    // ---=== utilities ===--- //

    setType(type) {
        // if (this.setTypeCalled) {
        //     console.log(this.type.name);
        // }

        this.setTypeCalled = true;
        this.type = type;

        if (!totalTiles && totalTiles !== 0) {
            totalTiles = this.parentElement.parentElement.getRowNum() * this.parentElement.parentElement.getColNum();
        } else if (totalTiles > 5) {
            totalTiles--;
        } else {
            totalTiles--;
            setTimeout(() => {
                // this.parentElement.parentElement.parentElement.querySelector('.fader').classList.add('fadeAll');
                this.parentElement.parentElement.parentElement.querySelector('#fader').style.opacity = 1;
                // this.parentElement.parentElement.classList.add('fadeAll');
            }, ponderTime - 2500);

            setTimeout(() => {location.reload()}, ponderTime); // reload page
        }

        let overlay = this.parentElement.parentElement.overlay;
        let percentage = (totalTiles / (this.parentElement.parentElement.getRowNum() * this.parentElement.parentElement.getColNum())) * 100;
        
        // change overlay opacity
        this.getType() === barren ? overlay.style.opacity = `${100 - percentage}%` : overlay.style.opacity = `${percentage}%`;
        // set img
        type.imgs ? this.innerHTML = `<img src="./img/${this.randomFrom(type.imgs)}.png" />` : this.innerHTML = '';
        // set bg
        type.bgImgs ? this.style.backgroundImage = `url("./img/${this.randomFrom(type.bgImgs)}.png")` : this.style.backgroundColor = type.bg;
        // make cities and houses bigger than other tiles
        this.getType() === city || this.getType() === house ? this.style.setProperty('--imgWidth', '150%') : this.style.setProperty('--imgWidth', '100%');
    }

    getType() {
        return this.type;
    }

    isType(types) { // takes an array
        return types.includes(this.getType()) ? true : false;
    }

    randomFrom(arr) { // returns a random item from given array
        let item = arr[Math.floor(Math.random() * arr.length)];
        return item;
    }

    getCell(direction) {
        let targetX;
        let targetY;
        if (direction == 'up') {
            targetX = this.x;
            targetY = this.y - 1;
        } else if (direction == 'down') {
            targetX = this.x;
            targetY = this.y + 1;
        } else if (direction == 'left') {
            targetX = this.x - 1;
            targetY = this.y;
        } else {
            targetX = this.x + 1;
            targetY = this.y;
        }

        let targetElement = this.parentElement.parentElement.querySelector(`grid-cell[x="${targetX}"][y="${targetY}"]`);
        return targetElement ? targetElement : false;
    }

    randomDirection() {
        return ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
    }

    canSpread(types, direction) { // takes an array. Returns true if any neighbouring cell does not contain given types
        if (!direction) {
            if (this.getCell('up') && !types.includes(this.getCell('up').type)) { return true };
            if (this.getCell('down') && !types.includes(this.getCell('down').type)) { return true };
            if (this.getCell('left') && !types.includes(this.getCell('left').type)) { return true };
            if (this.getCell('right') && !types.includes(this.getCell('right').type)) { return true };
            
            return false;
        } else {
            return this.getCell(direction) && !types.includes(this.getCell(direction).type) ? true : false;
        }
    }

    checkEdge() { // returns which edge of the grid the tile is on. Used by clearTrunk()
        if (!this.getCell('up')) { return 'top' };
        if (!this.getCell('down')) { return 'bottom' };
        if (!this.getCell('left')) { return 'left' };
        if (!this.getCell('right')) { return 'right' };

        console.log('checkEdge error');
    }

    setDirection(edge) { // returns the direction perpendicular to the given edge. Used by clearTrunk()
        if (edge == 'top') { return 'down' };
        if (edge == 'bottom') { return 'up' };
        if (edge == 'right') { return 'left' };
        if (edge == 'left') { return 'right' };

        console.log('setDirection error');
    }

    getSides(direction) { // returns an array of tiles either side in relation to the given direction. Used by createBranches()
        return direction == 'up' || direction == 'down' ? ['left', 'right'] : ['up', 'down'];
    }

    // returns an array of existing surrounding cells
    // clunky - consider rewriting
    getValidSurroundingCells() {
        let surrounds = [
            this.getCell('up') ? this.getCell('up').getCell('left') : false,
            this.getCell('up'),
            this.getCell('up') ? this.getCell('up').getCell('right') : false,
            this.getCell('right'),
            this.getCell('down') ? this.getCell('down').getCell('right') : false,
            this.getCell('down'),
            this.getCell('down') ? this.getCell('down').getCell('left') : false,
            this.getCell('left')
        ];

        let validSurrounds = [];

        for (let i = 0; i < surrounds.length; i++) {
            if (surrounds[i]) {
                validSurrounds.push(surrounds[i]);
            }
        }
        return validSurrounds;
    }



    // ---=== behaviour ===--- //

    spreadLike(type, cannotReplace, speed) {
        // TODO: random spread, same type. Small chance of different type
        this.setType(type);
        let spread = setInterval(() => {
            if (this.canSpread(cannotReplace)) {
                let targetCell = this.getCell(this.randomDirection());
                if (targetCell && !targetCell.isType(cannotReplace)) {
                    targetCell.spreadLike(type, cannotReplace, speed);
                }
            } else {
                clearInterval(spread);
            }
        }, typeof(speed) == 'number' ? speed : this.tickSpeed);
    }

    clear() {
        this.clearTrunk(patternNum);
        patternNum++;
    }

    clearTrunk(patternIndex, direction) { // called without direction or index on origin, but with both otherwise
        let dir = !direction ? this.setDirection(this.checkEdge()) : direction;
        let targetCell = this.getCell(dir);

        this.setType(barren);
        
        let trunk = setInterval(() => {
            if (this.canSpread([barren], dir)) {
                targetCell.clearTrunk(patternIndex, dir);
                trunks[patternIndex]++;
            } else {
                clearInterval(trunk);
            }

            if (trunks[patternIndex] % 2) {
                    this.createBranches(dir);
                } else { // spreadLike(barren) - TODO: implement checking
                    let sides = this.getSides(dir);

                    for (let i = 0; i < sides.length; i++) {
                        let targetCell = this.getCell(sides[i]);
                        if (targetCell && targetCell.getType() !== barren) {
                            targetCell.spreadLike(barren, [barren]);
                            // targetCell.spreadLike(barren, [barren], this.tickSpeed * 5);
                        }
                    }
                }
        }, this.tickSpeed);
    }

    clearBranch(direction) {
        this.setType(barren);

        let targetCell = this.getCell(direction);

        let branch = setInterval(() => {
            if (this.canSpread([barren], direction)) {
                targetCell.clearBranch(direction);
            } else {
                clearInterval(branch);
            }
        }, this.tickSpeed);
    }

    createBranches(direction) {
        let sides = this.getSides(direction);

        if (this.canSpread([barren], direction)) {
            this.getCell(direction).clearTrunk(direction);
        }

        for (let i = 0; i < sides.length; i++) {
            let targetCell = this.getCell(sides[i]);
            if (targetCell && targetCell.getType() != barren) {
                targetCell.clearBranch(sides[i]);
            }
        }
    }

    placeTownCentre() {
        let tilesFromEdge = 2;

        let topLeft = this;
        let topRight = this.getCell('right');
        let bottomLeft = this.getCell('down');
        let bottomRight = this.getCell('right') ? this.getCell('right').getCell('down') : false;

        let gridWidth = this.parentElement.parentElement.getColNum();
        let gridHeight = this.parentElement.parentElement.getRowNum();

        let validPosition = this.x >= tilesFromEdge && this.y >= tilesFromEdge && this.x < (gridWidth - tilesFromEdge - 1) && this.y < (gridHeight - tilesFromEdge - 1);

        let edges;

        let pathNum = Math.floor(Math.random() * 2) + 2;

        // check valid position
        if (validPosition) {
            setTimeout(() => {
                this.setType(townCentre);
                topRight.setType(townCentre);
                bottomLeft.setType(townCentre);
                bottomRight.setType(townCentre);
            }, 10);

            edges = [
                {direction: 'up', options: [topRight.getCell('up'), topLeft.getCell('up')]},
                {direction: 'down', options: [bottomRight.getCell('down'), bottomLeft.getCell('down')]},
                {direction: 'left', options: [topLeft.getCell('left'), bottomLeft.getCell('left')]},
                {direction: 'right', options: [topRight.getCell('right'), bottomRight.getCell('right')]}
            ];

            // spawn paths
            setTimeout(() => {
                //
                for (let i = 0; i < pathNum; i++) {
                    let rand = Math.floor(Math.random() * edges.length);
                    let spawnEdge = edges.splice(rand, 1)[0];
                    let targetCell = spawnEdge.options[Math.floor(Math.random() * 2)];
    
                    targetCell.spreadPath(spawnEdge.direction);
                }
            }, 20);
            
            return true;
        } else {
            console.log(`invalid town centre position. x: ${this.x}, y: ${this.y}`);
            return false;
        }
    }

    spreadPath(direction) {
        this.setType(path);
        paths--;

        if (paths > 0) {
            // sets up valid new directions perpendicular to current direction
            let newDirections = ['up', 'down'].includes(direction) ? ['left', 'right'] : ['up', 'down'];
    
            // small chance of changing direction
            let cornerChance = Math.floor(Math.random() * 4);
            let newDirection = cornerChance == 0 ? newDirections[Math.floor(Math.random() * newDirections.length)] : direction;

            if (this.canSpread([path, townCentre, house], newDirection)) {
                this.getCell(newDirection).spreadPath(newDirection);
                
            }
        }

        // begin house spread surrounding all paths
        setTimeout(() => {
            if (this.canSpread([path, house, townCentre])) {
                let surrounds = this.getValidSurroundingCells();
        
                for (let i = 0; i < surrounds.length; i++) {
                    if (surrounds[i] && ![path, house, townCentre].includes(surrounds[i].type)) {
                        surrounds[i].spreadHouse(maxDistanceFromPath);
                    }
                }
            }

        }, 1000);
    }

    spreadHouse(chance) {
        setTimeout(() => {
        if (!this.isType([house, townCentre, path, forest])) { // whole function only runs if this is a valid tile
                if (chance == maxDistanceFromPath) { // only called on barren
                    this.setType(house);
                    this.getValidSurroundingCells().forEach(cell => cell.spreadHouse(chance - 1));
                } else if (chance > Math.floor((Math.random() * maxDistanceFromPath))) { //only called on barren
                    this.setType(house);
                    this.getValidSurroundingCells().forEach(cell => {
                        if (!cell.isType([forest, house, townCentre, path])) {
                            cell.spreadHouse(chance - 1);
                        }
                    });
                } else { // still only called on barren
                    // this.setType(forest);
                    this.spreadLike(forest, [forest, path, house, townCentre]);
                }
            }
            }, this.tickSpeed);
    }

    spreadCity(speed) {

        this.setType(city);
        maxCityTiles--;

        this.getValidSurroundingCells().forEach(cell => {
            setTimeout(() => {
                //
                if (maxCityTiles > 0) {
                    if (!cell.isType([city, forest])) {
                        cell.spreadCity(speed);
                    }
                }
                // } else {
                //     if (!cell.isType([city, forest])) {
                //         cell.spreadLike(forest, [city, forest]);
                //     }
                // }
            }, this.tickSpeed);
        });
    }

    // ---=== render ===--- //    

    connectedCallback() {
        // totalTiles = this.parentElement.parentElement.getRowNum() * this.parentElement.parentElement.getColNum();

        let imgOffsetX = Math.floor(Math.random() * 70) - 35;
        let imgOffsetY = Math.floor(Math.random() * 30) - 15;
        // let imgWidth = 100 + (Math.floor(Math.random() * 50) - 10);

        //separate to a function to only call for certain tiles
        this.classList.add('grow'); // TODO: only apply to some
        this.style.setProperty('--imgOffsetX', `${imgOffsetX}%`);
        this.style.setProperty('--imgOffsetY', `${imgOffsetY}%`);
        this.getType() === city ? this.style.setProperty('--imgWidth', '150%') : this.style.setProperty('--imgWidth', '100%');

        // !overlay ? overlay = this.parentElement.parentElement.overlay : console.log(overlay);
        // console.log(this.parentElement.parentElement.overlay);

    }
} customElements.define('grid-cell', GridCell);