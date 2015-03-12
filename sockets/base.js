module.exports = function(io) {
  var clients = [];

  io.sockets.on('connection', function (client) {
    clients.push(client);

    // Send already connected usernames to newly connected client
    usernames = [];
    for (var i = 0; i < clients.length; ++i) {
      usernames.push(clients[i].username);
    }
    usernames = usernames.filter(function(n) { return n != undefined });
    if (usernames.length) {
      client.emit('new-user', usernames.join(','));
    }

    client.on('disconnect', function() {
      username = client.username;
      clients.splice(clients.indexOf(client), 1);
      io.emit('user-disconnected', username);
    });

    client.on('username-registered', function(msg) {
      clients[clients.indexOf(client)].username = msg;
      io.emit('new-user', msg);
    });

    client.on('player-moved', function(movement) {
      var user = clients[clients.indexOf(client)];
      user.x = movement.x;
      user.y = movement.y;

      var player = {
        username: user.username,
        x: user.x,
        y: user.y
      }

      clients[clients.indexOf(client)] = user;
      io.emit('player-movement', player);
      // io.emit('player-movement', clients[clients.indexOf(client)]);
    })
  });
};
