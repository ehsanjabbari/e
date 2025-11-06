// Application State
let appState = {
    products: [],
    inputInvoices: [],
    sales151: [],
    sales168: [],
    settings: {
        githubToken: '',
        githubRepo: '',
        githubUsername: ''
    }
};

// Load data from localStorage
function loadData() {
    try {
        const savedData = localStorage.getItem('inventoryData');
        if (savedData) {
            const data = JSON.parse(savedData);
            appState = { ...appState, ...data };
        }
    } catch (error) {
        console.error('خطا در بارگذاری داده‌ها:', error);
        showNotification('خطا در بارگذاری داده‌ها', 'error');
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('inventoryData', JSON.stringify(appState));
    } catch (error) {
        console.error('خطا در ذخیره داده‌ها:', error);
        showNotification('خطا در ذخیره داده‌ها', 'error');
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Tab Management
function initializeTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            
            // Remove active class from all nav items and tab contents
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked nav item and corresponding tab
            item.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Refresh tab data
            refreshTabData(targetTab);
        });
    });
}

// Refresh tab data
function refreshTabData(tabName) {
    switch(tabName) {
        case 'products':
            renderProducts();
            break;
        case 'input-invoices':
            renderInputInvoices();
            break;
        case 'sales-151':
            renderSales151();
            break;
        case 'sales-168':
            renderSales168();
            break;
        case 'inventory':
            renderInventory();
            break;
    }
}

// Product Management
function renderProducts() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';
    
    appState.products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${product.id}" title="ویرایش">
                    <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${product.id}" title="حذف">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
    
    // Refresh icons
    lucide.createIcons();
}

function addProduct() {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const input = document.getElementById('product-name');
    
    title.textContent = 'افزودن محصول';
    input.value = '';
    
    modal.dataset.action = 'add';
    modal.dataset.id = '';
    modal.classList.add('active');
    input.focus();
}

function editProduct(id) {
    const product = appState.products.find(p => p.id === id);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const input = document.getElementById('product-name');
    
    title.textContent = 'ویرایش محصول';
    input.value = product.name;
    
    modal.dataset.action = 'edit';
    modal.dataset.id = id;
    modal.classList.add('active');
    input.focus();
}

function deleteProduct(id) {
    // Check if product is used in invoices
    const isUsed = appState.inputInvoices.some(invoice => 
        invoice.items.some(item => item.productId === id)
    ) || appState.sales151.some(sale => 
        sale.items.some(item => item.productId === id)
    ) || appState.sales168.some(sale => 
        sale.items.some(item => item.productId === id)
    );
    
    if (isUsed) {
        showNotification('امکان حذف این محصول وجود ندارد. در فاکتورها استفاده شده است.', 'warning');
        return;
    }
    
    const product = appState.products.find(p => p.id === id);
    if (!product) return;
    
    showConfirmModal('آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟', () => {
        appState.products = appState.products.filter(p => p.id !== id);
        saveData();
        renderProducts();
        showNotification('محصول با موفقیت حذف شد', 'success');
    });
}

