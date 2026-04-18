import React, { useState, useEffect, useRef } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiRefreshCw,
  FiUploadCloud,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiBookOpen,
  FiHome,
  FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// --- SHADCN IMPORTS (Only Calendar and Popover) ---
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- FULL INDIAN STATES & UT LIST (Universal) ---
const DOMICILE_OPTIONS = [
  { v: "Andhra Pradesh", l: "Andhra Pradesh" },
  { v: "Arunachal Pradesh", l: "Arunachal Pradesh" },
  { v: "Assam", l: "Assam" },
  { v: "Bihar", l: "Bihar" },
  { v: "Chhattisgarh", l: "Chhattisgarh" },
  { v: "Goa", l: "Goa" },
  { v: "Gujarat", l: "Gujarat" },
  { v: "Haryana", l: "Haryana" },
  { v: "Himachal Pradesh", l: "Himachal Pradesh" },
  { v: "Jharkhand", l: "Jharkhand" },
  { v: "Karnataka", l: "Karnataka" },
  { v: "Kerala", l: "Kerala" },
  { v: "Madhya Pradesh", l: "Madhya Pradesh" },
  { v: "Maharashtra", l: "Maharashtra" },
  { v: "Manipur", l: "Manipur" },
  { v: "Meghalaya", l: "Meghalaya" },
  { v: "Mizoram", l: "Mizoram" },
  { v: "Nagaland", l: "Nagaland" },
  { v: "Odisha", l: "Odisha" },
  { v: "Punjab", l: "Punjab" },
  { v: "Rajasthan", l: "Rajasthan" },
  { v: "Sikkim", l: "Sikkim" },
  { v: "Tamil Nadu", l: "Tamil Nadu" },
  { v: "Telangana", l: "Telangana" },
  { v: "Tripura", l: "Tripura" },
  { v: "Uttar Pradesh", l: "Uttar Pradesh" },
  { v: "Uttarakhand", l: "Uttarakhand" },
  { v: "West Bengal", l: "West Bengal" },
  { v: "Delhi", l: "Delhi (NCT)" },
  { v: "Jammu and Kashmir", l: "Jammu and Kashmir" },
];

// --- REUSABLE UI COMPONENTS ---
const Label = ({ children, required, className }) => (
  <label
    className={cn(
      "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1",
      className,
    )}
  >
    {children} {required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

const ADMISSION_YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { v: String(year), l: String(year) };
});

const ReadOnlyField = ({ label, value, icon: Icon }) => (
  <div className="group">
    <Label>{label}</Label>
    <div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-sm font-bold flex items-center gap-3 select-none">
      {Icon && <Icon className="text-slate-400" size={16} />}
      <span className="truncate">{value || "—"}</span>
    </div>
  </div>
);

const InputRow = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  editable = true,
  error,
  required = true,
  placeholder = "",
  icon: Icon,
}) => (
  <div className="group relative flex flex-col justify-start" data-field={name}>
    <Label required={required}>{label}</Label>
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-blue-500"
          size={16}
        />
      )}
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        disabled={!editable}
        className={cn(
          "w-full rounded-xl py-3.5 text-sm font-bold border outline-none transition-all",
          Icon ? "pl-11 pr-4" : "px-4",
          editable
            ? "bg-white border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed",
          error ? "border-rose-400 bg-rose-50/30" : "",
        )}
      />
    </div>
    {error && (
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1">
        <FiAlertCircle size={12} /> {error}
      </span>
    )}
  </div>
);

