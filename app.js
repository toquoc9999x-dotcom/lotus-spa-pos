// Dữ liệu danh mục mẫu
const services = [
    { id: 1, name: "Massage Body 60p", price: 300000 },
    { id: 2, name: "Massage Chân 45p", price: 200000 },
    { id: 3, name: "Tắm Lá Thuốc Dao Đỏ", price: 250000 },
    { id: 4, name: "Gội Đầu Dưỡng Sinh", price: 150000 }
];

let cart = [];
let pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
let currentEditingId = null; // Kiểm tra xem có đang sửa đơn chờ không

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    renderCart();
    renderPendingOrders();
});

function renderServices() {
    const container = document.getElementById('service-list');
    container.innerHTML = services.map(s => `
        <div class="service-card" onclick="addToCart(${s.id})">
            <h4>${s.name}</h4>
            <p>${s.price.toLocaleString()} đ</p>
        </div>
    `).join('');
}

function addToCart(serviceId) {
    const item = services.find(s => s.id === serviceId);
    cart.push({...item, cartId: Date.now()});
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if(cart.length === 0) {
        container.innerHTML = '<p style="color:#777;">Chưa chọn dịch vụ nào</p>';
    } else {
        container.innerHTML = cart.map((item, index) => `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>${item.name}</span>
                <span>${item.price.toLocaleString()}đ 
                    <b style="color:red; cursor:pointer;" onclick="removeFromCart(${index})"> [Xóa]</b>
                </span>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-amount').innerText = total.toLocaleString() + ' VNĐ';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

// LƯU VÀO HÀNG CHỜ
function savePendingOrder() {
    if (cart.length === 0) return alert('Vui lòng chọn dịch vụ trước!');

    const name = document.getElementById('cust-name').value || 'Khách vãng lai';
    const guide = document.getElementById('cust-guide').value || '';
    
    if (currentEditingId) {
        // Cập nhật đơn hàng chờ cũ
        const index = pendingOrders.findIndex(o => o.id === currentEditingId);
        if (index !== -1) {
            pendingOrders[index] = { id: currentEditingId, name, guide, items: [...cart], time: new Date().toLocaleTimeString() };
        }
        currentEditingId = null;
    } else {
        // Tạo đơn hàng chờ mới
        const newOrder = {
            id: 'HC-' + Date.now().toString().slice(-4),
            name,
            guide,
            items: [...cart],
            time: new Date().toLocaleTimeString()
        };
        pendingOrders.push(newOrder);
    }

    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
    clearCart();
    renderPendingOrders();
    alert('Đã lưu vào Hàng Chờ!');
}

function renderPendingOrders() {
    const container = document.getElementById('pending-list');
    if(pendingOrders.length === 0) {
        container.innerHTML = '<p style="color:#777;">Không có đơn hàng chờ.</p>';
        return;
    }

    container.innerHTML = pendingOrders.map(order => {
        const total = order.items.reduce((sum, i) => sum + i.price, 0);
        return `
            <div class="pending-card">
                <div class="pending-header">
                    <span>${order.id} - ${order.name}</span>
                    <span>${order.time}</span>
                </div>
                <div style="font-size:13px; margin: 5px 0;">
                    ${order.items.map(i => i.name).join(', ')} <br>
                    <strong>Tổng: ${total.toLocaleString()} đ</strong>
                </div>
                <div class="pending-actions">
                    <button class="btn btn-warning" onclick="editPendingOrder('${order.id}')">✏️ Sửa / Nạp Đơn</button>
                    <button class="btn btn-danger" onclick="deletePendingOrder('${order.id}')">🗑️ Xóa</button>
                </div>
            </div>
        `;
    }).join('');
}

// NẠP LẠI ĐƠN CHỜ ĐỂ SỬA
function editPendingOrder(id) {
    const order = pendingOrders.find(o => o.id === id);
    if (!order) return;

    cart = [...order.items];
    document.getElementById('cust-name').value = order.name;
    document.getElementById('cust-guide').value = order.guide;
    currentEditingId = order.id;

    renderCart();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên giỏ hàng
}

function deletePendingOrder(id) {
    if (confirm('Bạn chắc chắn muốn xóa đơn hàng chờ này?')) {
        pendingOrders = pendingOrders.filter(o => o.id !== id);
        localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
        renderPendingOrders();
    }
}

function clearCart() {
    cart = [];
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-guide').value = '';
    renderCart();
}
