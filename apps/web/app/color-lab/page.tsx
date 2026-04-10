import { Metadata } from "next";
import ColorLabAdminWorkspace from "@/components/color-lab/ColorLabAdminWorkspace";
import ColorLabExperience from "@/components/color-lab/ColorLabExperience";
import { parseColorLabSearchParams } from "@/lib/color-lab/search-params";
import { withTimeout } from "@/lib/utils/with-timeout";
import {
  getCachedColorLabPageData,
  getDegradedColorLabPageData,
  getFallbackColorLabPageData,
  PUBLIC_COLOR_LAB_DATA_TIMEOUT_MS,
} from "@/lib/color-lab/queries";

export const metadata: Metadata = {
  title: "Color Lab — Sony Wiki",
  description: "Recipe library, preview photos và settings panel cho Color Lab của Sony",
};

export default async function ColorLabPage({
  searchParams,
}: PageProps<"/color-lab">) {
  const parsedSearchParams = parseColorLabSearchParams(await searchParams);
  const experienceKey = [
    parsedSearchParams.q ?? "",
    parsedSearchParams.cameraLine ?? "",
    parsedSearchParams.profile ?? "",
  ].join("::");
  let colorLabData = getFallbackColorLabPageData();

  try {
    colorLabData = await withTimeout(
      getCachedColorLabPageData(),
      PUBLIC_COLOR_LAB_DATA_TIMEOUT_MS,
      "Color Lab public data timed out."
    );
  } catch {
    colorLabData = getDegradedColorLabPageData();
  }

  return (
    <div className="space-y-6 py-8">
      <ColorLabExperience
        key={experienceKey}
        initialCameraLine={parsedSearchParams.cameraLine}
        initialProfile={parsedSearchParams.profile}
        initialQuery={parsedSearchParams.q}
        loadState={colorLabData.loadState}
        recipes={colorLabData.recipes}
        photos={colorLabData.photos}
        source={colorLabData.source}
      />
      <div>
        <ColorLabAdminWorkspace />
      </div>
    </div>
  );
}
