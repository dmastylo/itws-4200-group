var ExampleEntity = IgeEntity.extend({
	classId: 'ExampleEntity',
	
	init: function () {
		IgeEntity.prototype.init.call(this);

		// if not running on the server load textures
		if(!ige.isServer) {
			// load the ship texture that was loaded in client.js
			this.texture(ige.client.textures.ship)
				.width(50)
				.height(50);
		}
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ExampleEntity; }