let SPA_CONFIG = JSON.parse(localStorage.getItem('spa_config_v3') || JSON.stringify({
    NAME: "SEN LOTUS HARMONY SPA & RETREAT",
    ADDRESS: "22D Cầu Mây - Sapa - Lào Cai",
    PHONE: "0856112789",
    USD_RATE: 25000,
    BANK_ID: "MB",
    BANK_NO: "0856112789",
    BANK_NAME: "LOTUS HARMONY SPA"
}));

// DANH MỤC DỊCH VỤ SPA ĐẦY ĐỦ
const menuData = [
    // Tắm & Xông Hơi
    { category: "Tắm & Xông Hơi", name: "Red Dao's Herbal Bath (Tắm lá thuốc Dao đỏ)", duration: 30, vnd: 150000, usd: 6 },
    { category: "Tắm & Xông Hơi", name: "Sauna (Xông hơi khoang)", duration: 30, vnd: 150000, usd: 6 },
    { category: "Tắm & Xông Hơi", name: "Himalayan Salt Sauna (Xông hơi đá muối)", duration: 30, vnd: 200000, usd: 8 },

    // Massage Đầu/Cổ/Vai/Chân
    { category: "Massage Đầu/Cổ/Vai/Chân", name: "Massage Đầu, Cổ, Vai, Gáy, Chân", duration: 30, vnd: 150000, usd: 6 },
    { category: "Massage Đầu/Cổ/Vai/Chân", name: "Massage Đầu, Cổ, Vai, Gáy, Chân", duration: 45, vnd: 200000, usd: 8 },
    { category: "Massage Đầu/Cổ/Vai/Chân", name: "Massage Đầu, Cổ, Vai, Gáy, Chân", duration: 60, vnd: 250000, usd: 10 },
    { category: "Massage Đầu/Cổ/Vai/Chân", name: "Massage Đầu, Cổ, Vai, Gáy, Chân", duration: 90, vnd: 400000, usd: 16 },

    // Body Massage
    { category: "Body Massage", name: "Body Massage + Tinh dầu Aroma", duration: 45, vnd: 250000, usd: 10 },
    { category: "Body Massage", name: "Body Massage + Tinh dầu Aroma", duration: 60, vnd: 300000, usd: 12 },
    { category: "Body Massage", name: "Body Massage + Tinh dầu Aroma", duration: 90, vnd: 420000, usd: 17 },
    { category: "Body Massage", name: "Body Massage + Đá nóng (Hot Stone)", duration: 60, vnd: 400000, usd: 16 },
    { category: "Body Massage", name: "Body Massage + Thảo dược Herbal", duration: 60, vnd: 400000, usd: 16 },

    // Combo Body
    { category: "Combo Body", name: "Combo Tắm lá + Xông hơi + Đá muối", duration: 60, vnd: 700000, usd: 28 },
    { category: "Combo Body", name: "Combo Tắm lá + Xông hơi + Massage Body", duration: 90, vnd: 800000, usd: 32 },

    // Nail Care
    { category: "Nail Care", name: "Manicure (Cắt nhặt móng tay)", duration: 30, vnd: 150000, usd: 6 },
    { category: "Nail Care", name: "Pedicure (Cắt nhặt móng chân)", duration: 30, vnd: 150000, usd: 6 },
    { category: "Nail Care", name: "Gel nail (Sơn Gel)", duration: 45, vnd: 300000, usd: 12 },

    // Gội Đầu & Skincare
    { category: "Gội Đầu & Skincare", name: "Gội đầu dưỡng sinh (Scalp Care)", duration: 45, vnd: 250000, usd: 10 },
    { category: "Gội Đầu & Skincare", name: "Chăm sóc da mặt (Skincare)", duration: 60, vnd: 300000, usd: 12 }
];

let cart = [];
let currentCategory = "Tất cả";
let selectedPayment = "Tiền mặt";
let editingTxId = null; // Kiểm tra xem có đang chỉnh sửa đơn chờ không

