"use client"

import { useState, useEffect, useRef } from 'react';
import { QSOTable } from '../components/QSOTable';
import { QSO } from '../lib/types';
export default function Home() {
  const [qsos, setQsos] = useState<QSO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const componentIsMounted = useRef(false);

  useEffect(() => {
    async function fetchQSOs() {
      // 如果已经执行过,直接返回
      if (componentIsMounted.current) return;
      
      try {
        const response = await fetch('/api/sync-lotw');
        if (!response.ok) {
          throw new Error('Failed to fetch QSOs');
        }
        const data = await response.json();
        setQsos(data.qsos);
      } catch {
        setError('Failed to load QSOs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
      
      // 标记为已执行
      componentIsMounted.current = true;
    }

    fetchQSOs();
  }, []);


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">KO6BHN QSO Log</h1>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Hide QSO Form' : 'Add New QSO'}
            </Button>
            <LoTWSync isLoading={isLoading} />
          </CardContent>
        </Card>
      </div> */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading ? (
        <p>Loading QSOs...</p>
      ) : (
        <QSOTable qsos={qsos} />
      )}
    </div>
  );
}

