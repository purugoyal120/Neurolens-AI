// Initialize default settings on install
chrome.runtime.onInstalled.addListener(() => {
  // Extension is OFF by default until user links a profile via popup
  chrome.storage.local.set({
    enabled: false,
    visionProfile: null
  });
});

// Handle background requests to bypass Content Security Policy (CSP)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "LOG_TRANSFORM") {
    // The endpoint may not exist, but we do a fire-and-forget fetch
    fetch("http://localhost:8000/api/extension/log-transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.payload)
    }).catch(e => console.log("Telemetry push silent fallback (Background)", e));
    
    sendResponse({ status: "logged" });
  }
  return true;
});
