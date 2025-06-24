document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('success-message');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        
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
            firstName: document.getElementById('register-firstname')?.value.trim(),
lastName: document.getElementById('register-lastname')?.value.trim(),
username: document.getElementById('register-username')?.value.trim(),
            
            email: document.getElementById('register-email').value.trim(),
            password: document.getElementById('register-password').value,
            confirm_password: document.getElementById('register-confirm-password').value,
            userType: document.querySelector('input[name="userType"]:checked')?.value
        };
        
        // Validate form
        const errors = {};
        
        if (!formData.username || formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }
        
        if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password || formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirm_password) {
            errors.confirm_password = 'Passwords do not match';
        }
        
        if (!formData.userType) {
            errors.userType = 'Please select a user type';
        }
        
        // Show errors if any
        if (Object.keys(errors).length > 0) {
            for (const [field, message] of Object.entries(errors)) {
                const errorEl = document.getElementById(`register-${field}-error`);
                if (errorEl) {
                    errorEl.textContent = message;
                    errorEl.style.display = 'block';
                    const input = errorEl.closest('.input-group').querySelector('.input-field');
                    if (input) input.classList.add('error');
                }
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            return;
        }
        
        try {
            const response = await fetch('php/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            if (data.success) {
                // Show success message
                successMessage.classList.add('show');
                setTimeout(() => {
                    window.location.href = 'login-form.html?registered=true';
                }, 2000);
            } else {
                // Handle server validation errors
                if (data.errors) {
                    for (const [field, message] of Object.entries(data.errors)) {
                        const errorEl = document.getElementById(`register-${field}-error`);
                        if (errorEl) {
                            errorEl.textContent = message;
                            errorEl.style.display = 'block';
                            const input = errorEl.closest('.input-group').querySelector('.input-field');
                            if (input) input.classList.add('error');
                        }
                    }
                } else {
                    alert(data.message || 'Registration failed');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const pupils = document.querySelectorAll('.character-pupil');
    const character = document.querySelector('.character');
    const inputFields = document.querySelectorAll('input, textarea, select');

    // 👀 Make eyes follow the cursor
    document.addEventListener('mousemove', (e) => {
        pupils.forEach(pupil => {
            const rect = pupil.parentElement.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 20;
            const y = (e.clientY - rect.top - rect.height / 2) / 20;

            pupil.style.transform = `translate(${Math.max(-3, Math.min(3, x))}px, ${Math.max(-3, Math.min(3, y))}px)`;
        });
    });

    // 😲 Character reacts when input field is focused
    inputFields.forEach(input => {
        input.addEventListener('focus', () => {
            character.style.transition = 'transform 0.3s ease';
            character.style.transform = 'translateY(-15px)';
        });

        input.addEventListener('blur', () => {
            character.style.transform = 'translateY(0)';
        });
    });
});
