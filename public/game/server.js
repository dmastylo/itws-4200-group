var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;
		ige.timeScale(1);

		// Define an object to hold references to our player entities
		this.players = {};

		this.red_score = 0;
		this.blue_score = 0;

		this.game_length = 45;
		this.game_time_left = 0;
		// this is true when the game is being played and false when people are
		// readying up
		this.game_active = false;

		// store a count of the players on each team
		this.red_team_players = 0;
		this.blue_team_players = 0;

		// Add mongo
		ige.addComponent(IgeMongoDbComponent, options.db).mongo.connect(function (err, db) {
			if(err) {
				console.log("Mongo connect didn't work.");
				console.log(err);
			} else {
				console.log("Mongo connected successfully!");
				// collections are globalmodels for global and userinfos
				ige.mongo.findAll('globalmodels', {}, function(err, docs) {
					console.log("mongo global models");
					console.dir(docs);
				});
				ige.mongo.findAll('userinfos', {}, function(err, docs) {
					console.log("mongo user models");
					console.dir(docs);
				});
			}
		})


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

						ige.network.define('playerAuthenticate', self._onPlayerAuthenticate);
						// these are client only methods just ignore them on the server
						ige.network.define('authFailed', function() {} )
						ige.network.define('scoreUpdate', function() {} );
						ige.network.define('timeUpdate', function() {} );

						ige.network.define('playerReady', self._onPlayerReady);
						ige.network.define('playerUnready', self._onPlayerUnready);


						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(30) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);

						// Add walls, flags, heal areas ect
						self.addGameElements();

						// Set the contact listener methods to detect when
						// contacts (collisions) begin and end
						// info on contact listener http://www.isogenicengine.com/forum/viewtopic.php?f=5&t=247
						var contact_listner = new CaptureTheFlagContactListener();
						// just make a new contact listener to call the methods on this one
						ige.box2d.contactListener(
							// Listen for when contact's begin
							function (contact) {
								contact_listner.beginContact(contact);
							},
							// Listen for when contact's end
							function (contact) {
								contact_listner.endContact(contact);
							},
							// Handle pre-solver events
							function (contact) {
								contact_listner.preSolve(contact);
							},
							// Handle post-solver events
							function (contact) {
								contact_listner.postSolve(contact);
							}
						);

						// just start the game for debugging
						// self.gameStart();

						// set up a check for starting the game
						self.game_start_checker = new IgeInterval(function () {
							// check that the game is not currently running
							if (ige.server.getGameActive()) {
								return;
							}
							// check that there are the right number of players on each team
							if (self.red_team_players != 1 || self.blue_team_players != 1) {
								return;
							}

							// check that all players are in base and not tagged
							for(player_id in self.players) {
								if(!self.players[player_id].in_base() ||
									self.players[player_id].tagged()) {
									return;
								}
							}

							// if haven't returned yet start the game
							self.gameStart();
						}, 1000);

					} // end ige.start if success
				}); // end ige.start
			});
	}, // end init

	addGameElements: function() {
		var self = this;
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

		// Create some of the objects players interact with
		self.red_flag = new Chest( {team : "red"} )
			.id('red_flag')
			.translateTo(75, 300, 0)
			.width(20)
			.height(20)
			.streamMode(1)
			.mount(self.mainScene)
			.category('flag');

		self.blue_flag = new Chest( {team : "blue"} )
			.id('blue_flag')
			.translateTo(725, 300, 0)
			.width(20)
			.height(20)
			.streamMode(1)
			.mount(self.mainScene)
			.category('flag')

		new HealArea( {team: 'red'} )
			.id('red_heal_area')
			.translateTo(50, 50, 0)
			.streamMode(1)
			.mount(self.mainScene)
			.category('heal_area')

		new HealArea( {team: 'blue'} )
			.id('blue_heal_area')
			.translateTo(750, 550, 0)
			.streamMode(1)
			.mount(self.mainScene)
			.category('heal_area')

		// First create the board walls and set their category

		// These are the paramaters of make wall
		// make_wall: function(id, x, y, width, height)
		this.make_wall('top_wall', 400, 0, 840, 1)
			.category('board_wall');
		this.make_wall('bottom_wall', 400, 600, 840, 1)
			.category('board_wall');
		this.make_wall('left_wall', 0, 300, 1, 600)
			.category('board_wall')
		this.make_wall('right_wall', 800, 300, 1, 600)
			.category('board_wall');
		// Now make the waiting area walls
		this.make_wall('red_right_base_wall', 200, 100, 1, 200)
			.category('base_wall')
			.team = 'red';
		this.make_wall('red_bottom_base_wall', 100, 200, 200, 1)
			.category('base_wall')
			.team = 'red';
		this.make_wall('blue_left_base_wall', 600, 500, 1, 200)
			.category('base_wall')
			.team = 'blue';
		this.make_wall('blue_top_base_wall', 700, 400, 200, 1)
			.category('base_wall')
			.team = 'blue';

	},

	make_wall: function(id, x, y, width, height) {
		return new IgeEntityBox2d()
			.id(id)
			.translateTo(x, y, 0)
			.width(width)
			.height(height)
			.drawBounds(true)
			.streamMode(1)
			.mount(this.mainScene)
			.box2dBody({
					type: 'static',
					allowSleep: true,
					fixtures: [{
							shape: {
								type: 'rectangle'
							}
					}]
			});
	},

	getOtherTeam: function(team) {
		if (team == 'red') {
			return 'blue';
		} else
		if (team == 'blue') {
			return 'red';
		}
		// If another team was passed just return nothing
		return '';
	},

	gameStart: function() {
		self = this;
		// fill up the game timer
		this.game_time_left = this.game_length;

		// set a interval to update the remaining game time
		if (self.game_timer_update !== undefined)
			self.game_timer_update.cancel();

		self.game_timer_update = new IgeInterval(function () { 
			self.game_time_left -= 1;
			console.log('Remaining game time is :'+ self.game_time_left);
			ige.network.send('timeUpdate', self.game_time_left);
			// when the time hits 0 end the game
			if (self.game_time_left <= 0 ) {
				self.gameEnd();
				self.game_timer_update.cancel();
			}
		}, 1000);

		// start the game
		this.game_active = true;
	},

	record_score: function(team) {
		// update score and update labels
		if (team == 'red') {
			this.red_score += 1;
		} else if (team == 'blue') {
			this.blue_score += 1;
		}
		var score_data = {
			red_score: this.red_score,
			blue_score: this.blue_score
		}
		ige.network.send('scoreUpdate', score_data);
		console.log("Score is now red:"+ige.server.red_score+" to blue:"+ige.server.blue_score);
	},

	gameEnd: function() {
		self = this;
		console.log("Game ending!");
		var result = 'Tie';
		var winner = 'Tie';
		if (self.red_score > self.blue_score) {
			result = 'Red Wins!';
			winner = 'red';
		} else
		if (self.blue_score > self.red_score) {
			reset = 'Blue Wins!';
			winner = 'blue';
		}
		// log stats for all the players
		for (player_id in this.players) {
			var player = this.players[player_id];
			player.gamesPlayed++;

			if (player.team() == winner) {
				player.wins++;
			} else 
			if (player.team() == this.getOtherTeam(winner)) {
				player.losses++;
			}
		}

		// stop game things happening
		this.game_active = false;

		

		// print (or save to db) game results and reset
		console.log("Game Ended!");
		console.log("Player results")
		for (player_id in this.players) {
			var player = this.players[player_id];
			console.log("Player " + player.getName());
			console.log("  gamesPlayed: " + player.gamesPlayed);
			console.log("  wins: " + player.wins);
			console.log("  losses: " + player.losses);
			console.log("  tags: " + player.tags);
			console.log("  captures: " + player.captures);
			ige.mongo.update('userinfos',	// collection
				{ name : player.getName() }, // search json
				// update json
				{
					gamesPlayed : player.gamesPlayed,
					wins : player.wins,
					losses : player.losses,
					tags : player.tags,
					captures : player.captures
				},
				// callback
				function(err, result) {
					if (err) {
						console.log("Error upserting player info.");
						console.log(err);
					}
					console.log("player upserted in mongo!");
				},
				// pass upsert as an option to create the user if no record exists
				{ upsert: true }
				);
		}



		// var stats = {
	 //    gamesPlayed   : 100,
	 //    redWins       : 50,
	 //    blueWins      : 50,
	 //    tags          : 14276,
	 //    totalCaptures : 2000
	 //  };

		// GlobalModel.update({}, stats);

		// var params = { red_score: self.red_score, blue_score: self.blue_score };
		// request.post('game_results', params, function(err, res, body) {
  //     if (!err && res.statusCode === 200) {
  //       console.log(res, body);
  //     }
	 //  });

		console.log("Red score: " + self.red_score);
		console.log("Blue Score: " + self.blue_score);
		console.log("Result: "+result);

		this.resetGame();
	},

	getGameActive: function() {
		return this.game_active;
	},

	resetGame: function() {
		self.blue_score = 0;
		self.red_score = 0;
		// reset players
		for (player_id in this.players) {
			var player = this.players[player_id];
			// tag everyone to show the game is over
			// they will untag when they go back to base
			player.tagged(true);
			// everyone drops the flag
			player.holding_flag(false);
		}
		// reset the flags
		self.red_flag.taken(false);
		self.blue_flag.taken(false);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }