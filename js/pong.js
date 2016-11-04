//Constants  and elements
var WIDTH     = 700, 
    HEIGHT    = 600, 
    pi        = Math.PI, 
    UpArrow   = 38,
    DownArrow = 40,
    canvas,
    ctx,
    keystate,
    player = {
        x: null,
        y: null,
        width:  20,
        height: 100,
        update: function() {
            // Update position of player with Up or Down keys
            if (keystate[UpArrow]) this.y -= 7;
            if (keystate[DownArrow]) this.y += 7;
            this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
        },
        draw: function() {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    },
    
// AI paddle
ai = {
	x: null,
	y: null,
	width:  20,
	height: 100,

	update: function() {
		var desty = ball.y - (this.height - ball.side)*0.5;
		this.y += (desty - this.y) * 0.1;
		this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
	},

	draw: function() {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
},
    
// Ball object
ball = {
	x:   null,
	y:   null,
	vel: null,
	side:  20,
	speed: 12,
    
    // Serves the ball towards the specified side
	serve: function(side) {
		var r = Math.random();
		this.x = side===1 ? player.x+player.width : ai.x - this.side;
		this.y = (HEIGHT - this.side)*r;
        // Calculate higher or lower on Y axis
		var phi = 0.1*pi*(1 - 2*r);
        // Set velocity
		this.vel = {
			x: side*this.speed*Math.cos(phi),
			y: this.speed*Math.sin(phi)
		}
	},
    
    // Update Ball position within canvas
	update: function() {
		this.x += this.vel.x;
		this.y += this.vel.y;
        
        // check for outside y direction and add offset
		if (0 > this.y || this.y+this.side > HEIGHT) {
			var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y+this.side);
			this.y += 2*offset;
			this.vel.y *= -1;
		}
        
        // Helper function to check intersection between 2 axis
		var AABBIntersect = function(ax, ay, aw, ah, bx, by, bw, bh) {
			return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
		};
        
        // Check for target paddle collision X
		var pdle = this.vel.x < 0 ? player : ai;
		if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height,
				this.x, this.y, this.side, this.side)
		) {	
			this.x = pdle===player ? player.x+player.width : ai.x - this.side;
			var n = (this.y+this.side - pdle.y)/(pdle.height+this.side);
			var phi = 0.25*pi*(2*n - 1); // pi/4 = 45
			var smash = Math.abs(phi) > 0.2*pi ? 1.5 : 1;
			this.vel.x = smash*(pdle===player ? 1 : -1)*this.speed*Math.cos(phi);
			this.vel.y = smash*this.speed*Math.sin(phi);
		}
        
        // Reset the ball in play when scored
		if (0 > this.x+this.side || this.x > WIDTH) {
			this.serve(pdle===player ? 1 : -1);
		}
	},

    // Draw Ball on canvas
	draw: function() {
		ctx.fillRect(this.x, this.y, this.side, this.side);
	}
};

// Start game
function main() {
	canvas = document.createElement("canvas");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx = canvas.getContext("2d");
	document.body.appendChild(canvas);
	keystate = {};
	// Track key presses for up or down
    document.addEventListener("keydown", function(evt) {
		keystate[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt) {
		delete keystate[evt.keyCode];
	});
    // Establish game objects
	init();
    
    // Loop game functions
	var loop = function() {
		update();
		draw();
		window.requestAnimationFrame(loop, canvas);
	};
	window.requestAnimationFrame(loop, canvas);
}

// Establish start positions of game objects
function init() {
	player.x = player.width;
	player.y = (HEIGHT - player.height)/2;
	ai.x = WIDTH - (player.width + ai.width);
	ai.y = (HEIGHT - ai.height)/2;
	ball.serve(1);
}

// Update objects
function update() {
	ball.update();
	player.update();
	ai.update();
}

// Clearing of canvas and draw all game objects with net
function draw() {
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.save();
	ctx.fillStyle = "#fff";
	ball.draw();
	player.draw();
	ai.draw();
	// Draw the net
	var w = 4;
	var x = (WIDTH - w)*0.5;
	var y = 0;
    // Net Segments
	var step = HEIGHT/20;
	while (y < HEIGHT) {
		ctx.fillRect(x, y+step*0.25, w, step*0.5);
		y += step;
	}
	ctx.restore();
}

    // Game Start and Run
    main();