// Invoice Management
function renderInputInvoices() {
    const tbody = document.querySelector('#input-invoices-table tbody');
    tbody.innerHTML = '';
    
    const sortedInvoices = [...appState.inputInvoices].sort((a, b) => {
        return b.date.localeCompare(a.date);
    });
    
    sortedInvoices.forEach(invoice => {
        const row = document.createElement('tr');
        const productsText = invoice.items.map(item => {
            const product = appState.products.find(p => p.id === item.productId);
            return `${product?.name || 'نامشخص'}: ${item.quantity}`;
        }).join('، ');
        
        row.innerHTML = `
            <td>${formatPersianDate(invoice.date)}</td>
            <td>${productsText}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${invoice.id}" title="ویرایش">
                    <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${invoice.id}" title="حذف">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editInputInvoice(btn.dataset.id));
    });
    
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteInputInvoice(btn.dataset.id));
    });
    
    // Refresh icons
    lucide.createIcons();
}

function addInputInvoice() {
    showInvoiceModal('add', '');
}

function editInputInvoice(id) {
    showInvoiceModal('edit', id);
}

function deleteInputInvoice(id) {
    const invoice = appState.inputInvoices.find(i => i.id === id);
    if (!invoice) return;
    
    showConfirmModal('آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟', () => {
        appState.inputInvoices = appState.inputInvoices.filter(i => i.id !== id);
        saveData();
        renderInputInvoices();
        renderInventory();
        showNotification('فاکتور با موفقیت حذف شد', 'success');
    });
}

// Sales Management
function renderSales151() {
    const tbody = document.querySelector('#sales-151-table tbody');
    tbody.innerHTML = '';
    
    const sortedSales = [...appState.sales151].sort((a, b) => {
        return b.date.localeCompare(a.date);
    });
    
    sortedSales.forEach(sale => {
        const row = document.createElement('tr');
        const productsText = sale.items.map(item => {
            const product = appState.products.find(p => p.id === item.productId);
            return `${product?.name || 'نامشخص'}: ${item.quantity}`;
        }).join('، ');
        
        row.innerHTML = `
            <td>${formatPersianDate(sale.date)}</td>
            <td>${productsText}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${sale.id}" title="ویرایش">
                    <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${sale.id}" title="حذف">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editSale151(btn.dataset.id));
    });
    
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSale151(btn.dataset.id));
    });
    
    // Refresh icons
    lucide.createIcons();
}

function renderSales168() {
    const tbody = document.querySelector('#sales-168-table tbody');
    tbody.innerHTML = '';
    
    const sortedSales = [...appState.sales168].sort((a, b) => {
        return b.date.localeCompare(a.date);
    });
    
    sortedSales.forEach(sale => {
        const row = document.createElement('tr');
        const productsText = sale.items.map(item => {
            const product = appState.products.find(p => p.id === item.productId);
            return `${product?.name || 'نامشخص'}: ${item.quantity}`;
        }).join('، ');
        
        row.innerHTML = `
            <td>${formatPersianDate(sale.date)}</td>
            <td>${productsText}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${sale.id}" title="ویرایش">
                    <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${sale.id}" title="حذف">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editSale168(btn.dataset.id));
    });
    
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSale168(btn.dataset.id));
    });
    
    // Refresh icons
    lucide.createIcons();
}

function addSale151() {
    showInvoiceModal('add', '', 'sales-151');
}

function editSale151(id) {
    showInvoiceModal('edit', id, 'sales-151');
}

function deleteSale151(id) {
    const sale = appState.sales151.find(s => s.id === id);
    if (!sale) return;
    
    showConfirmModal('آیا مطمئن هستید که می‌خواهید این فاکتور فروش را حذف کنید؟', () => {
        appState.sales151 = appState.sales151.filter(s => s.id !== id);
        saveData();
        renderSales151();
        renderInventory();
        showNotification('فاکتور فروش با موفقیت حذف شد', 'success');
    });
}

function addSale168() {
    showInvoiceModal('add', '', 'sales-168');
}

function editSale168(id) {
    showInvoiceModal('edit', id, 'sales-168');
}

function deleteSale168(id) {
    const sale = appState.sales168.find(s => s.id === id);
    if (!sale) return;
    
    showConfirmModal('آیا مطمئن هستید که می‌خواهید این فاکتور فروش را حذف کنید؟', () => {
        appState.sales168 = appState.sales168.filter(s => s.id !== id);
        saveData();
        renderSales168();
        renderInventory();
        showNotification('فاکتور فروش با موفقیت حذف شد', 'success');
    });
}

// Inventory Calculation
function renderInventory() {
    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = '';
    
    // Calculate inventory for each product
    const inventory = appState.products.map(product => {
        // Calculate total input
        const totalInput = appState.inputInvoices.reduce((sum, invoice) => {
            const item = invoice.items.find(i => i.productId === product.id);
            return sum + (item ? item.quantity : 0);
        }, 0);
        
        // Calculate total sales from both channels
        const totalSales151 = appState.sales151.reduce((sum, sale) => {
            const item = sale.items.find(i => i.productId === product.id);
            return sum + (item ? item.quantity : 0);
        }, 0);
        
        const totalSales168 = appState.sales168.reduce((sum, sale) => {
            const item = sale.items.find(i => i.productId === product.id);
            return sum + (item ? item.quantity : 0);
        }, 0);
        
        const totalSales = totalSales151 + totalSales168;
        const finalStock = totalInput - totalSales;
        
        return {
            name: product.name,
            totalInput,
            totalSales,
            finalStock
        };
    });
    
    inventory.forEach(item => {
        const row = document.createElement('tr');
        const stockColor = item.finalStock <= 0 ? '#EF4444' : item.finalStock <= 10 ? '#F59E0B' : '#22C55E';
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.totalInput}</td>
            <td>${item.totalSales}</td>
            <td style="color: ${stockColor}; font-weight: 600;">${item.finalStock}</td>
        `;
        tbody.appendChild(row);
    });
}

