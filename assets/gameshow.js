/**
Ordem dos elementos:
- gráficos e gameplay básico
- efeitos sonoros (sfxr)
- menu básico
- estrelas no fundo (básico)
- naves com formato diferente
- estrelas paralaxe
- 
*/

var width = 320;
var height = 540;
var app = new PIXI.Application(width, height, { antialias: true, backgroundColor: 0x002342 });
var games = [];
var currentGameIndex = 0;

PIXI.loader.add('shader', '/assets/shader.frag').load(onLoaded);
app.stop();
var outlineFilter = new PIXI.filters.RGBSplitFilter([3, 5], [-3, -5], [0, 0]);
var filter;
function onLoaded(loader, res) {
    filter = new PIXI.Filter(null, res.shader.data);
    bgGraphics.filters = [filter];
    app.start();
    games.push(firstGame);
    games.push(secondGame);
    games.push(thirdGame);
    games.push(fourthGame);
    games.push(fifthGame);
    games.push(sixthGame);
    games.push(seventhGame);
    games.push(eighthGame);
    games.push(ninthGame);
    games.push(tenthGame);
    games.push(eleventhGame);
    games.push(twelfthGame);
    games.push(thirteenthGame);
    // games.push(Game);
    games.push(finalGame);
    reset();
    document.addEventListener("keyup", function(e) {
        if (e.keyCode == 49) { // 1 -> first
            currentGameIndex = 0;
            reset();
        } else if (e.keyCode == 48) { // 0 -> last
            currentGameIndex = games.length - 1;
            reset();
        } else if (e.keyCode == 81) { // q -> previous
            currentGameIndex = clamp(currentGameIndex - 1, 0, games.length - 1);
            reset();
        } else if (e.keyCode == 69) { // e -> next
            currentGameIndex = clamp(currentGameIndex + 1, 0, games.length - 1);
            reset();
        }
        document.getElementById("gameDescription").innerHTML = games[currentGameIndex].description;
        if (currentGameIndex == games.length - 1) {
            bgGraphics.filters[0].enabled = true;
        }
    });
}

var titleFontStyle = new PIXI.TextStyle({
    fontFamily: 'Londrina Outline',
    fontSize: 80,
    fill: ['#ffffff', '#004277'], // gradient
    stroke: '#004277',
    strokeThickness: 5,
    letterSpacing: 8,
    wordWrap: true,
    wordWrapWidth: 320
});

document.getElementById("game").appendChild(app.view);
var titleScreen = true;

var gameTitleText = new PIXI.Text('TRINUM', titleFontStyle);
var gameTitleTextMiddle = new PIXI.Text('TRINUM', titleFontStyle);
var gameTitleTextFront = new PIXI.Text('TRINUM', titleFontStyle);
gameTitleTextFront.filters = [outlineFilter];
gameTitleText.x = 30; gameTitleText.y = -80;
gameTitleTextMiddle.x = 30; gameTitleTextMiddle.y = -80;
gameTitleTextFront.x = 30; gameTitleTextFront.y = -80;
var gameInstructions = new PIXI.Text('Touch the damn screen already!', 
                                     { fontFamily: 'Londrina Outline', fontSize: 26, fill: ['#ffffff', '#004277'], stroke: '#004277', strokeThickness: 2, });
gameInstructions.x = 4; gameInstructions.y = height + 60;
gameInstructions.filters = [outlineFilter];

var itsRotationTime = false;
var globalAngle = 0;
var globalZoom = 0;
var shakeOffset = 0;
var globalPulse = new function() {
    this.pulse = 0;
    this.sinPulse = 0;
    this.cosPulse = 0;
    this.update = function(delta) {
        this.pulse += .1 * delta;
        this.sinPulse = Math.sin(this.pulse);
        this.cosPulse = Math.cos(this.pulse);
    };
};
// app.stage.interactive = true;
var bgGraphics = new PIXI.Graphics();
bgGraphics.interactive = true;
bgGraphics.lineStyle(0x002342);
bgGraphics.beginFill(0x002342, 1);
bgGraphics.drawRect(0, 0, width, height);
bgGraphics.endFill();

bgGraphics.pointerdown = function(pointerData) {
    player.touching = true;
    player.refPoint.x = pointerData.data.global.x - player.x;
    player.refPoint.y = pointerData.data.global.y - player.y;
    player.pointerPosition = pointerData.data.global;
    titleScreen = false;
}
bgGraphics.pointermove = function(pointerData) {
    player.pointerPosition = pointerData.data.global;
}
bgGraphics.pointerout = bgGraphics.pointerup = function(pointerData) {
    player.touching = false;
}

var stars = [];
var sparkleStateTime = 0;
var fullspeedStars = 0;
for (var i = 0; i < 90; i++) {
    stars.push({
        x: Math.random() * height,
        y : Math.random() * height,
        vo: Math.random() * 4,
    });
}
var starsGraphics = new PIXI.Graphics();

var player = {
    x: 160,
    y: 270,
    r: 24, 
    color: 0x004277,
    touching: false,
    refPoint : { x: 0, y: 0 },
    bulletTime: .5,
    bullets: [],
    oscTimer: 0
}

var shipGraphics = new PIXI.Graphics();
shipGraphics.filters = [outlineFilter];

var enemiesGraphics = new PIXI.Graphics();
enemiesGraphics.filters = [outlineFilter];
var enemyTypes = ["basic"]
var enemies = [];
var explosions = [];
var shipGore = [];
var currentWave = 0;

var ShipShutDown = function(_x, _y, _r) {
    this.x = _x;
    this.y = _y;
    this.r = _r;
    this.timer = 2;
    
    this.update = function(delta) {
        this.timer = clamp(this.timer - 0.06 * delta, 0, 2);
    };
    this.draw = function(g) {
        if (this.timer >= 0) {
            g.lineStyle(2, 0xffffff);
            g.beginFill(0xffffff, (2 - this.timer) / 2);
            g.drawCircle(this.x, this.y, easeInElastic(2 - this.timer, this.r, 2, 2));
            g.endFill();
        }
    };
}

