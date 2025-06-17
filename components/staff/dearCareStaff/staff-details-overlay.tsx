import React, { useState } from "react";
import { XIcon, Mail, Phone, Calendar, User, Trash2, Edit, Save, X, Building, IdCard } from "lucide-react";
import { Staff, StaffRole } from "@/types/dearCareStaff.types";
import { deleteStaff, updateStaff } from "@/app/actions/staff-actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  useNameValidation,
  useEmailValidation,
  usePhoneValidation,
  useAddressValidation
} from "@/hooks/useValidation";

type StaffDetailsOverlayProps = {
  staff: Staff;
  onClose: () => void;
  onUpdate?: () => void;
};

export function StaffDetailsOverlay({ staff, onClose, onUpdate }: StaffDetailsOverlayProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updatedStaff, setUpdatedStaff] = useState<Staff>(staff);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const nameValidation = useNameValidation(staff.name);
  const emailValidation = useEmailValidation(staff.email);
  const phoneValidation = usePhoneValidation(staff.phone);
  const addressValidation = useAddressValidation(staff.address);

  const [role, setRole] = useState(staff.role);
  const [roleError, setRoleError] = useState<string>("");
  const [joinDate, setJoinDate] = useState(staff.joinDate);
  const [joinDateError, setJoinDateError] = useState<string>("");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "name") {
      nameValidation.setName(value);
      if (nameValidation.nameError) nameValidation.setNameError("");
    } else if (name === "email") {
      emailValidation.setEmail(value);
      if (emailValidation.emailError) emailValidation.setEmailError("");
    } else if (name === "phone") {
      phoneValidation.setPhone(value);
      if (phoneValidation.phoneError) phoneValidation.setPhoneError("");
    } else if (name === "role") {
      setRole(value);
      if (roleError) setRoleError("");
    } else if (name === "joinDate") {
      setJoinDate(value);
      if (joinDateError) setJoinDateError("");
    } else if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      if (addressField === "line1") addressValidation.setLine1(value);
      else if (addressField === "line2") addressValidation.setLine2(value);
      else if (addressField === "city") addressValidation.setCity(value);
      else if (addressField === "district") addressValidation.setDistrict(value);
      else if (addressField === "state") addressValidation.setState(value);
      else if (addressField === "pincode") addressValidation.setPincode(value);
    }
  };

  const validateForm = () => {
    let valid = true;
    if (!nameValidation.checkNameValidity()) valid = false;
    if (!emailValidation.checkEmailValidity()) valid = false;
    if (!phoneValidation.checkPhoneValidity()) valid = false;
    if (!role.trim()) {
      setRoleError("Role is required");
      valid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(role)) {
      setRoleError("Role should contain only letters and spaces");
      valid = false;
    }
    if (!joinDate) {
      setJoinDateError("Join date is required");
      valid = false;
    } else {
      setJoinDateError("");
    }
    if (!addressValidation.validateAddress()) valid = false;
    return valid;
  };

  const handleDeleteStaff = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const result = await deleteStaff(staff.id);
      
      if (!result.success) {
        setError(result.error || "Failed to delete staff member");
        return;
      }
      
      toast.success("Staff member deleted successfully");
      
      onClose();
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (err) {
      console.error("Error deleting staff:", err);
      setError("An unexpected error occurred while deleting staff");
    } finally {
      setIsSubmitting(false);
      setIsDeleting(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await updateStaff({
        id: staff.id,
        name: nameValidation.name,
        email: emailValidation.email,
        phone: phoneValidation.phone,
        role: role as StaffRole,
        joinDate,
        addressLine1: addressValidation.line1,
        addressLine2: addressValidation.line2,
        city: addressValidation.city,
        district: addressValidation.district,
        state: addressValidation.state,
        pincode: addressValidation.pincode,
      });

      if (!result.success) {
        setError(result.error || "Failed to update staff member");
        return;
      }

      toast.success("Staff member updated successfully");
      onClose();
      setIsEditing(false);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (err) {
      console.error("Error updating staff:", err);
      setError("An unexpected error occurred while updating staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Staff Details</h2>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setIsDeleting(true)}
                  className="px-3 py-1 flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdateStaff}
                  disabled={isSubmitting}
                  className="px-3 py-1 flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setUpdatedStaff(staff);
                  }}
                  className="px-3 py-1 flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 mx-6 mt-4 rounded-md">
            {error}
          </div>
        )}
        
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4">
                {isEditing ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={nameValidation.name}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        nameValidation.nameError ? "border-red-500" : "border-gray-300"
                      } rounded-md text-gray-800 font-medium`}
                    />
                    {nameValidation.nameError && (
                      <p className="mt-1 text-sm text-red-600">{nameValidation.nameError}</p>
                    )}
                  </div>
                ) : (
                  <h3 className="text-lg font-semibold text-gray-800">{staff.name}</h3>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Role</p>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          name="role"
                          value={role}
                          onChange={handleInputChange}
                          className={`w-full p-1 text-sm border ${
                            roleError ? "border-red-500" : "border-gray-300"
                          } rounded-md text-gray-800 font-medium`}
                        />
                        {roleError && (
                          <p className="mt-1 text-sm text-red-600">{roleError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}</p>
                    )}
                  </div>
                </div>
                
                {/* Add Organization field - read-only */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Building className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Organization</p>
                    <p className="text-sm font-medium text-gray-800">
                      {staff.organization || "Not available"}
                    </p>
                  </div>
                </div>
                
                {/* Add Registration Number field - read-only */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <IdCard className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Registration Number</p>
                    <p className="text-sm font-medium text-gray-800">
                      {staff.registrationNumber || "Not available"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    {isEditing ? (
                      <div>
                        <input
                          type="email"
                          name="email"
                          value={emailValidation.email}
                          onChange={handleInputChange}
                          className={`w-full p-1 text-sm border ${
                            emailValidation.emailError ? "border-red-500" : "border-gray-300"
                          } rounded-md text-gray-800 font-medium`}
                        />
                        {emailValidation.emailError && (
                          <p className="mt-1 text-sm text-red-600">{emailValidation.emailError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{staff.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Phone className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Phone</p>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          name="phone"
                          value={phoneValidation.phone}
                          onChange={handleInputChange}
                          className={`w-full p-1 text-sm border ${
                            phoneValidation.phoneError ? "border-red-500" : "border-gray-300"
                          } rounded-md text-gray-800 font-medium`}
                          maxLength={10}
                        />
                        {phoneValidation.phoneError && (
                          <p className="mt-1 text-sm text-red-600">{phoneValidation.phoneError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{staff.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Join Date</p>
                    {isEditing ? (
                      <div>
                        <input
                          type="date"
                          name="joinDate"
                          value={joinDate}
                          onChange={handleInputChange}
                          className={`w-full p-1 text-sm border ${
                            joinDateError ? "border-red-500" : "border-gray-300"
                          } rounded-md text-gray-800 font-medium`}
                        />
                        {joinDateError && (
                          <p className="mt-1 text-sm text-red-600">{joinDateError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{formatDate(staff.joinDate)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Address Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        name="address.line1"
                        value={addressValidation.line1}
                        onChange={handleInputChange}
                        className={`w-full p-1 text-sm border ${
                          addressValidation.line1Error ? "border-red-500" : "border-gray-300"
                        } rounded-md text-gray-800 font-medium`}
                      />
                      {addressValidation.line1Error && (
                        <p className="mt-1 text-sm text-red-600">{addressValidation.line1Error}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        name="address.line2"
                        value={addressValidation.line2}
                        onChange={handleInputChange}
                        className="w-full p-1 text-sm border border-gray-300 rounded-md text-gray-800 font-medium"
                      />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={addressValidation.city}
                        onChange={handleInputChange}
                        className={`w-full p-1 text-sm border ${
                          addressValidation.cityError ? "border-red-500" : "border-gray-300"
                        } rounded-md text-gray-800 font-medium`}
                      />
                      {addressValidation.cityError && (
                        <p className="mt-1 text-sm text-red-600">{addressValidation.cityError}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
                      <input
                        type="text"
                        name="address.district"
                        value={addressValidation.district}
                        onChange={handleInputChange}
                        className={`w-full p-1 text-sm border ${
                          addressValidation.districtError ? "border-red-500" : "border-gray-300"
                        } rounded-md text-gray-800 font-medium`}
                      />
                      {addressValidation.districtError && (
                        <p className="mt-1 text-sm text-red-600">{addressValidation.districtError}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                      <input
                        type="text"
                        name="address.state"
                        value={addressValidation.state}
                        onChange={handleInputChange}
                        className={`w-full p-1 text-sm border ${
                          addressValidation.stateError ? "border-red-500" : "border-gray-300"
                        } rounded-md text-gray-800 font-medium`}
                      />
                      {addressValidation.stateError && (
                        <p className="mt-1 text-sm text-red-600">{addressValidation.stateError}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <label className="block text-xs font-medium text-gray-500 mb-1">PIN Code</label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={addressValidation.pincode}
                        onChange={handleInputChange}
                        className={`w-full p-1 text-sm border ${
                          addressValidation.pincodeError ? "border-red-500" : "border-gray-300"
                        } rounded-md text-gray-800 font-medium`}
                        maxLength={6}
                      />
                      {addressValidation.pincodeError && (
                        <p className="mt-1 text-sm text-red-600">{addressValidation.pincodeError}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <DetailItem label="Address" value={`${staff.address?.line1} ${staff.address?.line2 || ''}`} />
                    <DetailItem label="City" value={staff.address?.city} />
                    <DetailItem label="District" value={staff.address?.district} />
                    <DetailItem label="State" value={staff.address?.state} />
                    <DetailItem label="PIN Code" value={staff.address?.pincode} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDeleting && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete {staff.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ 
  label, 
  value
}: { 
  label: string; 
  value: string | number | boolean | null | undefined;
}) {
  const displayValue = value === null || value === undefined || value === '' 
    ? 'Not provided' 
    : value.toString();
  
  return (
    <div className="bg-gray-50 p-3 rounded-md h-full">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-sm ${value === null || value === undefined || value === '' ? 'text-gray-500 italic' : 'text-gray-800'} break-words mt-1`}>
        {displayValue}
      </p>
    </div>
  );
}