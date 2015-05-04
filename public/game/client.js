var Client = IgeClass.extend({
	classId: 'Client',
	init: function () {
		ige.showStats(1);
		ige.globalSmoothing(true);

		// Load our textures
		var self = this;
		this.obj = [];

		// Enable networking
		ige.addComponent(IgeSocketIoComponent);

		// Implement our game methods
		this.implement(ClientNetworkEvents);

		// Create the HTML canvas
		ige.createFrontBuffer(true);

		// Add physics and setup physics world
		ige.addComponent(IgeBox2dComponent)
			.box2d.sleep(true)
			.box2d.gravity(0, 0)
			.box2d.createWorld()
			.box2d.start();

		// Load the textures we want to use
		this.textures = {
			grassSheet: new IgeCellSheet('../assets/textures/tiles/grassSheet.png', 4, 1)
		};

		ige.on('texturesLoaded', function () {
			// Start the engine
			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {
					// Start the networking (you can do this elsewhere if it
					// makes sense to connect to the server later on rather
					// than before the scene etc are created... maybe you want
					// a splash screen or a menu first? Then connect after you've
					// got a username or something?
					ige.network.start('http://localhost:2000', function () {
					// ige.network.start('http://129.161.139.246:2000', function () {
						// Setup the network command listeners
						ige.network.define('playerEntity', self._onPlayerEntity); // Defined in ./gameClasses/ClientNetworkEvents.js

						// Setup the network stream handler
						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(80) // Render the simulation 160 milliseconds in the past
							// Create a listener that will fire whenever an entity
							// is created because of the incoming stream data
							.stream.on('entityCreated', function (entity) {
								self.log('Stream entity created with ID: ' + entity.id());

							});

						// Create the scene
						self.mainScene = new IgeScene2d()
							.id('mainScene');

						// Create the main viewport
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.scene(self.mainScene)
							.drawBounds(true)
							.mount(ige);

						// Create the texture maps and load their map data
						self.backgroundLayer1 = new IgeTextureMap()
							.depth(0)
							.tileWidth(40)
							.tileHeight(40)
							.translateTo(0, 0, 0)
							//.drawGrid(10)
							.drawBounds(false)
							.autoSection(20)
							.loadMap(BackgroundLayer1)
							.mount(self.mainScene);

						// take this out to reduce distractions on screen
						// self.staticObjectLayer1 = new IgeTextureMap()
						// 	.depth(1)
						// 	.tileWidth(40)
						// 	.tileHeight(40)
						// 	.translateTo(0, 0, 0)
						// 	//.drawGrid(10)
						// 	.drawBounds(false)
						// 	.loadMap(StaticObjectLayer1)
						// 	.autoSection(20)
						// 	.mount(self.mainScene);

						// // Translate the camera to the initial player position
						// self.vp1.camera.lookAt(self.player1);
						// // this won't work when player is created somewhere else, can change

						// // Tell the camera to track our player character with some
						// // tracking smoothing (set to 20)
						// self.vp1.camera.trackTranslate(self.player1, 20);

						// Ask the server to create an entity for us
						ige.network.send('playerEntity');

					}); //ige.network.start('http://localhost:2000', function () {
				} // if (success) {
			}); //ige.start(function (success) {
		}); //ige.on('texturesLoaded', function () {
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }