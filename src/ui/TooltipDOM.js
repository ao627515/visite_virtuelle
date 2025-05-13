// src/ui/TooltipDOM.js

/**
 * Gère l'affichage DOM des tooltips
 *
 * Usage :
 *   import TooltipDOM from '@ui/TooltipDOM';
 *   const tooltip = new TooltipDOM(document.querySelector('.tooltip'));
 *   tooltip.show('Texte', x, y);
 *   tooltip.hide();
 */
export default class TooltipDOM {
  /**
   * @param {HTMLElement} element - Élément DOM servant de tooltip
   */
  constructor(element) {
    if (!(element instanceof HTMLElement)) {
      throw new TypeError('TooltipDOM: element doit être un HTMLElement');
    }
    this.el = element;
    this.el.style.position = 'absolute';
    this.el.style.pointerEvents = 'none';
    this.hide();
  }

  /**
   * Affiche la tooltip au texte et coordonnées données
   * @param {string} text
   * @param {number} x - Position X en pixels par rapport à la fenêtre
   * @param {number} y - Position Y en pixels par rapport à la fenêtre
   */
  show(text, x, y) {
    this.el.textContent = text;
    this.el.style.top = `${y}px`;
    this.el.style.left = `${x}px`;
    this.el.classList.add('is-active');
  }

  /**
   * Masque la tooltip
   */
  hide() {
    this.el.classList.remove('is-active');
  }
}
