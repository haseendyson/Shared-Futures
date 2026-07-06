import { StudyPrompts } from "./config";

/**
 * Only the fields a client component is allowed to see. The full
 * StudyPrompts object contains the actual LLM instructions (personas,
 * topic-restriction wording, one-shot examples) which should stay
 * server-side and only ever be used inside API routes.
 */
export interface PublicStudyConfig {
  studyName: string;
  introAndConsent: string;
  requireParticipantId: boolean;
  editableParticipantId: boolean;
  participantCollectionText: string;
  requirePreviousFinalScenario: boolean;
  personasCount: number;
}

export function toPublicConfig(studyName: string, prompts: StudyPrompts): PublicStudyConfig {
  return {
    studyName,
    introAndConsent: prompts.introAndConsent,
    requireParticipantId: prompts.requireParticipantId,
    editableParticipantId: prompts.editableParticipantId,
    participantCollectionText: prompts.participantCollectionText,
    requirePreviousFinalScenario: prompts.requirePreviousFinalScenario,
    personasCount: prompts.personas.length,
  };
}
