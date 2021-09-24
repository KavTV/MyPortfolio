import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);
camera.position.setY(20);


renderer.render(scene, camera);



// Torus

const geometry = new THREE.PlaneGeometry(30,30);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const GroundPlane = new THREE.Mesh(geometry, material);
GroundPlane.rotation.x = 0.0
scene.add(GroundPlane);

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

}

document.body.onscroll = moveOnScroll;

function animate() {
  requestAnimationFrame(animate);


  // moon.rotation.x += 0.005;

  // controls.update();

  renderer.render(scene, camera);
}

animate();