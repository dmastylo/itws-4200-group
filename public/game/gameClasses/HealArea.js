// Define chest class
var Chest = IgeEntityBox2d.extend({
	classId: 'HealArea',

	init: function (data) {
		var self = this;
		IgeEntityBox2d.prototype.init.call(this);

		if(data.team !== undefined)
			this._team = data.team;

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
			self._healAreaTexture = new IgeCellSheet('../assets/textures/tiles/plantsgy7.png', 12, 8);
			// this._chestTextureRight = new IgeCellSheet('../assets/textures/tiles/vx-xp-176-chest03.png', 3, 4);

			console.log("creating new chest. about to set texture load callback.");
			// Wait for the texture to load
			self._healAreaTexture.on('loaded', function () {
				self.texture(self._healAreaTexture)
					.dimensionsFromCell();

				if (self._team == "red") {
					console.log("setting red heal are texture");
					self.setType(1);
				}
				else if (self._team == "blue") {
					console.log("setting blue heal are texture");
					self.setType(2);
				} else {
					console.log("setting unowned heal area texture");
					self.setType(0);
				}

			}, false, true);
		}
	},

	streamCreateData: function () {
	  return { 
	  	team: this._team
	  };
	},

	team: function (val) {
        if (val !== undefined) {
            this._team = val;
            return this;
        }
 
        return this._team;
    },

	setType: function(type) {
		switch(type) {
			case 0: 	// default chest
				this.cell(32);
				break;
			case 1: 	// red chest
				this.cell(43);
				break;
			case 2: 	// blue chest
				this.cell(20);
				break;
		}
	}

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Chest; }