var Explosion = function(ix, iy) {
    this.x = ix;
    this.y = iy;
    this.color = 0xdedede;
    this.timer = 1;
    this.targetTimer = 0;
    this.explosions = [
        { x: Math.floor(Math.random() * 32 - 16), y: Math.floor(Math.random() * 32 - 16), r: Math.floor(Math.random() * 32) },
        { x: Math.floor(Math.random() * 32 - 16), y: Math.floor(Math.random() * 32 - 16), r: Math.floor(Math.random() * 32) },
    ];
    this.explosionsLength = this.explosions.length;
    
    this.update = function(delta) {
        this.timer = clamp(this.timer - delta * 0.1, 0, 1);
        this.targetTimer = lerp(this.targetTimer, this.timer, .3);
        for (var i = 0; i < this.explosionsLength; i++) {
            this.explosions[i].y -= delta * .2;
            this.explosions[i].r = clamp(this.explosions[i].r, 0, 32);
        }
    };
    
    this.draw = function(g) {
        g.lineStyle(Math.floor(1 + Math.sin(this.timer * Math.PI) * 5), this.color);
        // g.beginFill(this.color);
        for (var i = 0; i < this.explosionsLength; i++) {
            // g.drawCircle(this.explosions[i].x + this.x, this.explosions[i].y + this.y, this.explosions[i].r);
            g.drawCircle(this.x + this.explosions[i].x, this.y, + this.explosions[i].y, this.explosions[i].r + (1 - this.timer) * 24);
            // g.drawCircle(80, 120, 40);
        }
        // g.endFill();
    };
}

var BasicEnemy = function(_x, _y) {
    this.x = _x;
    this.y = _y;
    this.r = 18;
    this.color = 0x00ff32
    this.dir = 1;
    this.hit = 0;
    this.deadTimer = -1;
    this.life = 7;
    
    this.update = function(delta) {
        if (this.y > height + 60) {
            this.dir = -1
        } else if (this.y < -60) {
            this.dir = 1;
        }
        
        this.y += 3 * delta * this.dir;
        this.hit = clamp(this.hit - .1 * delta, 0, 2);
    };
    this.draw = function(g) {
        g.lineStyle(4 + clamp(globalPulse.sinPulse * 2 , 0 , 2), Math.sin(this.hit * 10) > 0 ? 0xffffff : this.color, 1);
        g.moveTo(this.x - this.r * this.dir, this.y - this.r * this.dir);
        g.arc(this.x, this.y - this.r * this.dir, -this.r * this.dir, 0, Math.PI);
        g.drawPolygon(this.body);
        g.moveTo(this.x - this.r * this.dir, this.y - this.r * this.dir);
        g.lineTo(this.x, this.y + this.r * this.dir);
        g.lineTo(this.x + this.r * this.dir, this.y - this.r * this.dir);
        
        // g.drawCircle(this.x, this.y, this.r + clamp(globalPulse.sinPulse * 2 , 0 , 2));
    };
}

var SinEnemy = function(_x, _y, _offTimer) {
    this.x = _x;
    this.y = _y;
    this.r = 18;
    this.color = 0xaa8842;
    this.dir = 1;
    this.hit = 0;
    this.deadTimer = -1;
    this.life = 7;
    this.timer = _offTimer || 0;
    this.ix = _x;
    
    this.update = function(delta) {
        this.timer += delta * 0.05;
        if (this.y > height + 60) {
            this.dir = -1
        } else if (this.y < -60) {
            this.dir = 1;
        }
        
        this.x = this.ix + Math.sin(this.timer) * 40;
        this.y += 2 * delta * this.dir;
        this.hit = clamp(this.hit - .1 * delta, 0, 2);
    };
    this.draw = function(g) {
        g.lineStyle(4 + clamp(globalPulse.sinPulse * 2 , 0 , 2), Math.sin(this.hit * 10) > 0 ? 0xffffff : this.color, 1);
        g.moveTo(this.x - this.r * this.dir, this.y - this.r * this.dir);
        g.arc(this.x, this.y - this.r * this.dir, -this.r * this.dir, 0, Math.PI);
        g.drawPolygon(this.body);
        g.moveTo(this.x - this.r * this.dir, this.y - this.r * this.dir);
        g.lineTo(this.x, this.y + this.r * this.dir);
        g.lineTo(this.x + this.r * this.dir, this.y - this.r * this.dir);
        
        // g.drawCircle(this.x, this.y, this.r + clamp(globalPulse.sinPulse * 2 , 0 , 2));
    };
}

var SpiralEnemy = function(_angle) {
    this.x = 0;
    this.y = 0;
    this.r = 24;
    this.color = 0xa26512;
    this.dir = 1;
    this.hit = 0;
    this.deadTimer = -1;
    this.life = 7;
    this.angle = _angle;
    
    this.update = function(delta) {
        this.angle -= 0.05 * delta;
        this.timer += delta * 0.05;
        
        this.x = (1 + width * 0.0625 * this.angle) * Math.cos(this.angle) + width / 2;
        this.y = (1 + width * 0.0625 * this.angle) * Math.sin(this.angle) + height / 2;
        if (this.angle <= 0) {
            this.angle = 0;
            this.life = 0;
        }
        this.hit = clamp(this.hit - .1 * delta, 0, 2);
    };
    this.draw = function(g) {
        g.lineStyle(4 + clamp(globalPulse.sinPulse * 2 , 0 , 2), Math.sin(this.hit * 10) > 0 ? 0xffffff : this.color, 1);
        g.moveTo(this.x - this.r * this.dir, this.y - this.r * this.dir);
        g.drawCircle(this.x, this.y, this.r + globalPulse.sinPulse * 2);
        g.drawCircle(this.x, this.y, globalPulse.sinPulse * 2 + 8);
    };
}

function reset() {
    currentWave = 0;
    explosions = [];
    shipGore = [];
    enemies = [];
    player.x = 160;
    player.y = 270;
    globalPulse.pulse = 0;
    outlineFilter.red = [0, 0];
    outlineFilter.green = [0, 0];
    outlineFilter.blue = [0, 0];
    titleScreen = true;
    itsRotationTime = false;
    globalAngle = 0;
    globalZoom = 0;
    shakeOffset = 0;
    gameTitleText.x = 30; gameTitleText.y = -80; gameTitleText.skew.set(0, 0);
    gameTitleTextMiddle.x = 30; gameTitleTextMiddle.y = -80; gameTitleTextMiddle.skew.set(0, 0);
    gameTitleTextFront.x = 30; gameTitleTextFront.y = -80; gameTitleTextFront.skew.set(0, 0);
    gameInstructions.x = 4; gameInstructions.y = height + 60;
    bgGraphics.filters[0].enabled = false;
    bgGraphics.clear();
    shipGraphics.clear();
    enemiesGraphics.clear();
    starsGraphics.clear();
    // filter.enabled = false;
}

