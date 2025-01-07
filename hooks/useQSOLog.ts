import { useState, useEffect } from 'react';
import { QSO } from '../utils/adiParser';

export function useQSOLog() {
  const [qsos, setQsos] = useState<QSO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load cached QSOs from local storage
    const cachedQsos = localStorage.getItem('cachedQsos');
    if (cachedQsos) {
      setQsos(JSON.parse(cachedQsos));
    }
  }, []);

  const addQSO = (newQSO: QSO) => {
    setQsos((prevQsos) => {
      const updatedQsos = [...prevQsos, newQSO];
      localStorage.setItem('cachedQsos', JSON.stringify(updatedQsos));
      return updatedQsos;
    });
  };

  const syncWithLoTW = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This is a placeholder for the actual LoTW API call
      const response = await fetch('/api/lotw-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Failed to sync with LoTW');
      const data = await response.json();
      setQsos(data.qsos);
      localStorage.setItem('cachedQsos', JSON.stringify(data.qsos));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { qsos, addQSO, syncWithLoTW, isLoading, error };
}

