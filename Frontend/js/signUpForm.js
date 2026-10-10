
const signUpForm = document.getElementById("signupForm");

const API = window.location.origin;

signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API}/user/signup`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Signup successful");
        
        signUpForm.reset();
    } catch (error) {
        console.log(error);
        alert(error.message);
    }
});

