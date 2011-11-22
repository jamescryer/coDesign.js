$.coDesign = $.coDesign || {};
$.coDesign.brushes = $.coDesign.brushes || {};

$.coDesign.brushes['webby'] = {
    name: 'Webby',
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

$.coDesign.brushes['sketchy'] = {
    name: 'Sketchy',
    len : 50,
	randomizePoints: true,
    points : 2,
    layers : 20,
    randomizeSpin: false,
    spin: 45,
	connectLines: true,
	
	size: {
		wave: .9,
		min: .1,
		max: 2
	},
	
	pressure: {
		min: 2,
		max: 3,
		wave: .2,
		randomize: true,
		softness: .5
	}
};

$.coDesign.brushes['spray'] = {
    name: 'Spray',
	'default': false,
    len : 10,
	randomizePoints: true,
    randomizeSpin: true,
    spin: 360,
    points : 5,
    layers : 70,
	connectLines: false,
	pressure: {
		softness: 0
	}
};

$.coDesign.brushes['solid'] = {
    name: 'Solid',
	'default': true,
    len : 1,
	randomizePoints: false,
    points : 40,
    layers : 15,
	connectLines: true,
	pressure: {
		softness: 0
	}
};