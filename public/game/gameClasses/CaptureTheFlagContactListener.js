function checkForTaggedPlayers(contact) {
	if (contact.igeBothCategories('player') &&
		contact.igeEntityA().team() != contact.igeEntityB().team() &&
		!contact.igeEntityA().tagged() &&
		!contact.igeEntityB().tagged()
		) {

		// players on opposing teams have touched, send any player on the wrong side of the field home
		// if you're holding the flag you can be tagged anywhere
		var offense, defence;
		if ((contact.igeEntityA().on_opponent_side()&& !contact.igeEntityB().holding_flag()) ||
			contact.igeEntityA().holding_flag()) {
			
			offence = contact.igeEntityA();
			defence = contact.igeEntityB();
			
		}
		if ((contact.igeEntityB().on_opponent_side() && !contact.igeEntityA().holding_flag()) ||
			contact.igeEntityB().holding_flag()) {

			offence = contact.igeEntityB();
			defence = contact.igeEntityA();
		}

		if(offence) {
			console.log(offence._id +" got tagged by "+ defence._id);
			offence.tagged(true);
			// if offence is holding the flag they drop it now and it's returned
			if(offence.holding_flag()) {
				// figure out what team the flag is from
				var flag_team;
				if (offence.team() == 'red') {
					flag_team = 'blue';
				} else {
					flag_team = 'red';
				}
				// drop the flag
				offence.holding_flag(false);
				// reset the flag
				ige.$(flag_team+'_flag').taken(false);
			}
		}
	}
}

function checkForHealedPlayers(contact) {
	if (contact.igeEitherCategory('player') && contact.igeEitherCategory('heal_area')) {
		var player = contact.igeEntityByCategory('player'),
			heal_area = contact.igeEntityByCategory('heal_area');

		if (player.team()+"_heal_area" == heal_area._id) {
			// the player is touching the correct heal area, untag them
			player.tagged(false);
			console.log("player "+ player._id +" untagged at heal area "+heal_area._id);
		}
	}
}

function checkForFlagCapture(contact) {
	if (contact.igeEitherCategory('player') &&
		contact.igeEitherCategory('flag') &&
		!contact.igeEntityByCategory('player').tagged() &&
		!contact.igeEntityByCategory('flag').taken() &&
		contact.igeEntityA().team() != contact.igeEntityB().team()) {
		console.log("untagged player touching other teams flag");
		
		// have the player grab the flag and the flag read taken
		contact.igeEntityByCategory('player').holding_flag(true);
		contact.igeEntityByCategory('flag').taken(true);
	}
}

function checkForFlagScore(contact) {
	if (contact.igeEitherCategory('player') &&
		contact.igeEitherCategory('flag') &&
		contact.igeEntityByCategory('player').holding_flag(true) &&
		contact.igeEntityA().team() == contact.igeEntityB().team()) {

		var player = contact.igeEntityByCategory('player');

		var flag_team;
		if (player.team() == 'red') {
			flag_team = 'blue';
		} else {
			flag_team = 'red';
		}

		console.log(player._id +" returned the "+ flag_team +" to their base and scored a point!");
		
		// have the player grab the flag and the flag read taken
		contact.igeEntityByCategory('player').holding_flag(false);
		ige.$(flag_team+'_flag').taken(false);


		if(player.team() == 'red') {
			ige.server.red_score += 1;
		} else {
			ige.server.blue_score += 1;
		}
		console.log("Score is now red:"+ige.server.red_score+" to blue:"+ige.server.blue_score);
	}
}

function CaptureTheFlagContactListener() {
	this._classId = 'CaptureTheFlagContactListener';

	// Listen for when contact's begin
	this.beginContact = function (contact) {
		// console.log('Contact begins between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
		checkForTaggedPlayers(contact);

		checkForHealedPlayers(contact);

		checkForFlagCapture(contact);

		checkForFlagScore(contact);
	};

	// Listen for when contact's end
	this.endContact = function (contact) {
		// console.log('Contact ends between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
	};

	// Handle pre-solver events
	this.preSolve = function (contact) {
		// don't let tagged players contact other players
		if (contact.igeBothCategories('player')) {
			if (contact.igeEntityA().tagged() || contact.igeEntityB().tagged()) {
				// Cancel the contact
				// console.log("disabling contact because of tagged player. Players: "+
				// 	contact.igeEntityA()._id + " and " + contact.igeEntityB()._id);
				contact.SetEnabled(false);
			}
		}
		// don't let tagged players contact flags
		if (contact.igeEitherCategory('player') && contact.igeEitherCategory('flag')) {
			var player = contact.igeEntityByCategory('player');
			if (player.tagged()) {
				contact.SetEnabled(false);
			}
		}
	};

	this.postSolve = function (contact) {

	};


};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = CaptureTheFlagContactListener; }