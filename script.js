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

// Language toggle
function toggleLanguage() {
  const currentLang = document.documentElement.lang;
  const newLang = currentLang === 'en' ? 'el' : 'en';
  document.documentElement.lang = newLang;
  
  // Update all elements with data attributes
  document.querySelectorAll('[data-en], [data-el]').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = el.getAttribute(`data-${newLang}`);
    } else {
      el.textContent = el.getAttribute(`data-${newLang}`);
    }
  });
  
  // Update language toggle button (αντίστροφη λογική)
  const langToggle = document.querySelector('.language-toggle');
  langToggle.textContent = newLang === 'en' ? 'EL' : 'EN';
  
  // Save preference to localStorage
  localStorage.setItem('language', newLang);
}

// Check for saved preferences on load
window.addEventListener('DOMContentLoaded', () => {
  // Theme
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  // Language
  const savedLang = localStorage.getItem('language') || 'en';
  if (savedLang !== 'en') {
    document.documentElement.lang = savedLang;
    const langToggle = document.querySelector('.language-toggle');
    langToggle.textContent = 'EN'; // Αντίστροφη λογική
    toggleLanguage(); // This will update all texts
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Close mobile menu if open
      const nav = document.getElementById('mobileNav');
      nav.classList.remove('active');
      
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = document.documentElement.lang === 'en' ? 
      'Thank you for your message! We will get back to you soon.' :
      'Ευχαριστούμε για το μήνυμά σας! Θα επικοινωνήσουμε σύντομα μαζί σας.';
    alert(message);
    this.reset();
  });
}