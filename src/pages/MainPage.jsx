import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Building,
  Sparkles,
  Zap,
  Shield,
  Lock,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Award,
  ChevronRight,
  Phone,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  Menu,
  X,
  ShieldCheck,
  // New icons for workflow
  UserCheck,
  BookOpen,
  Home,
  Activity,
  Microscope,
  Briefcase,
  Filter,
  Calculator,
  FileCheck,
  FileText,
} from "lucide-react";

// --- Helper Maps for Dynamic Tailwind Colors ---
const nodeStyles = {
  blue: {
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    shadow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
  },
  cyan: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    shadow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
  },
  purple: {
    border: "border-purple-500/40",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    shadow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
  },
  orange: {
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    shadow: "shadow-[0_0_20px_rgba(249,115,22,0.2)]",
  },
  emerald: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    shadow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
  },
};

const beamColors = {
  blue: "via-blue-400",
  cyan: "via-cyan-400",
  purple: "via-purple-400",
  orange: "via-orange-400",
  emerald: "via-emerald-400",
};

// --- Sub-components for Workflow ---
const WorkflowNode = ({
  icon: Icon,
  title,
  subtitle,
  color = "cyan",
  isActive = false,
  diamond = false,
}) => {
  const style = nodeStyles[color];
  return (
    <div
      className={`relative z-10 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/60 backdrop-blur-xl border ${style.border} transition-all duration-500 hover:scale-105 group min-w-[130px] lg:min-w-[140px]`}
    >
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
      ></div>
      <div
        className={`absolute -inset-2 rounded-3xl bg-${color}-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${style.shadow}`}
      ></div>

      <div
        className={`p-3 rounded-full mb-2 ${style.bg} ${style.text} relative ${diamond ? "rotate-45" : ""}`}
      >
        <Icon className={`w-6 h-6 ${diamond ? "-rotate-45" : ""}`} />
        {isActive && (
          <div
            className={`absolute inset-0 rounded-full animate-ping opacity-50 ${style.bg}`}
          ></div>
        )}
      </div>
      <h4 className="text-xs font-bold text-white text-center whitespace-nowrap">
        {title}
      </h4>
      {subtitle && (
        <p className="text-[9px] text-gray-400 text-center mt-1 uppercase tracking-wider">
          {subtitle}
        </p>
      )}
    </div>
  );
};

const DepartmentNode = ({ icon: Icon, name }) => (
  <div className="flex items-center gap-3 p-2.5 pr-4 w-40 rounded-xl bg-slate-800/40 border border-white/5 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all duration-300 group cursor-default">
    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">
      {name}
    </span>
    <CheckCircle2 className="w-3 h-3 text-emerald-500/40 group-hover:text-emerald-400 ml-auto transition-colors" />
  </div>
);

const AnimatedBeam = ({ delay = "0s", color = "cyan" }) => (
  <>
    {/* Desktop Horizontal Beam */}
    <div className="relative w-6 lg:w-10 h-[2px] bg-white/10 hidden md:block rounded-full overflow-hidden shrink-0">
      <div
        className={`absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent ${beamColors[color]} to-transparent animate-flow-h opacity-80`}
        style={{ animationDelay: delay }}
      ></div>
    </div>
    {/* Mobile Vertical Beam */}
    <div className="relative w-[2px] h-8 bg-white/10 md:hidden rounded-full overflow-hidden shrink-0 my-1">
      <div
        className={`absolute top-0 left-0 w-full h-[200%] bg-gradient-to-b from-transparent ${beamColors[color]} to-transparent animate-flow-v opacity-80`}
        style={{ animationDelay: delay }}
      ></div>
    </div>
  </>
);

