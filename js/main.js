// js/main.js
import { loginUser, registerUser } from "./auth.js";
import { startGame } from "./lake.js";
import { loadLeaderboard } from "./leaderboard.js";

document.addEventListener("DOMContentLoaded", () => {
	// Attach event listener for Login
	document.getElementById("loginBtn").addEventListener("click", async () => {
		const loggedIn = await loginUser();
		if (loggedIn) {
			// Hide the login and register forms
			document.getElementById("login").style.display = "none";
			document.getElementById("register").style.display = "none";
			// Start the game and load the leaderboard
			startGame();
			loadLeaderboard();
		}
	});

	// Attach event listener for Register
	document.getElementById("registerBtn").addEventListener("click", async () => {
		await registerUser();
	});
});
