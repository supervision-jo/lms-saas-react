/** =========================
 * Mapping & Flow helpers
 * ========================= */

export function durationToHours(input?: string): number | undefined {
  if (!input) return undefined;
  const s = input.toLowerCase().trim();
  let seconds = 0;
  const hms = s.match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/);
  if (hms) {
    const h = hms[3] ? parseInt(hms[1]) : 0;
    const m = hms[3] ? parseInt(hms[2]) : parseInt(hms[1]);
    const sec = hms[3] ? parseInt(hms[3]) : parseInt(hms[2]);
    seconds = h * 3600 + m * 60 + sec;
    return +(seconds / 3600).toFixed(3);
  }
  const h = /(\d+)\s*h/.exec(s)?.[1];
  const m = /(\d+)\s*m(in)?/.exec(s)?.[1];
  const sec = /(\d+)\s*s(ec)?/.exec(s)?.[1];
  if (h || m || sec) {
    seconds =
      (h ? parseInt(h) * 3600 : 0) +
      (m ? parseInt(m) * 60 : 0) +
      (sec ? parseInt(sec) : 0);
    return +(seconds / 3600).toFixed(3);
  }
  const plain = parseFloat(s);
  if (!Number.isNaN(plain)) return +(plain / 60).toFixed(3);
  return undefined;
}

const stripUndefined = <T extends Record<string, any>>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
};

export function mapLessonToApi(lesson: BuilderLesson, orderIndex0: number) {
  const common = {
    title: lesson.title,
    order: orderIndex0 + 1,
    free_preview: !!lesson.free_preview,
  };
  const duration_hours = durationToHours(lesson.duration);

  switch (lesson.type) {
    case "video": {
      const url = lesson.youtubeUrl?.trim() || lesson.videoUrl?.trim();
      return stripUndefined({
        ...common,
        description: lesson.description,
        content_type: "video",
        url,
        duration_hours,
      });
    }
    case "article": {
      return stripUndefined({
        ...common,
        content_type: "article",
        description: lesson.description,
        description_html: lesson.description_html,
        duration_hours,
      });
    }
    case "material": {
      // TEMP: use url to carry the download link (backend to add material_url later)
      return stripUndefined({
        ...common,
        content_type: "material",
        description: lesson.description_html || lesson.description,
        url: (lesson as any).fileUrl?.trim() || undefined, // <— important
        duration_hours,
      });
    }
    case "quiz":
    case "exam": {
      return stripUndefined({
        ...common,
        content_type: lesson.type,
        description: lesson.description,
        duration_hours,
      });
    }
    default: {
      return stripUndefined({
        ...common,
        content_type: "video",
        url: lesson.videoUrl?.trim(),
        duration_hours,
      });
    }
  }
}

export function buildCreateSectionBody(courseId: string, mod: BuilderModule) {
  return {
    title: mod.title,
    course: courseId,
    description: mod.description ?? "",
    order: mod.order + 1, // 1-based for API
    lessons: (mod.lessons ?? []).map((l, idx) => mapLessonToApi(l, idx)),
  };
}

// Build Exam/Quiz payload (API type Exam) – robust mapping
export function buildExamPayloadFromLesson(
  lesson: BuilderLesson & { quiz?: any },
  createdLessonId: string
) {
  const q = lesson?.quiz ?? {};

  const rawQuestions =
    (Array.isArray(q?.questions) && q.questions) ||
    (Array.isArray(q?.items) && q.items) ||
    (Array.isArray(q?.data?.questions) && q.data.questions) ||
    [];

  const questions = rawQuestions
    .map((qq: any, idx: number) => {
      const text =
        qq?.question ?? qq?.text ?? qq?.title ?? `Question ${idx + 1}`;

      const rawType = String(qq?.question_type ?? qq?.type ?? "").toLowerCase();

      const rawOptions: any[] = Array.isArray(qq?.options)
        ? qq.options
        : Array.isArray(qq?.choices)
        ? qq.choices
        : [];

      const choices =
        rawOptions.length > 0
          ? rawOptions.map((opt: any) => ({
              text: String(opt?.text ?? opt?.label ?? ""),
              is_correct: Boolean(opt?.isCorrect ?? opt?.is_correct ?? false),
            }))
          : [];

      const answerText =
        qq?.answer ?? qq?.correct_answer ?? qq?.correctAnswer ?? "";

      let qtype: "mcq" | "short_answer";
      if (rawType.includes("short")) {
        qtype = "short_answer";
      } else if (choices.length > 0) {
        qtype = "mcq";
      } else if (String(answerText).trim().length > 0) {
        qtype = "short_answer";
      } else {
        return null;
      }

      if (qtype === "mcq") {
        if (choices.length === 0) return null;
        return {
          text: String(text),
          question_type: "mcq",
          explanation: String(qq?.explanation ?? ""),
          choices,
        };
      }

      return {
        text: String(text),
        question_type: "short_answer",
        explanation: String(qq?.explanation ?? ""),
        answer: String(answerText ?? ""),
      };
    })
    .filter(Boolean);

  const minutes = q?.time_limit_mins
    ? Math.max(0, Math.round(Number(q.time_limit_mins)))
    : q?.totalTimeLimit
    ? Math.max(0, Math.round(Number(q.totalTimeLimit) / 60))
    : 0;

  const title =
    q?.title || lesson.title || (lesson.type === "exam" ? "Exam" : "Quiz");

  const passing_score =
    typeof q?.passing_score === "number" ? q.passing_score : 70;

  return {
    lesson: createdLessonId,
    type: lesson.type, // "quiz" | "exam"
    title,
    description: q?.description || "",
    time_limit: minutes,
    passing_score,
    questions,
  } as any;
}

