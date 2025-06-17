import React, { memo } from "react"
import { Eye, UserCircle2, CheckCircle, Calendar, BadgeCheck, User } from "lucide-react"
import { Staff, StaffRole } from "@/types/dearCareStaff.types"

type StaffTableProps = {
  staff: Staff[]
  onReviewDetails: (staff: Staff) => void
}

const StaffTableRow = memo(({ staff, onReviewDetails, roleColors, roleIcons }: { 
  staff: Staff, 
  onReviewDetails: (staff: Staff) => void,
  roleColors: Record<string, string>,
  roleIcons: Record<string, React.FC<{ className?: string }>>
}) => {
  const role = staff.role as StaffRole;
  const RoleIcon = roleIcons[role] || User;
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-6 text-gray-800 font-medium">{staff.name}</td>
      <td className="py-4 px-6 text-gray-600">{staff.organization}</td>
      <td className="py-4 px-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-800 font-medium ${roleColors[role]}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      </td>
      <td className="py-4 px-6">
        <div>
          <div className="text-gray-800">{staff.email}</div>
          <div className="text-gray-500">{staff.phone}</div>
        </div>
      </td>
      <td className="py-4 px-6">
        <button 
          className="px-3.5 py-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium inline-flex items-center gap-1.5"
          onClick={() => onReviewDetails(staff)}
          aria-label={`Review details for ${staff.name}`}
        >
          <Eye className="h-4 w-4" />
          Review Details
        </button>
      </td>
    </tr>
  );
});
StaffTableRow.displayName = 'StaffTableRow';

const StaffMobileCard = memo(({ staff, onReviewDetails, roleColors, roleIcons }: {
  staff: Staff, 
  onReviewDetails: (staff: Staff) => void,
  roleColors: Record<string, string>,
  roleIcons: Record<string, React.FC<{ className?: string }>>
}) => {
  const role = staff.role as StaffRole;
  const RoleIcon = roleIcons[role] || User;
  
  return (
    <div className="p-5 space-y-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{staff.name}</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${roleColors[role]}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm bg-white border border-gray-200 p-3 rounded-lg">
        <p className="text-gray-500">Organization:</p>
        <p className="text-gray-800 font-medium">{staff.organization}</p>
        <p className="text-gray-500">Email:</p>
        <p className="text-gray-800 break-all">{staff.email}</p>
        <p className="text-gray-500">Phone:</p>
        <p className="text-gray-800">{staff.phone}</p>
      </div>
      
      <button 
        className="w-full px-4 py-2.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
        onClick={() => onReviewDetails(staff)}
        aria-label={`Review details for ${staff.name}`}
      >
        <Eye className="h-4 w-4" />
        Review Details
      </button>
    </div>
  );
});
StaffMobileCard.displayName = 'StaffMobileCard';

export const StaffTable = memo(function StaffTable({ staff, onReviewDetails }: StaffTableProps) {
  const roleColors: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700 border border-purple-200",
    manager: "bg-blue-50 text-blue-700 border border-blue-200",
    caregiver: "bg-green-50 text-green-700 border border-green-200",
    nurse: "bg-teal-50 text-teal-700 border border-teal-200",
    all: "bg-gray-50 text-gray-600 border border-gray-200",
    default: "bg-gray-50 text-gray-800 border border-gray-300"
  }

  const roleIcons: Record<string, React.FC<{ className?: string }>> = {
    admin: UserCircle2,
    manager: BadgeCheck,
    caregiver: CheckCircle,
    nurse: Calendar,
    all: UserCircle2,
    default: User
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr className="text-left">
              <th className="py-4 px-6 font-medium text-gray-700">Staff Name</th>
              <th className="py-4 px-6 font-medium text-gray-700">Organization</th>
              <th className="py-4 px-6 font-medium text-gray-700">Role</th>
              <th className="py-4 px-6 font-medium text-gray-700">Contact</th>
              <th className="py-4 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {staff.length > 0 ? (
              staff.map((member) => (
                <StaffTableRow 
                  key={member.id} 
                  staff={member}
                  onReviewDetails={onReviewDetails}
                  roleColors={roleColors}
                  roleIcons={roleIcons}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No staff members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden bg-white">
        {staff.length > 0 ? (
          staff.map((member) => (
            <StaffMobileCard
              key={member.id}
              staff={member}
              onReviewDetails={onReviewDetails}
              roleColors={roleColors}
              roleIcons={roleIcons}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No staff members found
          </div>
        )}
      </div>
    </div>
  )
});