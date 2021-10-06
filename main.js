import '/style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


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

class Road {
  constructor(imageArray) {
    this.curve;
    this.CreateRoad(imageArray);
    this.DrawRoad();
  }

  CreateRoad(imageArray){
    //Determines if the curve is gonna be left or right
    let isLeft = false;
    //Start an array for the curve.
    let vectorArray = [new THREE.Vector3(0,0,0)];

    //Randomly generate curves for the road
    let roadLength = 25;
    for (let i = 1; i <= imageArray.length; i++) {

      let vector;
      //Add a sign on the side of the road
      let sign = this.CreateSign(6, imageArray[i-1]);

      if (isLeft == false) {
        vector = new THREE.Vector3(THREE.Math.randFloat(5, 20), 0, i * roadLength);
        vectorArray.push(vector);

        sign.position.set(vector.x - 10 ,0,vector.z);

        isLeft = true;
      }
      else {
        vector = new THREE.Vector3(THREE.Math.randFloat(-5, -20), 0, i * roadLength);
        vectorArray.push(vector);

        sign.position.set(vector.x + 10,0,vector.z);

        isLeft = false;
      }
      
    }
    console.log(vectorArray);

    //Create the curve from the generated vectors
     const curve = new THREE.CatmullRomCurve3(
      vectorArray
    );
    curve.type = 'chordal';
    curve.closed = false;
    //Set the curve
    this.curve = curve;

  }
  DrawRoad() {
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
    shape.lineTo(0, -5);
    shape.lineTo(0, 5);

    // Extrude the path along the CatmullRom curve
    var pathGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var pathMaterial = new THREE.MeshLambertMaterial({ color: 0x46494d, wireframe: false });

    // Create mesh with the resulting geometry
    var mesh = new THREE.Mesh(pathGeometry, pathMaterial);

    //Add road
    scene.add(mesh);
  }

  CreateSign(height, imageLocation) {
    //Group the objects for the sign
    let sign = new THREE.Group();
    //The picture on the sign.
    let planeGeometry = new THREE.PlaneGeometry(7, 4);
    let planetexture = new THREE.TextureLoader().load(imageLocation);
    let planeMaterial = new THREE.MeshPhongMaterial({ map: planetexture });
    let SignPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    let SignPlaneBack = new THREE.Mesh(planeGeometry, planeMaterial);

    //Point it backwards
    SignPlaneBack.rotateY(Math.PI * 1);

    SignPlane.position.y = height;
    SignPlaneBack.position.y = height;

    sign.add(SignPlane);
    sign.add(SignPlaneBack);

    //Add some pillars that hold the sign.
    let pillar1 = this.CreatePillar(height - SignPlane.geometry.parameters.height/2);
    let pillar2 = this.CreatePillar(height - SignPlane.geometry.parameters.height/2);

    //Calculate the position of the pillars for compatability with different sizes.
    let pillarOffset = 2;
    pillar1.position.x = -SignPlane.geometry.parameters.width/2 + pillarOffset;
    pillar2.position.x = SignPlane.geometry.parameters.width/2 - pillarOffset;

    sign.add(pillar1);
    sign.add(pillar2);

    //Add a frame
    let frame = this.CreateFrame(SignPlane);
    // SignPlane.rotation.y = Math.PI * .1;
    sign.add(frame);
    scene.add(sign);

    return sign;
  }
  CreatePillar(height) {
    //Add the pillar for sign.
    let pillarGeometry = new THREE.CylinderGeometry(.2, .2, height, 32);
    let pillarMaterial = new THREE.MeshPhongMaterial({ color: 0x4d5157 });
    let pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.y = height/2;
    return pillar;
  }
  CreateFrame(plane){
    let frame = new THREE.Group();
    //Get the height and size of the plane
    let planeSize = plane.geometry.parameters;

    //Add a frame to the plane.
    let topFrame = this.CreateFrameBox(planeSize.width + .1, .1);
    let bottomFrame = this.CreateFrameBox(planeSize.width + .1, .1);
    let leftFrame = this.CreateFrameBox(.1, planeSize.height);
    let rightFrame = this.CreateFrameBox(.1, planeSize.height);

    //Calculate and move the frames to correct position.
    //Top/Bottom frames
    topFrame.position.y = plane.position.y + planeSize.height/2;
    bottomFrame.position.y = plane.position.y + -planeSize.height/2;
    //Side frames
    leftFrame.position.y = plane.position.y;
    rightFrame.position.y = plane.position.y;
    leftFrame.position.x = -planeSize.width/2;
    rightFrame.position.x = planeSize.width/2;

    frame.add(topFrame);
    frame.add(bottomFrame);
    frame.add(leftFrame);
    frame.add(rightFrame);
    return frame;
  }

  CreateFrameBox(width, height){
    let frameGeometry = new THREE.BoxGeometry(width,height,.3);
    let frameMaterial = new THREE.MeshPhongMaterial({ color: 0x4d5157 });
    let frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    return frameMesh;
  }

}

class Car {
  constructor(car) {
    this.car = car;
    this.carPosition = new Vector3();
    scene.add(this.car);
  }
  MoveCarOnRoad(curveRoad) {
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

//Set the skybox
// const textureLoader = new THREE.TextureLoader();
// let bgTexture = textureLoader.load('highway.jpg');
// scene.background = bgTexture;

//#endregion

// Geometry

//The ground
const planeGeometry = new THREE.PlaneGeometry(100, 300);
const material = new THREE.MeshPhongMaterial({ color: 0xff6347 });
const GroundPlane = new THREE.Mesh(planeGeometry, material);

GroundPlane.position.setY(-0.1);
GroundPlane.rotation.x = Math.PI * -.5;

//Car 
//Declare object outside, else we cant use car object later
var car;
// let carMesh;
modelLoader.load('car.glb', function (gltf) {
  car = new Car(gltf.scene);
})


scene.add(GroundPlane);

const carPosition = new THREE.Vector3();

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

// const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(gridHelper)

const controls = new OrbitControls(camera, renderer.domElement);
camera.rotation.x = -0.7;


//#region  ROAD

//Create a road from the curve
let testArray = ['TeleTavleHelper.png','TeleTavleHelper.png','TeleTavleHelper.png','TeleTavleHelper.png','TeleTavleHelper.png','TeleTavleHelper.png']
var road = new Road(testArray);

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
  if (car) {
    car.MoveCarOnRoad(road.curve);
    thirdPersonCamera.Update(car.car)
  }

  renderer.render(scene, camera);

  //Make the camera follow the car.
}
//#endregion

animate();


