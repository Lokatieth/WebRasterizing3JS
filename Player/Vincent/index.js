

var renderer, camera, material, scene, mesh, gui, flakon;
var rotationSpeedX = 0;
var rotationSpeedZ = 0;

var group = new THREE.Group();
var typeOfRing = "demi_jonc";
var ringThickness = "3"
// var shaderMaterial = new THREE.shaderMaterial
var uniforms1, uniforms2;
var clock = new THREE.Clock;
// var vertexShader = "varying vec2 vUv; void main()	{		vUv = uv;		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );		gl_Position = projectionMatrix * mvPosition;	}";
var vertexShader = [
          "varying vec2 vUv;",

          "void main()",
           "{",
               "vUv = uv;",
               "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
           "}"
         ].join('\n');

var vertexShader2 = [
    "uniform float mRefractionRatio;",
    "uniform float mFresnelBias;",
    "uniform float mFresnelScale;",
    "uniform float mFresnelPower;",
    "varying vec3 vReflect;",
    "varying vec3 vRefract[3];",
    "varying float vReflectionFactor;",
    "void main() {",
	     "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
	     "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
	     "vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
	     "vec3 I = worldPosition.xyz - cameraPosition;",
	     "vReflect = reflect( I, worldNormal );",
	     "vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );",
	     "vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );",
	     "vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );",
	     "vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );",
	     "gl_Position = projectionMatrix * mvPosition;",
    "}",
].join("\n")
var fragment_shader4 = [
  "varying vec2 vUv;",
  "void main(){",
  "gl_FragColor = vec4(vec3(vUv, 0.), 1.);",
  "}"

].join("\n");
var  fragment_shader3 = [
  "uniform samplerCube tCube;",
  "varying vec3 vReflect;",
  "varying vec3 vRefract[3];",
  "varying float vReflectionFactor;",
  "void main() {",
    "vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
    "vec4 refractedColor = vec4( 1.0 );",
    "refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
    "refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
    "refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",
    "gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",
  "}"
].join('\n');

var fragment_shader2 = [
  "uniform float time;",
	"uniform vec2 resolution;",
	"uniform sampler2D texture;",
	"varying vec2 vUv;",
	"void main( void ) {",
		"vec2 position = -1.0 + 2.0 * vUv;",
		"float a = atan( position.x, position.y );",
		"float r = sqrt( dot( position, position ) );",
		"vec2 uv;",
		"uv.x = sin( a ) / r;",
		"uv.y = cos( a ) / r;",
		"uv /= 10.0;",
		"uv += time * 0.05;",
		"vec3 color = texture2D( texture, uv ).rgb;",
		"gl_FragColor = vec4( color * r * 1.5, 1.0 );",
		"}"
].join('\n');