// Modal Management
function showInvoiceModal(action, id, type = 'input') {
    const modal = document.getElementById('invoice-modal');
    const title = document.getElementById('invoice-modal-title');
    const dateInput = document.getElementById('invoice-date');
    const productsContainer = document.getElementById('invoice-products');
    
    // Set title based on type
    if (type === 'sales-151') {
        title.textContent = action === 'add' ? 'افزودن فاکتور فروش151' : 'ویرایش فاکتور فروش151';
    } else if (type === 'sales-168') {
        title.textContent = action === 'add' ? 'افزودن فاکتور فروش168' : 'ویرایش فاکتور فروش168';
    } else {
        title.textContent = action === 'add' ? 'افزودن فاکتور ورودی' : 'ویرایش فاکتور ورودی';
    }
    
    // Clear products container and add one row
    productsContainer.innerHTML = '<div class="product-row"></div>';
    addProductRow(productsContainer.querySelector('.product-row'));
    
    // Set date to today (1404)
    const today = new Date('2024-10-27'); // 1404/08/06 equivalent
    dateInput.value = formatDateToPersian(today);
    
    // Set modal data
    modal.dataset.action = action;
    modal.dataset.id = id;
    modal.dataset.type = type;
    modal.classList.add('active');
    dateInput.focus();
}

function addProductRow(rowElement) {
    if (!rowElement) {
        const container = document.getElementById('invoice-products');
        rowElement = document.createElement('div');
        rowElement.className = 'product-row';
        container.appendChild(rowElement);
    }
    
    // Create product select
    const select = document.createElement('select');
    select.className = 'product-select';
    select.innerHTML = '<option value="">انتخاب محصول</option>';
    appState.products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        select.appendChild(option);
    });
    
    // Create quantity input
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'product-quantity';
    input.placeholder = 'تعداد';
    input.min = '1';
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-product-btn';
    removeBtn.innerHTML = '<i data-lucide="trash-2"></i>';
    removeBtn.addEventListener('click', () => {
        if (document.querySelectorAll('.product-row').length > 1) {
            rowElement.remove();
        } else {
            showNotification('حداقل یک محصول باید وجود داشته باشد', 'warning');
        }
    });
    
    rowElement.innerHTML = '';
    rowElement.appendChild(select);
    rowElement.appendChild(input);
    rowElement.appendChild(removeBtn);
    
    // Refresh icons
    lucide.createIcons();
}

// Modal Event Handlers
function initializeModalHandlers() {
    // Product Modal
    const productModal = document.getElementById('product-modal');
    const productInput = document.getElementById('product-name');
    
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal || e.target.hasAttribute('data-action') && e.target.getAttribute('data-action') === 'cancel') {
            productModal.classList.remove('active');
        }
        
        if (e.target.hasAttribute('data-action') && e.target.getAttribute('data-action') === 'save') {
            const productName = productInput.value.trim();
            if (!productName) {
                showNotification('نام محصول را وارد کنید', 'warning');
                return;
            }
            
            if (productModal.dataset.action === 'add') {
                // Check for duplicate
                if (appState.products.some(p => p.name === productName)) {
                    showNotification('این محصول قبلاً ثبت شده است', 'warning');
                    return;
                }
                
                appState.products.push({
                    id: generateId(),
                    name: productName
                });
                showNotification('محصول با موفقیت افزوده شد', 'success');
            } else {
                // Edit
                const product = appState.products.find(p => p.id === productModal.dataset.id);
                if (product) {
                    // Check for duplicate
                    if (appState.products.some(p => p.name === productName && p.id !== product.id)) {
                        showNotification('این محصول قبلاً ثبت شده است', 'warning');
                        return;
                    }
                    product.name = productName;
                    showNotification('محصول با موفقیت ویرایش شد', 'success');
                }
            }
            
            saveData();
            productModal.classList.remove('active');
            renderProducts();
            refreshProductSelects();
        }
    });
    
    // Invoice Modal
    const invoiceModal = document.getElementById('invoice-modal');
    
    invoiceModal.addEventListener('click', (e) => {
        if (e.target === invoiceModal || e.target.hasAttribute('data-action') && e.target.getAttribute('data-action') === 'cancel') {
            invoiceModal.classList.remove('active');
        }
        
        if (e.target.hasAttribute('data-action') && e.target.getAttribute('data-action') === 'save') {
            saveInvoice(invoiceModal);
        }
    });
    
    // Add product row button
    document.getElementById('add-product-row').addEventListener('click', () => {
        addProductRow();
    });
    
    // Confirm Modal
    const confirmModal = document.getElementById('confirm-modal');
    
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal || e.target.hasAttribute('data-action') && e.target.getAttribute('data-action') === 'cancel') {
            confirmModal.classList.remove('active');
        }
        
        if (e.target.hasAttribute('data-action') && e.target.getAttribute('data-action') === 'confirm') {
            confirmModal.classList.remove('active');
            if (confirmModal.dataset.callback) {
                window[confirmModal.dataset.callback]();
            }
        }
    });
}

function saveInvoice(modal) {
    const date = document.getElementById('invoice-date').value.trim();
    if (!date) {
        showNotification('تاریخ را وارد کنید', 'warning');
        return;
    }
    
    // Validate Persian date format
    if (!validatePersianDate(date)) {
        showNotification('فرمت تاریخ صحیح نیست (مثال: 1404/08/16)', 'warning');
        return;
    }
    
    const productRows = document.querySelectorAll('.product-row');
    const items = [];
    
    productRows.forEach(row => {
        const productId = row.querySelector('.product-select').value;
        const quantity = parseInt(row.querySelector('.product-quantity').value);
        
        if (productId && quantity > 0) {
            items.push({ productId, quantity });
        }
    });
    
    if (items.length === 0) {
        showNotification('حداقل یک محصول را انتخاب کنید', 'warning');
        return;
    }
    
    const invoiceData = {
        id: modal.dataset.id || generateId(),
        date,
        items
    };
    
    if (modal.dataset.action === 'add') {
        // Check inventory for sales
        if (modal.dataset.type === 'sales-151' || modal.dataset.type === 'sales-168') {
            if (!validateInventory(items)) {
                showNotification('موجودی کافی نیست', 'error');
                return;
            }
        }
        
        if (modal.dataset.type === 'sales-151') {
            appState.sales151.push(invoiceData);
            showNotification('فاکتور فروش151 با موفقیت ثبت شد', 'success');
        } else if (modal.dataset.type === 'sales-168') {
            appState.sales168.push(invoiceData);
            showNotification('فاکتور فروش168 با موفقیت ثبت شد', 'success');
        } else {
            appState.inputInvoices.push(invoiceData);
            showNotification('فاکتور ورودی با موفقیت ثبت شد', 'success');
        }
    } else {
        // Edit existing invoice
        if (modal.dataset.type === 'sales-151') {
            const index = appState.sales151.findIndex(s => s.id === modal.dataset.id);
            if (index !== -1) {
                // Validate inventory
                if (!validateInventory(items, modal.dataset.id)) {
                    showNotification('موجودی کافی نیست', 'error');
                    return;
                }
                appState.sales151[index] = invoiceData;
                showNotification('فاکتور فروش151 با موفقیت ویرایش شد', 'success');
            }
        } else if (modal.dataset.type === 'sales-168') {
            const index = appState.sales168.findIndex(s => s.id === modal.dataset.id);
            if (index !== -1) {
                // Validate inventory
                if (!validateInventory(items, modal.dataset.id)) {
                    showNotification('موجودی کافی نیست', 'error');
                    return;
                }
                appState.sales168[index] = invoiceData;
                showNotification('فاکتور فروش168 با موفقیت ویرایش شد', 'success');
            }
        } else {
            const index = appState.inputInvoices.findIndex(i => i.id === modal.dataset.id);
            if (index !== -1) {
                appState.inputInvoices[index] = invoiceData;
                showNotification('فاکتور ورودی با موفقیت ویرایش شد', 'success');
            }
        }
    }
    
    saveData();
    modal.classList.remove('active');
    
    // Refresh appropriate table
    if (modal.dataset.type === 'sales-151') {
        renderSales151();
    } else if (modal.dataset.type === 'sales-168') {
        renderSales168();
    } else {
        renderInputInvoices();
    }
    
    renderInventory();
}

