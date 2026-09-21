console.log("[ZFT] 🧩 v1.0.0 | ZFT Feature Automation loading");

globalThis.ZFTFA ??= {
  MODULE_ID: "zft-feature-automation",

  FEATURES: {
    BLOODLUST: "Bloodlust"
  },

  FLAGS: {
    BLOODLUST_SANGUINE_FEAST_TURN: "bloodlustSanguineFeastTurn"
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