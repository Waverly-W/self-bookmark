import React from 'react';
import { useApp } from '../contexts/AppContext';

const Header = () => {
  const { state, dispatch, actions } = useApp();

  const handleSmartOrganize = () => {
    dispatch({ type: actions.TOGGLE_ORGANIZE_PANEL });
  };

  const handleSettings = () => {
    dispatch({ type: actions.TOGGLE_SETTINGS_PANEL });
  };

  return (
    <header className="mb-8 animate-fade-in flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">SelfBookmark</h1>
        <div className="h-1 w-20 bg-blue-500 rounded"></div>
      </div>
      <div className="flex space-x-4">
        <button 
          onClick={handleSmartOrganize}
          className={`btn-primary flex items-center space-x-2 transition-all duration-300 hover:bg-blue-600 ${
            state.isOrganizePanelOpen ? 'btn-secondary bg-gray-200' : ''
          }`}
          aria-label="智能整理"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>智能整理</span>
        </button>
        <button 
          onClick={handleSettings}
          className="btn-icon group" 
          aria-label="打开设置"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