let transactions = JSON.parse(localStorage.getItem('spa_transactions_v3') || '[]');
let expenses = JSON.parse(localStorage.getItem('spa_expenses_v3') || '[]');
let filteredCache = [];

function init() {
    document.getElementById("web-title").innerText = "🪷 " + SPA_CONFIG.NAME;
    document.getElementById("usd-rate").value = SPA_CONFIG.USD_RATE || 25000;
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    document.getElementById("filter-date").value = `${yyyy}-${mm}-${dd}`;
    document.getElementById("filter-month").value = `${yyyy}-${mm}`;

    const yearSelect = document.getElementById("filter-year");
    yearSelect.innerHTML = "";
    for (let y = yyyy; y >= yyyy - 5; y--) yearSelect.innerHTML += `<option value="${y}">${y}</option>`;

    loadSettingsToUI();
    renderCategories();
    renderServices();
    renderCart();
    renderPendingList();
    updateReportUI();
    updateExpenseUI();
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
    if (tabId === 'report-tab') updateReportUI();
    if (tabId === 'expense-tab') updateExpenseUI();
}

function renderCategories() {
    const categories = ["Tất cả", ...new Set(menuData.map(item => item.category))];
    document.getElementById("categories-container").innerHTML = categories.map(cat => 
        `<button class="cat-btn ${cat === currentCategory ? 'active' : ''}" onclick="filterCategory('${cat}')">${cat}</button>`
    ).join('');
}

function filterCategory(cat) {
    currentCategory = cat;
    renderCategories();
    renderServices();
}

function renderServices() {
    const filtered = currentCategory === "Tất cả" ? menuData : menuData.filter(item => item.category === currentCategory);
    document.getElementById("services-container").innerHTML = filtered.map((item, index) => `
        <div class="service-card" onclick="addToCartByIndex(${index})">
            <div class="service-name">${item.name}</div>
            <div style="font-size:10px; color:#718096;">⏱️ ${item.duration} phút</div>
            <div class="service-price">
                <span>${item.vnd.toLocaleString()} đ</span>
                <span style="color:#2b6cb0;">$${item.usd}</span>
            </div>
        </div>
    `).join('');
}

function addToCartByIndex(index) {
    const filtered = currentCategory === "Tất cả" ? menuData : menuData.filter(item => item.category === currentCategory);
    const item = filtered[index];
    cart.push({
        id: Date.now() + Math.random(),
        name: item.name,
        duration: item.duration,
        vnd: item.vnd,
        ktvType: "Nội bộ",
        ktvName: "",
        ktvExtFee: 0
    });
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
}

function updateCartItem(id, field, val) {
    const item = cart.find(i => i.id === id);
    if (item) item[field] = (field === 'vnd' || field === 'ktvExtFee') ? Number(val) : val;
    renderCart();
}

function setPaymentMethod(m) {
    selectedPayment = m;
    document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
    if(m==='Tiền mặt') document.getElementById('pay-cash').classList.add('active');
    if(m==='QR Code') document.getElementById('pay-qr').classList.add('active');
    if(m==='Chuyển khoản') document.getElementById('pay-bank').classList.add('active');
    if(m==='Cà thẻ') document.getElementById('pay-card').classList.add('active');
}

