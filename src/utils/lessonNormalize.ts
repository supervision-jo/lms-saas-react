import { reindexOrders1Based } from "./courseBuilder";

export const normalizeLessonForSave = (l: any) => {
  // ⛔ assessments are saved via /exams APIs only
  if (l?.content_type === "quiz" || l?.content_type === "exam") return null;
  if ((l as any)?._draft) return null;

  const common: any = {};
  if (l?.id && !String(l.id).startsWith("tmp-")) common.id = l.id;
  if (l?.content_type) common.content_type = l.content_type;
  if (l?.order != null) common.order = Number(l.order);
  if (typeof l?.free_preview === "boolean")
    common.free_preview = l.free_preview;

  if (l?.content_type === "video") {
    return {
      ...common,
      title: l?.title ?? "",
      description: l?.description ?? "",
      url: l?.url || "",
      duration_hours:
        typeof l?.duration_hours === "number"
          ? l.duration_hours
          : l?.duration
          ? Number(l.duration) || null
          : null,
    };
  }

  if (l?.content_type === "article") {
    return {
      ...common,
      title: l?.title ?? "",
      description_html:
        l?.description_html != null ? l.description_html : l?.description ?? "",
      duration_hours:
        typeof l?.duration_hours === "number" ? l.duration_hours : null,
    };
  }

  if (l?.content_type === "material") {
    const out: any = {
      ...common,
      title: l?.title ?? "",
      description: l?.description ?? "",
    };
    const hasString =
      typeof l?.string_file === "string" && l.string_file.length > 0;
    if (hasString) out.string_file = l.string_file;
    else if (l?.url) out.url = l.url;
    return out;
  }

  // fallback
  return {
    ...common,
    title: l?.title ?? "",
    description: l?.description ?? "",
  };
};

export const buildLessonsPayload = (sourceLessons: any[]) => {
  const contentOnly = sourceLessons.filter(
    (x: any) =>
      x?.content_type === "video" ||
      x?.content_type === "article" ||
      x?.content_type === "material"
  );
  const normalized = reindexOrders1Based(contentOnly);
  return { lessons: normalized.map(normalizeLessonForSave).filter(Boolean) };
};
