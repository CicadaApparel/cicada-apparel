// =============================================
// GLOBAL STATE
// =============================================
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let productImages = [];
let secretCode = [];
const SECRET_COMBO = ['language', 'language', 'theme', 'theme', 'language'];
let adminPassword = null;

// =============================================
// TELEGRAM BOT CONFIGURATION
// =============================================
const TELEGRAM_BOT_TOKEN = '8268902214:AAHiT29C6qYQ5ybUnxpKLCAPxfDl7eY7IUw';
const TELEGRAM_CHAT_ID = '5242832198';

// =============================================
// ADMIN SYSTEM - ΟΛΟΚΛΗΡΩΜΕΝΟ ΜΕ 2-FACTOR AUTH
// =============================================
function showAdminModal() {
    console.log('🔄 Loading admin panel...');
    
    // Δημιουργία μοναδικού κωδικού
    adminPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('🔐 Generated admin password:', adminPassword);
    
    // Αποστολή κωδικού στο Telegram
    sendAdminPasswordToTelegram(adminPassword);
    
    // Εμφάνιση password prompt
    showPasswordPrompt();
}

function showPasswordPrompt() {
    const adminModal = document.getElementById('adminModal');
    const ordersContainer = document.getElementById('adminOrdersContainer');
    
    ordersContainer.innerHTML = `
        <div class="password-prompt" style="text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
            <h3 style="margin-bottom: 15px;">Admin Access Required</h3>
            <p style="margin-bottom: 25px; opacity: 0.8;">Ο κωδικός πρόσβασης έχει σταλεί στο Telegram</p>
            
            <div style="max-width: 300px; margin: 0 auto;">
                <input type="password" id="adminPasswordInput" 
                       placeholder="Εισαγωγή κωδικού..." 
                       style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: inherit; margin-bottom: 15px;">
                
                <div style="display: flex; gap: 10px;">
                    <button class="btn" onclick="verifyAdminPassword()" style="flex: 1;">✅ Είσοδος</button>
                    <button class="btn" onclick="closeAdminModal()" style="flex: 1; background: rgba(255,0,0,0.2);">❌ Ακύρωση</button>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(66, 133, 244, 0.1); border-radius: 8px; font-size: 14px;">
                    <strong>📱 Δοκιμή Telegram:</strong>
                    <button class="btn" onclick="testTelegramNotification()" style="margin-top: 10px; width: 100%; padding: 8px; font-size: 12px;">
                        📤 Δοκιμή Ειδοποίησης
                    </button>
                </div>
            </div>
        </div>
    `;
    
    adminModal.classList.add('active');
    updateBodyScrollLock();
    
    // Auto-focus στο input
    setTimeout(() => {
        const input = document.getElementById('adminPasswordInput');
        if (input) input.focus();
    }, 100);
}

function verifyAdminPassword() {
    const input = document.getElementById('adminPasswordInput');
    const enteredPassword = input.value.trim();
    
    if (!enteredPassword) {
        showNotification('⚠️ Παρακαλώ εισάγετε κωδικό', 'error');
        return;
    }
    
    if (enteredPassword === adminPassword) {
        showNotification('✅ Επιτυχής σύνδεση!', 'success');
        loadOrdersDashboard();
    } else {
        showNotification('❌ Λάθος κωδικός!', 'error');
        input.value = '';
        input.focus();
    }
}

