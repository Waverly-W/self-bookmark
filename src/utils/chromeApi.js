// Chrome扩展API封装工具函数

export const chromeApi = {
  // 书签API
  bookmarks: {
    getTree: () => {
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
    },

    getSubTree: (id) => {
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
    },

    create: (bookmark) => {
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
    },

    update: (id, changes) => {
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
    },

    move: (id, destination) => {
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
    },

    remove: (id) => {
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
    },
  },

  // 存储API
  storage: {
    get: (keys) => {
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
    },

    set: (items) => {
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
    },

    remove: (keys) => {
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
    },

    clear: () => {
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
    },
  },

  // 运行时API
  runtime: {
    openOptionsPage: () => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.openOptionsPage();
      }
    },
  },
};
