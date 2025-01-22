// 这里可以添加选项页面的相关逻辑
console.log('选项页面已加载');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const bookmarkTreeElement = document.getElementById('bookmarkTree');
  const rootFolderSelect = document.getElementById('rootFolderSelect');
  const settingsButton = document.getElementById('settingsButton');
  const settingsPanel = document.getElementById('settingsPanel');
  const closeSettings = document.getElementById('closeSettings');
  const saveSettingsButton = document.getElementById('saveSettings');
  const smartOrganizeBtn = document.getElementById('smartOrganizeBtn');
  const smartOrganizePanel = document.getElementById('smartOrganizePanel');
  const defaultView = document.getElementById('defaultView');
  const originalBookmarkTree = document.getElementById('originalBookmarkTree');
  const templateStructure = document.getElementById('templateStructure');
  const cancelOrganize = document.getElementById('cancelOrganize');
  const confirmOrganize = document.getElementById('confirmOrganize');

  // 检查DOM元素是否正确获取
  console.log('DOM元素检查:', {
    bookmarkTreeElement: !!bookmarkTreeElement,
    rootFolderSelect: !!rootFolderSelect,
    settingsButton: !!settingsButton,
    settingsPanel: !!settingsPanel,
    closeSettings: !!closeSettings,
    saveSettingsButton: !!saveSettingsButton,
    smartOrganizeBtn: !!smartOrganizeBtn,
    smartOrganizePanel: !!smartOrganizePanel,
    defaultView: !!defaultView,
    originalBookmarkTree: !!originalBookmarkTree,
    templateStructure: !!templateStructure,
    cancelOrganize: !!cancelOrganize,
    confirmOrganize: !!confirmOrganize
  });

  // 存储所有文件夹的映射
  let foldersMap = new Map();

  // 获取图标模板
  const folderIconTemplate = document.getElementById('folder-icon');
  const chevronIconTemplate = document.getElementById('chevron-icon');
  const bookmarkIconTemplate = document.getElementById('bookmark-icon');

  // 检查图标模板是否正确获取
  console.log('图标模板检查:', {
    folderIconTemplate: !!folderIconTemplate,
    chevronIconTemplate: !!chevronIconTemplate,
    bookmarkIconTemplate: !!bookmarkIconTemplate
  });

  // 设置面板状态
  let isPanelOpen = false;
  // 智能整理面板状态
  let isOrganizePanelOpen = false;

  // 打开设置面板
  function openSettingsPanel() {
    console.log('打开设置面板');
    settingsPanel.classList.remove('translate-x-full');
    isPanelOpen = true;
  }

  // 关闭设置面板
  function closeSettingsPanel() {
    console.log('关闭设置面板');
    settingsPanel.classList.add('translate-x-full');
    isPanelOpen = false;
  }

  // 打开智能整理面板
  function openOrganizePanel() {
    console.log('打开智能整理面板');
    defaultView.classList.add('hidden');
    smartOrganizePanel.classList.remove('hidden');
    isOrganizePanelOpen = true;
    loadOrganizePanelData();
  }

  // 关闭智能整理面板
  function closeOrganizePanel() {
    console.log('关闭智能整理面板');
    defaultView.classList.remove('hidden');
    smartOrganizePanel.classList.add('hidden');
    isOrganizePanelOpen = false;
  }

  // 保存设置
  function handleSaveSettings() {
    console.log('保存设置');
    const selectedFolderId = rootFolderSelect.value;
    console.log('选中的文件夹ID:', selectedFolderId);
    
    // 获取文件夹模板管理器实例
    const templateManager = window.templateManager;
    
    // 合并所有设置并保存
    chrome.storage.local.set({ 
      rootFolderId: selectedFolderId,
      folderTemplate: templateManager.templateData 
    }, () => {
      templateManager.showNotification('设置保存成功', 'success');
      displayBookmarkTree(selectedFolderId);
      
      // 如果智能整理面板是打开状态，更新目标文件夹结构
      if (isOrganizePanelOpen && templateManager.templateData) {
        templateStructure.innerHTML = templateManager.generateTemplateHTML(templateManager.templateData);
      }
      
      closeSettingsPanel();
    });
  }

  function createFolderTitle(title, isOpen = false) {
    const div = document.createElement('div');
    div.className = 'folder-title';
    
    // 添加展开/折叠图标
    const chevronIcon = chevronIconTemplate.cloneNode(true);
    chevronIcon.classList.add('folder-title-icon');
    chevronIcon.dataset.state = isOpen ? 'open' : 'closed';
    div.appendChild(chevronIcon);
    
    // 添加文件夹图标
    const folderIcon = folderIconTemplate.cloneNode(true);
    folderIcon.classList.add('w-5', 'h-5', 'mr-2', 'text-gray-500');
    div.appendChild(folderIcon);
    
    // 添加标题文本
    const span = document.createElement('span');
    span.textContent = title;
    div.appendChild(span);
    
    return div;
  }

  function createBookmarkItem(title, url) {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    
    // 添加书签图标
    const icon = bookmarkIconTemplate.cloneNode(true);
    icon.classList.add('bookmark-icon');
    div.appendChild(icon);
    
    // 添加链接
    const link = document.createElement('a');
    link.href = url;
    link.textContent = title;
    link.target = '_blank';  // 在新标签页打开
    div.appendChild(link);
    
    return div;
  }

  function createFolder(title, isOpen = false) {
    const div = document.createElement('div');
    div.className = 'folder';
    
    // 创建文件夹标题
    const titleDiv = createFolderTitle(title, isOpen);
    div.appendChild(titleDiv);
    
    // 创建文件夹内容容器
    const content = document.createElement('div');
    content.className = 'folder-content';
    content.dataset.state = isOpen ? 'open' : 'closed';
    div.appendChild(content);
    
    // 添加点击事件处理
    titleDiv.addEventListener('click', () => {
      const chevron = titleDiv.querySelector('.folder-title-icon');
      const isCurrentlyOpen = chevron.dataset.state === 'open';
      
      // 切换图标状态
      chevron.dataset.state = isCurrentlyOpen ? 'closed' : 'open';
      content.dataset.state = isCurrentlyOpen ? 'closed' : 'open';
    });
    
    return { folder: div, content };
  }

  // 加载文件夹选项
  function loadFolderOptions() {
    console.log('开始加载文件夹选项');
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      console.log('获取到书签树:', bookmarkTreeNodes);
      // 清空选择框
      rootFolderSelect.innerHTML = '';
      
      // 添加"显示所有"选项
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '📚 显示所有书签';
      defaultOption.className = 'py-3 font-medium';
      rootFolderSelect.appendChild(defaultOption);

      // 添加分隔线选项
      const separator = document.createElement('option');
      separator.disabled = true;
      separator.textContent = '──────────';
      separator.className = 'text-gray-300 text-center';
      rootFolderSelect.appendChild(separator);
      
      // 递归获取所有文件夹
      function traverseFolders(node, level = 0) {
        if (node.children) {
          if (node.id !== '0') { // 排除根节点
            const option = document.createElement('option');
            option.value = node.id;
            // 使用特殊字符创建层级缩进，同时添加图标
            const indent = '　'.repeat(level);
            const prefix = level === 0 ? '📁' : '└─ 📁';
            option.textContent = `${indent}${prefix} ${node.title}`;
            option.className = `py-1.5 ${level === 0 ? 'font-medium' : 'font-normal'}`;
            rootFolderSelect.appendChild(option);
            foldersMap.set(node.id, node);
          }
          node.children.forEach(child => traverseFolders(child, level + 1));
        }
      }
      
      bookmarkTreeNodes.forEach(node => traverseFolders(node));
      console.log('文件夹选项加载完成');
      
      // 加载保存的根文件夹设置
      chrome.storage.local.get(['rootFolderId'], (result) => {
        console.log('加载保存的根文件夹设置:', result);
        if (result.rootFolderId) {
          rootFolderSelect.value = result.rootFolderId;
          displayBookmarkTree(result.rootFolderId);
        } else {
          displayBookmarkTree();
        }
      });
    });
  }

  // 显示书签树
  function displayBookmarkTree(rootId = '') {
    console.log('显示书签树, rootId:', rootId);
    // 清空现有内容
    while (bookmarkTreeElement.firstChild) {
      bookmarkTreeElement.removeChild(bookmarkTreeElement.firstChild);
    }
    
    if (rootId) {
      // 显示指定文件夹的内容
      chrome.bookmarks.getSubTree(rootId, (nodes) => {
        console.log('获取到子树:', nodes);
        if (nodes.length > 0) {
          if (nodes[0].children) {
            renderBookmarks(nodes[0].children, bookmarkTreeElement);
          }
        }
      });
    } else {
      // 显示完整书签树，但跳过根节点直接显示其子节点
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        console.log('获取到完整书签树:', bookmarkTreeNodes);
        if (bookmarkTreeNodes[0].children) {
          renderBookmarks(bookmarkTreeNodes[0].children, bookmarkTreeElement);
        }
      });
    }
  }

  // 递归创建书签树HTML结构
  function createBookmarkTree(bookmarkNode) {
    if (bookmarkNode.children) {
      // 这是一个文件夹
      const { folder, content } = createFolder(bookmarkNode.title);
      renderBookmarks(bookmarkNode.children, content);
      return folder;
    } else {
      // 这是一个书签
      return createBookmarkItem(bookmarkNode.title, bookmarkNode.url);
    }
  }

  function renderBookmarks(bookmarks, container) {
    bookmarks.forEach(bookmark => {
      const element = createBookmarkTree(bookmark);
      if (element) {
        container.appendChild(element);
      }
    });
  }

  // 绑定事件监听器
  console.log('绑定事件监听器');
  settingsButton.addEventListener('click', () => {
    console.log('设置按钮被点击');
    openSettingsPanel();
  });
  closeSettings.addEventListener('click', closeSettingsPanel);
  saveSettingsButton.addEventListener('click', handleSaveSettings);
  smartOrganizeBtn.addEventListener('click', openOrganizePanel);
  cancelOrganize.addEventListener('click', closeOrganizePanel);
  confirmOrganize.addEventListener('click', handleConfirmOrganize);

  // 初始化
  console.log('开始初始化');
  loadFolderOptions();

  // 创建全局实例
  window.templateManager = new FolderTemplateManager();
  
  // 初始化 OpenAI 设置管理器
  const openAISettings = new OpenAISettingsManager();
});

