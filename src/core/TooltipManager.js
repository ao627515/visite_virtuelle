// managers/TooltipManager.js
import * as THREE from 'three';

export class TooltipManager {
  /**
   * @param {THREE.Scene} scene
   * @param {HTMLElement} domContainer
   */
  constructor(scene, domContainer, loader) {
    this.scene = scene;
    this.container = domContainer;
    this.loader = loader;
    this.sprites = [];
  }

  /**
   * Ajoute un tooltip interactif
   * @param {{ position: THREE.Vector3, name: string, onClick: Function }} point
   */
  async addTooltip(point) {
    if (!(point.position instanceof THREE.Vector3)) {
      throw new TypeError('position must be THREE.Vector3');
    }
    const texture = await this.loader.load(point.icon || 'public/assets/imgs/info.png');
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    sprite.name = point.name || 'tooltip';
    sprite.position.copy(point.position.clone().normalize().multiplyScalar(30));
    sprite.scale.setScalar(2);

    // Stocke le callback pour l'utilisation via le raycaster global
    sprite.userData.callback = () => {
      try {
        point.onClick();
      } catch (err) {
        console.error('Erreur callback tooltip:', err);
      }
    };

    this.scene.add(sprite);
    this.sprites.push(sprite);
  }

  destroyAll() {
    this.sprites.forEach(sprite => {
      // On supprime simplement le sprite ; le callback est stocké dans userData
      this.scene.remove(sprite);
    });
    this.sprites.length = 0;
  }
}