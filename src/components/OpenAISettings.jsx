import React, { useState } from 'react';

const OpenAISettings = ({ config, onChange }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleConfigChange = (key, value) => {
    onChange({ [key]: value });
  };

  const handleModelChange = (e) => {
    const value = e.target.value;
    handleConfigChange('model', value);
    
    // 如果选择自定义模型，显示自定义输入框
    if (value === 'custom') {
      // 自定义模型输入框会在下面显示
    } else {
      // 清空自定义模型
      handleConfigChange('customModel', '');
    }
  };

  const testApiConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const apiUrl = config.apiUrl || 'https://api.openai.com/v1';
      const model = config.model === 'custom' ? config.customModel : config.model;
      
      if (!config.apiKey) {
        throw new Error('请先输入API Key');
      }
      
      if (!model) {
        throw new Error('请选择或输入模型名称');
      }

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: '连接成功' });
      } else {
        const error = await response.json();
        throw new Error(error.error?.message || '连接失败');
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">OpenAI API 设置</h3>
      <div className="border rounded-lg p-4 bg-white space-y-4">
        {/* API Key */}
        <div>
          <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              id="openaiApiKey"
              value={config.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              className="input-field pr-10"
              placeholder="输入你的 OpenAI API Key"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* API URL */}
        <div>
          <label htmlFor="openaiApiUrl" className="block text-sm font-medium text-gray-700 mb-1">
            API URL
          </label>
          <input
            type="url"
            id="openaiApiUrl"
            value={config.apiUrl || 'https://api.openai.com/v1'}
            onChange={(e) => handleConfigChange('apiUrl', e.target.value)}
            className="input-field"
            placeholder="https://api.openai.com/v1"
          />
        </div>

        {/* Model Selection */}
        <div>
          <label htmlFor="openaiModel" className="block text-sm font-medium text-gray-700 mb-1">
            模型选择
          </label>
          <div className="space-y-2">
            <div className="relative">
              <select
                id="openaiModel"
                value={config.model || 'gpt-4'}
                onChange={handleModelChange}
                className="select-field appearance-none"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="custom">自定义模型</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* 自定义模型输入框 */}
            {config.model === 'custom' && (
              <div>
                <input
                  type="text"
                  value={config.customModel || ''}
                  onChange={(e) => handleConfigChange('customModel', e.target.value)}
                  className="input-field"
                  placeholder="输入自定义模型名称，例如: gpt-4-32k"
                />
              </div>
            )}
          </div>
        </div>

        {/* API 测试按钮和结果显示 */}
        <div className="pt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={testApiConnection}
              disabled={testing}
              className="btn-secondary text-sm flex items-center space-x-1"
            >
              {testing ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              <span>{testing ? '测试中...' : '测试连接'}</span>
            </button>
            
            {testResult && (
              <div className="flex items-center space-x-1">
                {testResult.success ? (
                  <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.message}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAISettings;
