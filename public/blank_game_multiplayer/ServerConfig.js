var config = {
	include: [
		//{name: 'MyClassName', path: './gameClasses/MyClassFileName'},
		{name: 'ExampleEntity', path: './gameClasses/ExampleEntity'}
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = config; }