// Inventory Validation
function validateInventory(items, excludeInvoiceId = null) {
    for (const item of items) {
        const product = appState.products.find(p => p.id === item.productId);
        if (!product) continue;
        
        // Calculate available stock
        const totalInput = appState.inputInvoices.reduce((sum, invoice) => {
            if (excludeInvoiceId && invoice.id === excludeInvoiceId) return sum;
            const invoiceItem = invoice.items.find(i => i.productId === item.productId);
            return sum + (invoiceItem ? invoiceItem.quantity : 0);
        }, 0);
        
        const totalSales151 = appState.sales151.reduce((sum, sale) => {
            if (excludeInvoiceId && sale.id === excludeInvoiceId) return sum;
            const saleItem = sale.items.find(i => i.productId === item.productId);
            return sum + (saleItem ? saleItem.quantity : 0);
        }, 0);
        
        const totalSales168 = appState.sales168.reduce((sum, sale) => {
            if (excludeInvoiceId && sale.id === excludeInvoiceId) return sum;
            const saleItem = sale.items.find(i => i.productId === item.productId);
            return sum + (saleItem ? saleItem.quantity : 0);
        }, 0);
        
        const availableStock = totalInput - totalSales151 - totalSales168;
        
        if (availableStock < item.quantity) {
            const productName = product.name;
            showNotification(`موجودی ${productName} کافی نیست. موجود: ${availableStock}، درخواستی: ${item.quantity}`, 'warning');
            return false;
        }
    }
    return true;
}

// Persian Date Functions
function formatDateToPersian(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function formatPersianDate(dateString) {
    // Just return the date string as is for now
    return dateString;
}

function validatePersianDate(dateString) {
    const pattern = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!pattern.test(dateString)) return false;
    
    const parts = dateString.split('/');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    if (year < 1300 || year > 1500) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    return true;
}

// Refresh Product Selects
function refreshProductSelects() {
    const selects = document.querySelectorAll('.product-select');
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">انتخاب محصول</option>';
        appState.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            select.appendChild(option);
        });
        select.value = currentValue;
    });
}

// Show Confirm Modal
function showConfirmModal(message, callback, callbackName = 'deleteItem') {
    const modal = document.getElementById('confirm-modal');
    const messageElement = modal.querySelector('.modal-body p');
    messageElement.textContent = message;
    
    // Store callback reference
    window[callbackName] = callback;
    modal.dataset.callback = callbackName;
    
    modal.classList.add('active');
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // Set background color based on type
    const colors = {
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#007AFF'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Backup and Restore
function backupData() {
    try {
        const data = JSON.stringify(appState, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-backup-${formatDateToPersian(new Date('2024-10-27'))}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('بکاپ با موفقیت انجام شد', 'success');
    } catch (error) {
        console.error('خطا در بکاپ:', error);
        showNotification('خطا در ایجاد بکاپ', 'error');
    }
}

function restoreData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.products || !data.inputInvoices || !data.sales151 || !data.sales168) {
                throw new Error('فرمت فایل صحیح نیست');
            }
            
            appState = { ...appState, ...data };
            saveData();
            
            // Refresh all tables
            renderProducts();
            renderInputInvoices();
            renderSales151();
            renderSales168();
            renderInventory();
            
            showNotification('بکاپ با موفقیت رستور شد', 'success');
        } catch (error) {
            console.error('خطا در رستور:', error);
            showNotification('خطا در خواندن فایل بکاپ', 'error');
        }
    };
    reader.readAsText(file);
}

