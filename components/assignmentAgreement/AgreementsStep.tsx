import React from 'react';
import { FormStepProps } from '@/types/agreement.types';
import { AgreementSection } from './AgreementSection';

export const AgreementsStep: React.FC<FormStepProps> = ({
  formData,
  onFormChange,
  onBack,
  onSubmit
}) => {
  return (
    <div className="space-y-5">
      <AgreementSection
        title="Terms of Service"
        content={`• Perform all assigned tasks with honesty.
                  • Promise to notify the office two months prior to leaving the service.
                  • If you continue working at the same location without the office's permission after leaving the service, the office will take necessary action, and you will be liable to pay compensation.
                  • Don’t abandon your service at a working household without a valid reason.
                  • You are responsible for keeping your own valuables like money, clothing, jewelry, etc., under your own responsibility.
                  • If for any reason you discontinue the service within one month, you can collect the salary for the days worked only on the date you initially joined. Salary will not be paid at any other time during this period.
                  • You must inform the office about your experiences and work-related updates from your workplace at least once a month.
                  • In case of an emergency leave requirement, the reason must be communicated.
                  • Leave will only be granted after convincing the office to sanction the requested leave.
                  • Rejoin work on the exact date following the approved leave period. If leave needs to be extended, you must notify the office in advance. The salary payment date will change corresponding to the extension of the leave.
                  • If office authorities request you to return while you are working, you must report to the office immediately.
                  • Failure to report to the office will result in necessary action being taken, and salary will be withheld.
                  • You promise to obey and follow the instructions of the office authorities under all circumstances.
                  • Provide the patient with medicine and food at the scheduled times.
                  • Exercise care to ensure that no damages occur at the workplace due to your actions. If damages occur due to your negligence, you will be responsible for the losses.
                  • The costs for any legal proceedings will be recovered from the staff member.
                  • You must not engage in any kind of money transactions with the relatives or the family members of the household where you are employed.
                  • You may accept gifts if they are given voluntarily by the family members.
                  • The person in charge at the office is entitled to inspect your bag at any time during the period of service.`}
        checkboxName="agreedToTerms"
        checkboxLabel="I have read and agree to the Terms of Service *"
        isChecked={formData.agreedToTerms}
        onChange={onFormChange}
      />

      {/* <AgreementSection
        title="Privacy Policy"
        content="We collect information you provide directly to us, including name, email address, and phone number. 
          We use this information to provide, maintain, and improve our services. We may share your information 
          with third-party service providers who perform services on our behalf. We implement appropriate 
          technical and organizational measures to protect your personal data. You have the right to access, 
          correct, or delete your personal information at any time."
        checkboxName="agreedToPrivacy"
        checkboxLabel="I have read and agree to the Privacy Policy *"
        isChecked={formData.agreedToPrivacy}
        onChange={onFormChange}
      /> */}

      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-sm border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-900 shadow-none transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          className="inline-flex items-center justify-center rounded-sm bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-none transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          Submit
        </button>
      </div>
    </div>
  );
};