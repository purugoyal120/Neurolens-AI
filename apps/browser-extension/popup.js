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
      if (syncBtn) syncBtn.textContent = "🔄 Checking Web Dashboard...";
      if (manualRefreshBtn) manualRefreshBtn.textContent = "🔄 Syncing...";
      
      const res = await fetch("http://localhost:8000/api/vision-profile/hackathon_demo_user");
      if (res.ok) {
        const profile = await res.json();
        await chrome.storage.local.set({ visionProfile: profile });
        
        if (syncBtn) syncBtn.textContent = "🔄 Refresh / Check For Profile";
        if (manualRefreshBtn) manualRefreshBtn.textContent = "🔄 Re-sync Report from Web";
        return profile;
      }
    } catch (e) {
      console.log("Backend offline or no profile found.");
    }
    if (syncBtn) syncBtn.textContent = "🔄 Refresh / Check For Profile";
    if (manualRefreshBtn) manualRefreshBtn.textContent = "🔄 Re-sync Report from Web";
    return null;
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
    } else {
      lockedState.style.display = 'block';
      unlockedState.style.display = 'none';
      statusDot.className = "dot dot-locked";
      statusText.innerText = "Profile Locked";
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
