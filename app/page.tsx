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
  const studyName =
    study && availableStudies.includes(study)
      ? study
      : (process.env.DEFAULT_STUDY ?? availableStudies[0]);

  const prompts = loadStudyPrompts(studyName);
  const publicConfig = toPublicConfig(studyName, prompts);

  return <Wizard config={publicConfig} />;
}
