var ServerNetworkEvents = {
	/**
	 * Is called when the network tells us a new client has connected
	 * to the server. This is the point we can return true to reject
	 * the client connection if we wanted to.
	 * @param data The data object that contains any data sent from the client.
	 * @param clientId The client id of the client that sent the message.
	 * @private
	 */

	 _onPlayerAuthenticate: function (data, clientId) {
		console.log("data");
		console.dir(data);
		console.log("clientId");
		console.dir(clientId);

		var username = data.username || '';
		var pass = data.password || '';

		// DO AUTH HERE
		if (username == 'test1' && pass == 'pass1') {
			// Auth worked
			ige.server._onPlayerEntity(data, clientId);
		} else {
			// send a no data auth failed to the client who failed auth
			ige.network.send('authFailed', {},  clientId);
		}

		return false;
	},

	_onAuthFailed: function(data, clientId) {
		// not sure what this is for.
		// It's just here because the console told me to/
		return false;
	},

	_onPlayerConnect: function (clientId) {
		// Don't reject the client connection
		return false;
	},

	_onPlayerDisconnect: function (clientId) {
		var player = ige.server.players[clientId];
		if (player) {
			console.log("disconnect for clientID "+clientId);
			// delete the player from the team lists
			if(player.team() == 'red') {
				--ige.server.red_team_players;
			} else if(player.team() == 'blue') {
				--ige.server.blue_team_players;
			}

			// if player disconnects with flag return it
			if(player.holding_flag()) {
				// figure out what team the flag is from
				var flag_team;
				if (player.team() == 'red') {
					flag_team = 'blue';
				} else {
					flag_team = 'red';
				}
				// drop the flag
				player.holding_flag(false);
				// reset the flag
				ige.$(flag_team+'_flag').taken(false);
			}

			// Remove the player from the game
			ige.server.players[clientId].destroy();

			// Remove the reference to the player entity
			// so that we don't leak memory
			delete ige.server.players[clientId];
		}
	},

	_onPlayerEntity: function (data, clientId) {
		if (!ige.server.players[clientId]) {

			// check what team to put the player on
			// place on red then blue
			var team;
			if(ige.server.red_team_players <= ige.server.blue_team_players) {
				team = 'red';
				++ige.server.red_team_players;
			} else {
				team = 'blue';
				++ige.server.blue_team_players;
			}
			
			ige.server.players[clientId] = new Character({team:team})
				.addComponent(PlayerComponent)
				.box2dBody({
					type: 'dynamic',
					linearDamping: 0.0,
					angularDamping: 0.1,
					allowSleep: true,
					bullet: true,
					gravitic: false,
					fixedRotation: true,
					fixtures: [{
						density: 1.0,
						friction: 0.5,
						restitution: 0.2,
						shape: {
							type: 'polygon',
							data: new IgePoly2d()
								.addPoint(-0.5, 0.2)
								.addPoint(0.5, 0.2)
								.addPoint(0.5, 0.8)
								.addPoint(-0.5, 0.8)
						}
					}]
				})
				// not sure what this does, seems to break animation,input, or something
				// .setType(0)
				.category('player')
				// this is now done in the of the player init
				// .translateTo(480, 300, 0)
				.drawBounds(false)
				.streamMode(1)
				.id("player_"+team+"_"+clientId)
				.mount(ige.server.mainScene);

			// Tell the client to track their player entity
			ige.network.send('playerEntity', ige.server.players[clientId].id(), clientId);
		}
	},

	_onPlayerLeftDown: function (data, clientId) {
		if (ige.server.players[clientId])
			ige.server.players[clientId].playerControl.controls.left = true;
	},

	_onPlayerLeftUp: function (data, clientId) {
		if (ige.server.players[clientId])
			ige.server.players[clientId].playerControl.controls.left = false;
	},

	_onPlayerRightDown: function (data, clientId) {
		if (ige.server.players[clientId])
			ige.server.players[clientId].playerControl.controls.right = true;
	},

	_onPlayerRightUp: function (data, clientId) {
		if (ige.server.players[clientId])
			ige.server.players[clientId].playerControl.controls.right = false;
	},

	_onPlayerUpDown: function (data, clientId) {
		if (ige.server.players[clientId])
			ige.server.players[clientId].playerControl.controls.up = true;
	},

	_onPlayerUpUp: function (data, clientId) {
		if (ige.server.players[clientId])
			ige.server.players[clientId].playerControl.controls.up = false;
	},
	
	_onPlayerDownDown: function (data, clientId) {
		if (ige.server.players[clientId])
			ige.server.players[clientId].playerControl.controls.down = true;
	},

	_onPlayerDownUp: function (data, clientId) {
		if (ige.server.players[clientId])
			ige.server.players[clientId].playerControl.controls.down = false;
	}
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }