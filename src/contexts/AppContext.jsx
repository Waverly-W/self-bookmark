import React, { createContext, useContext, useReducer } from 'react';

// 初始状态
const initialState = {
  // 设置相关
  rootFolderId: '',
  folderTemplate: null,
  openaiConfig: {
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
    customModel: '',
  },
  
  // UI状态
  isSettingsPanelOpen: false,
  isOrganizePanelOpen: false,
  
  // 书签相关
  bookmarks: [],
  foldersMap: new Map(),
  
  // 智能整理相关
  organizeProgress: {
    isRunning: false,
    currentItem: '',
    successCount: 0,
    failedCount: 0,
    percentage: 0,
    results: [],
  },
};

// Action类型
const ActionTypes = {
  // 设置相关
  SET_ROOT_FOLDER: 'SET_ROOT_FOLDER',
  SET_FOLDER_TEMPLATE: 'SET_FOLDER_TEMPLATE',
  SET_OPENAI_CONFIG: 'SET_OPENAI_CONFIG',
  
  // UI状态
  TOGGLE_SETTINGS_PANEL: 'TOGGLE_SETTINGS_PANEL',
  TOGGLE_ORGANIZE_PANEL: 'TOGGLE_ORGANIZE_PANEL',
  
  // 书签相关
  SET_BOOKMARKS: 'SET_BOOKMARKS',
  SET_FOLDERS_MAP: 'SET_FOLDERS_MAP',
  
  // 智能整理相关
  START_ORGANIZE: 'START_ORGANIZE',
  STOP_ORGANIZE: 'STOP_ORGANIZE',
  UPDATE_ORGANIZE_PROGRESS: 'UPDATE_ORGANIZE_PROGRESS',
  ADD_ORGANIZE_RESULT: 'ADD_ORGANIZE_RESULT',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_ROOT_FOLDER:
      return { ...state, rootFolderId: action.payload };
      
    case ActionTypes.SET_FOLDER_TEMPLATE:
      return { ...state, folderTemplate: action.payload };
      
    case ActionTypes.SET_OPENAI_CONFIG:
      return { 
        ...state, 
        openaiConfig: { ...state.openaiConfig, ...action.payload } 
      };
      
    case ActionTypes.TOGGLE_SETTINGS_PANEL:
      return { 
        ...state, 
        isSettingsPanelOpen: action.payload ?? !state.isSettingsPanelOpen 
      };
      
    case ActionTypes.TOGGLE_ORGANIZE_PANEL:
      return { 
        ...state, 
        isOrganizePanelOpen: action.payload ?? !state.isOrganizePanelOpen 
      };
      
    case ActionTypes.SET_BOOKMARKS:
      return { ...state, bookmarks: action.payload };
      
    case ActionTypes.SET_FOLDERS_MAP:
      return { ...state, foldersMap: action.payload };
      
    case ActionTypes.START_ORGANIZE:
      return {
        ...state,
        organizeProgress: {
          ...state.organizeProgress,
          isRunning: true,
          successCount: 0,
          failedCount: 0,
          percentage: 0,
          results: [],
        }
      };
      
    case ActionTypes.STOP_ORGANIZE:
      return {
        ...state,
        organizeProgress: {
          ...state.organizeProgress,
          isRunning: false,
        }
      };
      
    case ActionTypes.UPDATE_ORGANIZE_PROGRESS:
      return {
        ...state,
        organizeProgress: {
          ...state.organizeProgress,
          ...action.payload,
        }
      };
      
    case ActionTypes.ADD_ORGANIZE_RESULT:
      return {
        ...state,
        organizeProgress: {
          ...state.organizeProgress,
          results: [...state.organizeProgress.results, action.payload],
        }
      };
      
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider组件
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {
    state,
    dispatch,
    actions: ActionTypes,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
