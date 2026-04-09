import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBook, 
  FiHome, FiCalendar, FiUsers, FiAward
} from 'react-icons/fi';

const StudentProfile = ({ profileData }) => {
  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getAvatar = (identifier = Math.random().toString()) => {
  // Styles you can use: 'avataaars', 'adventurer', 'micah', 'fun-emoji'
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(identifier)}`;
};

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-black text-slate-800 case tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Icon className="text-blue-500" size={16} /> {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value }) => (
    <div>
      <p className="text-[10px] font-black case tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value || 'N/A'}</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="relative z-10 w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl shrink-0 bg-slate-800">
          <img src={getAvatar(profileData.gender)} alt="Profile" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-10 text-center md:text-left flex-1">
          <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-black case tracking-widest rounded-lg mb-3 border border-blue-500/20">
            {profileData.admission_type} Student
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
            {profileData.full_name}
          </h2>
          <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
            <FiAward className="text-blue-400" /> {profileData.roll_number} • {profileData.enrollment_number}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Details */}
        <Section title="Academic Profile" icon={FiBook}>
          <Field label="School" value={profileData.school_name} />
          <Field label="Department" value={profileData.department_name} />
          <Field label="Programme" value={profileData.programme_name} />
          <Field label="Specialization" value={profileData.specialization_name} />
          <Field label="Batch / Year" value={profileData.admission_year} />
          <Field label="Section" value={profileData.section} />
        </Section>

        {/* Personal Details */}
        <Section title="Personal Information" icon={FiUser}>
          <Field label="Gender" value={profileData.gender} />
          <Field label="Date of Birth" value={profileData.dob} />
          <Field label="Category" value={profileData.category} />
          <Field label="Domicile" value={profileData.domicile} />
          <Field label="Father's Name" value={profileData.father_name} />
          <Field label="Mother's Name" value={profileData.mother_name} />
        </Section>

        {/* Contact & Accommodation */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Contact Details" icon={FiPhone}>
            <Field label="Email Address" value={profileData.email} />
            <Field label="Mobile Number" value={profileData.mobile_number} />
            <div className="md:col-span-2">
              <Field label="Permanent Address" value={profileData.permanent_address} />
            </div>
          </Section>

          <Section title="Accommodation" icon={FiHome}>
            <Field label="Hosteller Status" value={profileData.is_hosteller ? 'Yes - Hosteller' : 'Day Scholar'} />
            {profileData.is_hosteller && (
              <>
                <Field label="Hostel Name" value={profileData.hostel_name} />
                <Field label="Room Number" value={profileData.hostel_room} />
              </>
            )}
          </Section>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfile;