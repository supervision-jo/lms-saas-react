import React, { useEffect, useState } from "react";
import { ArrowLeft, Eye, Users, UserCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";
import CourseInformationForm from "../../components/course/course-builder/CourseInformationForm";
import CreateSectionsForm from "../../components/course/course-builder/CreateSectionsForm";
import SettingsForm from "../../components/course/course-builder/SettingsForm";
import GroupManagement from "../../components/course/course-builder/GroupManagement";
import UserManagement from "../../components/course/course-builder/UserManagement";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { get, patch } from "../../api";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import IssuesModal from "./IssuesModal";

const TABS = [
  { id: "course-info", label: "Course Information" },
  { id: "curriculum", label: "Curriculum" },
  { id: "users", label: "Users", icon: <Users className="w-4 h-4 mr-2" /> },
  {
    id: "groups",
    label: "Groups",
    icon: <UserCheck className="w-4 h-4 mr-2" />,
  },
  { id: "settings", label: "Settings" },
];

// Simple modal for the validation issues

const CourseBuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("course-info");
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: courseData } = useCustomQuery(
    `${API_ENDPOINTS.oldCourses}${courseId}`,
    ["course", courseId],
    undefined,
    !!courseId
  );

  const course: Course = courseData?.data;

  // === publish state (defaults to draft until server says otherwise) ===
  const [published, setPublished] = useState<boolean>(!!course?.is_published);
  useEffect(() => {
    setPublished(!!course?.is_published);
  }, [course?.is_published]);

  // === validation modal state ===
  const [issues, setIssues] = useState<string[]>([]);
  const [showIssues, setShowIssues] = useState(false);

  // ---- helpers to fetch modules & exams quickly for validation ----
  async function fetchModulesForCourse(cid: string): Promise<Module[]> {
    const resp = await get(`${API_ENDPOINTS.modules}?course=${cid}`);
    return resp?.data?.data ?? resp?.data ?? resp ?? [];
  }

  async function fetchExamsForLesson(lessonId: string): Promise<any[]> {
    // backend supports ?lesson=
    const resp = await get(`${API_ENDPOINTS.exams}?lesson=${lessonId}`);
    const arr =
      (Array.isArray(resp) && resp) || resp?.data || resp?.results || [];
    return Array.isArray(arr) ? arr : [];
  }

  // ---- validation logic ----
  async function validateCourseReady(cid: string): Promise<string[]> {
    const problems: string[] = [];

    // 1) Course fields
    const c = course; // already fetched via react-query
    const titleOK = !!c?.title?.trim();
    const descOK = !!c?.description?.trim();
    const levelOK = !!c?.level?.trim();
    // is_paid: infer from price if the server doesn’t send it
    const isPaid =
      typeof c?.is_paid === "boolean" ? c.is_paid : (c?.price ?? 0) > 0;
    const subcatOK =
      !!(c as any)?.sub_category || !!(c as any)?.sub_category_id;

    if (!titleOK) problems.push("Course title is required.");
    if (!descOK) problems.push("Course description is required.");
    if (!levelOK) problems.push("Course level is required.");
    if (!subcatOK) problems.push("Course sub-category is required.");
    if (typeof isPaid !== "boolean") {
      problems.push("Course payment status (is_paid) is required.");
    }

    // 2) Sections (modules)
    const modules = await fetchModulesForCourse(cid);
    if (!Array.isArray(modules) || modules.length === 0) {
      problems.push("At least one section (module) is required.");
    } else {
      modules.forEach((m, idx) => {
        if (!m?.title?.trim())
          problems.push(`Section #${idx + 1} is missing a title.`);
        if (
          (m as any)?.description != null &&
          !String((m as any).description).trim()
        ) {
          // treat empty string as missing; if you don't require description, remove this check
          problems.push(`Section #${idx + 1} is missing a description.`);
        }
        const lessons = (m?.lessons ?? []) as any[];
        if (!lessons.length)
          problems.push(
            `Section #${idx + 1} must contain at least one lesson.`
          );
      });
    }

    // 3) Exams/quizzes (only validate ones that exist)
    // collect all content lessons’ ids
    const lessonIds: string[] = [];
    modules.forEach((m: any) =>
      (m.lessons || []).forEach((l: any) => {
        const t = l?.content_type;
        if (t === "video" || t === "article" || t === "material") {
          lessonIds.push(l.id);
        }
      })
    );

    // Fetch exams for each lesson concurrently
    const settled = await Promise.allSettled(
      Array.from(new Set(lessonIds)).map((id) => fetchExamsForLesson(id))
    );

    // Flatten and validate any returned assessments
    const exams: any[] = [];
    settled.forEach((res) => {
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        exams.push(...res.value);
      }
    });

    exams.forEach((ex, idx) => {
      const label =
        ex?.type === "exam"
          ? "Exam"
          : ex?.type === "quiz"
          ? "Quiz"
          : "Assessment";
      const prefix = `${label} "${ex?.title || `#${idx + 1}`}"`;
      const titleOK = !!ex?.title?.trim();
      const descOK = !!ex?.description?.trim();
      const tlimOK = Number.isFinite(
        Number(ex?.time_limit_mins ?? ex?.time_limit)
      );
      const passOK =
        Number.isFinite(Number(ex?.passing_score)) &&
        Number(ex?.passing_score) >= 0 &&
        Number(ex?.passing_score) <= 100;
      const questions = Array.isArray(ex?.questions) ? ex.questions : [];

      if (!titleOK) problems.push(`${prefix}: title is required.`);
      if (!descOK) problems.push(`${prefix}: description is required.`);
      if (!tlimOK) problems.push(`${prefix}: time limit is required.`);
      if (!passOK)
        problems.push(`${prefix}: passing score (0–100) is required.`);
      if (!questions.length) {
        problems.push(`${prefix}: must include at least one question.`);
      } else {
        questions.forEach((q: any, qidx: number) => {
          if (!q?.text?.trim()) {
            problems.push(`${prefix}: Question #${qidx + 1} is missing text.`);
          }
          const choices = Array.isArray(q?.choices) ? q.choices : [];
          if (!choices.length) {
            problems.push(
              `${prefix}: Question #${qidx + 1} must have choices.`
            );
          } else {
            let hasCorrect = false;
            choices.forEach((ch: any, cidx: number) => {
              if (!ch?.text?.trim()) {
                problems.push(
                  `${prefix}: Question #${qidx + 1} → Choice #${
                    cidx + 1
                  } is missing text.`
                );
              }
              if (ch?.is_correct) hasCorrect = true;
            });
            if (!hasCorrect) {
              problems.push(
                `${prefix}: Question #${qidx + 1} has no correct choice.`
              );
            }
          }
        });
      }
    });

    return problems;
  }

  // ---- guarded publish handlers ----
  const tryPublish = async () => {
    if (!courseId) return;
    const problems = await validateCourseReady(courseId);
    if (problems.length) {
      setIssues(problems);
      setShowIssues(true);
      return;
    }
    // All good → go to catalog (or patch is_published here if you want)
    try {
      // Mark published on server
      const fd = new FormData();
      fd.append("is_published", "true");
      await patch(`${API_ENDPOINTS.updateCourse}${courseId}/`, fd);
      await queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setPublished(true);
      toast.success("Course Published!");
      navigate(`/catalog/${course?.id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to publish");
    }
  };

  const handleSettingsChange = async (next: boolean) => {
    if (!courseId) return;
    // Going to draft is always allowed immediately
    if (!next) {
      try {
        const fd = new FormData();
        fd.append("is_published", "false");
        await patch(`${API_ENDPOINTS.updateCourse}${courseId}/`, fd);
        await queryClient.invalidateQueries({ queryKey: ["course", courseId] });
        setPublished(false);
        toast.success("Moved to draft");
      } catch (e: any) {
        toast.error(e?.response?.data?.error || "Failed to update status");
      }
      return;
    }

    // next === true → validate first
    const problems = await validateCourseReady(courseId);
    if (problems.length) {
      setIssues(problems);
      setShowIssues(true);
      // keep UI toggle on draft
      setPublished(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("is_published", "true");
      await patch(`${API_ENDPOINTS.updateCourse}${courseId}/`, fd);
      await queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setPublished(true);
      toast.success("Course published");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to publish");
      setPublished(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <IssuesModal
        open={showIssues}
        onClose={() => setShowIssues(false)}
        issues={issues}
      />

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
              onClick={tryPublish}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Eye className="w-4 h-4 mr-2" /> Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-1">
              {TABS.map((tab) => (
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

          {/* Main contentss */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {activeTab === "course-info" && (
              <CourseInformationForm course={course} />
            )}

            {activeTab === "curriculum" && (
              <DndProvider backend={HTML5Backend}>
                <CreateSectionsForm courseId={course?.id} />
              </DndProvider>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <UserManagement courseId={course?.id} />
              </div>
            )}

            {activeTab === "groups" && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <GroupManagement />
              </div>
            )}

            {activeTab === "settings" && (
              <SettingsForm
                isPublished={published}
                onChange={handleSettingsChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilderPage;
