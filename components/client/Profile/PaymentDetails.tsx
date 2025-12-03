import React, { useState, useEffect } from "react";
import { useSaveClientPaymentGroup } from "@/hooks/useSaveClientPaymentGroup";
import Loader from '@/components/Loader';
import { deleteClientPaymentGroup, updateClientPaymentGroup } from "@/app/actions/clients/client-payment-records";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import ModalPortal from "@/components/ui/ModalPortal";
import PaymentEntryForm from "@/components/client/payment/PaymentEntryForm";
import EntriesTable from "@/components/client/payment/EntriesTable";
import EntriesMobileView from "@/components/client/payment/EntriesMobileView";
import SummaryStats from "@/components/client/payment/SummaryStats";
import {
  EntryGroup,
  FormLineItem,
  DynamicFieldTrackerProps,
  ApiLineItem,
  ApiEntryGroup,
} from "@/types/paymentDetails.types";
import { toast } from "sonner";
import { getTenantKey } from "@/utils/formatters";

import EditEntryGroupModal from "@/components/client/payment/EditEntryGroupModal";

const DynamicFieldTracker: React.FC<DynamicFieldTrackerProps> = ({ clientId, tenant }) => {
  const { saveGroup, useFetchGroups, invalidateGroups, isSaving } = useSaveClientPaymentGroup();
  const tenantKey = getTenantKey(tenant);

  const { data: apiEntries, isLoading } = useFetchGroups(clientId);

  const [entries, setEntries] = useState<EntryGroup[]>([]);
  const [groupName, setGroupName] = useState("");
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    { id: `field-${Date.now()}`, fieldName: "", amount: "", gst: "", commission: "" },
  ]);
  const [groupNotes, setGroupNotes] = useState("");
  const [groupShowToClient, setGroupShowToClient] = useState(false);
  const [modeOfPayment, setModeOfPayment] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    groupId: number | null;
  }>({ open: false, groupId: null });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editModal, setEditModal] = useState<{ open: boolean; group: EntryGroup | null }>({ open: false, group: null });
  const [approvingId, setApprovingId] = useState<number | null>(null);

  useEffect(() => {
    if (apiEntries) {
      const updatedEntries: EntryGroup[] = apiEntries.map((group: ApiEntryGroup) => ({
        id: typeof group.id === "string" ? parseInt(group.id, 10) : group.id,
        groupName: group.payment_group_name,
        lineItems: group.lineItems.map((item: ApiLineItem) => ({
          id: item.id,
          fieldName: item.field_name,
          amount: item.amount,
          gst: item.gst,
          amountWithGst: item.amount_with_gst,
          commission: item.commission,
        })),
        dateAdded: group.date_added,
        notes: group.notes ?? undefined,
        showToClient: group.show_to_client,
        modeOfPayment: group.mode_of_payment ?? "",
        startDate: group.start_date ?? "",
        endDate: group.end_date ?? "",
        approved: group.approved ?? false,
      }));
      setEntries(updatedEntries);
    }
  }, [apiEntries]);

  const resetForm = () => {
    setGroupName("");
    setLineItems([{ id: `field-${Date.now()}`, fieldName: "", amount: "", gst: "" }]);
    setGroupNotes("");
    setGroupShowToClient(false);
  };

  const saveEntryGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a name for the entry group.", {
        action: { label: "OK", onClick: () => {} },
        duration: 7000,
      });
      return;
    }

    const processedLineItems: { 
      fieldName: string; 
      amount: number; 
      gst?: number; 
      totalWithGst: number
      commission?: number; 
    }[] = [];
    
    for (const item of lineItems) {
      const amount = parseFloat(item.amount);
      const gst = item.gst ? parseFloat(item.gst) : 0;
      
      if (!item.fieldName.trim() || !item.amount.trim() || isNaN(amount) || (item.gst && isNaN(gst))) {
        toast.error("Please fill in all field names, provide valid amounts and GST percentages.", {
          action: { label: "OK", onClick: () => {} },
          duration: 7000,
        });
        return;
      }
      
      const totalWithGst = amount + (amount * gst) / 100;
      processedLineItems.push({
        fieldName: item.fieldName.trim(),
        amount,
        gst,
        totalWithGst,
        commission: item.commission ? parseFloat(item.commission) : 0,
      });
    }

    const result = await saveGroup({
      clientId,
      groupName: groupName.trim(),
      lineItems: processedLineItems,
      dateAdded: new Date().toISOString(),
      notes: groupNotes.trim() || undefined,
      showToClient: groupShowToClient,
      modeOfPayment: modeOfPayment.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (result.success) {
      invalidateGroups(clientId);
      resetForm();
      toast.success("Entry group saved!", {
        action: { label: "OK", onClick: () => {} },
        duration: 7000,
      });
    } else {
      toast.error(result.error || "Failed to save entry group.", {
        action: { label: "OK", onClick: () => {} },
        duration: 7000,
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setConfirmModal({ open: true, groupId: id });
  };

  const confirmDelete = async () => {
    if (confirmModal.groupId == null) return;
    
    const group = entries.find(g => g.id === confirmModal.groupId);
    if (!group) {
      setConfirmModal({ open: false, groupId: null });
      return;
    }
    
    setDeletingId(group.id.toString());
    setConfirmModal({ open: false, groupId: null });
    
    const result = await deleteClientPaymentGroup(group.id.toString());
    setDeletingId(null);

    if (result.success) {
      invalidateGroups(clientId);
      toast.success("Entry group deleted!", {
        action: { label: "OK", onClick: () => {} },
        duration: 7000,
      });
    } else {
      toast.error(result.error || "Failed to delete entry group.", {
        action: { label: "OK", onClick: () => {} },
        duration: 7000,
      });
    }
  };

  const handleEditClick = (id: number) => {
    const group = entries.find(g => g.id === id);
    if (group) setEditModal({ open: true, group });
  };

  const closeEditModal = () => setEditModal({ open: false, group: null });

  const handleApprove = async (group: EntryGroup) => {
    setApprovingId(group.id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DAYBOOK_API_URL}/daybook/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: String(clientId),
          amount: group.lineItems.reduce((sum, item) => sum + (item.amountWithGst || 0), 0),
          payment_type: "incoming",
          pay_status: "paid",
          description: group.notes,
          tenant: tenantKey,
        }),
      });

      const result = await response.json();

      if (!result.error) {
        await updateClientPaymentGroup({
          paymentRecordId: group.id,
          approved: true,
        });
        invalidateGroups(clientId);
        toast.success("Payment group approved!", {
          action: {
            label: "OK",
            onClick: async () => {
              toast.dismiss();
            },
          },
        });
      } else {
        toast.error("Failed to approve: " + (result.error || response.statusText));
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Error approving payment group.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <PaymentEntryForm
        groupName={groupName}
        setGroupName={setGroupName}
        lineItems={lineItems}
        setLineItems={setLineItems}
        groupNotes={groupNotes}
        setGroupNotes={setGroupNotes}
        groupShowToClient={groupShowToClient}
        setGroupShowToClient={setGroupShowToClient}
        onSave={saveEntryGroup}
        onCancel={resetForm}
        isSaving={isSaving}
        loading={isLoading}
        modeOfPayment={modeOfPayment}
        setModeOfPayment={setModeOfPayment}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader message="Loading data..." />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-gray-50 rounded border border-gray-300 p-8 text-center text-gray-500">
          No entries yet. Use the form above to add the first one!
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-300 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-300">
            <h2 className="text-base font-semibold text-gray-900">
              All Entries ({entries.length})
            </h2>
          </div>
          
          <EntriesTable
            entries={entries}
            onDelete={handleDeleteClick}
            deletingId={deletingId}
            onEdit={handleEditClick}
            onApprove={handleApprove}
            approvingId={approvingId}
          />
          
          <EntriesMobileView
            entries={entries}
            onDelete={handleDeleteClick}
            deletingId={deletingId}
            onEdit={handleEditClick}
            onApprove={handleApprove}
            approvingId={approvingId}
          />
        </div>
      )}

      {entries.length > 0 && <SummaryStats entries={entries} />}

      <ModalPortal>
        <ConfirmationModal
          isOpen={confirmModal.open}
          title="Delete Entry Group"
          message="Are you sure you want to delete this entire entry group? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmModal({ open: false, groupId: null })}
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
          confirmButtonColor="red"
          isLoading={!!deletingId}
        />
        {editModal.open && editModal.group && (
          <EditEntryGroupModal
            group={editModal.group}
            onClose={closeEditModal}
            onSave={() => {
              closeEditModal();
              invalidateGroups(clientId);
            }}
          />
        )}
      </ModalPortal>
    </div>
  );
};

export default DynamicFieldTracker;