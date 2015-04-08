$(function() {
  socket = io();

  // this is the login form
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
});

function setup_game(username) {
  // game_core is from game.core.js
  // the false flag tells the gamecore that this is client side code
  game = new game_core(username, false);
  // start the game
  game.main(Date.now());
}
