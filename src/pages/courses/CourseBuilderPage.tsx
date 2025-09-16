import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Eye,
  Upload,
  FileText,
  Award,
  ArrowLeft,
  Save,
  Video,
  HelpCircle,
  Users,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router";
import { useCustomQuery } from "../../hooks/useQuery";
import { useCustomPost, useCustomPatch } from "../../hooks/useMutation";
import { API_ENDPOINTS } from "../../utils/constants";
import toast from "react-hot-toast";
import QuizPreview from "../../components/quizes/QuizPreview";
import QuizBuilder from "../../components/quizes/QuizBuilder";
import {
  buildCreateCourseFormData,
  buildExamPayloadFromLesson,
  apiToBuilder,
} from "../../utils/courseBuilder";
import CourseInformationForm from "../../components/course/course-builder/CourseInformationForm";
import CreateSectionsForm from "../../components/course/course-builder/CreateSectionsForm";
import SettingsForm from "../../components/course/course-builder/SettingsForm";
import EditLesson from "../../components/course/course-builder/EditLesson";
import EditArticle from "../../components/course/course-builder/EditArticle";
import UploadingMaterial from "../../components/course/course-builder/UploadingMaterial";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GroupManagement from "../../components/course/course-builder/GroupManagement";
import UserManagement from "../../components/course/course-builder/UserManagement";

// ⬇️ axios-based patch helper (from /src/api/index.ts)
import { patch as apiPatch } from "../../api";

/** =========================
 * Local types
 * ========================= */
type CourseFormInputs = {
  title: string;
  description: string;
  price: number;
  level: string;
  sub_category: string;
};

type BuilderLessonEx = BuilderLesson & {
  parentId?: string;
  file?: File | null;
  pendingCreate?: boolean;
};

const CONTENT_TYPES = new Set<BuilderLesson["type"]>([
  "video",
  "article",
  "material",
]);
const isContent = (t: BuilderLesson["type"]) => CONTENT_TYPES.has(t);
const isAssessment = (t: BuilderLesson["type"]) => t === "quiz" || t === "exam";

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Convert flexible duration to hours (float) */
function parseDurationToHours(input: unknown): number {
  if (input == null) return 0;
  if (typeof input === "number") return isFinite(input) ? input : 0;
  const s = String(input).trim().toLowerCase();
  if (!s) return 0;
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
    return isFinite(h) ? h : 0;
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
  return isFinite(num) ? num : 0;
}

function normNum(n: any, fallback = 0) {
  const k = Number(n);
  return Number.isFinite(k) ? k : fallback;
}

function isYouTubeUrl(u: string) {
  return /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))/i.test(
    String(u || "")
  );
}

/** ===== API → Builder mappers (with url normalization) ===== */
function mapApiLesson(l: any, idx: number): any /* BuilderLesson */ {
  const id = String(l?.id ?? uid());
  const rawType = l?.content_type ?? l?.type ?? "";
  const type: BuilderLesson["type"] =
    rawType === "video" || rawType === "article" || rawType === "material"
      ? rawType
      : l?.url
      ? "video"
      : "article";

  const url: string =
    l?.url ?? l?.video_url ?? l?.youtube_url ?? l?.file_url ?? "";

  const base: any = {
    id,
    title: l?.title ?? `Lesson ${idx + 1}`,
    type,
    order: normNum(l?.order, idx),
    free_preview: Boolean(l?.free_preview),
  };

  if (type === "video") {
    if (isYouTubeUrl(url)) {
      base.youtubeUrl = url;
      base.videoUrl = "";
    } else {
      base.videoUrl = url;
      base.youtubeUrl = "";
    }
    base.duration = l?.duration ?? l?.duration_hours ?? "";
  } else if (type === "material") {
    base.fileUrl = url;
    base.description = l?.description ?? "";
  } else if (type === "article") {
    base.description = l?.description_html ?? l?.description ?? "";
    base.duration = l?.duration ?? l?.duration_hours ?? "";
  }

  return base;
}

function mapApiSectionToModule(s: any, sIdx: number): BuilderModule {
  const lessonsApi: any[] = Array.isArray(s?.lessons) ? s.lessons : [];

  const contentLessons = lessonsApi
    .filter((l) => {
      const t = l?.content_type ?? l?.type;
      return t === "video" || t === "article" || t === "material";
    })
    .map(mapApiLesson)
    .sort((a, b) => a.order - b.order);

  const withAssessments: any[] = [];
  for (const c of contentLessons) {
    withAssessments.push(c);

    const src = lessonsApi.find((l) => String(l?.id) === String(c.id)) || {};
    const candidates: any[] = [
      ...(Array.isArray(src.assessments) ? src.assessments : []),
      ...(Array.isArray(src.exams) ? src.exams : []),
      ...(Array.isArray(src.quizzes) ? src.quizzes : []),
    ];
    if (src.quiz) candidates.push({ ...src.quiz, type: "quiz" });
    if (src.exam) candidates.push({ ...src.exam, type: "exam" });

    const attached = candidates
      .map((a) => {
        const t = a?.type ?? a?.assessment_type ?? a?.kind;
        if (t !== "quiz" && t !== "exam") return null;
        return {
          id: String(a?.id ?? uid()),
          title: a?.title ?? (t === "quiz" ? "Quiz" : "Exam"),
          type: t,
          order: 0,
          parentId: c.id,
          quiz: a?.quiz ?? a,
        };
      })
      .filter(Boolean);

    withAssessments.push(...attached);
  }

  withAssessments.forEach((l, i) => (l.order = i));

  return {
    id: String(s?.id ?? uid()),
    title: s?.title ?? `Module ${sIdx + 1}`,
    description: s?.description ?? "",
    order: normNum(s?.order, sIdx),
    lessons: withAssessments,
  };
}

