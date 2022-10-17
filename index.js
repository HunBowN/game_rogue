const Game = function () {
    let field = $(".field");
    let fieldWidth = parseInt(field.css("width"));
    let fieldHeight = parseInt(field.css("height"));
    let tileSize = 50;
    let tileNumberHeight = fieldHeight / tileSize;
    let tileNumberWidth = fieldWidth / tileSize;
    let numberOfRooms = 5
    let enemiesArr = [];
    let numberOfEnemies = 10;
    let floorArr = [];
    let flasksArr = [];
    let numberOfFlasks = 10;
    let swordsArr = [];
    let numberOfSwords = 3;
    let intervalId = setInterval(enemyAgression, 1250);
    let hero;
    let maxHeroHealth = 100;

    let audio = new Audio();
    audio.src = 'music/1579196702_viktor_coy_sledi_za_soboy.mp3';
    audio.autoplay = false

    function playAudio() {
        document.querySelector('#audio').addEventListener('click', function (e) {
            if (e.target.value === 'Воспроизвести музыку') {
                e.target.value = 'Остановить';
                audio.play();
            } else {
                e.target.value = 'Воспроизвести музыку';
                audio.pause();
            }
        });
    }

    function showTextMessage(text) {
        let div = $('.start')
        div.css('visibility', 'visibile')
        div.append(text)
        div.css('top', fieldHeight / 2)
        div.css('left', fieldWidth / 2)
        div.on("click", function () {
            div.css('visibility', 'hidden')
            div.html('')
        })
    }

    // генератор случайных чисел
    function randomNumber(min, max) {
        const rand = Math.random() * (max - min) + min;
        return Math.floor(rand);
    }

    const Tile = function (row, col, className) {
        this.row = row;
        this.col = col;
        this.x = col * tileSize;
        this.y = row * tileSize;
        this.id = `${row} ${col}`;
        this.className = className;
    };

    const Hero = function (row, col) {
        this.row = row;
        this.col = col;
        this.x = col * tileSize;
        this.y = row * tileSize;
        this.id = `hero`;
        this.dom = null;
        this.className = "tileP";
        this.healthBarStyle = null;
        this.health = 100;
        this.damage = 25;
    };

    const Enemy = function (row, col) {
        this.row = row;
        this.col = col;
        this.x = col * tileSize;
        this.y = row * tileSize;
        this.id = `enemy`;
        this.dom = null;
        this.className = "tileE";
        this.healthBarStyle = null;
        this.health = 100;
        this.damage = 25;
        this.directionHorizontal = 1
        this.directionVertical = 1
    };

    const Flask = function (row, col) {
        this.row = row;
        this.col = col;
        this.x = col * tileSize;
        this.y = row * tileSize;
        this.id = `flask`;
        this.dom = null;
        this.className = 'tileHP'
        this.healing = 25;
    };

    const Sword = function (row, col) {
        this.row = row;
        this.col = col;
        this.x = col * tileSize;
        this.y = row * tileSize;
        this.id = `sword`;
        this.dom = null;
        this.className = 'tileSW'
        this.damageUp = 25;
    };

    function wallCreator() {
        for (let i = 0; i < tileNumberHeight; i++) {
            let addArray = [];

            for (let j = 0; j < tileNumberWidth; j++) {
                addArray.push(new Tile(i, j));
            }
            floorArr.push(addArray);
        }
    }

    function mapRender() {
        floorArr.map((innerArray) => {
            innerArray.map((item) => {
                field.append(
                    `<div class="${item.className}" style=" top: ${item.y}px; left: ${item.x}px"></div>`
                );
            });
        });
    }

    function drawRooms() {
        let colNumber = randomNumber(3, 8);
        let rowNumber = randomNumber(3, 8);
        let x = randomNumber(0, tileNumberHeight);
        let y = randomNumber(0, tileNumberWidth);

        const result = floorArr
            .flatMap((innerArray) => innerArray)
            .filter(function (e) {
                return e.className === "tile tileW";
            });

        for (let i = 0; i < colNumber; i++) {
            for (let j = 0; j < rowNumber; j++) {
                result.map((item) => {
                    if (item.id === `${x + j} ${y + i}`) {
                        item.className = "tile tile";
                    }
                });
            }
        }
    }

    function drawRoads() {
        let x = randomNumber(0, tileNumberHeight);
        let y = randomNumber(0, tileNumberWidth);

        for (let i = 0; i < tileNumberWidth; i++) {
            floorArr
                .flatMap((innerArray) => innerArray)
                .map((item) => {
                    if (item.id === `${x} ${i}`) {
                        item.className = "tile tile";
                    }
                });
            for (let j = 0; j < tileNumberHeight; j++) {
                floorArr
                    .flatMap((innerArray) => innerArray)
                    .map((item) => {
                        if (item.id === `${j} ${y}`) {
                            item.className = "tile tile";
                        }
                    });
            }
        }
    }

    function findRandomTile() {
        // находим все плитки пола из общего массива
        const result = floorArr.map((innerArray) =>
            innerArray.filter(function (e) {
                return e.className === "tile tile";
            })
        );
        // выбираем рандомную сроку (массив)
        let randomRowArr = result[randomNumber(0, result.length)];
        // выбераем рандомную плитку пола по рандомному айди результирующего массива
        let randomTile = randomRowArr[randomNumber(0, randomRowArr.length)];
        // создаем экземпляр героя присваиваю ему колонку и строку рандомной плитки пола
        return randomTile;
    }

    function createHero() {
        let randomTile = findRandomTile();
        let hero = new Hero(randomTile.row, randomTile.col);

        let xPos = hero.col * tileSize;
        let yPos = hero.row * tileSize;

        field.append(
            `<div class="tile tileP" style=" top: ${yPos}px; left: ${xPos}px"></div>`
        );
        hero.dom = $(`.tileP`);

        // health bar
        hero.dom.append(
            `<div class="health hero" style="width: ${hero.health}%;"></div>`
        );
        hero.healthBarStyle = $(`.health.hero`)[0].style;
        hero.healthBarStyle.width = `${hero.health}%`;
        return hero;
    }

    function createEnemy() {
        let randomTile = findRandomTile();
        let enemy = new Enemy(randomTile.row, randomTile.col);

        let xPos = enemy.col * tileSize;
        let yPos = enemy.row * tileSize;

        field.append(
            `<div class="tile tileE" style=" top: ${yPos}px; left: ${xPos}px"></div>`
        );
        enemy.dom = $(`.tileE`);

        return enemy;
    }

    function createEnemies() {
        for (let i = 0; i < numberOfEnemies; i++) {
            enemiesArr.push(createEnemy());
        }

        let enemy = $(`.tileE`);

        enemy.append('<div class="health enemy" style="width: 100%;"></div>');

        enemiesArr.map((enemy, i) => {
            enemy.healthBarStyle = $(`.health.enemy`)[i].style;
            enemy.healthBarStyle.width = `${enemy.health}%`;
        });
    }

    function createFlask() {
        let randomTile = findRandomTile();
        let flask = new Flask(randomTile.row, randomTile.col);

        let xPos = flask.col * tileSize;
        let yPos = flask.row * tileSize;

        field.append(
            `<div class="tile tileHP" style=" top: ${yPos}px; left: ${xPos}px"></div>`
        );
        flask.dom = $(`.tileHP`);

        return flask;
    }

    function createSword() {
        let randomTile = findRandomTile();
        let sword = new Sword(randomTile.row, randomTile.col);

        let xPos = sword.col * tileSize;
        let yPos = sword.row * tileSize;

        field.append(
            `<div class="tile tileSW" style=" top: ${yPos}px; left: ${xPos}px"></div>`
        );
        sword.dom = $(`.tileSW`);

        return sword;
    }

    var directions = {
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        32: "attack",
    };

    $("body").keydown(function (event) {
        let currX = hero.col * tileSize;
        let currY = hero.row * tileSize;

        let moveXNext = 0;
        let moveYNext = 0;

        if (directions[event.keyCode] === "right") {
            moveXNext = 1;
        }
        if (directions[event.keyCode] === "up") {
            moveYNext = -1;
        }
        if (directions[event.keyCode] === "left") {
            moveXNext = -1;
        }
        if (directions[event.keyCode] === "down") {
            moveYNext = 1;
        }

        let nextTileY = hero.row + moveYNext;
        let nextTileX = hero.col + moveXNext;
        let enemyCollision = false;
        nextTileY = Math.min(nextTileY, tileNumberHeight)
        nextTileX = Math.min(nextTileX, tileNumberWidth)

        enemyMove();
        enemiesArr.map(function (enemy, i) {
            if (nextTileY === enemy.row && nextTileX === enemy.col) {
                enemyCollision = true;
            }
        });

        if (typeof floorArr[nextTileY] != 'undefined') {
            if (typeof floorArr[nextTileY][nextTileX] != 'undefined') {
                if (floorArr[nextTileY][nextTileX].className === "tile tile" && !enemyCollision ) {
                    hero.dom.css("left", `${currX + moveXNext * tileSize}px`);
                    hero.dom.css("top", `${currY + moveYNext * tileSize}px`);
                    hero.col += moveXNext;
                    hero.row += moveYNext;
                }
            }
        }

        // насутпил на фласку
        if (hero.health < maxHeroHealth) {
            flasksArr.map(function (flask, i) {
                if (flask.row == hero.row && flask.col == hero.col) {
                    hero.health += flask.healing;
                    flask.dom[i].remove();
                    delete flasksArr[i];
                    hero.healthBarStyle.width = `${hero.health}%`;
                }
            });
        }

        // насутпил на меч
        swordsArr.map(function (sword, i) {
            if (sword.row == hero.row && sword.col == hero.col) {
                sword.dom[i].remove();
                delete swordsArr[i];
                hero.damage += sword.damageUp;
            }
        });

        //атака героя по врагам
        if (directions[event.keyCode] === "attack") {
            enemiesArr.map(function (enemy, i) {
                if (
                    (enemy.row == hero.row && enemy.col == hero.col - 1) ||
                    (enemy.row == hero.row && enemy.col == hero.col + 1) ||
                    (enemy.row == hero.row - 1 && enemy.col == hero.col) ||
                    (enemy.row == hero.row + 1 && enemy.col == hero.col)
                ) {
                    enemy.health -= hero.damage;
                    enemy.healthBarStyle.width = `${enemy.health}%`;
                    enemy.dom[i].style.opacity = 0.4;
                    enemy.dom[i].style.transform = "rotate(-45deg)";
                    setTimeout(() => {
                        enemy.dom[i].style.opacity = 1;
                        enemy.dom[i].style.transform = "none";
                    }, 250);
                }

                if (enemy.health <= 0) {
                    enemy.dom[i].remove();
                    delete enemiesArr[i];
                }
            });
        }

        let enemies = enemiesArr.filter(item => item)
        if (enemies.length === 0) {
            showTextMessage('You win!')
            setTimeout(() => { location.reload() }, 1000) // перезагрузка
        }
    });

    function enemyAgression() {
        enemiesArr.map(function (enemy, i) {
            if (
                (enemy.row == hero.row && enemy.col == hero.col - 1) ||
                (enemy.row == hero.row && enemy.col == hero.col + 1) ||
                (enemy.row == hero.row - 1 && enemy.col == hero.col) ||
                (enemy.row == hero.row + 1 && enemy.col == hero.col)
            ) {
                hero.health -= enemy.damage;
                hero.healthBarStyle.width = `${hero.health}%`;
                hero.dom[0].style.opacity = 0.4;
                hero.dom[0].style.transform = "rotate(-45deg)";
                setTimeout(() => {
                    hero.dom[0].style.opacity = 1;
                    hero.dom[0].style.transform = "none";
                }, 150);
            }
        });
        if (hero.health <= 0) {
            // alert(123)
            showTextMessage('You fail')
            setTimeout(() => { location.reload() }, 1000) // перезагрузка
        }
    }

    function enemyMove() {
        //находим все энеми
        enemiesArr.map(function (enemy, i) {
            let moveXNext = 1;
            let moveYNext = 1;

            const walls = floorArr
                .flatMap((innerArray) => innerArray)
                .filter(function (e) {
                    return e.className === "tile tileW";
                });

            let heroCollision = false;

            let wallCollisionRight = false;
            let wallCollisionLeft = false;
            let wallCollisionDown = false;
            let wallCollisionUp = false;

            let nextTileXRight = enemy.col + moveXNext;
            let nextTileXLeft = enemy.col - moveXNext;
            let nextTileYDown = enemy.row + moveYNext;
            let nextTileYUp = enemy.row - moveYNext;

            walls.map(function (wall, i) {
                if (wall.row === enemy.row && wall.col === nextTileXRight) {
                    wallCollisionRight = true;
                    enemy.directionHorizontal = -1
                }
                if (wall.row === enemy.row && wall.col === nextTileXLeft) {
                    wallCollisionLeft = true;
                    enemy.directionHorizontal = 1
                }
                if (wall.row === nextTileYDown && wall.col === enemy.col) {
                    wallCollisionDown = true;
                    enemy.directionVertical = -1
                }
                if (wall.row === nextTileYUp && wall.col === enemy.col) {
                    wallCollisionUp = true;
                    enemy.directionVertical = 1
                }
            });

            // столкновение с краями
            if (nextTileXRight == tileNumberWidth) {
                wallCollisionRight = true;
                enemy.directionHorizontal = -1
            }
            if (nextTileXLeft <= 0) {
                wallCollisionLeft = true;
                enemy.directionHorizontal = 1
            }
            if (nextTileYDown == tileNumberHeight) {
                wallCollisionDown = true;
                enemy.directionVertical = -1
            }
            if (nextTileYUp == 0) {
                wallCollisionUp = true;
                enemy.directionVertical = 1
            }

            //стокновение с героем
            if ((nextTileXRight == hero.col && enemy.row == hero.row) ||
                (nextTileXLeft == hero.col && enemy.row == hero.row) ||
                (nextTileYDown == hero.row && enemy.col == hero.col) ||
                (nextTileYUp == hero.row && enemy.col == hero.col)) {
                heroCollision = true;
            }

            if ((!wallCollisionRight && !heroCollision) || (!wallCollisionLeft && !heroCollision)) {
                enemy.col += enemy.directionHorizontal;
                enemy.dom[i].style.left = `${enemy.col * tileSize}px`;
            } else if ((!wallCollisionDown && !heroCollision) || (!wallCollisionUp && !heroCollision)) {
                enemy.row += enemy.directionVertical;
                enemy.dom[i].style.top = `${enemy.row * tileSize}px`;
            }
        });
    }

    this.startGame = function () {
        showTextMessage('Начать игру')
        playAudio()
        wallCreator();

        floorArr.map((innerArray) => {
            innerArray.map((item) => {
                item.className = "tile tileW";
            });
        });
        for (let i = 0; i < numberOfRooms; i++) {
            drawRooms();
        }
        for (let i = 0; i < numberOfRooms - 1; i++) {
            drawRoads();
        }

        hero = createHero();
        createEnemies();
        for (let i = 0; i < numberOfFlasks; i++) {
            flasksArr.push(createFlask());
        }
        for (let i = 0; i < numberOfSwords; i++) {
            swordsArr.push(createSword());
        }

        mapRender();

    };
};
