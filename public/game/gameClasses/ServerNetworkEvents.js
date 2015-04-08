var ServerNetworkEvents = {
	/**
	 * Is called when the network tells us a new client has connected
	 * to the server. This is the point we can return true to reject
	 * the client connection if we wanted to.
	 * @param data The data object that contains any data sent from the client.
	 * @param clientId The client id of the client that sent the message.
	 * @private
	 */
	_onPlayerConnect: function (socket) {
		// Don't reject the client connection
		return false;
	},

	_onPlayerDisconnect: function (clientId) {
		if (ige.server.players[clientId]) {
			// delete the player from the team lists
			if(ige.server.players[clientId].team() == 'red') {
				ige.server.red_team_players--;
			} else if(ige.server.players[clientId].team() == 'blue') {
				ige.server.blue_team_players--;
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
			var team, player_number;
			if(ige.server.red_team_players <= ige.server.blue_team_players) {
				team = 'red';
				player_number = ++ige.server.red_team_players;
			} else {
				team = 'blue';
				player_number = ++ige.server.blue_team_players;
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
				.id("player_"+team+"_"+player_number)
				.mount(ige.server.mainScene);

			// Tell the client to track their player entity
			ige.network.send('playerEntity', ige.server.players[clientId].id(), clientId);
		}
	},

	_onPlayerLeftDown: function (data, clientId) {
		ige.server.players[clientId].playerControl.controls.left = true;
	},

	_onPlayerLeftUp: function (data, clientId) {
		ige.server.players[clientId].playerControl.controls.left = false;
	},

	_onPlayerRightDown: function (data, clientId) {
		ige.server.players[clientId].playerControl.controls.right = true;
	},

	_onPlayerRightUp: function (data, clientId) {
		ige.server.players[clientId].playerControl.controls.right = false;
	},

	_onPlayerUpDown: function (data, clientId) {
		ige.server.players[clientId].playerControl.controls.up = true;
	},

	_onPlayerUpUp: function (data, clientId) {
		ige.server.players[clientId].playerControl.controls.up = false;
	},
	
	_onPlayerDownDown: function (data, clientId) {
		ige.server.players[clientId].playerControl.controls.down = true;
	},

	_onPlayerDownUp: function (data, clientId) {
		ige.server.players[clientId].playerControl.controls.down = false;
	}
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }