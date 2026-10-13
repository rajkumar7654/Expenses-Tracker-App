const API_URL='https://expenses-tracker-app-9mo5.onrender.com';
const payButton = document.getElementById("payButton");
const message = document.getElementById("message");

// Initialize Cashfree
const cashfree = Cashfree({
    mode: "sandbox"
});

// Pay button click
payButton.addEventListener("click", async function () {
    try {
        payButton.disabled = true;
        payButton.innerText = "Creating Order...";

        const token = localStorage.getItem('token');

        // Send request to Express backend with fixed ₹1 amount
        const response = await fetch(`${API_URL}/payment/create-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: "1",
                customerName: "Test User",
                customerEmail: "test@example.com",
                customerPhone: "9999999999"
            })
        });

        const data = await response.json();
        console.log("Backend response:", data);

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to create order");
        }

        console.log("Order ID:", data.orderId);
        console.log("Payment Session ID:", data.paymentSessionId);

        // Open Cashfree checkout
        payButton.innerText = "Opening Checkout...";

        const checkoutResult = await cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: "_self"
        });

        console.log("Checkout result:", checkoutResult);

    } catch (error) {
        console.error(error);
        message.innerText = error.message || "Something went wrong.";
        payButton.disabled = false;
        payButton.innerText = "Pay ₹1 Now";
    }
});