app.ticker.add(function(delta) {
    games[currentGameIndex].update(delta);
    games[currentGameIndex].draw();
});

var Game = function(d) {
    this.description = d;
    // reset();
    this.update = function(delta) {};
    this.draw = function() {};
}

// =======================
// FIRST GAME
// =======================

var firstGame = new Game("Um círculo que cria círculos, yay!");
firstGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
     // player movement and action
    if (player.touching && !titleScreen) {
        player.x = player.pointerPosition.x;
        player.y = player.pointerPosition.y;

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        }
    }
}

firstGame.draw = function() {
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
}

// =======================
// SECOND GAME Basic Enemy
// =======================
var secondGame = new Game("Desce, sobe...");
secondGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
     // player movement and action
    if (player.touching && !titleScreen) {
        player.x = player.pointerPosition.x;
        player.y = player.pointerPosition.y;

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    // enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    // explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    // shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        }
        else if (currentWave == 2) {
            currentWave = 1;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
}

secondGame.draw = function() {
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
    
    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
}

// =======================
// THIRD GAME Easing Player Movement
// =======================
var thirdGame = new Game("Suave na nave: interpolação linear");
thirdGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
     // player movement and action
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    // enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    // explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    // shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        }
        else if (currentWave == 2) {
            currentWave = 1;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
}

thirdGame.draw = function() {
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
    
    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
}

// =======================
// FOURTH GAME 
// =======================
var fourthGame = new Game("Agora sim, eu tô acertando!");
fourthGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
     // player movement and action
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    // explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    // shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        }
        else if (currentWave == 2) {
            currentWave = 1;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
}

fourthGame.draw = function() {
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
    
    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
}

// =======================
// FIFTH GAME Adding stars
// =======================
var fifthGame = new Game("Quanta profundidade tem esse jogo!");
fifthGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
     // player movement and action
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    // explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    // shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        }
        else if (currentWave == 2) {
            currentWave = 1;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
}

fifthGame.draw = function() {
    var slen = stars.length;
    starsGraphics.clear();    
    starsGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    
    for (var i = 0; i < slen; i++) {
        starsGraphics.beginFill(0xffffff, 0.125 + stars[i].vo / 8 + (Math.sin(sparkleStateTime) + 1) / 4);
        if (fullspeedStars > 0) {
            starsGraphics.drawRect(stars[i].x, stars[i].y - 13 - Math.random() * 10, 1, 12);
        }
        starsGraphics.drawCircle(stars[i].x, stars[i].y, 1 + Math.round(stars[i].vo) / 2);
        starsGraphics.endFill();
    }
    
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
    
    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
}

// =======================
// SIXTH GAME Bullets animation
// =======================
var sixthGame = new Game("Bala animada e redesign da nave");
sixthGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
    // player movement and action
    player.oscTimer += .2 * delta;
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    // explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    // shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        }
        else if (currentWave == 2) {
            currentWave = 1;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
}

sixthGame.draw = function() {
    var slen = stars.length;
    starsGraphics.clear();    
    starsGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    
    for (var i = 0; i < slen; i++) {
        starsGraphics.beginFill(0xffffff, 0.125 + stars[i].vo / 8 + (Math.sin(sparkleStateTime) + 1) / 4);
        if (fullspeedStars > 0) {
            starsGraphics.drawRect(stars[i].x, stars[i].y - 13 - Math.random() * 10, 1, 12);
        }
        starsGraphics.drawCircle(stars[i].x, stars[i].y, 1 + Math.round(stars[i].vo) / 2);
        starsGraphics.endFill();
    }
    
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2 + Math.sin(player.oscTimer) * 2);
    shipGraphics.drawCircle(player.x, player.y, player.r / 4 + Math.cos(player.oscTimer) * 2);

    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2);
    shipGraphics.arc(player.x, player.y + 4, player.r, -1, Math.PI + 1, false);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
    
    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
}

// =======================
// SEVENTH GAME Screenshake
// =======================
var seventhGame = new Game("Shake it, baby!");
seventhGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
    // player movement and action
    player.oscTimer += .2 * delta;
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        }
        else if (currentWave == 2) {
            currentWave = 1;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
    
    // updating and drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (explosions[ei].timer == 0) {
            explosions.splice(ei, 1);
            --ei; --exLen;
        } else {
            explosions[ei].update(delta);
        }
    }
}

seventhGame.draw = function() {
    var slen = stars.length;
    starsGraphics.clear();    
    starsGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    
    for (var i = 0; i < slen; i++) {
        starsGraphics.beginFill(0xffffff, 0.125 + stars[i].vo / 8 + (Math.sin(sparkleStateTime) + 1) / 4);
        if (fullspeedStars > 0) {
            starsGraphics.drawRect(stars[i].x, stars[i].y - 13 - Math.random() * 10, 1, 12);
        }
        starsGraphics.drawCircle(stars[i].x, stars[i].y, 1 + Math.round(stars[i].vo) / 2);
        starsGraphics.endFill();
    }
    
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2 + Math.sin(player.oscTimer) * 2);
    shipGraphics.drawCircle(player.x, player.y, player.r / 4 + Math.cos(player.oscTimer) * 2);

    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2);
    shipGraphics.arc(player.x, player.y + 4, player.r, -1, Math.PI + 1, false);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
    
    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
    // Drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        explosions[ei].draw(enemiesGraphics);
    }
}

