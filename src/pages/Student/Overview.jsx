import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import confetti from "canvas-confetti";
import { getUserFriendlyError } from "../../utils/errorHandling";
import {
  FiUser,
  FiFileText,
  FiCheckCircle,
  FiActivity,
  FiDownload,
  FiShield,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";

const Overview = ({
  user,
  formData,
  stepStatuses = [],
  setActive,
  applicationId,
  application,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [certificateError, setCertificateError] = useState("");

  /* -------------------------------------------------------------------------- */
  /* PROGRESS LOGIC (Robust)                                                  */
  /* -------------------------------------------------------------------------- */

  // 1. Try Backend Value first (if available)
  const backendProgress = application?.progress_percentage;

  // 2. Check Completion Flag
  const isCompleted =
    application?.status === "completed" ||
    (stepStatuses.length > 0 &&
      stepStatuses.every((s) => s.status === "completed"));

  // 3. Fallback Calculation (If backend value is missing)
  let computedProgress = 0;
  if (stepStatuses.length > 0) {
    const totalSteps = stepStatuses.length;
    // Count how many are approved/completed
    const completedSteps = stepStatuses.filter((s) =>
      ["completed", "approved", "done"].includes(
        (s.status || "").toLowerCase(),
      ),
    ).length;

    computedProgress = Math.round((completedSteps / totalSteps) * 100);
  }

  // Final Percentage Logic
  let progressPercent = isCompleted
    ? 100
    : (backendProgress ?? computedProgress ?? 0);
  progressPercent = Math.min(100, Math.max(0, progressPercent));
  const isFullyCleared = progressPercent === 100;

  /* -------------------------------------------------------------------------- */
  /* CONFETTI EFFECT                                                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (isFullyCleared) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
      }; // Increased zIndex

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isFullyCleared]);

  /* -------------------------------------------------------------------------- */
  /* DOWNLOAD HANDLER                                                         */
  /* -------------------------------------------------------------------------- */

  const handleDownloadCertificate = async () => {
    if (!applicationId) return;
    setCertificateError("");
    setDownloading(true);
    try {
      const response = await api.get(
        `/api/applications/${applicationId}/certificate`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GBU_Clearance_${formData.rollNumber || "Certificate"}.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setCertificateError(
        getUserFriendlyError(
          err,
          "Certificate generation failed. Please ensure all steps are approved.",
        ),
      );
    } finally {
      setDownloading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {certificateError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {certificateError}
        </div>
      )}

      {/* HERO SECTION */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 lg:p-12 text-white flex flex-col lg:flex-row justify-between items-center gap-10 shadow-2xl shadow-slate-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="space-y-4 text-center lg:text-left z-10">
          <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
            Hello,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              {formData.fullName?.split(" ")[0] || "Student"}
            </span>
          </h2>
          <p className="text-[11px] tracking-[0.2em] text-slate-400 font-bold max-w-md">
            Your centralized clearance dashboard. Track approvals and download
            certificates in real-time.
          </p>
        </div>

        {/* PROGRESS CARD */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex items-center gap-6 min-w-[280px]">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-700/50"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * progressPercent) / 100}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${isFullyCleared ? "text-emerald-400" : "text-blue-500"}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-black">
              {progressPercent}%
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Status
            </span>
            {isFullyCleared ? (
              <div className="flex flex-col items-start gap-2">
                <span className="text-xs font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-1 rounded">
                  Approved
                </span>
                <button
                  onClick={handleDownloadCertificate}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {downloading ? (
                    <FiClock className="animate-spin" />
                  ) : (
                    <FiDownload size={14} />
                  )}
                  PDF
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2">
                <span className="text-sm font-black text-white">
                  In Progress
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Pending Approvals
                </p>
                <button
                  onClick={() => setActive("status")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20"
                >
                  <FiActivity size={12} />
                  Track
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          icon={FiUser}
          label="Enrollment Number"
          value={formData.enrollmentNumber}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <InfoCard
          icon={FiFileText}
          label="Roll Number"
          value={formData.rollNumber}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <InfoCard
          icon={FiShield}
          label="Academic School"
          // ✅ FIXED: Reads from formData.schoolName, falls back to "GBU"
          value={
            formData.schoolName ||
            user?.student?.school_name ||
            user?.school_name
          }
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <InfoCard
          icon={FiActivity}
          label="Current Stage"
          value={
            isFullyCleared
              ? "Completed"
              : stepStatuses.find(
                  (s) => s.status === "pending" || s.status === "in_progress",
                )?.name || "Processing"
          }
          color={isFullyCleared ? "text-emerald-600" : "text-blue-600"}
          bgColor={isFullyCleared ? "bg-emerald-50" : "bg-blue-50"}
          iconBg={isFullyCleared ? "bg-emerald-100" : "bg-blue-100"}
          iconColor={isFullyCleared ? "text-emerald-600" : "text-blue-600"}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="Review Application"
          desc="View or update your submitted details."
          icon={FiFileText}
          onClick={() => setActive("form")}
          theme="blue"
        />
        <ActionCard
          title="Track Timeline"
          desc="See real-time status of every department."
          icon={FiActivity}
          onClick={() => setActive("status")}
          theme="indigo"
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SUB COMPONENTS                                                             */
/* -------------------------------------------------------------------------- */

const InfoCard = ({
  icon: Icon,
  label,
  value,
  color = "text-slate-900",
  bgColor = "bg-white",
  iconBg = "bg-slate-50",
  iconColor = "text-slate-400",
}) => (
  <div
    className={`${bgColor} p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md`}
  >
    <div
      className={`w-10 h-10 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shadow-sm border border-slate-50/50`}
    >
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
        {label}
      </p>
      <p className={`text-sm font-black uppercase truncate ${color}`}>
        {value || "—"}
      </p>
    </div>
  </div>
);

const ActionCard = ({ title, desc, icon: Icon, onClick, theme = "blue" }) => {
  const themeClasses = {
    blue: {
      iconBg: "bg-blue-50 text-blue-600",
      hoverIconBg: "group-hover:bg-blue-600 group-hover:text-white",
      hoverBorder: "hover:border-blue-100",
    },
    indigo: {
      iconBg: "bg-indigo-50 text-indigo-600",
      hoverIconBg: "group-hover:bg-indigo-600 group-hover:text-white",
      hoverBorder: "hover:border-indigo-100",
    },
  };

  const currentTheme = themeClasses[theme];

  return (
    <button
      onClick={onClick}
      className={`group w-full bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex justify-between items-center text-left ${currentTheme.hoverBorder}`}
    >
      <div className="flex gap-5 items-center">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${currentTheme.iconBg} ${currentTheme.hoverIconBg}`}
        >
          <Icon size={24} />
        </div>
        <div>
          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            {title}
          </h4>
          <p className="text-xs text-slate-400 font-medium mt-1 group-hover:text-slate-600 transition-colors">
            {desc}
          </p>
        </div>
      </div>
      <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300">
        <FiArrowRight size={16} />
      </div>
    </button>
  );
};

export default Overview;