function renderCart() {
    const container = document.getElementById("cart-items-container");
    if (cart.length === 0) {
        container.innerHTML = '<p style="color: #a0aec0; text-align: center; margin-top: 20px;">Chưa chọn dịch vụ nào</p>';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-row">
                    <b>${item.name}</b>
                    <button class="btn-danger" onclick="removeFromCart(${item.id})">×</button>
                </div>
                <div class="cart-item-row">
                    <span>Giá: <input type="number" class="input-inline" style="width:70px" value="${item.vnd}" onchange="updateCartItem(${item.id}, 'vnd', this.value)"> đ</span>
                    <select class="input-inline" onchange="updateCartItem(${item.id}, 'ktvType', this.value)">
                        <option value="Nội bộ" ${item.ktvType==='Nội bộ'?'selected':''}>KTV Trong</option>
                        <option value="KTV Ngoài" ${item.ktvType==='KTV Ngoài'?'selected':''}>KTV Ngoài</option>
                    </select>
                </div>
                <div class="cart-item-row" style="margin-top:3px;">
                    <input type="text" placeholder="Tên KTV" class="input-inline" style="width:50%" value="${item.ktvName}" onchange="updateCartItem(${item.id}, 'ktvName', this.value)">
                    ${item.ktvType === 'KTV Ngoài' ? `<input type="number" placeholder="Vé KTV ngoài" class="input-inline" style="width:45%" value="${item.ktvExtFee}" onchange="updateCartItem(${item.id}, 'ktvExtFee', this.value)">` : ''}
                </div>
            </div>
        `).join('');
    }

    const subTotal = cart.reduce((sum, i) => sum + i.vnd, 0);
    const discount = Number(document.getElementById("cart-discount").value) || 0;
    const totalVnd = Math.max(0, subTotal - discount);
    const rate = Number(document.getElementById("usd-rate").value) || 25000;

    document.getElementById("sub-total").innerText = subTotal.toLocaleString() + ' đ';
    document.getElementById("discount-val").innerText = discount.toLocaleString() + ' đ';
    document.getElementById("total-vnd").innerText = totalVnd.toLocaleString() + ' đ';
    document.getElementById("total-usd").innerText = '$' + (totalVnd / rate).toFixed(1);
}

function saveTransaction(status) {
    if (cart.length === 0) return alert("Vui lòng chọn ít nhất 1 dịch vụ!");

    const subTotal = cart.reduce((sum, i) => sum + i.vnd, 0);
    const discount = Number(document.getElementById("cart-discount").value) || 0;
    const totalVnd = Math.max(0, subTotal - discount);
    const totalKtvExtFee = cart.reduce((sum, i) => sum + (i.ktvType === 'KTV Ngoài' ? Number(i.ktvExtFee || 0) : 0), 0);
    const rate = Number(document.getElementById("usd-rate").value) || 25000;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const hdvName = document.getElementById("cust-hdv").value.trim();

    // Nếu đang chỉnh sửa đơn hàng chờ cũ
    if (editingTxId) {
        const index = transactions.findIndex(t => t.id === editingTxId);
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                status: status,
                customer: document.getElementById("cust-name").value || "Khách lẻ",
                nation: document.getElementById("cust-nation").value || "Việt Nam",
                hdv: hdvName,
                hdvCommission: hdvName ? (totalVnd * 0.3) : 0,
                room: document.getElementById("cust-room").value,
                items: [...cart],
                discount: discount,
                totalKtvExtFee: totalKtvExtFee,
                paymentMethod: selectedPayment,
                totalVnd: totalVnd,
                totalUsd: (totalVnd / rate).toFixed(1),
                note: document.getElementById("cart-note").value
            };
            if (status === 'Hoàn thành') printThermalBill(transactions[index], subTotal);
        }
        editingTxId = null;
        document.getElementById("btn-save-hold").innerText = "⏳ LƯU HÀNG CHỜ";
    } else {
        // Tạo hóa đơn mới
        const tx = {
            id: 'HD' + Date.now().toString().slice(-6),
            status: status,
            isoDate: `${yyyy}-${mm}-${dd}`,
            createdTime: `${dd}/${mm}/${yyyy} ${now.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}`,
            customer: document.getElementById("cust-name").value || "Khách lẻ",
            nation: document.getElementById("cust-nation").value || "Việt Nam",
            hdv: hdvName,
            hdvCommission: hdvName ? (totalVnd * 0.3) : 0,
            room: document.getElementById("cust-room").value,
            items: [...cart],
            discount: discount,
            totalKtvExtFee: totalKtvExtFee,
            paymentMethod: selectedPayment,
            totalVnd: totalVnd,
            totalUsd: (totalVnd / rate).toFixed(1),
            note: document.getElementById("cart-note").value
        };

        transactions.unshift(tx);
        if (status === 'Hoàn thành') printThermalBill(tx, subTotal);
    }

    localStorage.setItem('spa_transactions_v3', JSON.stringify(transactions));

    if (status === 'Chờ thanh toán') alert("Đã lưu/cập nhật đơn vào HÀNG CHỜ!");

    // Reset Form
    cart = [];
    document.getElementById("cust-name").value = "";
    document.getElementById("cust-nation").value = "";
    document.getElementById("cust-hdv").value = "";
    document.getElementById("cart-discount").value = 0;
    document.getElementById("cart-note").value = "";
    renderCart();
    renderPendingList();
    updateReportUI();
}

// HIỂN THỊ DANH SÁCH ĐƠN HÀNG CHỜ NGAY TRÊN BÁN HÀNG
function renderPendingList() {
    const container = document.getElementById("pending-list-container");
    const pendingList = transactions.filter(t => t.status === 'Chờ thanh toán');

    if (pendingList.length === 0) {
        container.innerHTML = '<p style="color: #a0aec0; text-align: center; font-size: 11px;">Không có đơn hàng chờ</p>';
        return;
    }

    container.innerHTML = pendingList.map(t => `
        <div class="pending-card">
            <div class="pending-head">
                <span>${t.id} - ${t.customer} (${t.room})</span>
                <span>${t.createdTime.split(' ')[1]}</span>
            </div>
            <div style="font-size:10px; color:#4a5568; margin-bottom:4px;">
                ${t.items.map(i => i.name).join(', ')}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <b style="color:#e53e3e;">${t.totalVnd.toLocaleString()} đ</b>
                <div class="pending-actions">
                    <button class="btn-edit" onclick="loadPendingToCart('${t.id}')">✏️ Sửa / Nạp lại</button>
                    <button class="btn-success" onclick="markAsPaid('${t.id}')">💳 Thanh toán</button>
                </div>
            </div>
        </div>
    `).join('');
}

// NẠP ĐƠN CHỜ VÀO GIỎ HÀNG ĐỂ CHỈNH SỬA
function loadPendingToCart(txId) {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    cart = [...tx.items];
    document.getElementById("cust-name").value = tx.customer;
    document.getElementById("cust-nation").value = tx.nation;
    document.getElementById("cust-hdv").value = tx.hdv || "";
    document.getElementById("cust-room").value = tx.room;
    document.getElementById("cart-discount").value = tx.discount || 0;
    document.getElementById("cart-note").value = tx.note || "";
    setPaymentMethod(tx.paymentMethod || "Tiền mặt");

    editingTxId = tx.id;
    document.getElementById("btn-save-hold").innerText = "🔄 CẬP NHẬT ĐƠN CHỜ";

    renderCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function markAsPaid(txId) {
    const tx = transactions.find(t => t.id === txId);
    if (tx) {
        tx.status = 'Hoàn thành';
        localStorage.setItem('spa_transactions_v3', JSON.stringify(transactions));
        renderPendingList();
        updateReportUI();
        alert(`Đã hoàn tất thanh toán cho hóa đơn ${txId}!`);
    }
}

function printThermalBill(tx, subTotal) {
    const printArea = document.getElementById("print-area");
    printArea.innerHTML = `
        <div style="text-align: center;">
            <h2>🪷 ${SPA_CONFIG.NAME}</h2>
            <p style="font-size:9px;">${SPA_CONFIG.ADDRESS}</p>
            <p style="font-size:9px;">Hotline: ${SPA_CONFIG.PHONE}</p>
            <p>--------------------------------</p>
            <b>HÓA ĐƠN THANH TOÁN</b><br>
            <small>Mã HD: ${tx.id} - ${tx.createdTime}</small>
        </div>
        <br>
        <div>
             Khách: ${tx.customer} (${tx.nation})<br>
             Phòng: ${tx.room}<br>
             ${tx.hdv ? ' HDV: ' + tx.hdv + '<br>' : ''}
        </div>
        <p>--------------------------------</p>
        ${tx.items.map(i => `
            <div><b>${i.name}</b> (${i.duration}p)</div>
            <div style="display:flex; justify-content:space-between; font-size:9px;">
                <span>KTV: ${i.ktvName || 'N/A'} (${i.ktvType})</span>
                <span>${i.vnd.toLocaleString()} đ</span>
            </div>
        `).join('')}
        <p>--------------------------------</p>
        <div style="display:flex; justify-content:space-between;"><span>Giảm giá:</span><span>-${tx.discount.toLocaleString()} đ</span></div>
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:12px;"><span>Thành tiền:</span><span>${tx.totalVnd.toLocaleString()} đ</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Hình thức TT:</span><span><b>${tx.paymentMethod}</b></span></div>
        ${tx.note ? `<p style="font-size:9px;">Ghi chú: ${tx.note}</p>` : ''}
        <br>
        <p style="text-align:center; font-size:9px;">Cảm ơn & Hẹn gặp lại Quý khách!</p>
    `;
    printArea.style.display = "block";
    window.print();
    printArea.style.display = "none";
}

// BÁO CÁO & BỘ LỌC
function toggleFilterInputs() {
    const m = document.getElementById("report-mode").value;
    document.getElementById("group-filter-date").style.display = m === 'day' ? 'block' : 'none';
    document.getElementById("group-filter-month").style.display = m === 'month' ? 'block' : 'none';
    document.getElementById("group-filter-year").style.display = m === 'year' ? 'block' : 'none';
    updateReportUI();
}

function updateReportUI() {
    const mode = document.getElementById("report-mode").value;
    const statusFilter = document.getElementById("filter-status").value;
    const filterDate = document.getElementById("filter-date").value;
    const filterMonth = document.getElementById("filter-month").value;
    const filterYear = document.getElementById("filter-year").value;

    filteredCache = transactions.filter(t => {
        let matchTime = true;
        if (mode === 'day') matchTime = t.isoDate === filterDate;
        if (mode === 'month') matchTime = t.isoDate.startsWith(filterMonth);
        if (mode === 'year') matchTime = t.isoDate.startsWith(filterYear);

        let matchStatus = true;
        if (statusFilter !== 'all') matchStatus = t.status === statusFilter;

        return matchTime && matchStatus;
    });

    let totalRev = 0, totalDisc = 0, totalHdvComm = 0, totalKtvFee = 0;
    let payCash = 0, payQr = 0, payBank = 0, payCard = 0;
    let serviceStats = {}, roomStats = {};

    filteredCache.forEach(t => {
        if (t.status === 'Hoàn thành') {
            totalRev += t.totalVnd;
            totalDisc += (t.discount || 0);
            totalHdvComm += (t.hdvCommission || 0);
            totalKtvFee += (t.totalKtvExtFee || 0);

            if (t.paymentMethod === 'Tiền mặt') payCash += t.totalVnd;
            if (t.paymentMethod === 'QR Code') payQr += t.totalVnd;
            if (t.paymentMethod === 'Chuyển khoản') payBank += t.totalVnd;
            if (t.paymentMethod === 'Cà thẻ') payCard += t.totalVnd;
        }

        roomStats[t.room] = (roomStats[t.room] || 0) + 1;
        t.items.forEach(i => { serviceStats[i.name] = (serviceStats[i.name] || 0) + 1; });
    });

    const filteredExpenses = expenses.filter(e => {
        if (mode === 'day') return e.isoDate === filterDate;
        if (mode === 'month') return e.isoDate.startsWith(filterMonth);
        if (mode === 'year') return e.isoDate.startsWith(filterYear);
        return true;
    });
    const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalRev - totalHdvComm - totalKtvFee - totalExpense;

    document.getElementById("rep-1-revenue").innerText = totalRev.toLocaleString() + " đ";
    document.getElementById("rep-3-discount").innerText = totalDisc.toLocaleString() + " đ";
    document.getElementById("rep-4-hdv").innerText = totalHdvComm.toLocaleString() + " đ";
    document.getElementById("rep-5-ktv").innerText = totalKtvFee.toLocaleString() + " đ";
    document.getElementById("rep-6-expense").innerText = totalExpense.toLocaleString() + " đ";
    document.getElementById("rep-7-profit").innerText = netProfit.toLocaleString() + " đ";

    document.getElementById("rep-2-payment-details").innerHTML = `
        💵 Tiền mặt: <b>${payCash.toLocaleString()} đ</b> | 📱 QR: <b>${payQr.toLocaleString()} đ</b><br>
        🏦 Chuyển khoản: <b>${payBank.toLocaleString()} đ</b> | 💳 Cà thẻ: <b>${payCard.toLocaleString()} đ</b>
    `;

    const topService = Object.keys(serviceStats).sort((a,b) => serviceStats[b] - serviceStats[a])[0] || 'N/A';
    const topRoom = Object.keys(roomStats).sort((a,b) => roomStats[b] - roomStats[a])[0] || 'N/A';
    document.getElementById("rep-8-stats-details").innerHTML = `
        🔥 Dịch vụ bán chạy: <b>${topService}</b><br>
        🏠 Phòng dùng nhiều: <b>${topRoom}</b>
    `;

    const tbody = document.getElementById("history-table-body");
    tbody.innerHTML = filteredCache.map((t) => {
        const isPending = t.status === 'Chờ thanh toán';
        const originalIndex = transactions.findIndex(orig => orig.id === t.id);
        return `
            <tr>
                <td><b>${t.id}</b></td>
                <td>${t.createdTime}</td>
                <td><span class="badge ${isPending ? 'badge-pending' : 'badge-completed'}">${t.status}</span></td>
                <td>${t.customer} (${t.nation})</td>
                <td>${t.hdv || '-'}</td>
                <td>${t.room}</td>
                <td>${t.items.map(i => `${i.name} (${i.ktvName || 'N/A'})`).join('<br>')}</td>
                <td style="color:#805ad5;">${t.totalKtvExtFee ? t.totalKtvExtFee.toLocaleString() + ' đ' : '-'}</td>
                <td style="color:#e53e3e;">${t.discount ? t.discount.toLocaleString() + ' đ' : '-'}</td>
                <td><b>${t.totalVnd.toLocaleString()} đ</b></td>
                <td>
                    ${isPending ? `<button class="btn-success" onclick="markAsPaid('${t.id}')">Thanh toán</button>` : ''}
                    <button class="btn-danger" onclick="deleteTx(${originalIndex})">Xóa</button>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteTx(index) {
    if(confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) {
        transactions.splice(index, 1);
        localStorage.setItem('spa_transactions_v3', JSON.stringify(transactions));
        renderPendingList();
        updateReportUI();
    }
}

function addExpense() {
    const category = document.getElementById("exp-category").value;
    const name = document.getElementById("exp-name").value;
    const amount = Number(document.getElementById("exp-amount").value) || 0;

    if (!name || amount <= 0) return alert("Vui lòng nhập thông tin hợp lệ!");

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    expenses.unshift({
        isoDate: `${yyyy}-${mm}-${dd}`,
        time: `${dd}/${mm}/${yyyy} ${now.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}`,
        category, name, amount
    });

    localStorage.setItem('spa_expenses_v3', JSON.stringify(expenses));
    document.getElementById("exp-name").value = "";
    document.getElementById("exp-amount").value = "";
    updateExpenseUI();
}

function updateExpenseUI() {
    const tbody = document.getElementById("expense-table-body");
    tbody.innerHTML = expenses.map(e => `
        <tr>
            <td>${e.time}</td>
            <td><b>${e.category}</b></td>
            <td>${e.name}</td>
            <td style="color:#e53e3e; font-weight:bold;">${e.amount.toLocaleString()} đ</td>
        </tr>
    `).join('');
}

function clearAllExpenses() {
    if(confirm("Xóa toàn bộ sổ chi phí kho?")) {
        expenses = [];
        localStorage.removeItem('spa_expenses_v3');
        updateExpenseUI();
    }
}

function loadSettingsToUI() {
    document.getElementById("cfg-spa-name").value = SPA_CONFIG.NAME;
    document.getElementById("cfg-spa-address").value = SPA_CONFIG.ADDRESS;
    document.getElementById("cfg-spa-phone").value = SPA_CONFIG.PHONE;
    document.getElementById("cfg-default-usd").value = SPA_CONFIG.USD_RATE;
    document.getElementById("cfg-bank-id").value = SPA_CONFIG.BANK_ID || "MB";
    document.getElementById("cfg-bank-no").value = SPA_CONFIG.BANK_NO || "0856112789";
    document.getElementById("cfg-bank-name").value = SPA_CONFIG.BANK_NAME || "LOTUS HARMONY SPA";
}

function saveSettings() {
    SPA_CONFIG.NAME = document.getElementById("cfg-spa-name").value;
    SPA_CONFIG.ADDRESS = document.getElementById("cfg-spa-address").value;
    SPA_CONFIG.PHONE = document.getElementById("cfg-spa-phone").value;
    SPA_CONFIG.USD_RATE = Number(document.getElementById("cfg-default-usd").value) || 25000;
    SPA_CONFIG.BANK_ID = document.getElementById("cfg-bank-id").value;
    SPA_CONFIG.BANK_NO = document.getElementById("cfg-bank-no").value;
    SPA_CONFIG.BANK_NAME = document.getElementById("cfg-bank-name").value;

    localStorage.setItem('spa_config_v3', JSON.stringify(SPA_CONFIG));
    document.getElementById("web-title").innerText = "🪷 " + SPA_CONFIG.NAME;
    document.getElementById("usd-rate").value = SPA_CONFIG.USD_RATE;
    alert("Đã lưu thành công cài đặt hệ thống!");
}

function clearAllTransactions() {
    if(confirm("⚠️ XÓA TOÀN BỘ LỊCH SỬ GIAO DỊCH VÀ CHI PHÍ KHO?")) {
        transactions = [];
        expenses = [];
        localStorage.removeItem('spa_transactions_v3');
        localStorage.removeItem('spa_expenses_v3');
        renderPendingList();
        updateReportUI();
        updateExpenseUI();
        alert("Đã làm sạch dữ liệu thành công!");
    }
}

function exportReportExcel() {
    if (filteredCache.length === 0) return alert("Không có dữ liệu để xuất Excel!");
    let csv = "\uFEFFMã HD,Trạng Thái,Thời Gian,Khách Hàng,Quốc Tịch,HDV,Phòng,Dịch Vụ,Vé KTV Ngoài,Giảm Giá,Hình Thức TT,Thành Tiền VND\n";
    filteredCache.forEach(t => {
        const svcs = t.items.map(i => i.name).join(' | ');
        csv += `"${t.id}","${t.status}","${t.createdTime}","${t.customer}","${t.nation}","${t.hdv}","${t.room}","${svcs}","${t.totalKtvExtFee}","${t.discount}","${t.paymentMethod}","${t.totalVnd}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Bao_Cao_Spa_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Chạy khởi tạo ngay khi tải trang
init();
