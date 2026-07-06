import fs from "fs";
import path from "path";
import { parse as parseToml } from "smol-toml";
import { RawStudyConfig } from "./configTypes";
import { fillTemplate } from "./promptTemplate";

const CONFIGS_DIR = path.join(process.cwd(), "configs");

/**
 * Fully-built set of prompts/text for one study, derived from its .toml
 * config file. This is a direct port of llm_config.py's LLMConfig class:
 * every method below corresponds to a same-named method there, and the
 * generated prompt text is byte-for-byte identical so existing configs
 * produce identical LLM behaviour.
 */
export class StudyPrompts {
  modelName: string;
  introAndConsent: string;

  requireParticipantId: boolean;
  editableParticipantId: boolean;
  participantCollectionText: string;
  requirePreviousFinalScenario: boolean;

  /** Template with {previous_scenario} left unfilled -- call buildQuestionsIntro() */
  private questionsIntroTemplate: string;

  /** Template with {history} and {input} left unfilled -- call buildQuestionsPrompt() */
  private questionsPromptTemplate: string;

  questionsOutro = "Great, I think I got all I need -- but let me double check!";

  /** Template with {conversation_history} left unfilled -- call buildExtractionPrompt() */
  private extractionPromptTemplate: string;

  summaryKeys: string[];
  personas: string[];
  oneShot: string;
  oneShotConversation: string;

  /** Template with {persona}, {language_level}, and each summary key left unfilled */
  private scenarioPromptTemplate: string;

  private summaryQuestions: Record<string, string>;

  constructor(config: RawStudyConfig) {
    const participantConfig = config.participant ?? {};
    this.requireParticipantId = participantConfig.require_participant_id ?? false;
    this.editableParticipantId = participantConfig.editable_participant_id ?? true;
    this.participantCollectionText = participantConfig.text ?? "";
    this.requirePreviousFinalScenario = this.checkIfPreviousScenarioRequired(
      config.collection.intro
    );

    this.modelName = config.model ?? "gpt-4o";

    this.introAndConsent = config.consent.intro_and_consent.trim();

    this.questionsIntroTemplate =
      config.collection.intro.trim() + "\n\nLet me know when you're ready!";

    this.questionsPromptTemplate = this.generateQuestionsPromptTemplate(config.collection);

    this.extractionPromptTemplate = this.generateExtractionPromptTemplate(
      config.summaries.questions
    );
    this.summaryKeys = Object.keys(config.summaries.questions);
    this.summaryQuestions = config.summaries.questions;

    this.personas = Object.values(config.summaries.personas)
      .map((p) => p.trim())
      .slice(0, 3);

    this.oneShot = this.generateOneShot(config.example);
    this.oneShotConversation = config.example.conversation.trim();
    this.scenarioPromptTemplate = this.generateScenarioPromptTemplate(config.summaries.questions);
  }

  private checkIfPreviousScenarioRequired(introText: string): boolean {
    const requirePreviousScenario = introText.includes("{previous_scenario}");
    if (requirePreviousScenario && !this.requireParticipantId) {
      throw new Error(
        "Text of a previous scenario is required, but participant ID is not tracked. " +
          "Set 'require_participant_id = true' in the configuration file"
      );
    }
    return requirePreviousScenario;
  }

  buildQuestionsIntro(previousScenario: string): string {
    return fillTemplate(this.questionsIntroTemplate, {
      previous_scenario: previousScenario,
    });
  }

