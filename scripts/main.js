console.log("[ZFT] 🧩 v1.2.0 | ZFT Feature Automation loading");

globalThis.ZFTFA ??= {
  MODULE_ID: "zft-feature-automation",

  FEATURES: {
    BLOODLUST: "Bloodlust",
    GAZE_OF_TWO_MINDS: "Eldritch Invocations: Gaze of Two Minds"
  },

  FLAGS: {
    BLOODLUST_SANGUINE_FEAST_TURN: "bloodlustSanguineFeastTurn",
    GAZE_LINK: "gazeOfTwoMindsLink",
    GAZE_PROXY: "gazeOfTwoMindsProxy"
  },

  MODULES: {
    MIDI_QOL: "midi-qol",
    REST_RECOVERY: "rest-recovery"
  },

  log(message, ...args) {
    console.log(`[ZFT] ${message}`, ...args);
  },

  warn(message, ...args) {
    console.warn(`[ZFT] ${message}`, ...args);
  },

  error(message, ...args) {
    console.error(`[ZFT] ${message}`, ...args);
  },

  isModuleActive(moduleId) {
    return game.modules.get(moduleId)?.active === true;
  },

  getFeature(actor, name) {
    return actor?.items?.find(item => {
      if (item.name !== name) return false;

      return [
        "feat",
        "background",
        "race",
        "class",
        "subclass"
      ].includes(item.type);
    }) ?? null;
  },

  hasFeature(actor, name) {
    return Boolean(this.getFeature(actor, name));
  }
};

try {
  await import("./features/bloodlust.js");

  ZFTFA.log("🩸 Bloodlust feature script imported successfully");
} catch (error) {
  ZFTFA.error("❌ Failed to import Bloodlust feature script", error);
}

try {
  await import("./features/gaze-of-two-minds.js");

  ZFTFA.log("👁️ Gaze of Two Minds feature script imported successfully");
} catch (error) {
  ZFTFA.error("❌ Failed to import Gaze of Two Minds feature script", error);
}

Hooks.once("ready", () => {
  ZFTFA.log("🧩 ZFT Feature Automation | Ready");

  const requiredModules = [
    ZFTFA.MODULES.MIDI_QOL,
    ZFTFA.MODULES.REST_RECOVERY
  ];

  for (const moduleId of requiredModules) {
    if (ZFTFA.isModuleActive(moduleId)) {
      ZFTFA.log(`✅ Dependency active: ${moduleId}`);
    } else {
      ZFTFA.warn(`⚠️ Dependency inactive or missing: ${moduleId}`);
    }
  }

  ZFTFA.log("✅ ZFT Feature Automation | Core namespace initialized");
});