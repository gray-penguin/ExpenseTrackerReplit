import { useState, useEffect } from 'react';
import { indexedDBStorage } from '../utils/indexedDBStorage';

export function useIndexedDBStorage<T>(
  storeName: string,
  defaultValue: T,
  getMethod: () => Promise<T>,
  setMethod: (value: T) => Promise<void>
) {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize IndexedDB if needed
        await indexedDBStorage.init();
        await indexedDBStorage.initializeMockData();
        
        const loadedData = await getMethod();
        setData(loadedData);
      } catch (err) {
        console.error(`Error loading ${storeName}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(defaultValue);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }
  )

  const updateData = async (newData: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof newData === 'function' ? (newData as (prev: T) => T)(data) : newData;
      await setMethod(valueToStore);
      setData(valueToStore);
    } catch (err) {
      console.error(`Error updating ${storeName}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return [data, updateData, { isLoading, error }] as const;
}