document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://localhost:5000';

  const loginForm = document.getElementById('login-form');
  const otpForm = document.getElementById('otp-form');
  const alertBox = document.getElementById('alert-box');

  // Alert display
  function showAlert(message, type = 'error') {
    alertBox.innerText = message;
    alertBox.style.color = type === 'success' ? 'green' : 'red';
    alertBox.style.display = 'block';
  }

  // Password toggle
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
      const target = document.getElementById(icon.dataset.target);
      if (target.type === 'password') {
        target.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        target.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  // Login submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value.trim();

      try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
          showAlert('OTP sent to your email.', 'success');
          loginForm.classList.add('hidden');
          otpForm.classList.remove('hidden');
        } else {
          showAlert(data.message || 'Login failed.');
        }
      } catch (err) {
        console.error(err);
        showAlert('Server error.');
      }
    });
  }

  // OTP Submit
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const digits = document.querySelectorAll('.login-otp-digit');
      const otp = Array.from(digits).map(input => input.value).join('');

      try {
        const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp })
        });
        const data = await res.json();

        if (data.success) {
          showAlert('OTP Verified. Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 1500);
        } else {
          showAlert(data.message || 'Invalid OTP.');
        }
      } catch (err) {
        console.error(err);
        showAlert('Server error.');
      }
    });
  }

  // OTP Input Navigation
  const otpInputs = document.querySelectorAll('.otp-digit');
  otpInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      if (input.value.length === 1 && i < otpInputs.length - 1) {
        otpInputs[i + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) {
        otpInputs[i - 1].focus();
      }
    });
  });
});
