import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useApp } from '../contexts/AppContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { useStorage } from '../hooks/useStorage';

// 懒加载设置组件
const RootFolderSelect = lazy(() => import('./RootFolderSelect'));
const FolderTemplateManager = lazy(() => import('./FolderTemplateManager'));
const OpenAISettings = lazy(() => import('./OpenAISettings'));

const SettingsPanel = () => {
  const { state, dispatch, actions } = useApp();
  const { data: storageData, set: saveStorage } = useStorage();
  const [localSettings, setLocalSettings] = useState({
    rootFolderId: '',
    folderTemplate: null,
    openaiConfig: {
      apiKey: '',
      apiUrl: 'https://api.openai.com/v1',
      model: 'gpt-4',
      customModel: '',
    },
  });

  useEffect(() => {
    // 从存储中加载设置
    if (storageData) {
      setLocalSettings(prev => ({
        ...prev,
        rootFolderId: storageData.rootFolderId || '',
        folderTemplate: storageData.folderTemplate || null,
        openaiConfig: {
          ...prev.openaiConfig,
          ...storageData.openaiConfig,
        },
      }));
    }
  }, [storageData]);

  const handleClose = () => {
    dispatch({ type: actions.TOGGLE_SETTINGS_PANEL, payload: false });
  };

  const handleSave = async () => {
    try {
      // 保存到Chrome存储
      await saveStorage({
        rootFolderId: localSettings.rootFolderId,
        folderTemplate: localSettings.folderTemplate,
        openaiConfig: localSettings.openaiConfig,
      });

      // 更新全局状态
      dispatch({ type: actions.SET_ROOT_FOLDER, payload: localSettings.rootFolderId });
      dispatch({ type: actions.SET_FOLDER_TEMPLATE, payload: localSettings.folderTemplate });
      dispatch({ type: actions.SET_OPENAI_CONFIG, payload: localSettings.openaiConfig });

      // 显示成功消息
      showNotification('设置保存成功', 'success');
      
      // 关闭面板
      handleClose();
    } catch (error) {
      showNotification('保存设置失败: ' + error.message, 'error');
    }
  };

  const showNotification = (message, type) => {
    // 简单的通知实现，可以后续优化
    console.log(`${type}: ${message}`);
  };

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOpenAIConfigChange = (config) => {
    setLocalSettings(prev => ({
      ...prev,
      openaiConfig: {
        ...prev.openaiConfig,
        ...config,
      },
    }));
  };

  return (
    <div 
      className={`fixed right-0 top-0 h-full w-1/3 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${
        state.isSettingsPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">设置</h2>
          </div>
          
          <div className="space-y-6">
            {/* 根文件夹设置 */}
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-20 rounded"></div>}>
              <RootFolderSelect
                value={localSettings.rootFolderId}
                onChange={(value) => handleSettingChange('rootFolderId', value)}
              />
            </Suspense>

            {/* 文件夹模板设置 */}
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded"></div>}>
              <FolderTemplateManager
                template={localSettings.folderTemplate}
                onChange={(template) => handleSettingChange('folderTemplate', template)}
              />
            </Suspense>

            {/* OpenAI API 设置 */}
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-40 rounded"></div>}>
              <OpenAISettings
                config={localSettings.openaiConfig}
                onChange={handleOpenAIConfigChange}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="p-6 bg-gray-50 border-t">
        <div className="flex space-x-4">
          <button 
            onClick={handleClose}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="btn-primary flex-1"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