export default function App() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const StatCard = ({ icon: Icon, value, label, gradient }) => (
    <div
      className={`relative p-5 rounded-3xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/10 transform hover:-translate-y-1 transition-all duration-300 group overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300"></div>
      <div className="relative flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-white/10 shadow-inner">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-3xl font-black text-white tracking-tight">
            {value}
          </p>
          <p className="text-xs text-white/70 font-semibold uppercase tracking-wider mt-0.5">
            {label}
          </p>
        </div>
      </div>
    </div>
  );

  const FeatureBadge = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
      <Icon className="w-4 h-4 text-cyan-400 transition-transform duration-300" />
      <span className="text-sm font-semibold text-white">{text}</span>
    </div>
  );

  const footerLinks = {
    students: [
      "Timetables",
      "Examinations",
      "Scholarship",
      "NSS",
      "Student Portal",
      "ABC",
      "UGC Guidelines",
    ],
    employee: ["Leave/Medical Forms", "Online Maintenance", "Complaint Form"],
    important: [
      "Anti Ragging",
      "IQAC",
      "NAAC",
      "NIRF",
      "RUSA",
      "Shodhganga",
      "IRINSGBU",
    ],
    system: ["About Portal", "Developer Page", "Privacy Policy"],
  };

  const footerLinkTargets = {
    Timetables: "https://www.gbu.ac.in/",
    Examinations: "https://www.gbu.ac.in/",
    Scholarship: "https://www.gbu.ac.in/",
    NSS: "https://www.gbu.ac.in/",
    "Student Portal": "/student",
    ABC: "https://www.gbu.ac.in/",
    "UGC Guidelines": "https://www.ugc.gov.in/",
    "Leave/Medical Forms": "https://www.gbu.ac.in/",
    "Online Maintenance": "https://www.gbu.ac.in/",
    "Complaint Form": "https://www.gbu.ac.in/",
    "Anti Ragging": "https://www.antiragging.in/",
    IQAC: "https://www.gbu.ac.in/",
    NAAC: "https://www.gbu.ac.in/",
    NIRF: "https://www.nirfindia.org/",
    RUSA: "https://www.education.gov.in/rusa",
    Shodhganga: "https://shodhganga.inflibnet.ac.in/",
    IRINSGBU: "https://www.gbu.ac.in/",
    "About Portal": "/",
    "Developer Page": "/developers",
    "Privacy Policy": "https://www.gbu.ac.in/",
  };

  const handleFooterLinkClick = (label) => {
    const target = footerLinkTargets[label] || "https://www.gbu.ac.in/";
    if (target.startsWith("/")) {
      navigate(target);
      setMobileMenuOpen(false);
      return;
    }
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden font-sans selection:bg-cyan-500/30">
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-[#0a0a0a] to-black"></div>

        {/* Static Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>

        {/* Interactive Mouse Highlight */}
        <div
          className="absolute w-[600px] h-[600px] bg-gradient-radial from-cyan-400/10 to-transparent rounded-full blur-3xl transition-all duration-300 ease-out"
          style={{
            left: `${mousePosition.x - 300}px`,
            top: `${mousePosition.y - 300}px`,
          }}
        ></div>

        {/* Geometric Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] opacity-50"></div>
      </div>

      {/* --- APPWRITE-STYLE FULL WIDTH HEADER --- */}
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b backdrop-blur-xl ${
          scrolled
            ? "bg-white/5 border-white/10 shadow-lg"
            : "bg-white/5 border-white/10"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-18 flex items-center justify-between">
          {/* Logo Section */}
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="relative w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="https://www.gbu.ac.in/Content/img/logo_gbu.png"
                alt="GBU Logo"
                className="w-6 h-6 md:w-7 md:h-7 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] md:text-[15px] font-black tracking-tighter text-white uppercase">
                Gautam Buddha University
              </span>
            </div>
          </div>

          {/* Desktop Action Section */}
          <div className="hidden md:flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 border border-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:border-emerald-700 transition-all duration-300"
              onClick={() => {
                navigate("/verify/lookup");
                setMobileMenuOpen(false);
              }}
            >
              <ShieldCheck className="w-4 h-4 text-white" /> Verify Certificate
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              className="p-2 text-gray-300 hover:text-white rounded-md hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu with Slide-down Animation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/5 backdrop-blur-xl border-t border-white/10`}
          style={{
            maxHeight: mobileMenuOpen ? "300px" : "0px", // adjust height as needed
            opacity: mobileMenuOpen ? 1 : 0,
          }}
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 border border-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:border-emerald-700 transition-all duration-300"
              onClick={() => {
                navigate("/verify/lookup");
                setMobileMenuOpen(false);
              }}
            >
              <ShieldCheck className="w-4 h-4 text-white" /> Verify Certificate
            </button>
            {/* Add more mobile menu items here */}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 pt-28 pb-32">
        {/* --- HERO SECTION --- */}
        <div className="mb-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Clearance Portal
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            <br className="md:hidden" /> No Dues Portal
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
            Streamlined, parallel-processed clearance workflow for graduating
            students. Secure, instant, and fully digital.
          </p>
        </div>

        {/* --- NGROK-STYLE ANIMATED WORKFLOW SECTION --- */}
        <div className="mb-32 relative py-16 border-y border-white/5 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent overflow-x-hidden">
          {/* Ambient Glow behind workflow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Real-Time Application Flow
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Witness the hybrid serial-to-parallel processing engine routing
              your application for lightning-fast clearance.
            </p>
          </div>

          {/* Workflow Diagram Container */}
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-[1400px] mx-auto relative z-10 px-2 overflow-x-auto pb-6">
            {/* 1. Student Submission */}
            <WorkflowNode
              icon={FileText}
              title="Application"
              subtitle="Submission"
              color="blue"
              isActive={true}
              diamond={true}
            />
            <AnimatedBeam delay="0s" color="blue" />

            {/* Serial Flow Segment */}
            <div className="relative flex flex-col md:flex-row items-center">
              {/* Optional Label for Desktop */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/70 hidden md:block whitespace-nowrap">
                Serial Flow
              </div>

              <WorkflowNode
                icon={Building}
                title="School Office"
                subtitle="Step 1"
                color="cyan"
              />
              <AnimatedBeam delay="0.4s" color="cyan" />

              <WorkflowNode
                icon={UserCheck}
                title="Dept. HoD"
                subtitle="Step 2"
                color="cyan"
              />
              <AnimatedBeam delay="0.8s" color="cyan" />

              <WorkflowNode
                icon={ShieldCheck}
                title="School Dean"
                subtitle="Step 3"
                color="cyan"
              />
            </div>

            <AnimatedBeam delay="1.2s" color="purple" />

            {/* Parallel Departments Cluster */}
            <div className="relative flex flex-col p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl shadow-2xl shrink-0 my-4 md:my-0">
              {/* Decorative brackets/lines for the cluster */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-[75%] border-l-2 border-y-2 border-purple-500/30 rounded-l-2xl hidden md:block"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-[75%] border-r-2 border-y-2 border-purple-500/30 rounded-r-2xl hidden md:block"></div>

              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-4 text-center flex items-center justify-center gap-2">
                <Zap className="w-3 h-3" /> Parallel Flow
              </div>

              <div className="flex flex-col gap-2">
                <DepartmentNode icon={BookOpen} name="Library" />
                <DepartmentNode icon={Activity} name="Sports" />
                <DepartmentNode icon={Microscope} name="Labs" />
                <DepartmentNode icon={Home} name="Hostel" />
                <DepartmentNode icon={Briefcase} name="Crc" />
              </div>
            </div>

            <AnimatedBeam delay="1.6s" color="emerald" />

            {/* Final Generation */}
            <WorkflowNode
              icon={Calculator}
              title="Accounts"
              subtitle="Final Clearance"
              color="emerald"
              isActive={true}
            />
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-24 max-w-5xl mx-auto">
          <StatCard
            icon={Users}
            value="1K+"
            label="Active Students"
            gradient="from-blue-600/20 to-cyan-600/5"
          />
          <StatCard
            icon={CheckCircle2}
            value="98%"
            label="Success Rate"
            gradient="from-emerald-600/20 to-teal-600/5"
          />
          <StatCard
            icon={Clock}
            value="24hr"
            label="Avg Process Time"
            gradient="from-purple-600/20 to-pink-600/5"
          />
          <StatCard
            icon={Award}
            value="7+"
            label="Departments"
            gradient="from-orange-600/20 to-red-600/5"
          />
        </div>

        {/* --- ACTION PORTALS --- */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20 text-left">
          {/* Student Portal */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl transition-all hover:border-cyan-500/30 group">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 w-fit mb-8 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">
              Student Panel
            </h3>
            <div className="flex flex-wrap gap-2 mb-8">
              <FeatureBadge icon={Zap} text="Instant Setup" />
              <FeatureBadge icon={Shield} text="Secure Auth" />
            </div>
            <div className="space-y-4 mb-10">
              {[
                "Live application status tracking",
                "Download digital certificates",
                "Automated email notifications",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-cyan-500/20">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{t}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/student/login")}
                className="flex-1 py-4 bg-white text-black font-black text-sm rounded-xl hover:bg-gray-200 transition-all text-center"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/student/register")}
                className="flex-1 py-4 bg-cyan-600 text-white font-black text-sm rounded-xl hover:bg-cyan-500 transition-all flex items-center justify-center gap-2"
              >
                Create Account <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin / Authority Portal */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl transition-all hover:border-purple-500/30 group">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 w-fit mb-8 group-hover:scale-110 transition-transform">
              <Building className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">
              Authority Panel
            </h3>
            <div className="flex flex-wrap gap-2 mb-8">
              <FeatureBadge icon={Lock} text="Encrypted" />
              <FeatureBadge icon={Users} text="Multi-Role" />
            </div>
            <div className="space-y-4 mb-10">
              {[
                "Bulk approval workflows",
                "Department-specific dashboards",
                "Comprehensive audit logs",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-purple-500/20">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{t}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-4 bg-purple-600 text-white font-black text-sm rounded-xl hover:bg-purple-500 transition-all flex items-center justify-center gap-2"
            >
              Access Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- SUPPORT BANNER --- */}
        <div className="flex justify-center">
          <div className="px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3 transition-colors hover:bg-white/10 cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <p className="text-sm text-gray-300 font-medium">
              Technical Support:{" "}
              <span className="text-cyan-400 font-bold ml-1">
                support@gbu.ac.in
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0a0a0a]/80 backdrop-blur-2xl pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <img
                  src="https://www.gbu.ac.in/Content/img/logo_gbu.png"
                  alt="Logo"
                  className="w-6 h-6"
                />
                Gautam Buddha University
              </h3>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Opp. Yamuna Expressway, Greater NOIDA, Gautam Budh Nagar, Uttar
                Pradesh - 201312
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-lg text-sm font-semibold">
                  <Phone className="w-4 h-4" /> 0120-2344200
                </div>
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-3 capitalize">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map((link, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => handleFooterLinkClick(link)}
                        className="text-sm text-slate-400 hover:text-cyan-400 transition-colors text-left"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/10 text-center flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium text-slate-500">
              © {new Date().getFullYear()} Gautam Buddha University. All rights
              reserved.
            </p>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              Maintained by{" "}
              <span className="text-slate-300">Central Computer Center</span>
            </p>
          </div>
        </div>
      </footer>

      {/* --- CUSTOM CSS ANIMATIONS --- */}
      <style>{`
        .bg-gradient-radial { 
          background-image: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to)); 
        }
        
        @keyframes flow-horizontal {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes flow-vertical {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        .animate-flow-h {
          animation: flow-horizontal 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        .animate-flow-v {
          animation: flow-vertical 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
