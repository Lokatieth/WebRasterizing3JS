// instantiate a loader
var loader = new THREE.TextureLoader();
// load a resource
loader.load(
			// resource URL
    '../Static/Textures/hand.obj',
			// Function when resource is loaded
		function ( object ) {
			scene.add( object );
			}
		);
loader.load(
	// resource URL
	'../Static/Textures/crate.jpg',
	// Function when resource is loaded
	function ( texture ) {
		// do something with the texture
		var material = new THREE.MeshBasicMaterial( {
			map: texture
		 } );
	},
	// Function called when download progresses
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
	// Function called when download errors
	function ( xhr ) {
		console.log( 'An error happened' );
	}
);
