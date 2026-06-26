import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ContextReplacementEngine } from "../js/contextReplacer.js";

function makeMockElement({ textContent = "", attrs = {} } = {}) {
  const el = {
    textContent,
    style: {},
    _attrs: { ...attrs },
    getAttribute(name) {
      return this._attrs[name] ?? null;
    },
    setAttribute(name, value) {
      this._attrs[name] = value;
    },
  };
  return el;
}

describe("ContextReplacementEngine.detectFromSignals", () => {
  test("matches brief example: green background + Good text -> success", () => {
    const engine = new ContextReplacementEngine();
    const result = engine.detectFromSignals({ colorHex: "#2ECC40", text: "Good", elementType: null, parentContext: null });
    assert.equal(result.label, "success");
  });

  test("matches brief example: red background + Critical text -> error", () => {
    const engine = new ContextReplacementEngine();
    const result = engine.detectFromSignals({ colorHex: "#E74C3C", text: "Critical", elementType: null, parentContext: null });
    assert.equal(result.label, "error");
  });

  test("matches brief example: yellow background + Warning text -> warning", () => {
    const engine = new ContextReplacementEngine();
    const result = engine.detectFromSignals({ colorHex: "#F1C40F", text: "Warning", elementType: null, parentContext: null });
    assert.equal(result.label, "warning");
  });

  test("caches repeated identical signal lookups", () => {
    const engine = new ContextReplacementEngine();
    const signals = { colorHex: "#2ECC40", text: "Good", elementType: null, parentContext: null };
    const first = engine.detectFromSignals(signals);
    const second = engine.detectFromSignals(signals);
    assert.equal(first, second);
  });

  test("clearCache forces recomputation", () => {
    const engine = new ContextReplacementEngine();
    const signals = { colorHex: "#2ECC40", text: "Good", elementType: null, parentContext: null };
    const first = engine.detectFromSignals(signals);
    engine.clearCache();
    const second = engine.detectFromSignals(signals);
    assert.notEqual(first, second);
    assert.deepEqual(first, second);
  });
});

describe("ContextReplacementEngine custom mappings", () => {
  test("custom mapping overrides standard detection", () => {
    const engine = new ContextReplacementEngine({
      customMappings: { "#9b59b6": { icon: "👑", label: "Premium" } },
    });
    const result = engine.detectFromSignals({ colorHex: "#9B59B6", text: null, elementType: null, parentContext: null });
    assert.equal(result.label, "custom");
    assert.equal(result._custom.icon, "👑");
    assert.equal(result._custom.label, "Premium");
  });

  test("custom mapping lookup is case-insensitive on hex", () => {
    const engine = new ContextReplacementEngine({
      customMappings: { "#e67e22": { icon: "⏳", label: "Pending" } },
    });
    const result = engine.detectFromSignals({ colorHex: "#E67E22", text: null, elementType: null, parentContext: null });
    assert.equal(result.label, "custom");
  });

  test("no custom mapping falls through to standard detector", () => {
    const engine = new ContextReplacementEngine({
      customMappings: { "#9b59b6": { icon: "👑", label: "Premium" } },
    });
    const result = engine.detectFromSignals({ colorHex: "#2ECC40", text: "Good", elementType: null, parentContext: null });
    assert.equal(result.label, "success");
  });
});

