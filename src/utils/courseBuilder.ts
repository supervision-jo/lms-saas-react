// /src/utils/builder.ts

/** =========================
 * Builder (local) types
 * ========================= */
export type BuilderLesson = {
  id: string;
  title: string;
  type: "video" | "article" | "quiz" | "exam" | "material";
  videoUrl?: string;
  youtubeUrl?: string;
  duration?: string; // UI string; we convert to hours:number
  free_preview?: boolean;
  fileUrl?: string; // for material preview/url
  order: number; // 1-based in UI
  description?: string;
  description_html?: any; // article rich content
  quiz?: any; // optional in-UI
};

export type BuilderModule = {
  id: string;
  title: string;
  description?: string;
  order: number; // 1-based in UI
  lessons: BuilderLesson[];
};

export type BuilderCourse = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string; // UI-only, maps to sub_category when needed elsewhere
  level: string;
  modules: BuilderModule[];
};

/** =========================
 * Server shapes (minimal)
 * ========================= */
export type ApiLesson = {
  id: string;
  title: string;
  duration_hours: number;
  description: string;
  url: string | null;
  free_preview: boolean;
  content_type: "video" | "article" | "quiz" | "exam" | "material";
  order: number; // 1-based
  file: any;
  string_file: string; // base64 if provided
  description_html: any;
};

export type ApiModule = {
  id: string;
  title: string;
  description: string;
  order: number; // 1-based
  lessons: ApiLesson[];
};

/** =========================
 * Small utilities
 * ========================= */

// "1h 30m 20s" | "75:20" | "1:15:30" | "90m" -> hours number
export function parseDurationToHours(input?: string | number | null): number {
  if (input == null || input === "") return 0;
  if (typeof input === "number") return Number.isFinite(input) ? input : 0;

  const s = String(input).trim().toLowerCase();
  if (!s) return 0;

  // HH:MM:SS or MM:SS or H
  if (s.includes(":")) {
    const parts = s.split(":").map((p) => p.trim());
    if (parts.length === 3) {
      const [hh, mm, ss] = parts.map((x) => parseFloat(x) || 0);
      return hh + mm / 60 + ss / 3600;
    }
    if (parts.length === 2) {
      const [mm, ss] = parts.map((x) => parseFloat(x) || 0);
      return mm / 60 + ss / 3600;
    }
    const h = parseFloat(parts[0]);
    return Number.isFinite(h) ? h : 0;
  }

  let h = 0,
    m = 0,
    sec = 0;
  const re = /(\d+(?:\.\d+)?)\s*([hms])/g;
  let match: RegExpExecArray | null;
  let matched = false;
  while ((match = re.exec(s))) {
    matched = true;
    const val = parseFloat(match[1]);
    const unit = match[2];
    if (unit === "h") h += val;
    else if (unit === "m") m += val;
    else if (unit === "s") sec += val;
  }
  if (matched) return h + m / 60 + sec / 3600;

  const num = parseFloat(s);
  return Number.isFinite(num) ? num : 0;
}

export function isYouTubeUrl(u?: string) {
  if (!u) return false;
  return /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))/i.test(
    u
  );
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "") || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/"))
        return u.pathname.split("/")[2] ?? null;
      if (u.pathname.startsWith("/shorts/"))
        return u.pathname.split("/")[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function isContent(
  t?: BuilderLesson["type"] | ApiLesson["content_type"]
) {
  return t === "video" || t === "article" || t === "material";
}

export function isAssessment(
  t?: BuilderLesson["type"] | ApiLesson["content_type"]
) {
  return t === "quiz" || t === "exam";
}

// Reindex array items with 1-based order (no gaps)
export function reindexOrders1Based<T extends { order: number }>(
  items: T[]
): T[] {
  return items.map((it, idx) => ({ ...it, order: idx + 1 }));
}

// Find the content lesson id immediately above a given index
export function anchorAbove(
  lessons: { id: string; content_type?: any; type?: any }[],
  idx: number
): string | null {
  for (let i = idx - 1; i >= 0; i--) {
    const t = (lessons[i] as any).content_type ?? (lessons[i] as any).type;
    if (isContent(t)) return (lessons[i] as any).id;
  }
  return null;
}

export function nextAssessmentTitle(
  mod: { lessons: { title: string; content_type: string }[] },
  kind: "quiz" | "exam"
) {
  const count = (mod.lessons || []).filter(
    (l) => l.content_type === kind
  ).length;
  const base = kind === "quiz" ? "Quiz" : "Exam";
  return `${base} ${count + 1}`;
}

// Convert File/blob to base64 string (no data: prefix)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      // strip "data:*/*;base64," prefix
      const idx = result.indexOf("base64,");
      res(idx >= 0 ? result.slice(idx + 7) : result);
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

/** =========================
 * Mappers (Server <-> Builder)
 * ========================= */

// Server -> Builder
export function apiLessonToBuilder(api: ApiLesson): BuilderLesson {
  if (api.content_type === "video") {
    return {
      id: api.id,
      title: api.title,
      type: "video",
      youtubeUrl: isYouTubeUrl(api.url || "") ? api.url || "" : "",
      videoUrl: isYouTubeUrl(api.url || "") ? "" : api.url || "",
      duration: api.duration_hours ? String(api.duration_hours) : "",
      free_preview: api.free_preview,
      order: api.order,
      description: api.description || "",
    };
  }
  if (api.content_type === "article") {
    return {
      id: api.id,
      title: api.title,
      type: "article",
      description: api.description || "",
      description_html: api.description_html,
      order: api.order,
    };
  }
  if (api.content_type === "material") {
    return {
      id: api.id,
      title: api.title,
      type: "material",
      fileUrl: api.url || "", // server may store a URL to the material
      order: api.order,
      description: api.description || "",
    };
  }
  // quiz/exam kept in lessons list for UI, but managed via separate endpoint
  if (api.content_type === "quiz" || api.content_type === "exam") {
    return {
      id: api.id,
      title: api.title,
      type: api.content_type,
      order: api.order,
    };
  }

  // fallback
  return {
    id: api.id,
    title: api.title,
    type: "article",
    order: api.order,
  };
}

export function apiModuleToBuilder(api: ApiModule): BuilderModule {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    order: api.order,
    lessons: (api.lessons || [])
      .map(apiLessonToBuilder)
      .sort((a, b) => a.order - b.order),
  };
}

