import React, { ChangeEvent } from "react";
import ModalPortal from "@/components/ui/ModalPortal";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/Select";

type PaymentData = {
  netSalary: number;
};

type ApproveSalaryModalProps = {
  isOpen: boolean;
  isProcessing: boolean;
  payment: PaymentData | null;
  paymentType: string;
  amount: number;
  onPaymentTypeChange: (val: string) => void;
  onAmountChange: (val: number) => void;
  onClose: () => void;
  onSubmit: (paymentMethod: string, amount: number) => Promise<void>;
};

const paymentTypes = ["cash", "bank transfer"];

const ApproveSalaryModal: React.FC<ApproveSalaryModalProps> = ({
  isOpen,
  isProcessing,
  paymentType,
  amount,
  onPaymentTypeChange,
  onAmountChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-sm p-6 w-full max-w-md shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">
            Approve Salary Payment
          </h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-slate-700">
              Payment type
            </label>
            <Select
              value={paymentType}
              onValueChange={onPaymentTypeChange}
              disabled={isProcessing}
            >
              <SelectTrigger className="w-full bg-white border-slate-200 text-gray-800">
                <SelectValue placeholder="Select payment type..." />
              </SelectTrigger>
              <SelectContent className="text-gray-800 bg-white">
                <SelectGroup>
                  <SelectLabel>Payment Type</SelectLabel>
                  {paymentTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="text-gray-800 bg-white"
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-slate-700">
              Amount
            </label>
            <input
              type="number"
              className="w-full border border-slate-200 rounded-sm px-2 py-1 text-slate-900 focus:outline-none focus:ring-0
               focus:border-slate-300 placeholder:text-slate-400"
              value={amount}
              min={0}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onAmountChange(Number(e.target.value))
              }
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isProcessing}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-sm bg-gray-200 text-slate-800 hover:bg-gray-300 transition-colors"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-sm bg-blue-700 text-white hover:bg-blue-800 transition-colors"
              onClick={() => onSubmit(paymentType, amount)}
              disabled={isProcessing}
            >
              {isProcessing ? "Approving..." : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ApproveSalaryModal;