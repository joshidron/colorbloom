document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
        });
    }

    // Form submission handler
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                email: document.getElementById('email').value.trim(),
                password: passwordInput.value,
                remember: document.getElementById('remember').checked,
                userType: document.querySelector('input[name="userType"]:checked')?.value || 'farmer'
            };
            
            // Basic client-side validation
            if (!formData.email || !formData.password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }

            const loginBtn = document.querySelector('.login-btn');
            const originalText = loginBtn.innerHTML;
            
            // Show loading state
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            loginBtn.disabled = true;
            
            try {
                const response = await fetch('php/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                // Handle non-JSON responses
                const responseText = await response.text();
                let data;
                
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error('Failed to parse response:', responseText);
                    throw new Error('Server returned an invalid response. Please try again.');
                }

                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Login failed. Please check your credentials.');
                }

                // Handle successful login
                showAlert('Login successful! Redirecting...', 'success');
                
                // Store minimal user data in sessionStorage
                if (data.user) {
                    sessionStorage.setItem('authUser', JSON.stringify({
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        role: data.user.role
                    }));
                }

                // Handle redirects based on user role or response redirect
                if (data.redirect) {
                    // Admin redirect from PHP
                    window.location.href = data.redirect;
                } else {
                    // Default redirects based on role
                    switch (data.user?.role) {
                        case 'admin':
                            window.location.href = 'admin/dashboard.php';
                            break;
                        case 'vendor':
                            window.location.href = 'vendor/dashboard.html';
                            break;
                        default:
                            window.location.href = 'index.html';
                    }
                }

            } catch (error) {
                console.error('Login Error:', error);
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

    // Social login placeholder handlers
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showAlert(`${this.textContent.trim()} login will be implemented soon`, 'info');
        });
    });

    // Helper function to show alerts
    function showAlert(message, type = 'info') {
        const alertBox = document.createElement('div');
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = message;
        alertBox.setAttribute('role', 'alert');
        
        // Add to DOM
        const container = document.querySelector('.login-container') || document.body;
        container.prepend(alertBox);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertBox.classList.add('fade-out');
            setTimeout(() => alertBox.remove(), 300);
        }, 5000);
    }

    // Check for remember token and attempt auto-login
    function checkRememberMe() {
        const rememberToken = document.cookie.split('; ')
            .find(row => row.startsWith('remember_token='))
            ?.split('=')[1];
        
        if (rememberToken) {
            // You would need to implement an endpoint to validate the token
            console.log('Remember token found, could implement auto-login here');
        }
    }
    
    // Run remember me check on page load
    checkRememberMe();
});