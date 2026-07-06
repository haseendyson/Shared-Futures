/**
 * Fills `{key}` placeholders in a template string with values from `vars`.
 * Mirrors the behaviour of Python's LangChain `PromptTemplate` / `str.format`:
 * any `{key}` not present in `vars` is left untouched (so it can be filled in
 * a later pass, e.g. runtime conversation variables filled after config-time
 * variables).
 */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match;
  });
}
