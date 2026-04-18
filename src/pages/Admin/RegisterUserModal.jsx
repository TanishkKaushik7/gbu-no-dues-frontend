import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UserPlus,
  Mail,
  Lock,
  Shield,
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Landmark,
  Edit3,
  GraduationCap,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- CUSTOM SHADCN-LIKE SELECT COMPONENT ---
const ShadcnSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  loading,
  icon: Icon,
  theme = "slate",
  textClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options?.find((opt) => opt.v === value);

  // Dynamic Theme Mapping
  const themes = {
    slate:
      "bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 hover:bg-slate-100",
    blue: "bg-blue-50/30 border-blue-100 focus:border-blue-500 focus:ring-blue-500/10 hover:bg-blue-50",
    emerald:
      "bg-emerald-50/30 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/10 hover:bg-emerald-50",
  };

  const iconColors = {
    slate: "text-slate-400",
    blue: "text-blue-500",
    emerald: "text-emerald-500",
  };

  return (
    <div className="relative w-full" ref={ref}>
      {/* Hidden input to maintain native HTML form 'required' validation */}
      <input
        type="text"
        required
        value={value}
        onChange={() => {}}
        className="absolute opacity-0 w-0 h-0 -z-10"
        tabIndex={-1}
      />

      <div
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between py-4 px-5 rounded-2xl transition-all outline-none border",
          disabled || loading
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer focus:bg-white focus:ring-4",
          themes[theme],
          isOpen ? "bg-white ring-4" : "",
        )}
      >
        <div className="flex items-center gap-3 truncate">
          {loading ? (
            <Loader2
              className={cn("animate-spin w-4 h-4 shrink-0", iconColors[theme])}
            />
          ) : Icon ? (
            <Icon className={cn("w-4 h-4 shrink-0", iconColors[theme])} />
          ) : null}
          <span
            className={cn(
              "truncate",
              !selectedOption && "text-slate-400 font-normal",
              textClass || "text-sm font-bold",
            )}
          >
            {loading
              ? "Loading..."
              : selectedOption
                ? selectedOption.l
                : placeholder}
          </span>
        </div>
        <div className="flex items-center text-slate-400 ml-2 shrink-0">
          <ChevronDown
            className={cn(
              "transition-transform duration-200",
              isOpen && "rotate-180",
            )}
            size={16}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[120] mt-1 max-h-[200px] w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl custom-scrollbar"
          >
            {!options || options.length === 0 ? (
              <div className="relative cursor-default select-none py-3 px-5 text-slate-500 font-medium text-center text-xs tracking-widest uppercase">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.v}
                  className={cn(
                    "relative cursor-pointer select-none py-3 pl-5 pr-10 font-bold text-xs hover:bg-slate-50 hover:text-blue-600 transition-colors uppercase tracking-widest",
                    value === option.v
                      ? "bg-blue-50/50 text-blue-600"
                      : "text-slate-700",
                  )}
                  onClick={() => {
                    onChange(option.v);
                    setIsOpen(false);
                  }}
                >
                  <span className="block truncate">{option.l}</span>
                  {value === option.v && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-5 text-blue-600">
                      <Check size={16} strokeWidth={3} />
                    </span>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RegisterUserModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { authFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  // --- DYNAMIC OPTIONS STATE ---
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [deptsLoading, setDeptsLoading] = useState(false);

  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "staff",
    department_code: "", // ✅ Changed from ID to Code
    school_code: "", // ✅ Changed from ID to Code
  });

  // --- 1. FETCH OPTIONS ON MOUNT ---
  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        setSchoolsLoading(true);
        setDeptsLoading(true);
        try {
          // 1. Fetch Schools (using authFetch with authentication)
          const schoolsRes = await authFetch("/api/common/schools");
          if (!schoolsRes.ok)
            throw new Error(`Schools API Error: ${schoolsRes.ok}`);
          setSchoolOptions(await schoolsRes.json());
          setSchoolsLoading(false);

          // 2. Fetch Departments (using authFetch with authentication)
          const deptsRes = await authFetch("/api/common/departments?type=all");
          if (!deptsRes.ok)
            throw new Error(`Departments API Error: ${deptsRes.status}`);
          setDeptOptions(await deptsRes.json());
          setDeptsLoading(false);
        } catch (err) {
          console.error("❌ Dropdown Load Failed:");
          setError(`Failed to load options: ${err.message}`);
          setSchoolsLoading(false);
          setDeptsLoading(false);
        }
      };
      fetchOptions();
      // Set Initial Data for Edit Mode
      if (isEditMode) {
        setFormData({
          fullName: initialData.name || "",
          email: initialData.email || "",
          password: "",
          role: initialData.role?.toLowerCase() || "staff",
          // Assuming initialData comes with codes, otherwise you might need to map ID -> Code here
          department_code: initialData.department_code || "",
          school_code: initialData.school_code || "",
        });
      } else {
        setFormData({
          fullName: "",
          email: "",
          password: "",
          role: "staff",
          department_code: "",
          school_code: "",
        });
      }
      setShowSuccess(false);
      setError(null);
    }
  }, [isOpen, initialData, isEditMode]);

  // --- 2. HELPER: FILTER DEPARTMENTS ---
  const academicDepts = deptOptions.filter((d) => d.is_academic);
  const adminDepts = deptOptions.filter((d) => !d.is_academic);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const uiRole = formData.role;

      // ✅ LOGIC: Map UI Role to Backend Payload (Using CODES)
      let payloadRole = "staff";
      let payloadDeptCode = null;
      let payloadSchoolCode = null;

      if (uiRole === "admin") {
        payloadRole = "admin";
      } else if (uiRole === "dean") {
        payloadRole = "dean";
        payloadSchoolCode = formData.school_code;
      } else if (uiRole === "hod") {
        payloadRole = "hod";
        payloadDeptCode = formData.department_code;
      } else if (uiRole === "school_office") {
        // School Office = Staff linked to a School
        payloadRole = "staff";
        payloadSchoolCode = formData.school_code;
      } else if (uiRole === "staff") {
        // Admin Staff = Staff linked to an Admin Dept (Library, Accounts, etc.)
        payloadRole = "staff";
        payloadDeptCode = formData.department_code;
      }

      // Dynamic Endpoint
      let url = "";
      let method = "POST";

      if (isEditMode) {
        url = `/api/admin/users/${initialData.id}`;
        method = "PUT";
      } else {
        url =
          payloadRole === "admin"
            ? "/api/admin/register-admin"
            : "/api/admin/register-user";
      }

      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: payloadRole,
        department_code: payloadDeptCode, // ✅ Sending Code
        school_code: payloadSchoolCode, // ✅ Sending Code
      };

      if (isEditMode && !formData.password) delete payload.password;

      const response = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = Array.isArray(data.detail)
          ? data.detail[0].msg
          : data.detail;
        throw new Error(msg || "Operation failed");
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-visible border border-slate-100 relative">
        <div
          className={`px-6 py-10 text-center border-b border-slate-100 ${isEditMode ? "bg-indigo-50/30" : "bg-slate-50/30"}`}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>
          <div className="inline-flex p-4 rounded-[1.5rem] bg-white shadow-sm mb-4 border border-slate-50">
            {isEditMode ? (
              <Edit3 className="text-indigo-600 h-6 w-6" />
            ) : (
              <UserPlus className="text-blue-600 h-6 w-6" />
            )}
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {isEditMode ? "Update User" : "Register User"}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Staff Access Management
          </p>
        </div>

        {showSuccess ? (
          <div className="p-16 text-center animate-in zoom-in-95 duration-500">
            <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">
              Success
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">
              Account Synchronized
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar"
          >
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[10px] rounded-2xl flex items-center gap-3 border border-red-100 font-black uppercase tracking-wider animate-in shake-in">
                <AlertCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Official Email"
                  required
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Custom Role Dropdown */}
                <ShadcnSelect
                  value={formData.role}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      role: val,
                      department_code: "",
                      school_code: "",
                    })
                  }
                  options={[
                    { v: "staff", l: "Departments" },
                    { v: "hod", l: "HOD" },
                    { v: "school_office", l: "School Office" },
                    { v: "dean", l: "Dean" },
                    { v: "admin", l: "Admin" },
                  ]}
                  placeholder="Select Role"
                  icon={Shield}
                  theme="slate"
                  textClass="text-[10px] font-black uppercase tracking-wider"
                />

                <input
                  type="password"
                  placeholder={isEditMode ? "Change PW" : "Password"}
                  required={!isEditMode}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {/* ---------------------------------------------------- */}
              {/* DYNAMIC DROPDOWNS (Powered by API Data) */}
              {/* ---------------------------------------------------- */}

              {/* 1. DEAN or SCHOOL OFFICE -> Select School */}
              {(formData.role === "dean" ||
                formData.role === "school_office") && (
                <div className="animate-in slide-in-from-top-2">
                  <ShadcnSelect
                    value={formData.school_code}
                    onChange={(val) =>
                      setFormData({ ...formData, school_code: val })
                    }
                    options={schoolOptions.map((s) => ({
                      v: s.code,
                      l: `${s.name} (${s.code})`,
                    }))}
                    placeholder="Select School"
                    icon={Landmark}
                    theme="blue"
                    textClass="text-[10px] font-black uppercase tracking-tight"
                    loading={schoolsLoading}
                  />
                </div>
              )}

              {/* 2. ADMIN STAFF -> Select Administrative Dept (Filtered) */}
              {formData.role === "staff" && (
                <div className="animate-in slide-in-from-top-2">
                  <ShadcnSelect
                    value={formData.department_code}
                    onChange={(val) =>
                      setFormData({ ...formData, department_code: val })
                    }
                    options={adminDepts.map((d) => ({
                      v: d.code,
                      l: `${d.name} (${d.code})`,
                    }))}
                    placeholder="Assign Admin Dept"
                    icon={Building2}
                    theme="blue"
                    textClass="text-[10px] font-black uppercase tracking-tight"
                    loading={deptsLoading}
                  />
                </div>
              )}

              {/* 3. HOD -> Select Academic Dept (Filtered) */}
              {formData.role === "hod" && (
                <div className="animate-in slide-in-from-top-2">
                  <ShadcnSelect
                    value={formData.department_code}
                    onChange={(val) =>
                      setFormData({ ...formData, department_code: val })
                    }
                    options={academicDepts.map((d) => ({
                      v: d.code,
                      l: `${d.name} (${d.code})`,
                    }))}
                    placeholder="Assign Academic Dept"
                    icon={GraduationCap}
                    theme="emerald"
                    textClass="text-[10px] font-black uppercase tracking-tight"
                    loading={deptsLoading}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-black text-[10px] text-slate-400 hover:bg-slate-50 uppercase tracking-[0.2em] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-[1.5] px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditMode ? (
                  "Update"
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default RegisterUserModal;
