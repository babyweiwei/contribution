class FileUploadManager {
    constructor() {
        this.files = this.loadFiles();
        this.initializeElements();
        this.bindEvents();
        this.renderFiles();
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

    uploadFile(file) {
        // 显示进度条
        this.uploadProgress.style.display = 'block';
        
        // 模拟上传进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 100) progress = 100;
            
            this.updateProgress(progress);
            
            if (progress === 100) {
                clearInterval(interval);
                
                // 保存文件信息
                const fileInfo = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadDate: new Date().toISOString(),
                    url: this.createFileURL(file)
                };
                
                this.files.push(fileInfo);
                this.saveFiles();
                this.renderFiles();
                
                // 重置进度条
                setTimeout(() => {
                    this.uploadProgress.style.display = 'none';
                    this.updateProgress(0);
                }, 1000);
                
                this.showNotification(`文件 ${file.name} 上传成功！`, 'success');
            }
        }, 200);
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

        // 在实际应用中，这里会触发真实的文件下载
        // 现在我们模拟下载过程
        this.showNotification(`开始下载 ${file.name}`, 'info');
        
        // 模拟下载延迟
        setTimeout(() => {
            this.showNotification(`${file.name} 下载完成！`, 'success');
        }, 1500);
    }

    deleteFile(fileId) {
        const fileIndex = this.files.findIndex(f => f.id == fileId);
        if (fileIndex === -1) return;

        const fileName = this.files[fileIndex].name;
        
        if (confirm(`确定要删除文件 "${fileName}" 吗？`)) {
            this.files.splice(fileIndex, 1);
            this.saveFiles();
            this.renderFiles();
            this.showNotification(`文件 ${fileName} 已删除`, 'success');
        }
    }

    saveFiles() {
        // 在实际应用中，这里会保存到服务器
        // 现在我们保存到 localStorage
        localStorage.setItem('uploadedFiles', JSON.stringify(this.files));
    }

    loadFiles() {
        // 从 localStorage 加载文件列表
        const saved = localStorage.getItem('uploadedFiles');
        return saved ? JSON.parse(saved) : [];
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
