// ============================================
// TradePilot AI — Product Checker Module
// ============================================

function initProductChecker(containerEl) {
  window._productContainer = containerEl;
  renderProductChecker();
}

function renderProductChecker() {
  const container = window._productContainer;
  if (!container) return;

  const quickSearchTerms = state.lang === 'en' ? [
    'E-cigarette', 'Cosmetics', 'Supplements', 'Medicine', 'Liquor',
    'Drones', 'Pets', 'Plants', 'Weapons', 'Counterfeits',
    'Buddha Images', 'Electronics', 'Fruits', 'Chemicals'
  ] : [
    'บุหรี่ไฟฟ้า', 'เครื่องสำอาง', 'อาหารเสริม', 'ยา', 'สุรา',
    'โดรน', 'สัตว์เลี้ยง', 'พืช', 'อาวุธ', 'ของก๊อป',
    'พระพุทธรูป', 'อิเล็กทรอนิกส์', 'ผลไม้', 'สารเคมี'
  ];

  container.innerHTML = `
    <div class="product-checker">
      <div class="search-box">
        <input type="text" class="form-input" id="product-search" 
               placeholder="${t('prod-search-placeholder')}">
        <button class="btn btn-primary" id="product-search-btn">${t('prod-search-btn')}</button>
      </div>
      
      <div class="quick-tags">
        <div class="quick-tags-label">${t('prod-quick-tags-label')}</div>
        <div class="quick-tags-list">
          ${quickSearchTerms.map(term => `
            <button class="quick-tag" data-term="${term}">${term}</button>
          `).join('')}
        </div>
      </div>
      
      <div class="product-result" id="product-result">
        <!-- Results appear here -->
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('product-search-btn').addEventListener('click', searchProduct);
  document.getElementById('product-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchProduct();
  });

  // Quick tags
  container.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.getElementById('product-search').value = tag.dataset.term;
      searchProduct();
    });
  });
}

function searchProduct() {
  const query = document.getElementById('product-search').value.trim().toLowerCase();
  if (!query) return;

  const resultContainer = document.getElementById('product-result');
  
  // Check prohibited items
  const prohibitedMatches = PROHIBITED_ITEMS.filter(item =>
    item.keywords.some(kw => query.includes(kw.toLowerCase()) || kw.toLowerCase().includes(query))
  );

  // Check restricted items
  const restrictedMatches = RESTRICTED_ITEMS.filter(item =>
    item.keywords.some(kw => query.includes(kw.toLowerCase()) || kw.toLowerCase().includes(query))
  );

  let html = '';

  if (prohibitedMatches.length > 0) {
    // Found prohibited items
    prohibitedMatches.forEach(item => {
      html += `
        <div class="status-card status-danger">
          <div class="status-icon"><i data-lucide="x-circle"></i></div>
          <div class="status-content">
            <h4>${t('ห้ามนำเข้า — ')}${t(item.name)}</h4>
            <p>${t(item.reason)}</p>
          </div>
        </div>
      `;
    });
  }

  if (restrictedMatches.length > 0) {
    // Found restricted items
    restrictedMatches.forEach(item => {
      html += `
        <div class="status-card status-warn">
          <div class="status-icon"><i data-lucide="alert-triangle"></i></div>
          <div class="status-content">
            <h4>${t('ต้องมีใบอนุญาต — ')}${t(item.name)}</h4>
            <p>${t(item.reason)}</p>
            <div class="agency-tag" style="display:inline-flex; align-items:center; gap:0.25rem;"><i data-lucide="building" style="width:12px; height:12px; stroke-width:2.2;"></i> ${t('หน่วยงาน: ')}${t(item.agency)}</div>
            ${item.docs && item.docs.length > 0 ? `
              <div style="margin-top: 0.75rem;">
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem; font-weight: 600; display:inline-flex; align-items:center; gap:0.25rem;"><i data-lucide="file-text" style="width:12px; height:12px; stroke-width:2.2;"></i> ${t('เอกสารที่ต้องใช้: ')}</div>
                <div class="item-docs">
                  ${item.docs.map(doc => `<span class="doc-tag" style="display:inline-flex; align-items:center; gap:0.2rem;"><i data-lucide="file-text" style="width:12px; height:12px; stroke-width:2.2;"></i> ${t(doc)}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });
  }

  if (prohibitedMatches.length === 0 && restrictedMatches.length === 0) {
    // No matches — likely okay
    html = `
      <div class="status-card status-pass">
        <div class="status-icon"><i data-lucide="check-circle"></i></div>
        <div class="status-content">
          <h4>${t('prod-not-found')}</h4>
          <p>${t('prod-not-found-desc-start')}<strong>${escapeHtml(query)}</strong>${t('prod-not-found-desc-end')}</p>
        </div>
      </div>
    `;
  }

  // Add disclaimer
  html += `
    <div style="margin-top: 1rem; padding: 1rem; background: rgba(6, 182, 212, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(6, 182, 212, 0.15);">
      <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; display:inline-flex; align-items:center; gap:0.35rem;">
        <i data-lucide="info" class="inline-icon" style="color: var(--accent-cyan); flex-shrink:0;"></i>
        <span><strong>${t('prod-ref-label')}</strong> ${t('prod-ref-text')}</span>
      </p>
    </div>
  `;

  resultContainer.innerHTML = html;
  resultContainer.classList.add('show');
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
