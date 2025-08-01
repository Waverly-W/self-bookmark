import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const OrganizeProgress = () => {
  const { state } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const { organizeProgress } = state;

  if (!organizeProgress.isRunning && organizeProgress.results.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-6 transition-all duration-300 ease-in-out">
      <div className="card p-0">
        {/* 简化的进度显示 */}
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-t-lg transition-colors duration-200 min-h-[64px]"
          onClick={toggleExpanded}
        >
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              处理进度
            </span>
            <div className="flex items-center space-x-2">
              {/* 处理中图标 */}
              {organizeProgress.isRunning && (
                <svg className="w-4 h-4 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              
              {/* 完成图标 */}
              {!organizeProgress.isRunning && organizeProgress.results.length > 0 && (
                <svg className="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              
              <span className="text-sm text-gray-700">
                <span className="font-medium">
                  {organizeProgress.isRunning ? organizeProgress.currentItem || '准备开始...' : '处理完成'}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-green-600">成功: {organizeProgress.successCount}</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-red-600">失败: {organizeProgress.failedCount}</span>
              <span className="ml-2">({organizeProgress.percentage}%)</span>
            </div>
            <svg 
              className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* 详细进度信息 */}
        {isExpanded && (
          <div className="border-t transition-all duration-300 ease-in-out">
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-2">处理历史:</div>
              <div className="space-y-2 overflow-y-auto max-h-64">
                {organizeProgress.results.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    暂无处理记录
                  </div>
                ) : (
                  organizeProgress.results.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded text-sm ${
                        result.success 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className="font-medium">{result.item}</span>
                      </div>
                      {result.message && (
                        <div className="mt-1 text-xs opacity-75">
                          {result.message}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {/* 操作按钮 */}
              {organizeProgress.isRunning && (
                <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
                  <button 
                    className="btn-secondary text-sm flex items-center space-x-1"
                    onClick={() => {
                      // 停止整理逻辑
                      console.log('停止整理');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>停止整理</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizeProgress;
