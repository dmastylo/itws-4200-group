// Define our player character classes
var Character = IgeEntityBox2d.extend({
	classId: 'Character',

	init: function (data) {
		var self = this;
		IgeEntityBox2d.prototype.init.call(this);

		// store if they player is currently tagged or not
		self._tagged = false;
		if(data.tagged)
			self._tagged = data.tagged;

		if(data.team)
			self._team = data.team;
		
		// if on the server looks like adding physics
		if (ige.isServer) {
			this.addComponent(IgeVelocityComponent);
		}
		
		// if not looks like adding texture
		if (!ige.isServer) {
			// Setup the entity
			self.addComponent(IgeAnimationComponent)
				.depth(1);
			
			// Load the character texture file
			this._characterTexture = new IgeCellSheet('../assets/textures/sprites/vx_chara02_c_with_dark.png', 12, 8);
	
			// Wait for the texture to load
			this._characterTexture.on('loaded', function () {
				self.texture(self._characterTexture)
					.dimensionsFromCell();

				if(self.team() == 'red') {
					console.log("I'm on the red team and type 7");
					self.setType(7);
				} else if(self.team() == 'blue') {
					console.log("I'm on the blue team and type 5");
					self.setType(5);
				} else {
					self.setType(0);
					console.log("I don't know what team I'm on!!");
				}

			}, false, true);
		}
		
		this._lastTranslate = this._translate.clone();

		// dump the player off in their home base
		var home_base = this.home_base();
		this.translateTo(home_base[0], home_base[1], home_base[2]);

		// Define the data sections that will be included in the stream
		this.streamSections(['transform', 'tagged']);

		console.log("Created a new player on the " + this._team + " team.");
	},

	// This is called by the stream system on the server to ask
	// for the data that will be sent along with the initial entity
	// create on the client. The object returned will be passed as
	// the first parameter in the init() method when the ghost
	// is instantiated client-side, allowing you to send along
	// custom data for the entity automatically when a client is
	// being told about the entity's existence.
	streamCreateData: function () {
	  return {team:this._team};
	},

	/**
	 * Override the default IgeEntity class streamSectionData() method
	 * so that we can check for the custom1 section and handle how we deal
	 * with it.
	 * @param {String} sectionId A string identifying the section to
	 * handle data get / set for.
	 * @param {*=} data If present, this is the data that has been sent
	 * from the server to the client for this entity.
	 * @return {*}
	 */
	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling
		if (sectionId === 'tagged') {
			// Check if the server sent us data, if not we are supposed
			// to return the data instead of set it
			if (data !== undefined) {
				// We have been given new data!
				this._tagged = data;
			} else {
				// Return current data
				return this._tagged;
			}
		} else {
			// The section was not one that we handle here, so pass this
			// to the super-class streamSectionData() method - it handles
			// the "transform" section by itself
			return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
		}
	},

	team: function (val) {
        if (val !== undefined) {
            this._team = val;
            return this;
        }
 
        return this._team;
    },

    home_base: function() {
    	if(this._team == 'red')
    		return [10, 10, 0];
    	else
    		return [770, 570, 0];
    },

    on_opponent_side: function() {
    	if(this._team == 'red' && this.origin().x() > 400)
    		return true;
    	if(this._team == 'blue' && this.origin().x() < 400)
    		return true;

    	return false;
    },

    // TODO: drop flag when tagged changes to true
    tagged: function(val) {
    	if (val !== undefined) {
            this._tagged = val;
            return this._tagged;
        }      
 
        return this._tagged;
    },

	/**
	 * Sets the type of character which determines the character's
	 * animation sequences and appearance.
	 * @param {Number} type From 0 to 7, determines the character's
	 * appearance.
	 * @return {*}
	 */
	setType: function (type) {
		switch (type) {
			case 0:
				this.animation.define('walkDown', [1, 2, 3, 2], 8, -1)
					.animation.define('walkLeft', [13, 14, 15, 14], 8, -1)
					.animation.define('walkRight', [25, 26, 27, 26], 8, -1)
					.animation.define('walkUp', [37, 38, 39, 38], 8, -1)
					.cell(1);

				this._restCell = 1;
				break;

			case 1:
				this.animation.define('walkDown', [4, 5, 6, 5], 8, -1)
					.animation.define('walkLeft', [16, 17, 18, 17], 8, -1)
					.animation.define('walkRight', [28, 29, 30, 29], 8, -1)
					.animation.define('walkUp', [40, 41, 42, 41], 8, -1)
					.cell(4);

				this._restCell = 4;
				break;
			// shadow red sprite
			case 2:
				this.animation.define('walkDown', [7, 8, 9, 8], 8, -1)
					.animation.define('walkLeft', [19, 20, 21, 20], 8, -1)
					.animation.define('walkRight', [31, 32, 33, 32], 8, -1)
					.animation.define('walkUp', [43, 44, 45, 44], 8, -1)
					.cell(7);

				this._restCell = 7;
				break;

			case 3:
				this.animation.define('walkDown', [10, 11, 12, 11], 8, -1)
					.animation.define('walkLeft', [22, 23, 24, 23], 8, -1)
					.animation.define('walkRight', [34, 35, 36, 35], 8, -1)
					.animation.define('walkUp', [46, 47, 48, 47], 8, -1)
					.cell(10);

				this._restCell = 10;
				break;

			case 4:
				this.animation.define('walkDown', [49, 50, 51, 50], 8, -1)
					.animation.define('walkLeft', [61, 62, 63, 62], 8, -1)
					.animation.define('walkRight', [73, 74, 75, 74], 8, -1)
					.animation.define('walkUp', [85, 86, 87, 86], 8, -1)
					.cell(49);

				this._restCell = 49;
				break;
			// default blue sprite
			case 5:
				this.animation.define('walkDown', [52, 53, 54, 53], 8, -1)
					.animation.define('walkLeft', [64, 65, 66, 65], 8, -1)
					.animation.define('walkRight', [76, 77, 78, 77], 8, -1)
					.animation.define('walkUp', [88, 89, 90, 89], 8, -1)
					.cell(52);

				this._restCell = 52;

				this.animation.define('walkDownTagged', [55, 56, 57, 56], 8, -1)
					.animation.define('walkLeftTagged', [67, 68, 69, 68], 8, -1)
					.animation.define('walkRightTagged', [79, 80, 81, 80], 8, -1)
					.animation.define('walkUpTagged', [91, 92, 93, 92], 8, -1)
					.cell(55);
				break;
			// shadow blue sprite
			case 6:
				this.animation.define('walkDown', [55, 56, 57, 56], 8, -1)
					.animation.define('walkLeft', [67, 68, 69, 68], 8, -1)
					.animation.define('walkRight', [79, 80, 81, 80], 8, -1)
					.animation.define('walkUp', [91, 92, 93, 92], 8, -1)
					.cell(55);

				this._restCell = 55;
				break;
			// default red sprite
			case 7:
				this.animation.define('walkDown', [58, 59, 60, 59], 8, -1)
					.animation.define('walkLeft', [70, 71, 72, 71], 8, -1)
					.animation.define('walkRight', [82, 83, 84, 83], 8, -1)
					.animation.define('walkUp', [94, 95, 96, 95], 8, -1)
					.cell(58);

				this._restCell = 58;

				this.animation.define('walkDownTagged', [7, 8, 9, 8], 8, -1)
					.animation.define('walkLeftTagged', [19, 20, 21, 20], 8, -1)
					.animation.define('walkRightTagged', [31, 32, 33, 32], 8, -1)
					.animation.define('walkUpTagged', [43, 44, 45, 44], 8, -1)
					.cell(7);
				break;
		}

		this._characterType = type;

		return this;
	},
	
	update: function (ctx) {
		var animation_suffix = "";
		// console.log(this._id + ".tagged()="+this.tagged());
		if (this.tagged()) {
			animation_suffix = "Tagged";
			// console.log("update called on a tagged player");
		}
		if (!ige.isServer) {
			// set the rest cell based on if the player is tagged or not
			if(this._tagged) {
				if(this.team() == 'red') {
					this.cell(7)
				}
				if(this.team() == 'blue') {
					this.cell(55)
				}
			} else {
				if(this.team() == 'red') {
					this.cell(58)
				}
				if(this.team() == 'blue') {
					this.cell(52)
				}
			}

			// Set the current animation based on direction
			var self = this,
				oldX = this._lastTranslate.x,
				oldY = this._lastTranslate.y * 2,
				currX = this.translate().x(),
				currY = this.translate().y() * 2,
				distX = currX - oldX,
				distY = currY - oldY,
				distance = Math.distance(
					oldX,
					oldY,
					currX,
					currY
				),
				speed = 0.1,
				time = (distance / speed);
			
			this._lastTranslate = this._translate.clone();
	
			if (distX == 0 && distY == 0) {
				this.animation.stop();
			} else {
				// Set the animation based on direction
				if (Math.abs(distX) > Math.abs(distY)) {
					// Moving horizontal
					if (distX < 0) {
						// Moving left
						this.animation.select('walkLeft'+animation_suffix);
					} else {
						// Moving right
						this.animation.select('walkRight'+animation_suffix);
					}
				} else {
					// Moving vertical
					if (distY < 0) {
						if (distX < 0) {
							// Moving up-left
							this.animation.select('walkUp'+animation_suffix);
						} else {
							// Moving up
							this.animation.select('walkRight'+animation_suffix);
						}
					} else {
						if (distX > 0) {
							// Moving down-right
							this.animation.select('walkDown'+animation_suffix);					
						} else {
							// Moving down
							this.animation.select('walkLeft'+animation_suffix);
						}
					}
				}
			}
			
			// Set the depth to the y co-ordinate which basically
			// makes the entity appear further in the foreground
			// the closer they become to the bottom of the screen
			// !! not sure if this is good or just left over from isometric example
			this.depth(this._translate.y);
		}
		
		IgeEntity.prototype.update.call(this, ctx);
	},

	tick: function (ctx) {
		// Set the depth to the y co-ordinate which basically
		// makes the entity appear further in the foreground
		// the closer they become to the bottom of the screen
		this.depth(this._translate.y);
		IgeEntityBox2d.prototype.tick.call(this, ctx);
	},

	destroy: function () {
		// Destroy the texture object
		if (this._characterTexture) {
			this._characterTexture.destroy();
		}

		// Call the super class
		IgeEntityBox2d.prototype.destroy.call(this);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Character; }