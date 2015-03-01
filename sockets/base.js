module.exports = function(io) {
  io.sockets.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });

    socket.on('username-registered', function(msg){
      console.log('username: ' + msg);
      io.emit('new-username', msg);
    });
  });
};