describe("ContextReplacementEngine.replaceWithIcon", () => {
  test("replaces text content with icon + label", () => {
    const engine = new ContextReplacementEngine();
    const el = makeMockElement({ textContent: "Critical" });
    const changed = engine.replaceWithIcon(el);
    assert.equal(changed, true);
    assert.equal(el.textContent, "❌ Critical");
  });

  test("marks the element so it is not double-applied", () => {
    const engine = new ContextReplacementEngine();
    const el = makeMockElement({ textContent: "Good" });
    engine.replaceWithIcon(el);
    const secondApply = engine.replaceWithIcon(el);
    assert.equal(secondApply, false);
  });

  test("respects confidence threshold", () => {
    const engine = new ContextReplacementEngine({ confidenceThreshold: 0.9 });
    const el = makeMockElement({ textContent: "" });
    const result = engine.detectFromSignals({ colorHex: "#3498DB", text: null, elementType: null, parentContext: null });
    const changed = engine.replaceWithIcon(el, result);
    assert.equal(changed, false);
  });

  test("custom mapping result renders its own icon and label", () => {
    const engine = new ContextReplacementEngine({
      customMappings: { "#9b59b6": { icon: "👑", label: "Premium" } },
    });
    const el = makeMockElement({ textContent: "" });
    const result = engine.detectFromSignals({ colorHex: "#9B59B6", text: null, elementType: null, parentContext: null });
    engine.replaceWithIcon(el, result);
    assert.equal(el.textContent, "👑 Premium");
  });

  test("financial gain pattern applies a background pattern", () => {
    const engine = new ContextReplacementEngine();
    const el = makeMockElement({ textContent: "Revenue Gain" });
    const result = engine.detectFromSignals({ colorHex: "#2ECC40", text: "Revenue Gain", elementType: null, parentContext: "Revenue" });
    engine.replaceWithIcon(el, result);
    assert.equal(el.textContent, "📈 Revenue Gain");
    assert.ok(el.style.backgroundImage.includes("rgba(34,197,94"));
  });
});

describe("ContextReplacementEngine.addPattern", () => {
  test("gain pattern sets a green-tinted background image", () => {
    const engine = new ContextReplacementEngine();
    const el = { style: {} };
    const applied = engine.addPattern(el, "gain");
    assert.equal(applied, true);
    assert.ok(el.style.backgroundImage.includes("rgba(34,197,94"));
  });

  test("loss pattern sets a red-tinted background image", () => {
    const engine = new ContextReplacementEngine();
    const el = { style: {} };
    const applied = engine.addPattern(el, "loss");
    assert.equal(applied, true);
    assert.ok(el.style.backgroundImage.includes("rgba(239,68,68"));
  });

  test("unknown pattern type returns false without throwing", () => {
    const engine = new ContextReplacementEngine();
    const el = { style: {} };
    const applied = engine.addPattern(el, "not_a_real_pattern");
    assert.equal(applied, false);
  });
});

describe("ContextReplacementEngine.applyToPage", () => {
  function makeMockDocument(elements) {
    return {
      querySelectorAll() {
        return elements;
      },
    };
  }

  test("transforms all qualifying elements and returns the count", async () => {
    const engine = new ContextReplacementEngine();
    const elements = [
      makeMockElement({ textContent: "Good" }),
      makeMockElement({ textContent: "Critical" }),
      makeMockElement({ textContent: "Warning" }),
    ];
    const doc = makeMockDocument(elements);
    const count = await engine.applyToPage(doc);
    assert.equal(count, 3);
    assert.equal(elements[0].textContent, "✅ Good");
    assert.equal(elements[1].textContent, "❌ Critical");
    assert.equal(elements[2].textContent, "⚠ Warning");
  });

  test("processes elements in batches without losing any", async () => {
    const engine = new ContextReplacementEngine();
    const elements = Array.from({ length: 250 }, () => makeMockElement({ textContent: "Good" }));
    const doc = makeMockDocument(elements);
    const count = await engine.applyToPage(doc, { batchSize: 100 });
    assert.equal(count, 250);
    assert.ok(elements.every((el) => el.textContent === "✅ Good"));
  });

  test("elements below confidence threshold are not transformed", async () => {
    const engine = new ContextReplacementEngine({ confidenceThreshold: 0.99 });
    const elements = [makeMockElement({ textContent: "" })];
    const doc = makeMockDocument(elements);
    const count = await engine.applyToPage(doc);
    assert.equal(count, 0);
  });
});
