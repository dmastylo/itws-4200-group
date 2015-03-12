function Player(player) {
  // Set default values
  player.speed = 256;
  player.x = 32 + (Math.random() * (canvas.width - 64));
  player.y =  32 + (Math.random() * (canvas.height - 64));
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