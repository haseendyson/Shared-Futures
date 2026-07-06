/** Shape the LLM is asked to return inside output_scenario. All fields optional/loose since the model isn't always perfectly consistent. */
export type ScenarioData = Record<string, unknown> | string | null | undefined;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Converts a scenario (dict or string) into clean, human-readable text.
 * Direct port of the duplicated _scenario_to_text in scenario.py / review.py.
 */
export function scenarioToText(scenarioData: ScenarioData): string {
  if (scenarioData === null || scenarioData === undefined) return "";
  if (typeof scenarioData === "string") return scenarioData.trim();

  const data = asRecord(scenarioData);
  const parts: string[] = [];

  const aiBlock = asRecord(data["AI-Generated Scenario"]);

  const title =
    str(data["Scenario Title"]) ??
    str(data["scenario_title"]) ??
    str(aiBlock["Scenario Title"]) ??
    str(aiBlock["scenario_title"]);
  if (title) parts.push(`**${title}**`);

  const narrative = str(aiBlock["Narrative"]) ?? str(aiBlock["narrative"]);
  if (narrative) parts.push(narrative);

  const settingsText = str(aiBlock["Setting"]) ?? str(aiBlock["setting"]);
  const actorText = str(aiBlock["Actor"]) ?? str(aiBlock["actor"]);
  const challengeText = str(aiBlock["Challenge"]) ?? str(aiBlock["challenge"]);
  const journeyText = str(aiBlock["Journey"]) ?? str(aiBlock["journey"]);
  const outcomeText = str(aiBlock["Outcome"]) ?? str(aiBlock["outcome"]);
  const valuesText = str(aiBlock["Values"]) ?? str(aiBlock["values"]);
  const culturalText =
    str(aiBlock["Cultural Factors"]) ?? str(aiBlock["cultural_factors"]) ?? str(aiBlock["culturalFactors"]);
  const goalsText = str(aiBlock["Goals"]) ?? str(aiBlock["goals"]);
  const stakeholdersText = str(aiBlock["Stakeholders"]) ?? str(aiBlock["stakeholders"]);
  const themes = str(aiBlock["Themes"]) ?? str(aiBlock["themes"]);

  if (narrative) {
    if (valuesText) parts.push(`*Values: ${valuesText}*`);
    if (culturalText) parts.push(`*Cultural Factors: ${culturalText}*`);
    if (goalsText) parts.push(`*Goals: ${goalsText}*`);
    if (stakeholdersText) parts.push(`*Stakeholders: ${stakeholdersText}*`);
    if (themes) parts.push(`*Themes: ${themes}*`);
  } else {
    if (settingsText) parts.push(`*Setting: ${settingsText}*`);
    if (actorText) parts.push(`*Actor: ${actorText}*`);
    if (challengeText) parts.push(`*Challenge: ${challengeText}*`);
    if (journeyText) parts.push(`*Journey: ${journeyText}*`);
    if (outcomeText) parts.push(`*Outcome: ${outcomeText}*`);
    if (valuesText) parts.push(`*Values: ${valuesText}*`);
    if (themes) parts.push(`*Themes: ${themes}*`);
  }

  if (parts.length <= 1) {
    for (const key of ["narrative", "Narrative", "output_scenario", "scenario"]) {
      const value = str(data[key]);
      if (value) {
        parts.push(value);
        break;
      }
    }
  }

  return parts.length ? parts.join("\n\n") : JSON.stringify(scenarioData);
}
