import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from "gsap";

const container = document.body;
const tooltip = document.querySelector('.tooltip');
let spriteActive = false;

class Scene {

  constructor(image, camera) {
    this.image = image;
    this.points = [];
    this.sphere = null;
    this.sprites = [];
    this.scene = null;
    this.camera = camera;
  }

  createScene(scene) {
    this.scene = scene;
    // create a sphere geometry and a basic material and combine them into a mesh
    const geometry = new THREE.SphereGeometry(50, 32, 16);
    // instantiate a loader
    const textureLoader = new THREE.TextureLoader();
    // const texture = textureLoader.load('public/assets/imgs/auror_baureal_360.jpg');
    const texture = textureLoader.load(this.image);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    const material = new THREE.MeshBasicMaterial(
      {
        map: texture,
        side: THREE.DoubleSide

      }
    );
    material.transparent = true;
    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);

    this.points.forEach(this.addTooltip.bind(this));
  }

  addTooltip(point) {
    // tooltips
    const map = new THREE.TextureLoader().load('public/assets/imgs/info.png');
    const spritMaterial = new THREE.SpriteMaterial({ map: map });

    const sprite = new THREE.Sprite(spritMaterial);
    sprite.name = point.name ?? 'tooltip';
    sprite.position.copy(point.position.clone().normalize().multiplyScalar(30));
    sprite.scale.multiplyScalar(2);
    this.scene.add(sprite);
    this.sprites.push(sprite);
    sprite.onclick = () => {
      this.destroy();
      point.scene.createScene(this.scene);
      point.scene.appear();
    };
  }

  addPoint(point) {
    this.points.push(point);
  }

  destroy() {

    gsap.to(this.camera, {
      zoom: 2,
      duration: 0.5,
      onUpdate: () => {
        this.camera.updateProjectionMatrix();
      }
    })

    gsap.to(this.sphere.material, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        this.scene.remove(this.sphere);
      }
    });

    this.sprites.forEach((sprite) => {
      gsap.to(sprite.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        onComplete: () => {
          this.scene.remove(sprite);
        }
      });
    });

  };

  appear() {

    gsap.to(this.camera, {
      zoom: 1,
      duration: 0.5,
      onUpdate: () => {
        this.camera.updateProjectionMatrix();
      }
    }).delay(0.5);

    this.sphere.material.opacity = 0;
    gsap.to(this.sphere.material, {
      opacity: 1,
      duration: 1,
    });

    this.sprites.forEach((sprite) => {
      sprite.scale.set(0, 0, 0);
      gsap.to(sprite.scale, {
        x: 2,
        y: 2,
        z: 2,
        duration: 1,
      });
    });

  };
}


// scence et controls
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.rotateSpeed = 0.5;
//controls.update() must be called after any manual changes to the camera's transform
camera.position.set(1, 0, -1);
controls.update();


let s1 = new Scene('public/assets/imgs/auror_baureal_360.jpg', camera);
let s2 = new Scene('public/assets/imgs/ville_360.jpg', camera);

s1.addPoint({
  position: new THREE.Vector3(
    -32.15314381175482,
    1.9264714123129645,
    37.73903776345632
  ),
  name: 'Entrer',
  scene: s2
});

s2.addPoint({
  position: new THREE.Vector3(
    -32.15314381175482,
    1.9264714123129645,
    37.73903776345632
  ),
  name: 'Sortir',
  scene: s1
});

s1.createScene(scene);
s1.appear();




function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
const raycaster = new THREE.Raycaster();

function onclick(event) {
  const mouse = new THREE.Vector2();
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {

    intersects.forEach((intersect) => {
      if (intersect.object.type === 'Sprite') {
        intersect.object.onclick();
      }
    });
  }

}


// addTooltip(new THREE.Vector3(
//   -32.15314381175482,
//   1.9264714123129645,
//   37.73903776345632
// ), 'Entrer');

function onMouseMove(e) {
  let foundSrite = false;
  const mouse = new THREE.Vector2();
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  // console.log(intersects);

  if (intersects.length > 0) {

    intersects.forEach((intersect) => {
      if (intersect.object.type === 'Sprite') {
        console.log(intersect.object.name);
        let p = intersect.object.position.clone().project(camera);
        tooltip.style.top = (-1 * p.y + 1) * window.innerHeight / 2 + 'px';
        tooltip.style.left = (p.x + 1) * window.innerWidth / 2 + 'px';
        // tooltip.style.display = 'block';
        tooltip.classList.add('is-active');
        console.log(intersect);

        tooltip.innerHTML = intersect.object.name;
        spriteActive = intersect.object;
        foundSrite = true;

      }
    });

    if (foundSrite === false && spriteActive) {
      tooltip.classList.remove('is-active');
      spriteActive = false;
    }
  }
}



window.addEventListener('resize', onWindowResize, false);
container.addEventListener('click', onclick);
container.addEventListener('mousemove', onMouseMove);