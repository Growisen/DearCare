import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { FormData, VitalsData, BedSoreData, BedSoreStage, ReassessmentData } from '@/types/reassessment.types';
import { insertReassessment, fetchReassessments } from '@/app/actions/clients/reassessment';

const initialVitals: VitalsData = {
  time: '', heartRate: '', bpSystolic: '', bpDiastolic: '', bpPosition: '', temperature: '', respiratoryRate: ''
};

const initialBedSore: BedSoreData = {
  stage: '', shape: '', size: '', site: ''
};

const initialForm: FormData = {
  diagnosis: '', presentCondition: '', vitals: initialVitals, bedSore: initialBedSore,
  mentalStatus: '', hygiene: '', generalStatus: '', careStatus: '', outdoorHours: '',
  nursingDiagnosis: '', followUpEvaluation: '', assignmentDoneBy: '', allottedStaffName: '',
  assigningPeriod: '', previousVisitedDate: '',
  dynamicFields: { diagnosis: [], vitals: [], bedSore: [], assessment: [], info: [] }
};

export const useReassessmentForm = (clientId: string, activeTab?: string) => {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reassessments, setReassessments] = useState<ReassessmentData[]>([]);
  const [totalReassessments, setTotalReassessments] = useState<{ id: string; createdAt: string }[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedReassessmentId, setSelectedReassessmentId] = useState<string | undefined>(undefined);

  const fetchReassessmentData = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const result = await fetchReassessments(clientId, selectedReassessmentId);
      if (result.success) {
        setReassessments(result.reassessments);
        setTotalReassessments(result.totalReassessments);
        if (result.reassessments.length > 0) {
          setSelectedReassessmentId(result.reassessments[0].id);
        } else {
          setSelectedReassessmentId(undefined);
        }
      } else {
        setFetchError(result.error || 'Failed to fetch reassessments');
      }
    } catch {
      setFetchError('Unexpected error occurred');
    } finally {
      setFetchLoading(false);
    }
  }, [clientId, selectedReassessmentId]);

  useEffect(() => {
    if (clientId && activeTab === 'reassessment') {
      fetchReassessmentData();
    }
  }, [clientId, activeTab, fetchReassessmentData]);

  useEffect(() => {
    if (selectedReassessmentId) {
      fetchReassessmentData();
    }
  }, [selectedReassessmentId, fetchReassessmentData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVitalChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, vitals: { ...prev.vitals, [name]: value } }));
  };

  const handleBedSoreChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, bedSore: { ...prev.bedSore, [name]: value } }));
  };

  const setBedSoreStage = (stage: BedSoreStage) => {
    setFormData((prev) => ({
      ...prev,
      bedSore: { ...prev.bedSore, stage: prev.bedSore.stage === stage ? '' : stage }
    }));
  };

  const addDynamicField = (section: keyof FormData['dynamicFields']) => {
    setFormData((prev) => ({
      ...prev,
      dynamicFields: { ...prev.dynamicFields, [section]: [...prev.dynamicFields[section], { label: '', value: '' }] }
    }));
  };

  const removeDynamicField = (section: keyof FormData['dynamicFields'], index: number) => {
    setFormData((prev) => ({
      ...prev,
      dynamicFields: { ...prev.dynamicFields, [section]: prev.dynamicFields[section].filter((_, i) => i !== index) }
    }));
  };

  const updateDynamicField = (section: keyof FormData['dynamicFields'], index: number, field: 'label' | 'value', newValue: string) => {
    setFormData((prev) => {
      const newFields = [...prev.dynamicFields[section]];
      newFields[index] = { ...newFields[index], [field]: newValue };
      return { ...prev, dynamicFields: { ...prev.dynamicFields, [section]: newFields } };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await insertReassessment(clientId, formData);
      if (!result.success) {
        setError(result.error || 'Failed to save reassessment');
      } 
    } catch {
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleInputChange,
    handleVitalChange,
    handleBedSoreChange,
    setBedSoreStage,
    addDynamicField,
    removeDynamicField,
    updateDynamicField,
    handleSubmit,
    loading,
    error,
    reassessments,
    totalReassessments,
    fetchLoading,
    fetchError,
    fetchReassessmentData,
    selectedReassessmentId,
    setSelectedReassessmentId
  };
};