// Updated useSalaryConfig hook
import { useState, useEffect } from 'react';
import { fetchSalaryConfig } from '@/app/actions/payroll/salary-actions';

export function useSalaryConfig(nurseId?: number) {
  const [data, setData] = useState<{
    id: number | null;
    hourlyRate: number;
  }>({
    id: null,
    hourlyRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nurseId) {
      setData({ id: null, hourlyRate: 0 });
      return;
    }

    const loadSalaryConfig = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const config = await fetchSalaryConfig(nurseId);
        setData(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load salary configuration');
        setData({ id: null, hourlyRate: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadSalaryConfig();
  }, [nurseId]);

  return {
    configId: data.id,
    hourlyRate: data.hourlyRate,
    loading,
    error,
    refetch: () => {
      if (nurseId) {
        const loadSalaryConfig = async () => {
          setLoading(true);
          setError(null);
          
          try {
            const config = await fetchSalaryConfig(nurseId);
            setData(config);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load salary configuration');
          } finally {
            setLoading(false);
          }
        };
        loadSalaryConfig();
      }
    },
  };
}