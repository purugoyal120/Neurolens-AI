// NeuroLens AI Web SDK
import { ColorTransformer } from './colorTransformer.js';
import { ContextReplacer } from './contextReplacer.js';

export class NeuroLens {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || "http://localhost:8000/api";
    this.userId = config.userId || null;
    this.profile = config.profile || { deficiency_type: "red-green", severity: "moderate" };
    this.isActive = false;
    this.originalStyles = new WeakMap();
    
    // Inject styles
    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById('neurolens-sdk-styles')) return;
    const style = document.createElement('style');
    style.id = 'neurolens-sdk-styles';
    style.textContent = `
      .neurolens-context-icon {
        margin-right: 4px;
        font-family: 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif;
      }
    `;
    document.head.appendChild(style);
  }

  async enable() {
    this.isActive = true;
    
    // Fetch profile from backend
    if (this.userId) {
      try {
        const res = await fetch(`${this.apiUrl}/vision-profile/${this.userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.deficiency_type) {
            this.profile = data;
            console.log("NeuroLens Profile Loaded:", this.profile);
          }
        }
      } catch (e) {
        console.error("Failed to fetch profile, using fallback", e);
      }
    }

    await this.processElement(document.body);
    
    // Set up mutation observer for dynamic dashboard changes
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          this.processElement(node);
        });
      });
    });
    
    this.observer.observe(document.body, { childList: true, subtree: true });
    console.log("NeuroLens SDK Enabled");
  }

  disable() {
    this.isActive = false;
    if (this.observer) this.observer.disconnect();
    this.processElement(document.body, true);
    console.log("NeuroLens SDK Disabled");
  }

  async processElement(el, revert = false) {
    if (el.nodeType === Node.TEXT_NODE) {
      if (!revert) {
        await ContextReplacer.processTextNode(el, this.apiUrl);
      }
      return;
    }

    if (el.nodeType !== Node.ELEMENT_NODE || (el.classList && el.classList.contains('neurolens-context-icon'))) return;

    const style = window.getComputedStyle(el);
    if (!revert) {
      if (!this.originalStyles.has(el)) {
        this.originalStyles.set(el, { bg: el.style.backgroundColor, col: el.style.color, bor: el.style.borderColor });
      }

      ['backgroundColor', 'color', 'borderColor'].forEach(prop => {
        const newColor = ColorTransformer.transform(style[prop], this.profile);
        if (newColor && newColor !== style[prop]) el.style[prop] = newColor;
      });
    } else {
      // Revert logic
      if (this.originalStyles.has(el)) {
        const orig = this.originalStyles.get(el);
        el.style.backgroundColor = orig.bg; el.style.color = orig.col; el.style.borderColor = orig.bor;
      }
      if (el.hasAttribute('data-neurolens-icon')) {
        el.querySelectorAll('.neurolens-context-icon').forEach(icon => icon.remove());
        el.removeAttribute('data-neurolens-icon');
      }
    }

    // Process children
    const children = Array.from(el.childNodes);
    for (let child of children) {
      await this.processElement(child, revert);
    }
  }
}