// 文件夹模板管理
class FolderTemplateManager {
  constructor() {
    this.templateData = [];  // 确保初始化为空数组
    this.init();
  }

  async init() {
    // 初始化模板数据
    const savedTemplate = await this.loadTemplateFromStorage();
    if (savedTemplate) {
      this.templateData = Array.isArray(savedTemplate) ? savedTemplate : [];
    } else {
      // 如果没有保存的模板，使用当前根文件夹结构
      const rootFolder = document.getElementById('rootFolderSelect').value;
      if (rootFolder) {
        const structure = await this.getCurrentFolderStructure(rootFolder);
        this.templateData = Array.isArray(structure) ? structure : [];
      }
    }
    this.renderTemplate();
    this.bindEvents();
  }

  async getCurrentFolderStructure(folderId) {
    try {
      const folder = await chrome.bookmarks.getSubTree(folderId);
      if (!folder || !folder[0] || !folder[0].children) return [];
      
      const children = folder[0].children.filter(child => !child.url); // 只保留文件夹
      const result = [];
      
      for (const child of children) {
        const childStructure = await this.getCurrentFolderStructure(child.id);
        result.push({
          id: crypto.randomUUID(),
          title: child.title,
          children: childStructure,
          isOpen: false
        });
      }
      
      return result;
    } catch (error) {
      console.error('获取文件夹结构失败:', error);
      return [];
    }
  }

