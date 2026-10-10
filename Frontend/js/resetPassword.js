document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const formWrap = document.getElementById('formWrap');
    const successMsg = document.getElementById('successMsg');

    passwordError.textContent = '';
    confirmPasswordError.textContent = '';

    if (!password) {
        passwordError.textContent = 'Please enter your password';
        return;
    }

    if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        return;
    }

    if (!confirmPassword) {
        confirmPasswordError.textContent = 'Please confirm your password';
        return;
    }

    if (password !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match';
        return;
    }

    const pathParts = window.location.pathname.split('/');
    const requestId = pathParts[pathParts.length - 1];

    try {
        const response = await fetch(`/forgetpassword/resetpassword/${requestId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok) {
            formWrap.style.display = 'none';
            successMsg.style.display = 'block';
        } else {
            passwordError.textContent = data.message || 'Error updating password';
        }
    } catch (error) {
        passwordError.textContent = 'Something went wrong. Please try again.';
        console.error('Error:', error);
    }
});
