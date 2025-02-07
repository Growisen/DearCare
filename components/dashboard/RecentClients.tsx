import { Card } from "../ui/card"
import { Users, Search, Download, MoreVertical } from "lucide-react"
import { useState } from "react"

const recentClients = [
  { name: "John Doe", email: "john@example.com", phone: "123-456-7890", location: "California", status: "Waiting", added: "2 days ago" },
  { name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210", location: "New York", status: "Assigned", added: "3 days ago" },
  { name: "Michael Johnson", email: "michael@example.com", phone: "456-789-0123", location: "Texas", status: "Assigned", added: "5 days ago" },
  { name: "Sarah Wilson", email: "sarah@example.com", phone: "789-123-4560", location: "Florida", status: "Waiting", added: "6 days ago" },
  { name: "Robert Brown", email: "robert@example.com", phone: "321-654-0987", location: "Arizona", status: "Assigned", added: "1 week ago" },
];

export default function RecentClients() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '', status: 'Waiting' });

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Add logic to handle new client submission
    setShowForm(false);
    setFormData({ name: '', email: '', phone: '', location: '', status: 'Waiting' });
  };

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm border-0">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-md font-semibold text-gray-800">Recent Clients</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative w-full sm:w-48 md:w-64">
            <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 w-full"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <Users className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Add New Client</h4>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['name', 'email', 'phone', 'location'] as Array<keyof typeof formData>).map((field) => (
              <div key={field} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Waiting">Waiting</option>
                <option value="Assigned">Assigned</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              {['Name', 'Email', 'Phone', 'Location', 'Status', 'Added', ''].map((header) => (
                <th key={header} className="py-3 px-4 text-sm font-semibold text-gray-600">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentClients.map((client, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{client.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{client.email}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{client.phone}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{client.location}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    client.status === 'Assigned' 
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{client.added}</td>
                <td className="py-3 px-4">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-4">
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">View More</button>
      </div>
    </Card>
  )
}