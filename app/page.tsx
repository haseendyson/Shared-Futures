import { loadStudyPrompts, listAvailableStudies } from "@/lib/config";
import { toPublicConfig } from "@/lib/publicConfig";
import { Wizard } from "@/components/Wizard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ study?: string }>;
}) {
  const { study } = await searchParams;
  const availableStudies = listAvailableStudies();
  const preferredStudy = process.env.DEFAULT_STUDY ?? "micron_healthcare_futures";
  const fallbackStudy =
    availableStudies.find((name) => name === preferredStudy) ??
    availableStudies.find((name) => name.includes("healthcare")) ??
    availableStudies[0];
  const studyName = study && availableStudies.includes(study) ? study : fallbackStudy;

  const prompts = loadStudyPrompts(studyName);
  const publicConfig = toPublicConfig(studyName, prompts);

  return <Wizard config={publicConfig} />;
}
