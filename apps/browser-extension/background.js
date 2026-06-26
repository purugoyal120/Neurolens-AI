// Initialize default settings on install
chrome.runtime.onInstalled.addListener(() => {
  // Extension is OFF by default until user links a profile via popup
  chrome.storage.local.set({
    enabled: false,
    visionProfile: null
  });
});
