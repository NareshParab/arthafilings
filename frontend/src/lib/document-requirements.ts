import { getService, serviceGroups } from "@/data/service-catalog";
import { getServiceContent } from "@/data/service-content";
import type { DocumentRequirement } from "@/types";

// Required documents come from each service's own content (documentsNeeded).
// Services without hand-written content fall back to the generic [TBD] list
// that getServiceContent already produces.
export function getDocumentRequirements(serviceSlug: string): DocumentRequirement[] {
  const service = getService(serviceSlug);
  if (!service) return [];
  const group = serviceGroups.find((item) => item.slug === service.group);
  if (!group) return [];

  const content = getServiceContent(service, group);
  const requirements: DocumentRequirement[] = [];

  content.documentsNeeded.forEach((docGroup, groupIndex) => {
    docGroup.items.forEach((item, itemIndex) => {
      requirements.push({
        id: `${serviceSlug}-${groupIndex}-${itemIndex}`,
        label: item,
        hint: docGroup.heading,
        required: true,
      });
    });
  });

  return requirements;
}
