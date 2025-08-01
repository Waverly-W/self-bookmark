import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useApp } from '../contexts/AppContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { useStorage } from '../hooks/useStorage';
import OrganizeBookmarkTree from './OrganizeBookmarkTree';

// 懒加载子组件
const TemplateStructure = lazy(() => import('./TemplateStructure'));
const OrganizeProgress = lazy(() => import('./OrganizeProgress'));
const OrganizeControls = lazy(() => import('./OrganizeControls'));

const SmartOrganizePanel = () => {
  const { state, dispatch, actions } = useApp();
  const { bookmarks, loading, error, getBookmarkTree } = useBookmarks();
  const { data: storageData } = useStorage(['folderTemplate']);
  const [originalBookmarks, setOriginalBookmarks] = useState([]);
  const [templateStructure, setTemplateStructure] = useState(null);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [bookmarksError, setBookmarksError] = useState(null);

  useEffect(() => {
    if (state.isOrganizePanelOpen) {
      loadOrganizePanelData();
    }
  }, [state.isOrganizePanelOpen]);

  // 监听存储数据变化，更新模板结构
  useEffect(() => {
    if (storageData.folderTemplate) {
      setTemplateStructure(storageData.folderTemplate);
    }
  }, [storageData.folderTemplate]);

  const loadOrganizePanelData = async () => {
    try {
      setBookmarksLoading(true);
      setBookmarksError(null);

      // 直接获取书签树数据
      const bookmarkTree = await getBookmarkTree();
      setOriginalBookmarks(bookmarkTree);

      // 加载文件夹模板
      if (storageData.folderTemplate) {
        setTemplateStructure(storageData.folderTemplate);
      }
    } catch (error) {
      console.error('加载整理面板数据失败:', error);
      setBookmarksError(error.message);
    } finally {
      setBookmarksLoading(false);
    }
  };

  const handleClose = () => {
    dispatch({ type: actions.TOGGLE_ORGANIZE_PANEL, payload: false });
  };

  if (!state.isOrganizePanelOpen) {
    return null;
  }

  return (
    <div className="transition-all duration-300 ease-in-out">
      <div className="grid grid-cols-2 gap-6">
        {/* 左侧：原书签树 */}
        <div className="card animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 sticky top-0 bg-white z-10 py-4 border-b border-gray-100">
            当前书签结构
          </h2>
          <div className="max-h-[600px] overflow-y-auto flex-1">
            <OrganizeBookmarkTree
              bookmarks={originalBookmarks}
              loading={bookmarksLoading}
              error={bookmarksError}
            />
          </div>
        </div>

        {/* 右侧：文件夹模板 */}
        <div className="card animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 sticky top-0 bg-white z-10 py-4 border-b border-gray-100">
            目标文件夹结构
          </h2>
          <div className="max-h-[600px] overflow-y-auto flex-1">
            {templateStructure ? (
              <Suspense fallback={<div className="text-center py-4">加载模板...</div>}>
                <TemplateStructure template={templateStructure} />
              </Suspense>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p>请先在设置中配置文件夹模板</p>
                <button
                  onClick={() => {
                    handleClose();
                    dispatch({ type: actions.TOGGLE_SETTINGS_PANEL, payload: true });
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  前往设置
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 进度显示 */}
      <Suspense fallback={<div className="text-center py-2">加载进度...</div>}>
        <OrganizeProgress />
      </Suspense>

      {/* 操作按钮 */}
      <Suspense fallback={<div className="text-center py-2">加载控制...</div>}>
        <OrganizeControls
          onClose={handleClose}
          hasTemplate={!!templateStructure}
        />
      </Suspense>
    </div>
  );
};

export default SmartOrganizePanel;
