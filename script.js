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
        this.filesGrid = document.getElementById('filesGrid');
        this.emptyState = document.getElementById('emptyState');
    }

    bindEvents() {
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

    loadFiles() {
        // 从GitHub仓库加载文件列表
        this.loadFilesFromGitHub();
    }

    async loadFilesFromGitHub() {
        try {
            console.log('Loading files from GitHub...');
            const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${this.filesPath}`);
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Files data:', data);
                this.files = data.map(item => ({
                    id: item.sha,
                    name: item.name,
                    size: item.size,
                    type: this.getMimeTypeFromName(item.name),
                    uploadDate: new Date().toISOString(), // 使用当前时间
                    url: item.download_url,
                    path: item.path
                }));
                console.log('Processed files:', this.files);
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
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    renderFiles() {
        if (!this.filesGrid || !this.emptyState) {
            console.error('File grid elements not found');
            return;
        }

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
        this.showNotification(`开始下载 ${file.name}`, 'info');
        
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
            this.showNotification(`${file.name} 下载已开始`, 'success');
        }, 100);
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
    console.log('DOM loaded, initializing FileUploadManager...');
    fileManager = new FileUploadManager();
    console.log('FileUploadManager initialized');
});

// 添加全局错误处理
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// 添加页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && fileManager) {
        // 页面重新可见时刷新文件列表
        fileManager.loadFiles();
    }
});
