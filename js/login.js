document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const rememberCheckbox = document.getElementById('remember');

    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
        });
    }

    // Form submission handler
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            document.querySelectorAll('.input-field').forEach(el => {
                el.classList.remove('error');
            });

            // Get form data
            const formData = {
                email: emailInput.value.trim(),
                password: passwordInput.value,
                remember: rememberCheckbox.checked,
                userType: document.querySelector('input[name="userType"]:checked')?.value || 'kid'
            };

            // Client-side validation
            const errors = {};

            if (!formData.email) {
                errors.email = 'Please enter your email address';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                errors.email = 'Please enter a valid email address';
            }

            if (!formData.password) {
                errors.password = 'Please enter your password';
            } else if (formData.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }

            // Show client-side errors if any
            if (Object.keys(errors).length > 0) {
                for (const [field, message] of Object.entries(errors)) {
                    const errorEl = document.getElementById(`${field}-error`);
                    if (errorEl) {
                        errorEl.textContent = message;
                        errorEl.style.display = 'block';
                        const input = errorEl.closest('.input-group')?.querySelector('.input-field');
                        if (input) input.classList.add('error');
                    }
                }
                return;
            }

            const loginBtn = document.querySelector('.login-btn');
            const originalText = loginBtn.innerHTML;

            // Show loading state
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            loginBtn.disabled = true;

            try {
                const response = await fetch('php/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                console.log('Login Response:', data); // ✅ Debug log

                if (!response.ok || !data.success) {
                    // Handle server-side validation errors
                    if (data.errors) {
                        for (const [field, message] of Object.entries(data.errors)) {
                            const errorEl = document.getElementById(`${field}-error`);
                            if (errorEl) {
                                errorEl.textContent = message;
                                errorEl.style.display = 'block';
                                const input = errorEl.closest('.input-group')?.querySelector('.input-field');
                                if (input) input.classList.add('error');
                            }
                        }
                    } else {
                        throw new Error(data.message || 'Login failed. Please check your credentials.');
                    }
                    return;
                }

                // Handle successful login
                showAlert(data.message || 'Login successful! Redirecting...', 'success');

                // Store user data in sessionStorage
                if (data.user) {
                    sessionStorage.setItem('authUser', JSON.stringify(data.user));
                }

                const redirectURL = data.redirect || getDefaultRedirect(data.user?.role);
                console.log('Redirecting to:', redirectURL); // ✅ Debug log

                // Handle redirect
                setTimeout(() => {
                    window.location.href = redirectURL;
                }, 1500);

            } catch (error) {
                console.error('Login Error:', error); // ✅ Debug log
                showAlert(error.message || 'Login failed. Please try again.', 'error');

                // Clear password field on error
                passwordInput.value = '';
                passwordInput.focus();
            } finally {
                // Reset button state
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
    }

    // Helper function to determine default redirect
    function getDefaultRedirect(role) {
        switch (role) {
            case 'admin':
                return 'admin/dashboard.html';
            case 'parent':
                return 'parent/dashboard.html';
            default: // kid
                return 'index.html';
        }
    }

    // Enhanced alert function with animation
    function showAlert(message, type = 'info') {
        // Remove existing alerts first
        document.querySelectorAll('.alert').forEach(el => el.remove());

        const alertBox = document.createElement('div');
        alertBox.className = `alert alert-${type} fade-in`;
        alertBox.textContent = message;
        alertBox.setAttribute('role', 'alert');

        // Add close button for important alerts
        if (type === 'error' || type === 'warning') {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'alert-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => {
                alertBox.classList.remove('fade-in');
                alertBox.classList.add('fade-out');
                setTimeout(() => alertBox.remove(), 300);
            });
            alertBox.appendChild(closeBtn);
        }

        // Add to DOM
        document.body.appendChild(alertBox);

        // Auto-remove after 5 seconds (except for errors)
        if (type !== 'error') {
            setTimeout(() => {
                alertBox.classList.remove('fade-in');
                alertBox.classList.add('fade-out');
                setTimeout(() => alertBox.remove(), 300);
            }, 5000);
        }
    }

    // Check for remembered user
    function checkRememberMe() {
        const rememberToken = document.cookie.split('; ')
            .find(row => row.startsWith('remember_token='))
            ?.split('=')[1];

        if (rememberToken && rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }

    // Run remember me check on page load
    checkRememberMe();
});
