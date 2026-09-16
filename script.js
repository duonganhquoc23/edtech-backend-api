let userData = {};
let currentLoginAvatar = '👦'; // Mặc định ở màn hình đăng nhập

function initData() {
    let data = localStorage.getItem('edtech_user_kid');
    
    // Nếu chưa đăng nhập -> Hiển thị Popup Đăng nhập
    if (!data) {
        document.getElementById('login-screen').style.display = 'flex';
        return; 
    } 
    
    // Nếu đã đăng nhập -> Ẩn Popup và nạp dữ liệu
    document.getElementById('login-screen').style.display = 'none';
    userData = JSON.parse(data);
    
    // Đảm bảo dữ liệu cũ không bị thiếu trường (để tránh lỗi CSDL)
    if(!userData.id) userData.id = Date.now().toString();
    if(!userData.level) userData.level = 1;
    if(!userData.xp) userData.xp = 0;
    
    updateHeaderInfo();
    renderProfile();
    loadSelectedAvatar();
    
    // Tự động đồng bộ lên CSDL Admin
    syncToAdmin(userData);
    
    if (window.location.hash) {
        let targetId = window.location.hash.substring(1);
        if (targetId === 'games') targetId = 'home';
        if (document.getElementById(targetId)) navigate(targetId);
    }
}

window.onload = initData;

// ================= PHẦN ĐĂNG NHẬP =================
function selectLoginAvatar(avatar, btnElement) {
    currentLoginAvatar = avatar;
    const btns = document.querySelectorAll('#login-screen .avatar-btn');
    btns.forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');
}

function startGame() {
    const nameInput = document.getElementById('login-name').value.trim();
    const classInput = document.getElementById('login-class').value.trim();

    if (nameInput === '' || classInput === '') {
        alert('Ôi! Con quên nhập Tên hoặc Lớp rồi kìa!');
        return;
    }

    // Chuẩn hóa đúng tên biến để gửi lên CSDL
    userData = {
        id: Date.now().toString(),
        name: nameInput,
        class_name: classInput,
        avatar: currentLoginAvatar,
        level: 1,
        xp: 0
    };
    
    // Lưu vào máy tính và ẩn Popup
    localStorage.setItem('edtech_user_kid', JSON.stringify(userData));
    document.getElementById('login-screen').style.display = 'none';
    
    // Cập nhật giao diện
    updateHeaderInfo();
    renderProfile();
    loadSelectedAvatar();
    
    // Bắn dữ liệu ngay lập tức lên CSDL Admin
    syncToAdmin(userData);
}

// ================= ĐỒNG BỘ LÊN ADMIN =================
async function syncToAdmin(userObj) {
    try {
        localStorage.setItem('edtech_user_kid', JSON.stringify(userObj));
        
        await fetch('https://edtech-backend-api-nv0x.onrender.com/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userObj)
        });
    } catch (error) {
        console.error('Không thể kết nối đến máy chủ API:', error);
    }
}

// ================= CÁC HÀM XỬ LÝ KHÁC =================
function selectAvatar(avatarEmoji, btnElement) {
    userData.avatar = avatarEmoji;
    localStorage.setItem('edtech_user_kid', JSON.stringify(userData));
    syncToAdmin(userData); 

    const btns = document.querySelectorAll('#avatar-list .avatar-btn');
    btns.forEach(btn => btn.classList.remove('selected'));
    if(btnElement) btnElement.classList.add('selected');
    
    updateHeaderInfo();
    renderProfile();
}

function loadSelectedAvatar() {
    const currentAvatar = userData.avatar || '👦';
    const btns = document.querySelectorAll('#avatar-list .avatar-btn');
    btns.forEach(btn => {
        if(btn.innerText === currentAvatar) btn.classList.add('selected');
    });
}

function updateHeaderInfo() {
    document.getElementById('header-name').innerText = userData.name || "Khách";
    document.getElementById('header-avatar').innerText = userData.avatar || "👦";
}

function navigate(sectionId) {
    if (sectionId === 'games') sectionId = 'home';
    
    document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('#nav-menu a').forEach(a => a.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId); 
    if (targetSection) targetSection.classList.add('active');
    
    const navLink = document.querySelector(`#nav-menu a[data-target="${sectionId}"]`); 
    if (navLink) navLink.classList.add('active');
    
    if (sectionId === 'profile') renderProfile();
}

function renderProfile() {
    document.getElementById('prof-name').innerText = userData.name || "Phi Hành Gia Nhí";
    document.getElementById('prof-class').innerText = userData.class_name || "Lớp 4";
    document.getElementById('prof-level').innerText = userData.level || 1;
    document.getElementById('prof-xp').innerText = userData.xp || 0;
    document.getElementById('prof-avatar').innerText = userData.avatar || "👦";
    document.getElementById('prof-xp-bar').style.width = (((userData.xp || 0) % 500) / 500 * 100) + "%";
}

function resetData() {
    localStorage.removeItem('edtech_user_kid');
    window.location.reload(); // Đã sửa: Xóa xong tải lại trang để hiện form đăng nhập
}