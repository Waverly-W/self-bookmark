import React, { useState, useEffect } from 'react';
import { useBookmarks } from '../hooks/useBookmarks';

const RootFolderSelect = ({ value, onChange }) => {
  const { getBookmarkTree } = useBookmarks();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const bookmarkTree = await getBookmarkTree();
      const folderList = [];
      
      // 递归获取所有文件夹
      const traverseFolders = (node, level = 0) => {
        if (node.children) {
          if (node.id !== '0') { // 排除根节点
            const indent = '　'.repeat(level);
            const prefix = level === 0 ? '📁' : '└─ 📁';
            folderList.push({
              id: node.id,
              title: node.title,
              displayText: `${indent}${prefix} ${node.title}`,
              level,
            });
          }
          node.children.forEach(child => traverseFolders(child, level + 1));
        }
      };
      
      bookmarkTree.forEach(node => traverseFolders(node));
      setFolders(folderList);
    } catch (error) {
      console.error('加载文件夹失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">根文件夹设置</h3>
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-sm text-gray-600">选择要显示的根文件夹</span>
          </div>
          <div className="relative">
            <select 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="select-field appearance-none bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <option value="">加载中...</option>
              ) : (
                <>
                  <option value="" className="py-3 font-medium">📚 显示所有书签</option>
                  <option disabled className="text-gray-300 text-center">──────────</option>
                  {folders.map((folder) => (
                    <option 
                      key={folder.id} 
                      value={folder.id}
                      className={`py-1.5 ${folder.level === 0 ? 'font-medium' : 'font-normal'}`}
                    >
                      {folder.displayText}
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RootFolderSelect;
