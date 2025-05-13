import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LoaderService } from './core/LoaderService.js';
import { SceneManager } from './core/SceneManager.js';

(async () => {
  const container = document.body;
  const tooltipElem = document.querySelector('.tooltip');
  if (!tooltipElem) console.warn('Élément .tooltip introuvable');

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(1, 0, -1);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.rotateSpeed = 0.5;
    controls.update();

    // Service de chargement de textures
    const loaderService = new LoaderService();

    // Instantiation des scènes
    const s1 = new SceneManager('public/assets/imgs/auror_baureal_360.jpg', camera, scene, loaderService);
    const s2 = new SceneManager('public/assets/imgs/ville_360.jpg', camera, scene, loaderService);

    s1.addPoint({ position: new THREE.Vector3(-32.15, 1.92, 37.73), name: 'Entrer', scene: s2 });
    s2.addPoint({ position: new THREE.Vector3(-32.15, 1.92, 37.73), name: 'Sortir', scene: s1 });

    // Initialisation
    await s1.init();
    await s1.appear();

    // Gestion du raycaster global
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function updateMouse(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function handleClick(event) {
      updateMouse(event);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, false);
      const hit = intersects.find(i => i.object.userData.callback);
      if (hit) hit.object.userData.callback();
    }

    function handleMouseMove(event) {
      updateMouse(event);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, false);
      const found = intersects.find(i => i.object.userData.callback);
      if (found) {
        const p = found.object.position.clone().project(camera);
        tooltipElem.style.top = ((-p.y + 1) * window.innerHeight / 2) + 'px';
        tooltipElem.style.left = ((p.x + 1) * window.innerWidth / 2) + 'px';
        tooltipElem.textContent = found.object.name;
        tooltipElem.classList.add('is-active');
      } else {
        tooltipElem.classList.remove('is-active');
      }
    }

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  } catch (err) {
    console.error('Erreur dans main.js:', err);
  }
})();
