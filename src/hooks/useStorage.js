import { useState, useEffect, useCallback } from 'react';

export const useStorage = (keys = null) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const get = useCallback((keys) => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      } else {
        reject(new Error('Chrome storage API not available'));
      }
    });
  }, []);

  const set = useCallback((items) => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error('Chrome storage API not available'));
      }
    });
  }, []);

  const remove = useCallback((keys) => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove(keys, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error('Chrome storage API not available'));
      }
    });
  }, []);

  const clear = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error('Chrome storage API not available'));
      }
    });
  }, []);

  const loadData = useCallback(async (keysToLoad = keys) => {
    try {
      setLoading(true);
      setError(null);
      const result = await get(keysToLoad);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [get, keys]);

  const saveData = useCallback(async (items) => {
    try {
      setError(null);
      await set(items);
      setData(prev => ({ ...prev, ...items }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [set]);

  useEffect(() => {
    if (keys) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [loadData, keys]);

  return {
    data,
    loading,
    error,
    get,
    set: saveData,
    remove,
    clear,
    reload: loadData,
  };
};
