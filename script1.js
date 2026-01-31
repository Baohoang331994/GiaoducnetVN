// ==================================================
// LẤY PHẦN TỬ
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

// URL Apps Script Web App (thay bằng URL thật của bạn)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzAzKxL6U6ID3cnhvBJRg8OK__CCfWCq6Z8xe73PAFPK7u5V186cytlM7n3YNSNN0j9A/exec';

// ==================================================
// HÀM HIỂN THỊ
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
// VALIDATE
// ==================================================
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail() {
    const value = emailInput?.value.trim() || '';
    if (!value) return true; // optional nếu bạn muốn

    if (!emailRegex.test(value)) {
        showMessage(emailError, '❌ Email không đúng định dạng!');
        return false;
    }
    showMessage(emailError, '');
    return true;
}

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
// REALTIME VALIDATE (tùy chọn)
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
// SUBMIT FORM ĐĂNG KÝ
// ==================================================
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();           // Ngăn reload trang
    clearMessages();

    const emailOk    = validateEmail();
    const pwdOk      = validatePassword();

    if (!emailOk || !pwdOk) {
        return; // dừng nếu lỗi
    }

    // Thu thập dữ liệu
    const data = {
        username: usernameInput?.value.trim() || '',
        password: pwdInput.value,                // plaintext (chỉ test, production nên hash)
        email:    emailInput.value.trim()
    };

    // Hiển thị loading (tùy chọn)
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',                    // Bắt buộc vì GAS không hỗ trợ CORS đầy đủ
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'  // Tránh preflight OPTIONS
            },
            body: JSON.stringify(data)
        });

        // no-cors → không đọc response được, nhưng nếu không throw error → coi như OK
        showMessage(successMsg, '🎉 Đăng ký thành công! Dữ liệu đã được lưu.');
        this.reset();                   // Xóa form
        setTimeout(showLogin, 1500);    // Chuyển về login sau 1.5s

    } catch (err) {
        console.error('Lỗi gửi dữ liệu:', err);
        showMessage(pwdError, '❌ Có lỗi khi gửi dữ liệu. Vui lòng thử lại!');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// ==================================================
// CHUYỂN FORM (giữ nguyên)
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