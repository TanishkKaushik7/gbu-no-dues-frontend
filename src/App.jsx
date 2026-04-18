import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { datadogRum } from "@datadog/browser-rum";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  StudentAuthProvider,
  useStudentAuth,
} from "./contexts/StudentAuthContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import SessionTimeoutModal from "./components/modals/SessionTimeoutModal";
import "./App.css";

/* -------------------------------------------------------------------------- */
/* EAGER IMPORTS (Core & Public Pages)                                        */
/* -------------------------------------------------------------------------- */
import LoginScreen from "./pages/login/loginscreen";
import MainPage from "./pages/MainPage";

/* -------------------------------------------------------------------------- */
/* LAZY IMPORTS (Code Splitting)                                              */
/* -------------------------------------------------------------------------- */

// Public & Utilities
const Developers = lazy(() => import("./pages/Developers"));
const CertificateVerify = lazy(
  () => import("./pages/Verification/CertificateVerify"),
);

// Student Flow
const StudentEntry = lazy(() => import("./pages/Student/StudentEntry"));
const StudentLogin = lazy(() => import("./pages/Student/Login"));
const StudentRegister = lazy(() => import("./pages/Student/Register"));
const StudentDashboard = lazy(() => import("./pages/Student/StudentDashboard"));

// Authority Dashboards (Hardcoded customized folders)
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const SportsDashboard = lazy(() => import("./pages/Sports/SportsDashboard"));
const CRCDashboard = lazy(() => import("./pages/CRC/CRCDashboard"));
const AccountsDashboard = lazy(
  () => import("./pages/Accounts/AccountsDashboard"),
);
const LibraryDashboard = lazy(() => import("./pages/Library/LibraryDashboard"));
const HostelsDashboard = lazy(() => import("./pages/Hostels/HostelsDashboard"));
const LabDashboard = lazy(() => import("./pages/Laboratories/LabDashboard"));
const SchoolDashboard = lazy(() => import("./pages/Schools/SchoolDashboard"));
const HODDashboard = lazy(() => import("./pages/HOD/HODDashboard"));
const OfficeDashboard = lazy(() => import("./pages/Office/OfficeDashboard"));

// ⭐ DYNAMIC FALLBACK (For new departments created via Admin)
const DynamicDashboard = lazy(
  () => import("./pages/DynamicDepartment/DynamicDashboard"),
);
const DynamicHistory = lazy(
  () => import("./pages/DynamicDepartment/HistoryPage"),
);

// History Pages
const SportsHistory = lazy(() => import("./pages/Sports/HistoryPage"));
const CRCHistory = lazy(() => import("./pages/CRC/HistoryPage"));
const AccountsHistory = lazy(() => import("./pages/Accounts/HistoryPage"));
const LibraryHistory = lazy(() => import("./pages/Library/HistoryPage"));
const HostelsHistory = lazy(() => import("./pages/Hostels/HistoryPage"));
const LaboratoriesHistory = lazy(
  () => import("./pages/Laboratories/HistoryPage"),
);
const SchoolHistory = lazy(() => import("./pages/Schools/HistoryPage"));
const HODHistory = lazy(() => import("./pages/HOD/HistoryPage"));
const OfficeHistory = lazy(() => import("./pages/Office/HistoryPage"));

/* -------------------------------------------------------------------------- */
/* UI UTILITIES                                                               */
/* -------------------------------------------------------------------------- */

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-black">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      <p className="text-cyan-500 font-bold text-xs uppercase tracking-widest animate-pulse">
        Loading System...
      </p>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* SESSION MANAGER                                                            */
/* -------------------------------------------------------------------------- */

const SessionManager = ({ children }) => {
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
  const timeoutTimerRef = useRef(null);
  const TIMEOUT_IN_MS = 15 * 60 * 1000;

  const triggerLogout = useCallback(() => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("student");
    setIsTimeoutModalOpen(true);
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    const isActive =
      localStorage.getItem("studentToken") || localStorage.getItem("token");
    if (isActive && !isTimeoutModalOpen) {
      timeoutTimerRef.current = setTimeout(triggerLogout, TIMEOUT_IN_MS);
    }
  }, [triggerLogout, isTimeoutModalOpen]);

  useEffect(() => {
    const handleApiExpiry = () => triggerLogout();
    window.addEventListener("session-expired", handleApiExpiry);
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      window.removeEventListener("session-expired", handleApiExpiry);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [resetTimer, triggerLogout]);

  const handleRelogin = () => {
    setIsTimeoutModalOpen(false);
    window.location.href = "/";
  };

  return (
    <>
      <div
        className={
          isTimeoutModalOpen
            ? "filter blur-2xl pointer-events-none grayscale brightness-50 transition-all duration-700"
            : "transition-all duration-500"
        }
      >
        {children}
      </div>
      <SessionTimeoutModal
        isOpen={isTimeoutModalOpen}
        onLogin={handleRelogin}
      />
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* PROTECTION HELPERS                                                         */
/* -------------------------------------------------------------------------- */

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const StudentProtectedRoute = ({ children }) => {
  const { student, loading } = useStudentAuth();
  if (loading) return null;
  return student ? children : <Navigate to="/student/login" replace />;
};

const RoleRoutes = ({ Dashboard, HistoryComponent }) => (
  <ProtectedRoute>
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route
        path="history"
        element={
          HistoryComponent ? (
            <HistoryComponent />
          ) : (
            <Navigate to="dashboard" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </ProtectedRoute>
);

const normalizeRouteForRum = (pathname) => {
  if (!pathname) return "/";

  return (
    pathname
      .split("/")
      .map((segment, index) => {
        if (index === 0 || !segment) return segment;
        if (/^\d+$/.test(segment)) return ":id";
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            segment,
          )
        ) {
          return ":uuid";
        }
        if (segment.length >= 24 && /^[A-Za-z0-9_-]+$/.test(segment)) {
          return ":token";
        }
        return segment;
      })
      .join("/") || "/"
  );
};

const DatadogViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const routePattern = normalizeRouteForRum(location.pathname);

    datadogRum.startView({
      name: routePattern,
      context: {
        route_pattern: routePattern,
        route_path: location.pathname,
      },
    });
  }, [location.pathname]);

  return null;
};

