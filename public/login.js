const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('.btn-submit');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Authenticating...';

    const payload = {
        email,
        password
    };

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Show success
        loginMessage.textContent = 'Login successful! Redirecting...';
        loginMessage.className = 'message success';
        
        // Basic local storage simulation of authentication
        localStorage.setItem('envUser', JSON.stringify(data));

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        loginMessage.textContent = error.message;
        loginMessage.className = 'message error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
});
