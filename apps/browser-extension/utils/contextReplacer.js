/**
 * NeuroLens Meaning-Based Context Replacer
 * "Hum isko na colour pe dependent nhi bnna chate hum isko us meaning colour per dependent rakhna chate hai"
 * Injects clear symbols and meaning labels directly into website elements using robust substring matching.
 */

window.NeuroLensContextReplacer = {
  processTextNode: function(node) {
    if (!node || !node.nodeValue) return;
    const text = node.nodeValue.trim().toLowerCase();
    if (!text) return;

    // Ensure we don't duplicate labels if already processed
    if (text.includes('[critical alert]') || text.includes('[successful]') || text.includes('[active growth]') || text.includes('[primary action]') || text.includes('[secondary metric]') || text.includes('[warning: review]')) {
      return;
    }

    let icon = null;
    let label = null;

    // Identify meaning categories via robust substring matching
    if (text.includes('error') || text.includes('critical') || text.includes('fail') || text.includes('danger') || text.includes('stop') || text.includes('reject')) {
      icon = '⚠';
      label = '[CRITICAL ALERT]';
    } else if (text.includes('success') || text.includes('good') || text.includes('done') || text.includes('active') || text.includes('growth') || text.includes('approve') || text.includes('complete') || text.includes('save')) {
      icon = '📈';
      label = '[SUCCESSFUL]';
    } else if (text.includes('warning') || text.includes('caution') || text.includes('alert') || text.includes('limit') || text.includes('notice')) {
      icon = '⚠';
      label = '[WARNING: REVIEW]';
    } else if (text.includes('login') || text.includes('log in') || text.includes('signin') || text.includes('sign in') || text.includes('submit') || text.includes('proceed') || text.includes('continue') || text.includes('next') || text.includes('buy') || text.includes('confirm') || text.includes('register')) {
      icon = '🔗';
      label = '[PRIMARY ACTION]';
    } else if (text.includes('cancel') || text.includes('back') || text.includes('info') || text.includes('secondary') || text.includes('details') || text.includes('help') || text.includes('terms') || text.includes('privacy') || text.includes('lost password') || text.includes('forgot')) {
      icon = '📊';
      label = '[SECONDARY METRIC]';
    }

    if (icon && label) {
      // Create a gorgeous inline meaning badge
      const span = document.createElement('span');
      span.className = 'neurolens-context-icon';
      span.style.cssText = 'display: inline-flex; align-items: center; padding: 2px 6px; margin: 0 6px; font-size: 11px; font-weight: 700; background-color: #0F172A; color: #34D399; border: 1px solid #10B981; border-radius: 6px; letter-spacing: 0.05em; vertical-align: middle;';
      span.textContent = `${icon} ${label}`;
      
      if (node.parentNode && !node.parentNode.hasAttribute('data-neurolens-icon')) {
        node.parentNode.insertBefore(span, node.nextSibling); // insert right after the text
        node.parentNode.setAttribute('data-neurolens-icon', 'true');
      }
    }
  }
};
