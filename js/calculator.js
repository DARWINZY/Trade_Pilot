// ============================================
// TradePilot AI — Tax Calculator Module
// ============================================

function initCalculator(containerEl) {
  window._calcContainer = containerEl;
  renderCalculator();
}

function renderCalculator() {
  const container = window._calcContainer;
  if (!container) return;

  container.innerHTML = `
    <div class="calculator-container">
      <div class="calc-input-card">
        <h3>📝 กรอกข้อมูล</h3>
        <div class="calc-form">
          <div class="form-group">
            <label class="form-label">หมวดหมู่สินค้า</label>
            <select class="form-select" id="calc-category">
              ${PRODUCT_CATEGORIES.map(cat => `
                <option value="${cat.id}">${cat.icon} ${cat.name} (อากร ~${cat.dutyRate}%)</option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">ราคาสินค้า (Cost)</label>
            <div class="input-group">
              <span class="input-prefix">฿</span>
              <input type="number" class="form-input" id="calc-cost" placeholder="เช่น 50000" min="0" step="100">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">ค่าประกัน (Insurance)</label>
            <div class="input-group">
              <span class="input-prefix">฿</span>
              <input type="number" class="form-input" id="calc-insurance" placeholder="เช่น 1000" min="0" step="100" value="0">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">ค่าขนส่ง (Freight)</label>
            <div class="input-group">
              <span class="input-prefix">฿</span>
              <input type="number" class="form-input" id="calc-freight" placeholder="เช่น 5000" min="0" step="100" value="0">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">อัตราอากรขาเข้า (กำหนดเอง)</label>
            <div class="input-group">
              <span class="input-prefix">%</span>
              <input type="number" class="form-input" id="calc-duty-rate" placeholder="อัตโนมัติตามหมวดหมู่" min="0" max="100" step="0.5">
            </div>
          </div>
          
          <button class="btn btn-primary calc-btn" id="calc-btn">
            🧮 คำนวณภาษี
          </button>
        </div>
      </div>
      
      <div class="calc-result-card">
        <h3>📊 ผลการคำนวณ</h3>
        <div class="result-placeholder" id="result-placeholder">
          <div class="placeholder-icon">🧮</div>
          <p>กรอกข้อมูลแล้วกด "คำนวณภาษี"<br>เพื่อดูผลลัพธ์</p>
        </div>
        <div class="result-breakdown" id="result-breakdown">
          <!-- Results will be rendered here -->
        </div>
      </div>
    </div>
  `;

  // Auto-fill duty rate when category changes
  const categorySelect = document.getElementById('calc-category');
  const dutyRateInput = document.getElementById('calc-duty-rate');
  
  categorySelect.addEventListener('change', () => {
    const selected = PRODUCT_CATEGORIES.find(c => c.id === categorySelect.value);
    if (selected) {
      dutyRateInput.placeholder = `${selected.dutyRate}% (ค่าเริ่มต้น ${selected.name})`;
      dutyRateInput.value = '';
    }
  });

  // Calculate button
  document.getElementById('calc-btn').addEventListener('click', calculate);

  // Enter key triggers calculation
  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') calculate();
    });
  });
}

function calculate() {
  const cost = parseFloat(document.getElementById('calc-cost').value) || 0;
  const insurance = parseFloat(document.getElementById('calc-insurance').value) || 0;
  const freight = parseFloat(document.getElementById('calc-freight').value) || 0;
  
  const categoryId = document.getElementById('calc-category').value;
  const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
  
  const customDutyRate = document.getElementById('calc-duty-rate').value;
  const dutyRate = customDutyRate !== '' ? parseFloat(customDutyRate) : (category ? category.dutyRate : 15);

  if (cost <= 0) {
    showError('กรุณากรอกราคาสินค้า');
    return;
  }

  // Calculations
  const cif = cost + insurance + freight;
  const importDuty = cif * (dutyRate / 100);
  const vatBase = cif + importDuty;
  const vat = vatBase * VAT_RATE;
  const totalTax = importDuty + vat;
  const totalCost = cif + totalTax;

  // Show results
  document.getElementById('result-placeholder').style.display = 'none';
  const breakdown = document.getElementById('result-breakdown');
  breakdown.classList.add('show');

  breakdown.innerHTML = `
    <div class="result-row">
      <span class="result-label">📦 ราคาสินค้า (Cost)</span>
      <span class="result-value">${formatCurrency(cost)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">🛡️ ค่าประกัน (Insurance)</span>
      <span class="result-value">${formatCurrency(insurance)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">🚛 ค่าขนส่ง (Freight)</span>
      <span class="result-value">${formatCurrency(freight)}</span>
    </div>
    <div class="result-row" style="border-bottom: 2px solid var(--border-color);">
      <span class="result-label"><strong>💼 มูลค่า CIF</strong></span>
      <span class="result-value" style="color: var(--accent-blue);">${formatCurrency(cif)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">🏛️ อากรขาเข้า (${dutyRate}%)</span>
      <span class="result-value" style="color: var(--accent-orange);">${formatCurrency(importDuty)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">📋 ฐานภาษี VAT (CIF + อากร)</span>
      <span class="result-value">${formatCurrency(vatBase)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">💰 VAT (7%)</span>
      <span class="result-value" style="color: var(--accent-purple);">${formatCurrency(vat)}</span>
    </div>
    <div class="result-row" style="border-top: 2px dashed var(--accent-orange); margin-top: 0.5rem; padding-top: 1rem;">
      <span class="result-label"><strong>💸 ภาษีรวม (อากร + VAT)</strong></span>
      <span class="result-value" style="color: var(--accent-red); font-size: 1.15rem;">${formatCurrency(totalTax)}</span>
    </div>
    <div class="result-row total">
      <span class="result-label">🎯 ต้นทุนทั้งหมด (CIF + ภาษี)</span>
      <span class="result-value">${formatCurrency(totalCost)}</span>
    </div>
    <div style="margin-top: 1.25rem; padding: 1rem; background: rgba(6, 182, 212, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(6, 182, 212, 0.15);">
      <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.6;">
        ⚠️ <strong>หมายเหตุ:</strong> การคำนวณนี้เป็นการประมาณการเบื้องต้น อัตราอากรจริงขึ้นอยู่กับพิกัดศุลกากร (HS Code) ของสินค้า 
        สินค้าบางรายการอาจมีภาษีสรรพสามิตเพิ่มเติม กรุณาตรวจสอบกับกรมศุลกากรอีกครั้ง
      </p>
    </div>
  `;
}

function showError(message) {
  document.getElementById('result-placeholder').style.display = 'none';
  const breakdown = document.getElementById('result-breakdown');
  breakdown.classList.add('show');
  breakdown.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--accent-red);">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">⚠️</div>
      <p>${message}</p>
    </div>
  `;
}

function formatCurrency(amount) {
  return '฿' + amount.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