export function apiModulesToBuilder(mods: ApiModule[]): BuilderModule[] {
  return mods.map(apiModuleToBuilder).sort((a, b) => a.order - b.order);
}

// Builder -> Server (content lessons only)
export function builderLessonToApiContent(
  b: BuilderLesson
): Partial<ApiLesson> | null {
  // skip assessments in section payload
  if (!isContent(b.type)) return null;

  const duration_hours = parseDurationToHours(b.duration);
  const free_preview = Boolean(b.free_preview);

  if (b.type === "video") {
    const url = b.youtubeUrl?.trim()
      ? b.youtubeUrl!.trim()
      : b.videoUrl?.trim()
      ? b.videoUrl!.trim()
      : null;

    return {
      id: String(b.id),
      title: b.title?.trim() || "Untitled Video",
      content_type: "video",
      url,
      duration_hours,
      description: b.description || "",
      free_preview,
      order: Number(b.order) || 1,
      string_file: "", // n/a for video
      file: null,
      description_html: null,
    } as Partial<ApiLesson>;
  }

  if (b.type === "article") {
    return {
      id: String(b.id),
      title: b.title?.trim() || "Untitled Article",
      content_type: "article",
      url: null,
      duration_hours: 0, // optional
      description: b.description || "",
      description_html: b.description_html ?? b.description ?? "",
      free_preview,
      order: Number(b.order) || 1,
      string_file: "",
      file: null,
    } as Partial<ApiLesson>;
  }

  if (b.type === "material") {
    // material supports either direct URL (fileUrl) or base64 string_file
    return {
      id: String(b.id),
      title: b.title?.trim() || "Untitled Material",
      content_type: "material",
      url: b.fileUrl?.trim() || null,
      duration_hours: 0,
      description: b.description || "",
      free_preview,
      order: Number(b.order) || 1,
      // string_file is appended by caller if a base64 is available
      string_file: "",
      file: null,
      description_html: null,
    } as Partial<ApiLesson>;
  }

  return null;
}

/**
 * Build FormData for updateSection endpoint.
 * - Includes ONLY content lessons (video/article/material)
 * - Ensures 1-based order
 * - If you have a base64 file for a given material lesson, pass it via `materialBase64ById`.
 *
 * Server usually expects: fd.append("lessons", JSON.stringify([...]))
 */
export function buildSectionLessonsFD(
  lessons: BuilderLesson[],
  materialBase64ById?: Record<string, string> // { [lessonId]: base64StringOnly }
): FormData {
  const contentLessons = lessons
    .filter((l) => isContent(l.type))
    .map((l) => ({ ...l }))
    .sort((a, b) => a.order - b.order);

  const normalized = reindexOrders1Based(contentLessons);

  const payload = normalized.map((l) => {
    const base = builderLessonToApiContent(l)!; // non-null because filtered by isContent
    // wire string_file if provided (for material upload)
    if (l.type === "material" && materialBase64ById?.[l.id]) {
      (base as any).string_file = materialBase64ById[l.id];
    }
    return base;
  });

  const fd = new FormData();
  fd.append("lessons", JSON.stringify(payload));
  return fd;
}

/** Helpful guard: find last content lesson’s id */
export function lastContentLessonId(lessons: BuilderLesson[]): string | null {
  for (let i = lessons.length - 1; i >= 0; i--) {
    if (isContent(lessons[i].type)) return lessons[i].id;
  }
  return null;
}