// =======================
// EIGTH GAME Camera sway e zoom
// =======================
var eighthGame = new Game("Sway da câmera");
eighthGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
    globalZoom = Math.sin(globalPulse.pulse * .25) * .08;
    
    if (itsRotationTime) {
        if ((globalAngle > .23 && globalAngle < Math.PI - .23) || (globalAngle > Math.PI + .23 && globalAngle < Math.PI * 2 - .23)) {
            globalAngle +=.042 * delta;
        } else {
            globalAngle += .001 * delta;
        }
    } else {
        globalAngle = Math.sin(globalPulse.pulse * .125) * .0625;
    }
    if (globalAngle > Math.PI * 2) { globalAngle = 0; }
    
    globalPulse.update(delta);
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
    // player movement and action
    player.oscTimer += .2 * delta;
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        }
        else if (currentWave == 2) {
            currentWave = 1;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
    
    // updating and drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (explosions[ei].timer == 0) {
            explosions.splice(ei, 1);
            --ei; --exLen;
        } else {
            explosions[ei].update(delta);
        }
    }
}

eighthGame.draw = function() {
    var slen = stars.length;
    starsGraphics.clear();    
    starsGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    
    for (var i = 0; i < slen; i++) {
        starsGraphics.beginFill(0xffffff, 0.125 + stars[i].vo / 8 + (Math.sin(sparkleStateTime) + 1) / 4);
        if (fullspeedStars > 0) {
            starsGraphics.drawRect(stars[i].x, stars[i].y - 13 - Math.random() * 10, 1, 12);
        }
        starsGraphics.drawCircle(stars[i].x, stars[i].y, 1 + Math.round(stars[i].vo) / 2);
        starsGraphics.endFill();
    }
    
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2 + Math.sin(player.oscTimer) * 2);
    shipGraphics.drawCircle(player.x, player.y, player.r / 4 + Math.cos(player.oscTimer) * 2);

    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2);
    shipGraphics.arc(player.x, player.y + 4, player.r, -1, Math.PI + 1, false);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
    
    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
    // Drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        explosions[ei].draw(enemiesGraphics);
    }
}

// =======================
// NINTH GAME Ship explosions
// =======================
var ninthGame = new Game("Explosão!");
ninthGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
    globalZoom = Math.sin(globalPulse.pulse * .25) * .08;
    
    if (itsRotationTime) {
        if ((globalAngle > .23 && globalAngle < Math.PI - .23) || (globalAngle > Math.PI + .23 && globalAngle < Math.PI * 2 - .23)) {
            globalAngle +=.042 * delta;
        } else {
            globalAngle += .001 * delta;
        }
    } else {
        globalAngle = Math.sin(globalPulse.pulse * .125) * .0625;
    }
    if (globalAngle > Math.PI * 2) { globalAngle = 0; }
    
    globalPulse.update(delta);
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
    // player movement and action
    player.oscTimer += .2 * delta;
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        }
        else if (currentWave == 2) {
            currentWave = 1;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                shipGore.push(new ShipShutDown(enemies[i].x, enemies[i].y, enemies[i].r * 2));
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
    
    // updating and drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (explosions[ei].timer == 0) {
            explosions.splice(ei, 1);
            --ei; --exLen;
        } else {
            explosions[ei].update(delta);
        }
    }
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (shipGore[ei].timer == 0) {
            shipGore.splice(ei, 1);
            --ei; --exLen;
        } else {
            shipGore[ei].update(delta);
        }
    }
}

ninthGame.draw = function() {
    var slen = stars.length;
    starsGraphics.clear();    
    starsGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    
    for (var i = 0; i < slen; i++) {
        starsGraphics.beginFill(0xffffff, 0.125 + stars[i].vo / 8 + (Math.sin(sparkleStateTime) + 1) / 4);
        if (fullspeedStars > 0) {
            starsGraphics.drawRect(stars[i].x, stars[i].y - 13 - Math.random() * 10, 1, 12);
        }
        starsGraphics.drawCircle(stars[i].x, stars[i].y, 1 + Math.round(stars[i].vo) / 2);
        starsGraphics.endFill();
    }
    
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2 + Math.sin(player.oscTimer) * 2);
    shipGraphics.drawCircle(player.x, player.y, player.r / 4 + Math.cos(player.oscTimer) * 2);

    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2);
    shipGraphics.arc(player.x, player.y + 4, player.r, -1, Math.PI + 1, false);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
    
    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
    // Drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        explosions[ei].draw(enemiesGraphics);
    }
    // updating the gore
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        shipGore[ei].draw(enemiesGraphics);
    }
}

// =======================
// NINTH GAME Ship redesign and animation
// =======================
var tenthGame = new Game("Que tal um pouco de variação nos inimigos?");
tenthGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
    globalZoom = Math.sin(globalPulse.pulse * .25) * .08;
    
    if (itsRotationTime) {
        if ((globalAngle > .23 && globalAngle < Math.PI - .23) || (globalAngle > Math.PI + .23 && globalAngle < Math.PI * 2 - .23)) {
            globalAngle +=.042 * delta;
        } else {
            globalAngle += .001 * delta;
        }
    } else {
        globalAngle = Math.sin(globalPulse.pulse * .125) * .0625;
    }
    if (globalAngle > Math.PI * 2) { globalAngle = 0; }
    
    globalPulse.update(delta);
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
    // player movement and action
    player.oscTimer += .2 * delta;
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        } else if (currentWave == 2) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(width / 2, height + 160));
            enemies.push(new BasicEnemy(width - 40, -260));
        } else if (currentWave == 3) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(100, height + 60));
            enemies.push(new BasicEnemy(160, -160));
            enemies.push(new BasicEnemy(220, height + 160));
            enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 4) {
            // enemies.push(new BasicEnemy(40, -60));
            enemies.push(new SinEnemy(60, height + 60, 0));
            enemies.push(new SinEnemy(160, -160, Math.PI / 4));
            enemies.push(new SinEnemy(260, height + 160, Math.PI / 2));
            // enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 5) {
            enemies.push(new SinEnemy(80, -40, Math.PI / 2));
            enemies.push(new SinEnemy(140, -100, Math.PI / 4));
            enemies.push(new SinEnemy(200, -160, Math.PI / 8));
            enemies.push(new SinEnemy(260, -220, 0));
            // enemies.push(new SinEnemy(220, height + 160, Math.PI));
        } else if (currentWave == 6) {
            enemies.push(new SinEnemy(width / 2 + 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2, -200, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2, -280, Math.PI * 1.5));
            
            enemies.push(new SinEnemy(width / 2 + 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, height + 400, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, height + 400, Math.PI * 1.5));
        } else if (currentWave == 7) {
            for (i = 0; i < 27; i++) {
                enemies.push(new SpiralEnemy(20 + i * .5));
            }
        } else if (currentWave == 8) {
            currentWave = 7;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                shipGore.push(new ShipShutDown(enemies[i].x, enemies[i].y, enemies[i].r * 2));
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
    
    // updating and drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (explosions[ei].timer == 0) {
            explosions.splice(ei, 1);
            --ei; --exLen;
        } else {
            explosions[ei].update(delta);
        }
    }
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (shipGore[ei].timer == 0) {
            shipGore.splice(ei, 1);
            --ei; --exLen;
        } else {
            shipGore[ei].update(delta);
        }
    }
}