function loadOrdersDashboard() {
    const ordersContainer = document.getElementById('adminOrdersContainer');
    
    // Φόρτωση παραγγελιών από localStorage
    const orders = JSON.parse(localStorage.getItem('cicada_orders')) || [];
    console.log('📦 Orders found:', orders.length);
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="order-card" style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
                <p>Δεν υπάρχουν παραγγελίες ακόμα</p>
                <p style="font-size: 14px; margin-top: 10px; opacity: 0.7;">Οι παραγγελίες θα εμφανίζονται εδώ αυτόματα</p>
            </div>
        `;
    } else {
        ordersContainer.innerHTML = `
            <div class="admin-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>📦 Διαχείριση Παραγγελιών (${orders.length})</h3>
                <div style="display: flex; gap: 10px;">
                    <button class="btn" onclick="exportOrders()" style="padding: 8px 12px; font-size: 12px;">📤 Export</button>
                    <button class="btn" onclick="clearAllOrders()" style="padding: 8px 12px; font-size: 12px; background: rgba(255,0,0,0.2);">🗑️ Clear All</button>
                </div>
            </div>
            ${orders.map((order, index) => `
                <div class="order-card ${index === 0 ? 'new-order' : ''}" data-order-id="${order.id}">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <h4 style="margin: 0; flex: 1;">📦 Παραγγελία #${order.id} ${index === 0 ? '🆕' : ''}</h4>
                        <span style="font-size: 12px; opacity: 0.7;">${new Date(order.timestamp).toLocaleString('el-GR')}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <p><strong>👤 Πελάτης:</strong> ${order.customerName}</p>
                            <p><strong>📞 Τηλέφωνο:</strong> ${order.customerPhone}</p>
                        </div>
                        <div>
                            <p><strong>🏠 Διεύθυνση:</strong> ${order.shippingAddress}</p>
                            <p><strong>💰 Σύνολο:</strong> ${order.total}</p>
                        </div>
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <p><strong>🛒 Προϊόντα:</strong></p>
                        <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px;">
                            ${order.items.split('\n').map(item => `<div>${item}</div>`).join('')}
                        </div>
                    </div>
                    
                    <div class="order-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn" onclick="printOrder('${order.id}')" style="flex: 1;">🖨️ Εκτύπωση</button>
                        <button class="btn" onclick="markOrderAsProcessed('${order.id}')" style="flex: 1;">✅ Επεξεργάστηκα</button>
                        <button class="btn" onclick="deleteOrder('${order.id}')" style="flex: 1; background: rgba(255,0,0,0.2);">🗑️ Διαγραφή</button>
                    </div>
                </div>
            `).join('')}
        `;
    }
}

// =============================================
// TELEGRAM ADMIN FUNCTIONS
// =============================================
async function sendAdminPasswordToTelegram(password) {
    if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        console.warn('Telegram bot credentials not configured for admin');
        return false;
    }

    const message = `
🔐 *ADMIN ACCESS REQUEST* 🔐

📱 Αίτημα πρόσβασης στο Admin Panel
🕒 ${new Date().toLocaleString('el-GR')}
🔑 Κωδικός Πρόσβασης: *${password}*

📍 IP: ${await getClientIP()}
🌐 User Agent: ${navigator.userAgent.substring(0, 100)}...

_Αυτόματη ειδοποίηση ασφαλείας_
    `;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        const result = await response.json();
        if (result.ok) {
            console.log('✅ Admin password sent to Telegram');
            return true;
        } else {
            console.error('❌ Telegram error:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Network error sending admin password:', error);
        return false;
    }
}

async function testTelegramNotification() {
    const testOrder = {
        id: 'TEST' + Date.now().toString().slice(-6),
        timestamp: new Date().toISOString(),
        customerName: 'Δοκιμαστικός Πελάτης',
        customerPhone: '6912345678',
        shippingAddress: 'Δοκιμαστική Διεύθυνση 123, Αθήνα',
        items: '▪️ Test Product 1 - €25.00\n▪️ Test Product 2 - €35.00',
        total: '€60.00'
    };

    const sent = await sendTelegramNotification(testOrder);
    if (sent) {
        showNotification('✅ Δοκιμή ειδοποίησης ολοκληρώθηκε!', 'success');
    } else {
        showNotification('❌ Δοκιμή απέτυχε - ελέγξτε τα credentials', 'error');
    }
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'Unknown';
    }
}

// =============================================
// ORDER PRINT FUNCTION
// =============================================
function printOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('cicada_orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('❌ Η παραγγελία δεν βρέθηκε', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Παραγγελία ${order.id} - Cicada Apparel</title>
            <style>
                body { 
                    font-family: 'DM Sans', Arial, sans-serif; 
                    padding: 25px; 
                    line-height: 1.4;
                    color: #1d1d1f;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #4285f4;
                }
                .order-info { 
                    margin: 25px 0;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .products { 
                    margin: 20px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .footer { 
                    margin-top: 40px; 
                    text-align: center; 
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                .product-item {
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                .total {
                    font-size: 18px;
                    font-weight: bold;
                    text-align: right;
                    margin-top: 20px;
                    color: #4285f4;
                }
                @media print {
                    body { padding: 15px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 style="color: #4285f4; margin-bottom: 10px;">Cicada Apparel</h1>
                <h2>Παραγγελία #${order.id}</h2>
            </div>
            
            <div class="order-info">
                <div>
                    <h3>Στοιχεία Πελάτη</h3>
                    <p><strong>Ονοματεπώνυμο:</strong> ${order.customerName}</p>
                    <p><strong>Τηλέφωνο:</strong> ${order.customerPhone}</p>
                    <p><strong>Διεύθυνση:</strong> ${order.shippingAddress}</p>
                </div>
                <div>
                    <h3>Στοιχεία Παραγγελίας</h3>
                    <p><strong>Ημερομηνία:</strong> ${new Date(order.timestamp).toLocaleString('el-GR')}</p>
                    <p><strong>Κωδικός:</strong> ${order.id}</p>
                </div>
            </div>
            
            <div class="products">
                <h3>Προϊόντα</h3>
                ${order.items.split('\n').map(item => `
                    <div class="product-item">${item}</div>
                `).join('')}
            </div>
            
            <div class="total">
                Σύνολο: ${order.total}
            </div>
            
            <div class="footer">
                <p>Cicada Apparel - Διαχείριση Παραγγελιών</p>
                <p>Εκτυπώθηκε: ${new Date().toLocaleString('el-GR')}</p>
                <button class="no-print" onclick="window.print()" style="margin-top: 15px; padding: 10px 20px; background: #4285f4; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ Εκτύπωση</button>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    showNotification('🖨️ Παραγγελία προετοιμάστηκε για εκτύπωση', 'success');
}

function closeAdminModal() {
    adminPassword = null; // Reset password
    document.getElementById('adminModal').classList.remove('active');
    updateBodyScrollLock();
}

function markOrderAsProcessed(orderId) {
    let orders = JSON.parse(localStorage.getItem('cicada_orders')) || [];
    orders = orders.filter(order => order.id !== orderId);
    localStorage.setItem('cicada_orders', JSON.stringify(orders));
    loadOrdersDashboard(); // Refresh view
    showNotification('✅ Η παραγγελία επιβεβαιώθηκε!');
}

function deleteOrder(orderId) {
    if (confirm('Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτήν την παραγγελία;')) {
        let orders = JSON.parse(localStorage.getItem('cicada_orders')) || [];
        orders = orders.filter(order => order.id !== orderId);
        localStorage.setItem('cicada_orders', JSON.stringify(orders));
        loadOrdersDashboard(); // Refresh view
        showNotification('🗑️ Η παραγγελία διαγράφηκε!');
    }
}

function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('cicada_orders')) || [];
    if (orders.length === 0) {
        alert('Δεν υπάρχουν παραγγελίες για εξαγωγή');
        return;
    }
    
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cicada_orders_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('📤 Οι παραγγελίες εξήχθησαν!');
}

function clearAllOrders() {
    if (confirm('Είσαι σίγουρος ότι θέλεις να διαγράψεις ΟΛΕΣ τις παραγγελίες; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.')) {
        localStorage.removeItem('cicada_orders');
        loadOrdersDashboard(); // Refresh view
        showNotification('🧹 Όλες οι παραγγελίες διαγράφηκαν!');
    }
}

// =============================================
// SECRET COMBO SYSTEM
// =============================================
function checkSecretCombo(buttonType) {
    secretCode.push(buttonType);
    
    // Κρατάμε μόνο τα τελευταία 5 clicks
    if (secretCode.length > 5) {
        secretCode.shift();
    }
    
    console.log('🔐 Secret combo progress:', secretCode);
    
    // Έλεγχος αν ο συνδυασμός είναι σωστός
    if (JSON.stringify(secretCode) === JSON.stringify(SECRET_COMBO)) {
        console.log('🎉 Secret combo matched! Activating admin...');
        activateSecretAdmin();
    }
}

function activateSecretAdmin() {
    console.log('🚨 SECRET ADMIN ACTIVATED!');
    
    // Show success notification
    showNotification('🔐 ΣΥΣΤΗΜΑ ΔΙΑΧΕΙΡΙΣΗΣ ΕΝΕΡΓΟΠΟΙΗΘΗΚΕ!');
    
    // Open admin panel after a short delay
    setTimeout(() => {
        showAdminModal();
    }, 1000);
    
    // Reset secret code
    secretCode = [];
}

// =============================================
// ENHANCED UI FUNCTIONS
// =============================================
function enhancedToggleLanguage() {
    checkSecretCombo('language');
    toggleLanguage();
}

function enhancedToggleTheme() {
    checkSecretCombo('theme');
    toggleTheme();
}

// =============================================
// CORE UI FUNCTIONS
// =============================================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function toggleMenu() {
    const nav = document.getElementById('mobileNav');
    const btn = document.querySelector('.mobile-menu-btn');
    const cartPanel = document.getElementById('cartPanel');
    const adminModal = document.getElementById('adminModal');
    
    const isActive = nav.classList.toggle('active');
    btn.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    
    if (isActive) {
        cartPanel.classList.remove('active');
        adminModal.classList.remove('active');
    }
    
    updateBodyScrollLock();
}

function toggleCart() {
    const cartPanel = document.getElementById('cartPanel');
    const mobileNav = document.getElementById('mobileNav');
    const adminModal = document.getElementById('adminModal');
    
    const isActive = cartPanel.classList.toggle('active');
    
    if (isActive) {
        mobileNav.classList.remove('active');
        adminModal.classList.remove('active');
        document.querySelector('.mobile-menu-btn').innerHTML = '<i class="fas fa-bars"></i>';
    }
    
    updateBodyScrollLock();
}

function updateBodyScrollLock() {
    const mobileNav = document.getElementById('mobileNav');
    const cartPanel = document.getElementById('cartPanel');
    const adminModal = document.getElementById('adminModal');
    const gallery = document.getElementById('productGallery');

    const isLocked = mobileNav.classList.contains('active') || 
                     cartPanel.classList.contains('active') ||
                     adminModal.classList.contains('active') ||
                     (gallery && gallery.style.display === 'flex');
                     
    document.body.style.overflow = isLocked ? 'hidden' : '';
    document.body.style.position = isLocked ? 'fixed' : '';
}

function toggleLanguage() {
    const langCodeEl = document.querySelector('.lang-code');
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'en' ? 'el' : 'en';
    
    if (langCodeEl) {
        langCodeEl.style.transform = 'rotateX(90deg)';
        langCodeEl.style.opacity = '0';
    }
    
    setTimeout(() => {
        document.documentElement.lang = newLang;
        if (langCodeEl) {
            langCodeEl.textContent = newLang === 'en' ? 'EL' : 'EN';
        }
        
        document.querySelectorAll('[data-en], [data-el]').forEach(el => {
            const attr = `data-${newLang}`;
            const text = el.getAttribute(attr);
            if (text !== null) {
                el.textContent = text;
            }
        });
        
        if (langCodeEl) {
            langCodeEl.style.transform = 'rotateX(0)';
            langCodeEl.style.opacity = '1';
        }
        
        localStorage.setItem('language', newLang);
    }, 150);
}

// =============================================
// SCROLLING & NAVIGATION
// =============================================
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId && targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    history.replaceState(null, null, targetId);
                    
                    if (document.getElementById('mobileNav').classList.contains('active')) {
                        toggleMenu();
                    }
                }
            }
        });
    });
}

function initHeaderScroll() {
    const header = document.querySelector('header.glass-panel');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initMobileMenuAnimation() {
    const mobileNav = document.getElementById('mobileNav');
    const navItems = mobileNav.querySelectorAll('li');
    
    mobileNav.addEventListener('transitionend', () => {
        if (mobileNav.classList.contains('active')) {
            navItems.forEach((item, index) => {
                item.style.transitionDelay = `${index * 0.1}s`;
            });
        } else {
            navItems.forEach(item => {
                item.style.transitionDelay = '0s';
            });
        }
    });
}

// =============================================
// CART & PRODUCTS
// =============================================
function addToCart(productElement) {
    const productCard = productElement.closest('.product-card');
    const titleEl = productCard.querySelector('.product-title');
    const priceEl = productCard.querySelector('.product-price');
    const imageEl = productCard.querySelector('.product-image');
    
    const priceValue = parseFloat(priceEl.textContent.replace('€', '').trim());

    const product = {
        name: titleEl.textContent,
        price: priceEl.textContent,
        priceValue: priceValue,
        image: imageEl.src,
        id: Date.now()
    };
    
    cart.push(product);
    updateCart();
    
    const feedback = document.createElement('div');
    feedback.className = 'add-to-cart-feedback';
    feedback.textContent = document.documentElement.lang === 'en' ? '✓ Added to cart' : '✓ Προστέθηκε';
    productCard.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
}

function removeFromCart(id) {
    const indexToRemove = cart.findIndex(item => item.id === id);
    if (indexToRemove > -1) {
        cart.splice(indexToRemove, 1);
        updateCart();
    }
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalEl = document.getElementById('cartTotal');
    
    cartCountEl.textContent = cart.length;
    cartCountEl.style.display = cart.length ? 'flex' : 'none';
    
    cartItemsEl.innerHTML = '';
    
    if (cart.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'cart-empty';
        emptyMessage.textContent = document.documentElement.lang === 'en' 
            ? 'Your cart is empty' 
            : 'Το καλάθι σας είναι άδειο';
        cartItemsEl.appendChild(emptyMessage);
    }
    
    let total = 0;
    
    cart.forEach(item => {
        total += item.priceValue || 0;
        
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})" aria-label="Remove item">
                &times;
            </button>
        `;
        cartItemsEl.appendChild(cartItemEl);
    });
    
    cartTotalEl.textContent = `€${total.toFixed(2)}`;
}

