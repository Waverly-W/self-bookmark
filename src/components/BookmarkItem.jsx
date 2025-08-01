import React from 'react';

const BookmarkItem = ({ bookmark, level = 0 }) => {
  return (
    <div className="bookmark-item">
      {/* 书签图标 */}
      <svg 
        className="bookmark-icon" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      
      {/* 书签链接 */}
      <a 
        href={bookmark.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex-1"
      >
        {bookmark.title}
      </a>
    </div>
  );
};

export default BookmarkItem;
