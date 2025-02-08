import { X } from "lucide-react"

interface ClientDetailsProps {
  client: {
    id: string
    name: string
    email: string
    phone: string
    service: string
    requestDate: string
    status: string
    // Additional details
    assignedNurse?: string
    nurseContact?: string
    shift?: string
    condition?: string
    description?: string
    medications?: string[]
    specialInstructions?: string
  }
  onClose: () => void
}

export function ClientDetailsOverlay({ client, onClose }: ClientDetailsProps) {
  const renderStatusSpecificContent = () => {
    switch (client.status) {
      case "approved":
        return (
          <>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Care Assignment</h3>
                <button className="px-3 py-1.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-sm">
                  Update Assignment
                </button>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned Nurse</dt>
                  <dd className="text-sm text-gray-900">{client.assignedNurse || 'Not assigned'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Shift</dt>
                  <dd className="text-sm text-gray-900">{client.shift || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Care Period</dt>
                  <dd className="text-sm text-gray-900">Not specified</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Next Review</dt>
                  <dd className="text-sm text-gray-900">Not scheduled</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Care Details</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 text-sm">
                    Edit Details
                  </button>
                  <button className="px-3 py-1.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm">
                    End Care
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Medical Condition</h4>
                  <p className="text-sm text-gray-600">{client.condition}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Medications</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {client.medications?.map((med, index) => (
                      <li key={index}>{med}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Care Instructions</h4>
                  <p className="text-sm text-gray-600">{client.specialInstructions}</p>
                </div>
              </div>
            </div>
          </>
        );

      case "under_review":
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Review Checklist</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-gray-700">Verify medical documents</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-gray-700">Check care requirements</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-gray-700">Assess nurse availability</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-gray-700">Verify payment details</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Care Plan Draft</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recommended Nurse
                    </label>
                    <select className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select nurse...</option>
                      <option value="mary">Mary Johnson</option>
                      <option value="john">John Smith</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proposed Shift
                    </label>
                    <select className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select shift...</option>
                      <option value="morning">Morning (8 AM - 4 PM)</option>
                      <option value="evening">Evening (4 PM - 12 AM)</option>
                    </select>
                  </div>
                </div>
                <textarea
                  placeholder="Add care notes..."
                  className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] placeholder:text-gray-500"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Approve & Assign
              </button>
              <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                Reject
              </button>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Initial Assessment</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Actions
                  </label>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                      Request Medical Records
                    </button>
                    <button className="px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                      Schedule Call
                    </button>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Start Review Process
                </button>
              </div>
            </div>
          </div>
        );

      case "rejected":
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rejection Record</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason
                  </label>
                  <select className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select reason...</option>
                    <option value="docs">Insufficient documentation</option>
                    <option value="area">Service unavailable in area</option>
                    <option value="medical">Medical criteria not met</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <textarea
                  placeholder="Add detailed notes..."
                  className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] placeholder:text-gray-500"
                ></textarea>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send Rejection Notice
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
            <p className="text-sm text-gray-500">ID: {client.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          {/* Client Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{client.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Service</dt>
                <dd className="text-sm text-gray-900">{client.service}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                <dd className="text-sm text-gray-900">{client.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                <dd className="text-sm text-gray-900">{client.phone}</dd>
              </div>
            </dl>
          </div>

          {/* Status-specific content with admin actions */}
          {renderStatusSpecificContent()}
        </div>
      </div>
    </div>
  );
}
