import useAuth from "../store/useAuth";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

// react date picker
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import CourseCatalogPage from "../pages/courses/CourseCatalogPage";
import CourseDetailPage from "../pages/courses/CourseDetailPage";
import CoursePlayerPage from "../pages/courses/CoursePlayerPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import InstructorPage from "../pages/instructor/InstructorPage";
import CourseBuilderPage from "../pages/courses/CourseBuilderPage";
import ProfilePage from "../pages/userProfile/ProfilePage";
import Layout from "../layout/dashboard/Layout";
import HomePage from "../pages/home/HomePage";
import { RequireAuth } from "./requireAuth";
import { RequireRole } from "./guards";
// import { readUserFromStorage, roleOf } from "@/services/auth";

// function DashboardIndexGate() {
//   const user = readUserFromStorage();
//   const role = roleOf(user) ?? "";
//   return role === "library" ? (
//     <Navigate to="card-pricing" replace />
//   ) : (
//     <Dashboard />
//   );
// }

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="" element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Auth */}

          {/* Main */}
          <Route path="/catalog" element={<CourseCatalogPage />} />
          <Route path="/catalog/:courseId" element={<CourseDetailPage />} />
          <Route
            path="/catalog/:courseId/player"
            element={
              <RequireAuth>
                <CoursePlayerPage />
              </RequireAuth>
            }
          />
          <Route path="/course-builder" element={<CourseBuilderPage />} />
          {/* Main */}

          {/* Courses */}

          <Route element={<RequireRole exclude={["instructor"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<RequireRole exclude={["student"]} />}>
            <Route path="/instructor" element={<InstructorPage />} />
          </Route>
          {/* Courses */}

          {/* User */}
          <Route path="/profile" element={<ProfilePage />} />
          {/* User */}
        </Route>

        {/* {isAuthenticated && (
          Write routes here which need Authentication
        )} */}

        {/* {!isAuthenticated && <Route path="login" element={<LoginPage />} />} */}

        {/* {isAuthenticated && (
          <Route path="login" element={<Navigate to="/dashboard" replace />} />
        )} */}

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
