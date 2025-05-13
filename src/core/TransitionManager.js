import { gsap } from 'gsap';

export const TransitionManager = {
  /**
   * Animation de fade-out de la scène
   * @returns {Promise<void>}
   */
  fadeOut(camera, sphere, tooltipManager) {
    return new Promise(resolve => {
      gsap.to(camera, {
        zoom: 2,
        duration: 0.5,
        onUpdate: () => camera.updateProjectionMatrix()
      });

      gsap.to(sphere.material, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          sphere.parent.remove(sphere);
          tooltipManager.destroyAll();
          resolve();
        }
      });
    });
  },

  /**
   * Animation de fade-in de la scène
   * @returns {Promise<void>}
   */
  fadeIn(camera, sphere, tooltipManager) {
    return new Promise(resolve => {
      gsap.to(camera, {
        zoom: 1,
        duration: 0.5,
        onUpdate: () => camera.updateProjectionMatrix()
      });

      sphere.material.opacity = 0;
      gsap.to(sphere.material, {
        opacity: 1,
        duration: 1,
        onComplete: () => resolve()
      });

      tooltipManager.sprites.forEach(sprite => {
        sprite.scale.set(0, 0, 0);
        gsap.to(sprite.scale, { x: 2, y: 2, z: 2, duration: 1 });
      });
    });
  }
};