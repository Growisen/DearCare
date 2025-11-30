'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Mail, Phone, MapPin, Stethoscope, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { createServiceEnquiry } from '@/app/actions/enquiry/enquiry-actions'; 

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  service: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  service?: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    service: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const serviceOptions: string[] = [
    '24/7 Patient & Elderly Care',
    'Postnatal Mother & Baby Care',
    'Nursing Assistants & Care Givers',
    'ICU Setup at Home',
    'Doctor Consultation at Home',
    'Physiotherapy at Home',
    'Day-duty Patient Care at Home',
    'Daily Living Assistance',
    'Home Nursing Support',
    'Bedridden Support',
    'Medical Equipment Delivery, Purchase & Rental',
    'Diagnostics Services at Home',
    'Hospital Bystander Services'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Please enter a valid full name';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number (minimum 10 digits)';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    } else if (formData.location.trim().length < 3) {
      errors.location = 'Please enter a valid location';
    }
    
    if (!formData.service) {
      errors.service = 'Please select a service';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null); 

    try {
      const result = await createServiceEnquiry(formData);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setSubmitError(result.error || 'Failed to submit your request. Please try again.');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = (): void => {
    setIsSuccess(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      service: ''
    });
    setFormErrors({});
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9fa] via-[#faf8fc] to-[#f5f3f7] py-8 px-4 flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20px 20px, #004d6d 1px, transparent 0),
              radial-gradient(circle at 60px 60px, #9333ea 1px, transparent 0)
            `,
            backgroundSize: '80px 80px',
            backgroundPosition: '0 0, 40px 40px'
          }}
        />
        
        <div className="w-full max-w-4xl mx-auto relative z-10">
          <Card className="p-4 sm:p-6 mb-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-lg shadow-lg p-6 mb-2 border-b-4 border-dCblue flex items-center justify-between">
                <div className="flex items-center">
                <div className="flex items-center justify-center rounded-full p-3 mr-3 shadow-md bg-white border-2 border-dCblue">
                    <div className="relative w-12 h-12">
                    <Image
                        src="/DearCare.png"
                        alt="DearCare Logo"
                        fill
                        className="object-contain"
                    />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold">
                    <div className="flex items-center whitespace-nowrap">
                        <span className='text-dCblue'>Dear</span><span className='text-amber-500'>C</span><span className='text-dCblue'>are</span>
                    </div>
                    </h1>
                    <p className="text-sm text-gray-500">Healthcare & Caregiving Services</p>
                </div>
                </div>
                <div className="hidden sm:block">
                <p className="text-sm text-gray-600 font-medium">Client Support: <span className="text-blue-600">+91 9645400035</span></p>
                <p className="text-sm text-gray-600 mt-1">info@dearcare.in</p>
                </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-md bg-emerald-100 mb-6">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-4">Request Submitted Successfully</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
                Thank you for contacting DearCare. Your inquiry has been received and our healthcare professionals will contact you within 24 hours to discuss your requirements.
              </p>
              
              <div className="bg-blue-50/70 border border-blue-200/50 rounded-2xl p-4 mb-6 text-left backdrop-blur-sm">
                <p className="text-sm font-semibold text-slate-800 mb-2">Next Steps:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Our care coordinator will review your service requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>A qualified representative will contact you for consultation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>We will prepare a personalized care plan for your needs</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleStartOver}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4 flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20px 20px, #004d6d 1px, transparent 0),
            radial-gradient(circle at 60px 60px, #9333ea 1px, transparent 0)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: '0 0, 40px 40px'
        }}
      />
      
      <div className="w-full max-w-4xl mx-auto relative z-10">
        <Card className="p-4 sm:p-6 mb-4 backdrop-blur-sm">
                      <div className="bg-white rounded-t-lg shadow-lg p-6 mb-2 border-b-4 border-dCblue flex items-center justify-between">
                <div className="flex items-center">
                <div className="flex items-center justify-center rounded-full p-3 mr-3 shadow-md bg-white border-2 border-dCblue">
                    <div className="relative w-12 h-12">
                    <Image
                        src="/DearCare.png"
                        alt="DearCare Logo"
                        fill
                        className="object-contain"
                    />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold">
                    <div className="flex items-center whitespace-nowrap">
                        <span className='text-dCblue'>Dear</span><span className='text-amber-500'>C</span><span className='text-dCblue'>are</span>
                    </div>
                    </h1>
                    <p className="text-sm text-gray-500">Healthcare & Caregiving Services</p>
                </div>
                </div>
                <div className="hidden sm:block">
                <p className="text-sm text-gray-600 font-medium">Client Support: <span className="text-blue-600">+91 9645400035</span></p>
                <p className="text-sm text-gray-600 mt-1">info@dearcare.in</p>
                </div>
            </div>
        </Card>

        <Card className="overflow-hidden backdrop-blur-sm">
          <div className="border-b border-[#004d6d]/10 bg-gradient-to-r from-slate-50/80 to-blue-50/80 px-4 sm:px-6 py-4 backdrop-blur-sm">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800">Professional Care Service Request</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Please provide your details and service requirements. All fields marked with (*) are mandatory.
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-slate-800 mb-2" htmlFor="name">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    Full Name *
                  </div>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/70 backdrop-blur-sm ${
                    formErrors.name ? 'border-red-400 bg-red-50/70' : 'border-slate-300/50 hover:border-slate-400/50'
                  }`}
                  placeholder="Enter your full name"
                />
                {formErrors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-slate-800 mb-2" htmlFor="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-600" />
                    Email Address *
                  </div>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/70 backdrop-blur-sm ${
                    formErrors.email ? 'border-red-400 bg-red-50/70' : 'border-slate-300/50 hover:border-slate-400/50'
                  }`}
                  placeholder="Enter your email address"
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-slate-800 mb-2" htmlFor="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-600" />
                    Contact Number *
                  </div>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/70 backdrop-blur-sm ${
                    formErrors.phone ? 'border-red-400 bg-red-50/70' : 'border-slate-300/50 hover:border-slate-400/50'
                  }`}
                  placeholder="Enter your contact number"
                />
                {formErrors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.phone}
                  </p>
                )}
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-slate-800 mb-2" htmlFor="location">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    Service Location *
                  </div>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/70 backdrop-blur-sm ${
                    formErrors.location ? 'border-red-400 bg-red-50/70' : 'border-slate-300/50 hover:border-slate-400/50'
                  }`}
                  placeholder="Enter service location (city, area)"
                />
                {formErrors.location && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.location}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-800 mb-2" htmlFor="service">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-slate-600" />
                  Required Service *
                </div>
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                className={`w-full border rounded-md py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/70 backdrop-blur-sm ${
                  formErrors.service ? 'border-red-400 bg-red-50/70' : 'border-slate-300/50 hover:border-slate-400/50'
                }`}
              >
                <option value="">Please select the service you require</option>
                {serviceOptions.map((service, index) => (
                  <option key={index} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {formErrors.service && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formErrors.service}
                </p>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Request...
                  </div>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>

            {submitError && (
              <div className="mt-4 text-red-600 text-sm text-center">
                {submitError}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContactForm;