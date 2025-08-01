import React, { Suspense, lazy } from 'react';
import { AppProvider } from '../contexts/AppContext';
import Header from '../components/Header';
import BookmarkTree from '../components/BookmarkTree';
import '../input.css';

// 懒加载大型组件
const SettingsPanel = lazy(() => import('../components/SettingsPanel'));
const SmartOrganizePanel = lazy(() => import('../components/SmartOrganizePanel'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-gray-600">加载中...</span>
  </div>
);

const Options = () => {
  return (
    <AppProvider>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Header />

          {/* 默认视图 */}
          <div id="defaultView">
            <BookmarkTree />
          </div>

          {/* 智能整理面板 - 懒加载 */}
          <Suspense fallback={<LoadingSpinner />}>
            <SmartOrganizePanel />
          </Suspense>

          {/* 设置面板 - 懒加载 */}
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsPanel />
          </Suspense>
        </div>
      </div>
    </AppProvider>
  );
};

export default Options;
