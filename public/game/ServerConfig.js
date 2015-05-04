var igeConfig = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},
		{name: 'Character', path: './gameClasses/Character'},
		{name: 'PlayerComponent', path: './gameClasses/PlayerComponent'},
		{name: 'CaptureTheFlagContactListener', path: './gameClasses/CaptureTheFlagContactListener'},
		{name: 'Chest', path: './gameClasses/Chest'},
		{name: 'HealArea', path: './gameClasses/HealArea'}
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeConfig; }