export type CreateCourseInput = {
  title: string;
  description: string;
  subCategoryId: string;
  level: "beginner" | "intermediate" | "advanced" | "all-levels" | string;
  price?: number;
  isPaid?: boolean;
  isPublished?: boolean;
  pictureFile?: File | null;
};

export function buildCreateCourseFormData(input: CreateCourseInput) {
  const fd = new FormData();
  if (input.pictureFile) fd.append("picture", input.pictureFile);
  fd.append("title", (input.title || "").trim());
  fd.append("description", (input.description || "").trim());
  fd.append("sub_category", input.subCategoryId);
  fd.append("level", String(input.level));

  const price = Number(input.price ?? 0);
  const isPaid = input.isPaid ?? price > 0;

  fd.append("price", String(price));
  fd.append("is_paid", String(!!isPaid));
  fd.append("is_published", String(!!input.isPublished));
  return fd;
}

/** =========================
 * Edit-mode hydrate helper
 * ========================= */
export function apiToBuilder(course: any): {
  courseLocal: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    level: string;
    modules: BuilderModule[];
  };
  isPublished: boolean;
} {
  const modules = (course?.modules ?? []).map((m: Module, mi: number) => {
    const lessons = (m?.lessons ?? []).map((ls: Lesson, li: number) => {
      const base: BuilderLesson = {
        id: String(ls.id ?? `${mi}-${li}`),
        title: ls.title ?? `Lesson ${li + 1}`,
        type: (ls.content_type as any) ?? "video",
        order: (ls.order ?? li) as number,
        description: (ls.description ?? "") as any,
        free_preview: !!ls.free_preview,
      };
      if (ls.content_type === "video") {
        return {
          ...base,
          videoUrl: (ls.url as any) ?? "",
        };
      }
      if (ls.content_type === "article") {
        return {
          ...base,
          content: (ls.description_html as any) ?? "",
        };
      }
      if (ls.content_type === "material") {
        return {
          ...base,
          fileUrl: (ls.file as any) ?? "",
        };
      }
      if (ls.content_type === "quiz" || ls.content_type === "exam") {
        return {
          ...base,
          // quiz/exam content is stored separately; we show as attached placeholder
        };
      }
      return base;
    });
    return {
      id: String(m.id),
      title: m.title ?? `Module ${mi + 1}`,
      description: m.description ?? "",
      order: (m.order ?? mi) as number,
      lessons,
    } as BuilderModule;
  });

  return {
    courseLocal: {
      id: String(course?.id ?? ""),
      title: course?.title ?? "",
      description: course?.description ?? "",
      price: Number(course?.price ?? 0),
      category: String(course?.sub_category ?? ""),
      level: String(course?.level ?? "beginner"),
      modules,
    },
    isPublished: !!course?.is_published,
  };
}

/** Convert various duration inputs to hours (float).
 * Accepts:  "1:30", "01:30:45", "10m 30s", "1h 5m", "90m", "5400s", 1.5, "1.5"
 */
export function parseDurationToHours(input: unknown): number {
  if (input == null) return 0;

  if (typeof input === "number") {
    return isFinite(input) ? input : 0;
  }

  const s = String(input).trim().toLowerCase();
  if (!s) return 0;

  // HH:MM(:SS)? or MM:SS
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
    // single value with colon? treat as hours fallback
    const h = parseFloat(parts[0]);
    return isFinite(h) ? h : 0;
  }

  // Tokens like "1h 20m 30s", "90m", "5400s"
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

  // Plain numeric string: assume hours
  const num = parseFloat(s);
  return isFinite(num) ? num : 0;
}
