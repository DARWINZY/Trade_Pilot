// ============================================
// TradePilot AI — Warnings Module
// ============================================

function initWarnings(containerEl) {
  window._warningsContainer = containerEl;
}

function renderWarnings(originCountry, destCountry, productCategory, tradeType) {
  const container = window._warningsContainer;
  if (!container) return;

  const allWarnings = [];

  // 1. Global warnings
  WARNINGS.global.forEach(w => allWarnings.push(w));

  // 2. Country-specific warnings (based on trade direction)
  const relevantCountry = tradeType === 'import' ? originCountry : destCountry;
  if (WARNINGS.country[relevantCountry]) {
    WARNINGS.country[relevantCountry].forEach(w => allWarnings.push(w));
  }

  // 3. Product-specific warnings
  if (WARNINGS.product[productCategory]) {
    WARNINGS.product[productCategory].forEach(w => allWarnings.push(w));
  }

  // Sort: critical first, then important, then info
  const typeOrder = { critical: 0, important: 1, info: 2 };
  allWarnings.sort((a, b) => (typeOrder[a.type] || 2) - (typeOrder[b.type] || 2));

  container.innerHTML = `
    <div class="warnings-container">
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <span style="padding: 0.35rem 0.85rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 9999px; font-size: 0.85rem; color: var(--accent-red); font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">
          <i data-lucide="alert-octagon" class="inline-icon"></i> สำคัญมาก: ${allWarnings.filter(w => w.type === 'critical').length}
        </span>
        <span style="padding: 0.35rem 0.85rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 9999px; font-size: 0.85rem; color: var(--accent-orange); font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">
          <i data-lucide="alert-triangle" class="inline-icon"></i> ควรทราบ: ${allWarnings.filter(w => w.type === 'important').length}
        </span>
        <span style="padding: 0.35rem 0.85rem; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 9999px; font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">
          <i data-lucide="info" class="inline-icon"></i> ข้อมูล: ${allWarnings.filter(w => w.type === 'info').length}
        </span>
      </div>
      
      ${allWarnings.map(warning => renderWarningCard(warning)).join('')}
      
      ${allWarnings.length === 0 ? `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <div style="margin-bottom: 1rem;"><i data-lucide="check-circle" style="width: 48px; height: 48px; stroke: var(--accent-green); margin: 0 auto; display: block;"></i></div>
          <p>ไม่มีคำเตือนเพิ่มเติมสำหรับตัวเลือกนี้</p>
        </div>
      ` : ''}
    </div>
  `;

  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderWarningCard(warning) {
  const typeClass = {
    critical: 'warning-critical',
    important: 'warning-important',
    info: 'warning-info',
  }[warning.type] || 'warning-info';

  const typeLabel = {
    critical: 'สำคัญมาก',
    important: 'ควรทราบ',
    info: 'ข้อมูล',
  }[warning.type] || 'ข้อมูล';

  return `
    <div class="warning-card ${typeClass}">
      <div class="wc-icon"><i data-lucide="${warning.icon}"></i></div>
      <div class="wc-content">
        <h4>${warning.title}</h4>
        <p>${warning.text}</p>
        <span class="wc-tag">${typeLabel}</span>
      </div>
    </div>
  `;
}

// Get a summary warning for dashboard
function getDashboardWarning(originCountry, destCountry, productCategory, tradeType) {
  const warnings = [];

  // Get most critical warning
  const relevantCountry = tradeType === 'import' ? originCountry : destCountry;
  
  if (WARNINGS.product[productCategory]) {
    const critical = WARNINGS.product[productCategory].find(w => w.type === 'critical');
    if (critical) warnings.push(critical);
  }

  if (WARNINGS.country[relevantCountry]) {
    const important = WARNINGS.country[relevantCountry].find(w => w.type === 'important');
    if (important) warnings.push(important);
  }

  // Default
  if (warnings.length === 0) {
    warnings.push(WARNINGS.global[0]);
  }

  return warnings[0];
}
