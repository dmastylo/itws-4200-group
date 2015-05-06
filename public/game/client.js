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

		// add in engine editor
		ige.addComponent(IgeEditorComponent);

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
						ige.network.define('authFailed', self._onAuthFailed);
						ige.network.define('scoreUpdate', self._onScoreUpdate)

						// Setup the network stream handler
						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(80) // Render the simulation 160 milliseconds in the past
							// Create a listener that will fire whenever an entity
							// is created because of the incoming stream data
							.stream.on('entityCreated', function (entity) {
								self.log('Stream entity created with ID: ' + entity.id());

							});

						// Add base scene data to graph
						// ige.addGraph('IgeBaseScene');

						// add a game and ui scene
						self.mainScene = new IgeScene2d()
							.id('mainScene');

						self.uiScene = new IgeScene2d()
							.id('uiScene')
							.depth(1)
							.ignoreCamera(true);
							// .mount(self.mainScene);

						// Create the main viewport
						self.game_vp = new IgeViewport()
							.id('game_vp')
							.left(0)
							.middle(0)
							.top(50)
							// .width(1200)
							// .height(800)
							.autoSize(true)
							.scene(self.mainScene)
							.drawBounds(true)
							.mount(ige);

						self.ui_vp = new IgeViewport()
							.id('ui_vp')
							.left(0)
							.top(0)
							.width('100%')
							.height(50)
							// .originTo(1, 1, 0)
							.autoSize(false)
							.scene(self.uiScene)
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



						// UI styles
						ige.ui.style('IgeUiLabel', {
							'font': '12px Open Sans',
							'color': '#000000'
						});

						ige.ui.style('#uiBox', {
							'backgroundColor': '#eeeeee'
						});

						ige.ui.style('#gameTitle', {
							'font': '3em Open Sans',
							'color': '#666666',
							'width': 230,
							'height': 40,
							'top': 10,
							'left': '43%'
						});

						ige.ui.style('#red_score_label', {
							'color': '#FF0000',
							'font': '2em Open Sans',
							'width': 230,
							'height': 40,
							'top': 10,
							'left': '80%'

						});

						ige.ui.style('#blue_score_label', {
							'color': '#0000FF',
							'font': '2em Open Sans',
							'width': 230,
							'height': 40,
							'top': 10,
							'left': '10%'
						});

						ige.ui.style('#ready', {
							'color': '#000000',
							'backgroundColor': '#0000FF',
							'font': '2em Open Sans',
							'width': 70,
							'height': 40,
							'left': '0%'
						});

						// UI elements
						var uiBox = new IgeUiElement()
							.width('100%')
							.height(50)
							.id('uiBox')
							.mount(self.uiScene);

						var ready = new IgeUiLabel()
							.id('ready')
							.value('Ready!')
							.mount(uiBox);

						new IgeUiLabel()
							.id('gameTitle')
							.value('Capture The Flag!')
							.mount(uiBox);

						var red_score_label = new IgeUiLabel()
							.id('red_score_label')
							.value('Red Score: 0')
							.mount(uiBox);

						var blue_score_label = new IgeUiLabel()
							.id('blue_score_label')
							.value('Blue Score: 0')
							.mount(uiBox);

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
						// self.game_vp.camera.lookAt(self.player1);
						// // this won't work when player is created somewhere else, can change

						// // Tell the camera to track our player character with some
						// // tracking smoothing (set to 20)
						// self.game_vp.camera.trackTranslate(self.player1, 20);

						// Ask the server to create an entity for us
						ige.network.send('playerEntity');

						// ige.network.send('playerAuthenticate', { username: 'test1', password: 'pass1' });

					}); //ige.network.start('http://localhost:2000', function () {
				} // if (success) {
			}); //ige.start(function (success) {
		}); //ige.on('texturesLoaded', function () {
	}
});



if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }