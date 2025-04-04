// After:
const API_URL = "https://fishing-production-fe4e.up.railway.app";

async function registerUser(email, password) {
	try {
		const response = await fetch(`${API_URL}/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});
		const data = await response.json();
		if (data.message) {
			console.log("User created successfully");
		} else {
			console.error("Registration failed", data);
		}
	} catch (error) {
		console.error("Error registering:", error);
	}
}

async function loginUser(email, password) {
	try {
		const response = await fetch(`${API_URL}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});
		const data = await response.json();
		if (data.access_token) {
			localStorage.setItem("token", data.access_token);
			console.log("Login successful");
			return true;
		} else {
			console.error("Login failed", data);
			return false;
		}
	} catch (error) {
		console.error("Error logging in:", error);
		return false;
	}
}

export { registerUser, loginUser };
