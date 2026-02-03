// ==================================================
// BIẾN TOÀN CỤC & CẤU HÌNH
// ==================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzAzKxL6U6ID3cnhvBJRg8OK__CCfWCq6Z8xe73PAFPK7u5V186cytlM7n3YNSNN0j9A/exec';  // Thay bằng URL /exec thật

// ==================================================
// LẤY PHẦN TỬ DOM
// ==================================================
const emailInput       = document.getElementById('email');
const usernameInput    = document.getElementById('username-reg');
const pwdInput         = document.getElementById('password-reg');
const confirmPwdInput  = document.getElementById('confirm-password');

const emailError   = document.getElementById('email-error');
const pwdError     = document.getElementById('password-error');
const formErrors   = document.getElementById('form-errors');

// Thông báo thành công
const successMsg = document.createElement('p');
successMsg.className = 'success-text';
successMsg.style.display = 'none';
formErrors.appendChild(successMsg);

// ==================================================
// HÀM HIỂN THỊ THÔNG BÁO
// ==================================================
function showMessage(el, message) {
    el.textContent = message;
    el.style.display = message ? 'block' : 'none';
}

function clearMessages() {
    showMessage(emailError, '');
    showMessage(pwdError, '');
    showMessage(successMsg, '');
}

// ==================================================
// VALIDATE EMAIL
// ==================================================
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail() {
    const value = emailInput?.value.trim() || '';
    if (!value) return true;

    if (!emailRegex.test(value)) {
        showMessage(emailError, '❌ Email không đúng định dạng!');
        return false;
    }
    showMessage(emailError, '');
    return true;
}

// ==================================================
// VALIDATE PASSWORD
// ==================================================
function validatePassword() {
    const pwd = pwdInput?.value || '';
    const confirm = confirmPwdInput?.value || '';

    if (pwd.length < 6) {
        showMessage(pwdError, '❌ Mật khẩu phải ít nhất 6 ký tự');
        return false;
    }

    if (pwd !== confirm) {
        showMessage(pwdError, '❌ Mật khẩu và xác nhận không khớp!');
        return false;
    }

    showMessage(pwdError, '');
    return true;
}

// ==================================================
// REALTIME VALIDATION
// ==================================================
emailInput?.addEventListener('input', () => {
    clearMessages();
    validateEmail();
});

pwdInput?.addEventListener('input', () => {
    clearMessages();
    validatePassword();
});

confirmPwdInput?.addEventListener('input', () => {
    clearMessages();
    validatePassword();
});

// ==================================================
// TẢI DANH SÁCH USERNAME TỪ CỘT A BẰNG JSONP (GỌI KHI SUBMIT)
// ==================================================
function loadUsernamesJSONP() {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonpCallback_' + Date.now();
        const params = new URLSearchParams({
            callback: callbackName,
            range: 'A2:A'  // Chỉ tải cột A từ dòng 2
        });

        const url = `${SCRIPT_URL}?${params.toString()}`;

        const script = document.createElement('script');
        script.src = url;
        script.async = true;

        window[callbackName] = function(data) {
            if (data && Array.isArray(data)) {
                const usernames = data
                    .map(v => (v || '').toString().trim().toLowerCase())
                    .filter(v => v);
                console.log(`Đã tải ${usernames.length} tên tài khoản`);
                resolve(usernames);
            } else if (data && data.error) {
                reject(new Error(data.error));
            } else {
                reject(new Error('Dữ liệu từ server không hợp lệ'));
            }

            document.body.removeChild(script);
            delete window[callbackName];
        };

        script.onerror = () => {
            reject(new Error('Lỗi tải danh sách tài khoản từ server'));
            document.body.removeChild(script);
            delete window[callbackName];
        };

        document.body.appendChild(script);
    });
}

// ==================================================
// XỬ LÝ SUBMIT FORM ĐĂNG KÝ + LOADING SPINNER TRONG BUTTON
// ==================================================
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearMessages();

    const emailOk = validateEmail();
    const pwdOk   = validatePassword();

    if (!emailOk || !pwdOk) return;

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;  // Lưu nội dung gốc (text + có thể icon)

    // Thêm spinner và disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="loading-spinner"></span> Đang kiểm tra...
    `;

    try {
        // 1. Tải danh sách username mới nhất
        submitBtn.innerHTML = `<span class="loading-spinner"></span> Đang kiểm tra...`;
        const usernames = await loadUsernamesJSONP();

        // 2. Kiểm tra trùng
        const newUsername = usernameInput.value.trim().toLowerCase();
        if (usernames.includes(newUsername)) {
            showMessage(pwdError, '❌ Tên tài khoản đã tồn tại! Vui lòng chọn tên khác.');
            return;
        }

        // 3. Không trùng → gửi POST
        submitBtn.innerHTML = `<span class="loading-spinner"></span> Đang đăng ký...`;

        const data = {
            username: usernameInput.value.trim(),
            password: pwdInput.value,
            email: emailInput.value.trim()
        };

        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(data)
        });

        // Thành công
        showMessage(successMsg, '🎉 Đăng ký thành công! Tài khoản đã được tạo.');
        this.reset();
        setTimeout(() => {
            document.querySelector('.register-box').style.display = 'none';
            document.querySelector('.login-box').style.display = 'block';
        }, 1500);

    } catch (err) {
        console.error('Lỗi trong quá trình đăng ký:', err);
        showMessage(pwdError, '❌ Có lỗi xảy ra: ' + (err.message || 'Kết nối thất bại. Vui lòng thử lại!'));
    } finally {
        // Khôi phục button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;  // Trở về text gốc "Đăng ký"
    }
});

// ==================================================
// CHUYỂN ĐỔI GIỮA LOGIN & REGISTER
// ==================================================
function showRegister() {
    document.querySelector('.login-box').style.display = 'none';
    document.querySelector('.register-box').style.display = 'block';
    clearMessages();
}

function showLogin() {
    document.querySelector('.register-box').style.display = 'none';
    document.querySelector('.login-box').style.display = 'block';
    clearMessages();
}