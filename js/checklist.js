// ============================================
// TradePilot AI — Checklist Module
// ============================================

let currentChecklist = [];
let completedItems = new Set();

function initChecklist(containerEl) {
  // Store reference
  window._checklistContainer = containerEl;
}

function renderChecklist(tradeType, productCategory) {
  const container = window._checklistContainer;
  if (!container) return;

  // Get appropriate checklist
  const typeChecklists = CHECKLISTS[tradeType] || CHECKLISTS.import;
  currentChecklist = typeChecklists[productCategory] || typeChecklists.general;
  
  // Load saved state
  const savedKey = `tp_checklist_${tradeType}_${productCategory}`;
  const saved = localStorage.getItem(savedKey);
  completedItems = saved ? new Set(JSON.parse(saved)) : new Set();

  const categoryInfo = PRODUCT_CATEGORIES.find(c => c.id === productCategory);
  const categoryIcon = categoryInfo ? categoryInfo.icon : 'package';
  const categoryName = categoryInfo ? t(categoryInfo.name) : t('สินค้าทั่วไป');
  const tradeIcon = tradeType === 'import' ? 'download' : 'upload';
  const tradeName = tradeType === 'import' ? t('นำเข้า') : t('ส่งออก');

  container.innerHTML = `
    <div class="checklist-container">
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <span style="padding: 0.35rem 0.85rem; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 9999px; font-size: 0.85rem; color: var(--accent-cyan); font-weight: 500; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="${tradeIcon}"></i> ${tradeName}</span>
        <span style="padding: 0.35rem 0.85rem; background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 9999px; font-size: 0.85rem; color: var(--accent-blue); font-weight: 500; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="${categoryIcon}"></i> ${categoryName}</span>
      </div>
      
      <div class="checklist-progress">
        <div class="progress-header">
          <span class="progress-label">${t('ความคืบหน้า')}</span>
          <span class="progress-value" id="progress-text">0 / ${currentChecklist.length}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
      </div>
      
      <div class="checklist-items" id="checklist-items">
        ${currentChecklist.map((item, index) => renderChecklistItem(item, index, tradeType, productCategory)).join('')}
      </div>
    </div>
  `;

  // Attach event listeners
  container.querySelectorAll('.checklist-item').forEach((el, index) => {
    el.addEventListener('click', () => toggleItem(index, tradeType, productCategory));
  });

  updateProgress();
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderChecklistItem(item, index, tradeType, productCategory) {
  const isCompleted = completedItems.has(index);
  
  return `
    <div class="checklist-item ${isCompleted ? 'completed' : ''}" data-index="${index}">
      <div class="checklist-checkbox"></div>
      <div class="item-number">${index + 1}</div>
      <div class="item-content">
        <div class="item-title">${t(item.title)}</div>
        <div class="item-desc">${t(item.desc)}</div>
        ${item.docs && item.docs.length > 0 ? `
          <div class="item-docs">
            ${item.docs.map(doc => `<span class="doc-tag" style="display:inline-flex; align-items:center; gap:0.2rem;"><i data-lucide="file-text" style="width:12px; height:12px; stroke-width:2.2;"></i> ${t(doc)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function toggleItem(index, tradeType, productCategory) {
  if (completedItems.has(index)) {
    completedItems.delete(index);
  } else {
    completedItems.add(index);
  }

  // Save state
  const savedKey = `tp_checklist_${tradeType}_${productCategory}`;
  localStorage.setItem(savedKey, JSON.stringify([...completedItems]));

  // Update UI
  const items = document.querySelectorAll('.checklist-item');
  const item = items[index];
  if (item) {
    item.classList.toggle('completed');
  }

  updateProgress();
}

function updateProgress() {
  const total = currentChecklist.length;
  const completed = completedItems.size;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');

  if (progressText) progressText.textContent = `${completed} / ${total} (${percentage}%)`;
  if (progressFill) progressFill.style.width = `${percentage}%`;
}
