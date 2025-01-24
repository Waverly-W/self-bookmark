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
    smartOrganizeBtn.classList.remove('btn-primary');
    smartOrganizeBtn.classList.add('btn-secondary', 'bg-gray-200');
    loadOrganizePanelData();
  }

  // 关闭智能整理面板
  function closeOrganizePanel() {
    console.log('关闭智能整理面板');
    defaultView.classList.remove('hidden');
    smartOrganizePanel.classList.add('hidden');
    isOrganizePanelOpen = false;
    smartOrganizeBtn.classList.remove('btn-secondary', 'bg-gray-200');
    smartOrganizeBtn.classList.add('btn-primary');
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
  smartOrganizeBtn.addEventListener('click', () => {
    if (isOrganizePanelOpen) {
      closeOrganizePanel();
    } else {
      openOrganizePanel();
    }
  });
  document.getElementById('startOrganize').addEventListener('click', handleStartOrganize);
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
    
    return items.map((item, index) => `
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
            <button class="move-up-folder text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button class="move-down-folder text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50 ${index === items.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
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
      } else if (e.target.closest('.move-up-folder:not(.cursor-not-allowed)')) {
        this.moveFolder(folderId, 'up');
      } else if (e.target.closest('.move-down-folder:not(.cursor-not-allowed)')) {
        this.moveFolder(folderId, 'down');
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

  moveFolder(folderId, direction) {
    const moveInArray = (arr) => {
      const index = arr.findIndex(item => item.id === folderId);
      if (index !== -1) {
        if (direction === 'up' && index > 0) {
          // 向上移动
          [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
          return true;
        } else if (direction === 'down' && index < arr.length - 1) {
          // 向下移动
          [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
          return true;
        }
        return false;
      }
      // 递归查找子文件夹
      for (const item of arr) {
        if (item.children && moveInArray(item.children)) {
          return true;
        }
      }
      return false;
    };

    if (moveInArray(this.templateData)) {
      this.renderTemplate();
      this.saveTemplateToStorage();
    }
  }
}

// OpenAI API 设置管理类
class OpenAISettingsManager {
  constructor() {
    this.apiKeyInput = document.getElementById('openaiApiKey');
    this.apiUrlInput = document.getElementById('openaiApiUrl');
    this.modelSelect = document.getElementById('openaiModel');
    this.customModelInput = document.getElementById('customModelInput');
    this.customModelField = document.getElementById('openaiCustomModel');
    this.testApiButton = document.getElementById('testApiConnection');
    this.apiTestResult = document.getElementById('apiTestResult');
    this.apiTestMessage = document.getElementById('apiTestMessage');
    this.apiTestLoading = document.getElementById('apiTestLoading');
    this.apiTestSuccessIcon = document.getElementById('apiTestSuccessIcon');
    this.apiTestErrorIcon = document.getElementById('apiTestErrorIcon');
    this.toggleApiKeyButton = document.getElementById('toggleApiKey');

    this.init();
  }

  init() {
    this.loadSettings();
    this.bindEvents();
  }

  bindEvents() {
    // API Key 显示/隐藏切换
    this.toggleApiKeyButton.addEventListener('click', () => {
      const type = this.apiKeyInput.type;
      this.apiKeyInput.type = type === 'password' ? 'text' : 'password';
    });

    // 模型选择变更
    this.modelSelect.addEventListener('change', () => {
      this.handleModelChange();
      this.validateAndSave();
    });

    // 输入验证和自动保存
    this.apiKeyInput.addEventListener('input', () => this.validateAndSave());
    this.apiUrlInput.addEventListener('input', () => this.validateAndSave());
    this.customModelField?.addEventListener('input', () => this.validateAndSave());

    // 添加 API 测试事件
    this.testApiButton.addEventListener('click', () => this.testApiConnection());
  }

  handleModelChange() {
    const isCustom = this.modelSelect.value === 'custom';
    this.customModelInput.classList.toggle('hidden', !isCustom);
    
    if (!isCustom) {
      this.customModelField.value = '';
    }
  }

  validateAndSave() {
    const apiKey = this.apiKeyInput.value.trim();
    const apiUrl = this.apiUrlInput.value.trim();
    const modelValue = this.modelSelect.value;
    const customModel = this.customModelField?.value.trim();

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
      this.showError(this.customModelField, '请输入自定义模型名称');
      return false;
    } else {
      this.clearError(this.customModelField);
    }

    // 保存设置
    this.saveSettings();
    return true;
  }

  showError(element, message) {
    element.classList.add('border-red-500');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 error-message';
    errorDiv.textContent = message;
    element.parentNode.appendChild(errorDiv);
  }

  clearError(element) {
    if (!element) return;
    element.classList.remove('border-red-500');
    const errorMessage = element.parentNode.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  async testApiConnection() {
    // 重置测试状态
    this.resetTestStatus();
    this.showTestLoading(true);

    try {
      const apiKey = this.apiKeyInput.value.trim();
      const apiUrl = this.apiUrlInput.value.trim();
      const model = this.modelSelect.value === 'custom' 
        ? this.customModelField.value.trim() 
        : this.modelSelect.value;

      if (!apiKey) {
        throw new Error('请输入 API Key');
      }

      if (!apiUrl) {
        throw new Error('请输入 API URL');
      }

      // 构建请求 URL
      const requestUrl = `${apiUrl}/chat/completions`;

      // 发送测试请求
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ],
          max_tokens: 5
        })
      });

      const data = await response.json();

      if (response.ok) {
        this.showTestSuccess('API 连接成功');
      } else {
        throw new Error(data.error?.message || '未知错误');
      }
    } catch (error) {
      this.showTestError(`API 测试失败: ${error.message}`);
    } finally {
      this.showTestLoading(false);
    }
  }

  resetTestStatus() {
    this.apiTestResult.classList.add('hidden');
    this.apiTestSuccessIcon.classList.add('hidden');
    this.apiTestErrorIcon.classList.add('hidden');
    this.apiTestMessage.textContent = '';
  }

  showTestLoading(show) {
    if (show) {
      this.apiTestLoading.classList.remove('hidden');
      this.testApiButton.disabled = true;
    } else {
      this.apiTestLoading.classList.add('hidden');
      this.testApiButton.disabled = false;
    }
  }

  showTestSuccess(message) {
    this.apiTestResult.classList.remove('hidden');
    this.apiTestResult.classList.add('flex');
    this.apiTestSuccessIcon.classList.remove('hidden');
    this.apiTestMessage.textContent = message;
    this.apiTestMessage.classList.remove('text-red-500');
    this.apiTestMessage.classList.add('text-green-500');
  }

  showTestError(message) {
    this.apiTestResult.classList.remove('hidden');
    this.apiTestResult.classList.add('flex');
    this.apiTestErrorIcon.classList.remove('hidden');
    this.apiTestMessage.textContent = message;
    this.apiTestMessage.classList.remove('text-green-500');
    this.apiTestMessage.classList.add('text-red-500');
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.local.get(['openaiSettings']);
      if (settings.openaiSettings) {
        const { apiKey, apiUrl, model, customModel } = settings.openaiSettings;
        this.apiKeyInput.value = apiKey || '';
        this.apiUrlInput.value = apiUrl || 'https://api.openai.com/v1';
        
        // 处理模型设置
        if (model === 'custom' && customModel) {
          this.modelSelect.value = 'custom';
          this.customModelField.value = customModel;
          this.handleModelChange();
        } else {
          this.modelSelect.value = model || 'gpt-3.5-turbo';
        }
      }
    } catch (error) {
      console.error('加载 OpenAI 设置失败:', error);
      window.templateManager?.showNotification('加载设置失败: ' + error.message, 'error');
    }
  }

  async saveSettings() {
    try {
      const modelValue = this.modelSelect.value;
      const settings = {
        apiKey: this.apiKeyInput.value.trim(),
        apiUrl: this.apiUrlInput.value.trim(),
        model: modelValue,
        customModel: modelValue === 'custom' ? this.customModelField?.value?.trim() || '' : ''
      };
      
      await chrome.storage.local.set({ openaiSettings: settings });
      console.log('OpenAI 设置已保存');
      
      // 显示成功提示
      window.templateManager?.showNotification('设置已保存', 'success');
    } catch (error) {
      console.error('保存 OpenAI 设置失败:', error);
      // 显示错误提示
      window.templateManager?.showNotification('保存设置失败: ' + error.message, 'error');
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
      // 创建目标文件夹结构的操作按钮
      const templateHeader = document.createElement('div');
      templateHeader.className = 'flex justify-between items-center mb-4';
      templateHeader.innerHTML = `
        <div class="flex space-x-2">
          <button id="templateAddRootFolder" class="btn-secondary text-sm">
            添加根文件夹
          </button>
        </div>
      `;
      templateStructure.innerHTML = '';
      templateStructure.appendChild(templateHeader);

      // 创建模板树容器
      const templateTreeContainer = document.createElement('div');
      templateTreeContainer.id = 'organizeTemplateTreeContainer';
      templateTreeContainer.className = 'space-y-2';
      templateTreeContainer.innerHTML = window.templateManager.generateTemplateHTML(folderTemplate);
      templateStructure.appendChild(templateTreeContainer);

      // 绑定事件
      bindTemplateEvents();
    } else {
      templateStructure.innerHTML = '<div class="text-gray-500 p-4">未设置文件夹模板</div>';
    }
  } catch (error) {
    console.error('加载智能整理面板数据失败:', error);
    window.templateManager.showNotification('加载数据失败', 'error');
  }
}

// 绑定目标文件夹结构的事件
function bindTemplateEvents() {
  const container = document.getElementById('organizeTemplateTreeContainer');
  const addRootButton = document.getElementById('templateAddRootFolder');

  // 添加根文件夹按钮事件
  addRootButton.addEventListener('click', () => {
    const folderName = prompt('请输入文件夹名称:');
    if (!folderName) return;

    const newFolder = {
      id: crypto.randomUUID(),
      title: folderName,
      children: [],
      isOpen: false
    };

    // 更新模板数据
    window.templateManager.templateData.push(newFolder);
    
    // 重新渲染模板树
    container.innerHTML = window.templateManager.generateTemplateHTML(window.templateManager.templateData);
    
    // 自动保存更改
    window.templateManager.saveTemplateToStorage();
  });

  // 文件夹操作事件
  container.addEventListener('click', (e) => {
    const folderItem = e.target.closest('.folder-item');
    if (!folderItem) return;

    const folderId = folderItem.dataset.id;
    
    // 处理文件夹展开/折叠
    if (e.target.closest('.folder-toggle')) {
      window.templateManager.toggleFolder(folderId);
      container.innerHTML = window.templateManager.generateTemplateHTML(window.templateManager.templateData);
      return;
    }

    // 处理其他按钮点击
    if (e.target.closest('.add-subfolder')) {
      const folderName = prompt('请输入文件夹名称:');
      if (!folderName) return;

      const newFolder = {
        id: crypto.randomUUID(),
        title: folderName,
        children: [],
        isOpen: false
      };

      window.templateManager.updateFolderInTree(window.templateManager.templateData, folderId, (folder) => {
        if (!Array.isArray(folder.children)) {
          folder.children = [];
        }
        folder.children.push(newFolder);
      });

      container.innerHTML = window.templateManager.generateTemplateHTML(window.templateManager.templateData);
      window.templateManager.saveTemplateToStorage();
    } else if (e.target.closest('.rename-folder')) {
      const newName = prompt('请输入新的文件夹名称:');
      if (!newName) return;

      window.templateManager.updateFolderInTree(window.templateManager.templateData, folderId, (folder) => {
        folder.title = newName;
      });

      container.innerHTML = window.templateManager.generateTemplateHTML(window.templateManager.templateData);
      window.templateManager.saveTemplateToStorage();
    } else if (e.target.closest('.delete-folder')) {
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

      deleteFromArray(window.templateManager.templateData);
      container.innerHTML = window.templateManager.generateTemplateHTML(window.templateManager.templateData);
      window.templateManager.saveTemplateToStorage();
    } else if (e.target.closest('.move-up-folder:not(.cursor-not-allowed)')) {
      window.templateManager.moveFolder(folderId, 'up');
      container.innerHTML = window.templateManager.generateTemplateHTML(window.templateManager.templateData);
    } else if (e.target.closest('.move-down-folder:not(.cursor-not-allowed)')) {
      window.templateManager.moveFolder(folderId, 'down');
      container.innerHTML = window.templateManager.generateTemplateHTML(window.templateManager.templateData);
    }
  });
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

// 添加全局变量用于控制整理过程
let isOrganizing = false;

// 添加全局变量存储整理结果
let organizeResults = {
  bookmarks: [],
  template: null
};

// 开始整理
async function handleStartOrganize() {
  try {
    // 获取选项状态
    const renameEnabled = document.getElementById('renameOption').checked;
    const moveEnabled = document.getElementById('moveOption').checked;

    // 如果都没选中，显示提示并返回
    if (!renameEnabled && !moveEnabled) {
      window.templateManager.showNotification('请至少选择一个整理选项', 'warning');
      return;
    }

    // 获取当前根文件夹ID和模板数据
    const { rootFolderId } = await chrome.storage.local.get('rootFolderId');
    const { folderTemplate } = await chrome.storage.local.get('folderTemplate');
    
    if (!rootFolderId || !folderTemplate) {
      window.templateManager.showNotification('缺少必要的配置信息', 'error');
      return;
    }

    // 获取 OpenAI 设置
    const openaiSettings = await chrome.storage.local.get('openaiSettings');
    if (!openaiSettings.openaiSettings?.apiKey) {
      window.templateManager.showNotification('请先配置 OpenAI API Key', 'error');
      return;
    }

    // 显示确认对话框
    if (!confirm('此操作将重新组织您的书签结构，建议先备份书签。是否继续？')) {
      return;
    }

    // 设置整理状态
    isOrganizing = true;

    // 重置进度显示
    resetProgress();

    // 显示进度面板
    const progressPanel = document.getElementById('progressPanel');
    progressPanel.classList.remove('hidden');

    // 获取当前根文件夹下的所有书签
    const rootFolder = (await chrome.bookmarks.getSubTree(rootFolderId))[0];
    const bookmarks = getAllBookmarks(rootFolder);
    
    // 构建文件夹路径描述
    const folderPaths = moveEnabled ? buildFolderPaths(folderTemplate) : [];

    // 批量处理书签
    const batchSize = 3;
    const results = {
      success: 0,
      failed: 0,
      skipped: 0
    };

    // 绑定停止按钮事件
    const stopButton = document.getElementById('stopOrganize');
    stopButton.addEventListener('click', () => {
      isOrganizing = false;
      window.templateManager.showNotification('正在停止整理...', 'warning');
    });

    const totalCount = bookmarks.length;
    for (let i = 0; i < bookmarks.length && isOrganizing; i += batchSize) {
      const batch = bookmarks.slice(i, Math.min(i + batchSize, bookmarks.length));
      
      // 更新进度
      const progress = Math.min(100, Math.round(i / totalCount * 100));
      updateProgress(progress);

      // 并行处理当前批次
      const promises = batch.map(bookmark => 
        processBookmark(
          bookmark, 
          folderPaths, 
          openaiSettings.openaiSettings,
          results,
          { renameEnabled, moveEnabled }
        )
      );

      await Promise.all(promises);

      // 更新计数显示
      updateCounters(results);

      // 等待一小段时间，避免请求过快
      if (isOrganizing) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 完成处理
    if (isOrganizing) {
      updateProgress(100);
      document.querySelector('.item-name').textContent = '处理完成';
      // 切换图标显示
      document.querySelector('.processing-spinner').classList.add('hidden');
      document.querySelector('.completed-icon').classList.remove('hidden');
      
      // 显示结果统计
      window.templateManager.showNotification(
        `处理完成: 成功${results.success}，失败${results.failed}，跳过${results.skipped}`,
        results.failed === 0 ? 'success' : 'warning'
      );
    } else {
      window.templateManager.showNotification(
        `整理已停止: 成功${results.success}，失败${results.failed}，跳过${results.skipped}`,
        'warning'
      );
    }

    // 保存模板数据
    organizeResults.template = folderTemplate;

    // 更新原书签树显示
    const bookmarkNodes = await chrome.bookmarks.getSubTree(rootFolderId);
    if (bookmarkNodes && bookmarkNodes[0]) {
      originalBookmarkTree.innerHTML = generateBookmarkTreeHTML(bookmarkNodes[0]);
    }

  } catch (error) {
    console.error('书签整理失败:', error);
    window.templateManager.showNotification('整理失败: ' + error.message, 'error');
  } finally {
    isOrganizing = false;
  }
}

// 更新计数器显示
function updateCounters(results) {
  document.querySelector('.success-count').textContent = `成功: ${results.success}`;
  document.querySelector('.failed-count').textContent = `失败: ${results.failed}`;
}

// 更新进度显示
function updateProgress(percentage) {
  document.querySelector('.percentage').textContent = `${percentage}%`;
}

// 重置进度显示
function resetProgress() {
  document.querySelector('.processing-spinner').classList.remove('hidden');
  document.querySelector('.completed-icon').classList.add('hidden');
  document.querySelector('.item-name').textContent = '准备开始...';
  document.querySelector('.percentage').textContent = '0%';
  document.querySelector('.success-count').textContent = '成功: 0';
  document.querySelector('.failed-count').textContent = '失败: 0';
  document.getElementById('recentResults').innerHTML = '';
}

// 添加到最近结果
function addToRecentResults(result) {
  const recentResults = document.getElementById('recentResults');
  const resultDiv = document.createElement('div');
  resultDiv.className = `p-2 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`;
  
  let content = `
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <span class="font-medium">${result.oldTitle}</span>
  `;
  
  if (result.success) {
    if (result.newTitle && result.newTitle !== result.oldTitle) {
      content += ` → <span class="text-green-600">${result.newTitle}</span>`;
    }
    if (result.folderPath) {
      content += `<br><span class="text-gray-500">移动到: ${result.folderPath}</span>`;
    }
  } else {
    content += `<br><span class="text-red-500">错误: ${result.error}</span>`;
  }
  
  content += `
      </div>
      <svg class="w-5 h-5 ${result.success ? 'text-green-500' : 'text-red-500'}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${result.success ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}" />
      </svg>
    </div>
  `;
  
  resultDiv.innerHTML = content;
  recentResults.insertBefore(resultDiv, recentResults.firstChild);
}

// 处理单个书签
async function processBookmark(bookmark, folderPaths, openaiSettings, results, options) {
  try {
    // 更新当前处理项显示
    document.querySelector('.item-name').textContent = bookmark.title;

    let newTitle = bookmark.title;
    let folderId = null;
    let folderPath = null;

    // 根据选项执行相应的操作
    if (options.renameEnabled) {
      // 调用 OpenAI API 重命名书签
      newTitle = await renameBookmark(bookmark, openaiSettings);
    }
    
    if (options.moveEnabled) {
      // 调用 OpenAI API 分类书签
      const result = await classifyBookmark(
        bookmark,
        newTitle,
        folderPaths,
        openaiSettings
      );
      folderId = result.folderId;
      folderPath = result.folderPath;
    }

    // 存储分析结果
    const bookmarkResult = {
      id: bookmark.id,
      oldTitle: bookmark.title,
      newTitle: newTitle,
      url: bookmark.url,
      targetFolderId: folderId,
      targetFolderPath: folderPath
    };
    
    organizeResults.bookmarks.push(bookmarkResult);

    // 更新结果统计
    results.success++;
    
    // 添加到最近结果
    addToRecentResults({
      success: true,
      oldTitle: bookmark.title,
      newTitle: options.renameEnabled ? newTitle : null,
      folderPath: options.moveEnabled ? folderPath : null
    });

  } catch (error) {
    console.error(`处理书签 ${bookmark.title} 失败:`, error);
    results.failed++;
    
    // 添加到最近结果
    addToRecentResults({
      success: false,
      oldTitle: bookmark.title,
      error: error.message
    });
  }
}

// 重命名书签
async function renameBookmark(bookmark, openaiSettings) {
  const prompt = `你是一个专业的书签命名助手。请根据以下信息为书签创建一个结构化的新名称：

原始名称: ${bookmark.title}
URL: ${bookmark.url}

命名规则：三级定位法（平台标识+核心功能+补充说明）
1. 平台标识：网站/平台的核心名称
2. 核心功能：主要用途或分类
3. 补充说明：
   - 对于网站/工具/平台：用简短词语描述具体用途
   - 对于文章/教程/文档/曲谱等具体内容：保留原标题作为补充说明

符号体系：
🚀 高频使用的重要资源
📚 学习教程文档类
💼 工作流相关
⚙️ 工具类资源
🌐 官方网站
📅 时效性内容

格式要求：
1. 使用英文竖线" | "分隔三个层级（注意竖线两侧要加空格）
2. 将合适的 emoji 放在最前面
3. 使用简体中文
4. 确保命名简洁且信息完整

示例：
网站/工具类：
📺 B站 | 科技区 | 硬件评测合集
⚙️ GitHub | 代码托管 | Vue项目模板
💼 ProcessOn | 流程图 | 产品原型

具体内容类：
📚 掘金 | Vue教程 | 深入理解Vue3组件化开发
📅 知乎 | 技术专栏 | 2024前端技术发展趋势分析
🎵 QQ音乐 | 曲谱 | 梁祝小提琴协奏曲
📄 MDN | CSS文档 | Grid布局完全指南

请只返回新名称，不需要解释。`;

  const response = await fetch(`${openaiSettings.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiSettings.apiKey}`
    },
    body: JSON.stringify({
      model: openaiSettings.model === 'custom' ? openaiSettings.customModel : openaiSettings.model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 50
    })
  });

  if (!response.ok) {
    throw new Error(`重命名API请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// 分类书签
async function classifyBookmark(bookmark, newTitle, folderPaths, openaiSettings) {
  const prompt = `你是一个专业的书签分类助手。请根据以下信息将书签分类到最合适的目标文件夹：

书签信息：
- 标题: ${bookmark.title}
- 新标题: ${newTitle}
- URL: ${bookmark.url}

可用的目标文件夹结构：
${folderPaths.map(f => `- ${f.id}: ${f.path}`).join('\n')}

要求：
1. 分析书签内容和URL特征
2. 考虑网站的主要用途
3. 优先选择更具体的子文件夹
4. 如果内容跨多个类别，选择最主要的一个
5. 考虑文件夹的层级关系
6. 必须返回上述文件夹列表中的某个ID

请只返回最合适的文件夹ID，不要返回路径，不要加任何额外说明，格式如下：
ID值`;

  const response = await fetch(`${openaiSettings.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiSettings.apiKey}`
    },
    body: JSON.stringify({
      model: openaiSettings.model === 'custom' ? openaiSettings.customModel : openaiSettings.model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 50
    })
  });

  if (!response.ok) {
    throw new Error(`分类API请求失败: ${response.status}`);
  }

  const data = await response.json();
  const folderId = data.choices[0].message.content.trim();
  
  // 验证返回的文件夹ID是否有效
  const folderInfo = folderPaths.find(f => f.id === folderId);
  if (!folderInfo) {
    console.warn(`API返回的文件夹ID无效: ${folderId}，将使用根文件夹`);
    return { 
      folderId: 'root',
      folderPath: '根文件夹'
    };
  }

  return { 
    folderId: folderInfo.id,
    folderPath: folderInfo.path
  };
}

