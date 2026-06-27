let userProfile = { 
    deficiency_type: "red-green", 
    severity: "Moderate", 
    deficiency_name: "Deuteranomaly (Green-Weak)",
    percent_accuracy: 85
};

Office.onReady(async (info) => {
    if (info.host === Office.HostType.Excel) {
        document.getElementById("runTransform").onclick = transformSheet;
        await fetchWebProfile();
    }
});

async function fetchWebProfile() {
    try {
        const res = await fetch("http://localhost:8000/api/vision-profile/hackathon_demo_user");
        if (res.ok) {
            const data = await res.json();
            userProfile = data;
            
            const defName = data.deficiency_name || (data.deficiency_type === 'blue-yellow' ? 'Tritanomaly (Blue-Yellow)' : 'Deuteranomaly (Green-Weak)');
            const accuracy = data.percent_accuracy || 85;
            const severity = data.severity || 'Moderate';

            document.getElementById("deficiencyName").innerText = defName;
            document.getElementById("accuracySeverity").innerText = `${accuracy}% Accuracy | ${severity} Severity`;
            document.getElementById("syncStatus").innerText = "Web Report Synced Live";
        }
    } catch (e) {
        console.error("Failed to fetch profile, using default profile", e);
        document.getElementById("syncStatus").innerText = "Using Default Report (Offline)";
    }
}