// --- CUSTOM SHADCN-LIKE SELECT COMPONENT ---
const ShadcnSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  icon: Icon,
  loading,
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

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        role="button"
        tabIndex={disabled || loading ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !loading) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold transition-all outline-none h-[49px]",
          disabled || loading
            ? "opacity-100 bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed border"
            : "cursor-pointer hover:bg-slate-50 bg-white border border-slate-200 focus:ring-4 focus:ring-blue-500/10",
          error ? "border-rose-400 bg-rose-50/30" : "focus:border-blue-500",
          isOpen ? "ring-4 ring-blue-500/10 border-blue-500 bg-white" : "",
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {loading ? (
            <FiRefreshCw className="animate-spin w-4 h-4 shrink-0 text-slate-400" />
          ) : Icon ? (
            <Icon className="w-4 h-4 shrink-0 text-slate-400" />
          ) : null}
          <span
            className={cn(
              "truncate",
              !selectedOption && "text-slate-400 font-normal",
            )}
          >
            {loading
              ? "Fetching List..."
              : selectedOption
                ? selectedOption.l
                : placeholder}
          </span>
        </div>
        <div className="flex items-center text-slate-400 ml-2 shrink-0">
          <FiChevronDown
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
            className="absolute z-50 mt-1 max-h-[300px] w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg custom-scrollbar"
          >
            {!options || options.length === 0 ? (
              <div className="relative cursor-default select-none py-3 px-4 text-slate-500 font-medium text-center text-sm">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.v}
                  className={cn(
                    "relative cursor-pointer select-none py-2.5 pl-4 pr-9 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition-colors",
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
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                      <FiCheckCircle size={14} />
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

// --- WRAPPER FOR SELECT ROW ---
const SelectRow = ({
  label,
  name,
  value,
  onChange,
  editable = true,
  options,
  error,
  required = true,
  loading = false,
}) => (
  <div className="group flex flex-col justify-start" data-field={name}>
    <Label required={required}>{label}</Label>
    <ShadcnSelect
      value={value}
      onChange={(val) => onChange({ target: { name, value: val } })}
      options={options}
      placeholder="Select Option"
      disabled={!editable}
      loading={loading}
      error={error}
      icon={FiBookOpen}
    />
    {error && (
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1">
        <FiAlertCircle size={12} /> {error}
      </span>
    )}
  </div>
);

// --- MAIN COMPONENT ---
const MyApplications = ({
  user,
  formData,
  locked,
  formErrors: externalErrors,
  submitting,
  uploading,
  uploadProgress,
  handleChange,
  handleSave,
  hasSubmittedApplication,
  isRejected,
  rejectionDetails,
  stepStatuses,
  isCompleted,
}) => {
  const { authFetch } = useAuth();
  const [certDownloading, setCertDownloading] = useState(false);
  const [localFileError, setLocalFileError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [localFieldErrors, setLocalFieldErrors] = useState({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // --- DYNAMIC DROPDOWN STATES ---
  const [deptOptions, setDeptOptions] = useState([]);
  const [isDeptsLoading, setIsDeptsLoading] = useState(false);

  const [progOptions, setProgOptions] = useState([]);
  const [isProgsLoading, setIsProgsLoading] = useState(false);

  const [specOptions, setSpecOptions] = useState([]);
  const [isSpecsLoading, setIsSpecsLoading] = useState(false);

  // ---------------------------------------------------------
  // 1. Fetch Departments (School Level)
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchLinkedDepartments = async () => {
      const studentSchoolCode = user?.school_code || user?.student?.school_code;
      if (!studentSchoolCode) return;

      setIsDeptsLoading(true);
      try {
        const res = await authFetch(
          `/api/common/departments?school_code=${studentSchoolCode}`,
        );
        if (res.ok) {
          const data = await res.json();
          setDeptOptions(
            data.map((d) => ({ v: d.code, l: `${d.name} (${d.code})` })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch departments");
      } finally {
        setIsDeptsLoading(false);
      }
    };
    fetchLinkedDepartments();
  }, [user?.school_code, user?.student?.school_code, authFetch]);

  // ---------------------------------------------------------
  // 2. Fetch Programmes (Department Level)
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchProgrammes = async () => {
      if (!formData.departmentCode) {
        setProgOptions([]);
        return;
      }
      setIsProgsLoading(true);
      try {
        const res = await authFetch(
          `/api/common/programmes?department_code=${formData.departmentCode}`,
        );
        if (res.ok) {
          const data = await res.json();
          setProgOptions(data.map((p) => ({ v: p.code, l: p.name })));
        }
      } catch (err) {
        console.error("Failed to fetch programmes");
      } finally {
        setIsProgsLoading(false);
      }
    };
    fetchProgrammes();
  }, [formData.departmentCode, authFetch]);

  // ---------------------------------------------------------
  // 3. Fetch Specializations (Programme Level)
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchSpecializations = async () => {
      if (!formData.programmeCode) {
        setSpecOptions([]);
        return;
      }
      setIsSpecsLoading(true);
      try {
        const res = await authFetch(
          `/api/common/specializations?programme_code=${formData.programmeCode}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSpecOptions(data.map((s) => ({ v: s.code, l: s.name })));
        }
      } catch (err) {
        console.error("Failed to fetch specializations");
      } finally {
        setIsSpecsLoading(false);
      }
    };
    fetchSpecializations();
  }, [formData.programmeCode, authFetch]);

  // --- CASCADING HANDLERS ---
  const handleDeptChange = (e) => {
    handleChange(e);
    handleChange({ target: { name: "programmeCode", value: "" } });
    handleChange({ target: { name: "specializationCode", value: "" } });
  };

  const handleProgChange = (e) => {
    handleChange(e);
    handleChange({ target: { name: "specializationCode", value: "" } });
  };

  const combinedErrors = { ...externalErrors, ...localFieldErrors };
  const isFullyCleared =
    isCompleted ||
    (stepStatuses?.length > 0 &&
      stepStatuses?.every((s) => s.status === "completed"));

  const getSafeErrorMsg = (msg) => {
    if (!msg) return null;
    return typeof msg === "object" ? msg.msg || msg.detail || "Error" : msg;
  };

  useEffect(() => {
    const errorKeys = Object.keys(localFieldErrors);
    if (errorKeys.length === 0) return;

    let didClearAny = false;
    const remainingErrors = { ...localFieldErrors };

    errorKeys.forEach((key) => {
      const value = formData?.[key];
      const isFilled =
        value !== undefined && value !== null && String(value).trim() !== "";

      if (isFilled) {
        delete remainingErrors[key];
        didClearAny = true;
      }
    });

    if (!didClearAny) return;

    setLocalFieldErrors(remainingErrors);
    if (Object.keys(remainingErrors).length === 0) {
      setValidationError("");
    }
  }, [formData, localFieldErrors]);

  const scrollToField = (fieldName) => {
    if (!fieldName) return;
    const target =
      document.querySelector(`[name="${fieldName}"]`) ||
      document.querySelector(`[data-field="${fieldName}"]`);

    if (!target) return;

    const focusable = target.matches("input, textarea, button, [tabindex]")
      ? target
      : target.querySelector("input, textarea, button, [tabindex]");

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (focusable && typeof focusable.focus === "function") {
      focusable.focus({ preventScroll: true });
    }
  };

  const validateAndSave = () => {
    setValidationError("");
    setLocalFieldErrors({});

    const mandatoryKeys = [
      "enrollmentNumber",
      "rollNumber",
      "departmentCode",
      "programmeCode",
      "specializationCode",
      "admissionYear",
      "section",
      "admissionType",
      "dob",
      "fatherName",
      "motherName",
      "gender",
      "category",
      "permanentAddress",
      "domicile",
      "proof_document_url",
    ];

    if (formData.isHosteller === "Yes")
      mandatoryKeys.push("hostelName", "hostelRoom");
    if (isRejected) mandatoryKeys.push("remarks");

    const newErrors = {};
    mandatoryKeys.forEach((key) => {
      if (!formData[key] || String(formData[key]).trim() === "") {
        newErrors[key] = `Field Required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setLocalFieldErrors(newErrors);
      setValidationError("Please complete all required fields.");
      scrollToField(Object.keys(newErrors)[0]);
      return;
    }

    const payload = {
      // Academic
      enrollment_number: formData.enrollmentNumber,
      roll_number: formData.rollNumber,
      department_code: formData.departmentCode,
      programme_code: formData.programmeCode,
      specialization_code: formData.specializationCode,
      admission_year: parseInt(formData.admissionYear),
      admission_type: formData.admissionType,
      section: formData.section,

      // Personal
      full_name: formData.fullName || user?.full_name,
      email: formData.email || user?.email,
      father_name: formData.fatherName,
      mother_name: formData.motherName,
      dob: formData.dob,
      gender: formData.gender,
      category: formData.category,
      domicile: formData.domicile,
      permanent_address: formData.permanentAddress,

      // Logistics
      is_hosteller: formData.isHosteller === "Yes",
      hostel_name: formData.isHosteller === "Yes" ? formData.hostelName : null,
      hostel_room: formData.isHosteller === "Yes" ? formData.hostelRoom : null,

      // Proof & Remarks
      proof_document_url: formData.proof_document_url,
      remarks: formData.remarks || "No additional remarks",
      student_remarks: isRejected ? formData.remarks : undefined,
    };

    handleSave(payload);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setLocalFileError("File size exceeds 5MB limit");
      e.target.value = null;
      return;
    }
    setLocalFileError("");
    handleChange(e);
  };

  // --- RENDERING LOGIC ---

  if (isFullyCleared) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center flex flex-col items-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <FiCheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">
          Clearance Completed
        </h2>
        <p className="text-slate-500 max-w-md mb-8">
          All departments have approved your request. You may now download your
          official clearance certificate.
        </p>
        <button
          onClick={() => {}}
          className="w-full max-w-xs py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-700"
        >
          <FiDownload size={18} /> Download Certificate
        </button>
      </div>
    );
  }

  if (hasSubmittedApplication && !isRejected) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center flex flex-col items-center animate-in fade-in">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <FiRefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          Under Review
        </h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
          Your application is being processed by the administration. You will be
          notified of any status updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {(isRejected || validationError) && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex gap-4 animate-in slide-in-from-top-2">
          <FiAlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">
              {validationError ? "Form Incomplete" : "Correction Required"}
            </h3>
            <p className="text-sm text-rose-800 mt-1 font-bold">
              {validationError
                ? validationError
                : rejectionDetails?.remarks ||
                  "Please address the comments provided below."}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              Clearance Application Form
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
              Academic Session 2025-2026
            </p>
          </div>
        </div>

        <div className="p-8 lg:p-12 space-y-14">
          {/* Section 01: Academic */}
          <section className="space-y-8">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2 uppercase tracking-widest">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">
                01
              </span>
              Academic Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
              <InputRow
                label="Enrollment Number"
                name="enrollmentNumber"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                editable={!locked.enrollmentNumber && !isRejected}
                error={getSafeErrorMsg(combinedErrors.enrollmentNumber)}
              />
              <InputRow
                label="Roll Number"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                editable={!locked.rollNumber && !isRejected}
                error={getSafeErrorMsg(combinedErrors.rollNumber)}
              />

              <SelectRow
                label="Department"
                name="departmentCode"
                value={formData.departmentCode}
                onChange={handleDeptChange}
                editable={!locked.departmentCode}
                error={getSafeErrorMsg(combinedErrors.departmentCode)}
                options={deptOptions}
                loading={isDeptsLoading}
                required
              />

              <SelectRow
                label="Programme / Degree"
                name="programmeCode"
                value={formData.programmeCode}
                onChange={handleProgChange}
                editable={!locked.programmeCode && formData.departmentCode}
                error={getSafeErrorMsg(combinedErrors.programmeCode)}
                options={progOptions}
                loading={isProgsLoading}
                required
              />

              <SelectRow
                label="Specialization"
                name="specializationCode"
                value={formData.specializationCode}
                onChange={handleChange}
                editable={!locked.specializationCode && formData.programmeCode}
                error={getSafeErrorMsg(combinedErrors.specializationCode)}
                options={specOptions}
                loading={isSpecsLoading}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <SelectRow
                  label="Admission Year"
                  name="admissionYear"
                  value={formData.admissionYear}
                  onChange={handleChange}
                  editable={!locked.admissionYear}
                  error={getSafeErrorMsg(combinedErrors.admissionYear)}
                  options={ADMISSION_YEAR_OPTIONS}
                />
                <SelectRow
                  label="Section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  editable={!locked.section}
                  error={getSafeErrorMsg(combinedErrors.section)}
                  options={[
                    { v: "A", l: "A" },
                    { v: "B", l: "B" },
                    { v: "C", l: "C" },
                    { v: "D", l: "D" },
                    { v: "E", l: "E" },
                    { v: "F", l: "F" },
                    { v: "N/A", l: "N/A" },
                  ]}
                />
              </div>
              <SelectRow
                label="Admission Type"
                name="admissionType"
                value={formData.admissionType}
                onChange={handleChange}
                editable={!locked.admissionType}
                error={getSafeErrorMsg(combinedErrors.admissionType)}
                options={[
                  { v: "Regular", l: "Regular" },
                  { v: "Lateral Entry", l: "Lateral Entry" },
                ]}
              />
            </div>
          </section>

          {/* Section 02: Personal Details */}
          <section className="space-y-8">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2 uppercase tracking-widest">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">
                02
              </span>
              Student Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
              <ReadOnlyField
                label="Full Name"
                value={formData.fullName || user?.full_name}
                icon={FiUser}
              />
              <ReadOnlyField
                label="Official Email"
                value={formData.email || user?.email}
              />
              <InputRow
                label="Father's Name"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                editable={!locked.fatherName}
                error={getSafeErrorMsg(combinedErrors.fatherName)}
              />
              <InputRow
                label="Mother's Name"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                editable={!locked.motherName}
                error={getSafeErrorMsg(combinedErrors.motherName)}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* --- SHADCN DOB CALENDAR --- */}
                <div
                  className="group relative flex flex-col justify-start"
                  data-field="dob"
                >
                  <Label required>Date of Birth</Label>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full rounded-xl h-[49px] px-4 text-sm font-bold border outline-none transition-all justify-start text-left",
                          !formData.dob && "text-slate-400",
                          locked.dob
                            ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed hover:bg-slate-50 hover:text-slate-400"
                            : "bg-white border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:bg-slate-50 hover:text-slate-900",
                          getSafeErrorMsg(combinedErrors.dob)
                            ? "border-rose-400 bg-rose-50/30"
                            : "",
                        )}
                        disabled={locked.dob}
                      >
                        <FiCalendar className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                        {formData.dob ? (
                          format(new Date(formData.dob), "dd/MM/yyyy")
                        ) : (
                          <span className="font-normal text-slate-400">
                            Select Date
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formData.dob ? new Date(formData.dob) : undefined
                        }
                        onSelect={(date) => {
                          if (!date) return;
                          handleChange({
                            target: {
                              name: "dob",
                              value: format(date, "yyyy-MM-dd"),
                              type: "date",
                            },
                          });
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1990}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  {getSafeErrorMsg(combinedErrors.dob) && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1">
                      <FiAlertCircle size={12} />{" "}
                      {getSafeErrorMsg(combinedErrors.dob)}
                    </span>
                  )}
                </div>

                <SelectRow
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  editable={!locked.gender}
                  error={getSafeErrorMsg(combinedErrors.gender)}
                  options={[
                    { v: "Male", l: "Male" },
                    { v: "Female", l: "Female" },
                  ]}
                />
              </div>

              <SelectRow
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                editable={!locked.category}
                error={getSafeErrorMsg(combinedErrors.category)}
                options={[
                  { v: "GEN", l: "GEN" },
                  { v: "OBC", l: "OBC" },
                  { v: "SC", l: "SC" },
                  { v: "ST", l: "ST" },
                ]}
              />
              <SelectRow
                label="Domicile State"
                name="domicile"
                value={formData.domicile}
                onChange={handleChange}
                editable={!locked.domicile}
                error={getSafeErrorMsg(combinedErrors.domicile)}
                options={DOMICILE_OPTIONS}
                required
              />
              <InputRow
                label="Permanent Address"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                editable={!locked.permanentAddress}
                error={getSafeErrorMsg(combinedErrors.permanentAddress)}
                icon={FiMapPin}
              />

              {/* --- HOSTELLER LOGIC MOVED HERE --- */}
              <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-6 w-6 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
                    <FiHome size={12} strokeWidth={3} />
                  </div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    Campus Residency Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <SelectRow
                    label="Hosteller Status"
                    name="isHosteller"
                    value={formData.isHosteller}
                    onChange={handleChange}
                    editable={!locked.isHosteller}
                    error={getSafeErrorMsg(combinedErrors.isHosteller)}
                    options={[
                      { v: "Yes", l: "Yes" },
                      { v: "No", l: "No" },
                    ]}
                  />
                  {formData.isHosteller === "Yes" && (
                    <>
                      <InputRow
                        label="Hostel Name"
                        name="hostelName"
                        value={formData.hostelName}
                        onChange={handleChange}
                        editable={!locked.hostelName}
                        error={getSafeErrorMsg(combinedErrors.hostelName)}
                      />
                      <InputRow
                        label="Room Number"
                        name="hostelRoom"
                        value={formData.hostelRoom}
                        onChange={handleChange}
                        editable={!locked.hostelRoom}
                        error={getSafeErrorMsg(combinedErrors.hostelRoom)}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: Documents & Submission */}
          <section className="space-y-8">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2 uppercase tracking-widest">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">
                03
              </span>
              Required Documentation
            </h3>

            <div className="flex flex-col gap-6">
              {/* --- MODERN ALERT BANNER FOR PDF --- */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                    <span className="text-lg text-white font-black italic">
                      !
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight mb-3">
                      Combine these 3 documents into a Single PDF File
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { label: "Identity Proof", sub: "Aadhar / PAN / DL" },
                        { label: "Cancel Check", sub: "Bank Verification" },
                        { label: "Final Marksheet", sub: "Academic Record" },
                      ].map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-blue-50 shadow-sm"
                        >
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black">
                            0{idx + 1}
                          </span>
                          <div>
                            <p className="text-[11px] font-black text-slate-800 uppercase leading-none">
                              {doc.label}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 mt-1">
                              {doc.sub}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- UPLOAD AREA --- */}
              <div data-field="proof_document_url">
                <Label required className="text-slate-700 text-sm mb-3">
                  Clearance Proof Upload
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-[2rem] transition-all relative overflow-hidden group min-h-[200px] flex items-center justify-center",
                    uploading
                      ? "border-blue-400 bg-blue-50/50"
                      : combinedErrors.proof_document_url || localFileError
                        ? "border-rose-400 bg-rose-50/50"
                        : formData.proof_document_url
                          ? "border-emerald-400 bg-emerald-50/50"
                          : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/20",
                  )}
                >
                  {!formData.proof_document_url && !uploading && (
                    <input
                      type="file"
                      name="proof_document_url"
                      onChange={onFileChange}
                      accept="application/pdf"
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  )}

                  <div className="p-8 text-center w-full">
                    {uploading ? (
                      <div className="space-y-5">
                        <FiUploadCloud className="w-12 h-12 text-blue-600 animate-bounce mx-auto" />
                        <div className="space-y-3">
                          <p className="text-sm font-black text-blue-900 uppercase tracking-widest">
                            Processing PDF... {uploadProgress}%
                          </p>
                          <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden max-w-[250px] mx-auto">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : formData.proof_document_url ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-100 border border-emerald-50">
                          <FiCheckCircle size={32} strokeWidth={2.5} />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">
                            Document Secured
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase bg-emerald-100/50 px-3 py-1 rounded-md inline-block">
                            clearance_proof.pdf
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-100 group-hover:border-blue-100 transition-all duration-300">
                          <FiUploadCloud
                            size={28}
                            className="text-slate-400 group-hover:text-blue-600 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                            Click or drag PDF here
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Maximum file size: 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {(combinedErrors.proof_document_url || localFileError) && (
                  <p className="text-[11px] font-bold text-rose-500 mt-3 flex items-center gap-1.5 justify-center">
                    <FiAlertCircle size={14} />{" "}
                    {localFileError ||
                      getSafeErrorMsg(combinedErrors.proof_document_url)}
                  </p>
                )}
              </div>

              <div className="mt-4" data-field="remarks">
                <Label required={isRejected}>
                  {isRejected ? "Revision Notes" : "Additional Remarks"}
                </Label>
                <textarea
                  name="remarks"
                  value={formData.remarks || ""}
                  onChange={handleChange}
                  rows="3"
                  className={cn(
                    "w-full rounded-2xl px-5 py-4 text-sm font-bold border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:font-medium placeholder:text-slate-300 bg-slate-50 focus:bg-white",
                    getSafeErrorMsg(combinedErrors.remarks)
                      ? "border-rose-400 bg-rose-50/30"
                      : "",
                  )}
                  placeholder={
                    isRejected
                      ? "Explain the changes made for approval..."
                      : "Provide any additional context for the approving officer (Optional)..."
                  }
                />
                {getSafeErrorMsg(combinedErrors.remarks) && (
                  <p className="text-[11px] font-bold text-rose-500 mt-2 ml-1 flex items-center gap-1.5">
                    <FiAlertCircle size={14} />{" "}
                    {getSafeErrorMsg(combinedErrors.remarks)}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="pt-8 flex justify-end border-t border-slate-100">
            <button
              onClick={validateAndSave}
              disabled={
                submitting ||
                uploading ||
                isDeptsLoading ||
                isProgsLoading ||
                isSpecsLoading
              }
              className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/20 active:scale-95 flex items-center gap-3"
            >
              {submitting ? (
                <FiRefreshCw className="animate-spin" />
              ) : isRejected ? (
                "Resubmit Application"
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MyApplications;