/* -------------------------------------------------------------------------- */
/* ROOT APP COMPONENT                                                         */
/* -------------------------------------------------------------------------- */

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <ApplicationProvider>
          <SessionManager>
            <Suspense fallback={<PageLoader />}>
              <DatadogViewTracker />
              <Routes>
                {/* PUBLIC ENTRY & UTILITIES */}
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/verify" element={<CertificateVerify />} />
                <Route path="/verify/lookup" element={<CertificateVerify />} />
                <Route
                  path="/verify/:certificateId"
                  element={<CertificateVerify />}
                />
                <Route path="/developers" element={<Developers />} />

                {/* STUDENT FLOW */}
                <Route path="/student" element={<StudentEntry />} />
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/student/register" element={<StudentRegister />} />
                <Route
                  path="/student/*"
                  element={
                    <StudentProtectedRoute>
                      <StudentDashboard />
                    </StudentProtectedRoute>
                  }
                />

                {/* ADMINISTRATION */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 1. LEGACY/CUSTOM DEPARTMENTAL NODES */}
                <Route
                  path="/sports/*"
                  element={
                    <RoleRoutes
                      Dashboard={SportsDashboard}
                      HistoryComponent={SportsHistory}
                    />
                  }
                />
                <Route
                  path="/crc/*"
                  element={
                    <RoleRoutes
                      Dashboard={CRCDashboard}
                      HistoryComponent={CRCHistory}
                    />
                  }
                />
                <Route
                  path="/accounts/*"
                  element={
                    <RoleRoutes
                      Dashboard={AccountsDashboard}
                      HistoryComponent={AccountsHistory}
                    />
                  }
                />
                <Route
                  path="/library/*"
                  element={
                    <RoleRoutes
                      Dashboard={LibraryDashboard}
                      HistoryComponent={LibraryHistory}
                    />
                  }
                />
                <Route
                  path="/hostels/*"
                  element={
                    <RoleRoutes
                      Dashboard={HostelsDashboard}
                      HistoryComponent={HostelsHistory}
                    />
                  }
                />
                <Route
                  path="/laboratories/*"
                  element={
                    <RoleRoutes
                      Dashboard={LabDashboard}
                      HistoryComponent={LaboratoriesHistory}
                    />
                  }
                />
                <Route
                  path="/hod/*"
                  element={
                    <RoleRoutes
                      Dashboard={HODDashboard}
                      HistoryComponent={HODHistory}
                    />
                  }
                />
                <Route
                  path="/office/*"
                  element={
                    <RoleRoutes
                      Dashboard={OfficeDashboard}
                      HistoryComponent={OfficeHistory}
                    />
                  }
                />
                <Route
                  path="/school/*"
                  element={
                    <RoleRoutes
                      Dashboard={SchoolDashboard}
                      HistoryComponent={SchoolHistory}
                    />
                  }
                />

                {/* 2. ⭐ DYNAMIC DEPARTMENT FALLBACK ⭐ */}
                {/* Any department NOT explicitly listed above will route here */}
                <Route
                  path="/dept/*"
                  element={
                    <RoleRoutes
                      Dashboard={DynamicDashboard}
                      HistoryComponent={DynamicHistory}
                    />
                  }
                />

                {/* ALIAS SUPPORT */}
                <Route
                  path="/account/*"
                  element={<Navigate to="/accounts/dashboard" replace />}
                />
                <Route
                  path="/hostel/*"
                  element={<Navigate to="/hostels/dashboard" replace />}
                />
                <Route
                  path="/lab/*"
                  element={<Navigate to="/laboratories/dashboard" replace />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </SessionManager>
        </ApplicationProvider>
      </StudentAuthProvider>
    </AuthProvider>
  );
}

export default App;
