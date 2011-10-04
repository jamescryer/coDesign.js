$.caper = $.caper || {};
$.caper.brushes = $.caper.brushes || {};

$.caper.brushes['default'] = {
    name: 'default',
    len : 20,
	randomizePoints: true,
    points : 10,
    layers : 10,
    randomizeSpin: true,
    spin: 180,
	connectLines: true,
	size: {
		wave: .5,
		min: .1,
		max: 1
	},
	pressure: {
		max: 2,
		randomize: false,
		softness: .3
	}
};

$.caper.brushes['sketchy'] = {
    name: 'sketchy',
    len : 50,
	randomizePoints: true,
    points : 2,
    layers : 20,
    randomizeSpin: true,
    spin: 45,
	connectLines: true,
	
	size: {
		wave: .9,
		min: .1,
		max: 3
	},
	
	pressure: {
		min: 2,
		max: 3,
		wave: .2,
		randomize: true,
		softness: .5
	}
};

$.caper.brushes['wavey'] = {
    name: 'wavey',
    len : 50,
	randomizePoints: false,
    points : 50,
    layers : 50,
    randomizeSpin: false,
    spin: 45,
	connectLines: true,
	pressure: {
		softness: .5
	}
};