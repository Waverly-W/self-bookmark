import React from 'react';
import BookmarkFolder from './BookmarkFolder';
import BookmarkItem from './BookmarkItem';

const OrganizeBookmarkTree = ({ bookmarks, loading = false, error = null }) => {
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">加载书签中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600">加载书签时出错: {error}</p>
      </div>
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <p className="text-gray-500">暂无书签</p>
      </div>
    );
  }

  // 处理书签数据结构
  let displayBookmarks = [];
  if (bookmarks[0] && bookmarks[0].children) {
    // 如果是完整的书签树结构，显示根节点的子项
    displayBookmarks = bookmarks[0].children;
  } else {
    // 如果已经是处理过的书签数组
    displayBookmarks = bookmarks;
  }

  return (
    <div className="space-y-1">
      {displayBookmarks.map(renderBookmarkNode)}
    </div>
  );
};

export default OrganizeBookmarkTree;
