class GridContainer extends HTMLElement {
    constructor(future) {
        super();
        this.rows = this.getRowNum();
        this.cols = this.getColNum();
        this.future = this.getFuture();

        this.overlay = this.parentElement.querySelector('#overlay');
    }

    // ---=== utilities ===--- //

    getFuture() {
        return this.getAttribute('future');
    }

    getRowNum() {
        return this.getAttribute('rows') * 1;
    }

    getColNum() {
        return this.getAttribute('cols') * 1;
    }

    getRandomTile(numTiles, location) { // returns a random tile not within a certain number of tiles from a given location
        let attempt;
        let checkFailed;
        let checkFailed2;

        if (!numTiles) {
            return this.children[Math.floor(Math.random() * this.getRowNum())].children[Math.floor(Math.random() * this.getColNum())];
        }

        if (location === 'edge') {
            do {
                attempt = this.children[Math.floor(Math.random() * this.getRowNum())].children[Math.floor(Math.random() * this.getColNum())];
                checkFailed = (attempt.x < numTiles) || (attempt.x > this.getColNum() - numTiles) || (attempt.y < numTiles) || (attempt.y > this.getRowNum() - numTiles);
            } while (checkFailed);

            return attempt;
        } else  { // check against a specific tile. Assume location is a GridCell object AND ALSO THAT IT CAN'T BE NEAR AN EDGE
            do {
                attempt = this.children[Math.floor(Math.random() * this.getRowNum())].children[Math.floor(Math.random() * this.getColNum())];
                checkFailed = (attempt.x > location.x - numTiles) && (attempt.x < location.x + numTiles) && (attempt.y > location.y - numTiles) && (attempt.y < location.y + numTiles);
                checkFailed2 = (attempt.x < numTiles) || (attempt.x > this.getColNum() - numTiles) || (attempt.y < numTiles) || (attempt.y > this.getRowNum() - numTiles);
            } while (checkFailed || checkFailed2);
            return attempt;
        }

    }

    getRandomEdgeTile(edge) {
        if (edge == 'top') { return this.children[0].children[Math.floor(Math.random() * this.getColNum())]; }
        if (edge == 'bottom') { return this.children[this.getRowNum() - 1].children[Math.floor(Math.random() * this.getColNum())]; }
        if (edge == 'left') { return this.children[Math.floor(Math.random() * this.getRowNum())].children[0]; }
        if (edge == 'right') { return this.children[Math.floor(Math.random() * this.getRowNum())].children[this.getColNum() - 1]; }

        console.log('GetRandomEdgeTile error');
    }

    // ---=== futures ===--- //

    clearing() {
        // requires initial tile type to be forest
        // pick three random edge tiles

        setTimeout(() => {
            let tile1 = this.getRandomEdgeTile(['top', 'bottom'][Math.floor(Math.random() * 2)]);
            let tile2;
            let tile3;

            do {
                tile2 = this.getRandomEdgeTile(['left', 'right'][Math.floor(Math.random() * 2)]);
            } while (tile2 === tile1);

            do {
                tile3 = this.getRandomEdgeTile(['top', 'bottom', 'left', 'right'][Math.floor(Math.random() * 4)]);
            } while (tile3 === tile1 && tile3 === tile2);

            tile1.clear();
            tile2.clear();
            tile3.clear();
        }, 5000); // 10000 = tree growth duration - to allow forest to grow before clearing starts
    }

    reforest() {
        let tile1 = this.getRandomTile();
        let tile2;

        let tile3;
        let tile4;

        do {
            tile2 = this.getRandomTile();
        } while (tile2 === tile1);

        do {
            tile3 = this.getRandomEdgeTile('top');
        } while (tile3 === tile2 || tile3 === tile1);

        do {
            tile4 = this.getRandomEdgeTile('bottom');
        } while (tile4 === tile3 || tile4 === tile2 || tile4 === tile1);

        tile1.spreadCity(Math.floor(Math.random() * 1200 + 400));
        tile2.spreadCity(Math.floor(Math.random() * 1200 + 400));
        tile3.spreadLike(forest, [forest, city]);
        tile4.spreadLike(forest, [forest, city]);
    }

    oneWithForest() {
        let attempt1 = this.getRandomTile(4, 'edge');
        let attempt2 = this.getRandomTile(4, attempt1);
        let attempt3 = this.getRandomTile(4, attempt2);

        attempt1.placeTownCentre();
        attempt2.placeTownCentre();
        attempt3.placeTownCentre();
    }

    // ---=== render ===--- //

    renderGrid(defaultType) {
        for (let i = 0; i < this.rows; i++) {
            let newRow = document.createElement('div');
            newRow.classList.add('row');
            this.appendChild(newRow);

            for (let j = 0; j < this.cols; j++) {
                this.querySelectorAll('div.row')[i].appendChild(new GridCell(j, i, defaultType));
            }
        }
    }

    connectedCallback() {
        setTimeout(() => {
            // this.parentElement.querySelector('#fader').classList.remove('fadeAll');
            // console.log(this.parentElement.querySelector('#fader'));
            this.parentElement.querySelector('#fader').style.opacity = 0;
        }, 1000);

        if (this.future === 'reforest') {
            this.renderGrid(barren);
            this.reforest();
        } else if (this.future === 'deforest') {
            this.renderGrid(forest);
            this.clearing();
        } else if (this.future === 'harmony') {
            this.renderGrid(barren);
            this.oneWithForest();
        } else {
            console.log('check your future property', this.future);
        }




        // this.renderGrid(barren);
        // console.log(this.overlay);

        // this.getRandomEdgeTile('top').spreadLike(tree, [tree]);

        // this.clearing();
        // this.reforest();
        // this.oneWithForest();

        // this.getRandomTile();
    }
}
customElements.define('grid-container', GridContainer);

