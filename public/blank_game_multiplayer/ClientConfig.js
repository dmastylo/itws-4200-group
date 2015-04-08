var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		//'./gameClasses/MyClassFile.js',
		'./gameClasses/ExampleEntity.js',
		
		/* Standard game scripts */
		'./client.js',
		'./index.js'
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }