console.log("NeuroLens content script loaded");

let isActive = false;
let currentProfile = null;
let loggedTransform = false;
let elementsCount = 0;

// Store original styles so we can revert when disabled
const originalStyles = new WeakMap();

function processElement(el) {
  if (el.nodeType === Node.TEXT_NODE) {
    if (isActive) {
      window.NeuroLensContextReplacer.processTextNode(el);
    }
    return;
  }

  if (el.nodeType !== Node.ELEMENT_NODE) return;

  // Ignore our own injected elements
  if (el.classList && el.classList.contains('neurolens-context-icon')) return;

  const style = window.getComputedStyle(el);
  
  if (isActive && currentProfile) {
    // Save originals if not already saved
    if (!originalStyles.has(el)) {
      originalStyles.set(el, {
        backgroundColor: el.style.backgroundColor,
        color: el.style.color,
        borderColor: el.style.borderColor
      });
    }

    // Transform Background
    const bg = style.backgroundColor;
    const newBg = window.NeuroLensColorTransformer.transform(bg, currentProfile);
    if (newBg && newBg !== bg) {
      el.style.setProperty('background-color', newBg, 'important');
      elementsCount++;
    }

    // Transform Text Color
    const color = style.color;
    const newColor = window.NeuroLensColorTransformer.transform(color, currentProfile);
    if (newColor && newColor !== color) {
      el.style.setProperty('color', newColor, 'important');
      elementsCount++;
    }

    // Transform Border Color
    const border = style.borderColor;
    const newBorder = window.NeuroLensColorTransformer.transform(border, currentProfile);
    if (newBorder && newBorder !== border) {
      el.style.setProperty('border-color', newBorder, 'important');
    }

    // Transform SVG fill and stroke
    if (el.namespaceURI === "http://www.w3.org/2000/svg" || el.tagName.toLowerCase() === 'path' || el.tagName.toLowerCase() === 'rect') {
      const fill = style.fill || el.getAttribute('fill');
      if (fill && fill !== 'none') {
        const newFill = window.NeuroLensColorTransformer.transform(fill, currentProfile);
        if (newFill && newFill !== fill) {
          el.style.setProperty('fill', newFill, 'important');
          el.setAttribute('fill', newFill);
          elementsCount++;
        }
      }
      const stroke = style.stroke || el.getAttribute('stroke');
      if (stroke && stroke !== 'none') {
        const newStroke = window.NeuroLensColorTransformer.transform(stroke, currentProfile);
        if (newStroke && newStroke !== stroke) {
          el.style.setProperty('stroke', newStroke, 'important');
          el.setAttribute('stroke', newStroke);
        }
      }
    }
  } else {
    // Revert to original
    if (originalStyles.has(el)) {
      const orig = originalStyles.get(el);
      el.style.backgroundColor = orig.backgroundColor;
      el.style.color = orig.color;
      el.style.borderColor = orig.borderColor;
    }
    // Remove icons
    if (el.hasAttribute('data-neurolens-icon')) {
      const icons = el.querySelectorAll('.neurolens-context-icon');
      icons.forEach(icon => icon.remove());
      el.removeAttribute('data-neurolens-icon');
    }
  }

  // Recurse children
  for (let i = 0; i < el.childNodes.length; i++) {
    processElement(el.childNodes[i]);
  }
}

function applyNeuroLens() {
  elementsCount = 0;
  processElement(document.body);
  
  if (isActive && currentProfile && !loggedTransform && elementsCount > 0) {
    loggedTransform = true;
    const siteHost = window.location.hostname || "External Website";
    const details = [
      `Website [${siteHost}]: Linked active report (${currentProfile.deficiency_name || 'Deuteranomaly (Green-Weak)'}).`,
      `Website [${siteHost}]: Applied safe palette & meaning labels to ${elementsCount} elements.`
    ];
    fetch("http://localhost:8000/api/extension/log-transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        elements_transformed: elementsCount,
        url: siteHost,
        details: details
      })
    }).catch(e => console.log("Telemetry push silent fallback", e));
  }
}

// Observe dynamic DOM changes (React, Angular, Vue sites)
const observer = new MutationObserver((mutations) => {
  if (!isActive) return;
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processElement(node);
        }
      });
    }
  });
});

// Initial load
chrome.storage.local.get(['enabled', 'visionProfile'], (result) => {
  isActive = result.enabled !== false;
  currentProfile = result.visionProfile || { deficiency_type: "red-green", severity: "moderate", deficiency_name: "Deuteranomaly (Green-Weak)" };
  
  if (isActive) {
    applyNeuroLens();
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

// Listen for dynamic toggle/profile updates from popup
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.enabled !== undefined) {
      isActive = changes.enabled.newValue !== false;
    }
    if (changes.visionProfile !== undefined) {
      currentProfile = changes.visionProfile.newValue || currentProfile;
    }
    if (isActive) {
      applyNeuroLens();
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      observer.disconnect();
      processElement(document.body); // Reverts to original styles
    }
  }
});
