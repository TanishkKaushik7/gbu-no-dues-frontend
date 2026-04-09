import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, Code2, ArrowLeft, Award, Instagram, ExternalLink } from 'lucide-react';

export default function Developers() {
  const navigate = useNavigate();

  // Helper function to generate Gmail Web Link
  const getGmailWebLink = (email) => `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;

  const mentor = {
    name: "Dr. Arun Solanki",
    role: "Project Mentor",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arun",
    links: { 
      github: "#", 
      linkedin: "#", 
      mail: "arunsolanki@gbu.ac.in" 
    }
  };

  const team = [
    {
      name: "Aditya Kumar Srivastav",
      role: "Team Lead",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lead",
      links: { github: "#", linkedin: "#", mail: "aditya@example.com" }
    },
    {
      name: "Akshit Singh",
      role: "Full Stack Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=FS1",
      links: { 
        github: "https://github.com/akshit-singhh", 
        linkedin: "https://www.linkedin.com/in/akshit-singhh/", 
        instagram: "https://www.instagram.com/akshit.singhh/", 
        mail: "akshitsingh658@gmail.com" 
      }
    },
    {
      name: "Tanishk Kaushik",
      role: "Full Stack Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=FS2",
      links: { 
        github: "https://github.com/TanishkKaushik7", 
        linkedin: "https://www.linkedin.com/in/tanishk-kaushik-738870352", 
        instagram: "https://www.instagram.com/tanishk_kaushik0", 
        mail: "tanishkkaushik089@gmail.com" 
      }
    },
    {
      name: "Manas Jha",
      role: "Deployment & DevOps",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deploy",
      links: { github: "#", linkedin: "#", mail: "manas@example.com" }
    },
    {
      name: "Vernit Goyal",
      role: "Frontend Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Front",
      links: { github: "#", linkedin: "#", mail: "vernit@example.com" }
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 relative overflow-hidden font-sans selection:bg-cyan-500/30">
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}
      </style>

      {/* Modern Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Radial Fades */}
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-cyan-500 opacity-20 blur-[100px]"></div>
        <div className="absolute bottom-0 right-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-purple-600 opacity-10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors mb-16 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 hover:border-cyan-500/30 backdrop-blur-md w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Portal
        </button>

        {/* Header Section */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em]">Engineering Team</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500">
            The Architects
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
            Turning complex campus workflows into seamless digital experiences.
          </p>
        </div>

        {/* Mentor Section */}
        <div className="flex justify-center mb-32">
          <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-8 rounded-[2rem] relative group hover:border-cyan-500/40 transition-all duration-500 shadow-2xl hover:shadow-cyan-500/10 animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="absolute top-6 right-6">
              <Award className="text-cyan-400/50 w-6 h-6 group-hover:text-cyan-400 transition-colors" />
            </div>

            <div className="relative w-32 h-32 mb-6 mx-auto">
              <div className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
              <img src={mentor.image} alt={mentor.name} className="relative w-full h-full rounded-full border-2 border-slate-700 group-hover:border-cyan-400/50 object-cover p-1 transition-colors duration-500" />
            </div>

            <div className="text-center relative z-10">
              <h3 className="text-2xl font-bold mb-1 text-white">{mentor.name}</h3>
              <p className="text-cyan-400 text-xs font-bold mb-6 uppercase tracking-[0.2em]">{mentor.role}</p>
              
              <div className="flex justify-center gap-3">
                <a 
                  href={mentor.links.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-300 hover:-translate-y-1 text-slate-400"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href={getGmailWebLink(mentor.links.mail)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-300 hover:-translate-y-1 text-slate-400"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {team.map((member, idx) => (
            <div 
              key={idx} 
              className="group bg-slate-900/30 backdrop-blur-xl border border-slate-800 hover:border-slate-600 p-6 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-slate-800/40 flex flex-col items-center"
            >
              <div className="relative w-24 h-24 mb-5">
                <div className="absolute inset-0 bg-slate-400/10 rounded-full scale-110 group-hover:bg-cyan-500/20 transition-colors duration-500 blur-md"></div>
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="relative w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover border-2 border-slate-700 group-hover:border-cyan-500/50" 
                />
              </div>
              
              <div className="text-center flex-grow w-full">
                <h4 className="text-base font-bold mb-1 text-slate-200 group-hover:text-white transition-colors">{member.name}</h4>
                <p className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest mb-5 h-8 flex items-center justify-center leading-tight">
                  {member.role}
                </p>
                
                <div className="flex justify-center gap-4 pt-4 border-t border-slate-800 group-hover:border-slate-700 transition-colors">
                  <a href={member.links.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-all hover:scale-110">
                    <Github className="w-4 h-4" />
                  </a>
                  {member.links.linkedin && (
                    <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0A66C2] transition-all hover:scale-110">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.links.instagram && (
                    <a href={member.links.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#E1306C] transition-all hover:scale-110">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  <a 
                    href={getGmailWebLink(member.links.mail)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-red-400 transition-all hover:scale-110"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-32 text-center py-8 border-t border-slate-800/50">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2 font-medium">
            Built with <span className="text-red-500 animate-pulse">❤️</span> by the CCC Development Wing
          </p>
        </div>
      </div>
    </div>
  );
}