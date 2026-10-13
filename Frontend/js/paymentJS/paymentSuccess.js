const API_URL='http://localhost:3000';
async function checkStatus() {

    try {

        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        const userEmail = urlParams.get('user_email');

        console.log('Order ID:', orderId);
        console.log('User Email:', userEmail);

        const response = await fetch(`${API_URL}/payment/status/${orderId}?user_email=${encodeURIComponent(userEmail || '')}`);

        console.log('Payment status response:', response.status);

        const data = await response.json();

        if (
            data.success &&
            data.order.order_status === "PAID"
        ) {

            document.getElementById("status").innerText = "Payment Successful ";

            // Update localStorage and redirect
            localStorage.setItem('isPremium', 'true');
            setTimeout(() => {
                window.location.href = '../premium-dashboard.html';
            }, 2000);

        } else {

            document.getElementById("status").innerText = "Payment is not marked as PAID yet.";

        }

    } catch (error) {

        console.error(error);
        document.getElementById("status").innerText = "Unable to check payment status.";

    }

}

// Auto-check status on page load
document.addEventListener('DOMContentLoaded', checkStatus);