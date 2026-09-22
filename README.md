# ZFT Feature Automation

Custom D&D5e feature automation for Foundry VTT.

## Compatibility

- **Tested:** Foundry VTT V13 Build 351 with D&D5e 5.2.5
- **Intended support:** Foundry VTT V13 and V14
- **V14 status:** Not yet verified
- **Required module:** Midi-QOL

## 2024 Arcane Ward

The Arcane Ward automation corrects damage ordering for the 2024 Abjurer feature when Midi-QOL automatic damage is enabled.

- Detects only the 2024 `Arcane Ward` feature.
- Ignores Legacy/2014 Arcane Ward.
- Reads the ward's current HP from item uses.
- Absorbs post-save, post-resistance, and post-vulnerability damage before temporary HP and normal HP.
- Updates the ward's item uses automatically.
- Passes only overflow damage back to Midi-QOL.
- Keeps Midi-QOL damage detail synchronized so reduced damage is applied correctly.
- Leaves imported Create Ward, restoration, spell-slot, and Long Rest activities intact.
- Avoids conflicting with legacy CPR-managed Arcane Ward automation.

DDB Importer's Arcane Ward enhancer may remain enabled. ZFT handles ward absorption during Midi-QOL's damage workflow before actor damage is applied.

## Projected Ward

Projected Ward is handled as an optional Reaction when another creature takes damage.

- Detects the 2024 `Projected Ward` feature.
- Checks that the ward owner still has Arcane Ward HP remaining.
- Checks whether the Reaction has already been used.
- Requires the damaged creature to be within 30 feet.
- Requires the ward owner to be able to see the damaged creature.
- Uses Midi-QOL's configured Reaction timeout.
- Displays a live countdown during the Reaction window.
- Provides explicit **Use Projected Ward** and **Do Not Use** choices.
- Does not consume the Reaction if the prompt is declined, closed, or times out.
- Absorbs damage from the ward and passes only overflow damage through to the protected creature.
- Correctly handles temporary HP after the ward absorbs damage.
- Supports multi-target and area-of-effect damage by collecting all eligible damaged creatures into one prompt.
- Allows the ward owner to protect only one creature per Reaction.

## Damage Order

ZFT applies Arcane Ward and Projected Ward after Midi-QOL has already determined the creature's actual incoming damage.

The effective order is:

1. Attack or saving throw resolves.
2. Resistance, vulnerability, and similar mitigation are applied.
3. Final incoming damage is determined.
4. Arcane Ward or Projected Ward absorbs damage.
5. Any remaining damage reaches temporary HP.
6. Any remaining damage reaches normal HP.

## Version

Current release: **v1.2.0**
