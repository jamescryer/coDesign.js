window.brushes = window.brushes || {};
window.brushes['default'] = {
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
		//min: 1,
		max: 2,
		//wave: .2,
		randomize: false,
		softness: .3
	}
	
};