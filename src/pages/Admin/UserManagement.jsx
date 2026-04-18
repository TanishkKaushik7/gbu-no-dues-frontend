import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Search,
  UserPlus,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Mail,
  Loader2,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import RegisterUserModal from "./RegisterUserModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- CUSTOM SHADCN-LIKE FILTER DROPDOWN ---
const FilterDropdown = ({
  value,
  onChange,
  options,
  icon: Icon,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.v === value);

  return (
    <div
      className={cn("relative flex-1 md:flex-none min-w-[220px]", className)}
      ref={ref}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-4 px-4 h-[50px] rounded-2xl border cursor-pointer transition-all select-none bg-white border-slate-200 hover:bg-slate-50",
          isOpen ? "ring-4 ring-blue-500/10 border-blue-400" : "",
        )}
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={16} className="text-slate-400" />}
          <span className="text-[10px] font-black tracking-widest uppercase truncate text-slate-600">
            {selectedOption ? selectedOption.l : "Select Role..."}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform duration-200 shrink-0 text-slate-400",
            isOpen && "rotate-180",
          )}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full min-w-[180px] overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl custom-scrollbar"
          >
            {options.map((opt) => (
              <div
                key={opt.v}
                onClick={() => {
                  onChange(opt.v);
                  setIsOpen(false);
                }}
                className={cn(
                  "relative flex items-center justify-between cursor-pointer py-3 px-4 text-[10px] font-black uppercase tracking-widest transition-colors",
                  value === opt.v
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                )}
              >
                <span className="truncate">{opt.l}</span>
                {value === opt.v && (
                  <Check size={14} className="shrink-0 ml-2 text-blue-600" />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserManagement = () => {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [activeActionId, setActiveActionId] = useState(null);

  const getSchoolCode = (id) => {
    const schools = {
      1: "SOICT",
      2: "SOE",
      3: "SOM",
      4: "SOBT",
      5: "SOVSAS",
      6: "SOLJ",
      7: "SOHSS",
      8: "SOAP",
    };
    return schools[id] || `School #${id}`;
  };

  const getDeptName = (id) => {
    const departments = {
      1: "Computer Science and Engineering",
      2: "Information Technology",
      3: "Electronics and Communication Engineering",
      4: "Mechanical Engineering",
      5: "Civil Engineering",
      6: "Electrical Engineering",
      7: "Biotechnology",
      8: "Management",
      9: "Law",
      10: "Humanities and Social Sciences",
      11: "Applied Sciences",
      12: "Mathematics",
      13: "Physics",
      14: "Library",
      15: "Hostel",
      16: "Sports",
      17: "Laboratories",
      18: "CRC",
      19: "Accounts",
    };
    return departments[id] || `Dept #${id}`;
  };

  const getDeptNameFromCode = (code) => {
    const normalizedCode = String(code || "")
      .trim()
      .toUpperCase();

    const departmentsByCode = {
      CSE: "Computer Science and Engineering",
      IT: "Information Technology",
      ECE: "Electronics and Communication Engineering",
      ME: "Mechanical Engineering",
      CE: "Civil Engineering",
      EE: "Electrical Engineering",
      BT: "Biotechnology",
      MGMT: "Management",
      LAW: "Law",
      HSS: "Humanities and Social Sciences",
      AP: "Applied Sciences",
      MATH: "Mathematics",
      PHY: "Physics",
      LIB: "Library",
      HST: "Hostel",
      SPT: "Sports",
      LAB: "Laboratories",
      CRC: "CRC",
      ACC: "Accounts",
      EX: "Examination",
    };

    return departmentsByCode[normalizedCode] || null;
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        ...(roleFilter && { role: roleFilter }),
      }).toString();
      const response = await authFetch(`/api/admin/users?${query}`);

      if (response.ok) {
        const data = await response.json();
        const userList = data.users || (Array.isArray(data) ? data : []);
        setUsers(userList);
        setTotalUsers(data.total || userList.length);
        setCurrentPage(1); // Reset to page 1 on new fetch
      }
    } catch (error) {
      console.error("Failed to fetch users:");
    } finally {
      setLoading(false);
    }
  }, [authFetch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- CLIENT SIDE FILTERING & PAGINATION LOGIC ---
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setActiveActionId(null);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsRegisterModalOpen(true);
    setActiveActionId(null);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleteLoading(true);
    setDeleteError("");
    try {
      const response = await authFetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setTotalUsers((prev) => prev - 1);
        setDeletingUser(null);
        setDeleteError("");
        return;
      }

      let message = "Failed to delete user. Please try again.";
      try {
        const data = await response.json();
        if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
          message = data.detail[0].msg;
        } else if (typeof data?.message === "string") {
          message = data.message;
        }
      } catch {
        // Keep the fallback message when backend body is not JSON.
      }

      setDeleteError(message);
    } catch (error) {
      setDeleteError("Network error while deleting user. Please retry.");
      console.error("Delete error:");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const getRoleContext = (user) => {
    const role = String(user?.role || "").toLowerCase();
    const explicitScope = user?.role_scope || user?.user_role_scope;

    if (explicitScope) {
      return explicitScope;
    }

    if (role === "staff") {
      if (user?.school_id || user?.school_code || user?.school_name) {
        return "school_office";
      }
      if (
        user?.department_id ||
        user?.department_code ||
        user?.department_name
      ) {
        return "department";
      }
      return "unassigned";
    }

    if (role === "dean") return "school";
    if (role === "hod") return "department";
    if (role === "student") return "student";
    if (role === "admin" || role === "super_admin") return "global";

    return "department";
  };

  const getRoleDisplay = (user) => {
    if (user?.user_role_display) {
      return user.user_role_display;
    }

    const role = String(user?.role || "").toLowerCase();
    const scope = getRoleContext(user);

    if (role === "staff" && scope === "school_office")
      return "School Office Staff";
    if (role === "staff" && scope === "department") return "Department Staff";
    if (role === "staff" && scope === "unassigned") return "Staff (Unassigned)";
    if (role === "dean") return "School Dean";
    if (role === "hod") return "Head of Department";
    if (role === "admin") return "Admin";
    if (role === "super_admin") return "Super Admin";
    if (role === "student") return "Student";

    return role.replaceAll("_", " ");
  };

  const getScopeLabel = (scope) => {
    const labels = {
      global: "Global Scope",
      school: "School Scope",
      school_office: "School Office Scope",
      department: "Department Scope",
      student: "Student Scope",
      unassigned: "Unassigned Scope",
    };
    return labels[scope] || "Department Scope";
  };

  const getUnitAllocation = (user) => {
    const scope = getRoleContext(user);

    const schoolLabel =
      user?.school_code ||
      user?.school?.code ||
      user?.school_name ||
      (user?.school_id ? getSchoolCode(user.school_id) : null);

    const departmentLabel =
      user?.department_name ||
      user?.department?.name ||
      getDeptNameFromCode(user?.department_code) ||
      getDeptNameFromCode(user?.department?.code) ||
      (user?.department_id ? getDeptName(user.department_id) : null) ||
      user?.department_code ||
      user?.department?.code ||
      null;

    if (scope === "global") {
      return { name: "Global", type: "System" };
    }

    if (scope === "school" || scope === "school_office") {
      return { name: schoolLabel || "Unassigned School", type: "School" };
    }

    if (scope === "department") {
      return {
        name: departmentLabel || "Unassigned Department",
        type: "Department",
      };
    }

    if (scope === "student") {
      return { name: schoolLabel || "Student Account", type: "Student" };
    }

    if (schoolLabel) {
      return { name: schoolLabel, type: "School" };
    }
    if (departmentLabel) {
      return { name: departmentLabel, type: "Department" };
    }
    return { name: "Global", type: "System" };
  };

  const getRoleStyle = (user) => {
    const role = String(user?.role || "").toLowerCase();
    const scope = getRoleContext(user);

    if (role === "staff" && scope === "school_office") {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }

    if (role === "staff" && scope === "department") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }

    const styles = {
      super_admin: "bg-slate-900 text-white border-slate-900",
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      student: "bg-blue-100 text-blue-700 border-blue-200",
      dean: "bg-indigo-100 text-indigo-700 border-indigo-200",
      hod: "bg-teal-100 text-teal-700 border-teal-200",
      staff: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return styles[role] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col relative">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Maintain and audit university staff, student, and authority
            accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl mr-2">
            <Users className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              Total: {totalUsers}
            </span>
          </div>
          <button
            onClick={fetchUsers}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
          >
            <RefreshCw
              className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => {
              setEditingUser(null);
              setIsRegisterModalOpen(true);
            }}
            className="flex items-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Register User
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-11 pr-4 h-[50px] bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* --- CUSTOM DROPDOWN INTEGRATION --- */}
        <FilterDropdown
          icon={Filter}
          value={roleFilter}
          onChange={(val) => {
            setRoleFilter(val);
            setCurrentPage(1);
          }}
          options={[
            { v: "", l: "All Account Roles" },
            { v: "admin", l: "Admin" },
            { v: "student", l: "Student" },
            { v: "dean", l: "School Dean" },
            { v: "hod", l: "HOD" },
            { v: "staff", l: "Staff" },
          ]}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Identification</th>
                <th className="px-6 py-5">Role Assigned</th>
                <th className="px-6 py-5">Unit Allocation</th>
                <th className="px-8 py-5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-24 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-slate-300 mx-auto" />
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const scope = getRoleContext(user);
                        return (
                          <div className="flex flex-col">
                            <span
                              className={`inline-flex w-fit px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${getRoleStyle(user)}`}
                            >
                              {getRoleDisplay(user)}
                            </span>
                            <span className="mt-1 text-[9px] text-slate-400 font-black uppercase tracking-wide">
                              {getScopeLabel(scope)}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const unit = getUnitAllocation(user);
                        return (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">
                              {unit.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-black uppercase">
                              {unit.type}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={() =>
                          setActiveActionId(
                            activeActionId === user.id ? null : user.id,
                          )
                        }
                        className="text-slate-300 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {activeActionId === user.id && (
                        <div className="relative">
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActiveActionId(null)}
                          />
                          <div className="absolute right-0 top-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 py-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50"
                            >
                              <Edit2 className="h-4 w-4 text-blue-500" /> Edit
                              User
                            </button>
                            <button
                              onClick={() => {
                                setDeleteError("");
                                setDeletingUser({
                                  id: user.id,
                                  name: user.name,
                                });
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" /> Remove User
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing{" "}
            {Math.min(
              filteredUsers.length,
              (currentPage - 1) * itemsPerPage + 1,
            )}
            -{Math.min(filteredUsers.length, currentPage * itemsPerPage)} of{" "}
            {filteredUsers.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                    currentPage === i + 1
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(currentPage + 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          setEditingUser(null);
        }}
        onSuccess={fetchUsers}
        initialData={editingUser}
      />
      <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => {
          setDeletingUser(null);
          setDeleteError("");
        }}
        onConfirm={confirmDelete}
        userName={deletingUser?.name}
        isLoading={isDeleteLoading}
        errorMessage={deleteError}
      />

      {/* Global Scrollbar Style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default UserManagement;
