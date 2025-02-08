import { X } from "lucide-react"

interface AddClientProps {
  onClose: () => void
  onAdd: (client: { fullName: string; phoneNumber: string; emailAddress: string; serviceRequired: string; medicalCondition: string; careDescription: string }) => void
}

export function AddClientOverlay({ onClose, onAdd }: AddClientProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Required
                </label>
                <select className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select service...</option>
                  <option value="home_care">Home Care</option>
                  <option value="elder_care">Elder Care</option>
                  <option value="post_surgery">Post-Surgery Care</option>
                  <option value="physiotherapy">Physiotherapy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Condition
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter medical condition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Care Description
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                  placeholder="Describe care requirements..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const client = {
                  fullName: (document.querySelector('input[placeholder="Enter client name"]') as HTMLInputElement).value,
                  phoneNumber: (document.querySelector('input[placeholder="Enter phone number"]') as HTMLInputElement).value,
                  emailAddress: (document.querySelector('input[placeholder="Enter email address"]') as HTMLInputElement).value,
                  serviceRequired: (document.querySelector('select') as HTMLSelectElement).value,
                  medicalCondition: (document.querySelector('input[placeholder="Enter medical condition"]') as HTMLInputElement).value,
                  careDescription: (document.querySelector('textarea[placeholder="Describe care requirements..."]') as HTMLTextAreaElement).value,
                };
                onAdd(client);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Client
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
