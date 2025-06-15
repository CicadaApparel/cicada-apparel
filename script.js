// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
}

// Mobile menu toggle
function toggleMenu() {
  const nav = document.getElementById('mobileNav');
  nav.classList.toggle('active');
}

// Cart toggle
function toggleCart() {
  const cartPanel = document.getElementById('cartPanel');
  cartPanel.classList.toggle('active');
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
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = el.getAttribute(`data-${newLang}`);
      } else {
        el.textContent = el.getAttribute(`data-${newLang}`);
      }
    });
    
    // Reset animation
    langCode.style.transform = 'rotateX(0)';
    langCode.style.opacity = '1';
    langCode.style.transition = 'all 0.3s ease';
    
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
    image: productCard.querySelector('.product-image').src
  };
  
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  
  // Show added feedback
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
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${item.price}</div>
      </div>
      <button class="remove-item" onclick="removeFromCart(${index})">&times;</button>
    `;
    
    cartItemsEl.appendChild(cartItemEl);
  });
  
  // Update total
  cartTotalEl.textContent = `€${total.toFixed(2)}`;
}

// Initialize cart
updateCartUI();

// Set up event listeners for add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    addToCart(e.target);
  });
});

// Form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + submitBtn.textContent;
    submitBtn.disabled = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success message
      const successDiv = document.createElement('div');
      successDiv.className = 'form-message success';
      successDiv.textContent = document.documentElement.lang === 'en' 
        ? 'Thank you for your message! We will contact you soon.' 
        : 'Ευχαριστούμε για το μήνυμά σας! Θα επικοινωνήσουμε σύντομα.';
      
      this.prepend(successDiv);
      this.reset();
      
      // Remove message after 5 seconds
      setTimeout(() => successDiv.remove(), 5000);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Intersection Observer for animations
const animateOnScroll = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .section-title').forEach(el => {
    observer.observe(el);
  });
};

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const nav = document.getElementById('mobileNav');
      nav.classList.remove('active');
      
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  // Set theme from localStorage
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  // Set language from localStorage
  const savedLang = localStorage.getItem('language') || 'en';
  if (savedLang !== 'en') {
    document.documentElement.lang = savedLang;
    const langCode = document.querySelector('.lang-code');
    langCode.textContent = savedLang === 'en' ? 'EL' : 'EN';
    toggleLanguage(); // This will update all texts
  }
  
  // Initialize animations
  animateOnScroll();
});