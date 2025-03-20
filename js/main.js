import { startGame } from "./lake.js";
import { loginUser, registerUser } from "./auth.js";
import { loadLeaderboard } from "./leaderBoard.js";

document.addEventListener("DOMContentLoaded", () => {
	// Check if the user is already logged in
	if (localStorage.getItem("isLoggedIn") === "true") {
		startGame();
	}

	const loginBtn = document.getElementById("loginBtn");
	const registerBtn = document.getElementById("registerBtn");
	const leaderboard = document.getElementById("leaderboard");

	if (loginBtn) {
		loginBtn.addEventListener("click", async () => {
			const loggedIn = await loginUser();
			if (loggedIn) {
				localStorage.setItem("isLoggedIn", "true"); // Store login state
				document.getElementById("login").style.display = "none";
				document.getElementById("register").style.display = "none";
				startGame();
			}
		});
	}

	if (registerBtn) {
		registerBtn.addEventListener("click", async () => {
			await registerUser();
		});
	}

	// Hide leaderboard initially
	leaderboard.style.display = "none";

	// Event listener for showing/hiding leaderboard when pressing Tab
	document.addEventListener("keydown", (e) => {
		if (e.key === "Tab") {
			e.preventDefault(); // Prevent browser tab switch
			leaderboard.style.display = "block";
			loadLeaderboard(); // Load top 10 players dynamically
		}
	});

	document.addEventListener("keyup", (e) => {
		if (e.key === "Tab") {
			leaderboard.style.display = "none";
		}
	});
});