// =============================================
// TELEGRAM BOT FUNCTIONS
// =============================================
async function sendTelegramNotification(orderData) {
    if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        console.warn('Telegram bot credentials not configured');
        return false;
    }

    const message = `
🛍️ *ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ CICADA* 🛍️

📦 *Κωδικός:* #${orderData.id}
👤 *Πελάτης:* ${orderData.customerName}
📞 *Τηλέφωνο:* ${orderData.customerPhone}
🏠 *Διεύθυνση:* ${orderData.shippingAddress}

🛒 *Προϊόντα:*
${orderData.items}

💰 *Σύνολο:* ${orderData.total}
⏰ *Ημερομηνία:* ${new Date(orderData.timestamp).toLocaleString('el-GR')}

_Αυτόματη ειδοποίηση από τον ιστότοπο_
    `;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_notification: false
            })
        });

        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Telegram notification sent successfully!');
            return true;
        } else {
            console.error('❌ Telegram error:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Network error sending Telegram message:', error);
        return false;
    }
}

// =============================================
// CHECKOUT SYSTEM
// =============================================
async function completeCheckout() {
    if (cart.length === 0) return;
    
    const orderId = 'CIC' + Date.now().toString().slice(-6);
    const cartSummary = cart.map(item => `▪️ ${item.name} - ${item.price}`).join('\n');
    const total = cart.reduce((sum, item) => sum + item.priceValue, 0);
    
    const customerName = prompt(document.documentElement.lang === 'en' 
        ? 'Please enter your full name:' 
        : 'Παρακαλώ εισάγετε το πλήρες όνομά σας:');
    
    if (!customerName) {
        alert(document.documentElement.lang === 'en' 
            ? 'Order cancelled. Name is required.' 
            : 'Η παραγγελία ακυρώθηκε. Το όνομα είναι απαραίτητο.');
        return;
    }

    const customerPhone = prompt(document.documentElement.lang === 'en' 
        ? 'Please enter your phone number:' 
        : 'Παρακαλώ εισάγετε το τηλέφωνό σας:');
    
    if (!customerPhone) {
        alert(document.documentElement.lang === 'en' 
            ? 'Order cancelled. Phone number is required.' 
            : 'Η παραγγελία ακυρώθηκε. Το τηλέφωνο είναι απαραίτητο.');
        return;
    }

    const shippingAddress = prompt(document.documentElement.lang === 'en' 
        ? 'Please enter your shipping address:' 
        : 'Παρακαλώ εισάγετε τη διεύθυνση αποστολής:');

    if (!shippingAddress) {
        alert(document.documentElement.lang === 'en' 
            ? 'Order cancelled. Shipping address is required.' 
            : 'Η παραγγελία ακυρώθηκε. Η διεύθυνση είναι απαραίτητη.');
        return;
    }

    const orderData = {
        id: orderId,
        timestamp: new Date().toISOString(),
        customerName: customerName,
        customerPhone: customerPhone,
        shippingAddress: shippingAddress,
        items: cartSummary,
        total: `€${total.toFixed(2)}`
    };

    // Αποθήκευση παραγγελίας
    let existingOrders = JSON.parse(localStorage.getItem('cicada_orders')) || [];
    existingOrders.unshift(orderData);
    localStorage.setItem('cicada_orders', JSON.stringify(existingOrders));

    // Αποστολή στο Telegram
    const telegramSent = await sendTelegramNotification(orderData);
    
    if (telegramSent) {
        alert(document.documentElement.lang === 'en' 
            ? `✅ Order #${orderId} completed successfully! We will contact you soon.` 
            : `✅ Η παραγγελία #${orderId} ολοκληρώθηκε! Θα επικοινωνήσουμε σύντομα μαζί σας.`);
    } else {
        alert(document.documentElement.lang === 'en' 
            ? `✅ Order #${orderId} completed! (Notification failed - we will process your order manually)` 
            : `✅ Η παραγγελία #${orderId} ολοκληρώθηκε! (Η ειδοποίηση απέτυχε - θα επεξεργαστούμε την παραγγελία σας χειροκίνητα)`);
    }
    
    // Cleanup
    cart = [];
    updateCart();
    toggleCart();
}

