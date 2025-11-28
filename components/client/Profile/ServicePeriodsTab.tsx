import React, { useState, useEffect } from "react";
import { 
  addServiceHistoryItem, 
  getServiceHistory, 
  updateServiceHistoryItem,
  deleteServiceHistoryItem
} from "@/app/actions/clients/client-core";
import ServicePeriodModal, { ServicePeriodFormValues, ServicePeriod } from "./ServicePeriodModal";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import {
  getAssignmentPeriodStatus
} from "@/utils/nurseAssignmentUtils";
import { getServiceLabel } from "@/utils/formatters";
import { serviceOptions } from "@/utils/constants";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const calculateDaysBetween = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.round((endDate.getTime() - startDate.getTime()) / oneDay);
};

interface BackendServicePeriod {
  id: string;
  start_date: string;
  end_date: string;
  note?: string;
  service_required?: string;
}

const mapBackendPeriod = (item: BackendServicePeriod): ServicePeriod => ({
  id: item.id,
  startDate: item.start_date,
  endDate: item.end_date,
  notes: item.note,
  status: new Date(item.end_date) < new Date() ? "completed" : "active",
  serviceRequired: item.service_required,
});


const ServicePeriodsTab: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [servicePeriods, setServicePeriods] = useState<ServicePeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<ServicePeriod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPeriods = async () => {
    setLoading(true);
    const result = await getServiceHistory(clientId);
    if (result.success) {
      setServicePeriods((result.data || []).map(mapBackendPeriod));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleOpenAdd = () => {
    setEditingPeriod(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (period: ServicePeriod) => {
    setEditingPeriod(period);
    setIsModalOpen(true);
  };

  const handleSave = async (data: ServicePeriodFormValues) => {
    setIsSubmitting(true);
    
    let result;
    if (editingPeriod) {
      result = await updateServiceHistoryItem(clientId, editingPeriod.id, {
        start_date: data.startDate,
        end_date: data.endDate,
        note: data.notes,
        service_required: data.serviceRequired,
      });
    } else {
      result = await addServiceHistoryItem(clientId, {
        start_date: data.startDate,
        end_date: data.endDate,
        note: data.notes,
        service_required: data.serviceRequired,
      });
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      fetchPeriods();
    } else {
      toast.error(result.error || "Failed to save service period.");
    }
  };

  const handleEndPeriod = (period: ServicePeriod) => {
    setEditingPeriod({
      ...period,
      endDate: new Date().toISOString().slice(0, 10),
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteServiceHistoryItem(deleteId);
    setDeleteId(null);
    if (!result.success) {
      toast.error(result.error || "Failed to delete service period.");
    }
    fetchPeriods();
  };

  return (
    <div className="w-full p-0">
      <div className="flex justify-between items-center mb-6 w-full">
        <h2 className="text-lg font-semibold text-gray-800">Service Periods</h2>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm"
        >
          + Add Period
        </button>
      </div>

      <div className="space-y-3 w-full">
        {loading ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg w-full">
            Loading service periods...
          </div>
        ) : (
          servicePeriods.map((assignment) => {
            const displayStatus = assignment.status;

            const statusColors = {
              active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              completed: 'bg-gray-50 text-gray-600 border-gray-200',
              cancelled: 'bg-red-50 text-red-700 border-red-200',
            };

            // Use getAssignmentPeriodStatus for progress
            const { daysCompleted, daysRemaining, totalDays } = getAssignmentPeriodStatus(
              assignment.startDate,
              assignment.endDate
            );

            return (
              <div
                key={assignment.id}
                className="w-full bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {formatDate(assignment.startDate)} <span className="text-gray-400 mx-1">to</span> {formatDate(assignment.endDate)}
                      </h3>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-md border capitalize ${statusColors[displayStatus]}`}>
                    {displayStatus}
                  </span>
                </div>

                <div className="px-4 pb-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-3 text-sm">
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-gray-500">Progress:</span>
                      <span className="ml-2 text-gray-900">
                        <span className="ml-2 text-xs text-gray-500">
                          (
                            {daysCompleted} completed
                            {daysRemaining > 0 && `, ${daysRemaining} remaining`}
                            , {totalDays} total
                          )
                        </span>
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-gray-500">Notes:</span>
                      <span className="ml-2 text-gray-900">
                        {assignment.notes || <span className="text-gray-400 italic">No notes</span>}
                      </span>
                    </div>

                    {assignment.serviceRequired && (
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-gray-500">Service Required:</span>
                        <span className="ml-2 text-gray-900">{getServiceLabel(serviceOptions, assignment.serviceRequired)}</span>
                      </div>
                    )}

                    <div className="col-span-2 mt-1">
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 text-gray-900">
                        {calculateDaysBetween(assignment.startDate, assignment.endDate)} Total Days
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                    {displayStatus === 'active' && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(assignment)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleEndPeriod(assignment)}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          End
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setDeleteId(assignment.id)}
                      className="text-sm text-gray-500 hover:text-red-600 font-medium ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {!loading && servicePeriods.length === 0 && (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg w-full">
            No service periods found
          </div>
        )}
      </div>

      <ServicePeriodModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingPeriod}
        isSubmitting={isSubmitting}
      />

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        variant="delete"
        title="Delete Service Period"
        description="Are you sure you want to delete this service period? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ServicePeriodsTab;