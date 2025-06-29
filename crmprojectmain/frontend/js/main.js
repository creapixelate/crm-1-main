document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://localhost:5000';

  const loginForm = document.getElementById('login-form');
  const otpForm = document.getElementById('otp-form');
  const signupLink = document.getElementById('signup-link');
  const alertBox = document.getElementById('alert-box');

  let csrfToken = '';
  let loginSuccess = false;
  let otpResendTimer = null;

  // ✅ Get CSRF Token
  fetch('/auth/csrf-token')
    .then(res => res.json())
    .then(data => {
      csrfToken = data.csrfToken;
      document.getElementById('csrf-token-login').value = csrfToken;
      document.getElementById('csrf-token-otp').value = csrfToken;
    });

  // ✅ Show Alert
  function showAlert(msg, type = 'error') {
    alertBox.innerText = msg;
    alertBox.style.color = type === 'success' ? 'green' : 'red';
    alertBox.style.display = 'block';
  }

  // ✅ Password Toggle
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
      const input = document.getElementById(icon.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  });

  // ✅ Sign In → Send OTP
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.success) {
        loginSuccess = true;
        showAlert('✅ OTP sent to your email.', 'success');
        loginForm.classList.add('hidden');
        otpForm.classList.remove('hidden');
        startOtpTimer();
      } else {
        showAlert(data.message || '❌ Login failed.');
      }
    } catch (err) {
      console.error(err);
      showAlert('❌ Server error.');
    }
  });

  // ✅ OTP Submit
  otpForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = Array.from(document.querySelectorAll('.login-otp-digit'))
      .map(input => input.value.trim()).join('');

    if (otp.length !== 4) return showAlert('❌ Enter full 4-digit OTP.');

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        body: JSON.stringify({ otp })
      });

      const data = await res.json();
      if (data.success) {
        showAlert('✅ OTP Verified! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1200);
      } else {
        showAlert(data.message || '❌ Invalid OTP.');
      }
    } catch (err) {
      console.error(err);
      showAlert('❌ Server error.');
    }
  });

  // ✅ Sign Up Link click → only after login
  signupLink?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!loginSuccess) {
      showAlert('⚠️ Please sign in first to access Sign Up.');
    } else {
      alert('✅ Sign Up allowed. (You can now show Sign Up form here)');
      // Future: show signup form here
    }
  });

  // ✅ OTP Input auto navigation & paste
  const otpInputs = document.querySelectorAll('.login-otp-digit');
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      if (input.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
      otpInputs.forEach((inp, i) => {
        inp.value = pasteData[i] || '';
      });
      otpInputs[pasteData.length - 1]?.focus();
      e.preventDefault();
    });
  });

  // ✅ OTP Timer (Resend after 4 sec)
  function startOtpTimer() {
    if (otpResendTimer) clearTimeout(otpResendTimer);
    otpResendTimer = setTimeout(() => {
      const resendBtn = document.createElement('button');
      resendBtn.textContent = 'Resend OTP';
      resendBtn.className = 'login-btn';
      resendBtn.style.marginTop = '10px';
      resendBtn.addEventListener('click', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
          }
        });
        const data = await res.json();
        if (data.success) {
          showAlert('✅ New OTP sent.', 'success');
          resendBtn.remove();
          startOtpTimer(); // reset timer
        } else {
          showAlert(data.message || '❌ OTP resend failed.');
        }
      });
      otpForm.appendChild(resendBtn);
    }, 4000);
  }
});