// 应用变更
async function handleConfirmOrganize() {
  try {
    if (!organizeResults.bookmarks.length) {
      window.templateManager.showNotification('没有可应用的变更', 'warning');
      return;
    }

    // 获取选项状态
    const renameEnabled = document.getElementById('renameOption').checked;
    const moveEnabled = document.getElementById('moveOption').checked;

    // 获取当前根文件夹ID和模板数据
    const { rootFolderId } = await chrome.storage.local.get('rootFolderId');
    const { folderTemplate } = await chrome.storage.local.get('folderTemplate');
    
    if (!rootFolderId || (moveEnabled && !folderTemplate)) {
      window.templateManager.showNotification('缺少必要的配置信息', 'error');
      return;
    }

    // 显示确认对话框
    if (!confirm('确定要应用这些变更吗？此操作无法撤消。')) {
      return;
    }

    let folderMap = new Map();
    folderMap.set('root', rootFolderId);

    // 如果需要移动文件夹，则创建文件夹结构
    if (moveEnabled) {
      // 显示进度
      document.querySelector('.item-name').textContent = '正在清理原有文件夹结构...';

      // 清理原有文件夹结构
      try {
        const rootFolder = (await chrome.bookmarks.getSubTree(rootFolderId))[0];
        if (rootFolder.children) {
          // 先移动所有书签到根文件夹
          for (const child of rootFolder.children) {
            await moveBookmarksToRoot(child, rootFolderId);
          }
          // 然后删除所有子文件夹
          for (const child of rootFolder.children) {
            if (!child.url) {
              await chrome.bookmarks.removeTree(child.id);
            }
          }
        }
      } catch (error) {
        throw new Error(`清理原有文件夹结构失败: ${error.message}`);
      }

      // 显示进度
      document.querySelector('.item-name').textContent = '正在创建新的文件夹结构...';

      // 创建文件夹结构并记录新旧ID映射
      try {
        await createFolderStructure(folderTemplate, rootFolderId, folderMap);
        console.log('文件夹映射表:', Object.fromEntries(folderMap));
      } catch (error) {
        throw new Error(`创建文件夹结构失败: ${error.message}`);
      }
    }

    // 更新书签
    let success = 0;
    let failed = 0;
    const total = organizeResults.bookmarks.length;

    for (let i = 0; i < organizeResults.bookmarks.length; i++) {
      const bookmark = organizeResults.bookmarks[i];
      
      // 更新进度
      const progress = Math.round((i + 1) / total * 100);
      updateProgress(progress);
      document.querySelector('.item-name').textContent = `正在更新书签 (${i + 1}/${total})...`;

      try {
        // 如果启用了重命名，更新书签标题
        if (renameEnabled && bookmark.newTitle !== bookmark.oldTitle) {
          await chrome.bookmarks.update(bookmark.id, { 
            title: bookmark.newTitle 
          });
        }
        
        // 如果启用了移动文件夹，移动书签到目标文件夹
        if (moveEnabled && bookmark.targetFolderId) {
          // 获取目标文件夹的实际 ID
          const actualFolderId = folderMap.get(bookmark.targetFolderId);
          if (!actualFolderId) {
            console.warn(`找不到目标文件夹的映射ID: ${bookmark.targetFolderId}，将使用根文件夹`);
            console.warn('当前书签:', bookmark);
            console.warn('可用的映射:', Object.fromEntries(folderMap));
          }
          
          // 移动书签到目标文件夹
          const targetFolderId = actualFolderId || rootFolderId;
          await chrome.bookmarks.move(bookmark.id, { 
            parentId: targetFolderId
          });
        }
        
        console.log(`书签更新成功: ${bookmark.oldTitle} -> ${bookmark.newTitle}`);
        success++;
      } catch (error) {
        console.error(`更新书签 ${bookmark.oldTitle} 失败:`, error);
        console.error('书签信息:', bookmark);
        failed++;
      }
    }

    // 显示结果
    window.templateManager.showNotification(
      `变更已应用: 成功${success}，失败${failed}`,
      failed === 0 ? 'success' : 'warning'
    );

    // 切换图标显示
    document.querySelector('.processing-spinner').classList.add('hidden');
    document.querySelector('.completed-icon').classList.remove('hidden');
    document.querySelector('.item-name').textContent = '变更已应用';

    // 清空结果
    organizeResults = {
      bookmarks: [],
      template: null
    };

    // 关闭面板并切换到默认视图
    document.getElementById('defaultView').classList.remove('hidden');
    document.getElementById('smartOrganizePanel').classList.add('hidden');
    
    // 更新原书签树显示
    const bookmarkTree = await chrome.bookmarks.getSubTree(rootFolderId);
    if (bookmarkTree && bookmarkTree[0]) {
      document.getElementById('bookmarkTree').innerHTML = generateBookmarkTreeHTML(bookmarkTree[0]);
    }

  } catch (error) {
    console.error('应用变更失败:', error);
    window.templateManager.showNotification('应用变更失败: ' + error.message, 'error');
  }
}

