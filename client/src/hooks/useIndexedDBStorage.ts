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
        console.log(`IndexedDBStorage: Loading ${storeName}...`);
        setIsLoading(true);
        setError(null);
        
        // Add timeout for initialization
        const initTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Initialization timeout')), 6000);
        });
        
        // Initialize IndexedDB and mock data if needed with timeout
        await Promise.race([
          (async () => {
            await indexedDBStorage.init();
            console.log(`IndexedDBStorage: ${storeName} - IndexedDB initialized`);
            await indexedDBStorage.initializeMockData();
            console.log(`IndexedDBStorage: ${storeName} - Mock data check complete`);
          })(),
          initTimeout
        ]);
        
        const result = await getMethod();
        console.log(`IndexedDBStorage: ${storeName} - Data loaded:`, result);
        setData(result);
      } catch (err) {
        console.error(`Error loading ${storeName}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(defaultValue);
      } finally {
        console.log(`IndexedDBStorage: ${storeName} - Loading complete`);
        setIsLoading(false);
      }
    };

    loadData();
  }, [storeName]);

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