/** Keep exactly one url field depending on lesson type + repair bad pastes */
type UrlSanitizable = {
  type: BuilderLesson["type"];
  url?: string | null;
  youtubeUrl?: string | null;
  videoUrl?: string | null;
  fileUrl?: string | null;
  [key: string]: any;
};
function sanitizeLessonUrls<L extends UrlSanitizable>(lesson: L): L {
  const l: UrlSanitizable = { ...lesson };
  const raw = String(l.url ?? "").trim();

  if (l.type === "video") {
    const you = String(l.youtubeUrl ?? "").trim();
    const vid = String(l.videoUrl ?? "").trim();
    let youtubeUrl = "";
    let videoUrl = "";
    if (you && isYouTubeUrl(you)) youtubeUrl = you;
    else if (vid && !isYouTubeUrl(vid)) videoUrl = vid;
    else if (you && !isYouTubeUrl(you) && !vid) videoUrl = you;
    else if (vid && isYouTubeUrl(vid) && !you) youtubeUrl = vid;
    if (!youtubeUrl && !videoUrl && raw) {
      if (isYouTubeUrl(raw)) youtubeUrl = raw;
      else videoUrl = raw;
    }
    delete l.url;
    l.youtubeUrl = youtubeUrl;
    l.videoUrl = videoUrl;
    l.fileUrl = "";
  } else if (l.type === "material") {
    const file = String(l.fileUrl ?? raw ?? "").trim();
    delete l.url;
    l.fileUrl = file;
    l.youtubeUrl = "";
    l.videoUrl = "";
  } else if (l.type === "article") {
    delete l.url;
    delete l.youtubeUrl;
    delete l.videoUrl;
    delete l.fileUrl;
  }
  return l as L;
}
function sanitizeCurriculumUrls(modules: BuilderModule[]): BuilderModule[] {
  return modules.map((m) => ({
    ...m,
    lessons: (m.lessons ?? []).map((l: any) => sanitizeLessonUrls(l)),
  }));
}

/** ----- exams API shape ----- */
type ExamApi = {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "exam";
  lesson: string;
  time_limit: number;
  passing_score: number;
  questions: Array<{
    id: string;
    text: string;
    question_type: string;
    explanation: string;
    choices: Array<{ id: string; text: string; is_correct: boolean }>;
  }>;
};

function toArray<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

const isServerId = (id: string | undefined | null) =>
  typeof id === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );

const unwrap = (x: any) => x?.data?.data ?? x?.data ?? x;

function attachAssessmentsToLesson(
  modules: BuilderModule[],
  lessonId: string,
  assessments: ExamApi[]
): BuilderModule[] {
  if (!assessments?.length) return modules;

  const next = modules.map((m) => ({ ...m, lessons: [...(m.lessons ?? [])] }));
  for (const mod of next) {
    const list = mod.lessons as any[];
    const parentIdx = list.findIndex((l) => l.id === lessonId);
    if (parentIdx === -1) continue;

    let insertAt = parentIdx;
    for (let i = parentIdx + 1; i < list.length; i++) {
      const li = list[i];
      if (
        (li.type === "quiz" || li.type === "exam") &&
        li.parentId === lessonId
      ) {
        insertAt = i;
      } else break;
    }

    const existingIds = new Set(list.map((x) => String(x.id)));
    const payloads = assessments
      .filter((a) => !existingIds.has(String(a.id)))
      .map((a) => ({
        id: String(a.id),
        type: a.type as "quiz" | "exam",
        title: a.title || (a.type === "quiz" ? "Quiz" : "Exam"),
        parentId: lessonId,
        order: 0,
        quiz: a,
      }));

    if (payloads.length) {
      list.splice(insertAt + 1, 0, ...payloads);
      (mod.lessons ?? []).forEach((l, i) => ((l as any).order = i));
    }
  }
  return next;
}

