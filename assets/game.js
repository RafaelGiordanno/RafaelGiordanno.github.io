/**
Essa bagunça tá aqui por motivos históricos
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

PIXI.loader.add('shader', 'assets/shader.frag').load(onLoaded);
app.stop();
var filter;
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

// var outlineFilter = new PIXI.filters.OutlineFilter(2, 0x99ffff);
var outlineFilter = new PIXI.filters.RGBSplitFilter([3, 5], [-3, -5], [0, 0]);

function onLoaded(loader, res) {
    filter = new PIXI.Filter(null, res.shader.data);
    bgGraphics.filters = [filter];
    app.start();
}

document.getElementById("game").appendChild(app.view);
var titleScreen = true;
var texture = PIXI.Texture.fromImage('assets/pattern.jpg');
var tilingSprite = new PIXI.extras.TilingSprite(texture, app.renderer.width, app.renderer.height);
tilingSprite.alpha = .17;

var gameTitleText = new PIXI.Text('TRINUM', titleFontStyle);
var gameTitleTextMiddle = new PIXI.Text('TRINUM', titleFontStyle);
var gameTitleTextFront = new PIXI.Text('TRINUM', titleFontStyle);
gameTitleTextFront.filters = [outlineFilter];
gameTitleText.x = 30; gameTitleText.y = -80;
gameTitleTextMiddle.x = 30; gameTitleTextMiddle.y = -80;
gameTitleTextFront.x = 30; gameTitleTextFront.y = -80;
var gameInstructions = new PIXI.Text('Touch the damn screen already!', 
                                     { fontFamily: 'Londrina Outline', fontSize: 26, fill: ['#ffffff', '#004277'], stroke: '#004277', strokeThickness: 2, });
gameInstructions.x = 4; gameInstructions.y = 420; gameInstructions.pivot.set(0.5, 0.5);
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
app.stage.addChild(bgGraphics);
// app.stage.addChild(tilingSprite);

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
// starsGraphics.lineStyle(1, 0xffffff, 1);
app.stage.addChild(starsGraphics);

app.ticker.add(function(delta) {
    // gameTitleText.x = 25 + Math.sin(globalPulse.pulse / 2) * 2;
    // outlineFilter.blue.x = Math.cos(delta * globalPulse.pulse) * 10;
    // outlineFilter.blue.y = Math.sin(globalPulse.pulse) * 10;
    var offsetY = -160;
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
    // gameInstructions.rotation = Math.sin(globalPulse.pulse);
    
    tilingSprite.tilePosition.x += delta;
    tilingSprite.tilePosition.y += delta;
    tilingSprite.tileTransform.rotation = (tilingSprite.tileTransform.rotation + delta * .01) % (Math.PI * 2);
    tilingSprite.tileTransform.skew.set((Math.cos(globalPulse.pulse / 4) + 1) / 4, (Math.sin(globalPulse.pulse / 4) + 1) / 4);
    globalZoom = Math.sin(globalPulse.pulse * .25) * .08;
    filter.uniforms.customUniform += 0.04 * delta;
    // filter.uniforms.customUniform = 0.5;
    
    fullspeedStars = 4;
    var len = stars.length;
    starsGraphics.clear();    
    starsGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    
    for (var i = 0; i < len; i++) {
        stars[i].y += (4 + stars[i].vo + fullspeedStars) * delta;
        if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * height * 1.5 - height / 2;
            stars[i].vo = Math.random() * 4;
        }
        sparkleStateTime += 0.0005 * delta;
        starsGraphics.beginFill(0xffffff, 0.125 + stars[i].vo / 8 + (Math.sin(sparkleStateTime) + 1) / 4);
        if (fullspeedStars > 0) {
            starsGraphics.drawRect(stars[i].x, stars[i].y - 13 - Math.random() * 10, 1, 12);
        }
        starsGraphics.drawCircle(stars[i].x, stars[i].y, 1 + Math.round(stars[i].vo) / 2);
        starsGraphics.endFill();
    }
    
    if (itsRotationTime) {
        if ((globalAngle > .23 && globalAngle < Math.PI - .23) || (globalAngle > Math.PI + .23 && globalAngle < Math.PI * 2 - .23)) {
            globalAngle +=.042 * delta;
        } else {
            globalAngle += .001 * delta;
        }
    } else {
        globalAngle = Math.sin(globalPulse.pulse * .125) * .0625;
    }
    // globalAngle += .006 * delta;
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
});

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
// shipGraphics.interactive = true;

shipGraphics.lineStyle(4, player.color, 1);
shipGraphics.drawCircle(player.x, player.y, player.r);
shipGraphics.beginFill(player.color, .125);
shipGraphics.drawCircle(player.x, player.y, player.r);
shipGraphics.endFill();

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

app.stage.addChild(shipGraphics);

// player movement and action
app.ticker.add(function(delta) {
    bgGraphics.clear();
    bgGraphics.beginFill(0x000723, 1);
    bgGraphics.drawRect(0, 0, width, height);
    bgGraphics.endFill();

    shipGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    if (player.touching && !titleScreen) {
        // movement code really
        // player.x = lerp(player.x, (player.pointerPosition.x) - (clamp(Math.sin(globalAngle), 0, 1) * player.pointerPosition.x) - Math.sin(globalAngle) * player.pointerPosition.y, .2);
        // player.x = (player.pointerPosition.x - player.pointerPosition.x * Math.sin(globalAngle) * Math.sign(Math.sin(globalAngle))) * Math.sign(Math.cos(globalAngle));
        
        player.x = lerp(player.x, player.pointerPosition.x * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * width, .17);
        player.y = lerp(player.y, player.pointerPosition.y * Math.cos(globalAngle) + Math.sin(globalAngle / 2) * height, .17);

        // player.x += Math.sin(globalAngle / 2) * width;
        
        // player.y = (player.pointerPosition.y * Math.cos(globalAngle) - Math.sin(globalAngle) * player.pointerPosition.x);
        // player.y = lerp(player.y, (player.pointerPosition.y), .2);
        /*
        if (globalAngle > Math.PI - .3 && globalAngle < Math.PI * 2 - .3) {
            player.x = lerp(player.x, width - (player.pointerPosition.x), .2);
            player.y = lerp(player.y, height - (player.pointerPosition.y), .2);
        } else {
            player.x = lerp(player.x, player.pointerPosition.x, .2); // lerp(player.x, player.pointerPosition.x - player.refPoint.x, .2);
            player.y = lerp(player.y, player.pointerPosition.y, .2); // lerp(player.y, player.pointerPosition.y - player.refPoint.y, .2);
        }
        */
        // player.x = clamp(player.x, player.r, width - player.r);
        // player.y = clamp(player.y, player.r, height - player.r);
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
    player.oscTimer += .2 * delta;
    // redrawing the ship
    shipGraphics.clear();
    shipGraphics.lineStyle(3 + Math.sin(player.oscTimer), player.color, 1);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2 + Math.sin(player.oscTimer) * 2);
    shipGraphics.drawCircle(player.x, player.y, player.r / 4 + Math.cos(player.oscTimer) * 2);
    // shipGraphics.moveTo(player.x - player.r - 4, player.y + player.r - 12);
    // shipGraphics.lineTo(player.x, player.y - player.r - 8);
    // shipGraphics.lineTo(player.x + player.r + 4, player.y + player.r - 12);
    shipGraphics.beginFill(player.color, .5);
    shipGraphics.drawCircle(player.x, player.y, player.r / 2);
    shipGraphics.arc(player.x, player.y + 4, player.r, -1, Math.PI + 1, false);
    shipGraphics.endFill();
    
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
            if (hit) {
                
            } else {
                shipGraphics.drawCircle(player.bullets[bi].x, player.bullets[bi].y, player.bullets[bi].r + Math.sin(player.oscTimer * 2) * 4);
            }
        }
    }
    
});

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
    this.color = 0xff1232
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
        
        // g.drawCircle(this.x, this.y, this.r + clamp(globalPulse.sinPulse * 2 , 0 , 2));
    };
}