// GitHub Integration
async function syncWithGitHub() {
    const token = document.getElementById('github-token').value.trim();
    const repo = document.getElementById('github-repo').value.trim();
    const username = document.getElementById('github-username').value.trim();
    
    if (!token || !repo || !username) {
        showNotification('تمام فیلدهای GitHub را پر کنید', 'warning');
        return;
    }
    
    const statusElement = document.getElementById('github-status');
    statusElement.textContent = 'در حال همگام سازی...';
    statusElement.className = 'status-message';
    
    try {
        // Save credentials
        appState.settings = { githubToken: token, githubRepo: repo, githubUsername: username };
        saveData();
        
        // Create JSON data
        const data = JSON.stringify(appState, null, 2);
        const encodedData = btoa(unescape(encodeURIComponent(data)));
        
        // GitHub API call
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/inventory.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update inventory data - ${formatDateToPersian(new Date('2024-10-27'))}`,
                content: encodedData
            })
        });
        
        if (response.ok) {
            statusElement.textContent = 'همگام سازی با موفقیت انجام شد';
            statusElement.className = 'status-message success';
            showNotification('اطلاعات با موفقیت در GitHub ذخیره شد', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'خطا در GitHub API');
        }
    } catch (error) {
        console.error('GitHub sync error:', error);
        statusElement.textContent = `خطا: ${error.message}`;
        statusElement.className = 'status-message error';
        showNotification(`خطا در همگام سازی: ${error.message}`, 'error');
    }
}

// Load GitHub settings
function loadGitHubSettings() {
    document.getElementById('github-token').value = appState.settings.githubToken || '';
    document.getElementById('github-repo').value = appState.settings.githubRepo || '';
    document.getElementById('github-username').value = appState.settings.githubUsername || '';
}

// Button Event Listeners
function initializeButtonHandlers() {
    // Product buttons
    document.getElementById('add-product').addEventListener('click', addProduct);
    
    // Invoice buttons
    document.getElementById('add-input-invoice').addEventListener('click', addInputInvoice);
    document.getElementById('add-sale-151').addEventListener('click', addSale151);
    document.getElementById('add-sale-168').addEventListener('click', addSale168);
    
    // Backup/Restore buttons
    document.getElementById('backup-data').addEventListener('click', backupData);
    document.getElementById('restore-data').addEventListener('click', () => {
        document.getElementById('restore-file').click();
    });
    document.getElementById('restore-file').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            restoreData(e.target.files[0]);
        }
    });
    
    // GitHub sync
    document.getElementById('sync-github').addEventListener('click', syncWithGitHub);
}

// Mobile Menu Management
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    function openMobileMenu() {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Add event listeners
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu when clicking on nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });
    
    // Close menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
}

// Initialize Application
function initializeApp() {
    loadData();
    initializeMobileMenu();
    initializeTabs();
    initializeModalHandlers();
    initializeButtonHandlers();
    loadGitHubSettings();
    
    // Initial render
    renderProducts();
    renderInputInvoices();
    renderSales151();
    renderSales168();
    renderInventory();
    
    // Add some sample data if empty
    if (appState.products.length === 0) {
        appState.products = [
            { id: generateId(), name: 'محصول نمونه 1' },
            { id: generateId(), name: 'محصول نمونه 2' },
            { id: generateId(), name: 'محصول نمونه 3' }
        ];
        saveData();
        renderProducts();
        refreshProductSelects();
    }
    
    showNotification('سیستم آماده است', 'success');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);