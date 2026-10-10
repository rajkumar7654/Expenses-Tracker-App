document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');
    const formWrap = document.getElementById('formWrap');
    const successMsg = document.getElementById('successMsg');

    emailError.textContent = '';

    if (!email) {
        emailError.textContent = 'Please enter your email';
        return;
    }

    try {
        const response = await fetch('/forgetpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            formWrap.style.display = 'none';
            successMsg.style.display = 'block';
        } else {
            emailError.textContent = data.message || 'Error sending reset link';
        }
    } catch (error) {
        emailError.textContent = 'Something went wrong. Please try again.';
        console.error('Error:', error);
    }
});
