import React, { useEffect, useMemo, useState } from "react";
import {
  Star,
  Clock,
  Users,
  Award,
  CheckCircle,
  Globe,
  Smartphone,
  Trophy,
  Play,
} from "lucide-react";
import CourseContent from "../../components/course/CourseContent";
import { useCustomQuery } from "../../hooks/useQuery";
import { useNavigate, useParams } from "react-router";
import { API_ENDPOINTS } from "../../utils/constants";
import { formatDateTimeSimple } from "../../utils/formatDateTime";
import { useCustomPost } from "../../hooks/useMutation";
import toast from "react-hot-toast";
import handleErrorAlerts from "../../utils/showErrorMessages";
import { formatDuration } from "../../utils/formatDuration";
import { readUserFromStorage } from "../../services/auth";
import LoginPopup from "../../components/auth-modals/LoginPopup";
import SignupPopup from "../../components/auth-modals/SignupPopup";
import useAuth from "../../store/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import CourseRatingModal from "../../components/course/course-details/CourseRatingModal";
import CourseReviews from "../../components/course/course-details/CourseReviews";

const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(
    readUserFromStorage()?.id ?? null
  );
  const currentUser: User = readUserFromStorage();

  useEffect(() => {
    if (isAuthenticated) {
      const id = readUserFromStorage()?.id ?? null;
      setUserId(id);
      queryClient.invalidateQueries({ queryKey: ["enrolledCourses"] });
    }
  }, [isAuthenticated, queryClient]);

  const courseData = useCustomQuery(
    `${API_ENDPOINTS.oldCourses}${courseId}/`,
    ["course", courseId],
    undefined,
    !!courseId
  );
  const course: Course = courseData?.data?.data;

  const { data: modulesResp } = useCustomQuery(
    `${API_ENDPOINTS.modules}?course=${courseId}`,
    ["modules", courseId],
    undefined,
    !!courseId
  );
  const modulesData: Module[] = useMemo(
    () => modulesResp?.data?.data ?? [],
    [modulesResp]
  );

  // const { data: subCatesData } = useCustomQuery(
  //   `${API_ENDPOINTS.subCategories}`,
  //   ["sub-categories-details"]
  // );

  const { data: catesData } = useCustomQuery(`${API_ENDPOINTS.categories}`, [
    "categories",
  ]);
  const cates: Category[] = catesData?.data?.data ?? [];
  // const subCategories: SubCategory[] = subCatesData?.data || [];

  const { data: subCategoriesData } = useCustomQuery(
    `${API_ENDPOINTS.subCategories}`,
    ["sub-categories"]
  );
  const subCategories: SubCategory[] = useMemo(
    () => subCategoriesData?.data || [],
    [subCategoriesData]
  );

  const currentSubCate = subCategories?.find(
    (s) => s.id === course?.sub_category
  );

  const currentCategory = cates?.find((c) => c.id === currentSubCate?.category);

  const { data: instructorData } = useCustomQuery(
    `${API_ENDPOINTS.instructor}${course?.instructor?.id}/course/${course?.id}/`,
    ["instructor", course?.id],
    undefined,
    !!course?.id && !!course?.instructor?.id
  );
  const instructor: CourseInstructor = instructorData?.data?.[0];

  const enrolledCoursesData = useCustomQuery(
    API_ENDPOINTS.enrolledCourses,
    ["enrolledCourses", isAuthenticated, userId],
    undefined,
    !!isAuthenticated
  );
  const enrolledCourses: EnrolledCourse[] =
    enrolledCoursesData?.data?.data ?? [];

  const computedEnrolled = enrolledCourses.some(
    (c) => String(c?.course?.id) === String(course?.id ?? courseId)
  );
  const [enrolledOptimistic, setEnrolledOptimistic] = useState(false);

  const isInstructorCourse =
    currentUser?.is_instructor && course?.instructor?.id === currentUser?.id;

  const isEnrolled = isInstructorCourse
    ? true
    : enrolledOptimistic || computedEnrolled;

  useEffect(() => {
    if (computedEnrolled && enrolledOptimistic) setEnrolledOptimistic(false);
  }, [computedEnrolled, enrolledOptimistic]);

  const createEnroll = useCustomPost(API_ENDPOINTS.createEnrollment, [
    "enrolledCourses",
    "course",
    courseId as string,
  ]);

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first!");
      setShowLoginModal(true);
      return;
    }
    if (isEnrolled || createEnroll.isPending) return;

    try {
      if (currentUser?.is_instructor) {
        toast.error("Please sign in as student!");
        return;
      }
      setEnrolledOptimistic(true);
      const res = await createEnroll.mutateAsync({ course: course?.id });
      if (res?.status) {
        toast.success("You have been enrolled successfully!");
        queryClient.invalidateQueries({ queryKey: ["enrolledCourses"] });
      } else {
        setEnrolledOptimistic(false);
        toast.error(res?.error?.non_field_errors?.[0] ?? "Failed to enroll");
      }
    } catch (error: any) {
      setEnrolledOptimistic(false);
      handleErrorAlerts(error?.response?.data?.message ?? "Unexpected error");
    }
  };

  /** Find first lesson user can actually open (free preview if not enrolled). */
  const firstPlayableLessonId = useMemo(() => {
    for (const m of modulesData ?? []) {
      const lessons = m?.lessons ?? [];
      const playable =
        lessons.find((l) => isEnrolled || l?.free_preview) || lessons[0];
      if (playable?.id) return String(playable.id);
    }
    return null;
  }, [modulesData, isEnrolled]);

  /** Navigate to player, passing lesson and optional assessment via query. */
  const goToPlayer = (opts?: {
    lessonId?: string | number;
    assessment?: Exam;
  }) => {
    const params = new URLSearchParams();
    if (opts?.lessonId) params.set("lesson", String(opts.lessonId));
    if (opts?.assessment) {
      params.set("assessment", String(opts.assessment.id));
      if (opts.assessment.type)
        params.set("atype", String(opts.assessment.type));
    }
    const qs = params.toString();
    navigate(`/catalog/${course?.id}/player${qs ? `?${qs}` : ""}`);
  };

  /** CourseContent lesson click -> open player at that lesson */
  const handleLessonSelect = (lessonId: string) => {
    goToPlayer({ lessonId });
  };

  /** CourseContent assessment click -> open player with assessment context */
  const handleOpenAssessment = (lessonId: string, a: Exam) => {
    goToPlayer({ lessonId, assessment: a });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <nav className="text-sm mb-4">
                <span className="text-purple-400">
                  {currentCategory?.name ?? ""}
                </span>
                <span className="mx-2">›</span>
                <span className="text-purple-400">
                  {currentSubCate?.name ?? ""}
                </span>
                <span className="mx-2">›</span>
                <span>{course?.title}</span>
              </nav>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {course?.title}
              </h1>
              <p className="text-xl text-gray-300 mb-6">{course?.subtitle}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                {course?.is_best_seller && (
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold rounded">
                    Bestseller
                  </span>
                )}
                <div className="flex items-center">
                  <span className="text-yellow-400 font-bold mr-2">
                    {course?.average_rating ?? 0}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i + 1000}
                        className={`w-4 h-4 ${
                          i < parseInt(course?.average_rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-300 ml-2">
                    ({course?.total_reviews?.toLocaleString() ?? 0} ratings)
                  </span>
                </div>
                <span className="text-gray-300">
                  {course?.total_students?.toLocaleString() ?? 0} students
                </span>
              </div>

              <div className="flex items-center text-gray-300 mb-6">
                <span>
                  Created by {course?.instructor?.first_name}{" "}
                  {course?.instructor?.last_name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>
                    Last updated {formatDateTimeSimple(course?.updated_at)}
                  </span>
                </div>
                {course?.language && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>{course?.language}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right card with hero thumbnail and "Play" */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
                <div className="relative">
                  <img
                    src={
                      course?.picture ??
                      "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
                    }
                    alt={course?.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <button
                      onClick={() => {
                        // Start at first playable lesson to mirror player UX isEnrolled
                        if (isEnrolled) {
                          if (firstPlayableLessonId) {
                            goToPlayer({ lessonId: firstPlayableLessonId });
                          } else {
                            goToPlayer(); // fallback
                          }
                        } else {
                          toast.error("Please enroll first.");
                        }
                      }}
                      className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center"
                      title="Start / Preview"
                      aria-label="Start / Preview"
                    >
                      <Play className="w-6 h-6 text-white ml-1" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {course?.is_paid ? (
                      <div className="flex items-center">
                        <span className="text-3xl font-bold text-gray-900">
                          ${course?.price ?? 0}
                        </span>
                        {course?.old_price && (
                          <span className="text-gray-500 line-through ml-3">
                            ${course?.old_price ?? 0}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-4 py-1 rounded-lg font-semibold bg-green-100 text-green-800">
                        Free
                      </span>
                    )}
                  </div>

                  {!isEnrolled ? (
                    <button
                      onClick={handleEnroll}
                      disabled={
                        enrolledCoursesData?.isFetching ||
                        createEnroll?.isPending
                      }
                      className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-4"
                    >
                      {createEnroll?.isPending ? "Enrolling..." : "Enroll Now"}
                    </button>
                  ) : (
                    <div className="text-center mb-4">
                      {!isInstructorCourse && (
                        <div className="flex items-center justify-center text-green-600 mb-2">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="font-medium">Enrolled</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (firstPlayableLessonId) {
                            goToPlayer({ lessonId: firstPlayableLessonId });
                          } else {
                            goToPlayer();
                          }
                        }}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold mb-2 hover:bg-purple-700 transition-colors"
                      >
                        {isInstructorCourse
                          ? "View your course"
                          : "Start Learning"}
                      </button>
                      {!isInstructorCourse && (
                        <button
                          onClick={() => setShowRatingModal(true)}
                          className="w-full bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors text-sm"
                        >
                          Rate This Course
                        </button>
                      )}
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-600 mb-6">
                    30-Day Money-Back Guarantee
                  </div>

                  <div className="space-y-3 text-sm">
                    <h4 className="font-semibold text-gray-900">
                      This course includes:
                    </h4>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-3" />
                      <span>
                        {formatDuration(course?.total_hours)} on-demand video
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Smartphone className="w-4 h-4 mr-3" />
                      <span>Access on mobile and TV</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Trophy className="w-4 h-4 mr-3" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Right card */}
          </div>
        </div>
      </div>

      {/* Course Content + Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px grid grid-cols-2 sm:grid-cols-4 items-center gap-4">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "curriculum", label: "Curriculum" },
                    { id: "instructor", label: "Instructor" },
                    { id: "reviews", label: "Reviews" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md sm:p-6 p-2">
              {activeTab === "overview" && (
                <div>
                  {course?.objectives && course?.objectives?.length > 0 && (
                    <>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        What you'll learn
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {course?.objectives.map((item) => (
                          <div key={item?.id} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item?.text}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {course?.requirements && course?.requirements?.length > 0 && (
                    <>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        Requirements
                      </h3>
                      <ul className="space-y-2 mb-8">
                        {course?.requirements.map((req) => (
                          <li key={req?.id} className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2.5 flex-shrink-0"></span>
                            <span className="text-gray-700">{req?.text}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Description
                  </h3>
                  <div className="prose max-w-none text-gray-700">
                    {course?.description
                      ?.split("\n\n")
                      .map((paragraph, index) => (
                        <p key={index + 2000} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Course Content
                  </h3>
                  <CourseContent
                    modules={modulesData}
                    onLessonSelect={handleLessonSelect}
                    isEnrolled={isEnrolled}
                    onOpenAssessment={handleOpenAssessment}
                  />
                </div>
              )}

              {activeTab === "instructor" && (
                <div className="w-full flex-col items-start flex">
                  <h3 className="sm:text-2xl text-lg font-bold text-gray-900 mb-6">
                    Instructor
                  </h3>
                  <div className="sm:flex-row flex-col w-full flex items-start mb-6">
                    {instructor?.instructor?.profile_image ? (
                      <img
                        src={instructor?.instructor?.profile_image}
                        alt={instructor?.instructor?.first_name}
                        className="w-16 self-center sm:self-start h-16 rounded-full mr-4"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-purple-600 mr-4 self-center sm:self-start rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {course?.instructor?.first_name
                            ?.charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start w-full flex-col">
                      <h4 className="text-xl font-bold text-gray-900 sm:self-start self-center">
                        {instructor?.instructor?.first_name}{" "}
                        {instructor?.instructor?.last_name}
                      </h4>
                      <p className="text-gray-600 mb-2 whitespace-normal">
                        {instructor?.instructor?.bio}
                      </p>
                      <div className="flex sm:flex-row w-full flex-col sm:items-center items-start gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) =>
                            i < +instructor?.average_rating?.toFixed(0) ? (
                              <Star
                                key={i + 3000}
                                className="w-4 h-4 mr-1 text-yellow-400 fill-current"
                              />
                            ) : (
                              <Star
                                key={i + 4000}
                                className="text-gray-300 w-4 h-4 mr-1"
                              />
                            )
                          )}
                          ({instructor?.total_reviews ?? 0})
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>
                            {instructor?.total_students?.toLocaleString()}{" "}
                            Students
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          <span>{instructor?.total_courses} Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Student Reviews
                  </h3>
                  <CourseReviews courseId={course?.id} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Course Content mirrors curriculum behavior */}
          <div className="hidden lg:block lg:col-span-1">
            <CourseContent
              modules={modulesData}
              onLessonSelect={handleLessonSelect}
              isEnrolled={isEnrolled}
              onOpenAssessment={handleOpenAssessment}
            />
          </div>
        </div>
      </div>

      {showRatingModal && (
        <CourseRatingModal
          courseTitle={course?.title}
          onClose={() => setShowRatingModal(false)}
        />
      )}
      {showLoginModal && (
        <LoginPopup
          onClose={() => {
            setShowLoginModal(false);
          }}
          setShowSignupModal={setShowSignupModal}
        />
      )}
      {showSignupModal && (
        <SignupPopup
          onClose={() => {
            setShowSignupModal(false);
          }}
          setShowLoginModal={setShowLoginModal}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;
