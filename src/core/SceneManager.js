import * as THREE from 'three';
import { ITextureLoader } from './LoaderService.js';
import { TooltipManager } from './TooltipManager.js';
import { TransitionManager } from './TransitionManager.js';

export class SceneManager {
  /**
   * @param {string} imageSrc
   * @param {THREE.PerspectiveCamera} camera
   * @param {THREE.Scene} scene
   * @param {ITextureLoader} loader
   */
  constructor(imageSrc, camera, scene, loader) {
    this.imageSrc = imageSrc;
    this.camera = camera;
    this.scene = scene;
    this.loader = loader;
    this.points = [];
    this.tooltipManager = new TooltipManager(scene, document.body, loader);
    this.sphere = null;
  }

  /**
   * Initialise la scène panoramique
   * @returns {Promise<void>}
   */
  async init() {
    const geometry = new THREE.SphereGeometry(50, 32, 16);
    const texture = await this.loader.load(this.imageSrc);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    });

    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);

    // Ajout des tooltips après chargement
    for (const point of this.points) {
      await this.tooltipManager.addTooltip({
        position: point.position,
        name: point.name,
        onClick: async () => {
          await this.destroy();
          await point.scene.init();
          await point.scene.appear();
        }
      });
    }
  }

  /**
   * Ajoute un point de navigation
   */
  addPoint(point) {
    // Validation minimale
    if (!point.scene || !point.position) {
      throw new Error('Point invalide');
    }
    this.points.push(point);
  }

  /**
   * Transition de sortie de scène
   * @returns {Promise<void>}
   */
  async destroy() {
    return TransitionManager.fadeOut(this.camera, this.sphere, this.tooltipManager);
  }

  /**
   * Transition d'apparition de scène
   * @returns {Promise<void>}
   */
  async appear() {
    return TransitionManager.fadeIn(this.camera, this.sphere, this.tooltipManager);
  }
}