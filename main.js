import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


class ThirdPersonCamera{
  constructor(params){
    this._params = params;
    this._camera = params.camera;
    this._currentPosition = new THREE.Vector3();
    this._currentLookat = new THREE.Vector3();
  }
  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-15, 20, -30);
    idealOffset.applyQuaternion(this._params.target.Rotation);
    idealOffset.add(this._params.target.Position);
    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 10, 50);
    idealLookat.applyQuaternion(this._params.target.Rotation);
    idealLookat.add(this._params.target.Position);
    return idealLookat;
  }

  Update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);

    this._camera.position.copy(this._currentPosition);
    this._camera.lookAt(this._currentLookat);
  }
}


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

this._thirdPersonCamera = new ThirdPersonCamera({
  camera: this._camera,
  target: this._controls,
});

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);
camera.position.setY(20);


renderer.render(scene, camera);



// Geometry

const planeGeometry = new THREE.PlaneGeometry(30,40);
const material = new THREE.MeshPhongMaterial({ color: 0xff6347 });
const GroundPlane = new THREE.Mesh(planeGeometry, material);
GroundPlane.position.setY(-0.1);
GroundPlane.rotation.x = Math.PI * -.5;

const carGeometry = new THREE.BoxGeometry(2,2);
const carMaterial = new THREE.MeshBasicMaterial({color: 0xfc0303})
const car = new THREE.Mesh(carGeometry, carMaterial);

scene.add(GroundPlane);
scene.add(car);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
scene.add( gridHelper)

const controls = new OrbitControls(camera, renderer.domElement);
camera.rotation.x = -0.7;

function moveOnScroll(){

  const t = document.body.getBoundingClientRect().top;

  car.position.z = -t * 0.01;

}

//EVENTS
document.body.onscroll = moveOnScroll;


function _Step(timeElapsed) {
  const timeElapsedS = timeElapsed * 0.001;
  if (this._mixers) {
    this._mixers.map(m => m.update(timeElapsedS));
  }

  this._thirdPersonCamera.Update(timeElapsedS);
}

this._previousRAF = null;

function animate() {
  requestAnimationFrame((t) => {
    if(this._previousRAF === null){
      this._previousRAF = t;
    }

    this.animate();


    renderer.render(scene, camera);
    this.thirdPersonCamera.Update()

  });
}

animate();