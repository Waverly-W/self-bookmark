import React from 'react';
import { chromeApi } from '../utils/chromeApi';
import '../input.css';

const Popup = () => {
  const handleOpenOptions = () => {
    chromeApi.runtime.openOptionsPage();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 max-w-md">
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">SelfBookmark</h1>
            <img 
              src="icon_WH_48x48px.png" 
              alt="logo" 
              className="w-8 h-8"
            />
          </div>
          <button 
            onClick={handleOpenOptions}
            className="btn-primary w-full"
          >
            打开选项
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
