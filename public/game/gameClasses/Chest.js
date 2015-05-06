// Define chest class
var Chest = IgeEntityBox2d.extend({
	classId: 'Chest',

	init: function (data) {
		var self = this;
		IgeEntityBox2d.prototype.init.call(this);

		if(data.team !== undefined)
			this._team = data.team;

		this._taken = false;
		if(data.taken !== undefined)
			this._taken = data.taken;

		self.box2dBody({
			type: 'static',
			allowSleep: true,
			fixtures: [{
				shape: {
					type: 'rectangle'
				}
			}]
		});

		if (!ige.isServer) {

			// add animation componet 
			self.addComponent(IgeAnimationComponent)
				.depth(1);

			// Load the chest texture file
			self._chestTexture = new IgeCellSheet('../assets/textures/tiles/flags.png', 3, 4);
			// this._chestTextureRight = new IgeCellSheet('../assets/textures/tiles/vx-xp-176-chest03.png', 3, 4);

			console.log("creating new chest. about to set texture load callback.");
			// Wait for the texture to load
			self._chestTexture.on('loaded', function () {
				self.texture(self._chestTexture)
					.dimensionsFromCell();

				if (self._team == "red") {
					console.log("setting red chest texture");
					self.setType(1);
				}
				else if (self._team == "blue") {
					console.log("setting blue chest texture");
					self.setType(2);
				} else {
					console.log("setting unowned chest texture");
					self.setType(0);
				}

			}, false, true);
		}

		this.streamSections(['transform', 'taken']);
	},

	streamCreateData: function () {
	  return { 
	  	team: this._team,
	  	taken: this._taken
	  };
	},

	streamSectionData: function (sectionId, data) {
		// See Character.js for explanation of what's happening
		if (sectionId === 'taken') {
			if (data !== undefined) {
				this.taken(data);
			} else {
				return this._taken;
			}
		} else {
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

    taken: function (val) {
        if (val !== undefined) {
            this._taken = val;
            // call update texture whenever taken is updated
            this.updateTexture();
            return this;
        }
 
        return this._taken;
    },

	setType: function(type) {
		this._type = type;
		this.updateTexture();
	},

	updateTexture: function() {
		// set the texture based on if the chest is open or closed and the team
		// if the chest is open add 9 to all the cell indexes
		var taken_state_shift = (!this._taken ? 0 : 9);
		switch(this._type) {
			case 0: 	// default chest
				this.cell(1 + taken_state_shift);
				break;
			case 1: 	// red chest
				this.cell(2 + taken_state_shift);
				break;
			case 2: 	// blue chest
				this.cell(3 + taken_state_shift);
				break;
		}
	}


});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Chest; }