async function transformSheet() {
    const btn = document.getElementById("runTransform");
    const logBox = document.getElementById("logBox");
    const transformCountElem = document.getElementById("transformCount");

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Analyzing Excel Sheet...`;
    logBox.innerHTML = `<div class="log-item" style="color: #4a4455;">🟢 Scanning active worksheet cells in real-time...</div>`;

    try {
        await Excel.run(async (context) => {
            const sheet = context.workbook.worksheets.getActiveWorksheet();
            const range = sheet.getUsedRange();
            range.load(["values", "address", "rowCount", "columnCount"]);
            await context.sync();

            if (!range.values || range.values.length === 0) {
                logBox.innerHTML = `<div class="log-item" style="color: #4a4455;">✅ Sheet is empty. No cells to transform.</div>`;
                return;
            }

            const rowCount = range.values.length;
            const colCount = range.values[0].length;
            
            // Batch load cell properties to prevent Office.js sync timeout errors
            let cells = [];
            for (let r = 0; r < rowCount; r++) {
                for (let c = 0; c < colCount; c++) {
                    const cell = range.getCell(r, c);
                    cell.load(["format/fill/color", "values", "address"]);
                    cells.push({ cell, r, c });
                }
            }
            await context.sync();

            let cellsTransformed = 0;
            let logDetails = [];
            let logHTML = "";

            for (const item of cells) {
                const cell = item.cell;
                const color = cell.format.fill.color;
                let val = (cell.values && cell.values[0] && cell.values[0][0] !== undefined) ? cell.values[0][0] : "";

                if (color && color.toLowerCase() !== "#ffffff" && color.toLowerCase() !== "#fff" && color.toLowerCase() !== "none") {
                    const transformResult = applyProfileTransformation(color, val, userProfile);
                    
                    if (transformResult.changed) {
                        cell.format.fill.color = transformResult.newColor;
                        cell.values = [[transformResult.newValue]];
                        cellsTransformed++;

                        const logLine = `Cell ${cell.address.replace(/^.*!/, '')}: Fill ${color} ➔ ${transformResult.newColor}`;
                        const meaningLine = `Attached Meaning: "${transformResult.newValue}"`;
                        
                        logDetails.push(`${logLine} | ${meaningLine}`);
                        logHTML += `<div class="log-item">${logLine}<span class="log-meaning">${meaningLine}</span></div>`;
                    }
                }
            }
            await context.sync();

            if (cellsTransformed > 0) {
                logBox.innerHTML = logHTML;
                transformCountElem.innerText = `${cellsTransformed} adapted`;

                try {
                    await fetch("http://localhost:8000/api/excel/log-transform", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            cells_transformed: cellsTransformed,
                            details: logDetails
                        })
                    });
                } catch (e) { 
                    console.error("Dashboard sync error", e); 
                }
            } else {
                logBox.innerHTML = `<div class="log-item" style="color: #4a4455;">✅ Scan complete. No confusing color fills detected for ${userProfile.deficiency_type} profile.</div>`;
            }
        });
    } catch (error) {
        console.error("Excel transform error:", error);
        let errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        logBox.innerHTML = `<div class="log-item" style="color: #ba1a1a;">❌ Error during transformation: ${errorMsg}</div>`;
    } finally {
        btn.disabled = false;
        btn.innerText = "Analyze & Transform Sheet";
    }
}

// Helper to parse hex to RGB and check dominance
function hexToRgb(hex) {
    try {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        const num = parseInt(hex, 16);
        if (isNaN(num)) return { r: 0, g: 0, b: 0 };
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    } catch(e) {
        return { r: 0, g: 0, b: 0 };
    }
}

function isRedDominant(hex) {
    try {
        const { r, g, b } = hexToRgb(hex);
        return r > g + 40 && r > b + 40 && r > 100;
    } catch(e) { return false; }
}

function isGreenDominant(hex) {
    try {
        const { r, g, b } = hexToRgb(hex);
        return g > r + 15 && g > b + 15 && g > 70;
    } catch(e) { return false; }
}

function isBlueDominant(hex) {
    try {
        const { r, g, b } = hexToRgb(hex);
        return b > r + 20 && b > g + 20 && b > 80;
    } catch(e) { return false; }
}

function isYellowDominant(hex) {
    try {
        const { r, g, b } = hexToRgb(hex);
        return r > 150 && g > 150 && b < 140;
    } catch(e) { return false; }
}

function isPurpleDominant(hex) {
    try {
        const { r, g, b } = hexToRgb(hex);
        return r > 100 && b > 100 && g < 120;
    } catch(e) { return false; }
}

function isEarthyBrown(hex) {
    try {
        const { r, g, b } = hexToRgb(hex);
        return r > 100 && r < 190 && g > 50 && g < 130 && b < 90 && r > g && g > b;
    } catch(e) { return false; }
}

// Profile-driven Color & Meaning transformer for Excel
function applyProfileTransformation(hex, val, profile) {
    let checkHex = hex.toLowerCase();
    let currentVal = (val !== null && val !== undefined) ? String(val) : "";
    
    // 1. Idempotency Check: If cell is already adapted with a meaning label, never touch it again!
    if (currentVal.includes("[CRITICAL") || currentVal.includes("[ACTIVE") || currentVal.includes("[SECONDARY") || currentVal.includes("[Primary") || currentVal.includes("[Warning") || currentVal.includes("[Highlight") || currentVal.includes("⚠") || currentVal.includes("📈") || currentVal.includes("🔗") || currentVal.includes("🔹")) {
        return { changed: false, newColor: hex, newValue: currentVal };
    }

    let changed = false;
    let newColor = hex;
    let newValue = currentVal;

    // Check custom recommended transformations from profile first
    if (profile && profile.recommended_transformations && profile.recommended_transformations.length > 0) {
        for (const t of profile.recommended_transformations) {
            if (t && t.from && checkHex === t.from.toLowerCase()) {
                newColor = t.to;
                changed = true;
                if (!currentVal.includes("[") && !currentVal.includes("⚠") && !currentVal.includes("📈")) {
                    newValue = `🔹 ${currentVal} [${t.reason || 'Adapted'}]`.trim();
                }
                return { changed, newColor, newValue };
            }
        }
    }

    const defTypeStr = ((profile && profile.deficiency_type) ? profile.deficiency_type : 'red-green').toLowerCase();
    const isProtan = defTypeStr.includes('prot') || defTypeStr.includes('red-weak');
    const isDeutan = defTypeStr.includes('deut') || defTypeStr.includes('green-weak');
    const isGeneralRedGreen = (!isProtan && !isDeutan) && (defTypeStr.includes('red') || defTypeStr.includes('green'));
    const isBlueYellow = defTypeStr.includes('blue') || defTypeStr.includes('yellow') || defTypeStr.includes('trit');

    // Meaning-Based Transformation Logic (Matching Web Philosophy exactly)
    if (isProtan || isGeneralRedGreen) {
        // 1. Earthy Brown -> Deep Purple + [SECONDARY METRIC] (Must be checked BEFORE RedDominant!)
        if (isEarthyBrown(checkHex) || ['#8b5e3c', '#a0522d', '#8b4513', '#d2691e', '#964b00', 'brown'].includes(checkHex)) {
            newColor = '#9b59b6'; // Safe Deep Purple
            changed = true;
            if (!currentVal.includes("[SECONDARY") && !currentVal.includes("📊")) {
                newValue = `📊 ${currentVal} [SECONDARY METRIC]`.trim();
            }
        }
        // 2. Protanomaly / Red-Weak: Only transform Red -> High Contrast Blue + [CRITICAL ALERT]
        else if (isRedDominant(checkHex) || ['#ff0000', '#e74c3c', '#f44336', 'red', '#c0392b', '#ff4d4d'].includes(checkHex)) {
            newColor = '#3498db'; // Safe High-Contrast Blue
            changed = true;
            if (!currentVal.includes("[CRITICAL") && !currentVal.includes("⚠")) {
                newValue = `⚠ ${currentVal} [CRITICAL ALERT]`.trim();
            }
        }
    }

    if (isDeutan || isGeneralRedGreen) {
        // Deuteranomaly / Green-Weak: Only transform Green -> Vibrant Amber + [ACTIVE GROWTH]
        if (isGreenDominant(checkHex) || ['#00ff00', '#2ecc40', '#4caf50', '#008000', 'green', '#27ae60', '#66ff66', '#92d050', '#00b050', '#375623'].includes(checkHex)) {
            newColor = '#f39c12'; // Safe Vibrant Amber
            changed = true;
            if (!currentVal.includes("[ACTIVE") && !currentVal.includes("📈")) {
                newValue = `📈 ${currentVal} [ACTIVE GROWTH]`.trim();
            }
        }
    }
    
    if (isBlueYellow) {
        // Blue -> Safe High-Contrast Red + [Primary Action]
        if (isBlueDominant(checkHex) || ['#0000ff', '#3498db', '#2196f3', 'blue', '#2980b9', '#4d4dff', '#00b0f0', '#00a2e8', '#3399ff'].includes(checkHex)) {
            newColor = '#e74c3c'; // Safe Red
            changed = true;
            if (!currentVal.includes("[Primary") && !currentVal.includes("🔗")) {
                newValue = `🔗 ${currentVal} [Primary Action]`.trim();
            }
        }
        // Yellow -> Safe Deep Purple + [Warning / Needs Review]
        else if (isYellowDominant(checkHex) || ['#ffff00', '#f1c40f', '#ffeb3b', 'yellow', '#f39c12', '#ffff66', '#ffc000'].includes(checkHex)) {
            newColor = '#9b59b6'; // Safe Purple
            changed = true;
            if (!currentVal.includes("[Warning") && !currentVal.includes("⚠")) {
                newValue = `⚠ ${currentVal} [Warning / Needs Review]`.trim();
            }
        }
        // Purple -> Vibrant Yellow + [Highlight / Active Selection]
        else if (isPurpleDominant(checkHex) || ['#8e44ad', '#9b59b6', '#673ab7', 'purple', '#7030a0', '#800080', '#a349a4'].includes(checkHex)) {
            newColor = '#f1c40f'; // Safe Yellow
            changed = true;
            if (!currentVal.includes("[Highlight") && !currentVal.includes("✽")) {
                newValue = `✽ ${currentVal} [Highlight / Active Selection]`.trim();
            }
        }
    }

    return { changed, newColor, newValue };
}