function checkout() {
    if (cart.length === 0) {
        const message = document.documentElement.lang === 'en' 
            ? 'Your cart is empty' 
            : 'Το καλάθι σας είναι άδειο';
        alert(message);
        return;
    }
    
    completeCheckout();
}

// =============================================
// LIGHTBOX GALLERY
// =============================================
function initProductGallery() {
    const gallery = document.getElementById('productGallery');
    if (!gallery) return;
    
    document.querySelectorAll('.product-image').forEach((img, index) => {
        productImages.push({ src: img.src, alt: img.alt, index: index });
        
        img.addEventListener('click', () => openGallery(index));
    });
    
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productCard = e.target.closest('.product-card');
            const productImg = productCard.querySelector('.product-image');
            const index = productImages.findIndex(img => img.src === productImg.src);
            if (index !== -1) {
                openGallery(index);
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        const gallery = document.getElementById('productGallery');
        if (gallery.style.display !== 'flex') return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                navigateGallery(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                navigateGallery(1);
                break;
            case 'Escape':
                e.preventDefault();
                closeGallery();
                break;
        }
    });
}

let currentImageIndex = 0;

function openGallery(index) {
    const gallery = document.getElementById('productGallery');
    const galleryImage = document.querySelector('.gallery-image');
    
    currentImageIndex = index;
    galleryImage.src = productImages[currentImageIndex].src;
    galleryImage.alt = productImages[currentImageIndex].alt;
    gallery.style.display = 'flex';
    
    updateBodyScrollLock();
}

