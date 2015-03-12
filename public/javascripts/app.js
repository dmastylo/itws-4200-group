$(function() {
  canvas = $("canvas")[0];
  movements = {};
  players = {};

  // jQuery Handlers
  $('form').submit(function(e) {
    e.preventDefault();

    current_username = $('#username-input').val();
    if (!current_username.length) return false;

    socket.emit('username-registered', current_username);
    $('#username').text('Hi, ' + current_username);

    // Form is not needed anymore
    $(this).remove();
    
    // Setup the game
    $('#game').show();
    setup_game(current_username);

    // Don't actually submit the form, prevent page redirect
    return false;
  });

  // Socket Handlers
  // ===========================================================================
  socket = io();

  socket.on('new-user', function(msg) {
    var usernames = msg.split(',');
    for (var i = 0; i < usernames.length; ++i) {
      var username_dom = $('<li>').text(usernames[i]).attr('data-username', usernames[i]);

      $('#current-users').prepend(username_dom);

      // Prevent creating a new player for the current player
      if (players[usernames[i]] === undefined) {
        players[usernames[i]] = Player({ color: "blue" });
      }
    }
  });

  socket.on('user-disconnected', function(msg) {
    var username_dom = $('*[data-username="' + msg + '"]')

    // Animate the user so that people know they're leaving
    username_dom.text(username_dom.text() + ' has left!');
    username_dom.css('color', 'red');
    username_dom.fadeOut('slow', 'swing', function() {
      username_dom.fadeIn('slow', 'swing');
    });

    setTimeout(function() {
      username_dom.slideUp('slow', 'swing', function() {
        username_dom.remove();
      });
    }, 2000);
  });

  socket.on('player-movement', function(msg) {
    movements[msg.username] = ({ x: msg.x, y: msg.y });
  });
});

function setup_game(username) {
  // Initialize canvas
  ctx = canvas.getContext("2d");
  if (!canvas.getContext) return;

  // Paint background
  ctx.fillStyle = '#dedede';
  ctx.rect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  ctx.fill();

  // Save the initial background.
  var background = ctx.getImageData(0, 0, 30, 30);

  // Game objects
  var current_player = Player({
    color: "blue"
  });

  players[username] = current_player;

  // Handle keyboard controls
  keys_down = {};

  addEventListener("keydown", function (e) {
    keys_down[e.keyCode] = true;
  }, false);

  addEventListener("keyup", function (e) {
    delete keys_down[e.keyCode];
  }, false);

  // Set animation frames
  var w = window;
  request_animation_frame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

  // Begin game
  main(Date.now());
}

// Update game objects
function update(modifier) {
  var current_player = players[current_username];

  var movement = {
    x: current_player.x,
    y: current_player.y
  }

  // current_player holding up
  if (38 in keys_down) {
    movement.y -= current_player.speed * modifier;
    // current_player.y -= current_player.speed * modifier;
  }

  // current_player holding down
  if (40 in keys_down) {
    movement.y += current_player.speed * modifier;
    // current_player.y += current_player.speed * modifier;
  }

  // current_player holding left
  if (37 in keys_down) {
    movement.x -= current_player.speed * modifier;
    // current_player.x -= current_player.speed * modifier;
  }

  // current_player holding right
  if (39 in keys_down) {
    movement.x += current_player.speed * modifier;
    // current_player.x += current_player.speed * modifier;
  }

  movement.x = movement.x.clamp(0, canvas.width - current_player.width);
  movement.y = movement.y.clamp(0, canvas.height - current_player.height);

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
function render() {
  // Clean slate
  ctx.fillStyle = '#dedede';
  ctx.rect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  ctx.fill();

  // Update players' positions
  for (var key in movements) {
    if (!movements.hasOwnProperty(key)) continue;

    var movement = movements[key];

    var player = players[key];
    player.x = movement.x;
    player.y = movement.y;
    players[key] = player;
  }

  // Draw new positions
  for (var key in players) {
    if (!players.hasOwnProperty(key)) continue;

    var player = players[key];

    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width / 4, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    // if (player.player_ready) {
    //   ctx.drawImage(player.player_image, player.x, player.y);
    // }
  }

  movements = {};

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
function main(last_time) {
  var now = Date.now();
  var delta = now - last_time;

  update(delta / 1000);
  render();

  // Request to do this again ASAP
  requestAnimationFrame(function() {
    main(now);
  });
}
