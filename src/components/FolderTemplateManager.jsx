import React, { useState } from 'react';

const FolderTemplateManager = ({ template, onChange }) => {
  const [templateData, setTemplateData] = useState(template || []);

  const handleAddRootFolder = () => {
    const newFolder = {
      id: Date.now().toString(),
      name: '新文件夹',
      children: [],
    };
    const newTemplate = [...templateData, newFolder];
    setTemplateData(newTemplate);
    onChange(newTemplate);
  };

  const handleRemoveFolder = (folderId) => {
    const removeFromArray = (arr) => {
      return arr.filter(item => {
        if (item.id === folderId) {
          return false;
        }
        if (item.children) {
          item.children = removeFromArray(item.children);
        }
        return true;
      });
    };
    
    const newTemplate = removeFromArray([...templateData]);
    setTemplateData(newTemplate);
    onChange(newTemplate);
  };

  const handleUpdateFolder = (folderId, updates) => {
    const updateInArray = (arr) => {
      return arr.map(item => {
        if (item.id === folderId) {
          return { ...item, ...updates };
        }
        if (item.children) {
          item.children = updateInArray(item.children);
        }
        return item;
      });
    };
    
    const newTemplate = updateInArray([...templateData]);
    setTemplateData(newTemplate);
    onChange(newTemplate);
  };

  const handleAddSubFolder = (parentId) => {
    const newFolder = {
      id: Date.now().toString(),
      name: '新子文件夹',
      children: [],
    };
    
    const addToParent = (arr) => {
      return arr.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...(item.children || []), newFolder],
          };
        }
        if (item.children) {
          item.children = addToParent(item.children);
        }
        return item;
      });
    };
    
    const newTemplate = addToParent([...templateData]);
    setTemplateData(newTemplate);
    onChange(newTemplate);
  };

  const renderFolder = (folder, level = 0) => {
    return (
      <div key={folder.id} className={`ml-${level * 4} border-l-2 border-gray-200 pl-4 py-2`}>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <input
            type="text"
            value={folder.name}
            onChange={(e) => handleUpdateFolder(folder.id, { name: e.target.value })}
            className="flex-1 text-sm border-none bg-transparent focus:outline-none focus:bg-gray-50 rounded px-2 py-1"
          />
          <button
            onClick={() => handleAddSubFolder(folder.id)}
            className="text-xs text-blue-600 hover:text-blue-800"
            title="添加子文件夹"
          >
            +
          </button>
          <button
            onClick={() => handleRemoveFolder(folder.id)}
            className="text-xs text-red-600 hover:text-red-800"
            title="删除文件夹"
          >
            ×
          </button>
        </div>
        {folder.children && folder.children.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">文件夹模板设置</h3>
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button 
              onClick={handleAddRootFolder}
              className="btn-secondary text-sm"
            >
              添加根文件夹
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {templateData.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              暂无文件夹模板，点击"添加根文件夹"开始创建
            </div>
          ) : (
            templateData.map(folder => renderFolder(folder))
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderTemplateManager;
