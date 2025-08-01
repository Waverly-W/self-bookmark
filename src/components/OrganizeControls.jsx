import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const OrganizeControls = ({ onClose, hasTemplate }) => {
  const { state, dispatch, actions } = useApp();
  const [options, setOptions] = useState({
    renameBookmarks: false,
    moveToTargetFolders: false,
  });

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleStartOrganize = () => {
    if (!hasTemplate) {
      alert('请先配置文件夹模板');
      return;
    }

    // 开始整理
    dispatch({ type: actions.START_ORGANIZE });
    
    // 这里应该调用实际的整理逻辑
    console.log('开始整理，选项:', options);
    
    // 模拟整理过程
    simulateOrganizeProcess();
  };

  const simulateOrganizeProcess = () => {
    // 模拟整理过程
    const items = ['工作相关', '学习资料', '娱乐网站', '购物网站', '新闻资讯'];
    let currentIndex = 0;
    let successCount = 0;
    let failedCount = 0;

    const processNext = () => {
      if (currentIndex >= items.length) {
        // 完成
        dispatch({ type: actions.STOP_ORGANIZE });
        dispatch({ 
          type: actions.UPDATE_ORGANIZE_PROGRESS, 
          payload: { 
            currentItem: '处理完成',
            percentage: 100 
          }
        });
        return;
      }

      const item = items[currentIndex];
      const isSuccess = Math.random() > 0.2; // 80% 成功率

      dispatch({ 
        type: actions.UPDATE_ORGANIZE_PROGRESS, 
        payload: { 
          currentItem: `正在处理: ${item}`,
          percentage: Math.round(((currentIndex + 1) / items.length) * 100)
        }
      });

      setTimeout(() => {
        if (isSuccess) {
          successCount++;
          dispatch({ 
            type: actions.ADD_ORGANIZE_RESULT, 
            payload: { 
              item, 
              success: true, 
              message: '成功移动到目标文件夹' 
            }
          });
        } else {
          failedCount++;
          dispatch({ 
            type: actions.ADD_ORGANIZE_RESULT, 
            payload: { 
              item, 
              success: false, 
              message: '无法确定合适的文件夹' 
            }
          });
        }

        dispatch({ 
          type: actions.UPDATE_ORGANIZE_PROGRESS, 
          payload: { 
            successCount,
            failedCount
          }
        });

        currentIndex++;
        processNext();
      }, 1000 + Math.random() * 2000); // 1-3秒随机延迟
    };

    processNext();
  };

  const handleConfirmOrganize = () => {
    // 应用变更
    console.log('应用变更');
    
    // 清理进度显示
    dispatch({ 
      type: actions.UPDATE_ORGANIZE_PROGRESS, 
      payload: { 
        isRunning: false,
        currentItem: '',
        successCount: 0,
        failedCount: 0,
        percentage: 0,
        results: []
      }
    });
  };

  return (
    <div className="mt-6 flex justify-end space-x-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="renameOption" 
            checked={options.renameBookmarks}
            onChange={(e) => handleOptionChange('renameBookmarks', e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="renameOption" className="text-sm text-gray-700">
            重命名书签
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="moveOption" 
            checked={options.moveToTargetFolders}
            onChange={(e) => handleOptionChange('moveToTargetFolders', e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="moveOption" className="text-sm text-gray-700">
            移动到目标文件夹
          </label>
        </div>
        
        <button 
          onClick={handleStartOrganize}
          disabled={state.organizeProgress.isRunning || !hasTemplate}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{state.organizeProgress.isRunning ? '整理中...' : '开始整理'}</span>
        </button>
      </div>
      
      <button 
        onClick={handleConfirmOrganize}
        disabled={state.organizeProgress.isRunning || state.organizeProgress.results.length === 0}
        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>应用变更</span>
      </button>
    </div>
  );
};

export default OrganizeControls;
