import '/style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Road, ThirdPersonCamera, Car} from './classes.js';







//#region INIT
const scene = new THREE.Scene();

//Make camera with windows aspect ratio
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

var thirdPersonCamera = new ThirdPersonCamera(camera);

const modelLoader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
//Match window size.
renderer.setSize(window.innerWidth, window.innerHeight);
//Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.setZ(40);
camera.position.setY(20);

//Set the skybox
// const textureLoader = new THREE.TextureLoader();
// let bgTexture = textureLoader.load('highway.jpg');
// scene.background = bgTexture;

//#endregion

// Geometry

//The ground
const planeGeometry = new THREE.PlaneGeometry(300, 500);
let forestTexture = new THREE.TextureLoader().load('Materials/forest-floor/forest_floor_albedo.png');
forestTexture.wrapS = THREE.RepeatWrapping;
forestTexture.wrapT = THREE.RepeatWrapping;
forestTexture.repeat.set(7,7);

const forestMaterial = new THREE.MeshLambertMaterial({ map:  forestTexture});

const GroundPlane = new THREE.Mesh(planeGeometry, forestMaterial);

GroundPlane.receiveShadow = true;
GroundPlane.castShadow = true;

GroundPlane.position.setY(-0.1);
GroundPlane.rotation.x = Math.PI * -.5;

//Car 
//Declare object outside, else we cant use car object later
var car;
// let carMesh;
modelLoader.load('Objects/car.glb', function (gltf) {
  //Make all objects cast shadow
  gltf.scene.traverse( function( node ) {

    if ( node.isMesh ) { node.castShadow = true; }

} );
  car = new Car(gltf.scene, scene);
});


scene.add(GroundPlane);

// Lights

const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(200, 100, 350);
spotLight.castShadow = true;
// spotLight.shadow.bias = -0.0001;
spotLight.shadow.mapSize.width = 1024*5
spotLight.shadow.mapSize.height = 1024*5

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add( spotLight, ambientLight);

// Helpers

// const axesHelper = new THREE.AxesHelper(20);
// scene.add(axesHelper);

// const lightHelper = new THREE.SpotLightHelper(spotLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper)

const controls = new OrbitControls(camera, renderer.domElement);
camera.rotation.x = -0.7;


//#region  ROAD

//Create a road from the curve
let testArray = ['TeleTavleHelper.png','RandomSixOnline.png','TeleTavleHelper.png','TeleTavleHelper.png','TeleTavleHelper.png','TeleTavleHelper.png']
var road = new Road(testArray, scene);

//#endregion

var tunnel;
modelLoader.load('Objects/tunnel.glb', function (gltf) {
  //Set the position the the tunnel
  tunnel = gltf.scene
  tunnel.position.set(0,4,0);
  let tunnelRotation = road.curve.getTangentAt(.003);
  //Make sure the tunnel just faces the direction, not the y position, which makes it point down.
  tunnelRotation.y = tunnel.position.y;
  tunnel.lookAt(tunnelRotation);

  tunnel.castShadow = true;
  tunnel.receiveShadow = true;

  scene.add(tunnel);
});

//#region   ---EVENTS---
document.body.onscroll = moveOnScroll;

//#endregion
//#region   ---FUNCTIONS---
function moveOnScroll() {

  const t = document.body.getBoundingClientRect().top;

  car.position.z = -t * 0.01;

}



function animate() {
  requestAnimationFrame(animate);

  //Move the car on road & make sure both objects are loaded in.
  if (car && thirdPersonCamera) {
    car.MoveCarOnRoad(road.curve);
    // thirdPersonCamera.Update(car.car)
  }

  renderer.render(scene, camera);

  //Make the camera follow the car.
}
//#endregion

animate();