  private generateQuestionsPromptTemplate(dataCollection: RawStudyConfig["collection"]): string {
    const questionsPromptText =
      "{persona}\n\n" +
      "Your goal is to gather structured answers to the following questions:\n\n" +
      "{questions}\n" +
      "Ask each question one at a time. Do not include question numbers or list formatting when you ask the next question.\n" +
      "Ask each question as a natural conversational sentence.\n" +
      "Do not ask more than one question in a single response.\n" +
      "If the human's answer is incomplete or unclear, ask a follow-up clarification question instead of moving on to the next main question.\n" +
      "If the human has already answered the current question, then ask only the next question.\n" +
      "{language_type}\n" +
      "Ensure you get at least a basic answer to each question before moving to the next.\n" +
      "Never answer for the human. If you unsure what the human meant, ask again. " +
      "{topic_restriction}\n" +
      '{collection_complete}, stop the conversation and write a single word "FINISHED".\n\n' +
      "Current conversation:\n" +
      "{history}\n" +
      "Human: {input}\n" +
      "AI: ";

    return fillTemplate(questionsPromptText, {
      persona: dataCollection.persona,
      questions: this.generateQuestionList(dataCollection.questions),
      language_type: dataCollection.language_type,
      topic_restriction: dataCollection.topic_restriction,
      collection_complete: this.generateCollectionCompleteText(dataCollection.questions),
    });
  }

  buildQuestionsPrompt(history: string, input: string): string {
    return fillTemplate(this.questionsPromptTemplate, { history, input });
  }

  private generateQuestionList(questions: string[]): string {
    return questions.map((q) => `- ${q}\n`).join("");
  }

  private generateCollectionCompleteText(questions: string[]): string {
    return questions.length === 1
      ? "Once you have collected an answer to the question"
      : `Once you have collected answers to all ${questions.length} questions`;
  }

  private generateExtractionPromptTemplate(questions: Record<string, string>): string {
    const extractionPromptText =
      "You are an expert extraction algorithm. " +
      "Only extract relevant information from the Human answers in the text. " +
      "Use only the words and phrases that the text contains. " +
      "If you do not know the value of an attribute asked to extract, return null for the attribute's value.\n\n" +
      "You will output a JSON with {keys_string} keys.\n\n" +
      "{questions}\n" +
      "Message to date: {conversation_history}\n\n" +
      "Remember, only extract text that is in the messages above and do not change it. ";

    return fillTemplate(extractionPromptText, {
      keys_string: this.generateSummaryKeysString(questions),
      questions: this.generateSummaryQuestionsText(questions),
    });
  }

  buildExtractionPrompt(conversationHistory: string): string {
    return fillTemplate(this.extractionPromptTemplate, {
      conversation_history: conversationHistory,
    });
  }

  private generateSummaryKeysString(questions: Record<string, string>): string {
    const keys = Object.keys(questions);
    let keysString = `\`${keys[0]}\``;
    for (const key of keys.slice(1, -1)) {
      keysString += `, \`${key}\``;
    }
    if (keys.length > 1) {
      keysString += `, and \`${keys[keys.length - 1]}\``;
    }
    return keysString;
  }

  private generateSummaryQuestionsText(questions: Record<string, string>): string {
    const entries = Object.values(questions);
    let text = `These correspond to the following question${entries.length ? "s" : ""}:\n`;
    entries.forEach((question, i) => {
      text += `${i + 1}: ${question}\n`;
    });
    return text;
  }

  /** Fixed across all studies -- not configured by the study owner. */
  buildAdaptationPrompt(languageLevel: string, scenario: string, input: string): string {
    const template =
      "You're a helpful assistant, helping students adapt a scenario to their liking. " +
      "Use the participant's language level: {language_level}. " +
      "If the level is basic, keep the adaptation short and easy to understand. " +
      "If it is intermediate, use clear everyday language. " +
      "If it is advanced, use richer vocabulary and slightly more complex sentence structure.\n\n" +
      "The original scenario this student came with:\n\n" +
      "Scenario: {scenario}.\n\n" +
      "Their current request is {input}.\n\n" +
      "Suggest an alternative version of the scenario. " +
      "Keep the language and content as similar as possible, while fulfilling the student's request.\n\n" +
      "Return your answer as a JSON file with a single entry called 'new_scenario'.";

    return fillTemplate(template, { language_level: languageLevel, scenario, input });
  }

  private generateOneShot(example: RawStudyConfig["example"]): string {
    return (
      "Example:\n" +
      `${example.conversation.trim()}\n\n` +
      "The scenario based on these responses:\n" +
      `"${example.scenario.trim()}"`
    );
  }

