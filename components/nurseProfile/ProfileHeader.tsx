import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Pencil, 
  Trash2, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Banknote, 
  User,
  Clock,
  Hash,
  FileClock,
  History
} from 'lucide-react';
import { SimplifiedNurseDetails } from '@/app/actions/staff-management/add-nurse';
import { getExperienceFromJoiningDate } from '@/utils/dateUtils';
import { formatOrganizationName } from '@/utils/formatters';
import { format, isValid } from 'date-fns';

interface ProfileHeaderProps {
  nurse: SimplifiedNurseDetails;
  onDelete: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ nurse, onDelete }) => {
  const basicInfo = nurse.basic;
  const documentsInfo = nurse.documents;

  const StatItem = ({ 
    icon: Icon, 
    label, 
    value, 
    theme = "gray" 
  }: { 
    icon: React.ElementType, 
    label: string, 
    value: string, 
    theme?: "emerald" | "violet" | "rose" | "blue" | "gray" | "amber" | "cyan"
  }) => {
    const themeStyles = {
      gray: "bg-gray-50 border-slate-200 text-gray-900 icon-gray-400",
      emerald: "bg-emerald-50 border-emerald-100 text-emerald-800 icon-emerald-500",
      violet: "bg-violet-50 border-violet-100 text-violet-800 icon-violet-500",
      rose: "bg-rose-50 border-rose-100 text-rose-800 icon-rose-500",
      blue: "bg-blue-50 border-blue-100 text-blue-800 icon-blue-500",
      amber: "bg-amber-50 border-amber-100 text-amber-800 icon-amber-500",
      cyan: "bg-cyan-50 border-cyan-100 text-cyan-800 icon-cyan-500",
    };

    const currentTheme = themeStyles[theme];

    return (
      <div className={`flex flex-col p-3 rounded-sm border shadow-none transition-all duration-200 hover:shadow-md ${currentTheme.split(' ').slice(0, 2).join(' ')}`}>
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1 flex items-center gap-1.5 opacity-80">
          <Icon className={`w-3.5 h-3.5 ${theme === 'gray' ? 'text-gray-400' : currentTheme.match(/icon-(\w+-\d+)/)?.[0]}`} />
          {label}
        </span>
        <span className={`text-sm font-bold truncate ${currentTheme.split(' ')[2]}`}>{value}</span>
      </div>
    );
  };

  return (
    <div className="bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-50 via-white to-white border border-slate-200 shadow-none rounded-t-lg overflow-hidden font-sans">
      <div className="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-gray-50/80 to-white backdrop-blur-sm">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          Profile
        </h2>
        <div className="flex gap-2">
          <Link 
            href={`/nurses/${basicInfo.nurse_id}/edit`}
            prefetch={false}
            className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 text-xs font-semibold rounded-sm transition-all shadow-none hover:shadow"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Link>
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 hover:border-red-300 text-gray-600 hover:text-red-600 text-xs font-semibold rounded-sm transition-all shadow-none hover:shadow"
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-shrink-0">
            <div className="relative h-36 w-36 rounded-sm overflow-hidden border-[4px] border-white shadow-none ring-1 ring-gray-200/60">
              {documentsInfo.profile_image ? (
                <Image 
                  src={documentsInfo.profile_image}
                  alt={`${basicInfo.first_name} ${basicInfo.last_name}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="144px"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-slate-400">
                  <User className="w-12 h-12 mb-1 opacity-50" />
                  <span className="text-[10px] font-bold uppercase opacity-40">No Photo</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pt-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-3">
                  {basicInfo.first_name} {basicInfo.last_name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                    {basicInfo.category || 'Uncategorized'}
                  </span>
                  
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    <Clock className="w-3 h-3 mr-1" />
                    {basicInfo.experience || 0} Years Exp.
                  </span>

                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${
                    basicInfo.status === 'assigned' 
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                      : 'bg-slate-50 text-slate-600 ring-slate-500/10'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      basicInfo.status === 'assigned' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                    <span className="capitalize">{basicInfo.status}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-5 pb-5 border-b border-dashed border-slate-200">
              {basicInfo.nurse_reg_no && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-orange-50 border border-orange-100 text-orange-800 text-xs font-medium">
                  <Hash className="w-3.5 h-3.5 text-orange-500" />
                  Reg No: <span className="font-bold">{basicInfo.nurse_reg_no}</span>
                </div>
              )}
              
              {basicInfo.nurse_prev_reg_no && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-50 border border-slate-100 text-slate-600 text-xs font-medium">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Prev Reg No: <span className="font-semibold">{basicInfo.nurse_prev_reg_no}</span>
                </div>
              )}

              {basicInfo.created_at && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-medium ml-auto">
                  <FileClock className="w-3.5 h-3.5 text-cyan-500" />
                  Created: {isValid(new Date(basicInfo.created_at)) ? format(new Date(basicInfo.created_at), 'MMM dd, yyyy') : 'N/A'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatItem 
                icon={Banknote}
                label="Monthly Salary"
                value={basicInfo.salary_per_month ? `₹${basicInfo.salary_per_month.toLocaleString('en-IN')}` : 'N/A'}
                theme="gray"
              />
              
              <StatItem 
                icon={Calendar}
                label="Joining Date"
                value={isValid(new Date(basicInfo.joining_date || "")) 
                  ? format(new Date(basicInfo.joining_date || ""), 'MMM dd, yyyy') 
                  : 'N/A'}
                theme="gray"
              />

              <StatItem 
                icon={Briefcase}
                label={`Days at ${formatOrganizationName(basicInfo.admitted_type ?? '')}`}
                value={getExperienceFromJoiningDate(basicInfo.joining_date ?? '')}
                theme="gray"
              />

              <StatItem 
                icon={MapPin}
                label="Base Location"
                value={basicInfo.city || 'N/A'}
                theme="gray"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;