/* global PIXI */
const width = 16 * 40;

const height = 9 * 40;
const ratio = width / height;
const options = {
	backgroundColor: 0x330694,
	antialias: false,
	// clearBeforeRender: true,
};
const containerDiv = document.getElementById("game_canvas");
// containerDiv.style.width = "90%";

const app = new PIXI.Application(width, height, options);

containerDiv.appendChild(app.view);

window.addEventListener("keydown",
    function(e){
        switch(e.keyCode){
            case 37: case 39: case 38:  case 40: // Arrow keys
            case 32: e.preventDefault(); break; // Space
            default: break; // do not block other keys
        }
    },
false);

// ======= input handling
var Input = function(mappedKeys) {
	this._pressed = {};
	
	this.LEFT = mappedKeys["left"];
	this.RIGHT = mappedKeys["right"];
	this.UP = mappedKeys["up"];
	this.DOWN = mappedKeys["down"];
	
	this.isDown = function(keyCode) {
		return this._pressed[keyCode];
	}
	
	this.onKeydown = function(event) {
		this._pressed[event.keyCode] = true;
	}
	
	this.onKeyup = function(event) {
		this._pressed[event.keyCode] = false;
	}
}

// var Keys = new Input({left: 37, up: 38, right: 39, down: 40});
// window.addEventListener('keyup', function(event) { Keys.onKeyup(event); }, false);
// window.addEventListener('keydown', function(event) { Keys.onKeydown(event); }, false);

var playerKeys = new Input({left: 65, up: 87, right: 68, down: 83});
window.addEventListener('keyup', function(event)   { playerKeys.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { playerKeys.onKeydown(event); }, false);

app.stage.scale.set(4, 4);
app.stage.pivot.set(app.stage.width * 0.5, app.stage.height * 0.5);

// end of input handling helper functions =======
var camera = new PIXI.Container();

camera.scale.set(1, 1);
camera.stateTime = 0;
app.stage.addChild(camera);

const TILESIZE = 10;

var grid = new PIXI.Graphics();
grid.map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
grid.lineStyle(1, 0x00cc00, 0.5);
grid.beginFill(0x00dd00, 0.32);
for (var x = 0; x < grid.map.length; x++) {
    for (var y = 0; y < grid.map[0].length; y++) {
        if (grid.map[x][y] == 1)
            grid.drawRect(y * TILESIZE, x * TILESIZE, TILESIZE, TILESIZE);
    }
}
camera.addChild(grid);

camera.pivot.set(camera.width * 0.125, camera.height * 0.125);
camera.x += camera.width * 0.125;
camera.y += camera.height * 0.125;
// camera.y += camera.height * 0.25;

// var g = new PIXI.Graphics();
// g.beginFill(0x00ffff);
// g.drawRect(0, 0, 100, 100);
// g.endFill();
// g.rotation = 1;
// g.pivot.set(g.width / 2, g.height / 2);
// camera.addChild(g);


var player = PIXI.Sprite.fromImage('/assets/arena/devil.png');
player.pos = { x: 70, y: -40 };
player.vel = { x: 0, y: 0 };
player.anchor.set(0.5, 0.5);
player.scale.set(0.125, 0.125);
player.debugRect = new PIXI.Graphics();
player.debugRect.lineStyle(1, 0x00ff00, 1);
console.log(player.width, player.height);
player.debugRect.drawRect(2, 2, player.width, player.height);
player.debugRect.pivot.set(0.5, 0.5);

camera.addChild(player);
camera.addChild(player.debugRect);

player.addChild(new PIXI.Text(''));
player.getChildAt(0).x = 60;
player.getChildAt(0).y = -50;

var game = {};
game.debug = true;
game.imul = 0.84;

game.update = function(delta) {
	this.handleInput(player, playerKeys, delta);
	this.handleCollisions(player);
	this.updateEntity(player);
	if (this.debug) {
		this.updateDebugInfo(player.getChildAt(0), player);
	}
}
game.handleInput = function(ent, keys, delta, mx, my) {
    mx = mx || 2;
    my = my || 2;
	if (keys.isDown(keys.UP)) {
		ent.vel.y += delta * this.imul;
	} else if (keys.isDown(keys.DOWN)) {
		ent.vel.y -= delta * this.imul;
	} else {
	    ent.vel.y = math.lerp(ent.vel.y, 0, 0.4);
	}
	if (keys.isDown(keys.LEFT)) {
		ent.vel.x -= delta * this.imul;
	} else if (keys.isDown(keys.RIGHT)) {
		ent.vel.x += delta * this.imul;
	} else {
	    ent.vel.x = math.lerp(ent.vel.x, 0, 0.4);
	}
	ent.vel.x = math.clamp(ent.vel.x, -mx, mx);
	ent.vel.y = math.clamp(ent.vel.y, -my, my);
}
game.handleCollisions = function(ent) {
    var ebx = Math.floor((ent.pos.x + ent.vel.x) / TILESIZE)
    var eby = Math.floor((ent.pos.y + ent.vel.y) / TILESIZE)  * -1;
    if (grid.map[eby][ebx] == 1) {
        ent.vel.y = 0;
        ent.pos.y = eby * -(TILESIZE - 1.16);
    }
}
game.updateEntity = function(ent) {
    ent.pos.x += ent.vel.x;
    ent.pos.y += ent.vel.y;
    ent.x = (ent.pos.x) * 1; // ppu;
	ent.y = (ent.pos.y) * -1; // ppu * -1;
	if (ent.debugRect) {
	    ent.debugRect.x = ent.x - ent.debugRect.width * 0.5;
	    ent.debugRect.y = ent.y - ent.debugRect.height * 0.5;
	}
}


game.updateDebugInfo = function(text, pos) {
	text.text = "x: " + pos.x.toFixed(1) + " y: " + pos.y.toFixed(1);
}

// Listen for animate update
app.ticker.add(function(delta) {
	// just for fun, let's rotate mr rabbit a little
	// delta is 1 if running at 100% performance
	// creates frame-independent transformation
	// g.rotation += delta * 0.01;
	camera.stateTime += delta * 0.01;
	// app.stage.scale.set(4 + Math.sin(camera.stateTime) * 0.5, 4 + Math.sin(camera.stateTime) * 0.5);
	game.update(delta);
});

function resize() {
	if (window.innerWidth / window.innerHeight >= ratio) {
		var w = window.innerHeight * ratio;
		var h = window.innerHeight;
	}
	else {
		var w = window.innerWidth;
		var h = window.innerWidth / ratio;
	}

	app.view.style.width = "92%";
	// app.view.style.width = w + 'px';
	// app.view.style.height = h + 'px';
}

window.onresize = function(event) {
	// resize();
};

const math = {
    clamp: function(x, min, max) {
      return x < min && min || (x > max && max || x);
    },
    lerp: function(a, b, amount) {
      return a + (b - a) * this.clamp(amount, 0, 1);
    }
};