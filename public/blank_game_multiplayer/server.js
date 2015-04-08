var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;

		// Add the networking component
		ige.addComponent(IgeNetIoComponent)
			// Start the network server
			.network.start(2000, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
						ige.network.on('connect', function () {});
						ige.network.on('disconnect', function () {});

						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(30) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);

						// Load the base scene data
						ige.addGraph('IgeBaseScene');

						// make a new entity and add it to the base scene
						var ship_entity = new ExampleEntity()
							.id('first_example')
							// automatically stream data about this entity to clients
							.streamMode(1)
							// $(id) is ige syntax for selecting objects by id
							.mount(ige.$('baseScene'));

						ship_entity._translate.tween()
							.stepTo({x: -500}, 10*1000)
							.start();
					}
				});
			});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }