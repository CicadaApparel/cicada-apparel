// =============================================
// MAIN FUNCTIONS
// =============================================

// Theme toggle with localStorage
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  
  // Optimize transitions
  const bgElements = [
    document.querySelector('.parallax-bg'),
    document.querySelector('.background-overlay')
  ];
  
  bgElements.forEach(el => {
    if (el) {
      el.style.willChange = 'filter, background, opacity';
      setTimeout(() => {
        el.style.willChange = 'auto';
      }, 700);
    }
  });
}

// Mobile menu toggle
function toggleMenu() {
  const nav = document.getElementById('mobileNav');
  const btn = document.querySelector('.mobile-menu-btn');
  
  nav.classList.toggle('active');
  btn.innerHTML = nav.classList.contains('active') ? 
    '<i class="fas fa-times"></i>' : 
    '<i class="fas fa-bars"></i>';
  
  // Toggle body scroll and close cart if open
  document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
  document.getElementById('cartPanel').classList.remove('active');
}

// Language toggle with animation
function toggleLanguage() {
  const langCode = document.querySelector('.lang-code');
  const currentLang = document.documentElement.lang;
  const newLang = currentLang === 'en' ? 'el' : 'en';
  
  // Animation
  langCode.style.transform = 'rotateX(90deg)';
  langCode.style.opacity = '0';
  
  setTimeout(() => {
    document.documentElement.lang = newLang;
    langCode.textContent = newLang === 'en' ? 'EL' : 'EN';
    
    // Update all translatable elements
    document.querySelectorAll('[data-en], [data-el]').forEach(el => {
      const attr = `data-${newLang}`;
      const text = el.getAttribute(attr);
      
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else if (el.hasAttribute(attr)) {
        el.textContent = text;
      }
    });
    
    // Reset animation
    langCode.style.transform = 'rotateX(0)';
    langCode.style.opacity = '1';
    
    localStorage.setItem('language', newLang);
  }, 150);
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productElement) {
  const productCard = productElement.closest('.product-card');
  const product = {
    name: productCard.querySelector('.product-title').textContent,
    price: productCard.querySelector('.product-price').textContent,
    image: productCard.querySelector('.product-image').src,
    id: Date.now() // Add unique ID
  };
  
  cart.push(product);
  updateCart();
  
  // Show feedback
  const feedback = document.createElement('div');
  feedback.className = 'add-to-cart-feedback';
  feedback.textContent = document.documentElement.lang === 'en' 
    ? '✓ Added to cart' 
    : '✓ Προστέθηκε';
  productCard.appendChild(feedback);
  setTimeout(() => feedback.remove(), 2000);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const cartItemsEl = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  
  // Update cart count
  cartCountEl.textContent = cart.length;
  cartCountEl.style.display = cart.length ? 'flex' : 'none';
  
  // Update cart items
  cartItemsEl.innerHTML = '';
  let total = 0;
  
  cart.forEach((item, index) => {
    const priceValue = parseFloat(item.price.replace('€', ''));
    total += priceValue;
    
    const cartItemEl = document.createElement('div');
    cartItemEl.className = 'cart-item';
    cartItemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${item.price}</div>
      </div>
      <button class="remove-item" onclick="removeFromCart(${index})" aria-label="Remove item">
        &times;
      </button>
    `;
    
    cartItemsEl.appendChild(cartItemEl);
  });
  
  // Update total
  cartTotalEl.textContent = `€${total.toFixed(2)}`;
}

function toggleCart() {
  const cartPanel = document.getElementById('cartPanel');
  cartPanel.classList.toggle('active');
  
  // Close mobile menu if open
  document.getElementById('mobileNav').classList.remove('active');
}

// Product Gallery (Lightbox)
let currentImageIndex = 0;

function initProductGallery() {
  const productImages = document.querySelectorAll('.product-image');
  const productGallery = document.getElementById('productGallery');
  const galleryImage = document.querySelector('.gallery-image');
  
  if (!productGallery) return;

  productImages.forEach((img, index) => {
    img.onerror = function() {
      this.src = 'https://via.placeholder.com/500x500.png?text=Product+Image';
    };
    
    img.addEventListener('click', () => {
      currentImageIndex = index;
      galleryImage.src = img.src;
      galleryImage.alt = img.alt;
      productGallery.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelector('.close-gallery').addEventListener('click', closeGallery);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (productGallery.style.display !== 'flex') return;
    
    if (e.key === 'Escape') {
      closeGallery();
    } else if (e.key === 'ArrowRight') {
      navigateGallery(1);
    } else if (e.key === 'ArrowLeft') {
      navigateGallery(-1);
    }
  });
  
  // Navigation buttons
  document.querySelector('.next-btn').addEventListener('click', () => navigateGallery(1));
  document.querySelector('.prev-btn').addEventListener('click', () => navigateGallery(-1));
}

function navigateGallery(direction) {
  const productImages = document.querySelectorAll('.product-image');
  const galleryImage = document.querySelector('.gallery-image');
  
  currentImageIndex = (currentImageIndex + direction + productImages.length) % productImages.length;
  galleryImage.src = productImages[currentImageIndex].src;
  galleryImage.alt = productImages[currentImageIndex].alt;
}

function closeGallery() {
  document.getElementById('productGallery').style.display = 'none';
  document.body.style.overflow = '';
}

// Quick View Functionality
function initQuickView() {
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productCard = e.target.closest('.product-card');
      const productName = productCard.querySelector('.product-title').textContent;
      
      // In a real implementation, this would show more product details
      console.log(`Quick view for: ${productName}`);
    });
  });
}

// Enhanced Parallax Effect with stronger movement
function initParallax() {
  const parallaxBg = document.querySelector('.parallax-bg');
  if (!parallaxBg) return;

  let requestId;
  let scale = 1;
  let lastScroll = 0;
  
  const handleScroll = () => {
    const scrollPosition = window.pageYOffset;
    const documentHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;
    
    // Calculate scale based on scroll position (1 to 1.1)
    scale = 1 + (scrollPosition / (documentHeight - windowHeight)) * 0.1;
    
    // Calculate movement (more pronounced effect)
    const movement = scrollPosition * 0.7; // Αύξηση από 0.5 σε 0.7
    
    // Smooth the movement
    const smoothMovement = lastScroll + (movement - lastScroll) * 0.1;
    lastScroll = smoothMovement;
    
    parallaxBg.style.transform = `translateY(${smoothMovement}px) scale(${scale})`;
    requestId = requestAnimationFrame(handleScroll);
  };

  window.addEventListener('scroll', () => {
    if (!requestId) {
      requestId = requestAnimationFrame(handleScroll);
    }
  }, { passive: true });

  // Initialize position
  handleScroll();
}

// Form Handling
function handleContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + 
      (document.documentElement.lang === 'en' ? 'Sending' : 'Αποστολή');
    submitBtn.disabled = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success message
      showFormMessage(
        document.documentElement.lang === 'en' 
          ? 'Thank you for your message! We will contact you soon.' 
          : 'Ευχαριστούμε για το μήνυμά σας! Θα επικοινωνήσουμε σύντομα.',
        'success'
      );
      
      this.reset();
    } catch (error) {
      showFormMessage(
        document.documentElement.lang === 'en' 
          ? 'Error sending message. Please try again.' 
          : 'Σφάλμα κατά την αποστολή. Παρακαλώ δοκιμάστε ξανά.',
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

// Smooth Scrolling
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#0') return;
      
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Close mobile menu if open
        document.getElementById('mobileNav').classList.remove('active');
        
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Update URL without adding to history
        history.replaceState(null, null, targetId);
      }
    });
  });
}

// Splash Screen
function handleSplashScreen() {
  const splashScreen = document.querySelector('.splash-screen');
  if (!splashScreen) return;

  // If user has visited before, skip splash
  if (sessionStorage.getItem('visited')) {
    splashScreen.remove();
    return;
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      splashScreen.style.opacity = '0';
      setTimeout(() => {
        splashScreen.remove();
        sessionStorage.setItem('visited', 'true');
      }, 500);
    }, 1500); // Reduced from 2000 for better UX
  });
}

// Product Animation
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
  // Set theme from localStorage
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  // Set language from localStorage
  const savedLang = localStorage.getItem('language') || 'en';
  if (savedLang !== 'en') {
    document.documentElement.lang = savedLang;
    const langCode = document.querySelector('.lang-code');
    if (langCode) {
      langCode.textContent = savedLang === 'en' ? 'EL' : 'EN';
      // Update all texts without animation
      document.querySelectorAll('[data-en], [data-el]').forEach(el => {
        const attr = `data-${savedLang}`;
        const text = el.getAttribute(attr);
        
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else if (el.hasAttribute(attr)) {
          el.textContent = text;
        }
      });
    }
  }
  
  // Initialize all functionalities
  updateCartUI();
  initProductGallery();
  initQuickView();
  initParallax();
  handleContactForm();
  initSmoothScrolling();
  handleSplashScreen();
  animateProducts();
  
  // Event delegation for add to cart buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      e.preventDefault();
      addToCart(e.target);
    }
  });
});

// =============================================
// GLOBAL FUNCTIONS (called from HTML)
// =============================================
window.toggleTheme = toggleTheme;
window.toggleMenu = toggleMenu;
window.toggleLanguage = toggleLanguage;
window.toggleCart = toggleCart;
window.removeFromCart = removeFromCart;