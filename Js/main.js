const score = document.querySelector('.score'),
    start = document.querySelector('.start'),
    gameArea = document.querySelector('.gameArea'),
    car = document.createElement('div'),
    fps = document.querySelector('.fps'),
    time = document.querySelector('.time'),
    audio = document.querySelector('.audio');

const line1 = document.querySelector('#line1');
const line2 = document.querySelector('#line2');

const audioDrift = new Audio('music/tokyo-drift.mp3');
audioDrift.loop = true;
audioDrift.volume = 0.3;
const audioBoom = new Audio('music/boom.m4a');
audioBoom.loop = false;
audioBoom.volume = 0.3;


car.classList.add('car');
start.addEventListener('click', startGame);
document.addEventListener('keydown', startRun);
document.addEventListener('keyup', stopRun);

const keys = {
    ArrowLeft: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
}

const setting = {
    start: false,
    score: 0,
    startSpeed: 3,
    speed: 3,
    speedV: 4,
    traffic: 3
}

let lines;
let gameStopped = false;
let maxLength = Math.ceil(document.documentElement.clientHeight / 100) * 100;

function getQuantitiyElements(heightElement) {
    return document.documentElement.clientHeight / heightElement + 1;
}

let startTime;

audio.onclick = function(){
    if (audioDrift.paused) {
        
        audio.classList.remove('audioDisabled');
        audioDrift.play();
    }
    else {
        audio.classList.add('audioDisabled');
        audioDrift.pause();
    }
    console.log(audioDrift.played);
}

function startGame() {
    start.classList.add('hide');
    gameArea.classList.add('gameAreaShow');
    score.classList.add('scoreShow');
    fps.classList.add('fpsShow');
    time.classList.add('timeShow');
    audio.classList.add('audioShow');
    startTime = performance.now();
    !audio.classList.contains('audioDisabled') && audioDrift.play();
    gameArea.innerHTML = '';
    setting.score = 0;
    setting.speed = 3;
    
    for (let index = 0; index < getQuantitiyElements(100); index++) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.top = (index * 100) + 'px';
        line.y = index * 100;
        gameArea.appendChild(line);

    }

    let enemy;
    for (let index = 0; index < getQuantitiyElements(100 * setting.traffic); index++) {
        enemy = document.createElement('div');
        enemy.classList.add('enemy');
        enemy.y = -100 * setting.traffic * (index + 1);
        enemy.x = Math.floor((Math.random() * (gameArea.offsetWidth - 50)));
        enemy.style.left = enemy.x + 'px';
        enemy.gs = Math.random() - 0.5;
        enemy.style.top = enemy.y + 'px';
        gameArea.append(enemy);
    }
    enemy.classList.add('bonus');
    
    setting.start = true;
    gameArea.appendChild(car);
    car.style.left = '125px';
    car.style.bottom = '100px';
    car.style.top = 'auto';
    
    setting.x = car.offsetLeft;
    setting.y = car.offsetTop;
    lines = Array.from(document.querySelectorAll('.line'));
    setting.lastUpdate = performance.now();
    setting.fps = 0;
    /*
    car.enemies = gameArea.querySelectorAll('.enemy');
    car.enemyTarget = car.enemies[0];
    car.enemyInd = 0;
    car.ds = car.getBoundingClientRect().bottom - car.enemyTarget.y;
    calcCoords(car.enemyTarget.getBoundingClientRect(), car.enemyTarget, gameArea.offsetWidth - car.offsetWidth);
    */
    requestAnimationFrame(playGame);
}

function playGame() {
    if (setting.start) {

        let timeFromStart = performance.now() - startTime;
        
        let sec = '' + Math.floor(timeFromStart / 1000) % 60;
        sec = '0'.repeat(2 - sec.length) + sec;

        let min = '' + Math.floor(timeFromStart / 1000 / 60);
        min = '0'.repeat(2 - min.length) + min;

        time.textContent = `${min}.${sec}`;
        setting.fps++;
        score.innerHTML = 'SCORE<br>' + Math.floor(setting.score);

        setting.score += setting.startSpeed / 10;
        moveRoad();
        moveEnemy();
        let x = 0;
        let y = 0; 
        if (keys.ArrowLeft) {
            x -= setting.speedV;
        }
        if (keys.ArrowRight) {
            x += setting.speedV;
        }
        if (keys.ArrowUp) {
            y -= setting.speed;
        }
        if (keys.ArrowDown) {
            y += setting.speed;
        }
        /*
        if (!x) {
            let d = car.needX - setting.x;
            if (d > setting.speedV) {
                x = setting.speedV;
            } else if (d < -setting.speedV) {
                x = -setting.speedV;
            } else {
                x = d;
            }
        }
        */
        setting.x += x;
        setting.y += y;

        if (setting.x < 0) {
            setting.x = 0;
        }
        else if(setting.x > (gameArea.offsetWidth - car.offsetWidth)) {
            setting.x = (gameArea.offsetWidth - car.offsetWidth);
        }
        if (setting.y < 0) {
            setting.y = 0;
        }
        else if(setting.y > (gameArea.offsetHeight - car.offsetHeight)) {
            setting.y = (gameArea.offsetHeight - car.offsetHeight);
        }
        
        car.style.left = setting.x + 'px';
        car.style.top = setting.y + 'px';
        
        let deltaTime = performance.now() - setting.lastUpdate;
        if (deltaTime >= 1000) {
            setting.lastUpdate += deltaTime;
            fps.textContent = 'FPS: ' + setting.fps;
            setting.fps = 0;
        }
        if (!gameStopped) setTimeout(playGame);

        //Проверка полос дороги
        let result = true;
        let delt;
        lines.reduce((prev, curr) => {
            delt = curr.y - prev.y;
            if (delt != 100 && delt >= 0) {
                result = false;
            }
            return curr;
        });
        delt = lines[0].y - lines[lines.length - 1].y;
        if (delt != 100 && delt >= 0) {
            result = false;
        }

        //увиличение сложности
        let difficulty = setting.score / 1000;
        setting.speed = setting.startSpeed + difficulty;

    }
}

