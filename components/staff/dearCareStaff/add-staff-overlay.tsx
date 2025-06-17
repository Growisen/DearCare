import React, { useState } from "react";
import { XIcon } from "lucide-react";
import { toast } from 'react-hot-toast';
import { StaffRole } from "@/types/dearCareStaff.types";
import { createStaff } from "@/app/actions/staff-actions";
import { ClientCategorySelector } from "@/components/add-client-overlay/ClientCategorySelector"; 
import { ClientCategory } from "@/types/client.types";
import {
  useNameValidation,
  useEmailValidation,
  usePhoneValidation,
  useAddressValidation
} from "@/hooks/useValidation";

type AddStaffOverlayProps = {
  onClose: () => void;
  onAdd: () => void;
};

export function AddStaffOverlay({ onClose, onAdd }: AddStaffOverlayProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameValidation = useNameValidation();
  const emailValidation = useEmailValidation();
  const phoneValidation = usePhoneValidation();
  const addressValidation = useAddressValidation();

  const [role, setRole] = useState("" as StaffRole);
  const [roleError, setRoleError] = useState<string>("");
  const [category, setCategory] = useState<ClientCategory>("DearCare LLP");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      setRole(value as StaffRole);
      if (roleError) setRoleError("");
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

  const handleCategoryChange = (selectedCategory: ClientCategory) => {
    setCategory(selectedCategory);
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
    if (!addressValidation.validateAddress()) valid = false;
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const staffData = {
        name: nameValidation.name,
        email: emailValidation.email,
        phone: phoneValidation.phone,
        role: role,
        department: "",
        joinDate: new Date().toISOString().split('T')[0],
        addressLine1: addressValidation.line1,
        addressLine2: addressValidation.line2,
        city: addressValidation.city,
        district: addressValidation.district,
        state: addressValidation.state,
        pincode: addressValidation.pincode,
        organization: category,
      };
      const result = await createStaff(staffData);
      if (result.success) {
        toast.success("Staff member has been added successfully.");
        onAdd();
      } else {
        toast.error(result.error || "Failed to add staff member");
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      toast.error("Failed to add staff member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add New Staff Member</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 mb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Organization</h3>
                <ClientCategorySelector
                  selectedCategory={category}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
              
              <div className="col-span-2">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={nameValidation.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md text-gray-900 ${
                        nameValidation.nameError ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      placeholder="Enter full name"
                    />
                    {nameValidation.nameError && (
                      <p className="mt-1 text-sm text-red-600">{nameValidation.nameError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={emailValidation.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md text-gray-900 ${
                        emailValidation.emailError ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      placeholder="Enter email address"
                    />
                    {emailValidation.emailError && (
                      <p className="mt-1 text-sm text-red-600">{emailValidation.emailError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phoneValidation.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md text-gray-900 ${
                        phoneValidation.phoneError ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                    {phoneValidation.phoneError && (
                      <p className="mt-1 text-sm text-red-600">{phoneValidation.phoneError}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Work Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={role}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md text-gray-900 ${
                        roleError ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      placeholder="Enter role"
                    />
                    {roleError && (
                      <p className="mt-1 text-sm text-red-600">{roleError}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Address Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="address.line1" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      id="address.line1"
                      name="address.line1"
                      value={addressValidation.line1}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md text-gray-900 ${
                        addressValidation.line1Error ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      placeholder="Enter street address"
                    />
                    {addressValidation.line1Error && (
                      <p className="mt-1 text-sm text-red-600">{addressValidation.line1Error}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="address.line2" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      id="address.line2"
                      name="address.line2"
                      value={addressValidation.line2}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter apartment, suite, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={addressValidation.city}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md text-gray-900 ${
                          addressValidation.cityError ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        placeholder="Enter city"
                      />
                      {addressValidation.cityError && (
                        <p className="mt-1 text-sm text-red-600">{addressValidation.cityError}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="address.district" className="block text-sm font-medium text-gray-700 mb-1">
                        District *
                      </label>
                      <input
                        type="text"
                        id="address.district"
                        name="address.district"
                        value={addressValidation.district}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md text-gray-900 ${
                          addressValidation.districtError ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        placeholder="Enter district"
                      />
                      {addressValidation.districtError && (
                        <p className="mt-1 text-sm text-red-600">{addressValidation.districtError}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={addressValidation.state}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md text-gray-900 ${
                          addressValidation.stateError ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        placeholder="Enter state"
                      />
                      {addressValidation.stateError && (
                        <p className="mt-1 text-sm text-red-600">{addressValidation.stateError}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        id="address.pincode"
                        name="address.pincode"
                        value={addressValidation.pincode}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md text-gray-900 ${
                          addressValidation.pincodeError ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        placeholder="Enter 6-digit PIN code"
                        maxLength={6}
                      />
                      {addressValidation.pincodeError && (
                        <p className="mt-1 text-sm text-red-600">{addressValidation.pincodeError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  "Add Staff Member"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}