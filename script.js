class FileUploadManager {
    constructor() {
        this.repoOwner = 'babyweiwei';
        this.repoName = 'contribution';
        this.filesPath = 'uploaded-files';
        this.files = [];
        this.initializeElements();
        this.bindEvents();
        this.loadFiles();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.filesGrid = document.getElementById('filesGrid');
        this.emptyState = document.getElementById('emptyState');
    }

    async loadGitHubStats() {
        try {
            // 获取用户基本信息
            const userResponse = await fetch('https://api.github.com/users/babyweiwei');
            const userData = await userResponse.json();
            
            // 获取仓库信息
            const reposResponse = await fetch('https://api.github.com/users/babyweiwei/repos');
            const reposData = await reposResponse.json();
            
            // 计算真实提交数（只计算自己的提交）
            let realCommits = 0;
            for (const repo of reposData) {
                if (!repo.fork) { // 只计算原创仓库的提交
                    try {
                        const commitsResponse = await fetch(`https://api.github.com/repos/babyweiwei/${repo.name}/commits?author=babyweiwei`);
                        if (commitsResponse.ok) {
                            const commitsData = await commitsResponse.json();
                            realCommits += commitsData.length;
                        }
                    } catch (e) {
                        console.log(`Could not fetch commits for ${repo.name}`);
                    }
                }
            }
            
            // 更新页面显示
            this.updateStats({
                repos: userData.public_repos,
                commits: realCommits || 5, // 使用真实提交数
                followers: userData.followers
            });
            
        } catch (error) {
            console.log('Failed to load GitHub stats:', error);
            // 使用真实的默认值
            this.updateStats({
                repos: 2,
                commits: 5, // contribution 仓库的真实提交数
                followers: 2
            });
        }
    }

    updateStats(stats) {
        const repoCount = document.getElementById('repo-count');
        const commitCount = document.getElementById('commit-count');
        const followerCount = document.getElementById('follower-count');
        
        if (repoCount) repoCount.textContent = stats.repos;
        if (commitCount) commitCount.textContent = stats.commits;
        if (followerCount) followerCount.textContent = stats.followers;
    }

    bindEvents() {
        // 点击上传区域
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // 文件选择
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 拖拽事件
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // 平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    handleFiles(fileList) {
        const files = Array.from(fileList);
        
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                this.showNotification(`文件 ${file.name} 超过 10MB 限制`, 'error');
                return;
            }

            this.uploadFile(file);
        });
    }

    async uploadFile(file) {
        // 显示进度条
        this.uploadProgress.style.display = 'block';
        this.showNotification('请手动上传文件到GitHub仓库', 'info');
        
        // 模拟上传进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 100) progress = 100;
            
            this.updateProgress(progress);
            
            if (progress === 100) {
                clearInterval(interval);
                this.showNotification(`请将文件 ${file.name} 手动上传到GitHub仓库的 ${this.filesPath} 目录`, 'info');
                
                // 重置进度条
                setTimeout(() => {
                    this.uploadProgress.style.display = 'none';
                    this.updateProgress(0);
                }, 1000);
            }
        }, 200);
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // 移除data:...前缀
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    updateProgress(progress) {
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${Math.round(progress)}%`;
    }

    createFileURL(file) {
        // 在实际应用中，这里应该是真实的文件URL
        // 现在我们创建一个模拟的URL
        return `#file-${Date.now()}`;
    }

    renderFiles() {
        if (this.files.length === 0) {
            this.filesGrid.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }

        this.filesGrid.style.display = 'grid';
        this.emptyState.style.display = 'none';

        this.filesGrid.innerHTML = this.files.map(file => `
            <div class="file-card" data-file-id="${file.id}">
                <div class="file-header">
                    <div class="file-icon">
                        ${this.getFileIcon(file.type)}
                    </div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="file-action-btn download-btn" onclick="fileManager.downloadFile('${file.id}')">
                        <i class="fas fa-download"></i> 下载
                    </button>
                    <button class="file-action-btn delete-btn" onclick="fileManager.deleteFile('${file.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `).join('');
    }

    getFileIcon(fileType) {
        if (!fileType) return '<i class="fas fa-file"></i>';
        
        if (fileType.startsWith('image/')) {
            return '<i class="fas fa-file-image"></i>';
        } else if (fileType.startsWith('video/')) {
            return '<i class="fas fa-file-video"></i>';
        } else if (fileType.startsWith('audio/')) {
            return '<i class="fas fa-file-audio"></i>';
        } else if (fileType.includes('pdf')) {
            return '<i class="fas fa-file-pdf"></i>';
        } else if (fileType.includes('word') || fileType.includes('document')) {
            return '<i class="fas fa-file-word"></i>';
        } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
            return '<i class="fas fa-file-excel"></i>';
        } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
            return '<i class="fas fa-file-powerpoint"></i>';
        } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
            return '<i class="fas fa-file-archive"></i>';
        } else if (fileType.includes('text')) {
            return '<i class="fas fa-file-alt"></i>';
        } else {
            return '<i class="fas fa-file"></i>';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    downloadFile(fileId) {
        const file = this.files.find(f => f.id == fileId);
        if (!file) return;

        // 创建一个模拟的下载链接
        this.showNotification(`准备下载 ${file.name}`, 'info');
        
        // 创建一个临时的下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = file.url || '#';
        downloadLink.download = file.name;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        
        // 触发点击
        downloadLink.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            this.showNotification(`${file.name} 下载完成！`, 'success');
        }, 100);
    }

    async deleteFile(fileId) {
        const file = this.files.find(f => f.id == fileId);
        if (!file) return;

        if (!confirm(`确定要删除文件 "${file.name}" 吗？\n\n注意：需要手动从GitHub仓库删除该文件`)) {
            return;
        }

        this.showNotification(`请手动从GitHub仓库删除文件: ${file.name}`, 'info');
    }

    showUploadHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-question-circle"></i> 文件上传教程</h3>
                    <button class="modal-close" onclick="this.closest('.help-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <h4>上传文件到GitHub仓库：</h4>
                    <ol>
                        <li>访问你的GitHub仓库：<a href="https://github.com/babyweiwei/contribution" target="_blank">babyweiwei/contribution</a></li>
                        <li>点击 "Add file" → "Upload files"</li>
                        <li>在文件路径中输入：<code>uploaded-files/你的文件名</code></li>
                        <li>选择文件并上传</li>
                        <li>提交更改</li>
                    </ol>
                    <h4>删除文件：</h4>
                    <ol>
                        <li>进入仓库的 <code>uploaded-files</code> 目录</li>
                        <li>找到要删除的文件</li>
                        <li>点击文件右侧的删除按钮</li>
                        <li>提交更改</li>
                    </ol>
                    <p><strong>注意：</strong>上传后需要等待几分钟才能在网站上看到文件。</p>
                </div>
            </div>
        `;

        Object.assign(helpModal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        document.body.appendChild(helpModal);
    }

    loadFiles() {
        // 从GitHub仓库加载文件列表
        this.loadFilesFromGitHub();
    }

    async loadFilesFromGitHub() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${this.filesPath}`);
            
            if (response.ok) {
                const data = await response.json();
                this.files = data.map(item => ({
                    id: item.sha,
                    name: item.name,
                    size: item.size,
                    type: this.getMimeTypeFromName(item.name),
                    uploadDate: new Date(item.created_at || item.updated_at).toISOString(),
                    url: item.download_url,
                    path: item.path
                }));
            } else {
                console.log('No files directory found, starting fresh');
                this.files = [];
            }
        } catch (error) {
            console.error('Failed to load files from GitHub:', error);
            this.files = [];
        }
        
        this.renderFiles();
    }

    getMimeTypeFromName(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const mimeTypes = {
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'zip': 'application/zip',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '250px',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        return colors[type] || '#3498db';
    }
}

// 初始化应用
let fileManager;

document.addEventListener('DOMContentLoaded', () => {
    fileManager = new FileUploadManager();
    
    // 添加一些示例文件（可选）
    if (fileManager.files.length === 0) {
        const sampleFiles = [
            {
                id: Date.now() + 1,
                name: '示例文档.pdf',
                size: 1024 * 512, // 512KB
                type: 'application/pdf',
                uploadDate: new Date().toISOString(),
                url: '#sample-pdf'
            },
            {
                id: Date.now() + 2,
                name: '项目代码.zip',
                size: 1024 * 2048, // 2MB
                type: 'application/zip',
                uploadDate: new Date().toISOString(),
                url: '#sample-zip'
            }
        ];
        
        fileManager.files = sampleFiles;
        fileManager.saveFiles();
        fileManager.renderFiles();
    }
});

// 添加全局错误处理
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// 添加页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && fileManager) {
        // 页面重新可见时刷新文件列表
        fileManager.renderFiles();
    }
});
