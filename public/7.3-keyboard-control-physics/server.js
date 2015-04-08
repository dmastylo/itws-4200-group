var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;
		ige.timeScale(1);

		// Define an object to hold references to our player entities
		this.players = {};

		// store a count of the players on each team
		this.red_team_players = 0;
		this.blue_team_players = 0;

		// Add the server-side game methods / event handlers
		this.implement(ServerNetworkEvents);

		// Add physics and setup physics world
		ige.addComponent(IgeBox2dComponent)
			.box2d.sleep(true)
			.box2d.gravity(0, 10)
			.box2d.createWorld()
			.box2d.start();

		// Start the network server
		ige.addComponent(IgeSocketIoComponent)
			// Start the network server
			.network.start(2000, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
						// Create some network commands we will need
						ige.network.define('playerEntity', self._onPlayerEntity);

						ige.network.define('playerControlLeftDown', self._onPlayerLeftDown);
						ige.network.define('playerControlRightDown', self._onPlayerRightDown);
						ige.network.define('playerControlUpDown', self._onPlayerUpDown);
						ige.network.define('playerControlDownDown', self._onPlayerDownDown);

						ige.network.define('playerControlLeftUp', self._onPlayerLeftUp);
						ige.network.define('playerControlRightUp', self._onPlayerRightUp);
						ige.network.define('playerControlUpUp', self._onPlayerUpUp);
						ige.network.define('playerControlDownUp', self._onPlayerDownUp);

						ige.network.on('connect', self._onPlayerConnect); // Defined in ./gameClasses/ServerNetworkEvents.js
						ige.network.on('disconnect', self._onPlayerDisconnect); // Defined in ./gameClasses/ServerNetworkEvents.js

						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(30) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);

						// Create the scene
						self.mainScene = new IgeScene2d()
							.id('mainScene')

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.scene(self.mainScene)
							.drawBounds(true)
							.mount(ige);

						// Create some of the objects players run into
						new IgeEntityBox2d()
							.id('red_flag')
							.translateTo(0, 300, 0)
							.width(20)
							.height(20)
							.drawBounds(true)
							.streamMode(1)
							.mount(self.mainScene)
							.box2dBody({
								type: 'static',
								allowSleep: true,
								fixtures: [{
									shape: {
										type: 'rectangle'
									}
								}]
							});

						new IgeEntityBox2d()
							.id('blue_flag')
							.translateTo(800, 300, 0)
							.width(1)
							.height(20)
							.drawBounds(true)
							.streamMode(1)
							.mount(self.mainScene)
							.box2dBody({
								type: 'static',
								allowSleep: true,
								fixtures: [{
									shape: {
										type: 'rectangle'
									}
								}]
							});

                       new IgeEntityBox2d()
                       		.id('top_wall')
                           .translateTo(400, 0, 0)
                           .width(840)
                           .height(1)
                           .drawBounds(true)
                           .streamMode(1)
                           .mount(self.mainScene)
                           .box2dBody({
                                   type: 'static',
                                   allowSleep: true,
                                   fixtures: [{
                                           shape: {
                                                   type: 'rectangle'
                                           }
                                   }]
                           });

                       new IgeEntityBox2d()
                       .id('bot_wall')
                           .translateTo(400, 600, 0)
                           .width(840)
                           .height(1)
                           .drawBounds(true)
                           .streamMode(1)
                           .mount(self.mainScene)
                           .box2dBody({
                                   type: 'static',
                                   allowSleep: true,
                                   fixtures: [{
                                           shape: {
                                                   type: 'rectangle'
                                           }
                                   }]
                           });

                       new IgeEntityBox2d()
                       .id('left_wall')
                               .translateTo(0, 300, 0)
                               .width(1)
                               .height(600)
                               .drawBounds(true)
                               .streamMode(1)
                               .mount(self.mainScene)
                               .box2dBody({
                                       type: 'static',
                                       allowSleep: true,
                                       fixtures: [{
                                               shape: {
                                                       type: 'rectangle'
                                               }
                                       }]
                               });

                       new IgeEntityBox2d()
                       .id('right_wall')
                               .translateTo(800, 300, 0)
                               .width(1)
                               .height(600)
                               .drawBounds(true)
                               .streamMode(1)
                               .mount(self.mainScene)
                               .box2dBody({
                                       type: 'static',
                                       allowSleep: true,
                                       fixtures: [{
                                               shape: {
                                                       type: 'rectangle'
                                               }
                                       }]
                               });

						// Set the contact listener methods to detect when
						// contacts (collisions) begin and end
						ige.box2d.contactListener(
							// Listen for when contact's begin
							function (contact) {
								console.log('Contact begins between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
								// if contact is between a player on the opposing side of the field and another player send the intruding player home
								if (contact.igeBothCategories('player')) {
									// check if they're on opposite teams
									if(contact.igeEntityA().team() != contact.igeEntityB().team()) {

										// players on opposing teams have touched, send any player on the wrong side of the field home
										if(contact.igeEntityA().on_opponent_side()) {
											console.log(contact.igeEntityA()._id +" got tagged");

											var home_base = contact.igeEntityA().home_base();
											contact.igeEntityA().translateTo(home_base[0], home_base[1], home_base[2]);
											
										}
										if(contact.igeEntityB().on_opponent_side()) {
											console.log(contact.igeEntityB()._id +" got tagged");

											var home_base = contact.igeEntityB().home_base();
											contact.igeEntityB().translateTo(home_base[0], home_base[1], home_base[2]);
											
										}
									}
									
								}
							},
							// Listen for when contact's end
							function (contact) {
								console.log('Contact ends between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
							}
							// // Handle pre-solver events
							// function (contact) {
							// 		// Cancel the contact
									// contact.SetEnabled(false);
							// 	// You can also check an entity by it's category using igeEitherCategory('categoryName')
							// }
						);

					}
				});
			});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }