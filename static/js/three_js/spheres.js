class SphereX {
    constructor(position, radius, color, id) {
        this.radius = radius;
        this.color = hashCode("0x" + color);

        this.z_mov = (Math.random() - 1) / 100;
        this.x_mov = (Math.random() - 1) / 100;
        this.y_mov = (Math.random() - 1) / 100;
        this.id = id;
        //console.log(this.position)
        this.position = new THREE.Vector3(position[0], position[1], position[2]);;

        let sphereGeometry = new THREE.SphereBufferGeometry(this.radius, 32, 32);
        let sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,//this.color,
            opacity: 0.50,
            transparent: true
        });

        let sphere_obj = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere_obj.castShadow = true; //default is false
        sphere_obj.receiveShadow = true; //default
        console.log(this.position.x, this.position.y, this.position.z);
        sphere_obj.position.set(this.position.x, this.position.y, this.position.z);
        // /sphere_obj.position(this.position);
        console.log(this.position, this.color, this.radius);
        return sphere_obj;

    }

    get_radius() {
        return this.radius;
    }
    get_mov() {
        return new THREE.Vector3(this.x_mov, this.y_mov, this.z_mov);
    }

}

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}
var sphere;
var controls;
var camera;
var renderer;
var scene;

var context = new AudioContext();


var spheres = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),
    INTERSECTED;
raycaster = new THREE.Raycaster();

// create a global audio source
var sound;
var audioLoader;
var listener;



function onMouseMove(event) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

function init() {

    var container = document.getElementById('container');


    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 0);

    // renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    //renderer.setClearColor( 0xffffff, 0);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    //document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.update();

    var light = new THREE.DirectionalLight(0xffffff, 1, 100);
    light.position.set(0, 1, 0); //default; light shining from top
    light.castShadow = true; // default false
    //Set up shadow properties for the light
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default

    scene.add(light);

    var light2 = new THREE.DirectionalLight(0xffffff, 1, 100);
    light2.position.set(0, -1, 0); //default; light shining from top
    light2.castShadow = true; // default false
    //Set up shadow properties for the light
    light2.shadow.mapSize.width = 512; // default
    light2.shadow.mapSize.height = 512; // default
    light2.shadow.camera.near = 0.5; // default
    light2.shadow.camera.far = 500; // default

    scene.add(light2);

    // sphere = new SphereX((0,5,1),1.5, 0xffffff);
    //scene.add(sphere);

    generate_spheres(5);
    console.log(spheres);
    spheres.forEach(function (sphere) {
        console.log(sphere.id)
        scene.add(sphere);
    });

    //camera.lookAt(new THREE.Vector3(0, 0, 0));


    //   /console.log( spheres[1].mov())

    //Create a plane that receives shadows (but does not cast them)
    // var planeGeometry = new THREE.PlaneBufferGeometry( 50,50, 1,1,);
    // var planeMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } )
    // var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    // plane.receiveShadow = true;
    // plane.castShadow=true;
    // scene.add( plane );

    //Create a helper for the shadow camera (optional)
    // var helper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(helper);

    controls.update();


    // White directional light at half intensity shining from the top.
    //var directionalLight = new THREE.AmbientLight( 0xffffff);
    //directionalLight.castShadow=true;
    //scene.add( directionalLight );


    camera.position.z = 10;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.lookAt(spheres[4].position);


    // create an AudioListener and add it to the camera
    listener = new THREE.AudioListener();
    camera.add(listener);
    sound = new THREE.Audio(listener);


    //loaded by jquery from flask page that parse the dir and returns the right song
    // audioLoader.load('static/songs/test_audio.mp3', function (buffer) {
    //     sound.setBuffer(buffer);
    //     sound.setLoop(true);
    //     sound.setVolume(0.5);
    //     sound.play();
    // });



}
var generate_spheres = function (n) {
    for (i = 0; i < n; i++) {
        var randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let r = Math.random() + 1;
        let x = Math.floor(Math.random() * 10) + 1;
        let y = Math.floor(Math.random() * 10) + 1;
        let z = Math.floor(Math.random() * 10) + 1;
        console.log(x, y, z, r, randomColor)
        spheres.push(new SphereX([x, y, z], r, randomColor, i))

    }
}
var animate = function () {
    requestAnimationFrame(animate);

    // sphere.rotation.x += 0.01;
    // sphere.rotation.y += 0.01;
    spheres.forEach(function (sphere) {
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;

        // sphere.position.x += sphere.get_mov().x;
        // sphere.rotation.y += sphere.get_mov().y;
    });

    // required if controls.enableDamping or controls.autoRotate are set to true
    //  controls.update();
    renderer.render(scene, camera);
    render();
};

function play_audio(sample) {

    var text = document.getElementById('text_overlay');
    text.innerHTML="Sound Recording "+sample+"<br><br>Type:\tTRAIN STATION<br>Location:\tKING'S CROSS"

    // load a sound and set it as the Audio object's buffer
    audioLoader = new THREE.AudioLoader();
    audioLoader.load('static/songs/test_audio.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });
    console.log("playing")
}

function stop_audio(sample) {
    var text = document.getElementById('text_overlay');
    text.innerHTML="Sound Recording "+sample
    // load a sound and set it as the Audio object's buffer
    audioLoader = new THREE.AudioLoader();
    audioLoader.load('static/songs/test_audio.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.stop();
    });
}

function render() {

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(spheres);

    // for ( var i = 0; i < intersects.length; i++ ) {

    // 	intersects[ i ].object.material.color.set( 0xff0000 );

    // }

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);
            console.log(INTERSECTED.id)
           
            
            if (INTERSECTED.id == 18) {
                INTERSECTED.material.emissive.setHex(0xffff00);

                play_audio(INTERSECTED.id);
            } else {
                stop_audio(INTERSECTED.id);
                
                var text = document.getElementById('text_overlay');
                text.innerHTML="Sound Recording "+sample
            }

        }

    } else {

        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = null;

    }

    renderer.render(scene, camera);

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function main() {
    var overlay = document.getElementById('overlay');
    console.log(overlay)
    overlay.remove();

    init();
    animate();
}


//main();

window.addEventListener('mousemove', onMouseMove, false);

window.requestAnimationFrame(render);

// // Existing code unchanged.
window.onload = function () {
    //this.listener.getContext()
    var context = new AudioContext();

    context.resume();

}

//   // One-liner to resume playback when user interacted with the page.
//   document.querySelector('button').addEventListener('click', function() {
//     context.resume().then(() => {
//       console.log('Playback resumed successfully');
//     });
//   });
var startButton = document.getElementById('startButton');
startButton.addEventListener('click', main);