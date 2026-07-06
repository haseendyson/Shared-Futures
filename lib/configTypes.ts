// Raw shape of a study's .toml config file, as authored by a study owner.
// This mirrors the structure read by llm_config.py's LLMConfig(config) in the
// original Streamlit app -- field names and nesting match 1:1 so existing
// .toml files can be used without modification.

export interface RawStudyConfig {
  model?: string;

  consent: {
    intro_and_consent: string;
  };

  participant?: {
    require_participant_id?: boolean;
    editable_participant_id?: boolean;
    text?: string;
  };

  collection: {
    persona: string;
    language_type: string;
    intro: string;
    questions: string[];
    topic_restriction: string;
  };

  summaries: {
    questions: Record<string, string>;
    personas: Record<string, string>;
  };

  example: {
    conversation: string;
    scenario: string;
  };
}
