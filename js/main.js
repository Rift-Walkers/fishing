import { startGame } from "./lake.js";
import { loginUser, registerUser } from "./auth.js";
import { loadLeaderboard } from "./leaderBoard.js";

document.addEventListener("DOMContentLoaded", () => {
	// Check if the user is already logged in
	if (localStorage.getItem("isLoggedIn") === "true") {
		startGame();
		loadLeaderboard();
	}

	const loginBtn = document.getElementById("loginBtn");
	const registerBtn = document.getElementById("registerBtn");

	if (loginBtn) {
		loginBtn.addEventListener("click", async () => {
			const loggedIn = await loginUser();
			if (loggedIn) {
				localStorage.setItem("isLoggedIn", "true"); // Store login state
				document.getElementById("login").style.display = "none";
				document.getElementById("register").style.display = "none";
				startGame();
				loadLeaderboard();
			}
		});
	}

	if (registerBtn) {
		registerBtn.addEventListener("click", async () => {
			await registerUser();
		});
	}
});
