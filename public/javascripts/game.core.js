// the player class
var game_player = function(player, starting_x, starting_y) {
  // Set default values
  player.speed = 256;
  // player.x = 32 + (Math.random() * (canvas.width - 64));
  // player.y =  32 + (Math.random() * (canvas.height - 64));
  // if no starting cords provided assume 0, 0
  starting_x = starting_x || 0;
  starting_y = starting_y || 0;
  player.x = starting_x;
  player.y = starting_y;

  player.width = 30;
  player.height = 30;
  player.player_ready = false;
  player.player_image = new Image();

  // Load image
  player.player_image.onload = function() {
    player.player_ready = true;
  };
  player.player_image.src = "/images/" + player.color + "_player.png";

  return player;
}

// the game core class
var game_core = function(username, on_server) {
  //instance variables
  this.canvas = $("canvas")[0];
  this.movements = {};
  this.players = {};
  this.on_server = on_server;

  this.world {
    width: 720,
    height: 480
  }

  if(!on_server) {
    // the game is running on the client side
    // set up the user interface

    // Initialize canvas
    ctx = this.canvas.getContext("2d");
    if (!this.canvas.getContext) return;

    // Paint background
    ctx.fillStyle = '#dedede';
    ctx.rect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    ctx.fill();

    // Save the initial background.
    var background = ctx.getImageData(0, 0, 30, 30);



  } else {
    // game is running on server
    // set up hooks to clients
    
    
  }

  // when a new user joins add their name to the list if on the client
  // create a new player in the model either way
    socket.on('new-user', function(msg) {
      var usernames = msg.split(',');
      for (var i = 0; i < usernames.length; ++i) {
        var username_dom = $('<li>').text(usernames[i]).attr('data-username', usernames[i]);

        $('#current-users').prepend(username_dom);

        // Prevent creating a new player for the current player
        if (players[usernames[i]] === undefined) {
          players[usernames[i]] = new game_player({ color: "blue" });
        }
      }
    });
  

  // Game objects
  var this.current_player = new game_player({ color: "blue" });

  this.players[username] = current_player;

  // Handle keyboard controls
  keys_down = {};

  addEventListener("keydown", function (e) {
    keys_down[e.keyCode] = true;
  }, false);

  addEventListener("keyup", function (e) {
    delete keys_down[e.keyCode];
  }, false);

  // receive info from the other clients
  socket.on('player-movement', function(msg) {
    this.movements[msg.username] = ({ x: msg.x, y: msg.y });
  });

  // Set animation frames
  var w = window;
  request_animation_frame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
}

game_core.prototype.client_handle_input = function() {
  // gather input from the client and put in in the input array for the
  // physics engine to use when it updates.
  var x_dir = 0, y_dir = 0;





}

// add functions to the game_core prototype
game_core.prototype.client_update = function(delta_time) {
  var current_player = this.players[current_username];

  var movement = {
    x: current_player.x,
    y: current_player.y
  }

  // current_player holding up
  if (38 in keys_down) {
    movement.y -= current_player.speed * delta_time;
    // current_player.y -= current_player.speed * delta_time;
  }

  // current_player holding down
  if (40 in keys_down) {
    movement.y += current_player.speed * delta_time;
    // current_player.y += current_player.speed * delta_time;
  }

  // current_player holding left
  if (37 in keys_down) {
    movement.x -= current_player.speed * delta_time;
    // current_player.x -= current_player.speed * delta_time;
  }

  // current_player holding right
  if (39 in keys_down) {
    movement.x += current_player.speed * delta_time;
    // current_player.x += current_player.speed * delta_time;
  }

  movement.x = movement.x.clamp(0, this.canvas.width - current_player.width);
  movement.y = movement.y.clamp(0, this.canvas.height - current_player.height);

  if (movement.x !== current_player.x || movement.y !== current_player.y) {
    socket.emit('player-moved', movement);
  }


  // Are they touching?
  // if (
  //   current_player.x <= (monster.x + 32)
  //   && monster.x <= (current_player.x + 32)
  //   && current_player.y <= (monster.y + 32)
  //   && monster.y <= (current_player.y + 32)
  // ) {
  //   ++monstersCaught;
  //   reset();
  // }
}

// Draw everything
game_core.prototype.render = function() {
  // Clean slate
  ctx.fillStyle = '#dedede';
  ctx.rect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
  ctx.fill();

  // Update players' positions
  for (var key in this.movements) {
    if (!this.movements.hasOwnProperty(key)) continue;

    var movement = this.movements[key];

    var player = this.players[key];
    player.x = movement.x;
    player.y = movement.y;
    this.players[key] = player;
  }

  // Draw new positions
  for (var key in this.players) {
    if (!this.players.hasOwnProperty(key)) continue;

    var player = this.players[key];

    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width / 4, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    // if (player.player_ready) {
    //   ctx.drawImage(player.player_image, player.x, player.y);
    // }
  }

  this.movements = {};

  // if (monsterReady) {
  //   ctx.drawImage(monsterImage, monster.x, monster.y);
  // }

  // Score
  // ctx.fillStyle = "rgb(250, 250, 250)";
  // ctx.font = "24px Helvetica";
  // ctx.textAlign = "left";
  // ctx.textBaseline = "top";
  // ctx.fillText("Monsterrs caught: " + monstersCaught, 32, 32);
};

// The main game loop
game_core.prototype.main = function(last_time) {
  var now = Date.now();
  var delta = now - last_time;


  if(this.on_server) {

    this.server_update(delta / 1000); //send delta in ms
  } else {
    this.client_update(delta / 1000);
    this.render();
    // Request to do this again ASAP
    requestAnimationFrame(this.main.bind(this, now));
  }
  

  
}