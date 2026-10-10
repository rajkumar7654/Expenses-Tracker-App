const loginForm = document.getElementById('loginForm');
const API = window.location.origin;

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Login successful!');

            // Store token, userName, and isPremium in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.userName);
            localStorage.setItem('isPremium', data.isPremium);
            loginForm.reset();

            // Redirect based on premium status
            if (data.isPremium) {
                window.location.href = '/premium-dashboard';
            } else {
                window.location.href = '/dashboard';
            }
        } else {
            alert('Login failed: ' + data.message);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
