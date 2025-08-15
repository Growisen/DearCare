import React, { useState, useEffect } from "react";
import { useSaveClientPaymentGroup } from "@/hooks/useSaveClientPaymentGroup";
import Loader from '@/components/Loader';

interface LineItem {
  id: string;
  fieldName: string;
  amount: number;
}

interface EntryGroup {
  id: number;
  groupName: string;
  lineItems: LineItem[];
  dateAdded: string;
  notes?: string;
  showToClient: boolean;
}

interface FormLineItem {
  id: string;
  fieldName: string;
  amount: string;
}

interface DynamicFieldTrackerProps {
  clientId: string;
}

interface ApiLineItem {
  id: string;
  field_name: string;
  amount: number;
}

interface ApiEntryGroup {
  id: string;
  payment_group_name: string;
  lineItems: ApiLineItem[];
  date_added: string;
  notes?: string | null;
  show_to_client: boolean;
}


const DynamicFieldTracker: React.FC<DynamicFieldTrackerProps> = ({ clientId }) => {
  const { saveGroup, fetchGroups, loading, isSaving } = useSaveClientPaymentGroup();
  
  const [entries, setEntries] = useState<EntryGroup[]>([]);
  
  const [groupName, setGroupName] = useState("");
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    { id: `field-${Date.now()}`, fieldName: "", amount: "" },
  ]);
  const [groupNotes, setGroupNotes] = useState("");
  const [groupShowToClient, setGroupShowToClient] = useState(false);

  async function fetchData() {
    const apiEntries = await fetchGroups(clientId);

    const updatedEntries: EntryGroup[] = (apiEntries ?? []).map((group: ApiEntryGroup) => ({
      id: typeof group.id === "string" ? parseInt(group.id, 10) : group.id,
      groupName: group.payment_group_name,
      lineItems: group.lineItems.map((item: ApiLineItem) => ({
        id: item.id,
        fieldName: item.field_name,
        amount: item.amount,
      })),
      dateAdded: group.date_added,
      notes: group.notes ?? undefined,
      showToClient: group.show_to_client,
    }));
    setEntries(updatedEntries);
  }

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const resetForm = () => {
    setGroupName("");
    setLineItems([{ id: `field-${Date.now()}`, fieldName: "", amount: "" }]);
    setGroupNotes("");
    setGroupShowToClient(true);
  };

  const addLineItem = () => {
    const newItem: FormLineItem = { id: `field-${Date.now()}`, fieldName: "", amount: "" };
    setLineItems(prev => [...prev, newItem]);
  };

  const updateLineItem = (id: string, key: keyof FormLineItem, value: string) => {
    setLineItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    } else {
      alert("You must have at least one field.");
    }
  };

  const saveEntryGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a name for the entry group.");
      return;
    }

    const processedLineItems: { fieldName: string; amount: number }[] = [];
    for (const item of lineItems) {
      const amount = parseFloat(item.amount);
      if (!item.fieldName.trim() || !item.amount.trim() || isNaN(amount)) {
        alert("Please fill in all field names and provide valid amounts.");
        return;
      }
      processedLineItems.push({
        fieldName: item.fieldName.trim(),
        amount,
      });
    }

    const result = await saveGroup({
      clientId,
      groupName: groupName.trim(),
      lineItems: processedLineItems,
      dateAdded: new Date().toISOString(),
      notes: groupNotes.trim() || undefined,
      showToClient: groupShowToClient,
    });

    if (result.success) {
      fetchData();
      resetForm();
      alert("Entry group saved!");
    } else {
      alert(result.error || "Failed to save entry group.");
    }
  };

  const deleteEntryGroup = (id: number) => {
    if (window.confirm("Are you sure you want to delete this entire entry group?")) {
      setEntries(prev => prev.filter(group => group.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const totalAmount = entries.reduce((total, group) => {
    const groupTotal = group.lineItems.reduce((sum, item) => sum + item.amount, 0);
    return total + groupTotal;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      <div>
        <details className="bg-white rounded border border-gray-300 p-5 space-y-5">
          <summary className="font-medium text-gray-800 cursor-pointer hover:text-gray-600 transition-colors">Add New Payment</summary>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Monthly Expenses"
                className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
          </div>
          
          <div className="space-y-3 pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700">Fields & Amounts *</label>
            {lineItems.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={item.fieldName}
                  onChange={(e) => updateLineItem(item.id, 'fieldName', e.target.value)}
                  placeholder="Field name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updateLineItem(item.id, 'amount', e.target.value)}
                  placeholder="Amount (₹)"
                  className="w-40 px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <button
                  onClick={() => removeLineItem(item.id)}
                  className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={lineItems.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addLineItem}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-1 px-3 rounded transition-colors"
            >
              + Add Another Field
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={groupNotes}
                onChange={(e) => setGroupNotes(e.target.value)}
                placeholder="Add shared notes for all fields above..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Show to Client</label>
              <select
                value={groupShowToClient ? 'yes' : 'no'}
                onChange={(e) => setGroupShowToClient(e.target.value === 'yes')}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEntryGroup}
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </details>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader message="Loading data..."/>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-gray-50 rounded border border-gray-300 p-8 text-center text-gray-500">
          No entries yet. Use the form above to add the first one!
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-300 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-300">
            <h2 className="text-base font-semibold text-gray-900">All Entries ({entries.length})</h2>
          </div>
          
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group & Fields
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client Visible
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((group) => {
                  const groupTotal = group.lineItems.reduce((sum, item) => sum + item.amount, 0);
                  return (
                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="max-w-xs">
                          <div className="font-medium text-gray-900 mb-2">
                            {group.groupName}
                          </div>
                          <div className="space-y-1">
                            {group.lineItems.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-1 rounded">
                                <span className="text-gray-600 truncate mr-2">
                                  {item.fieldName}
                                </span>
                                <span className="text-gray-900 font-normal whitespace-nowrap">
                                  ₹{item.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <span className="font-normal text-gray-900">
                          ₹{groupTotal.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {formatDate(group.dateAdded)}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="max-w-xs">
                          {group.notes ? (
                            <span className="text-sm text-gray-600">{group.notes}</span>
                          ) : (
                            <span className="text-sm text-gray-400 italic">No notes</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          group.showToClient 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {group.showToClient ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <button 
                          onClick={() => deleteEntryGroup(group.id)} 
                          className="text-red-600 hover:text-red-900 text-sm font-medium hover:bg-red-50 px-3 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-gray-200">
            {entries.map((group) => {
              const groupTotal = group.lineItems.reduce((sum, item) => sum + item.amount, 0);
              return (
                <div key={group.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {group.groupName}
                    </h3>
                    <button 
                      onClick={() => deleteEntryGroup(group.id)} 
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-4 flex-shrink-0 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="text-xl font-bold text-gray-900 mb-4">
                    Total: ₹{groupTotal.toLocaleString()}
                  </div>
                  
                  <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded-lg">
                    {group.lineItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{item.fieldName}</span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Date Added:</span>
                      <div className="text-gray-600">{formatDate(group.dateAdded)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Client Visible:</span>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          group.showToClient 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {group.showToClient ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {group.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="font-medium text-gray-700 text-sm">Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{group.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{entries.length}</div>
            <div className="text-sm text-gray-600">Total Groups</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">₹{totalAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Amount</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ₹{entries.length > 0 ? Math.round(totalAmount / entries.length).toLocaleString() : 0}
            </div>
            <div className="text-sm text-gray-600">Avg. / Group</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {entries.filter(g => g.showToClient).length}
            </div>
            <div className="text-sm text-gray-600">Client Visible</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFieldTracker;