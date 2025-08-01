import { useState, useEffect, useCallback } from 'react';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getBookmarkTree = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(bookmarkTreeNodes);
          }
        });
      } else {
        reject(new Error('Chrome bookmarks API not available'));
      }
    });
  }, []);

  const getSubTree = useCallback((id) => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.getSubTree(id, (nodes) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(nodes);
          }
        });
      } else {
        reject(new Error('Chrome bookmarks API not available'));
      }
    });
  }, []);

  const createBookmark = useCallback((bookmark) => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.create(bookmark, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      } else {
        reject(new Error('Chrome bookmarks API not available'));
      }
    });
  }, []);

  const updateBookmark = useCallback((id, changes) => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.update(id, changes, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      } else {
        reject(new Error('Chrome bookmarks API not available'));
      }
    });
  }, []);

  const moveBookmark = useCallback((id, destination) => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.move(id, destination, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      } else {
        reject(new Error('Chrome bookmarks API not available'));
      }
    });
  }, []);

  const removeBookmark = useCallback((id) => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.remove(id, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error('Chrome bookmarks API not available'));
      }
    });
  }, []);

  const loadBookmarks = useCallback(async (rootId = '') => {
    try {
      setLoading(true);
      setError(null);
      
      let bookmarkData;
      if (rootId) {
        bookmarkData = await getSubTree(rootId);
      } else {
        bookmarkData = await getBookmarkTree();
      }
      
      setBookmarks(bookmarkData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getBookmarkTree, getSubTree]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    loadBookmarks,
    getBookmarkTree,
    getSubTree,
    createBookmark,
    updateBookmark,
    moveBookmark,
    removeBookmark,
  };
};
