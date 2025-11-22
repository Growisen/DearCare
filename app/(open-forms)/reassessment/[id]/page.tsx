"use client"

import { useParams } from 'next/navigation';
import ReassessmentForm from '@/components/reassessment/ReassessmentForm';

export default function Page() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  return (
    <ReassessmentForm clientId={id} />
  );
}