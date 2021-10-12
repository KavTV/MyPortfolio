import * as THREE from 'three';
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ThirdPersonCamera {
  constructor(camera) {
    this.camera = camera;
  }
  Update(geometry) {
    var temp = new THREE.Vector3;

    //Set offset
    temp.y = geometry.position.y + 10;
    temp.z = geometry.position.z + 10;
    temp.x = geometry.position.x;

    this.camera.position.lerp(temp, 0.2);
  }
  }
  export class Road {
    constructor(imageArray, scene) {
      this.curve;
      this.scene = scene;
      this.modelLoader = new GLTFLoader();
      this.CreateRoad(imageArray);
      this.DrawRoad();
      this.GenerateTrees(scene, 60);
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
      //Make the last bit of the road going center.
      vectorArray.push(new THREE.Vector3(0,0,(imageArray.length+1) * roadLength));
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
      this.scene.add(curveLine);
  
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
      var pathMaterial = new THREE.MeshPhongMaterial({ color: 0x46494d, wireframe: false });
  
      // Create mesh with the resulting geometry
      var mesh = new THREE.Mesh(pathGeometry, pathMaterial);
  
      mesh.castShadow = false;
      mesh.receiveShadow = true;

      //Add road
      this.scene.add(mesh);
    }
  
    CreateSign(height, imageLocation) {
      //Group the objects for the sign
      let sign = new THREE.Group();
      //The picture on the sign.
      let planeGeometry = new THREE.PlaneGeometry(10, 5);
      let planetexture = new THREE.TextureLoader().load(imageLocation);
      let planeMaterial = new THREE.MeshBasicMaterial({ map: planetexture });
      let SignPlane = new THREE.Mesh(planeGeometry, planeMaterial);
      let SignPlaneBack = new THREE.Mesh(planeGeometry, planeMaterial);
  
      //Point it backwards
      SignPlaneBack.rotateY(Math.PI * 1);
  
      SignPlane.position.y = height;
      SignPlaneBack.position.y = height;
  
      SignPlane.castShadow = true;
      SignPlane.receiveShadow = true;
      SignPlaneBack.castShadow = true;
      SignPlaneBack.receiveShadow = true;

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
      this.scene.add(sign);
  
      return sign;
    }
    CreatePillar(height) {
      //Add the pillar for sign.
      let pillarGeometry = new THREE.CylinderGeometry(.2, .2, height, 32);
      let pillarMaterial = new THREE.MeshPhongMaterial({ color: 0x4d5157 });
      let pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
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

    GenerateTree(scene, position){
      let number = THREE.Math.randInt(1,2);
      this.modelLoader.load('Objects/Tree'+number+'.glb', function (gltf) {
        //Set the position the the tunnel
        let tr = gltf.scene;
        tr.position.set(position.x, position.y, position.z);
        tr.castShadow = true;
        tr.receiveShadow = true;

        scene.add(tr);
      });
    }
    GenerateTrees(scene, amountTrees){
      //TODO: Make better generation
      //Make a list with all the tree positions
      let trees = []
      //Make the requested amount of trees.
      for (let i = 0; i < amountTrees; i++) {
        //Make a random vector
        let x = 0;
        
        //make sure the number is not the highway. Should be remade sometime
        while(x < 20 && x > -20){
          x = THREE.Math.randInt(-100,100);
        }
        let vector = new THREE.Vector3(x,0,THREE.Math.randInt(0,250));

        //If there is a tree on the location, dont add it.
        if (trees.includes(vector) == false) {
          this.GenerateTree(scene,vector);
          trees.push(vector);
        }
        
      }
    }
  
  }

  export class Car {
    constructor(car, scene) {
      this.car = car;
      this.carPosition = new Vector3();
      
      //Used for moving the car.
      this.tangent = new THREE.Vector3();

      this.lookAt = new THREE.Vector3();

      this.velocity = 0;
      this.progress = 0;
      this.prevTime = performance.now();

      this.car.castShadow = true;
      this.car.receiveShadow = true;

      scene.add(this.car);
    }
    MoveCarOnRoad(curveRoad) {
      const time = performance.now();
      //Find the delta time
      const delta = time - this.prevTime;
  
      this.progress += this.velocity;
      this.progress = this.progress % 1;
  
      this.carPosition.copy(curveRoad.getPointAt(this.progress));
      //Offset for car height
      this.carPosition.y += 0.7;
      //Offset for the side of the road
      this.carPosition.x += -3;
  
      this.car.position.copy(this.carPosition);
  
      this.tangent.copy(curveRoad.getTangentAt(this.progress));

      this.velocity -= this.tangent.y * 0.0000001 * delta;
      this.velocity = Math.max(0.0005, Math.min(0.0002, this.velocity));
      //Turn model in direction of the path
      this.car.lookAt(this.lookAt.copy(this.carPosition).sub(this.tangent));
    }
  
  }