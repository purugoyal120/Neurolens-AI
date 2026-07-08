import React, { useState } from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { UserPlus, MoreHorizontal, Mail, Shield } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const teamMembers = [
  { name: 'Puru Goyal', email: 'purugoyal20@gmail.com', role: 'Admin', profile: 'Deuteranopia', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Puru+Goyal&background=10b981&color=fff' },
  { name: 'Sarah Chen', email: 'sarah.c@company.com', role: 'Developer', profile: 'Protanopia', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=f43f5e&color=fff' },
  { name: 'Michael Rodriguez', email: 'm.rodriguez@company.com', role: 'Tester', profile: 'Tritanopia', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Michael+Rodriguez&background=3b82f6&color=fff' },
  { name: 'Emily Watson', email: 'emily.w@company.com', role: 'Designer', profile: 'Standard', status: 'Offline', avatar: 'https://ui-avatars.com/api/?name=Emily+Watson&background=f1f5f9&color=64748b' },
];

export const TeamPage: React.FC = () => {
  const { addToast } = useToast();
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = () => {
    setIsInviting(true);
    setTimeout(() => {
      setIsInviting(false);
      addToast('Invitation sent successfully!', 'success');
    }, 800);
  };

  const handleAction = () => {
    addToast('Action menu opened (Demo)', 'success');
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden pb-8">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-400/5 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
      
      <TopNav />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 max-w-6xl mx-auto w-full"
      >
        <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">Team Management</h1>
            <p className="text-slate-500 text-sm font-medium">Manage access and view active vision profiles across your organization.</p>
          </div>
          <button 
            onClick={handleInvite}
            disabled={isInviting}
            className="premium-btn px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> {isInviting ? 'Sending...' : 'Invite Member'}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 relative">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
          
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member</th>
                  <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Vision Profile</th>
                  <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 w-12 pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teamMembers.map((member, idx) => (
                  <tr key={idx} className="hover:bg-white/60 transition-all duration-300 group">
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
                          {member.status === 'Active' && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{member.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${
                        member.role === 'Admin' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {member.role === 'Admin' && <Shield className="w-3 h-3 text-emerald-400" />}
                        {member.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
                        member.profile !== 'Standard' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-slate-500 bg-slate-50 border border-slate-100'
                      }`}>
                        {member.profile}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <div className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-300'}`}></div>
                        {member.status}
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <button onClick={handleAction} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm hover:shadow transition-all ml-auto">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
