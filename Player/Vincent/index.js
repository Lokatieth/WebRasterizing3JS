var renderer, camera, material, scene, mesh, gui, hand;
var rotationSpeedX = 0;
var rotationSpeedz = 0;
var group = new THREE.Group();
var typeOfRing = "ovale";
var ringThickness = "3"
    init();
    animate();






    function initBackground()
    {
    		var path = "../Static/Textures/";
    			var format = '.jpg';
    			var urls = [
    					path + 'posx' + format, path + 'negx' + format,
    					path + 'posy' + format, path + 'negy' + format,
    					path + 'posz' + format, path + 'negz' + format
    				];
    			var reflectionCube = new THREE.CubeTextureLoader().load( urls );
    			reflectionCube.format = THREE.RGBFormat;
          // scene.background = reflectionCube;
    			// scene.background = 0xffffff;

          return reflectionCube;
    }


  function datGuiInit()
  {
    gui = new dat.GUI({
      height : 5 * 32 - 1
    });
    var params = {
      rotationSpeedX : 0.01,
      rotationSpeedz : 0.02,
      ringShape: 0,
      ringThickness: "3",
      Reset:function(){
          rotationSpeedX = 0;
          rotationSpeedz = 0;
          group.rotation.x = 0;
          group.rotation.z = 0;
        },
    };
    gui.add(params, 'rotationSpeedX').min(-0.05).max(0.05).onFinishChange(function(value){
      rotationSpeedX = value;
    });
    gui.add(params, 'rotationSpeedz').min(-0.05).max(0.05).onFinishChange(function(value){
      rotationSpeedz = value;
    });
    gui.add(params, 'Reset');
    gui.add(params, 'ringShape', { demiJonc: "demi_jonc", rectangle: "rectangle", ovale: "ovale" } ).onFinishChange(function(value){
      typeOfRing = value;
    });
    gui.add(params, 'ringThickness', { 2: "2", 3: "3", 4: "4" } ).onFinishChange(function(value){
      ringThickness = value;
    });
  }

  function initLights()
  {
    // var redPunctualLight = new THREE.PointLight(0xff0000, 1, 100)
    // redPunctualLight.position.set(0, 35, 0);
    // scene.add( redPunctualLight );
    //
    // var bluePunctualLight = new THREE.PointLight(0x0000ff, 1, 200);
    // bluePunctualLight.position.set(35, 0, 0);
    // scene.add( bluePunctualLight );
    //
    // var greenPunctualLight = new THREE.PointLight(0x00ff00, 1, 200);
    // greenPunctualLight.position.set(-35, -35, 0);
    // scene.add( greenPunctualLight );
    //
    var whitePunctualLight = new THREE.PointLight(0xffffff, 1, 200);
    whitePunctualLight.position.set(0, 0, 100);
    scene.add( whitePunctualLight );

    var ambientLight = new THREE.AmbientLight(0xffffff, 0)
    scene.add( ambientLight );
  }

  function createObject(geometry, material, position)
  {
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position[0];
    mesh.position.y = position[1];
    mesh.position.z = position[2];
    group.add(mesh);
    scene.add(group);
  }


  function init()
  {

    var loader = new THREE.TextureLoader();
    loader.load(
    	'../Static/Textures/',
    	function ( texture ) {
    		var material = new THREE.MeshBasicMaterial( {
    			map: texture
    		 } );
    	},
    );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    renderer.setClearColor( 0xffffff, 1 );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 70);
    scene.add(camera);
    initLights();
    datGuiInit();
    initBackground();


    var loadOBJ = function()
    {
      var material = new THREE.MeshStandardMaterial({
          // map:   loader.load('../Static/Textures/seamless_marble.jpg'),
          // normalMap: loader.load('../Static/Textures/relief_normale.jpg'),
          envMap: initBackground(),
          // envMap:   loader.load('../Static/Textures/yellow_gold.png'),
          // roughnessMap: loader.load('../Static/Textures/green_glossiness.jpg'),
          // roughnessMap: loader.load('../Static/Textures/green_glossiness.jpg'),
          // roughness: 0.2,
          // reflectivity: 1,
          // envMapIntensity: 2,
          color: 0xffeb7f,
          //overdraw: true,
        })
        // material.shading = THREE.FlatShading;
      var manager = new THREE.LoadingManager();
      var ObjLoader = new THREE.OBJLoader();
      ObjLoader.load('../Static/Textures/simple.txt', function(object) {
        hand = object;
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            // /*
            // child.material.roughnessMap.wrapS = THREE.RepeatWrapping;
            // child.material.roughnessMap.wrapT = THREE.RepeatWrapping;
            // child.material.roughnessMap.repeat.set( 1, 1 );
          // */
            // child.material.roughnessMap.mapping = THREE.SphericalReflectionMapping;
            // child.material.normalMap.mapping = THREE.SphericalReflectionMapping;
            // child.material.envMap.mapping = THREE.SphericalReflectionMapping;
            //child.geometry.computeVertexNormals();
            child.rotation.y = -Math.PI / 2;



            var name = child.name.split('__');
    				var ring_shape = getInstanceByName(group, name[0]);
    				var thickness = getInstanceByName(ring_shape, name[1]);
    				var part1 = child.clone();
    				thickness.add(part1);

    				var part2 = child.clone();
    				part2.rotateX((180 * Math.PI) / 180);
    				thickness.add(part2);

    				var part3 = child.clone();
    				part3.rotateY((180 * Math.PI) / 180);
    				thickness.add(part3);

    				var part4 = child.clone();
    				part4.rotateX((180 * Math.PI) / 180);
    				part4.rotateY((180 * Math.PI) / 180);
    				thickness.add(part4);

            //group.add(part1, part2, part3, part4);



          }
        });
        scene.add(group);


      });

    };
    loadOBJ();
    createObject(
      new THREE.CubeGeometry(20, 20, 20),
      new THREE.MeshStandardMaterial({
        map:   loader.load('../Static/Textures/relief.jpg'),
        normalMap: loader.load('../Static/Textures/relief_normale.jpg'),
        color: 0xffffff,
      }),
      [30, 0, 0]
    );

    createObject(
      new THREE.CubeGeometry(20, 20, 20),
      new THREE.MeshStandardMaterial({
        map:   loader.load('../Static/Textures/relief.jpg'),
        normalMap: loader.load('../Static/Textures/relief_normale.jpg'),
        envMap: initBackground(),
        // color: 0xffffff,
        roughness: 0.2,
        envMapIntensity: 2,
      }),
      [-30, 0, 0]
    );


    window.addEventListener( 'resize', onWindowResize, false );
  }

  function animate()
  {
    hideAll();
    showRing(typeOfRing, ringThickness);
    requestAnimationFrame(animate);
    group.rotation.x += rotationSpeedX;
    group.rotation.z += rotationSpeedz;
    renderer.render(scene, camera);
  }

  function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
  }



  function hideAll()
	{
		for (var childIndex in group.children)
		{
			var shapeObject = group.children[childIndex];
			for (var shapeIndex in shapeObject.children)
			{
				shapeObject.children[shapeIndex].visible = false;
			}
		}
	}

  function showRing(shape, thickness)
	{
		var shapeObject = getInstanceByName(group, shape);
		var thicknessObject = getInstanceByName(shapeObject, thickness);
		thicknessObject.visible = true;
	}


  // create and get instance of child object in mainObject
  function getInstanceByName(root, name) {
    var object = root.getObjectByName(name);
    if (!object)
    {
      var object = new THREE.Object3D();
      object.name = name;
      root.add(object);
    }
    return object;
  }
