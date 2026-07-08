document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('enableToggle');
  const deficiencyNameLabel = document.getElementById('deficiencyName');
  const accuracySeverityLabel = document.getElementById('accuracySeverity');
  const lockedState = document.getElementById('lockedState');
  const unlockedState = document.getElementById('unlockedState');
  const syncBtn = document.getElementById('syncBtn');
  const manualRefreshBtn = document.getElementById('manualRefreshBtn');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  async function checkBackendForProfile() {
    try {
      if (syncBtn) syncBtn.textContent = "🔄 Syncing with Web Dashboard...";
      if (manualRefreshBtn) manualRefreshBtn.textContent = "🔄 Syncing...";
      
      // 1. Try to fetch directly from any open Neurolens Web App tab (Hackathon Magic)
      const tabs = await chrome.tabs.query({ url: ["http://localhost:5173/*", "http://localhost:4173/*", "*://*.vercel.app/*"] });
      
      if (tabs && tabs.length > 0) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const reportStr = window.localStorage.getItem('neurolens_active_report');
            const profileStr = window.localStorage.getItem('neurolens_active_profile');
            return { reportStr, profileStr };
          }
        });

        if (results && results[0] && results[0].result && results[0].result.reportStr) {
          const { reportStr, profileStr } = results[0].result;
          const report = JSON.parse(reportStr);
          const dynamicProfile = {
            deficiency_type: "dynamic",
            severity: report.severity || "severe",
            deficiency_name: profileStr || "Custom Profile",
            percent_accuracy: report.accuracy || 100
          };
          
          await chrome.storage.local.set({ visionProfile: dynamicProfile });
          if (syncBtn) syncBtn.textContent = "🔄 Refresh / Check For Profile";
          if (manualRefreshBtn) manualRefreshBtn.textContent = "🔄 Re-sync Report from Web";
          return dynamicProfile;
        }
      }

      // 2. Fallback to API if no tab is open
      const res = await fetch("http://localhost:8000/api/vision-profile/hackathon_demo_user");
      if (res.ok) {
        const profile = await res.json();
        await chrome.storage.local.set({ visionProfile: profile });
        
        if (syncBtn) syncBtn.textContent = "🔄 Refresh / Check For Profile";
        if (manualRefreshBtn) manualRefreshBtn.textContent = "🔄 Re-sync Report from Web";
        return profile;
      }
    } catch (e) {
      console.log("Web App not found or backend offline. Using Fallback.");
    }
    
    // HACKATHON DEMO FALLBACK: Only if absolutely nothing works.
    const mockProfile = {
      deficiency_type: "red-green",
      severity: "severe",
      deficiency_name: "Protanopia (Red-Blind)",
      percent_accuracy: 94
    };
    await chrome.storage.local.set({ visionProfile: mockProfile });
    
    if (syncBtn) syncBtn.textContent = "🔄 Refresh / Check For Profile";
    if (manualRefreshBtn) manualRefreshBtn.textContent = "🔄 Re-sync Report from Web";
    return mockProfile;
  }

  function updateUI(result) {
    if (result && result.visionProfile) {
      lockedState.style.display = 'none';
      unlockedState.style.display = 'block';
      toggle.checked = result.enabled === true;
      
      statusDot.className = "dot";
      statusText.innerText = result.enabled ? "Extension Active" : "Extension Disabled";

      const p = result.visionProfile;
      const defName = p.deficiency_name || (p.deficiency_type === 'blue-yellow' ? 'Tritanomaly (Blue-Yellow)' : 'Deuteranomaly (Green-Weak)');
      const accuracy = p.percent_accuracy || 85;
      const severity = p.severity || 'Moderate';

      deficiencyNameLabel.textContent = defName;
      accuracySeverityLabel.textContent = `${accuracy}% Accuracy | ${severity} Severity`;
      
      const tag = document.getElementById('statusTag');
      if (tag) tag.className = "tag";
    } else {
      lockedState.style.display = 'block';
      unlockedState.style.display = 'none';
      statusDot.className = "dot dot-locked";
      statusText.innerText = "Profile Locked";
      
      const tag = document.getElementById('statusTag');
      if (tag) tag.className = "tag locked";
    }
  }

  // Initial load
  chrome.storage.local.get(['enabled', 'visionProfile'], async (result) => {
    updateUI(result);
    // If no profile, try fetching it just in case they just finished the test
    if (!result.visionProfile) {
      const newProfile = await checkBackendForProfile();
      if (newProfile) {
        // Auto-enable when profile is first fetched after test!
        chrome.storage.local.set({ enabled: true, visionProfile: newProfile }, () => {
          updateUI({ enabled: true, visionProfile: newProfile });
          reloadActiveTabs();
        });
      }
    }
  });

  // Manual sync button in locked state
  syncBtn.addEventListener('click', async () => {
    const newProfile = await checkBackendForProfile();
    if (newProfile) {
      chrome.storage.local.set({ enabled: true, visionProfile: newProfile }, () => {
        updateUI({ enabled: true, visionProfile: newProfile });
        reloadActiveTabs();
      });
    } else {
      alert("No Vision Profile found. Please complete your test on the Web Dashboard first.");
    }
  });

  // Manual refresh button in unlocked state
  if (manualRefreshBtn) {
    manualRefreshBtn.addEventListener('click', async () => {
      const newProfile = await checkBackendForProfile();
      if (newProfile) {
        chrome.storage.local.get(['enabled'], (res) => {
          updateUI({ enabled: res.enabled, visionProfile: newProfile });
          reloadActiveTabs();
        });
      }
    });
  }

  function reloadActiveTabs() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  }

  // Toggle switch
  toggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.local.set({ enabled: isEnabled }, () => {
      statusText.innerText = isEnabled ? "Extension Active" : "Extension Disabled";
      reloadActiveTabs();
    });
  });
});
