
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true,
  offset: 100
});

document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  const toggleCircle = document.getElementById('toggleCircle');
  const htmlElement = document.documentElement;
  
  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);
  updateToggleIcon(savedTheme);
  
  themeToggle.addEventListener('click', function() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateToggleIcon(newTheme);
  });
  
  function updateToggleIcon(theme) {
    if (theme === 'light') {
      toggleCircle.innerHTML = '<i class="fas fa-sun"></i>';
      toggleCircle.style.left = '34px';
    } else {
      toggleCircle.innerHTML = '<i class="fas fa-moon"></i>';
      toggleCircle.style.left = '4px';
    }
  }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
      
      const navCollapse = document.querySelector('.navbar-collapse');
      if (navCollapse.classList.contains('show')) {
        document.querySelector('.navbar-toggler').click();
      }
    }
  });
});

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.custom-navbar');
  if (window.scrollY > 50) {
    navbar.style.padding = '0.5rem 0';
    navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
  } else {
    navbar.style.padding = '1rem 0';
    navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
  }
});

// Download tracking (optional - for analytics)
document.querySelectorAll('[href*="play.google.com"]').forEach(link => {
  link.addEventListener('click', function() {
    console.log('Play Store link clicked');
  });
});

document.querySelectorAll('[href*=".apk"]').forEach(link => {
  link.addEventListener('click', function() {
    console.log('APK download initiated');
  });
});

window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  const scrollPercent = window.scrollY / window.innerHeight;
  if (scrollPercent < 1) {
    hero.style.opacity = 1 - scrollPercent * 0.3;
  }
});
