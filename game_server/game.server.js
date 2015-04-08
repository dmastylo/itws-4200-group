module.exports = function(io) {
  var client_sockets = [];

  io.sockets.on('connection', function (client_socket) {
    client_sockets.push(client_socket);

    // Send already connected usernames to newly connected client_socket
    usernames = [];
    for (var i = 0; i < client_sockets.length; ++i) {
      usernames.push(client_sockets[i].username);
    }
    usernames = usernames.filter(function(n) { return n != undefined });
    if (usernames.length) {
      client_socket.emit('new-user', usernames.join(','));
    }

    client_socket.on('disconnect', function() {
      username = client_socket.username;
      client_sockets.splice(client_sockets.indexOf(client_socket), 1);
      io.emit('user-disconnected', username);
    });

    client_socket.on('username-registered', function(msg) {
      client_sockets[client_sockets.indexOf(client_socket)].username = msg;
      io.emit('new-user', msg);
    });

    client_socket.on('player-moved', function(movement) {
      var user = client_sockets[client_sockets.indexOf(client_socket)];
      user.x = movement.x;
      user.y = movement.y;

      var player = {
        username: user.username,
        x: user.x,
        y: user.y
      }

      client_sockets[client_sockets.indexOf(client_socket)] = user;
      io.emit('player-movement', player);
      // io.emit('player-movement', client_sockets[client_sockets.indexOf(client_socket)]);
    });
  });

};