tenthGame.draw = function() {
    var slen = stars.length;
    starsGraphics.clear();    
    starsGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    
    for (var i = 0; i < slen; i++) {
        starsGraphics.beginFill(0xffffff, 0.125 + stars[i].vo / 8 + (Math.sin(sparkleStateTime) + 1) / 4);
        if (fullspeedStars > 0) {
            starsGraphics.drawRect(stars[i].x, stars[i].y - 13 - Math.random() * 10, 1, 12);
        }
        starsGraphics.drawCircle(stars[i].x, stars[i].y, 1 + Math.round(stars[i].vo) / 2);
        starsGraphics.endFill();
    }
    
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2 + Math.sin(player.oscTimer) * 2);
    shipGraphics.drawCircle(player.x, player.y, player.r / 4 + Math.cos(player.oscTimer) * 2);

    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2);
    shipGraphics.arc(player.x, player.y + 4, player.r, -1, Math.PI + 1, false);
    shipGraphics.endFill();
    
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }
    
    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
    // Drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        explosions[ei].draw(enemiesGraphics);
    }
    // updating the gore
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        shipGore[ei].draw(enemiesGraphics);
    }
}

// =======================
// ELEVENTH GAME Ship redesign and animation
// =======================
var eleventhGame = new Game("Agora sim, uma arma de verdade!");
eleventhGame.update = function(delta) {
    titleScreen = false;
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
    globalZoom = Math.sin(globalPulse.pulse * .25) * .08;
    
    if (itsRotationTime) {
        if ((globalAngle > .23 && globalAngle < Math.PI - .23) || (globalAngle > Math.PI + .23 && globalAngle < Math.PI * 2 - .23)) {
            globalAngle +=.042 * delta;
        } else {
            globalAngle += .001 * delta;
        }
    } else {
        globalAngle = Math.sin(globalPulse.pulse * .125) * .0625;
    }
    if (globalAngle > Math.PI * 2) { globalAngle = 0; }
    
    globalPulse.update(delta);
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
    // player movement and action
    player.oscTimer += .2 * delta;
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: .3 });
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: -.3 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        } else if (currentWave == 2) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(width / 2, height + 160));
            enemies.push(new BasicEnemy(width - 40, -260));
        } else if (currentWave == 3) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(100, height + 60));
            enemies.push(new BasicEnemy(160, -160));
            enemies.push(new BasicEnemy(220, height + 160));
            enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 4) {
            // enemies.push(new BasicEnemy(40, -60));
            enemies.push(new SinEnemy(60, height + 60, 0));
            enemies.push(new SinEnemy(160, -160, Math.PI / 4));
            enemies.push(new SinEnemy(260, height + 160, Math.PI / 2));
            // enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 5) {
            enemies.push(new SinEnemy(80, -40, Math.PI / 2));
            enemies.push(new SinEnemy(140, -100, Math.PI / 4));
            enemies.push(new SinEnemy(200, -160, Math.PI / 8));
            enemies.push(new SinEnemy(260, -220, 0));
            // enemies.push(new SinEnemy(220, height + 160, Math.PI));
        } else if (currentWave == 6) {
            enemies.push(new SinEnemy(width / 2 + 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2, -200, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2, -280, Math.PI * 1.5));
            
            enemies.push(new SinEnemy(width / 2 + 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, height + 400, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, height + 400, Math.PI * 1.5));
        } else if (currentWave == 7) {
            for (i = 0; i < 27; i++) {
                enemies.push(new SpiralEnemy(20 + i * .5));
            }
        } else if (currentWave == 8) {
            currentWave = 7;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                shipGore.push(new ShipShutDown(enemies[i].x, enemies[i].y, enemies[i].r * 2));
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
    
    // updating and drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (explosions[ei].timer == 0) {
            explosions.splice(ei, 1);
            --ei; --exLen;
        } else {
            explosions[ei].update(delta);
        }
    }
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (shipGore[ei].timer == 0) {
            shipGore.splice(ei, 1);
            --ei; --exLen;
        } else {
            shipGore[ei].update(delta);
        }
    }
}

eleventhGame.draw = function() {
    tenthGame.draw();
}

