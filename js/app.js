// ============================================
// TradePilot AI — Main Application Logic
// ============================================

// Application State
// Application State
const state = {
  tradeType: 'import', // 'import' or 'export'
  originCountry: 'CN',
  destCountry: 'TH',
  productCategory: 'general',
  theme: 'dark', // 'dark' or 'light'
  lang: 'th' // 'th' or 'en'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initTheme();
  initNavigation();
  initSelectors();
  initComponents();
  
  // Handle initial hash or show initial view
  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);
});

// ---- Routing System ----
function handleHashChange() {
  const hash = window.location.hash.replace('#', '') || 'home';
  
  // Handle About Modal visibility
  const aboutModal = document.getElementById('about-modal');
  if (hash === 'about') {
    if (aboutModal) aboutModal.classList.add('active');
    return; // Keep current page visible behind the modal
  } else {
    if (aboutModal) aboutModal.classList.remove('active');
  }
  
  if (hash === 'home') {
    const hero = document.getElementById('hero');
    if (hero) hero.style.display = 'flex';
    document.querySelectorAll('.section, .feature-panel').forEach(el => el.classList.remove('active'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (hash === 'selector') {
    showSection('country-selector');
  } else if (hash === 'dashboard') {
    updateDashboardContext();
    showSection('dashboard');
  } else if (hash.startsWith('panel-')) {
    if (hash === 'panel-checklist') renderChecklist(state.tradeType, state.productCategory);
    if (hash === 'panel-warnings') renderWarnings(state.originCountry, state.destCountry, state.productCategory, state.tradeType);
    if (hash === 'panel-calculator') updateCalculatorCategory(state.productCategory);
    showPanel(hash);
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

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
  if (!toggleBtn) return;
  
  if (state.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    toggleBtn.innerHTML = '<i data-lucide="moon"></i>';
  } else {
    document.documentElement.removeAttribute('data-theme');
    toggleBtn.innerHTML = '<i data-lucide="sun"></i>';
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

// ---- Language Management ----
function initLanguage() {
  const savedLang = localStorage.getItem('tp_lang');
  if (savedLang) {
    state.lang = savedLang;
  }
  
  applyLanguage();
  
  const langToggleBtn = document.getElementById('lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      state.lang = state.lang === 'th' ? 'en' : 'th';
      localStorage.setItem('tp_lang', state.lang);
      applyLanguage();
      
      // Re-initialize country input display
      const originCountry = COUNTRIES.find(c => c.code === state.originCountry);
      const destCountry = COUNTRIES.find(c => c.code === state.destCountry);
      if (originCountry) {
        document.getElementById('origin-country-input').value = getCountryName(originCountry);
      }
      if (destCountry) {
        document.getElementById('dest-country-input').value = getCountryName(destCountry);
      }

      // Re-populate category select
      const categorySelect = document.getElementById('product-category');
      if (categorySelect) {
        categorySelect.innerHTML = PRODUCT_CATEGORIES.map(c => 
          `<option value="${c.id}">${t(c.name)}</option>`
        ).join('');
        categorySelect.value = state.productCategory;
      }
      
      // Save state before re-rendering dynamic panels
      const calcCat = document.getElementById('calc-category')?.value;
      const calcCost = document.getElementById('calc-cost')?.value;
      const calcIns = document.getElementById('calc-insurance')?.value;
      const calcFreight = document.getElementById('calc-freight')?.value;
      const calcDuty = document.getElementById('calc-duty-rate')?.value;
      const calcResultVisible = document.getElementById('result-breakdown')?.innerHTML.trim() !== '';

      const prodSearch = document.getElementById('product-search')?.value;
      const prodResultVisible = document.getElementById('product-result')?.innerHTML.trim() !== '';

      // Re-render Calculator and Product Checker to apply translations
      if (typeof renderCalculator === 'function') renderCalculator();
      if (typeof renderProductChecker === 'function') renderProductChecker();

      // Restore state and re-calculate if needed
      if (typeof renderCalculator === 'function') {
        if (calcCat !== undefined) document.getElementById('calc-category').value = calcCat;
        if (calcCost !== undefined) document.getElementById('calc-cost').value = calcCost;
        if (calcIns !== undefined) document.getElementById('calc-insurance').value = calcIns;
        if (calcFreight !== undefined) document.getElementById('calc-freight').value = calcFreight;
        if (calcDuty !== undefined) document.getElementById('calc-duty-rate').value = calcDuty;
        if (calcResultVisible && typeof calculate === 'function') calculate();
      }

      if (typeof renderProductChecker === 'function') {
        if (prodSearch !== undefined) document.getElementById('product-search').value = prodSearch;
        if (prodResultVisible && typeof searchProduct === 'function') searchProduct();
      }
      
      // Run warnings, checks and re-render current panel
      validateTradeRoute();
      handleHashChange(); // This will trigger re-render of active panels

      // Re-apply icons for newly rendered components
      if (window.lucide) {
        lucide.createIcons();
      }
    });
  }
}

function applyLanguage() {
  // Update HTML lang attribute
  document.documentElement.setAttribute('lang', state.lang);
  
  // Update language toggle button label
  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = state.lang === 'th' ? 'TH' : 'EN';
  }
  
  // Translate page elements
  translatePage();
}

function translatePage() {
  // Translate title and meta description
  if (state.lang === 'en') {
    document.title = "TradePilot AI — International Trade Navigator";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Your digital assistant for international trade checklists, calculators, and regulation checks.");
  } else {
    document.title = "TradePilot AI — ระบบนำทางการค้าระหว่างประเทศ";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "ตัวช่วยเช็คลิสต์ คำนวณภาษี และตรวจสอบกฎระเบียบสำหรับการนำเข้า-ส่งออกสินค้าระหว่างประเทศ");
  }

  // data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  
  // data-i18n-html
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });
  
  // data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  // data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

const getCountryName = (c) => {
  if (!c) return '';
  return state.lang === 'en' ? c.enName : c.name;
};

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
    window.location.hash = 'selector';
  });

  document.getElementById('to-dashboard-btn').addEventListener('click', () => {
    window.location.hash = 'dashboard';
  });

  // Feature cards clicks
  document.getElementById('card-checklist').addEventListener('click', () => {
    window.location.hash = 'panel-checklist';
  });

  document.getElementById('card-calculator').addEventListener('click', () => {
    window.location.hash = 'panel-calculator';
  });

  document.getElementById('card-product').addEventListener('click', () => {
    window.location.hash = 'panel-product';
  });

  document.getElementById('card-warnings').addEventListener('click', () => {
    window.location.hash = 'panel-warnings';
  });

  // Back buttons
  document.querySelectorAll('.panel-back').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = 'dashboard';
    });
  });

  // About Modal Close listeners
  const aboutModal = document.getElementById('about-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn && aboutModal) {
    const closeModal = () => {
      if (window.location.hash === '#about') {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.hash = 'home';
        }
      } else {
        aboutModal.classList.remove('active');
      }
    };
    closeBtn.addEventListener('click', closeModal);
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) {
        closeModal();
      }
    });
  }
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
  if (hero) {
    hero.style.display = 'none';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPanel(panelId) {
  document.querySelectorAll('.section, .feature-panel').forEach(el => {
    el.classList.remove('active');
  });
  
  const target = document.getElementById(panelId);
  if (target) {
    target.classList.add('active');
  }
  
  const hero = document.getElementById('hero');
  if (hero) hero.style.display = 'none';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Autocomplete Input Setup ----
function setupAutocomplete(containerId, inputId, flagId, dropdownId, stateKey) {
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
  const flagSpan = document.getElementById(flagId);
  const dropdown = document.getElementById(dropdownId);
  
  if (!container || !input || !flagSpan || !dropdown) return;
  
  // Set initial value
  const initialCountry = COUNTRIES.find(c => c.code === state[stateKey]) || COUNTRIES[0];
  input.value = getCountryName(initialCountry);
  flagSpan.src = `https://flagcdn.com/w40/${initialCountry.code.toLowerCase()}.png`;
  flagSpan.alt = getCountryName(initialCountry);
  
  // Render search suggestions
  function renderSuggestions(query = '') {
    const filtered = COUNTRIES.filter(c => {
      const q = query.toLowerCase().trim();
      if (!q) return true; // Show all
      return c.name.toLowerCase().includes(q) || 
             c.enName.toLowerCase().includes(q) || 
             c.code.toLowerCase() === q;
    });
    
    if (filtered.length === 0) {
      dropdown.innerHTML = `<div class="autocomplete-no-results">${t('autocomplete-no-results')}</div>`;
    } else {
      dropdown.innerHTML = filtered.map(c => {
        const isSelected = c.code === state[stateKey] ? 'selected' : '';
        const cName = getCountryName(c);
        return `
          <div class="autocomplete-item ${isSelected}" data-code="${c.code}">
            <img class="autocomplete-item-flag-img" src="https://flagcdn.com/w40/${c.code.toLowerCase()}.png" alt="${cName}">
            <span class="autocomplete-item-name">${cName}</span>
            <span class="autocomplete-item-code">${c.code}</span>
          </div>
        `;
      }).join('');
      
      // Attach click listeners to suggestions
      dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
          // Use mousedown instead of click to fire before input blur
          const code = item.dataset.code;
          selectCountry(code);
        });
      });
    }
  }
  
  function selectCountry(code) {
    const country = COUNTRIES.find(c => c.code === code);
    if (!country) return;
    
    state[stateKey] = code;
    input.value = getCountryName(country);
    flagSpan.src = `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`;
    flagSpan.alt = getCountryName(country);
    dropdown.style.display = 'none';
    
    // Auto-toggle trade type
    if (state.destCountry === 'TH') {
      setTradeType('import');
    } else if (state.originCountry === 'TH') {
      setTradeType('export');
    }
    
    // Run restriction validation
    validateTradeRoute();
  }
  
  // Show dropdown on focus
  input.addEventListener('focus', () => {
    input.value = '';
    renderSuggestions('');
    dropdown.style.display = 'block';
  });
  
  // Filter on input
  input.addEventListener('input', (e) => {
    renderSuggestions(e.target.value);
  });
  
  // Revert / Close on blur
  input.addEventListener('blur', () => {
    // Delay slightly to let mousedown register
    setTimeout(() => {
      dropdown.style.display = 'none';
      const currentCountry = COUNTRIES.find(c => c.code === state[stateKey]);
      if (currentCountry) {
        input.value = getCountryName(currentCountry);
        flagSpan.src = `https://flagcdn.com/w40/${currentCountry.code.toLowerCase()}.png`;
        flagSpan.alt = getCountryName(currentCountry);
      }
    }, 150);
  });
}

