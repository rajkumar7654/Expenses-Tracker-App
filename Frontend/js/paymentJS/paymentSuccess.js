async function checkStatus() {

    try {

        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');

        const response = await fetch(`/payment/status/${orderId}`);

        const data = await response.json();

        if (
            data.success &&
            data.order.order_status === "PAID"
        ) {

            document.getElementById("status").innerText = "Payment Successful ";

            // Update localStorage and redirect
            localStorage.setItem('isPremium', 'true');
            setTimeout(() => {
                window.location.href = '/premium-dashboard';
            }, 2000);

        } else {

            document.getElementById("status").innerText = "Payment is not marked as PAID yet.";

        }

    } catch (error) {

        console.error(error);

        document.getElementById("status").innerText = "Unable to check payment status.";

    }

}