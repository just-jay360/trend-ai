const API_URL =
    location.hostname === "localhost"
        ? "http://localhost:5000/api"
        : "https://mindwell-api-op2f.onrender.com/api";
        
async function testConnection() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log(data);
        alert("Backend Connected!");
    } catch (error) {
        console.error(error);
        alert("Backend NOT connected.");
    }
}

testConnection();

async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const result = await response.json();
        console.log(result);

    } catch (error) {
        console.error(error);
    }
}