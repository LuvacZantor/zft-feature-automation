console.log("[ZFT] 👁️ v0.2.0 | Gaze of Two Minds feature automation loading");

globalThis.ZFTFA ??= {
  MODULE_ID: "zft-feature-automation"
};

ZFTFA.GazeOfTwoMinds = {
  get featureName() {
    return ZFTFA.FEATURES?.GAZE_OF_TWO_MINDS
      ?? "Gaze of Two Minds";
  },

  get linkFlag() {
    return ZFTFA.FLAGS?.GAZE_LINK
      ?? "gazeOfTwoMindsLink";
  },

  /**
   * Register the initial Gaze service.
   */
  async register() {
    ZFTFA.log("👁️ Gaze of Two Minds | Registering feature services");

    ZFTFA.log("🔎 Gaze of Two Minds | Feature configuration resolved", {
      featureName: this.featureName,
      linkFlag: this.linkFlag
    });

    ZFTFA.log("✅ Gaze of Two Minds | Link-state service registered");
  },

  /**
   * Resolve the Gaze feature item from an actor.
   *
   * @param {Actor} actor
   * @returns {Item|null}
   */
  getFeature(actor) {
    return ZFTFA.getFeature?.(actor, this.featureName)
      ?? actor?.items?.find(item =>
        item.name === this.featureName
        && ["feat", "class", "subclass"].includes(item.type)
      )
      ?? null;
  },

  /**
   * Determine whether an actor possesses Gaze of Two Minds.
   *
   * @param {Actor} actor
   * @returns {boolean}
   */
  hasFeature(actor) {
    return Boolean(this.getFeature(actor));
  },

  /**
   * Return the stored Gaze link.
   *
   * @param {Actor} actor
   * @returns {object|null}
   */
  getLink(actor) {
    if (!actor) return null;

    return actor.getFlag(
      ZFTFA.MODULE_ID,
      this.linkFlag
    ) ?? null;
  },

  /**
   * Establish a link between the Warlock and a willing creature.
   *
   * This stage stores UUID state only. It does not create a proxy token.
   *
   * @param {object} options
   * @param {Token|TokenDocument} options.sourceToken
   * @param {Token|TokenDocument} options.linkedToken
   * @returns {Promise<object|null>}
   */
  async establish({
    sourceToken,
    linkedToken
  } = {}) {
    const sourceDocument = this.resolveTokenDocument(sourceToken);
    const linkedDocument = this.resolveTokenDocument(linkedToken);

    ZFTFA.log("👁️ Gaze of Two Minds | Establish request received", {
      sourceToken: sourceDocument?.name,
      sourceTokenUuid: sourceDocument?.uuid,
      linkedToken: linkedDocument?.name,
      linkedTokenUuid: linkedDocument?.uuid
    });

    if (!sourceDocument) {
      ZFTFA.error(
        "❌ Gaze of Two Minds | Establish failed: source token could not be resolved"
      );
      return null;
    }

    if (!linkedDocument) {
      ZFTFA.error(
        "❌ Gaze of Two Minds | Establish failed: linked token could not be resolved"
      );
      return null;
    }

    const actor = sourceDocument.actor;

    if (!actor) {
      ZFTFA.error(
        "❌ Gaze of Two Minds | Establish failed: source token has no actor",
        {
          sourceTokenUuid: sourceDocument.uuid
        }
      );
      return null;
    }

    if (!this.hasFeature(actor)) {
      ZFTFA.warn(
        `⚠️ Gaze of Two Minds | Establish denied: ${actor.name} does not have ${this.featureName}`,
        {
          actorUuid: actor.uuid
        }
      );
      return null;
    }

    if (sourceDocument.uuid === linkedDocument.uuid) {
      ZFTFA.warn(
        "⚠️ Gaze of Two Minds | Establish denied: source and linked token are the same token"
      );
      return null;
    }

    if (sourceDocument.parent?.uuid !== linkedDocument.parent?.uuid) {
      ZFTFA.warn(
        "⚠️ Gaze of Two Minds | Establish denied: tokens are not on the same scene",
        {
          sourceSceneUuid: sourceDocument.parent?.uuid,
          linkedSceneUuid: linkedDocument.parent?.uuid
        }
      );
      return null;
    }

    const previousLink = this.getLink(actor);

    if (previousLink) {
      ZFTFA.log(
        "🔄 Gaze of Two Minds | Existing link will be replaced",
        {
          actor: actor.name,
          previousLinkedTokenUuid: previousLink.linkedTokenUuid
        }
      );
    }

    const combat = game.combat;

    const linkData = {
      sourceActorUuid: actor.uuid,
      sourceTokenUuid: sourceDocument.uuid,
      linkedActorUuid: linkedDocument.actor?.uuid ?? null,
      linkedTokenUuid: linkedDocument.uuid,
      sceneUuid: sourceDocument.parent?.uuid ?? null,

      establishedByUserId: game.user.id,
      establishedAtWorldTime: game.time.worldTime,
      establishedAtTimestamp: Date.now(),

      combatId: combat?.id ?? null,
      combatRound: combat?.round ?? null,
      combatTurn: combat?.turn ?? null,

      proxyTokenUuid: null,
      active: true
    };

    try {
      await actor.setFlag(
        ZFTFA.MODULE_ID,
        this.linkFlag,
        linkData
      );
    } catch (error) {
      ZFTFA.error(
        "❌ Gaze of Two Minds | Failed to persist link state",
        {
          actor: actor.name,
          actorUuid: actor.uuid,
          linkedTokenUuid: linkedDocument.uuid,
          error
        }
      );

      return null;
    }

    ZFTFA.log(
      `✅ Gaze of Two Minds | Link established: ${actor.name} → ${linkedDocument.name}`,
      linkData
    );

    return linkData;
  },

  /**
   * End the current Gaze link.
   *
   * @param {Actor} actor
   * @param {object} options
   * @param {string} options.reason
   * @returns {Promise<boolean>}
   */
  async end(
    actor,
    {
      reason = "manual"
    } = {}
  ) {
    if (!actor) {
      ZFTFA.error(
        "❌ Gaze of Two Minds | End failed: actor was not provided"
      );
      return false;
    }

    const existingLink = this.getLink(actor);

    if (!existingLink) {
      ZFTFA.log(
        `🔎 Gaze of Two Minds | No active link to end for ${actor.name}`
      );
      return false;
    }

    try {
      await actor.unsetFlag(
        ZFTFA.MODULE_ID,
        this.linkFlag
      );
    } catch (error) {
      ZFTFA.error(
        "❌ Gaze of Two Minds | Failed to remove link state",
        {
          actor: actor.name,
          actorUuid: actor.uuid,
          reason,
          error
        }
      );

      return false;
    }

    ZFTFA.log(
      `✅ Gaze of Two Minds | Link ended for ${actor.name}`,
      {
        reason,
        linkedTokenUuid: existingLink.linkedTokenUuid
      }
    );

    return true;
  },

  /**
   * Resolve and validate all documents referenced by a stored link.
   *
   * @param {Actor} actor
   * @returns {Promise<object>}
   */
  async validate(actor) {
    const link = this.getLink(actor);

    if (!link) {
      ZFTFA.log(
        `🔎 Gaze of Two Minds | Validation found no active link for ${actor?.name ?? "unknown actor"}`
      );

      return {
        valid: false,
        reason: "missing-link",
        link: null,
        sourceToken: null,
        linkedToken: null
      };
    }

    let sourceToken = null;
    let linkedToken = null;

    try {
      [
        sourceToken,
        linkedToken
      ] = await Promise.all([
        foundry.utils.fromUuid(link.sourceTokenUuid),
        foundry.utils.fromUuid(link.linkedTokenUuid)
      ]);
    } catch (error) {
      ZFTFA.error(
        "❌ Gaze of Two Minds | UUID resolution failed during validation",
        {
          actor: actor?.name,
          link,
          error
        }
      );

      return {
        valid: false,
        reason: "uuid-resolution-failed",
        link,
        sourceToken: null,
        linkedToken: null
      };
    }

    if (!sourceToken) {
      ZFTFA.warn(
        "⚠️ Gaze of Two Minds | Validation failed: source token no longer exists",
        {
          sourceTokenUuid: link.sourceTokenUuid
        }
      );

      return {
        valid: false,
        reason: "missing-source-token",
        link,
        sourceToken: null,
        linkedToken
      };
    }

    if (!linkedToken) {
      ZFTFA.warn(
        "⚠️ Gaze of Two Minds | Validation failed: linked token no longer exists",
        {
          linkedTokenUuid: link.linkedTokenUuid
        }
      );

      return {
        valid: false,
        reason: "missing-linked-token",
        link,
        sourceToken,
        linkedToken: null
      };
    }

    if (sourceToken.parent?.uuid !== linkedToken.parent?.uuid) {
      ZFTFA.warn(
        "⚠️ Gaze of Two Minds | Validation failed: tokens are on different scenes",
        {
          sourceSceneUuid: sourceToken.parent?.uuid,
          linkedSceneUuid: linkedToken.parent?.uuid
        }
      );

      return {
        valid: false,
        reason: "different-scenes",
        link,
        sourceToken,
        linkedToken
      };
    }

    ZFTFA.log(
      `✅ Gaze of Two Minds | Link validation passed: ${actor.name} → ${linkedToken.name}`,
      {
        sourceTokenUuid: sourceToken.uuid,
        linkedTokenUuid: linkedToken.uuid,
        sceneUuid: sourceToken.parent?.uuid
      }
    );

    return {
      valid: true,
      reason: null,
      link,
      sourceToken,
      linkedToken
    };
  },

  /**
   * Establish a test link using the controlled token as the Warlock and
   * the user's single target as the willing linked creature.
   *
   * @returns {Promise<object|null>}
   */
  async establishFromSelection() {
    const controlled = canvas.tokens.controlled;

    if (controlled.length !== 1) {
      ZFTFA.warn(
        "⚠️ Gaze of Two Minds | Select exactly one source token before establishing the link",
        {
          controlledCount: controlled.length
        }
      );
      return null;
    }

    const targets = Array.from(game.user.targets);

    if (targets.length !== 1) {
      ZFTFA.warn(
        "⚠️ Gaze of Two Minds | Target exactly one willing creature before establishing the link",
        {
          targetCount: targets.length
        }
      );
      return null;
    }

    return this.establish({
      sourceToken: controlled[0],
      linkedToken: targets[0]
    });
  },

  /**
   * End the test link belonging to the controlled token's actor.
   *
   * @returns {Promise<boolean>}
   */
  async endFromSelection() {
    const controlled = canvas.tokens.controlled;

    if (controlled.length !== 1) {
      ZFTFA.warn(
        "⚠️ Gaze of Two Minds | Select exactly one source token before ending the link",
        {
          controlledCount: controlled.length
        }
      );
      return false;
    }

    return this.end(
      controlled[0].actor,
      {
        reason: "manual-selection-test"
      }
    );
  },

  /**
   * Validate the link belonging to the controlled token's actor.
   *
   * @returns {Promise<object|null>}
   */
  async validateFromSelection() {
    const controlled = canvas.tokens.controlled;

    if (controlled.length !== 1) {
      ZFTFA.warn(
        "⚠️ Gaze of Two Minds | Select exactly one source token before validating the link",
        {
          controlledCount: controlled.length
        }
      );
      return null;
    }

    return this.validate(controlled[0].actor);
  },

  /**
   * Normalize a Token or TokenDocument into a TokenDocument.
   *
   * @param {Token|TokenDocument|null} token
   * @returns {TokenDocument|null}
   */
  resolveTokenDocument(token) {
    if (!token) return null;

    if (token.documentName === "Token") {
      return token;
    }

    if (token.document?.documentName === "Token") {
      return token.document;
    }

    return null;
  }
};

Hooks.once("ready", async () => {
  try {
    await ZFTFA.GazeOfTwoMinds.register();

    ZFTFA.log("✅ Gaze of Two Minds | Feature automation ready");
  } catch (error) {
    ZFTFA.error(
      "❌ Gaze of Two Minds | Registration failure",
      error
    );
  }
});