import { useState } from 'react';

export const useModalManagement = () => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return {
    showDeleteConfirmation,
    setShowDeleteConfirmation
  };
};