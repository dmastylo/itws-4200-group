module.exports = function(io) {
  var clients = [];

  io.sockets.on('connection', function (client) {
    console.log('a user connected');
    clients.push(client);

    // Send already connected usernames to newly connected client
    usernames = [];
    for (var i = 0; i < clients.length; ++i) {
      usernames.push(clients[i].username);
    }
    usernames = usernames.filter(function(n) { return n != undefined });
    if (usernames.length) {
      client.emit('new-username', usernames.join(','));
    }

    client.on('disconnect', function() {
      console.log('user disconnected');
      clients.splice(clients.indexOf(client), 1);
    });

    client.on('username-registered', function(msg) {
      console.log('username: ' + msg);
      clients[clients.indexOf(client)].username = msg;
      io.emit('new-username', msg);
    });
  });
};
