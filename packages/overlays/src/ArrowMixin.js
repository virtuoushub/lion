import { css, html, dedupeMixin } from '@lion/core';

/**
 * @typedef {import('../types/OverlayConfig').OverlayConfig} OverlayConfig
 * @typedef {import('../types/ArrowMixinTypes').ArrowMixin} ArrowMixin
 *
 */

/**
 * @type {ArrowMixin}
 */
export const ArrowMixinImplementation = superclass =>
  class ArrowMixin extends superclass {
    static get properties() {
      return {
        hasArrow: {
          type: Boolean,
          reflect: true,
          attribute: 'has-arrow',
        },
      };
    }

    static get styles() {
      return [
        super.styles,
        css`
          :host {
            --tooltip-arrow-width: 12px;
            --tooltip-arrow-height: 8px;
          }

          .arrow {
            display: none;
            position: absolute;
            width: var(--tooltip-arrow-width);
            height: var(--tooltip-arrow-height);
          }

          :host([has-arrow]) .arrow {
            display: block;
          }

          .arrow svg {
            display: block;
          }

          [x-placement^='bottom'] .arrow {
            top: calc(-1 * var(--tooltip-arrow-height));
            transform: rotate(180deg);
          }

          [x-placement^='left'] .arrow {
            right: calc(
              -1 * (var(--tooltip-arrow-height) +
                    (var(--tooltip-arrow-width) - var(--tooltip-arrow-height)) / 2)
            );
            transform: rotate(270deg);
          }

          [x-placement^='right'] .arrow {
            left: calc(
              -1 * (var(--tooltip-arrow-height) +
                    (var(--tooltip-arrow-width) - var(--tooltip-arrow-height)) / 2)
            );
            transform: rotate(90deg);
          }
        `,
      ];
    }

    constructor() {
      super();
      this.hasArrow = true;
      this.__setupRepositionCompletePromise();
    }

    render() {
      return html`
        <slot name="invoker"></slot>
        <div id="overlay-content-node-wrapper">
          <slot name="content"></slot>
          ${this._arrowNodeTemplate()}
        </div>
      `;
    }

    _arrowNodeTemplate() {
      return html`<div class="arrow" x-arrow>${this._arrowTemplate()}</div>`;
    }

    // eslint-disable-next-line class-methods-use-this
    _arrowTemplate() {
      return html`
        <svg viewBox="0 0 12 8">
          <path d="M 0,0 h 12 L 6,8 z"></path>
        </svg>
      `;
    }

    /**
     * @overridable method `_defineOverlay`
     * @desc Overrides arrow and keepTogether modifier to be enabled,
     * and adds onCreate and onUpdate hooks to sync from popper state
     * @returns {OverlayConfig}
     */
    // eslint-disable-next-line
    _defineOverlayConfig() {
      if (!this.hasArrow) {
        return super._defineOverlayConfig();
      }
      return {
        ...super._defineOverlayConfig(),
        popperConfig: {
          ...super._defineOverlayConfig()?.popperConfig,
          placement: 'top',

          modifiers: {
            ...super._defineOverlayConfig()?.popperConfig?.modifiers,
            keepTogether: {
              ...super._defineOverlayConfig()?.popperConfig?.modifiers?.keepTogether,
              enabled: true,
            },
            arrow: {
              ...super._defineOverlayConfig()?.popperConfig?.modifiers?.arrow,
              enabled: true,
            },
          },

          /** @param {import("popper.js").default.Data} data */
          onCreate: data => {
            this.__syncFromPopperState(data);
          },
          /** @param {import("popper.js").default.Data} data */
          onUpdate: data => {
            this.__syncFromPopperState(data);
          },
        },
      };
    }

    __setupRepositionCompletePromise() {
      this.repositionComplete = new Promise(resolve => {
        this.__repositionCompleteResolver = resolve;
      });
    }

    get _arrowNode() {
      return /** @type {ShadowRoot} */ (this.shadowRoot).querySelector('[x-arrow]');
    }

    /**
     * @param {import("popper.js").default.Data} data
     */
    __syncFromPopperState(data) {
      if (!data) {
        return;
      }
      if (
        this._arrowNode &&
        data.placement !== /** @type {Element & {placement:string}} */ (this._arrowNode).placement
      ) {
        /** @type {function} */ (this.__repositionCompleteResolver)(data.placement);
        this.__setupRepositionCompletePromise();
      }
    }
  };

export const ArrowMixin = dedupeMixin(ArrowMixinImplementation);
