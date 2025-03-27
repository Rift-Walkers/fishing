async function registerUser(email, password) {
	try {
		const response = await fetch("http://localhost:8000/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username: email, password, email }),
		});
		const data = await response.json();
		if (data.message) {
			console.log("User created successfully");
		} else {
			console.error("Registration failed");
		}
	} catch (error) {
		console.error("Error registering:", error);
	}
}

async function loginUser(email, password) {
	try {
		const response = await fetch("http://localhost:8000/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: `grant_type=password&username=${email}&password=${password}`,
		});
		const data = await response.json();
		if (data.access_token) {
			localStorage.setItem("token", data.access_token);
			// Proceed with logged-in state
		} else {
			console.error("Login failed");
		}
	} catch (error) {
		console.error("Error logging in:", error);
	}
}

export { registerUser, loginUser };