// =======================
// TWELFTH GAME Ship redesign and animation
// =======================
var twelfthGame = new Game("Mas que jogo é esse, mesmo?");
twelfthGame.update = function(delta) {
    var offsetY = -160;
    if (titleScreen) {
        offsetY = 0;
    }
    gameTitleText.y = 80 + offsetY;
    gameTitleTextMiddle.y = 80 + offsetY;
    gameTitleTextFront.y = 80 + offsetY;
    
    gameInstructions.y = 420 - offsetY;
    
    globalZoom = Math.sin(globalPulse.pulse * .25) * .08;
    
    if (itsRotationTime) {
        if ((globalAngle > .23 && globalAngle < Math.PI - .23) || (globalAngle > Math.PI + .23 && globalAngle < Math.PI * 2 - .23)) {
            globalAngle +=.042 * delta;
        } else {
            globalAngle += .001 * delta;
        }
    } else {
        globalAngle = Math.sin(globalPulse.pulse * .125) * .0625;
    }
    if (globalAngle > Math.PI * 2) { globalAngle = 0; }
    
    globalPulse.update(delta);
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
    // player movement and action
    player.oscTimer += .2 * delta;
    if (player.touching && !titleScreen) {
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: .3 });
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: -.3 });
        }
    } else if (titleScreen) {
        player.x = width / 2;
        player.y = height / 2;
    } else {
        player.bulletTime = .5;
    }
    
    var blen = player.bullets.length;
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
     // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
        } else if (currentWave == 2) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(width / 2, height + 160));
            enemies.push(new BasicEnemy(width - 40, -260));
        } else if (currentWave == 3) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(100, height + 60));
            enemies.push(new BasicEnemy(160, -160));
            enemies.push(new BasicEnemy(220, height + 160));
            enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 4) {
            // enemies.push(new BasicEnemy(40, -60));
            enemies.push(new SinEnemy(60, height + 60, 0));
            enemies.push(new SinEnemy(160, -160, Math.PI / 4));
            enemies.push(new SinEnemy(260, height + 160, Math.PI / 2));
            // enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 5) {
            enemies.push(new SinEnemy(80, -40, Math.PI / 2));
            enemies.push(new SinEnemy(140, -100, Math.PI / 4));
            enemies.push(new SinEnemy(200, -160, Math.PI / 8));
            enemies.push(new SinEnemy(260, -220, 0));
            // enemies.push(new SinEnemy(220, height + 160, Math.PI));
        } else if (currentWave == 6) {
            enemies.push(new SinEnemy(width / 2 + 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2, -200, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2, -280, Math.PI * 1.5));
            
            enemies.push(new SinEnemy(width / 2 + 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, height + 400, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, height + 400, Math.PI * 1.5));
        } else if (currentWave == 7) {
            for (i = 0; i < 27; i++) {
                enemies.push(new SpiralEnemy(20 + i * .5));
            }
        } else if (currentWave == 8) {
            currentWave = 7;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                shipGore.push(new ShipShutDown(enemies[i].x, enemies[i].y, enemies[i].r * 2));
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
    
    // updating and drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (explosions[ei].timer == 0) {
            explosions.splice(ei, 1);
            --ei; --exLen;
        } else {
            explosions[ei].update(delta);
        }
    }
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (shipGore[ei].timer == 0) {
            shipGore.splice(ei, 1);
            --ei; --exLen;
        } else {
            shipGore[ei].update(delta);
        }
    }
}

twelfthGame.draw = function() {
    tenthGame.draw();
}

// =======================
// THIRTEENTH GAME Ship redesign and animation
// =======================
var thirteenthGame = new Game("Tem como apresentar de um jeito melhor?");
thirteenthGame.update = function(delta) {
    var offsetY = -160;
    if (!bgGraphics.filters[0].enabled) { bgGraphics.filters[0].enabled = false; }
    if (titleScreen) {
        offsetY = 0;
    }
    
    gameTitleText.y = lerp(gameTitleText.y, 80 + offsetY, .19);
    gameTitleText.skew.set(Math.sin(globalPulse.pulse / 2) * 0.0625, Math.cos(globalPulse.pulse / 2) * 0.0625);
    gameTitleTextMiddle.x = gameTitleTextMiddle.x, 30 + Math.cos(globalPulse.pulse / 2) * 2;
    gameTitleTextMiddle.y = lerp(gameTitleTextMiddle.y, 80 + Math.sin(globalPulse.pulse / 2) + offsetY, .13);
    gameTitleTextMiddle.skew.set(Math.sin(globalPulse.pulse / 2) * 0.0625, Math.cos(globalPulse.pulse / 2) * 0.0625);
    gameTitleTextFront.x = 30 + Math.cos(globalPulse.pulse / 2) * 4;
    gameTitleTextFront.y = lerp(gameTitleTextFront.y, 80 + Math.sin(globalPulse.pulse / 2) * 3 + offsetY, .08);
    gameTitleTextFront.skew.set(Math.sin(globalPulse.pulse / 2) * 0.0625, Math.cos(globalPulse.pulse / 2) * 0.0625);
    
    gameInstructions.y = lerp(gameInstructions.y, 420 + Math.sin(globalPulse.pulse * 0.25) * 8 - offsetY, .1);

    globalZoom = Math.sin(globalPulse.pulse * .25) * .08;
    filter.uniforms.customUniform += 0.04 * delta;
    
    if (itsRotationTime) {
        if ((globalAngle > .23 && globalAngle < Math.PI - .23) || (globalAngle > Math.PI + .23 && globalAngle < Math.PI * 2 - .23)) {
            globalAngle +=.042 * delta;
        } else {
            globalAngle += .001 * delta;
        }
    } else {
        globalAngle = Math.sin(globalPulse.pulse * .125) * .0625;
    }
    if (globalAngle > Math.PI * 2) { globalAngle = 0; }
    
    globalPulse.update(delta);
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
    // player movement and action
    player.oscTimer += .2 * delta;
    if (player.touching && !titleScreen) {
        // movement code really
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: .3 });
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: -.3 });
        }
    } else if (titleScreen) {
        player.bulletTime = .5
        player.x = lerp(player.x, width / 2, .17);
        player.y = lerp(player.y, height / 2, .17);
    } else {
        player.bulletTime = .5;
    }
    
    // we update and draw the bullets on the same loop to save time
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    shakeOffset = lerp(shakeOffset, 0, .1);
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
    // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            itsRotationTime = false;
            globalAngle = 0;
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
            
        } else if (currentWave == 2) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(width / 2, height + 160));
            enemies.push(new BasicEnemy(width - 40, -260));
        } else if (currentWave == 3) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(100, height + 60));
            enemies.push(new BasicEnemy(160, -160));
            enemies.push(new BasicEnemy(220, height + 160));
            enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 4) {
            // enemies.push(new BasicEnemy(40, -60));
            enemies.push(new SinEnemy(60, height + 60, 0));
            enemies.push(new SinEnemy(160, -160, Math.PI / 4));
            enemies.push(new SinEnemy(260, height + 160, Math.PI / 2));
            // enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 5) {
            itsRotationTime = true;
            enemies.push(new SinEnemy(80, -40, Math.PI / 2));
            enemies.push(new SinEnemy(140, -100, Math.PI / 4));
            enemies.push(new SinEnemy(200, -160, Math.PI / 8));
            enemies.push(new SinEnemy(260, -220, 0));
            // enemies.push(new SinEnemy(220, height + 160, Math.PI));
        } else if (currentWave == 6) {
            enemies.push(new SinEnemy(width / 2 + 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2, -200, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2, -280, Math.PI * 1.5));
            
            enemies.push(new SinEnemy(width / 2 + 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, height + 400, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, height + 400, Math.PI * 1.5));
        } else if (currentWave == 7) {
            for (i = 0; i < 27; i++) {
                enemies.push(new SpiralEnemy(20 + i * .5));
            }
        } else if (currentWave == 8) {
            currentWave = 7;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                shipGore.push(new ShipShutDown(enemies[i].x, enemies[i].y, enemies[i].r * 2));
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
    // updating and drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (explosions[ei].timer == 0) {
            explosions.splice(ei, 1);
            --ei; --exLen;
        } else {
            explosions[ei].update(delta);
        }
    }
    // updating the ship destroyed pieces
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (shipGore[ei].timer == 0) {
            shipGore.splice(ei, 1);
            --ei; --exLen;
        } else {
            shipGore[ei].update(delta);
        }
    }
}