app.ticker.add(function(delta) {
    var len = enemies.length;
    enemiesGraphics.setTransform(width / 2 + shakeOffset, height / 2 + shakeOffset, 1 + globalZoom, 1 + globalZoom, globalAngle, 0, 0, width / 2, height / 2);
    enemiesGraphics.clear();
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
            enemies[i].draw(enemiesGraphics);
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
            explosions[ei].draw(enemiesGraphics);
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
            shipGore[ei].draw(enemiesGraphics);
        }
    }
});

app.stage.addChild(enemiesGraphics);
app.stage.addChild(gameTitleText);
app.stage.addChild(gameTitleTextMiddle);
app.stage.addChild(gameTitleTextFront);
app.stage.addChild(gameInstructions);

// var foregroundGraphics = new PIXI.Graphics();
// app.stage.addChild(foregroundGraphics);

// helper math functions
function clamp(num, min, max) {
    return (num <= min) ? min : (num >= max ? max : num);
}
function lerp(a, b, t) {
    return (b - a) * t + a;
}
function overlaps(a, b) {
    return distance(a.x, a.y, b.x, b.y) <= (a.r + b.r);
}
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}
function arcctg(x) { return Math.PI / 2 - Math.atan(x); }

// t: time, b: beginning, _c: end, d: duration
function easeInQuad(t, b, _c, d) {
    var c = _c - b;
    return c * (t /= d) * t + b;
}

function easeInElastic(t, b, _c, d) {
    var c = _c - b;
    var a, p, s;
    s = 1.70158;
    p = 0;
    a = c;
    if (t === 0) {
      return b;
    } else if ((t /= d) === 1) {
      return b + c;
    }
    if (!p) {
      p = d * 0.3;
    }
    if (a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
}