function navigateGallery(direction) {
    const galleryImage = document.querySelector('.gallery-image');
    currentImageIndex = (currentImageIndex + direction + productImages.length) % productImages.length;
    galleryImage.src = productImages[currentImageIndex].src;
    galleryImage.alt = productImages[currentImageIndex].alt;
}

function closeGallery() {
    document.getElementById('productGallery').style.display = 'none';
    updateBodyScrollLock();
}

function initGalleryTouch() {
    const gallery = document.getElementById('productGallery');
    let startX = 0;
    
    gallery.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    gallery.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                navigateGallery(1);
            } else {
                navigateGallery(-1);
            }
        }
    });
}

// =============================================
// FORM HANDLING & SPLASH SCREEN
// =============================================
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span class="loading-spinner"></span> ' + 
            (document.documentElement.lang === 'en' ? 'Sending' : 'Αποστολή');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showFormMessage(
                document.documentElement.lang === 'en' ? 'Thank you for your message!' : 'Ευχαριστούμε για το μήνυμά σας!',
                'success'
            );
            this.reset();
        } catch (error) {
            showFormMessage(
                document.documentElement.lang === 'en' ? 'Error sending message.' : 'Σφάλμα κατά την αποστολή.',
                'error'
            );
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

function showFormMessage(message, type) {
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) existingMessage.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    
    document.getElementById('contactForm').prepend(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
}

function enhanceFormValidation() {
    const contactForm = document.getElementById('contactForm');
    const inputs = contactForm.querySelectorAll('.form-control');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() !== '' && !this.validity.valid) {
                this.style.borderColor = '#d50000';
            } else if (this.validity.valid) {
                this.style.borderColor = '#2e7d32';
            }
        });
        
        input.addEventListener('input', function() {
            this.style.borderColor = '';
        });
    });
}