thirteenthGame.draw = function() {
    var slen = stars.length;
    starsGraphics.clear();    
    starsGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    
    for (var i = 0; i < slen; i++) {
        starsGraphics.beginFill(0xffffff, 0.125 + stars[i].vo / 8 + (Math.sin(sparkleStateTime) + 1) / 4);
        if (fullspeedStars > 0) {
            starsGraphics.drawRect(stars[i].x, stars[i].y - 13 - Math.random() * 10, 1, 12);
        }
        starsGraphics.drawCircle(stars[i].x, stars[i].y, 1 + Math.round(stars[i].vo) / 2);
        starsGraphics.endFill();
    }
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2 + Math.sin(player.oscTimer) * 2);
    shipGraphics.drawCircle(player.x, player.y, player.r / 4 + Math.cos(player.oscTimer) * 2);

    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2);
    shipGraphics.arc(player.x, player.y + 4, player.r, -1, Math.PI + 1, false);
    shipGraphics.endFill();
    
    // bullets drawing
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    shakeOffset = lerp(shakeOffset, 0, .1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }

    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
    // Drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        explosions[ei].draw(enemiesGraphics);
    }
    // updating the gore
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        shipGore[ei].draw(enemiesGraphics);
    }
}

// =======================
// THIRTEENTH GAME Ship redesign and animation
// =======================
/*
var thirteenthGame = new Game("");
thirteenthGame.update = function(delta) {
    
}

thirteenthGame.draw = function() {
    
}
*/

