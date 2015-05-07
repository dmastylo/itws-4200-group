var ClientNetworkEvents = {
	/**
	 * Is called when a network packet with the "playerEntity" command
	 * is received by the client from the server. This is the server telling
	 * us which entity is our player entity so that we can track it with
	 * the main camera!
	 * @param data The data object that contains any data sent from the server.
	 * @private
	 */
	_onPlayerEntity: function (data) {
		if (ige.$(data)) {
			// Add the player control component
			ige.$(data).addComponent(PlayerComponent);
			
			// Track our player with the camera
			ige.client.game_vp.camera.trackTranslate(ige.$(data), 50);
		} else {
			// The client has not yet received the entity via the network
			// stream so lets ask the stream to tell us when it creates a
			// new entity and then check if that entity is the one we
			// should be tracking!
			var self = this;
			self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
				if (entity.id() === data) {
					// Add the player control component
					ige.$(data).addComponent(PlayerComponent);
					
					// Tell the camera to track out player entity
					ige.client.game_vp.camera.trackTranslate(ige.$(data), 50);

					// Turn off the listener for this event now that we
					// have found and started tracking our player entity
					ige.network.stream.off('entityCreated', self._eventListener, function (result) {
						if (!result) {
							this.log('Could not disable event listener!', 'warning');
						}
					});
				}
			});
		}
	},

	_onScoreUpdate: function (data) {
		red_score = data.red_score || undefined;
		blue_score = data.blue_score || undefined;

		if(red_score !== undefined) {
			ige.$('red_score_label').value("Red Score: "+red_score);
		}

		if(blue_score !== undefined) {
			ige.$('blue_score_label').value("Blue Score: "+blue_score);
		}

	},

	_onTimeUpdate: function(data) {
		// data is second remaining
		var seconds = data % 60;
		var minutes = Math.floor(data / 60);
		var time_string = minutes + ":" + seconds;
		ige.$('time_label').value("Time Remaining: "+time_string);
	},

	_onAuthFailed: function(data, clientId) {
		// If auth failed reset the pword and username fields
		console.log("On auth failed called!");
	}
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }