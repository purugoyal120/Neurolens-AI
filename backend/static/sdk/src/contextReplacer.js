export const ContextReplacer = {
  // Cache to avoid spamming the ML API for the same text
  cache: new Map(),

  async processTextNode(node, apiUrl) {
    const text = node.nodeValue.trim();
    if (!text || text.length < 3) return;

    // Check cache first
    let icon = this.cache.get(text);
    
    if (icon === undefined) {
      try {
        const response = await fetch(`${apiUrl}/transform/semantic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await response.json();
        icon = data.icon || null;
        this.cache.set(text, icon);
      } catch (err) {
        console.error("NeuroLens ML Error:", err);
        icon = null;
        this.cache.set(text, null);
      }
    }

    if (icon) {
      const span = document.createElement('span');
      span.className = 'neurolens-context-icon';
      span.textContent = icon;
      
      if (node.parentNode && !node.parentNode.hasAttribute('data-neurolens-icon')) {
        node.parentNode.insertBefore(span, node);
        node.parentNode.setAttribute('data-neurolens-icon', 'true');
      }
    }
  }
};