// =======================
// FINAL GAME FILTRO
// =======================
var finalGame = new Game("AWWWW YEAH!");
finalGame.update = function(delta) {
    var offsetY = -160;
    if (!bgGraphics.filters[0].enabled) { bgGraphics.filters[0].enabled = false; }
    if (titleScreen) {
        offsetY = 0;
    }
    
    gameTitleText.y = lerp(gameTitleText.y, 80 + offsetY, .19);
    gameTitleText.skew.set(Math.sin(globalPulse.pulse / 2) * 0.0625, Math.cos(globalPulse.pulse / 2) * 0.0625);
    gameTitleTextMiddle.x = gameTitleTextMiddle.x, 30 + Math.cos(globalPulse.pulse / 2) * 2;
    gameTitleTextMiddle.y = lerp(gameTitleTextMiddle.y, 80 + Math.sin(globalPulse.pulse / 2) + offsetY, .13);
    gameTitleTextMiddle.skew.set(Math.sin(globalPulse.pulse / 2) * 0.0625, Math.cos(globalPulse.pulse / 2) * 0.0625);
    gameTitleTextFront.x = 30 + Math.cos(globalPulse.pulse / 2) * 4;
    gameTitleTextFront.y = lerp(gameTitleTextFront.y, 80 + Math.sin(globalPulse.pulse / 2) * 3 + offsetY, .08);
    gameTitleTextFront.skew.set(Math.sin(globalPulse.pulse / 2) * 0.0625, Math.cos(globalPulse.pulse / 2) * 0.0625);
    
    gameInstructions.y = lerp(gameInstructions.y, 420 + Math.sin(globalPulse.pulse * 0.25) * 8 - offsetY, .1);

    globalZoom = Math.sin(globalPulse.pulse * .25) * .08;
    filter.uniforms.customUniform += 0.04 * delta;
    
    if (itsRotationTime) {
        if ((globalAngle > .23 && globalAngle < Math.PI - .23) || (globalAngle > Math.PI + .23 && globalAngle < Math.PI * 2 - .23)) {
            globalAngle +=.042 * delta;
        } else {
            globalAngle += .001 * delta;
        }
    } else {
        globalAngle = Math.sin(globalPulse.pulse * .125) * .0625;
    }
    if (globalAngle > Math.PI * 2) { globalAngle = 0; }
    
    globalPulse.update(delta);
    
    outlineFilter.red = [
        clamp(Math.cos(globalPulse.pulse) * 3 + shakeOffset * 2, -8, 8), 
        clamp(Math.sin(globalPulse.pulse) * 3 + shakeOffset * 2, -8, 8)
    ];
    outlineFilter.green = [
        clamp(globalPulse.sinPulse * 3 - shakeOffset * 2, -8, 8), 
        clamp(globalPulse.cosPulse * 3 - shakeOffset * 2, -8, 8)
    ];
    
    var slen = stars.length;
    fullspeedStars = 4;
    for (var i = 0; i < slen; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
    }
    
    // player movement and action
    player.oscTimer += .2 * delta;
    if (player.touching && !titleScreen) {
        // movement code really
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        if (player.x == player.r || player.x == width - player.r) {
            player.refPoint.x = player.pointerPosition.x - player.x;
        }
        if (player.y == player.r || player.y == height - player.r) {
            player.refPoint.y = player.pointerPosition.y - player.y;
        }
        // adding new bullets
        player.bulletTime -= .1 * delta;
        if (player.bulletTime <= 0) {
            player.bulletTime = .5;
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: 0 });
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: .3 });
            player.bullets.push({ x: player.x, y: player.y - player.r, r: 8, angle: -.3 });
        }
    } else if (titleScreen) {
        player.bulletTime = .5
        player.x = lerp(player.x, width / 2, .17);
        player.y = lerp(player.y, height / 2, .17);
    } else {
        player.bulletTime = .5;
    }
    
    // we update and draw the bullets on the same loop to save time
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    shakeOffset = lerp(shakeOffset, 0, .1);
    for (var bi = 0; bi < blen; bi++) {
        player.bullets[bi].x -= 9 * delta * Math.sin(player.bullets[bi].angle);
        player.bullets[bi].y -= 9 * delta;
        if (player.bullets[bi].y < 0) {
            player.bullets.splice(bi, 1);
            --bi; --blen;
        } else {
            var elen = enemies.length;
            var hit = false;
            
            for (var ei = 0; ei < elen; ei++) {
                if (overlaps(player.bullets[bi], enemies[ei])) {
                    enemies[ei].hit = 1;
                    --enemies[ei].life;
                    player.bullets.splice(bi, 1);
                    --bi; --blen;
                    hit = true;
                    explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
                    shakeOffset = Math.random() * 12;
                    break;
                }
            }
        }
    }
    
    // enemy stuff
    var len = enemies.length;
    if (len == 0 && !titleScreen) {
        currentWave++;
        if (currentWave == 1) {
            itsRotationTime = false;
            globalAngle = 0;
            enemies.push(new BasicEnemy(280, -20));
            enemies.push(new BasicEnemy(40, -20));
            
        } else if (currentWave == 2) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(width / 2, height + 160));
            enemies.push(new BasicEnemy(width - 40, -260));
        } else if (currentWave == 3) {
            enemies.push(new BasicEnemy(40, -60));
            enemies.push(new BasicEnemy(100, height + 60));
            enemies.push(new BasicEnemy(160, -160));
            enemies.push(new BasicEnemy(220, height + 160));
            enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 4) {
            // enemies.push(new BasicEnemy(40, -60));
            enemies.push(new SinEnemy(60, height + 60, 0));
            enemies.push(new SinEnemy(160, -160, Math.PI / 4));
            enemies.push(new SinEnemy(260, height + 160, Math.PI / 2));
            // enemies.push(new BasicEnemy(280, -260));
        } else if (currentWave == 5) {
            itsRotationTime = true;
            enemies.push(new SinEnemy(80, -40, Math.PI / 2));
            enemies.push(new SinEnemy(140, -100, Math.PI / 4));
            enemies.push(new SinEnemy(200, -160, Math.PI / 8));
            enemies.push(new SinEnemy(260, -220, 0));
            // enemies.push(new SinEnemy(220, height + 160, Math.PI));
        } else if (currentWave == 6) {
            enemies.push(new SinEnemy(width / 2 + 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, -40, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, -120, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2, -200, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2, -280, Math.PI * 1.5));
            
            enemies.push(new SinEnemy(width / 2 + 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 + 120, height + 400, Math.PI * 1.5));
            enemies.push(new SinEnemy(width / 2 - 120, height + 320, Math.PI / 2));
            enemies.push(new SinEnemy(width / 2 - 120, height + 400, Math.PI * 1.5));
        } else if (currentWave == 7) {
            for (i = 0; i < 27; i++) {
                enemies.push(new SpiralEnemy(20 + i * .5));
            }
        } else if (currentWave == 8) {
            currentWave = 7;
            // boss time?
        }
    } else {
        for (var i = 0; i < len; i++) {
            enemies[i].update(delta);
            if (enemies[i].life <= 0) {
                shipGore.push(new ShipShutDown(enemies[i].x, enemies[i].y, enemies[i].r * 2));
                enemies.splice(i, 1);
                --i; --len;
            }
        }
    }
    // updating and drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (explosions[ei].timer == 0) {
            explosions.splice(ei, 1);
            --ei; --exLen;
        } else {
            explosions[ei].update(delta);
        }
    }
    // updating the ship destroyed pieces
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        if (shipGore[ei].timer == 0) {
            shipGore.splice(ei, 1);
            --ei; --exLen;
        } else {
            shipGore[ei].update(delta);
        }
    }
}

finalGame.draw = function() {
    var slen = stars.length;
    starsGraphics.clear();    
    starsGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    
    for (var i = 0; i < slen; i++) {
        starsGraphics.beginFill(0xffffff, 0.125 + stars[i].vo / 8 + (Math.sin(sparkleStateTime) + 1) / 4);
        if (fullspeedStars > 0) {
            starsGraphics.drawRect(stars[i].x, stars[i].y - 13 - Math.random() * 10, 1, 12);
        }
        starsGraphics.drawCircle(stars[i].x, stars[i].y, 1 + Math.round(stars[i].vo) / 2);
        starsGraphics.endFill();
    }
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    // redrawing the ship
    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2 + Math.sin(player.oscTimer) * 2);
    shipGraphics.drawCircle(player.x, player.y, player.r / 4 + Math.cos(player.oscTimer) * 2);

    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2);
    shipGraphics.arc(player.x, player.y + 4, player.r, -1, Math.PI + 1, false);
    shipGraphics.endFill();
    
    // bullets drawing
    var blen = player.bullets.length;
    shipGraphics.lineStyle(2, 0xff8912, 1);
    shakeOffset = lerp(shakeOffset, 0, .1);
    for (var bi = 0; bi < blen; bi++) {
        shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
    }

    // enemies stuff
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
    
    if (len != 0 && !titleScreen) {
        for (var i = 0; i < len; i++) {
            enemies[i].draw(enemiesGraphics);
        }
    }
    // Drawing explosions
    var exLen = explosions.length;
    for (var ei = 0; ei < exLen; ei++) {
        explosions[ei].draw(enemiesGraphics);
    }
    // updating the gore
    exLen = shipGore.length;
    for (var ei = 0; ei < exLen; ei++) {
        shipGore[ei].draw(enemiesGraphics);
    }
}

app.stage.addChild(bgGraphics);
app.stage.addChild(starsGraphics);
app.stage.addChild(shipGraphics);
app.stage.addChild(enemiesGraphics);
app.stage.addChild(gameTitleText);
app.stage.addChild(gameTitleTextMiddle);
app.stage.addChild(gameTitleTextFront);
app.stage.addChild(gameInstructions);