function handleSplashScreen() {
    const splashScreen = document.querySelector('.splash-screen');
    const body = document.body;
    
    if (!splashScreen || sessionStorage.getItem('visited')) {
        splashScreen && splashScreen.remove();
        body.style.opacity = '1';
        return;
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.remove();
                sessionStorage.setItem('visited', 'true');
                body.style.opacity = '1';
            }, 500);
        }, 1500);
    });
}

function preloadProductImages() {
    const images = [
        './images/jacket.jpg',
        './images/tshirt.jpg',
        './images/hoodie.jpg',
        './images/hero-bg.jpg'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

function ensureCartConsistency() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            cart = cart.filter(item => item && item.name && item.price);
            updateCart();
        } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            cart = [];
            localStorage.removeItem('cart');
        }
    }
}

function animateProducts() {
    const productCards = document.querySelectorAll('.product-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, 150 * index);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    productCards.forEach(card => observer.observe(card));
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.global-notification').forEach(note => note.remove());
    
    const notification = document.createElement('div');
    notification.className = 'global-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#d50000' : type === 'success' ? '#2e7d32' : '#4285f4'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        font-family: 'DM Sans', sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    handleSplashScreen();
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    const savedLang = localStorage.getItem('language') || 'en';
    document.documentElement.lang = savedLang;
    
    const langCodeEl = document.querySelector('.lang-code');
    if (langCodeEl) {
        langCodeEl.textContent = savedLang === 'en' ? 'EL' : 'EN';
    }
    
    if (savedLang !== 'en') {
        document.querySelectorAll('[data-en], [data-el]').forEach(el => {
            const text = el.getAttribute('data-el');
            if (text !== null) {
                el.textContent = text;
            }
        });
    }

    ensureCartConsistency();
    updateCartUI();
    initProductGallery();
    handleContactForm();
    enhanceFormValidation();
    initSmoothScrolling();
    animateProducts();
    initHeaderScroll();
    initMobileMenuAnimation();
    preloadProductImages();
    initGalleryTouch();
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            e.preventDefault();
            addToCart(e.target);
        }
    });
    
    console.log('🚀 Cicada Apparel - Enhanced version loaded');
});

// =============================================
// GLOBAL FUNCTION EXPORTS
// =============================================
window.toggleTheme = toggleTheme;
window.toggleMenu = toggleMenu;
window.toggleLanguage = toggleLanguage;
window.toggleCart = toggleCart;
window.removeFromCart = removeFromCart;
window.closeGallery = closeGallery;
window.navigateGallery = navigateGallery;
window.checkout = checkout;
window.enhancedToggleLanguage = enhancedToggleLanguage;
window.enhancedToggleTheme = enhancedToggleTheme;
window.closeAdminModal = closeAdminModal;
window.verifyAdminPassword = verifyAdminPassword;
window.testTelegramNotification = testTelegramNotification;
window.printOrder = printOrder;
window.markOrderAsProcessed = markOrderAsProcessed;
window.deleteOrder = deleteOrder;
window.exportOrders = exportOrders;
window.clearAllOrders = clearAllOrders;