// ---- Trade Route Sanctions & Restrictions Check ----
function validateTradeRoute() {
  const origin = state.originCountry;
  const dest = state.destCountry;
  const warningContainer = document.getElementById('route-warning-container');
  const continueBtn = document.getElementById('to-dashboard-btn');
  
  if (!warningContainer || !continueBtn) return;
  
  let isBanned = false;
  let warningHtml = '';
  
  if (origin === dest) {
    isBanned = true;
    warningHtml = `
      <div class="route-warning-card">
        <div class="rw-icon"><i data-lucide="alert-octagon"></i></div>
        <div class="rw-text">
          <strong>${t('เส้นทางการค้าไม่ถูกต้อง')}</strong>
          ${t('ประเทศต้นทางและปลายทางไม่สามารถเป็นประเทศเดียวกันได้สำหรับการค้าระหว่างประเทศ กรุณาเลือกประเทศใหม่')}
        </div>
      </div>
    `;
  } else if (origin === 'KP' || dest === 'KP') {
    isBanned = true;
    warningHtml = `
      <div class="route-warning-card">
        <div class="rw-icon"><i data-lucide="ban"></i></div>
        <div class="rw-text">
          <strong>${t('เส้นทางการค้าถูกระงับ (Trade Embargo)')}</strong>
          ${t('ประเทศเกาหลีเหนือ (North Korea) อยู่ภายใต้มาตรการคว่ำบาตรทางการค้าอย่างเข้มงวดจากองค์การสหประชาชาติ (UN Sanctions) ทำให้ไม่สามารถดำเนินพิธีการนำเข้า/ส่งออกเชิงพาณิชย์ทั่วไปได้')}
        </div>
      </div>
    `;
  } else if (origin === 'IR' || dest === 'IR') {
    isBanned = true;
    warningHtml = `
      <div class="route-warning-card">
        <div class="rw-icon"><i data-lucide="ban"></i></div>
        <div class="rw-text">
          <strong>${t('เส้นทางการค้ามีข้อจำกัดร้ายแรง (Sanctioned Route)')}</strong>
          ${t('ประเทศอิหร่าน (Iran) อยู่ภายใต้ข้อจำกัดทางการเงินและการค้าของระบบระหว่างประเทศ ห้ามทำธุรกรรมการค้าหรือการขนส่งในสินค้ากลุ่มเทคโนโลยี พลังงาน และอุปกรณ์อุตสาหกรรม')}
        </div>
      </div>
    `;
  } else if (origin === 'SY' || dest === 'SY') {
    isBanned = true;
    warningHtml = `
      <div class="route-warning-card">
        <div class="rw-icon"><i data-lucide="ban"></i></div>
        <div class="rw-text">
          <strong>${t('เส้นทางการค้าถูกระงับ (Restricted Route)')}</strong>
          ${t('ประเทศซีเรีย (Syria) อยู่ภายใต้มาตรการคว่ำบาตรระดับสากลอันเนื่องจากปัญหาความมั่นคง ไม่สามารถนำเข้าหรือส่งออกสินค้าระหว่างประเทศในเชิงพาณิชย์ปกติได้')}
        </div>
      </div>
    `;
  } else if ((origin === 'US' && dest === 'CU') || (origin === 'CU' && dest === 'US')) {
    isBanned = true;
    warningHtml = `
      <div class="route-warning-card">
        <div class="rw-icon"><i data-lucide="ban"></i></div>
        <div class="rw-text">
          <strong>${t('ข้อจำกัดการคว่ำบาตรทางการค้า (US-Cuba Embargo)')}</strong>
          ${t('มีการคว่ำบาตรทางการค้าระหว่างสหรัฐอเมริกาและคิวบาอย่างเข้มงวด (US Embargo on Cuba) ห้ามเรือสินค้าหรือสายการบินดำเนินพิธีการค้าระหว่างสองประเทศนี้โดยตรง')}
        </div>
      </div>
    `;
  } else if ((origin === 'UA' && dest === 'RU') || (origin === 'RU' && dest === 'UA')) {
    isBanned = true;
    warningHtml = `
      <div class="route-warning-card">
        <div class="rw-icon"><i data-lucide="alert-octagon"></i></div>
        <div class="rw-text">
          <strong>${t('เส้นทางการค้าระหว่างประเทศถูกระงับเนื่องจากสงคราม')}</strong>
          ${t('การทำธุรกรรมและการขนส่งสินค้าระหว่างประเทศยูเครนและสหพันธรัฐรัสเซียถูกระงับโดยสิ้นเชิงเนื่องจากภาวะความขัดแย้งด้านความมั่นคง')}
        </div>
      </div>
    `;
  } else if (origin !== 'TH' && dest !== 'TH') {
    isBanned = false;
    warningHtml = `
      <div class="route-warning-card info-only">
        <div class="rw-icon"><i data-lucide="info"></i></div>
        <div class="rw-text">
          <strong>${t('คู่ค้านอกประเทศไทย (เส้นทางการค้าทั่วไป)')}</strong>
          ${t('ระบบนี้วิเคราะห์ข้อมูลอ้างอิงพิกัดและอัตราอากรศุลกากรของประเทศไทยเป็นหลัก เช็คลิสต์และข้อมูลคำนวณสำหรับคู่ค้านอกประเทศจะเป็นรูปแบบมาตรฐานทั่วไป ซึ่งอาจแตกต่างจากกฎหมายท้องถิ่นของประเทศนั้นๆ')}
        </div>
      </div>
    `;
  }
  
  if (warningHtml) {
    warningContainer.innerHTML = warningHtml;
    warningContainer.style.display = 'block';
  } else {
    warningContainer.style.display = 'none';
  }
  
  continueBtn.disabled = isBanned;
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

// ---- Selectors Setup ----
function initSelectors() {
  const categorySelect = document.getElementById('product-category');
  
  // Set up autocompletes
  setupAutocomplete('origin-autocomplete-container', 'origin-country-input', 'origin-flag-indicator', 'origin-autocomplete-dropdown', 'originCountry');
  setupAutocomplete('dest-autocomplete-container', 'dest-country-input', 'dest-flag-indicator', 'dest-autocomplete-dropdown', 'destCountry');
  
  // Populate category options
  categorySelect.innerHTML = PRODUCT_CATEGORIES.map(c => 
    `<option value="${c.id}">${t(c.name)}</option>`
  ).join('');
  categorySelect.value = state.productCategory;
  categorySelect.addEventListener('change', (e) => state.productCategory = e.target.value);
  
  // Swap button
  document.getElementById('swap-countries').addEventListener('click', () => {
    const temp = state.originCountry;
    state.originCountry = state.destCountry;
    state.destCountry = temp;
    
    // Update inputs and flags
    const originCountry = COUNTRIES.find(c => c.code === state.originCountry);
    const destCountry = COUNTRIES.find(c => c.code === state.destCountry);
    
    if (originCountry) {
      document.getElementById('origin-country-input').value = getCountryName(originCountry);
      document.getElementById('origin-flag-indicator').src = `https://flagcdn.com/w40/${state.originCountry.toLowerCase()}.png`;
      document.getElementById('origin-flag-indicator').alt = getCountryName(originCountry);
    }
    if (destCountry) {
      document.getElementById('dest-country-input').value = getCountryName(destCountry);
      document.getElementById('dest-flag-indicator').src = `https://flagcdn.com/w40/${state.destCountry.toLowerCase()}.png`;
      document.getElementById('dest-flag-indicator').alt = getCountryName(destCountry);
    }
    
    // Auto-toggle trade type
    if (state.destCountry === 'TH') {
      setTradeType('import');
    } else if (state.originCountry === 'TH') {
      setTradeType('export');
    }
    
    validateTradeRoute();
  });

  // Trade type buttons
  document.querySelectorAll('.trade-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTradeType(btn.dataset.type);
    });
  });

  // Run initial validation
  validateTradeRoute();
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
  const originInput = document.getElementById('origin-country-input');
  const originFlag = document.getElementById('origin-flag-indicator');
  const destInput = document.getElementById('dest-country-input');
  const destFlag = document.getElementById('dest-flag-indicator');

  if (type === 'import' && state.destCountry !== 'TH') {
    state.originCountry = state.destCountry === 'TH' ? 'CN' : state.destCountry;
    state.destCountry = 'TH';
  } else if (type === 'export' && state.originCountry !== 'TH') {
    state.destCountry = state.originCountry === 'TH' ? 'US' : state.originCountry;
    state.originCountry = 'TH';
  }

  // Update DOM elements for autocompletes
  const originCountry = COUNTRIES.find(c => c.code === state.originCountry);
  const destCountry = COUNTRIES.find(c => c.code === state.destCountry);
  
  if (originCountry && originInput && originFlag) {
    originInput.value = getCountryName(originCountry);
    originFlag.src = `https://flagcdn.com/w40/${state.originCountry.toLowerCase()}.png`;
    originFlag.alt = getCountryName(originCountry);
  }
  if (destCountry && destInput && destFlag) {
    destInput.value = getCountryName(destCountry);
    destFlag.src = `https://flagcdn.com/w40/${state.destCountry.toLowerCase()}.png`;
    destFlag.alt = getCountryName(destCountry);
  }
  
  validateTradeRoute();
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
  const originInfo = COUNTRIES.find(c => c.code === state.originCountry) || { name: state.originCountry, flag: '🌍' };
  const destInfo = COUNTRIES.find(c => c.code === state.destCountry) || { name: state.destCountry, flag: '🌍' };
  const categoryInfo = PRODUCT_CATEGORIES.find(c => c.id === state.productCategory) || PRODUCT_CATEGORIES[0];
  
  const originName = getCountryName(originInfo);
  const destName = getCountryName(destInfo);
  const catName = t(categoryInfo.name);
  const editLabel = state.lang === 'en' ? 'Edit' : 'แก้ไข';
  
  document.getElementById('dashboard-context').innerHTML = `
    <img class="context-flag-img" src="https://flagcdn.com/w40/${state.originCountry.toLowerCase()}.png" alt="${originName}">
    <span>${originName}</span>
    <span class="context-arrow">→</span>
    <img class="context-flag-img" src="https://flagcdn.com/w40/${state.destCountry.toLowerCase()}.png" alt="${destName}">
    <span>${destName}</span>
    <span style="color: var(--border-color); margin: 0 0.5rem;">|</span>
    <span style="display:inline-flex; align-items:center; gap:0.25rem;"><i data-lucide="${categoryInfo.icon}"></i> ${catName}</span>
    <button class="edit-context" id="edit-context-btn">${editLabel}</button>
  `;
  
  // Re-attach edit listener since we overwrote HTML
  document.getElementById('edit-context-btn').addEventListener('click', () => {
    window.location.hash = 'selector';
  });

  // Update Dashboard Warning Banner
  updateDashboardBanner();
}