function stopRun(event) {
    event.preventDefault();
    keys[event.key] = false;
}

function startRun(event) {
    keys[event.key] = true;
}

function moveRoad() {
    lines.forEach(function(line) {
        line.y += setting.speed;
        line.style.top = line.y + 'px';

        if (line.y > maxLength) {
            line.y -= maxLength + 100;
        }
    });
}
/*
function getX(t, x, s, w) {
    let delt = s * t;
    if ((((delt + x) / w) ^ 0) % 2 == 0) {
        return Math.abs(x + delt) % w;
    } else {
        return w - Math.abs((delt + x) % w);
    }
}
*/
function moveEnemy() {
    let enemy = document.querySelectorAll('.enemy');
    enemy.forEach(function(item) {
        let carRect = car.getBoundingClientRect();
        let enemyRect = item.getBoundingClientRect();
        if (carRect.top <= enemyRect.bottom && carRect.right >= enemyRect.left &&
            carRect.left <= enemyRect.right && carRect.bottom >= enemyRect.top) {
            if (!item.classList.contains('bonus')) {
                setting.start = false;
                console.log('ДТП');
                start.classList.remove('hide');
                audioDrift.pause();
                audioBoom.play();
                score.style.top = start.offsetHeight;
            } else {
                setting.score += 150;
                item.hidden = true;
                
               // bonus(document.documentElement.offsetWidth/2 - 25, 35, '+150');
               bonus(enemyRect.left, enemyRect.top, '+150');
            }
        }

        let rightEdge = gameArea.offsetWidth - item.offsetWidth;
/*
        if (item == car.enemyTarget) {
            car.ds = carRect.bottom - item.y
            if (car.needCalc) {
                calcCoords(enemyRect, item, rightEdge);
            }
            if (car.ds <= 0) {
                car.enemyInd = (car.enemyInd + 1) % car.enemies.length;
                car.enemyTarget = car.enemies[car.enemyInd];
                car.needCalc = true;
            }
        }
*/
        item.y += setting.speed / 2;
        item.style.top = item.y + 'px';
        item.x += item.gs;
        if (item.x < 0) {
            item.x = 0;
            item.gs *= -1;
        } else if (item.x > rightEdge) {
            item.x = rightEdge;
            item.gs *= -1;
        }

        item.style.left = item.x + 'px';
        if (item.y >= 1.5 * document.documentElement.clientHeight) {
            item.y = -100 * setting.traffic;
            item.x = Math.floor((Math.random() * (gameArea.offsetWidth - 50)));
            item.style.left = item.x + 'px';
            item.gs = Math.random() - .5;
            if (item.classList.contains('bonus')) {
                item.hidden = false;
            }
        }
    });
}
/* искусственный интеллект

function calcCoords(enemyRect, item, rightEdge) {
    car.t1 = getT(setting.y - enemyRect.bottom);
    car.t2 = getT(car.ds);
    let gaRect = gameArea.getBoundingClientRect();
    let x1 = getX(car.t1, enemyRect.left - gaRect.left, item.gs, rightEdge);
    let x2 = getX(car.t2, enemyRect.left - gaRect.left, item.gs, rightEdge);
    car.x1 = Math.min(x1, x2) - car.offsetWidth - 50;
    car.x2 = Math.max(x1, x2) + car.offsetWidth + 50;
    line1.style.left = car.x1 + gaRect.left + 'px';
    line2.style.left = car.x2 + gaRect.left + 'px';
    if (item.classList.contains('bonus')) {
        car.needX = (car.x1 + car.x2) / 2;
    } else {
        if ((setting.x < car.x2) && (setting.x > car.x1)) {
            if (Math.abs(car.x1 - setting.x) < Math.abs(car.x2 - setting.x)) {
                if (car.x1 < 0) {
                    car.needX = car.x2;
                } else {
                    car.needX = car.x1;
                }
            } else {
                if (car.x2 > rightEdge) {
                    car.needX = car.x1;
                } else {
                    car.needX = car.x2;
                }
            }
        } else {
            car.needX = setting.x;
        }
    }
    console.log(car.needX);
    car.needCalc = false;
}

function getT(s) {
    let a = setting.startSpeed / 2e4;
    let b = setting.speed;
    let c = -s;
    return (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a;
}
*/

function bonus(x, y, val) {
    if (!bonus.div) {
        bonus.div = document.createElement('div');
        let style = bonus.div.style;
        style.position = 'absolute';
        style.color = 'lime';
        style.fontSize = 'xx-large';
        style.fontWeight = 900;
        style.zIndex = 250;
        document.body.append(bonus.div);
    }

    let style = bonus.div.style;
    style.left = x + 'px';
    style.top = y + 'px';
    bonus.div.textContent = val;
    bonus.div.hidden = false;

    bonus.div.animate([
        {
            opacity: 1,
            top: y + 'px'
        },
        {
            opacity: 0,
            top: y - 40 + 'px'
        }
    ], 800).onfinish = () => {
        bonus.div.hidden = true;
    };
}