var fragment_shader1 = [
  "uniform vec2 resolution;",
			"uniform float time;",
			"varying vec2 vUv;",
			"void main(void)",
			"{",
				"vec2 p = -1.0 + 2.0 * vUv;",
				"float a = time*40.0;",
				"float d,e,f,g=1.0/40.0,h,i,r,q;",
				"e=400.0*(p.x*0.5+0.5);",
				"f=400.0*(p.y*0.5+0.5);",
				"i=200.0+sin(e*g+a/150.0)*20.0;",
				"d=200.0+cos(f*g/2.0)*18.0+cos(e*g)*7.0;",
				"r=sqrt(pow(i-e,2.0)+pow(d-f,2.0));",
				"q=f/r;",
				"e=(r*cos(q))-a/2.0;f=(r*sin(q))-a/2.0;",
				"d=sin(e*g)*176.0+sin(e*g)*164.0+r;",
				"h=((f+d)+a/2.0)*g;",
				"i=cos(h+r*p.x/1.3)*(e+e+a)+cos(q*g*6.0)*(r+h/3.0);",
				"h=sin(f*g)*144.0-sin(e*g)*212.0*p.x;",
				"h=(h+(f-e)*q+sin(r-(a+h)/7.0)*10.0+i/4.0)*g;",
				"i+=cos(h*2.3*sin(a/350.0-q))*184.0*sin(q-(r*4.3+a/12.0)*g)+tan(r*g+h)*184.0*cos(r*g+h);",
				"i=mod(i/5.6,256.0)/64.0;",
				"if(i<0.0) i+=4.0;",
				"if(i>=2.0) i=4.0-i;",
				"d=r/350.0;",
				"d+=cos(d*d*8.0)*0.52;",
				"f=(cos(a*g)+1.0)/2.0;",
				"gl_FragColor=vec4(vec3(f*i/1.6,i/2.0+d/13.0,i)*d*p.x+vec3(i/1.3+d/8.0,i/2.0+d/18.0,i)*d*(1.0-p.x),1.0);",
			"}"
].join('\n');

  var shader = fragment_shader1;


    init();
    var startTime = Date.now();
    animate();




    function getDiamondCube()
    {
      var path = '../Static/Textures/diamond';
      var format = '.png';
      var urls = [
        path + '_px' + format, path + '_nx' + format,
        path + '_py' + format, path + '_ny' + format,
        path + '_pz' + format, path + '_nz' + format
        ];
      var diamondCube = new THREE.CubeTextureLoader().load( urls );
      diamondCube.format = THREE.RGBFormat;

      return diamondCube;
    }

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
          scene.background = reflectionCube;
    			// scene.background = 0xffffff;

          return reflectionCube;
    }


  function datGuiInit()
  {
    gui = new dat.GUI({
      height : 5 * 32 - 1
    });
    var params = {
      shader : fragment_shader1,
      rotationSpeedX : 0.01,
      rotationSpeedZ : 0.01,
      ringShape: 0,
      ringThickness: "3",
      SpeedReset:function(){
        rotationSpeedX = 0;
        rotationSpeedZ = 0;
      },
      PositionReset:function(){
        group.rotation.x = 0;
        group.rotation.z = 0;
      }
    };
    gui.add(params, 'SpeedReset');
    gui.add(params, 'PositionReset');
    gui.add(params, 'rotationSpeedX').min(-0.05).max(0.05).onFinishChange(function(value){
      rotationSpeedX = value;
    });
    gui.add(params, 'rotationSpeedZ').min(-0.05).max(0.05).onFinishChange(function(value){
      rotationSpeedZ = value;
    });
    gui.add(params, 'ringShape', { demiJonc: "demi_jonc", rectangle: "rectangle", ovale: "ovale" } ).onFinishChange(function(value){
      typeOfRing = value;
    });
    gui.add(params, 'ringThickness', { 2: "2", 3: "3", 4: "4" } ).onFinishChange(function(value){
      ringThickness = value;
    });
    gui.add(params, 'shader', { 1: fragment_shader1, 2: fragment_shader2, 3: fragment_shader3, 4: fragment_shader4} ).onFinishChange(function(value){
      newFragmentShader = value;
      console.log(newFragmentShader);

      switch (newFragmentShader) {

        case fragment_shader1:
          newUniform = uniforms1;
          newVertexShader = vertexShader;
          break;
        case fragment_shader2:
          newUniform = uniforms2;
          newVertexShader = vertexShader;
          break;
        case fragment_shader3:
          newUniform = uniforms3;
          newVertexShader = vertexShader2;
          break;
        case fragment_shader4:
          newUniform = uniforms1;
          newVertexShader = vertexShader;
          break;
      }
      mesh.material =  new THREE.ShaderMaterial( {
          uniforms: newUniform,
          // uniforms: params[ 0 ][ 1 ],
          vertexShader: newVertexShader,
          fragmentShader: newFragmentShader
          // fragmentShader: params[ 0 ][ 0 ]
        } )
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
    // greenPunctualLight.position.set(0, 50, 0);
    // scene.add( greenPunctualLight );

    var whitePunctualLight = new THREE.PointLight(0xff0000, 1, 200);
    whitePunctualLight.position.set(-100, 0, 100);
    scene.add( whitePunctualLight );

    var whitePunctualLight2 = new THREE.PointLight(0xffffff, 1, 200);
    whitePunctualLight2.position.set(100, 0, 100);
    scene.add( whitePunctualLight2 );

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
        var material = new THREE.MeshPhongMaterial( {
          // map: texture
        } );
      },
    );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    renderer.setClearColor( 0xffffff, 1 );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 100);
    scene.add(camera);

    initLights();
    datGuiInit();
    initBackground();


    var loadOBJ = function()
    {
      // var material = new THREE.MeshStandardMaterial({
      //     // map:   loader.load('../Static/Textures/disturb.jpg'),
      //     // normalMap: loader.load('../Static/Textures/relief_normale.jpg'),
      //     envMap: initBackground(),
      //     // envMap:   loader.load('../Static/Textures/yellow_gold.png'),
      //     // roughnessMap: loader.load('../Static/Textures/green_glossiness.jpg'),
      //     // roughnessMap: loader.load('../Static/Textures/green_glossiness.jpg'),
      //     roughness: 0,
      //     // reflectivity: 1,
      //     // envMapIntensity: 2,
      //     // color: 0xffeb7f,
      //     // overdraw: true,
      //   })
        // material.envMap.mapping = THREE.SphericalReflectionMapping;
        var material =   new THREE.ShaderMaterial( {
            uniforms: uniforms3,
            // uniforms: params[ 0 ][ 1 ],
            vertexShader: vertexShader2,
            fragmentShader: fragment_shader3,
            // fragmentShader: params[ 0 ][ 0 ]
            // wireframe: true,
          } )
      var manager = new THREE.LoadingManager();
      var ObjLoader = new THREE.OBJLoader();
      ObjLoader.load('../Static/Textures/simple.txt', function(object) {
        flakon = object;
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            // /*
            // child.material.roughnessMap.wrapS = THREE.RepeatWrapping;
            // child.material.roughnessMap.wrapT = THREE.RepeatWrapping;
            // child.material.roughnessMap.repeat.set( 1, 1 );
          // */
            // child.material.roughnessMap.mapping = THREE.SphericalReflectionMapping;
            // child.material.envMap.mapping = THREE.SphericalReflectionMapping;
            //child.geometry.computeVertexNormals();
            child.rotation.y = -Math.PI / 2;
            // child.position.x = 30;



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

            group.add(part1, part2, part3, part4);



          }
        });
        scene.add(group);


        return object;
      });
    };




    var loadflakonOBJ = function()
    {
        var material =   new THREE.ShaderMaterial( {
            uniforms: uniforms1,
            vertexShader: vertexShader,
            fragmentShader: fragment_shader4,
            // wireframe: true,

          } )

          // var material = new THREE.MeshStandardMaterial({
          //     // map:   loader.load('../Static/Textures/seamless_marble.jpg'),
          //     // normalMap: loader.load('../Static/Textures/relief_normale.jpg'),
          //     // envMap: initBackground(),
          //     // envMap:   loader.load('../Static/Textures/yellow_gold.png'),
          //     // roughnessMap: loader.load('../Static/Textures/green_glossiness.jpg'),
          //     // roughnessMap: loader.load('../Static/Textures/green_glossiness.jpg'),
          //     // roughness: 0.2,
          //     // reflectivity: 1,
          //     // envMapIntensity: 2,
          //     // color: 0xffeb7f,
          //     //overdraw: true,
          //     wireframe: true,
          //   })
      var manager = new THREE.LoadingManager();
      var ObjLoader = new THREE.OBJLoader();
      ObjLoader.load('../Static/Textures/kenza.obj', function(object) {
        flakon = object;
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            // /*
            child.geometry.computeVertexNormals();
            child.rotation.y = 0;
            // child.rotation.x = -Math.PI / 2;
            // child.rotation.z = Math.PI / 2;
            child.position.x = 0;
            child.position.y = 0;
            child.scale *= new THREE.Vector3(0.2,0.2,0.2);
            scene.add(object);
            // group.add(object);
          }
        });
        scene.add(group);
      });
    };
    uniforms1 = {
			time:       { value: 1.0 },
			resolution: { value: new THREE.Vector2() }
		};
		uniforms2 = {
			time:       { value: 1.0 },
			resolution: { value: new THREE.Vector2() },
      texture:    { value: new THREE.TextureLoader().load("../Static/Textures/disturb.jpg") }
			// nMap:    { value: new THREE.TextureLoader().load("../Static/Textures/relief_normale.jpg") }
		};
		uniforms3 = {
			"mRefractionRatio": { value: 1.0  },
			"mFresnelBias": { value: 0.15 },
			"mFresnelPower": { value: 2.0 },
			"mFresnelScale": { value: 1.0 },
			// "tCube": { value: getDiamondCube() }
		};
    uniforms4 = {

    };
      uniforms2.texture.value.wrapS = uniforms2.texture.value.wrapT = THREE.RepeatWrapping;
		  var params = [
        [ 'fragment_shader4', uniforms1 ],
			[ 'fragment_shader3', uniforms2 ],
			[ 'fragment_shader2', uniforms1 ],
			[ 'fragment_shader1', uniforms1 ]
		];
    //
    // for( var i = 0; i < params.length; i++ ) {
    //   createObject(
    // 					new THREE.BoxGeometry(20, 20, 20),
    //           new THREE.ShaderMaterial( {
    // 						uniforms: params[ i ][ 1 ],
    // 						vertexShader: vertexShader,
    // 						fragmentShader: params[ i ][ 0 ]
    //           } ),
    //           [i * 15, 0, 0]
    //           );
    // 				}







    //
    createObject(
      new THREE.IcosahedronGeometry(20, 0),
      new THREE.MeshStandardMaterial({
        // color: 0xffffff,
        // roughness: 0.2,
        // envMapIntensity: 2,
      }),
      [0, 0, 0]
    );
    // createObject(
    //   new THREE.CubeGeometry(20, 20, 20),
    //   new THREE.ShaderMaterial( {
    //     uniforms: uniforms1,
    //     // uniforms: params[ 0 ][ 1 ],
    //     vertexShader: vertexShader,
    //     fragmentShader: fragment_shader4
    //     // fragmentShader: params[ 0 ][ 0 ]
    //   } ),
    //   [-30, 0, 0]
    // );

    // createObject(
    //   new THREE.TetrahedronGeometry(10, 2),
    //   new THREE.ShaderMaterial( {
    //     uniforms: uniforms1,
    //     // uniforms: params[ 0 ][ 1 ],
    //     vertexShader: vertexShader,
    //     fragmentShader: fragment_shader1
    //     // fragmentShader: params[ 0 ][ 0 ]
    //   } ),
    //   [0, 0, 0]
    // );



    loadOBJ();

    window.addEventListener( 'resize', onWindowResize, false );
  }

  // var controls = new THREE.OrbitControls( camera );
	// controls.minDistance = 1;
	// controls.maxDistance = 1000;

  function animate()
  {
    // hideAll();
    showRing(typeOfRing, ringThickness);
    // controls.update();
    requestAnimationFrame(animate);
    group.rotation.x += rotationSpeedX;
    group.rotation.z += rotationSpeedZ;
    var delta = clock.getDelta();
    uniforms1.time.value += delta;
    uniforms2.time.value += delta;
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
