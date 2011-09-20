window.brushes = window.brushes || {};
window.brushes['wavey'] = {
    name: 'wavey',
    len : 50,
	randomizePoints: false,
    points : 50,
    layers : 50,
    randomizeSpin: false,
    spin: 45,
	connectLines: true,
	
	/*size: {
		wave: 10,
		min: .1,
		max: .5
	},*/
	
	pressure: {
		/*min: 2,
		max: 3,
		wave: .2,
		randomize: false,*/
		softness: .5
	}
};