  private generateScenarioPromptTemplate(questions: Record<string, string>): string {
    const scenarioPromptTemplateText =
      "{persona}\n\n" +
      "{one_shot}\n\n" +
      "Your task:\nCreate one complete future healthcare scenario based on the following answers:\n\n" +
      "Use the participant's language level: {language_level}. " +
      "If the level is basic, keep the scenario short and easy to understand. " +
      "If it is intermediate, use clear everyday language. " +
      "If it is advanced, use richer vocabulary and slightly more complex sentence structure.\n\n" +
      "Write a full story for one person or family in a South Asian community in the UK. " +
      "Use an informal, neighbourhood voice with family, neighbours, community support, food, or local trust woven in. " +
      "Do not be formal — write as if you were sharing a real story from the neighbourhood.\n\n" +
      "Use the participant's answers to build a future scenario. If the summary includes goals, cultural factors, or stakeholders, make sure they are reflected clearly in the story.\n\n" +
      "Use this structure exactly:\n" +
      "- Scenario Title: a clear, distinct title different from the other scenarios.\n" +
      "- Setting: where and when this future story happens.\n" +
      "- Actor: who is experiencing this healthcare journey.\n" +
      "- Challenge: what healthcare problem or need they face.\n" +
      "- Journey: what happens, step by step, including people, systems, and support.\n" +
      "- Outcome: how the situation improves and what value it creates.\n" +
      "- Narrative: a short, story-like paragraph or two that brings the future to life.\n" +
      "- Values: a short list of the human values that matter in this story.\n" +
      "- Cultural Factors: a short list of cultural, family, language, or migration considerations.\n" +
      "- Goals: a short list of the goals or hopes driving this story.\n" +
      "- Stakeholders: the people or groups involved in this story.\n" +
      "- Themes: a short list of themes, separated by •.\n\n" +
      "Give each title a distinct heading and avoid repeating the exact same title phrase across scenarios.\n" +
      "Keep the title separate from the narrative and avoid repeating it as the first sentence.\n\n" +
      this.generateQAndA(questions) +
      "\n" +
      "Create a scenario based on these responses.\n\n" +
      'Your output should be a JSON file with a single entry called "output_scenario" ' +
      'and that entry should itself be a JSON object with keys "Scenario Title", "Setting", "Actor", "Challenge", "Journey", "Outcome", "Narrative", "Values", "Cultural Factors", "Goals", "Stakeholders", and "Themes".\n' +
      "Do not return only a title or themes; always provide a title, story narrative, and themes.\n";

    // one_shot is filled in now (it never changes at runtime); persona,
    // language_level, and each summary-answer key are left for buildScenarioPrompt().
    return fillTemplate(scenarioPromptTemplateText, { one_shot: this.oneShot });
  }

  private generateQAndA(questions: Record<string, string>): string {
    let qAndA = "";
    for (const [key, question] of Object.entries(questions)) {
      qAndA += `Question: ${question}\n`;
      qAndA += `Answer: {${key}}\n`;
    }
    return qAndA;
  }

  buildScenarioPrompt(
    persona: string,
    languageLevel: string,
    answers: Record<string, string>
  ): string {
    const vars: Record<string, string> = {
      persona,
      language_level: languageLevel,
      ...answers,
    };
    return fillTemplate(this.scenarioPromptTemplate, vars);
  }
}

/** Study names that can be selected via the config picker. */
export function listAvailableStudies(): string[] {
  return fs
    .readdirSync(CONFIGS_DIR)
    .filter((f) => f.endsWith(".toml"))
    .map((f) => f.replace(/\.toml$/, ""));
}

/** Loads and parses a study's .toml file into a StudyPrompts instance. */
export function loadStudyPrompts(studyName: string): StudyPrompts {
  const safeName = path.basename(studyName); // guard against path traversal
  const filePath = path.join(CONFIGS_DIR, `${safeName}.toml`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Unknown study config: ${studyName}`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = parseToml(raw) as unknown as RawStudyConfig;
  return new StudyPrompts(parsed);
}