const AssessmentsLoader: React.FC<{
  lessonId: string;
  onLoaded: (lessonId: string, items: ExamApi[]) => void;
}> = ({ lessonId, onLoaded }) => {
  const { data } = useCustomQuery(
    `${API_ENDPOINTS.exams}?lesson=${encodeURIComponent(lessonId)}`, // <<< correct endpoint
    ["assessments", lessonId],
    undefined,
    !!lessonId
  );

  const firedRef = useRef(false);

  useEffect(() => {
    if (!data || firedRef.current) return;
    const arr = toArray<ExamApi>(data?.data ?? data);
    if (arr.length) {
      onLoaded(lessonId, arr);
      firedRef.current = true; // attach once per lesson
    }
  }, [data, lessonId, onLoaded]);

  return null;
};

/** Modal wrapper */
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => (
  <div
    className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
      {children}
    </div>
  </div>
);

const CourseBuilderPage: React.FC = () => {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const courseId = search.get("courseId") || "";
  const isEditMode = Boolean(courseId);
  const hydratedOnce = useRef(false);
  const hydratedLessonsRef = useRef<Set<string>>(new Set());

  const { register, setValue, watch, reset } = useForm<CourseFormInputs>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      level: "beginner",
      sub_category: "",
    },
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Data sources
  const { data: subCatsResp } = useCustomQuery(API_ENDPOINTS.subCategories, [
    "sub-categories",
  ]);
  const subCategories: SubCategory[] = subCatsResp?.data ?? [];

  // Edit mode: load course by id
  const { data: courseResp } = useCustomQuery(
    `${API_ENDPOINTS.courses}${courseId}/`,
    ["course", courseId],
    undefined,
    !!courseId
  );

  const { data: sectionsResp } = useCustomQuery(
    `${API_ENDPOINTS.modules}?course=${courseId}`,
    ["modules", courseId],
    undefined,
    isEditMode && !!courseId
  );

  const apiCourse: Course = useMemo(
    () => courseResp?.data ?? courseResp,
    [courseResp]
  );

  const [course, setCourse] = useState<BuilderCourse>({
    id: uid(),
    title: "",
    description: "",
    price: 0,
    category: "",
    level: "beginner",
    modules: [],
  });

  const [activeTab, setActiveTab] = useState("course-info");
  const [isPublishedSetting, setIsPublishedSetting] = useState(false);

  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);

  const [editingLesson, setEditingLesson] = useState<{
    moduleId: string;
    lessonId: string;
  } | null>(null);
  const [editingArticle, setEditingArticle] = useState<{
    moduleId: string;
    lessonId: string;
  } | null>(null);
  const [uploadingMaterial, setUploadingMaterial] = useState<{
    moduleId: string;
    lessonId: string;
  } | null>(null);

  /** =========================
   * Reset builder (after successful create)
   * ========================= */
  function resetBuilder() {
    reset({
      title: "",
      description: "",
      price: 0 as any,
      level: "beginner",
      sub_category: "",
    });
    setCourse({
      id: uid(),
      title: "",
      description: "",
      price: 0,
      category: "",
      level: "beginner",
      modules: [],
    });
    setThumbnailFile(null);
    setIsPublishedSetting(false);
    setActiveTab("course-info");
    setSelectedModule(null);
    setSelectedLesson(null);
    setShowQuizBuilder(false);
    setShowQuizPreview(false);
    setCurrentQuiz(null);
    setEditingLesson(null);
    setEditingArticle(null);
    setUploadingMaterial(null);
  }

  // Mutations
  const { mutateAsync: createCourse, isPending: creatingCourse } =
    useCustomPost(API_ENDPOINTS.createCourse, []);
  const { mutateAsync: createSection, isPending: creatingSection } =
    useCustomPost(API_ENDPOINTS.createSection, ["modules"]);
  const { mutateAsync: createAssessment, isPending: creatingAssessments } =
    useCustomPost(API_ENDPOINTS.createExam, ["modules"]);
  const { mutateAsync: patchCourse, isPending: patchingCourse } =
    useCustomPatch(
      `${API_ENDPOINTS.updateCourse}${courseId || "__create__"}/`,
      ["course", courseId || "__create__"]
    );

  const isBusy =
    creatingCourse || creatingSection || creatingAssessments || patchingCourse;

  /** =========================
   * Hydrate edit mode (+ fallback if needed)
   * ========================= */
  useEffect(() => {
    if (!isEditMode || !apiCourse) return;
    try {
      const { courseLocal, isPublished } = apiToBuilder(apiCourse);

      setIsPublishedSetting(Boolean(isPublished ?? apiCourse?.is_published));
      setValue("title", courseLocal?.title ?? apiCourse?.title ?? "");
      setValue(
        "description",
        courseLocal?.description ?? apiCourse?.description ?? ""
      );
      setValue(
        "price",
        Number(courseLocal?.price ?? apiCourse?.price ?? 0) as any
      );
      setValue(
        "level",
        String(courseLocal?.level ?? apiCourse?.level ?? "beginner")
      );
      setValue(
        "sub_category",
        String(
          courseLocal?.category ??
            apiCourse?.sub_category ??
            apiCourse?.sub_category ??
            ""
        )
      );
    } catch (e) {
      console.warn("Hydration failed", e);
    }
  }, [isEditMode, apiCourse, setValue]);

  useEffect(() => {
    hydratedOnce.current = false;
    hydratedLessonsRef.current.clear();
  }, [courseId]);

  useEffect(() => {
    if (!isEditMode || hydratedOnce.current) return;

    const raw = sectionsResp?.data?.data ?? sectionsResp?.data ?? sectionsResp;
    if (!Array.isArray(raw) || raw.length === 0) return;

    const mapped = raw
      .map(mapApiSectionToModule)
      .sort((a, b) => a.order - b.order)
      .map((m, i) => ({ ...m, order: i }));

    const mappedClean = sanitizeCurriculumUrls(mapped);
    setCourse((prev) => ({ ...prev, modules: mappedClean }));
    hydratedOnce.current = true;
  }, [isEditMode, sectionsResp]);

  // Fallback result shapes
  useEffect(() => {
    if (!isEditMode || hydratedOnce.current) return;

    const raw =
      sectionsResp?.data?.results ??
      sectionsResp?.data?.data ??
      sectionsResp?.data ??
      sectionsResp;

    if (!Array.isArray(raw) || raw.length === 0) return;

    const mapped = raw
      .map(mapApiSectionToModule)
      .sort((a, b) => a.order - b.order)
      .map((m, i) => ({ ...m, order: i }));

    const mappedClean = sanitizeCurriculumUrls(mapped);
    setCourse((prev) => ({ ...prev, modules: mappedClean }));
    hydratedOnce.current = true;
  }, [isEditMode, sectionsResp]);

  /** =========================
   * Module CRUD
   * ========================= */
  const addModule = () => {
    const newModule: BuilderModule = {
      id: uid(),
      title: "New Module",
      description: "",
      lessons: [],
      order: course.modules.length,
    };
    setCourse((prev) => ({ ...prev, modules: [...prev.modules, newModule] }));
    setSelectedModule(newModule.id);
  };

  const updateModule = (moduleId: string, updates: Partial<BuilderModule>) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    }));
  };

  const deleteModule = (moduleId: string) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId),
    }));
    if (selectedModule === moduleId) setSelectedModule(null);
  };

  /** =========================
   * Lesson CRUD
   * ========================= */
  const getLastContentAndTailIndex = (mod: BuilderModule) => {
    const arr = mod?.lessons ?? [];
    let last: BuilderLessonEx | null = null;
    let lastIndex = -1;
    for (let i = 0; i < arr.length; i++) {
      const l = arr[i] as BuilderLessonEx;
      if (isContent(l.type)) {
        last = l;
        lastIndex = i;
      }
    }
    if (!last) return null;
    let end = lastIndex;
    for (let j = lastIndex + 1; j < arr.length; j++) {
      const lj = arr[j] as BuilderLessonEx;
      if ((lj.type === "quiz" || lj.type === "exam") && lj.parentId === last.id)
        end = j;
      else break;
    }
    return { content: last, insertAfterIndex: end };
  };

  const addLesson = (moduleId: string, type: BuilderLesson["type"]) => {
    let createdLessonId: string | null = null;
    setCourse((prev) => {
      const modules = prev.modules.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const newId = uid();
        createdLessonId = newId;
        const newBase: BuilderLessonEx = {
          id: newId,
          title:
            type === "video"
              ? "New Video"
              : type === "article"
              ? "New Article"
              : type === "material"
              ? "New Material"
              : type === "quiz"
              ? "New Quiz"
              : "New Exam",
          type,
          order: mod.lessons?.length ?? 0,
          pendingCreate: true,
        };
        if (isAssessment(type)) {
          const lastInfo = getLastContentAndTailIndex(mod);
          if (!lastInfo) {
            createdLessonId = null;
            toast.error("Create a lesson (Video, Article, or Material) first.");
            return mod;
          }
          const attached = { ...newBase, parentId: lastInfo.content.id };
          const newLessons = [...(mod.lessons ?? [])];
          newLessons.splice(lastInfo.insertAfterIndex + 1, 0, attached);
          newLessons.forEach((l, i) => ((l as any).order = i));
          return { ...mod, lessons: newLessons };
        }
        const newLessons = [...(mod.lessons ?? []), newBase];
        newLessons.forEach((l, i) => ((l as any).order = i));
        return { ...mod, lessons: newLessons };
      });
      return { ...prev, modules };
    });

    if (!createdLessonId) return;
    if (isAssessment(type)) {
      setSelectedModule(moduleId);
      setSelectedLesson(createdLessonId);
      setCurrentQuiz({ type });
      setShowQuizBuilder(true);
    } else if (type === "video") {
      setEditingLesson({ moduleId, lessonId: createdLessonId });
    } else if (type === "article") {
      setEditingArticle({ moduleId, lessonId: createdLessonId });
    } else if (type === "material") {
      setUploadingMaterial({ moduleId, lessonId: createdLessonId });
    }
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    updates: Partial<BuilderLessonEx>
  ) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const arr = [...(mod.lessons ?? [])] as BuilderLessonEx[];
        const idx = arr.findIndex((l) => l.id === lessonId);
        if (idx === -1) return mod;
        const nextLesson = sanitizeLessonUrls({ ...arr[idx], ...updates });
        arr[idx] = nextLesson;
        return { ...mod, lessons: arr };
      }),
    }));
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const arr = [...(mod.lessons ?? [])] as BuilderLessonEx[];
        const idx = arr.findIndex((l) => l.id === lessonId);
        if (idx === -1) return mod;
        const toDelete = arr[idx];
        if (isContent(toDelete.type)) {
          let end = idx;
          for (let j = idx + 1; j < arr.length; j++) {
            const lj = arr[j];
            if (
              (lj.type === "quiz" || lj.type === "exam") &&
              (lj as any).parentId === toDelete.id
            )
              end = j;
            else break;
          }
          arr.splice(idx, end - idx + 1);
        } else {
          arr.splice(idx, 1);
        }
        arr.forEach((l, i) => ((l as any).order = i));
        return { ...mod, lessons: arr };
      }),
    }));
  };

  /** =========================
   * React DnD reorder callbacks (with assessment guard)
   * ========================= */
  const moveModule = (dragId: string, hoverId: string) => {
    if (dragId === hoverId) return;
    setCourse((prev) => {
      const mods = [...prev.modules];
      const from = mods.findIndex((m) => m.id === dragId);
      const to = mods.findIndex((m) => m.id === hoverId);
      if (from === -1 || to === -1) return prev;
      const [drag] = mods.splice(from, 1);
      mods.splice(to, 0, drag);
      mods.forEach((m, i) => (m.order = i));
      return { ...prev, modules: mods };
    });
  };

  const moveLesson = (moduleId: string, dragId: string, hoverId: string) => {
    if (dragId === hoverId) return;
    setCourse((prev) => {
      const mods = [...prev.modules];
      const mi = mods.findIndex((m) => m.id === moduleId);
      if (mi === -1) return prev;
      const mod = mods[mi];
      const lessons = [...(mod.lessons ?? [])] as (BuilderLessonEx & {
        parentId?: string;
      })[];
      const from = lessons.findIndex((l) => l.id === dragId);
      const to = lessons.findIndex((l) => l.id === hoverId);
      if (from === -1 || to === -1) return prev;

      const moving = lessons[from];
      const firstContentIndex = lessons.findIndex((l) => isContent(l.type));

      if (isAssessment(moving.type)) {
        if (firstContentIndex === -1) return prev;
        if (to <= firstContentIndex) {
          let clamp = firstContentIndex;
          for (let j = firstContentIndex + 1; j < lessons.length; j++) {
            if (
              isAssessment(lessons[j].type) &&
              lessons[j].parentId === lessons[firstContentIndex].id
            ) {
              clamp = j;
            } else break;
          }
          const [moved] = lessons.splice(from, 1);
          lessons.splice(clamp + 1, 0, moved);
        } else {
          const [moved] = lessons.splice(from, 1);
          lessons.splice(to, 0, moved);
        }
      } else {
        const [moved] = lessons.splice(from, 1);
        lessons.splice(to, 0, moved);
      }

      lessons.forEach((l, i) => ((l as any).order = i));

      let currentContentId: string | null = null;
      const reattached = lessons.map((l) => {
        if (isContent(l.type)) {
          currentContentId = l.id;
          return l;
        }
        if (isAssessment(l.type)) {
          return { ...l, parentId: currentContentId ?? l.parentId } as any;
        }
        return l;
      });

      if (reattached.length && !isContent(reattached[0].type)) {
        const idx = reattached.findIndex((l) => isContent(l.type));
        if (idx > 0) {
          const [firstContent] = reattached.splice(idx, 1);
          reattached.unshift(firstContent);
        }
        reattached.forEach((l, i) => ((l as any).order = i));
      }

      mods[mi] = { ...mod, lessons: reattached };
      return { ...prev, modules: mods };
    });
  };

  /** =========================
   * Quiz/Exam interactions
   * ========================= */
  const handleQuizSave = (quiz: any) => {
    if (selectedModule && selectedLesson) {
      updateLesson(selectedModule, selectedLesson, {
        quiz,
        pendingCreate: false,
      });
      setShowQuizBuilder(false);
      setCurrentQuiz(null);
      setSelectedLesson(null);
    }
  };
  const handleQuizPreview = (quiz: any) => {
    const hasQuestions =
      Array.isArray(quiz?.questions) && quiz.questions.length > 0;
    if (!hasQuestions) {
      toast.error("Add at least one question before previewing.");
      return;
    }
    setCurrentQuiz(quiz);
    setShowQuizPreview(true);
  };
  const closeQuizBuilder = () => {
    if (selectedModule && selectedLesson) {
      const mod = course.modules.find((m) => m.id === selectedModule);
      const les = mod?.lessons?.find((l) => l.id === selectedLesson) as
        | (BuilderLesson & { pendingCreate?: boolean; quiz?: any })
        | undefined;

      if (les?.pendingCreate && !les?.quiz) {
        deleteLesson(selectedModule, selectedLesson);
      }
    }

    setShowQuizBuilder(false);
    setCurrentQuiz(null);
    setSelectedLesson(null);
  };

  /** =========================
   * Create / Update flow (now with assessment upsert + id reconciliation)
   * ========================= */
  async function runCreateOrUpdateFlow(triggerPublish?: boolean) {
    try {
      const formValues = {
        title: watch("title"),
        description: watch("description"),
        price: Number(watch("price") || 0),
        level: watch("level"),
        sub_category: watch("sub_category"),
      };

      if (!formValues.title?.trim()) {
        toast.error("Course title is required");
        setActiveTab("course-info");
        return;
      }
      if (!formValues.description?.trim()) {
        toast.error("Course description is required");
        setActiveTab("course-info");
        return;
      }
      if (!formValues.sub_category) {
        toast.error("Please select a category");
        setActiveTab("course-info");
        return;
      }

      const willPublish =
        typeof triggerPublish === "boolean"
          ? triggerPublish
          : isPublishedSetting;

      // 1) Create / Update COURSE
      const fd = buildCreateCourseFormData({
        title: formValues.title,
        description: formValues.description,
        subCategoryId: formValues.sub_category,
        level: formValues.level,
        price: formValues.price,
        isPublished: willPublish,
        pictureFile: thumbnailFile ?? undefined,
      });

      let newCourseId = courseId;
      if (isEditMode) {
        await patchCourse(fd);
      } else {
        const courseRes: any = await createCourse(fd);
        const createdCourse: any = unwrap(courseRes);
        newCourseId = String(createdCourse?.id || "");
      }

      // 2) For each SECTION: PATCH if existing (server id), otherwise CREATE
      for (const mod of course.modules) {
        const all = (mod.lessons ?? []) as (BuilderLessonEx & {
          parentId?: string;
        })[];
        const contentOnly = all.filter((l) => isContent(l.type));
        if (contentOnly.length === 0) continue;

        const sectionPayload = {
          title: mod.title,
          course: newCourseId,
          description: mod.description || "",
          order: Number(mod.order ?? 0),
          lessons: contentOnly.map((l) => {
            let rawUrl: string | undefined;
            if (l?.videoUrl) rawUrl = l.videoUrl;
            else if (l?.youtubeUrl) rawUrl = l.youtubeUrl;
            else if (l?.fileUrl) rawUrl = l.fileUrl;

            const base: any = {
              title: l?.title ?? "",
              description: l?.description ?? "",
              url: String(rawUrl || "").trim(),
              duration_hours: parseDurationToHours(l?.duration ?? ""),
              free_preview: Boolean(l?.free_preview),
              order: Number(l?.order ?? 0),
              content_type: l?.type as "video" | "article" | "material",
            };

            if (l?.type === "article") {
              base.description_html =
                (l as any).content ?? (l as any).description ?? "";
            }
            if (l?.type === "material") {
              base.file = null;
            }
            return base;
          }),
        };

        let createdLessons: any[] = [];

        if (isEditMode && isServerId(mod.id)) {
          // UPDATE section (axios-based)
          const url = `${API_ENDPOINTS.updateSection}${mod.id}/`;
          const sectionResp = await apiPatch(url, sectionPayload);
          const updatedSection = unwrap(sectionResp);
          createdLessons = Array.isArray(updatedSection?.lessons)
            ? updatedSection.lessons
            : [];
        } else {
          // CREATE section
          const sectionRes = await createSection(sectionPayload);
          const createdSection = unwrap(sectionRes);
          createdLessons = Array.isArray(createdSection?.lessons)
            ? createdSection.lessons
            : [];
        }

        // --- Reconcile local content lesson ids with server ids (by order) ---
        const localIdByOrder = new Map<number, string>();
        contentOnly.forEach((c) =>
          localIdByOrder.set(Number((c as any).order ?? 0), c.id)
        );

        const serverIdByOrder = new Map<number, string>();
        for (const l of createdLessons) {
          if (isContent(l?.content_type)) {
            serverIdByOrder.set(Number(l.order ?? 0), String(l.id));
          }
        }

        const replacements = new Map<string, string>(); // localId -> serverId
        for (const [ord, localId] of localIdByOrder) {
          const sid = serverIdByOrder.get(ord);
          if (sid) replacements.set(localId, sid);
        }

        // Update builder state so UI & loaders use the new server lesson ids
        if (replacements.size) {
          setCourse((prev) => ({
            ...prev,
            modules: prev.modules.map((m) => {
              if (m.id !== mod.id) return m;
              const nextLessons = (m.lessons ?? []).map((l: any) => {
                if (isContent(l.type)) {
                  const newId = replacements.get(l.id);
                  if (newId && newId !== l.id) return { ...l, id: newId };
                }
                if ((l.type === "quiz" || l.type === "exam") && l.parentId) {
                  const newParent = replacements.get(l.parentId);
                  if (newParent) return { ...l, parentId: newParent };
                }
                return l;
              });
              return { ...m, lessons: nextLessons };
            }),
          }));
        }

        // Build map order->serverLessonId for attaching exams
        const idByOrder = new Map<number, string>(serverIdByOrder);

        // 3) Upsert attached assessments per content lesson
        for (const content of contentOnly) {
          const serverLessonId =
            idByOrder.get(Number((content as any).order ?? 0)) || "";
          if (!serverLessonId) continue;

          const attached = all.filter(
            (l) =>
              isAssessment(l.type) &&
              (l as any).parentId === (content as any).id
          );

          for (const a of attached) {
            const payload = buildExamPayloadFromLesson(
              a as any,
              serverLessonId
            );

            const existingExamId =
              (a as any)?.id || // when stored directly
              (a as any)?.quiz?.id; // when hydrated from API

            try {
              if (isEditMode && isServerId(String(existingExamId || ""))) {
                // UPDATE existing quiz/exam
                const url = `${API_ENDPOINTS.updateExam}${existingExamId}/`;
                await apiPatch(url, payload);
              } else {
                // CREATE new quiz/exam
                const res = await createAssessment(payload);
                const created = unwrap(res);
                if (created?.id) {
                  // reflect new server id in builder so it persists in UI
                  setCourse((prev) => ({
                    ...prev,
                    modules: prev.modules.map((m) => {
                      if (m.id !== mod.id) return m;
                      const nextLessons = (m.lessons ?? []).map((l: any) => {
                        if (l.id === (a as any).id) {
                          return { ...l, id: String(created.id) };
                        }
                        return l;
                      });
                      return { ...m, lessons: nextLessons };
                    }),
                  }));
                }
              }
            } catch (e) {
              console.warn("Assessment upsert failed", e);
            }
          }
        }
      }

      toast.success(
        willPublish
          ? isEditMode
            ? "Course updated & published!"
            : "Course published successfully!"
          : isEditMode
          ? "Draft updated successfully!"
          : "Draft saved successfully!"
      );

      if (!isEditMode) resetBuilder();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.detail ??
        err?.message ??
        "Operation failed";
      console.error(err);
      toast.error(String(msg));
    }
  }

  /** =========================
   * Misc helpers
   * ========================= */
  const getLessonIcon = (type: BuilderLesson["type"]) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "article":
        return <FileText className="w-4 h-4" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4" />;
      case "exam":
        return <Award className="w-4 h-4" />;
      case "material":
        return <Upload className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };
  const getYouTubeThumbnail = (videoId: string): string =>
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const onAssessmentsLoaded = useCallback(
    (lessonId: string, items: ExamApi[]) => {
      if (!items?.length) return;
      if (hydratedLessonsRef.current.has(lessonId)) return;

      setCourse((prev) => ({
        ...prev,
        modules: attachAssessmentsToLesson(prev.modules, lessonId, items),
      }));
      hydratedLessonsRef.current.add(lessonId);
    },
    []
  );

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => runCreateOrUpdateFlow(false)}
              className="inline-flex items-center px-4 py-2 bg-gray-600 border border-gray-300 rounded-lg text-white hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isBusy}
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Draft
                </>
              )}
            </button>
            <button
              onClick={() => runCreateOrUpdateFlow(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isBusy}
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing…
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" /> Publish
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-1">
              {[
                { id: "course-info", label: "Course Information" },
                { id: "curriculum", label: "Curriculum" },
                {
                  id: "users",
                  label: "Users",
                  icon: <Users className="w-4 h-4 mr-2" />,
                },
                {
                  id: "groups",
                  label: "Groups",
                  icon: <UserCheck className="w-4 h-4 mr-2" />,
                },
                { id: "settings", label: "Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 ${
                    activeTab === tab.id
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-700"
                  }`}
                >
                  <span className="flex items-center">
                    {tab.icon ?? null}
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {activeTab === "course-info" && (
              <CourseInformationForm
                register={register}
                setValue={setValue}
                watch={watch}
                subCategories={subCategories}
                setThumbnailFile={setThumbnailFile}
                thumbnailFile={thumbnailFile}
                syncCourseField={(k, v) =>
                  setCourse((p) => ({ ...p, [k]: v } as any))
                }
              />
            )}

            {activeTab === "curriculum" && (
              <DndProvider backend={HTML5Backend}>
                <CreateSectionsForm
                  addLesson={addLesson}
                  addModule={addModule}
                  course={course as any}
                  deleteLesson={deleteLesson}
                  editQuiz={(moduleId, lessonId) => {
                    setSelectedModule(moduleId);
                    setSelectedLesson(lessonId);
                    setShowQuizBuilder(true);
                    const module = course.modules.find(
                      (m) => m.id === moduleId
                    );
                    const les = module?.lessons.find(
                      (l) => l.id === lessonId
                    ) as any;
                    setCurrentQuiz(les?.quiz ?? { type: les?.type ?? "quiz" });
                  }}
                  getLessonIcon={getLessonIcon}
                  updateModule={updateModule}
                  deleteModule={deleteModule}
                  updateLesson={updateLesson}
                  setEditingLesson={setEditingLesson}
                  setEditingArticle={setEditingArticle}
                  setUploadingMaterial={setUploadingMaterial}
                  moveModule={moveModule}
                  moveLesson={moveLesson}
                />
              </DndProvider>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <UserManagement />
              </div>
            )}
            {activeTab === "groups" && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <GroupManagement />
              </div>
            )}
            {activeTab === "settings" && (
              <SettingsForm
                isPublished={isPublishedSetting}
                onChange={(v) => setIsPublishedSetting(v)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Quiz Modals */}
      {showQuizBuilder && currentQuiz && selectedModule && selectedLesson && (
        <Modal onClose={closeQuizBuilder}>
          <QuizBuilder
            initialQuiz={currentQuiz}
            onClose={closeQuizBuilder}
            onSave={handleQuizSave}
            onPreview={handleQuizPreview}
          />
        </Modal>
      )}
      {showQuizPreview && currentQuiz && (
        <Modal onClose={() => setShowQuizPreview(false)}>
          <QuizPreview
            quiz={currentQuiz}
            onClose={() => setShowQuizPreview(false)}
            onEdit={() => {}}
          />
        </Modal>
      )}

      {/* Edit Video */}
      {editingLesson && (
        <EditLesson
          course={course as any}
          editingLesson={editingLesson}
          extractYouTubeVideoId={extractYouTubeVideoId}
          getYouTubeThumbnail={getYouTubeThumbnail}
          setEditingLesson={setEditingLesson}
          updateLesson={(mId, lId, up) => {
            updateLesson(mId, lId, up);
          }}
          onCancel={() => {
            const mod = course.modules.find(
              (m) => m.id === editingLesson.moduleId
            );
            const les = mod?.lessons.find(
              (l) => l.id === editingLesson.lessonId
            ) as BuilderLessonEx | undefined;
            if (les?.pendingCreate)
              deleteLesson(editingLesson.moduleId, editingLesson.lessonId);
            setEditingLesson(null);
          }}
          onSave={() => {
            updateLesson(editingLesson.moduleId, editingLesson.lessonId, {
              pendingCreate: false,
            });
            setEditingLesson(null);
          }}
        />
      )}

      {/* Edit Article */}
      {editingArticle && (
        <EditArticle
          course={course as any}
          setEditingArticle={setEditingArticle}
          editingArticle={editingArticle}
          updateLesson={(mId, lId, up) => {
            updateLesson(mId, lId, up);
          }}
          onCancel={() => {
            const mod = course.modules.find(
              (m) => m.id === editingArticle.moduleId
            );
            const les = mod?.lessons.find(
              (l) => l.id === editingArticle.lessonId
            ) as BuilderLessonEx | undefined;
            if (les?.pendingCreate)
              deleteLesson(editingArticle.moduleId, editingArticle.lessonId);
            setEditingArticle(null);
          }}
          onSave={() => {
            updateLesson(editingArticle.moduleId, editingArticle.lessonId, {
              pendingCreate: false,
            });
            setEditingArticle(null);
          }}
        />
      )}

      {/* Material Upload */}
      {uploadingMaterial && (
        <UploadingMaterial
          course={course as any}
          setUploadingMaterial={setUploadingMaterial}
          updateLesson={(mId, lId, up) => {
            updateLesson(mId, lId, up);
          }}
          uploadingMaterial={uploadingMaterial}
          onCancel={() => {
            const mod = course.modules.find(
              (m) => m.id === uploadingMaterial.moduleId
            );
            const les = mod?.lessons.find(
              (l) => l.id === uploadingMaterial.lessonId
            ) as BuilderLessonEx | undefined;
            if (les?.pendingCreate)
              deleteLesson(
                uploadingMaterial.moduleId,
                uploadingMaterial.lessonId
              );
            setUploadingMaterial(null);
          }}
          onSave={() => {
            updateLesson(
              uploadingMaterial.moduleId,
              uploadingMaterial.lessonId,
              { pendingCreate: false }
            );
            setUploadingMaterial(null);
          }}
        />
      )}
      {isEditMode &&
        course.modules
          .flatMap((m) => m.lessons ?? [])
          .filter(
            (l) =>
              l.type === "video" ||
              l.type === "article" ||
              l.type === "material"
          )
          .map((l) => (
            <AssessmentsLoader
              key={`assess-${l.id}`}
              lessonId={l.id}
              onLoaded={onAssessmentsLoaded}
            />
          ))}
    </div>
  );
};

export default CourseBuilderPage;
