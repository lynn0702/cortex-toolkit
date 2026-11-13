import dreamerArchitectJson from '../data/templates/Dreamer_Architect.curio.json' with { type: 'json' };
import vanguardFrameJson from '../data/templates/Vanguard_Frame.curio.json' with { type: 'json' };
import { characterToSheetTemplate, type Character } from './model.ts';

/**
 * Showcase Templates (Phase 3c).
 * Pre-authored reference characters loaded directly from .curio.json files.
 */
export const DREAMER_ARCHITECT_SHOWCASE = characterToSheetTemplate(
	dreamerArchitectJson as unknown as Character,
	'dreamer-architect',
);

export const VANGUARD_FRAME_SHOWCASE = characterToSheetTemplate(
	vanguardFrameJson as unknown as Character,
	'vanguard-frame-showcase',
);

export const SHOWCASE_TEMPLATES = [VANGUARD_FRAME_SHOWCASE];