function updateDashboardBanner() {
  const warning = getDashboardWarning(state.originCountry, state.destCountry, state.productCategory, state.tradeType);
  const banner = document.getElementById('dashboard-banner');
  
  if (warning) {
    banner.innerHTML = `
      <div class="warning-icon"><i data-lucide="${warning.icon}"></i></div>
      <div class="warning-text">
        <strong>${t(warning.title)}</strong>
        ${t(warning.text)}
      </div>
    `;
    banner.style.display = 'flex';
    
    // Set colors based on severity
    if (warning.type === 'critical') {
      banner.style.background = 'var(--bg-danger-tint)';
      banner.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      banner.querySelector('.warning-icon').style.color = 'var(--accent-red)';
      banner.querySelector('.warning-text strong').style.color = 'var(--accent-red)';
    } else if (warning.type === 'important') {
      banner.style.background = 'var(--bg-warning-tint)';
      banner.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      banner.querySelector('.warning-icon').style.color = 'var(--accent-orange)';
      banner.querySelector('.warning-text strong').style.color = 'var(--accent-orange)';
    } else {
      banner.style.background = 'rgba(6, 182, 212, 0.08)';
      banner.style.borderColor = 'rgba(6, 182, 212, 0.2)';
      banner.querySelector('.warning-icon').style.color = 'var(--accent-cyan)';
      banner.querySelector('.warning-text strong').style.color = 'var(--accent-cyan)';
    }
  } else {
    banner.style.display = 'none';
  }
}
