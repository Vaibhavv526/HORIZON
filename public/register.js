const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('.btn-submit');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    const payload = {
        username,
        email,
        password
    };

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to register');
        }

        // Show success
        registerMessage.textContent = 'Registration successful! Returning to login...';
        registerMessage.className = 'message success';
        
        registerForm.reset();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        console.error('Registration error:', error);
        registerMessage.textContent = error.message;
        registerMessage.className = 'message error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
});
