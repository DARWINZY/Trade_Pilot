// ============================================
// TradePilot AI — Main Application Logic
// ============================================

// Application State
const state = {
  tradeType: 'import', // 'import' or 'export'
  originCountry: 'CN',
  destCountry: 'TH',
  productCategory: 'general',
  theme: 'dark' // 'dark' or 'light'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initSelectors();
  initComponents();
  
  // Show initial view
  showSection('country-selector');
});

// ---- Theme Management ----
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('tp_theme');
  if (savedTheme) {
    state.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    state.theme = 'light';
  }
  
  applyTheme();
  
  toggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    localStorage.setItem('tp_theme', state.theme);
  });
}

function applyTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  
  if (state.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    toggleBtn.innerHTML = '🌙';
  } else {
    document.documentElement.removeAttribute('data-theme');
    toggleBtn.innerHTML = '☀️';
  }
}

// ---- Navigation ----
function initNavigation() {
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Buttons
  document.getElementById('start-btn').addEventListener('click', () => {
    showSection('country-selector');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('to-dashboard-btn').addEventListener('click', () => {
    updateDashboardContext();
    showSection('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Feature cards clicks
  document.getElementById('card-checklist').addEventListener('click', () => {
    showPanel('panel-checklist');
    renderChecklist(state.tradeType, state.productCategory);
  });

  document.getElementById('card-calculator').addEventListener('click', () => {
    showPanel('panel-calculator');
  });

  document.getElementById('card-product').addEventListener('click', () => {
    showPanel('panel-product');
  });

  document.getElementById('card-warnings').addEventListener('click', () => {
    showPanel('panel-warnings');
    renderWarnings(state.originCountry, state.destCountry, state.productCategory, state.tradeType);
  });

  // Back buttons
  document.querySelectorAll('.panel-back').forEach(btn => {
    btn.addEventListener('click', () => {
      showSection('dashboard');
    });
  });

  // Edit context from dashboard
  document.getElementById('edit-context-btn').addEventListener('click', () => {
    showSection('country-selector');
  });
}

function showSection(sectionId) {
  // Hide all sections and panels
  document.querySelectorAll('.section, .feature-panel').forEach(el => {
    el.classList.remove('active');
  });
  
  // Show target
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
  }

  // Handle hero section visibility
  const hero = document.getElementById('hero');
  if (sectionId === 'country-selector' && window.scrollY === 0) {
    // Keep hero visible when starting
  } else {
    hero.style.display = 'none';
  }
}

function showPanel(panelId) {
  document.querySelectorAll('.section, .feature-panel').forEach(el => {
    el.classList.remove('active');
  });
  
  const target = document.getElementById(panelId);
  if (target) {
    target.classList.add('active');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Selectors Setup ----
function initSelectors() {
  const originSelect = document.getElementById('origin-country');
  const destSelect = document.getElementById('dest-country');
  const categorySelect = document.getElementById('product-category');
  
  // Populate country options
  const optionsHtml = COUNTRIES.map(c => 
    `<option value="${c.code}">${c.flag} ${c.name}</option>`
  ).join('');
  
  originSelect.innerHTML = optionsHtml;
  destSelect.innerHTML = optionsHtml;
  
  // Set defaults
  originSelect.value = state.originCountry;
  destSelect.value = state.destCountry;
  
  // Populate category options
  categorySelect.innerHTML = PRODUCT_CATEGORIES.map(c => 
    `<option value="${c.id}">${c.icon} ${c.name}</option>`
  ).join('');
  categorySelect.value = state.productCategory;
  
  // Event listeners
  originSelect.addEventListener('change', (e) => state.originCountry = e.target.value);
  destSelect.addEventListener('change', (e) => state.destCountry = e.target.value);
  categorySelect.addEventListener('change', (e) => state.productCategory = e.target.value);
  
  // Swap button
  document.getElementById('swap-countries').addEventListener('click', () => {
    const temp = state.originCountry;
    state.originCountry = state.destCountry;
    state.destCountry = temp;
    
    originSelect.value = state.originCountry;
    destSelect.value = state.destCountry;
    
    // Auto-toggle trade type
    if (state.destCountry === 'TH') {
      setTradeType('import');
    } else if (state.originCountry === 'TH') {
      setTradeType('export');
    }
  });

  // Trade type buttons
  document.querySelectorAll('.trade-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTradeType(btn.dataset.type);
    });
  });
}

function setTradeType(type) {
  state.tradeType = type;
  
  // Update UI
  document.querySelectorAll('.trade-type-btn').forEach(btn => {
    if (btn.dataset.type === type) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Auto-adjust countries if needed
  const originSelect = document.getElementById('origin-country');
  const destSelect = document.getElementById('dest-country');

  if (type === 'import' && state.destCountry !== 'TH') {
    state.originCountry = state.destCountry === 'TH' ? 'CN' : state.destCountry;
    state.destCountry = 'TH';
    originSelect.value = state.originCountry;
    destSelect.value = state.destCountry;
  } else if (type === 'export' && state.originCountry !== 'TH') {
    state.destCountry = state.originCountry === 'TH' ? 'US' : state.originCountry;
    state.originCountry = 'TH';
    originSelect.value = state.originCountry;
    destSelect.value = state.destCountry;
  }
}

// ---- Initialize Components ----
function initComponents() {
  initChecklist(document.getElementById('checklist-wrapper'));
  initCalculator(document.getElementById('calculator-wrapper'));
  initProductChecker(document.getElementById('product-checker-wrapper'));
  initWarnings(document.getElementById('warnings-wrapper'));
}

// ---- Dashboard Context Update ----
function updateDashboardContext() {
  const originInfo = COUNTRIES.find(c => c.code === state.originCountry);
  const destInfo = COUNTRIES.find(c => c.code === state.destCountry);
  const categoryInfo = PRODUCT_CATEGORIES.find(c => c.id === state.productCategory);
  
  const typeText = state.tradeType === 'import' ? 'การนำเข้า' : 'การส่งออก';
  
  document.getElementById('dashboard-context').innerHTML = `
    <span class="context-flag">${originInfo.flag}</span>
    <span>${originInfo.name}</span>
    <span class="context-arrow">→</span>
    <span class="context-flag">${destInfo.flag}</span>
    <span>${destInfo.name}</span>
    <span style="color: var(--border-color); margin: 0 0.5rem;">|</span>
    <span>${categoryInfo.icon} ${categoryInfo.name}</span>
    <button class="edit-context" id="edit-context-btn">แก้ไข</button>
  `;
  
  // Re-attach edit listener since we overwrote HTML
  document.getElementById('edit-context-btn').addEventListener('click', () => {
    showSection('country-selector');
  });

  // Update Dashboard Warning Banner
  updateDashboardBanner();
}

function updateDashboardBanner() {
  const warning = getDashboardWarning(state.originCountry, state.destCountry, state.productCategory, state.tradeType);
  const banner = document.getElementById('dashboard-banner');
  
  if (warning) {
    banner.innerHTML = `
      <div class="warning-icon">${warning.icon}</div>
      <div class="warning-text">
        <strong>${warning.title}</strong>
        ${warning.text}
      </div>
    `;
    banner.style.display = 'flex';
    
    // Set colors based on severity
    if (warning.type === 'critical') {
      banner.style.background = 'var(--gradient-danger)';
      banner.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      banner.querySelector('.warning-text').style.color = 'var(--accent-red)';
    } else if (warning.type === 'important') {
      banner.style.background = 'var(--gradient-warning)';
      banner.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      banner.querySelector('.warning-text').style.color = 'var(--accent-orange)';
    } else {
      banner.style.background = 'rgba(6, 182, 212, 0.08)';
      banner.style.borderColor = 'rgba(6, 182, 212, 0.2)';
      banner.querySelector('.warning-text').style.color = 'var(--accent-cyan)';
    }
  } else {
    banner.style.display = 'none';
  }
}
