import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { useStorage } from '../hooks/useStorage';
import BookmarkFolder from './BookmarkFolder';
import BookmarkItem from './BookmarkItem';

const BookmarkTree = () => {
  const { state } = useApp();
  const { bookmarks, loading, error, loadBookmarks } = useBookmarks();
  const { data: storageData } = useStorage(['rootFolderId']);
  const [displayBookmarks, setDisplayBookmarks] = useState([]);

  useEffect(() => {
    const rootFolderId = storageData.rootFolderId || state.rootFolderId;
    loadBookmarks(rootFolderId);
  }, [storageData.rootFolderId, state.rootFolderId, loadBookmarks]);

  useEffect(() => {
    if (bookmarks.length > 0) {
      // 如果有根文件夹ID，显示该文件夹的子项
      if (storageData.rootFolderId) {
        const rootFolder = bookmarks[0];
        setDisplayBookmarks(rootFolder?.children || []);
      } else {
        // 否则显示完整书签树，但跳过根节点
        setDisplayBookmarks(bookmarks[0]?.children || []);
      }
    }
  }, [bookmarks, storageData.rootFolderId]);

  const renderBookmarkNode = (node) => {
    if (node.children) {
      // 这是一个文件夹
      return (
        <BookmarkFolder
          key={node.id}
          folder={node}
          onToggle={() => {}}
        />
      );
    } else {
      // 这是一个书签
      return (
        <BookmarkItem
          key={node.id}
          bookmark={node}
        />
      );
    }
  };

  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">加载书签中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card animate-fade-in">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600">加载书签时出错: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card animate-fade-in ${state.isOrganizePanelOpen ? 'hidden' : ''}`}>
      {/* SVG Icons - 隐藏的图标模板 */}
      <div className="hidden">
        <svg id="folder-icon" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <svg id="chevron-icon" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg id="bookmark-icon" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>

      {displayBookmarks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="text-gray-500">暂无书签</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayBookmarks.map(renderBookmarkNode)}
        </div>
      )}
    </div>
  );
};

export default BookmarkTree;
