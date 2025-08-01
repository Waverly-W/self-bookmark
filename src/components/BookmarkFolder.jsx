import React, { useState } from 'react';
import BookmarkItem from './BookmarkItem';

const BookmarkFolder = ({ folder, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const renderChildren = () => {
    if (!folder.children || folder.children.length === 0) {
      return null;
    }

    return folder.children.map((child) => {
      if (child.children) {
        return (
          <BookmarkFolder
            key={child.id}
            folder={child}
            level={level + 1}
          />
        );
      } else {
        return (
          <BookmarkItem
            key={child.id}
            bookmark={child}
            level={level + 1}
          />
        );
      }
    });
  };

  return (
    <div className="folder">
      {/* 文件夹标题 */}
      <div 
        className="folder-title"
        onClick={handleToggle}
      >
        {/* 展开/折叠图标 */}
        <svg 
          className={`folder-title-icon ${isOpen ? 'rotate-90' : ''}`}
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        
        {/* 文件夹图标 */}
        <svg 
          className="w-5 h-5 mr-2 text-gray-500" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        
        {/* 文件夹名称 */}
        <span>{folder.title}</span>
      </div>

      {/* 文件夹内容 */}
      <div 
        className={`folder-content ${isOpen ? '' : 'h-0'}`}
        data-state={isOpen ? 'open' : 'closed'}
      >
        {isOpen && renderChildren()}
      </div>
    </div>
  );
};

export default BookmarkFolder;
