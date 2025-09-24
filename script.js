// =============================================
// GLOBAL STATE
// =============================================
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let productImages = []; 

// =============================================
// UI & UTILITY FUNCTIONS
// =============================================

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function toggleMenu() {
  const nav = document.getElementById('mobileNav');
  const btn = document.querySelector('.mobile-menu-btn');
  const cartPanel = document.getElementById('cartPanel');
  
  const isActive = nav.classList.toggle('active');
  
  btn.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  
  if (isActive && cartPanel.classList.contains('active')) {
     cartPanel.classList.remove('active');
  }
  
  updateBodyScrollLock();
}

function toggleCart() {
  const cartPanel = document.getElementById('cartPanel');
  const mobileNav = document.getElementById('mobileNav');
  
  const isActive = cartPanel.classList.toggle('active');
  
  if (isActive && mobileNav.classList.contains('active')) {
    toggleMenu(); 
  } else {
    updateBodyScrollLock();
  }
}

function updateBodyScrollLock() {
    const mobileNav = document.getElementById('mobileNav');
    const cartPanel = document.getElementById('cartPanel');
    const gallery = document.getElementById('productGallery');

    const isLocked = mobileNav.classList.contains('active') || 
                     cartPanel.classList.contains('active') ||
                     (gallery && gallery.style.display === 'flex');
                     
    document.body.style.overflow = isLocked ? 'hidden' : '';
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
      langCodeEl.textContent = newLang === 'en' ? 'EN' : 'EL';
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
      // Αποτρέπουμε την προεπιλεγμένη συμπεριφορά μόνο για να χειριστούμε
      // το κλείσιμο του μενού και το URL update
      const targetId = this.getAttribute('href');
      
      if (targetId && targetId !== '#') {
        // Αφήνουμε το CSS scroll-behavior: smooth να χειριστεί το scroll
      } else {
        return; 
      }
      
      const targetElement = document.querySelector(targetId);
      
      if (!targetElement) return;

      // Update URL hash without jumping
      history.replaceState(null, null, targetId);
      
      if (document.getElementById('mobileNav').classList.contains('active')) {
        toggleMenu();
      }
    });
  });
}

function initParallax() {
  console.log('Parallax initialized using CSS background-attachment: fixed.');
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
    if (gallery.style.display !== 'flex') return;
    if (e.key === 'Escape') closeGallery();
    else if (e.key === 'ArrowRight') navigateGallery(1);
    else if (e.key === 'ArrowLeft') navigateGallery(-1);
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
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + 
      (document.documentElement.lang === 'en' ? 'Sending' : 'Αποστολή');
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

// Product Animation (Scroll Reveal)
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

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Splash Screen & Body Fade In
  handleSplashScreen(); 
  
  // 2. Load settings (Theme/Language)
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  const savedLang = localStorage.getItem('language') || 'en';
  document.documentElement.lang = savedLang;
  if (savedLang !== 'en') {
    toggleLanguage();
  }

  // 3. Initialize all functionalities
  updateCartUI();
  initProductGallery();
  initParallax(); 
  handleContactForm();
  initSmoothScrolling(); 
  animateProducts();
  
  // Event delegation for add to cart buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      e.preventDefault();
      addToCart(e.target);
    }
  });
});

// Expose global functions (for HTML event handlers)
window.toggleTheme = toggleTheme;
window.toggleMenu = toggleMenu;
window.toggleLanguage = toggleLanguage;
window.toggleCart = toggleCart;
window.removeFromCart = removeFromCart;
window.closeGallery = closeGallery;
window.navigateGallery = navigateGallery;