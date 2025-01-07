"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { QSOTable } from '../components/QSOTable';
import { QSO, SearchResults } from '../lib/types';
import { Input } from '@/components/ui/input'; 
import { Button } from '@/components/ui/button';
import SearchResultTable from '@/components/SearchResultTable';

enum DisplayContent {
  QSO,
  SearchResult,
}

export default function Home() {
  const [qsos, setQsos] = useState<QSO[]>([]);
  const [searchData, setSearchData] = useState<SearchResults>({});
  const [callsign, setCallsign] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayContent, setDisplayContent] = useState<DisplayContent>(DisplayContent.QSO);

  const componentIsMounted = useRef(false);

  useEffect(() => {
    async function fetchQSOs() {
      if (displayContent !== DisplayContent.QSO) return;
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
  }, [displayContent]);

  const handleCallsignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toUpperCase(); // 清理输入并转大写
    if (value === '') {
      setDisplayContent(DisplayContent.QSO);
    }
    setCallsign(value);
  };
  

  const handleSearch = useCallback(async () => {
    if (callsign.trim() === '') {
      setDisplayContent(DisplayContent.QSO);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?callsign=${callsign}`);
      if (!response.ok) {
        throw new Error('Failed to search QSOs');
      }
      const data = await response.json();
      setSearchData(data);
      setDisplayContent(DisplayContent.SearchResult);
    } catch {
      setError('Failed to search QSOs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [callsign]);


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">KO6BHN QSO Log</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading ? (
        <p>Loading QSOs...</p>
      ) : (
        <div>
          <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter your callsign"
              value={callsign}
              onChange={handleCallsignChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          <div>
            {
              displayContent === DisplayContent.QSO ? 
              <QSOTable qsos={qsos} /> :
              <SearchResultTable data={searchData}/>
            }
          </div>
        </div>
      )}
    </div>
  );
}