  async loadTemplateFromStorage() {
    try {
      const result = await chrome.storage.local.get('folderTemplate');
      return result.folderTemplate || null;
    } catch (error) {
      console.error('加载模板失败:', error);
      return null;
    }
  }

  async saveTemplateToStorage() {
    try {
      await chrome.storage.local.set({ folderTemplate: this.templateData });
      this.showNotification('模板保存成功', 'success');
    } catch (error) {
      console.error('保存模板失败:', error);
      this.showNotification('模板保存失败', 'error');
    }
  }

  renderTemplate() {
    const container = document.getElementById('templateTreeContainer');
    container.innerHTML = this.generateTemplateHTML(this.templateData);
  }

  generateTemplateHTML(items, level = 0) {
    if (!items || !items.length) return '';
    
    return items.map(item => `
      <div class="folder-item" data-id="${item.id}">
        <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
          <div class="flex items-center">
            <div class="flex items-center" style="margin-left: ${level * 24}px">
              ${item.children && item.children.length > 0 ? `
                <svg class="w-4 h-4 text-gray-400 mr-1 transform transition-transform folder-toggle ${item.isOpen ? 'rotate-90' : ''}" 
                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              ` : '<div class="w-4 mr-1"></div>'}
              <svg class="w-5 h-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span class="folder-name text-gray-700">${item.title}</span>
            </div>
          </div>
          <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button class="add-subfolder text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button class="rename-folder text-sm text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button class="delete-folder text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div class="folder-content ml-4 ${item.isOpen ? '' : 'hidden'}">
          ${this.generateTemplateHTML(item.children, level + 1)}
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    const container = document.getElementById('templateTreeContainer');
    const addRootButton = document.getElementById('addRootFolder');
    const importButton = document.getElementById('importRootStructure');

    addRootButton.addEventListener('click', () => this.addFolder());
    importButton.addEventListener('click', () => this.importRootStructure());

    container.addEventListener('click', (e) => {
      const folderItem = e.target.closest('.folder-item');
      if (!folderItem) return;

      const folderId = folderItem.dataset.id;
      
      // 处理文件夹展开/折叠
      if (e.target.closest('.folder-toggle')) {
        this.toggleFolder(folderId);
        return;
      }

      // 处理其他按钮点击
      if (e.target.closest('.add-subfolder')) {
        this.addFolder(folderId);
      } else if (e.target.closest('.rename-folder')) {
        this.renameFolder(folderId);
      } else if (e.target.closest('.delete-folder')) {
        this.deleteFolder(folderId);
      }
    });
  }

  addFolder(parentId = null) {
    const folderName = prompt('请输入文件夹名称:');
    if (!folderName) return;

    const newFolder = {
      id: crypto.randomUUID(),
      title: folderName,
      children: [],
      isOpen: false
    };

    if (!parentId) {
      // 确保 templateData 是数组
      if (!Array.isArray(this.templateData)) {
        this.templateData = [];
      }
      this.templateData.push(newFolder);
    } else {
      this.updateFolderInTree(this.templateData, parentId, (folder) => {
        if (!Array.isArray(folder.children)) {
          folder.children = [];
        }
        folder.children.push(newFolder);
      });
    }

    this.renderTemplate();
  }

  renameFolder(folderId) {
    const newName = prompt('请输入新的文件夹名称:');
    if (!newName) return;

    this.updateFolderInTree(this.templateData, folderId, (folder) => {
      folder.title = newName;
    });

    this.renderTemplate();
  }

  deleteFolder(folderId) {
    if (!confirm('确定要删除此文件夹吗？子文件夹也会被删除。')) return;

    const deleteFromArray = (arr) => {
      const index = arr.findIndex(item => item.id === folderId);
      if (index !== -1) {
        arr.splice(index, 1);
        return true;
      }
      for (const item of arr) {
        if (item.children && deleteFromArray(item.children)) {
          return true;
        }
      }
      return false;
    };

    deleteFromArray(this.templateData);
    this.renderTemplate();
  }

  updateFolderInTree(items, folderId, callback) {
    for (const item of items) {
      if (item.id === folderId) {
        callback(item);
        return true;
      }
      if (item.children && this.updateFolderInTree(item.children, folderId, callback)) {
        return true;
      }
    }
    return false;
  }

  toggleFolder(folderId) {
    this.updateFolderInTree(this.templateData, folderId, (folder) => {
      folder.isOpen = !folder.isOpen;
    });
    this.renderTemplate();
  }

  async importRootStructure() {
    const rootFolder = document.getElementById('rootFolderSelect').value;
    if (!rootFolder) {
      this.showNotification('请先选择根文件夹', 'error');
      return;
    }

    if (!confirm('导入将会清空当前的模板设置，确定要继续吗？')) {
      return;
    }

    try {
      this.templateData = await this.getCurrentFolderStructure(rootFolder);
      this.renderTemplate();
      this.showNotification('导入成功', 'success');
    } catch (error) {
      console.error('导入失败:', error);
      this.showNotification('导入失败', 'error');
    }
  }

  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white flex items-center`;
    
    // 添加图标
    const icon = document.createElement('div');
    icon.className = 'mr-2';
    if (type === 'success') {
      icon.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>`;
    } else if (type === 'error') {
      icon.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>`;
    }
    notification.appendChild(icon);
    
    // 添加消息文本
    const text = document.createElement('span');
    text.textContent = message;
    notification.appendChild(text);

    // 添加到页面
    document.body.appendChild(notification);

    // 2秒后移除
    setTimeout(() => {
      notification.classList.add('notification-hide');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// OpenAI API 设置管理类
class OpenAISettingsManager {
  constructor() {
    this.apiKeyInput = document.getElementById('openaiApiKey');
    this.apiUrlInput = document.getElementById('openaiApiUrl');
    this.modelSelect = document.getElementById('openaiModel');
    this.customModelInput = document.getElementById('openaiCustomModel');
    this.customModelContainer = document.getElementById('customModelInput');
    this.toggleApiKeyButton = document.getElementById('toggleApiKey');
    
    this.init();
  }

  init() {
    // 加载保存的设置
    this.loadSettings();
    
    // 绑定事件
    this.bindEvents();
  }

  bindEvents() {
    // API Key 显示/隐藏切换
    this.toggleApiKeyButton.addEventListener('click', () => {
      const type = this.apiKeyInput.type;
      this.apiKeyInput.type = type === 'password' ? 'text' : 'password';
      
      // 更新图标
      const svg = this.toggleApiKeyButton.querySelector('svg');
      if (type === 'password') {
        svg.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        `;
      } else {
        svg.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        `;
      }
    });

    // 输入验证和自动保存
    this.apiKeyInput.addEventListener('input', () => {
      this.validateAndSave();
    });

    this.apiUrlInput.addEventListener('input', () => {
      this.validateAndSave();
    });

    // 模型选择和自定义模型处理
    this.modelSelect.addEventListener('change', () => {
      this.handleModelChange();
      this.validateAndSave();
    });

    this.customModelInput.addEventListener('input', () => {
      this.validateAndSave();
    });
  }

  handleModelChange() {
    const isCustom = this.modelSelect.value === 'custom';
    this.customModelContainer.classList.toggle('hidden', !isCustom);
    
    if (!isCustom) {
      this.customModelInput.value = '';
    }
  }

  validateAndSave() {
    const apiKey = this.apiKeyInput.value.trim();
    const apiUrl = this.apiUrlInput.value.trim();
    const modelValue = this.modelSelect.value;
    const customModel = this.customModelInput.value.trim();

    // API Key 验证
    if (apiKey && !apiKey.startsWith('sk-')) {
      this.showError(this.apiKeyInput, '无效的 API Key 格式');
      return false;
    } else {
      this.clearError(this.apiKeyInput);
    }

    // API URL 验证
    try {
      new URL(apiUrl);
      this.clearError(this.apiUrlInput);
    } catch (e) {
      this.showError(this.apiUrlInput, '无效的 URL 格式');
      return false;
    }

    // 自定义模型验证
    if (modelValue === 'custom' && !customModel) {
      this.showError(this.customModelInput, '请输入自定义模型名称');
      return false;
    } else {
      this.clearError(this.customModelInput);
    }

    // 保存设置
    this.saveSettings();
    return true;
  }

  showError(element, message) {
    // 移除旧的错误提示
    this.clearError(element);
    
    // 添加错误样式
    element.classList.add('border-red-500');
    
    // 创建错误消息元素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 error-message';
    errorDiv.textContent = message;
    
    // 插入错误消息
    element.parentNode.appendChild(errorDiv);
  }

  clearError(element) {
    element.classList.remove('border-red-500');
    const errorMessage = element.parentNode.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.local.get(['openaiSettings']);
      if (settings.openaiSettings) {
        const { apiKey, apiUrl, model, customModel } = settings.openaiSettings;
        this.apiKeyInput.value = apiKey || '';
        this.apiUrlInput.value = apiUrl || 'https://api.openai.com/v1';
        
        // 处理模型设置
        if (customModel) {
          this.modelSelect.value = 'custom';
          this.customModelInput.value = customModel;
          this.handleModelChange();
        } else {
          this.modelSelect.value = model || 'gpt-3.5-turbo';
        }
      }
    } catch (error) {
      console.error('加载 OpenAI 设置失败:', error);
    }
  }

  async saveSettings() {
    try {
      const modelValue = this.modelSelect.value;
      const settings = {
        apiKey: this.apiKeyInput.value.trim(),
        apiUrl: this.apiUrlInput.value.trim(),
        model: modelValue === 'custom' ? 'custom' : modelValue,
        customModel: modelValue === 'custom' ? this.customModelInput.value.trim() : ''
      };
      
      await chrome.storage.local.set({ openaiSettings: settings });
      console.log('OpenAI 设置已保存');
    } catch (error) {
      console.error('保存 OpenAI 设置失败:', error);
    }
  }
}

// 加载智能整理面板数据
async function loadOrganizePanelData() {
  try {
    // 从 chrome.storage.local 获取根文件夹设置
    const { rootFolderId } = await chrome.storage.local.get('rootFolderId');
    if (!rootFolderId) {
      window.templateManager.showNotification('请先在设置中选择根文件夹', 'error');
      closeOrganizePanel();
      return;
    }

    // 加载原书签树
    const bookmarks = await chrome.bookmarks.getSubTree(rootFolderId);
    if (bookmarks && bookmarks[0]) {
      originalBookmarkTree.innerHTML = generateBookmarkTreeHTML(bookmarks[0]);
    }

    // 从 chrome.storage.local 获取文件夹模板
    const { folderTemplate } = await chrome.storage.local.get('folderTemplate');
    if (folderTemplate) {
      templateStructure.innerHTML = window.templateManager.generateTemplateHTML(folderTemplate);
    } else {
      templateStructure.innerHTML = '<div class="text-gray-500 p-4">未设置文件夹模板</div>';
    }
  } catch (error) {
    console.error('加载智能整理面板数据失败:', error);
    window.templateManager.showNotification('加载数据失败', 'error');
  }
}

// 生成书签树HTML
function generateBookmarkTreeHTML(bookmark, level = 0) {
  const padding = level * 20;
  let html = '';

  if (bookmark.children) {
    html += `
      <div class="folder-item" data-id="${bookmark.id}">
        <div class="flex items-center p-2 hover:bg-gray-50 rounded" style="padding-left: ${padding}px">
          <svg class="w-5 h-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span class="text-gray-700">${bookmark.title}</span>
        </div>
        <div class="folder-content">
          ${bookmark.children.map(child => generateBookmarkTreeHTML(child, level + 1)).join('')}
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="bookmark-item" data-id="${bookmark.id}">
        <div class="flex items-center p-2 hover:bg-gray-50 rounded" style="padding-left: ${padding}px">
          <svg class="w-4 h-4 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <a href="${bookmark.url}" target="_blank" class="text-blue-600 hover:text-blue-800">${bookmark.title}</a>
        </div>
      </div>
    `;
  }

  return html;
}

// 确认整理
async function handleConfirmOrganize() {
  try {
    // 获取当前根文件夹ID和模板数据
    const { rootFolderId } = await chrome.storage.local.get('rootFolderId');
    const { folderTemplate } = await chrome.storage.local.get('folderTemplate');
    
    if (!rootFolderId || !folderTemplate) {
      window.templateManager.showNotification('缺少必要的配置信息', 'error');
      return;
    }

    // 显示确认对话框
    if (!confirm('此操作将重新组织您的书签结构，建议先备份书签。是否继续？')) {
      return;
    }

    window.templateManager.showNotification('开始整理书签...', 'info');

    // 获取当前根文件夹下的所有书签
    const rootFolder = (await chrome.bookmarks.getSubTree(rootFolderId))[0];
    const bookmarks = getAllBookmarks(rootFolder);

    // 创建新的文件夹结构
    const folderMap = new Map(); // 用于存储模板ID到实际文件夹ID的映射
    await createFolderStructure(folderTemplate, rootFolderId, folderMap);

    // 智能分类书签
    await classifyBookmarks(bookmarks, folderMap, folderTemplate);

    window.templateManager.showNotification('书签整理完成', 'success');
    closeOrganizePanel();
    
    // 刷新书签树显示
    displayBookmarkTree(rootFolderId);
  } catch (error) {
    console.error('书签整理失败:', error);
    window.templateManager.showNotification('整理失败: ' + error.message, 'error');
  }
}

// 获取所有书签（不包括文件夹）
function getAllBookmarks(node) {
  let bookmarks = [];
  
  if (node.children) {
    for (const child of node.children) {
      if (child.url) {
        bookmarks.push(child);
      } else {
        bookmarks = bookmarks.concat(getAllBookmarks(child));
      }
    }
  }
  
  return bookmarks;
}

// 递归创建文件夹结构
async function createFolderStructure(template, parentId, folderMap) {
  for (const folder of template) {
    try {
      // 创建文件夹
      const newFolder = await chrome.bookmarks.create({
        parentId: parentId,
        title: folder.title
      });
      
      // 保存模板ID到实际文件夹ID的映射
      folderMap.set(folder.id, newFolder.id);
      
      // 递归创建子文件夹
      if (folder.children && folder.children.length > 0) {
        await createFolderStructure(folder.children, newFolder.id, folderMap);
      }
    } catch (error) {
      console.error(`创建文件夹 ${folder.title} 失败:`, error);
      throw error;
    }
  }
}

// 智能分类书签
async function classifyBookmarks(bookmarks, folderMap, template) {
  const openaiSettings = await chrome.storage.local.get('openaiSettings');
  if (!openaiSettings.openaiSettings?.apiKey) {
    throw new Error('请先配置 OpenAI API Key');
  }

  const { apiKey, apiUrl, model, customModel } = openaiSettings.openaiSettings;
  const selectedModel = model === 'custom' ? customModel : model;

  // 构建文件夹路径描述
  const folderPaths = buildFolderPaths(template);
  
  // 批量处理书签
  const batchSize = 5;
  for (let i = 0; i < bookmarks.length; i += batchSize) {
    const batch = bookmarks.slice(i, i + batchSize);
    const promises = batch.map(bookmark => 
      classifyBookmark(bookmark, folderPaths, folderMap, apiKey, apiUrl, selectedModel)
    );
    
    await Promise.all(promises);
    
    // 更新进度
    const progress = Math.min(100, Math.round((i + batchSize) / bookmarks.length * 100));
    window.templateManager.showNotification(`正在整理: ${progress}%`, 'info');
  }
}

// 构建文件夹路径描述
function buildFolderPaths(template, parentPath = '', result = []) {
  for (const folder of template) {
    const currentPath = parentPath ? `${parentPath} > ${folder.title}` : folder.title;
    result.push({
      id: folder.id,
      path: currentPath,
      description: `${currentPath}: 适合存放与${folder.title}相关的书签`
    });
    
    if (folder.children && folder.children.length > 0) {
      buildFolderPaths(folder.children, currentPath, result);
    }
  }
  
  return result;
}

// 对单个书签进行分类
async function classifyBookmark(bookmark, folderPaths, folderMap, apiKey, apiUrl, model) {
  try {
    // 准备 API 请求数据
    const prompt = `作为一个书签分类助手，请帮我将以下书签放入最合适的文件夹。
书签信息：
- 标题: ${bookmark.title}
- URL: ${bookmark.url}

可选的文件夹路径：
${folderPaths.map(f => `- ${f.description}`).join('\n')}

请只返回最合适的文件夹路径的ID，格式如下：
{folder_id}`;

    // 调用 OpenAI API
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const folderId = data.choices[0].message.content.trim();
    
    // 获取实际的文件夹ID
    const actualFolderId = folderMap.get(folderId);
    if (!actualFolderId) {
      console.warn(`未找到文件夹ID ${folderId} 的映射，将保持书签位置不变`);
      return;
    }

    // 移动书签到对应文件夹
    await chrome.bookmarks.move(bookmark.id, {
      parentId: actualFolderId
    });
  } catch (error) {
    console.error(`处理书签 ${bookmark.title} 失败:`, error);
    // 继续处理其他书签，不中断整个过程
  }
} 