// 创建文件夹结构并记录新旧ID映射
async function createFolderStructure(folders, parentId, folderMap) {
  for (const folder of folders) {
    try {
      // 创建文件夹
      const newFolder = await chrome.bookmarks.create({
        parentId: parentId,
        title: folder.title
      });
      
      // 保存新旧ID映射
      folderMap.set(folder.id, newFolder.id);
      console.log(`文件夹映射: ${folder.title} - 模板ID(${folder.id}) -> 新ID(${newFolder.id})`);

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

// 递归移动文件夹中的所有书签到根文件夹
async function moveBookmarksToRoot(node, rootId) {
  if (node.children) {
    for (const child of node.children) {
      if (child.url) {
        // 如果是书签，移动到根文件夹
        try {
          await chrome.bookmarks.move(child.id, { parentId: rootId });
        } catch (error) {
          console.error(`移动书签失败: ${error.message}`);
        }
      } else {
        // 如果是文件夹，递归处理
        await moveBookmarksToRoot(child, rootId);
      }
    }
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

// 构建文件夹路径描述
function buildFolderPaths(template, parentPath = '', result = []) {
  for (const folder of template) {
    const currentPath = parentPath ? `${parentPath} > ${folder.title}` : folder.title;
    result.push({
      id: folder.id,  // 这是模板中的ID
      path: currentPath,
      title: folder.title,  // 添加标题信息，用于后续匹配
      description: `${currentPath}: 适合存放与${folder.title}相关的书签`
    });
    
    if (folder.children && folder.children.length > 0) {
      buildFolderPaths(folder.children, currentPath, result);
    }
  }
  
  return result;
}

// 绑定进度面板展开/收起事件
document.addEventListener('DOMContentLoaded', () => {
  const progressHeader = document.getElementById('progressHeader');
  const progressDetails = document.getElementById('progressDetails');
  const expandProgress = document.getElementById('expandProgress');
  
  progressHeader.addEventListener('click', () => {
    const isExpanded = !progressDetails.classList.contains('hidden');
    progressDetails.classList.toggle('hidden');
    expandProgress.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  // 在应用变更后清理进度显示
  document.getElementById('confirmOrganize').addEventListener('click', () => {
    const progressPanel = document.getElementById('progressPanel');
    progressPanel.classList.add('hidden');
    document.getElementById('recentResults').innerHTML = '';
    document.querySelector('.success-count').textContent = '成功: 0';
    document.querySelector('.failed-count').textContent = '失败: 0';
    document.querySelector('.percentage').textContent = '0%';
    document.querySelector('.item-name').textContent = '准备开始...';
  });
}); 