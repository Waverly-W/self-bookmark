import React from 'react';

const TemplateStructure = ({ template }) => {
  const renderTemplateFolder = (folder, level = 0) => {
    return (
      <div key={folder.id} className={`ml-${level * 6} py-1`}>
        <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
          <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="text-gray-700 font-medium">{folder.name}</span>
        </div>
        {folder.children && folder.children.length > 0 && (
          <div className="ml-4">
            {folder.children.map(child => renderTemplateFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!template || template.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p>暂无文件夹模板</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {template.map(folder => renderTemplateFolder(folder))}
    </div>
  );
};

export default TemplateStructure;
