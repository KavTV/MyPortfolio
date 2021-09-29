import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Vector3 } from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';


class ThirdPersonCamera {

  Update(geometry) {
    var temp = new THREE.Vector3;

    //Set offset
    temp.y = geometry.position.y + 10;
    temp.z = geometry.position.z + 10;
    temp.x = geometry.position.x;

    camera.position.lerp(temp, 0.2);
  }
}

class Road{
constructor(curve){
  this.curve = curve;
}
  CreateRoad(){
    const points = this.curve.getPoints(80);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const linematerial = new THREE.LineBasicMaterial({ color: 0xffffff });
    
    //Draw a line from the created road
    const curveLine = new THREE.Line(geometry, linematerial);
    scene.add(curveLine);
    
    //Settings for the road
    var extrudeSettings = {
      steps: 100,
      bevelEnabled: true,
      extrudePath: this.curve,
      bevelThickness: 0
    };
    
    
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0,-5);
    shape.lineTo(0, 5);
    
    // Extrude the path along the CatmullRom curve
    var pathGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var pathMaterial = new THREE.MeshLambertMaterial({ color: 0x46494d, wireframe: false });
    
    // Create mesh with the resulting geometry
    var mesh = new THREE.Mesh(pathGeometry, pathMaterial);
    
    //Add road
    scene.add(mesh);
  }
}

class Car{
constructor(car){
  this.car = car;
  this.carPosition = new Vector3();
  scene.add(this.car);
}
MoveCarOnRoad(curveRoad){
  const time = performance.now();
  //Find the delta time
  const delta = time - prevTime;

  progress += velocity;
  progress = progress % 1;

  car.carPosition.copy(curveRoad.getPointAt(progress));
  //Offset for car height
  car.carPosition.y += 0.7;
  //Offset for the side of the road
  car.carPosition.x += -3;

  car.car.position.copy(car.carPosition);

  tangent.copy(curveRoad.getTangentAt(progress));

  velocity -= tangent.y * 0.0000001 * delta;
  velocity = Math.max(0.0005, Math.min(0.0002, velocity));
  //Turn model in direction of the path
  car.car.lookAt(lookAt.copy(car.carPosition).sub(tangent));
}
  
}

//#region INIT
const scene = new THREE.Scene();

//Make camera with windows aspect ratio
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var thirdPersonCamera = new ThirdPersonCamera();

const modelLoader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
//Match window size.
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(40);
camera.position.setY(20);


renderer.render(scene, camera);

//#endregion

// Geometry

const planeGeometry = new THREE.PlaneGeometry(30, 40);
const material = new THREE.MeshPhongMaterial({ color: 0xff6347 });
const GroundPlane = new THREE.Mesh(planeGeometry, material);
GroundPlane.position.setY(-0.1);
GroundPlane.rotation.x = Math.PI * -.5;

//Car 
//Declare object outside, else we cant use car object later
var car;
// let carMesh;
modelLoader.load('car.glb', function(gltf){
  car = new Car(gltf.scene); 
})



// scene.add(GroundPlane);
const carPosition = new THREE.Vector3();

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(gridHelper)

const controls = new OrbitControls(camera, renderer.domElement);
camera.rotation.x = -0.7;


//#region  ROAD


//Create the vectors (points) for the curved road
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(10, 0, 20),
  new THREE.Vector3(-10, 0, 40),
  new THREE.Vector3(10, 0, 60),
  new THREE.Vector3(-10, 0, 80),
  new THREE.Vector3(10, 0, 100)
]);
curve.type = 'chordal';
curve.closed = false;

//Create a road from the curve
var road = new Road(curve);
road.CreateRoad(curve);


//#endregion


//#region   ---EVENTS---
document.body.onscroll = moveOnScroll;

//#endregion
//#region   ---FUNCTIONS---
function moveOnScroll() {

  const t = document.body.getBoundingClientRect().top;

  car.position.z = -t * 0.01;

}

//Used for moving the car.
const tangent = new THREE.Vector3();

const lookAt = new THREE.Vector3();

let velocity = 0;
let progress = 0;
let prevTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  //Move the car on road
  car.MoveCarOnRoad(road.curve);

  renderer.render(scene, camera);

  //Make the camera follow the car.
  thirdPersonCamera.Update(car.car)
}
//#endregion

animate();


