

var renderer, camera, material, scene, mesh, gui, hand;
var rotationSpeedX = 0;
var rotationSpeedZ = 0;
var currentShaderIndex = 0;
var oldShaderIndex = 0;

var group = new THREE.Group();
var typeOfRing = "ovale";
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
               "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0);",
               "gl_Position = projectionMatrix * mvPosition;",
           "}"
         ].join('\n');

// var fragment_shader4 = "uniform float time;uniform vec2 resolution;varying vec2 vUv;void main( void ) {	vec2 position = -1.0 + 2.0 * vUv;	float red = abs( sin( position.x * position.y + time / 5.0 ) );	float green = abs( sin( position.x * position.y + time / 4.0 ) );	float blue = abs( sin( position.x * position.y + time / 3.0 ) );	gl_FragColor = vec4( red, green, blue, 1.0 );}";
var fragment_shader4 = [
    "precision mediump float;",
    "varying vec2 vUv;",
    "uniform float time;",
    "float random(float p) {",
      "return fract(sin(p)*10000.);",
    "}",
    "float noise(vec2 p) {",
      "return random(p.x + p.y*10000.);",
    "}",
    "vec2 sw(vec2 p) {return vec2( floor(p.x) , floor(p.y) );}",
    "vec2 se(vec2 p) {return vec2( ceil(p.x)  , floor(p.y) );}",
    "vec2 nw(vec2 p) {return vec2( floor(p.x) , ceil(p.y)  );}",
    "vec2 ne(vec2 p) {return vec2( ceil(p.x)  , ceil(p.y)  );}",
    "float smoothNoise(vec2 p) {",
      "vec2 inter = smoothstep(0., 1., fract(p));",
      "float s = mix(noise(sw(p)), noise(se(p)), inter.x);",
      "float n = mix(noise(nw(p)), noise(ne(p)), inter.x);",
      "return mix(s, n, inter.y);",
      "return noise(nw(p));",
    "}",
    "float movingNoise(vec2 p) {",
      "float total = 0.0;",
      "total += smoothNoise(p     - time);",
      "total += smoothNoise(p*2.  + time) / 2.;",
      "total += smoothNoise(p*4.  - time) / 4.;",
    "  total += smoothNoise(p*8.  + time) / 8.;",
      "total += smoothNoise(p*16. - time) / 16.;",
      "total /= 1. + 1./2. + 1./4. + 1./8. + 1./16.;",
      "return total;",
    "}",
    "float nestedNoise(vec2 p) {",
      "float x = movingNoise(p);",
      "float y = movingNoise(p + 100.);",
      "return movingNoise(p + vec2(x, y));",
    "}",
    "void main() {",
      "vec2 p = vUv * 6.;",
      "float brightness = nestedNoise(p);",
      "gl_FragColor.rgb = vec3(brightness);",
      "gl_FragColor.a = 1.;",
    "}"
].join("\n");
var fragment_shader3 = [
      "uniform float time;",
			"uniform vec2 resolution;",
			"varying vec2 vUv;",
			"void main( void ) {",
			"vec2 position = vUv;",
			"float color = 0.0;",
			"color += sin( position.x * cos( time / 15.0 ) * 80.0 ) + cos( position.y * cos( time / 15.0 ) * 10.0 );",
			"color += sin( position.y * sin( time / 10.0 ) * 40.0 ) + cos( position.x * sin( time / 25.0 ) * 40.0 );",
			"color += sin( position.x * sin( time / 5.0 ) * 10.0 ) + sin( position.y * sin( time / 35.0 ) * 80.0 );",
			"color *= sin( time / 10.0 ) * 0.5;",
			"gl_FragColor = vec4( vec3( color, color * 0.5, sin( color + time / 3.0 ) * 0.75 ), 1.0 );",
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
				"d+=sin(d*d*8.0)*0.52;",
				"f=(sin(a*g)+1.0)/2.0;",
				"gl_FragColor=vec4(vec3(f*i/1.6,i/2.0+d/13.0,i)*d*p.x+vec3(i/1.3+d/8.0,i/2.0+d/18.0,i)*d*(1.0-p.x),1.0);",
			"}"
].join('\n');

  var shader = fragment_shader1;


    init();
    var startTime = Date.now();
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
      shader = value;
      console.log(shader);
      currentShaderIndex += 1;
      var newniform = (value == fragment_shader2 ? uniforms2 : uniforms1);

      mesh.material =   new THREE.ShaderMaterial( {
          uniforms: newniform,
          // uniforms: params[ 0 ][ 1 ],
          vertexShader: vertexShader,
          fragmentShader: shader
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

    uniforms1 = {
			time:       { value: 1.0 },
			resolution: { value: new THREE.Vector2() }
		};
		uniforms2 = {
			time:       { value: 1.0 },
			resolution: { value: new THREE.Vector2() },
			texture:    { value: new THREE.TextureLoader().load("../Static/Textures/disturb.jpg") }
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






    // loadOBJ();

    //
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
    createObject(
      new THREE.CubeGeometry(20, 20, 20),
      new THREE.ShaderMaterial( {
        uniforms: uniforms1,
        // uniforms: params[ 0 ][ 1 ],
        vertexShader: vertexShader,
        fragmentShader: shader
        // fragmentShader: params[ 0 ][ 0 ]
      } ),
      [0, 0, 0]
    );


    window.addEventListener( 'resize', onWindowResize, false );
  }

  // var controls = new THREE.OrbitControls( camera );
	// controls.minDistance = 1;
	// controls.maxDistance = 1000;

  function animate()
  {
    if (currentShaderIndex != oldShaderIndex)
    {
      shader = shader
    }
    hideAll();
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
