window.brushes = window.brushes || {};
window.brushes['sketchy'] = {
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