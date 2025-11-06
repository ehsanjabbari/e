// Enhanced GitHub Integration with Gists
class GitHubGistManager {
    constructor() {
        this.token = '';
        this.gistId = '';
        this.baseURL = 'https://api.github.com';
    }

    // Set token securely (user can input this in UI)
    setToken(token) {
        this.token = token;
    }

    // Set Gist ID
    setGistId(gistId) {
        this.gistId = gistId;
    }

    // Create a new Gist
    async createNewGist() {
        if (!this.token) {
            throw new Error('توکن GitHub تنظیم نشده است');
        }

        const data = {
            description: `Inventory Backup - ${new Date().toLocaleString('fa-IR')}`,
            public: true, // Public gist for easy access
            files: {
                'inventory-backup.json': {
                    content: this.getCurrentData()
                }
            }
        };

        try {
            const response = await fetch(`${this.baseURL}/gists`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'خطا در ایجاد Gist');
            }

            const gist = await response.json();
            this.gistId = gist.id;
            return {
                success: true,
                gistId: gist.id,
                gistUrl: gist.html_url
            };
        } catch (error) {
            console.error('خطا در ایجاد Gist:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update existing Gist
    async updateGist() {
        if (!this.token) {
            throw new Error('توکن GitHub تنظیم نشده است');
        }

        if (!this.gistId) {
            throw new Error('شناسه Gist تنظیم نشده است');
        }

        const data = {
            files: {
                'inventory-backup.json': {
                    content: this.getCurrentData()
                }
            }
        };

        try {
            const response = await fetch(`${this.baseURL}/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'خطا در بروزرسانی Gist');
            }

            return {
                success: true,
                message: 'بکاپ با موفقیت به Gist ارسال شد'
            };
        } catch (error) {
            console.error('خطا در بروزرسانی Gist:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Load data from Gist
    async loadFromGist() {
        if (!this.gistId) {
            throw new Error('شناسه Gist تنظیم نشده است');
        }

        try {
            // For public gists, we can use the public API without token
            const response = await fetch(`${this.baseURL}/gists/${this.gistId}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'خطا در دریافت اطلاعات Gist');
            }

            const gist = await response.json();
            
            // Find the inventory-backup.json file
            const backupFile = gist.files['inventory-backup.json'];
            if (!backupFile) {
                throw new Error('فایل inventory-backup.json در Gist پیدا نشد');
            }

            const data = JSON.parse(backupFile.content);
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('خطا در بارگیری از Gist:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Helper method to get current app data
    getCurrentData() {
        return JSON.stringify({
            products: appState.products,
            inputInvoices: appState.inputInvoices,
            sales151: appState.sales151,
            sales168: appState.sales168,
            timestamp: new Date().toISOString()
        }, null, 2);
    }

    // Create comprehensive backup including Gist ID
    async createCompleteBackup() {
        const result = await this.createNewGist();
        if (result.success) {
            // Save Gist ID for future use
            localStorage.setItem('githubGistId', this.gistId);
            localStorage.setItem('lastGistUrl', result.gistUrl);
        }
        return result;
    }

    // Update Gist with current data
    async updateCompleteBackup() {
        if (!this.gistId) {
            // Try to load from localStorage
            this.gistId = localStorage.getItem('githubGistId') || '';
        }
        
        if (this.gistId) {
            return await this.updateGist();
        } else {
            return await this.createNewGist();
        }
    }
}

// Initialize GitHub Gist Manager
const gistManager = new GitHubGistManager();

// Enhanced backup functions with GitHub integration
async function backupToGitHubGist() {
    // Load saved settings
    const token = localStorage.getItem('githubToken') || '';
    const gistId = localStorage.getItem('githubGistId') || '';
    
    if (!token) {
        showNotification('لطفاً توکن GitHub را در تنظیمات وارد کنید', 'error');
        return;
    }

    gistManager.setToken(token);
    gistManager.setGistId(gistId);

    showNotification('در حال ارسال بکاپ به GitHub...', 'info');

    try {
        const result = await gistManager.updateCompleteBackup();
        
        if (result.success) {
            showNotification('بکاپ با موفقیت به GitHub Gist ارسال شد!', 'success');
            
            // Save the new Gist ID
            if (result.gistId) {
                localStorage.setItem('githubGistId', result.gistId);
            }
            
            // Also save to local file as backup
            downloadBackupFile();
            
        } else {
            showNotification(`خطا: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('خطا در بکاپ GitHub:', error);
        showNotification('خطا در ارسال بکاپ به GitHub', 'error');
    }
}

async function loadFromGitHubGist() {
    const token = localStorage.getItem('githubToken') || '';
    const gistId = localStorage.getItem('githubGistId') || '';
    
    if (!gistId) {
        showNotification('شناسه Gist پیدا نشد. ابتدا بکاپ ایجاد کنید.', 'error');
        return;
    }

    gistManager.setToken(token);
    gistManager.setGistId(gistId);

    showNotification('در حال بارگیری بکاپ از GitHub...', 'info');

    try {
        const result = await gistManager.loadFromGist();
        
        if (result.success) {
            // Merge the loaded data with current state
            appState = { ...appState, ...result.data };
            saveData();
            
            // Refresh all displays
            renderProducts();
            renderInputInvoices();
            renderSales151();
            renderSales168();
            renderInventory();
            
            showNotification('بازیابی از GitHub با موفقیت انجام شد!', 'success');
        } else {
            showNotification(`خطا: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('خطا در بارگیری از GitHub:', error);
        showNotification('خطا در بارگیری بکاپ از GitHub', 'error');
    }
}

// Create new Gist (for setup)
async function createNewGist() {
    const token = localStorage.getItem('githubToken') || '';
    
    if (!token) {
        showNotification('لطفاً ابتدا توکن GitHub را در تنظیمات وارد کنید', 'error');
        return;
    }

    gistManager.setToken(token);
    gistManager.setGistId(''); // Clear existing Gist ID

    showNotification('در حال ایجاد Gist جدید...', 'info');

    try {
        const result = await gistManager.createNewGist();
        
        if (result.success) {
            showNotification('Gist جدید با موفقیت ایجاد شد!', 'success');
            localStorage.setItem('githubGistId', result.gistId);
            localStorage.setItem('lastGistUrl', result.gistUrl);
        } else {
            showNotification(`خطا: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('خطا در ایجاد Gist:', error);
        showNotification('خطا در ایجاد Gist', 'error');
    }
}

// Local file backup (as additional security)
function downloadBackupFile() {
    const data = {
        products: appState.products,
        inputInvoices: appState.inputInvoices,
        sales151: appState.sales151,
        sales168: appState.sales168,
        gistId: localStorage.getItem('githubGistId') || '',
        gistUrl: localStorage.getItem('lastGistUrl') || '',
        timestamp: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const persianDate = new Date().toLocaleDateString('fa-IR');
    a.download = `inventory-backup-${persianDate}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
}

// Add GitHub settings to the settings tab
function addGitHubSettings() {
    const settingsContainer = document.querySelector('.settings-content');
    
    const githubSettings = document.createElement('div');
    githubSettings.className = 'settings-card';
    githubSettings.innerHTML = `
        <h3>تنظیمات GitHub</h3>
        <div class="settings-group">
            <label>توکن Personal Access:</label>
            <input type="password" id="github-token" placeholder="ghp_..." class="settings-input">
            <small class="settings-help">
                از GitHub > Settings > Developer settings > Personal access tokens
            </small>
        </div>
        <div class="settings-group">
            <label>شناسه Gist:</label>
            <input type="text" id="github-gist-id" placeholder="نشانی Gist یا فقط ID" class="settings-input">
            <small class="settings-help">
                اگر Gist وجود دارد، ID آن را وارد کنید
            </small>
        </div>
        <div class="settings-actions">
            <button class="primary-btn" onclick="saveGitHubSettings()">
                <i data-lucide="save"></i>
                ذخیره تنظیمات
            </button>
            <button class="secondary-btn" onclick="createNewGist()">
                <i data-lucide="plus"></i>
                ایجاد Gist جدید
            </button>
        </div>
    `;
    
    settingsContainer.appendChild(githubSettings);
    
    // Load existing settings
    const token = localStorage.getItem('githubToken') || '';
    const gistId = localStorage.getItem('githubGistId') || '';
    
    document.getElementById('github-token').value = token;
    document.getElementById('github-gist-id').value = gistId;
    
    // Initialize Lucide icons
    lucide.createIcons();
}

function saveGitHubSettings() {
    const token = document.getElementById('github-token').value.trim();
    const gistId = document.getElementById('github-gist-id').value.trim();
    
    if (token) {
        localStorage.setItem('githubToken', token);
    }
    
    if (gistId) {
        localStorage.setItem('githubGistId', gistId);
    }
    
    showNotification('تنظیمات GitHub ذخیره شد', 'success');
}