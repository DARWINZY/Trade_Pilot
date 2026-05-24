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

  const quickSearchTerms = [
    'บุหรี่ไฟฟ้า', 'เครื่องสำอาง', 'อาหารเสริม', 'ยา', 'สุรา',
    'โดรน', 'สัตว์เลี้ยง', 'พืช', 'อาวุธ', 'ของก๊อป',
    'พระพุทธรูป', 'อิเล็กทรอนิกส์', 'ผลไม้', 'สารเคมี'
  ];

  container.innerHTML = `
    <div class="product-checker">
      <div class="search-box">
        <input type="text" class="form-input" id="product-search" 
               placeholder="🔍 พิมพ์ชื่อสินค้าที่ต้องการตรวจสอบ เช่น บุหรี่ไฟฟ้า, เครื่องสำอาง, สุรา...">
        <button class="btn btn-primary" id="product-search-btn">ตรวจสอบ</button>
      </div>
      
      <div class="quick-tags">
        <div class="quick-tags-label">🏷️ ค้นหาด่วน:</div>
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
          <div class="status-icon">🔴</div>
          <div class="status-content">
            <h4>🚫 ห้ามนำเข้า — ${item.name}</h4>
            <p>${item.reason}</p>
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
          <div class="status-icon">🟡</div>
          <div class="status-content">
            <h4>⚠️ ต้องมีใบอนุญาต — ${item.name}</h4>
            <p>${item.reason}</p>
            <div class="agency-tag">🏢 หน่วยงาน: ${item.agency}</div>
            ${item.docs && item.docs.length > 0 ? `
              <div style="margin-top: 0.75rem;">
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem; font-weight: 600;">📄 เอกสารที่ต้องใช้:</div>
                <div class="item-docs">
                  ${item.docs.map(doc => `<span class="doc-tag">📄 ${doc}</span>`).join('')}
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
        <div class="status-icon">🟢</div>
        <div class="status-content">
          <h4>✅ ไม่พบในรายการสินค้าต้องห้าม/จำกัด</h4>
          <p>สินค้า "<strong>${escapeHtml(query)}</strong>" ไม่อยู่ในรายการสินค้าต้องห้ามหรือสินค้าจำกัดที่เราบันทึกไว้ 
          อย่างไรก็ตาม กรุณาตรวจสอบกับกรมศุลกากรอีกครั้งเพื่อความแน่ใจ เนื่องจากรายการนี้อาจไม่ครอบคลุมทุกรายการ</p>
        </div>
      </div>
    `;
  }

  // Add disclaimer
  html += `
    <div style="margin-top: 1rem; padding: 1rem; background: rgba(6, 182, 212, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(6, 182, 212, 0.15);">
      <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.6;">
        ℹ️ <strong>ข้อมูลอ้างอิง:</strong> ข้อมูลสินค้าต้องห้ามและสินค้าจำกัดนี้รวบรวมจากกรมศุลกากร, อย., และหน่วยงานที่เกี่ยวข้อง 
        กฎระเบียบอาจมีการเปลี่ยนแปลง กรุณาตรวจสอบกับหน่วยงานที่เกี่ยวข้องก่อนดำเนินการ
      </p>
    </div>
  `;

  resultContainer.innerHTML = html;
  resultContainer.classList.add('show');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
