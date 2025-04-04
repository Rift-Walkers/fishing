import { startGame } from "./lake.js";
import { loginUser, registerUser } from "./auth.js";
// import { loadLeaderboard } from "./leaderBoard.js";
import { createFishJournalUI, toggleFishJournal } from "./journal.js";

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM loaded");
	localStorage.setItem("isLoggedIn", "true");

	setTimeout(startGame, 0);
	setTimeout(createFishJournalUI, 0); // ⬅️ Show journal popup
});

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const leaderboard = document.getElementById("leaderboard");

if (loginBtn) {
	loginBtn.addEventListener("click", async () => {
		const email = document.getElementById("loginEmail")?.value;
		const password = document.getElementById("loginPassword")?.value;
		const loggedIn = await loginUser(email, password);
		if (loggedIn) {
			localStorage.setItem("isLoggedIn", "true");
			localStorage.setItem("loginTime", new Date().toISOString());
			document.getElementById("login").style.display = "none";
			document.getElementById("register").style.display = "none";
			setTimeout(startGame, 0);
			setTimeout(initializeChat, 0);
			setTimeout(createFishJournalUI, 0);
		}
	});
}

if (registerBtn) {
	registerBtn.addEventListener("click", async () => {
		const email = document.getElementById("registerEmail")?.value;
		const password = document.getElementById("registerPassword")?.value;
		await registerUser(email, password);
	});
}

if (leaderboard) {
	leaderboard.style.display = "none";

	document.addEventListener("keydown", (e) => {
		if (e.key === "Tab") {
			e.preventDefault();
			leaderboard.style.display = "block";
			// loadLeaderboard(); // Enable if leaderboard is implemented
		}
	});

	document.addEventListener("keyup", (e) => {
		if (e.key === "Tab") {
			leaderboard.style.display = "none";
		}
	});
}

// 🔥 Fish Journal Toggle
document.addEventListener("keydown", (e) => {
	if (e.key.toLowerCase() === "j") {
		toggleFishJournal();
	}
});

function initializeChat() {
	let chatActive = false;

	const chatInput = document.createElement("input");
	chatInput.type = "text";
	chatInput.placeholder = "Type your message...";
	Object.assign(chatInput.style, {
		position: "absolute",
		bottom: "20px",
		left: "20px",
		width: "300px",
		padding: "8px",
		borderRadius: "8px",
		border: "none",
		background: "rgba(0,0,0,0.5)",
		color: "white",
		display: "none",
		zIndex: 1000,
	});
	document.body.appendChild(chatInput);

	const chatBox = document.createElement("div");
	chatBox.id = "chatBox";
	Object.assign(chatBox.style, {
		position: "absolute",
		bottom: "60px",
		left: "20px",
		width: "300px",
		height: "200px",
		display: "flex",
		flexDirection: "column-reverse",
		overflowY: "auto",
		background: "rgba(0,0,0,0.5)",
		color: "white",
		padding: "10px",
		borderRadius: "8px",
		zIndex: 999,
	});
	document.body.appendChild(chatBox);

	// Placeholder chat polling (can uncomment and implement when ready)
	// async function loadMessages() {
	// 	...
	// }
	// async function sendMessage(text) {
	// 	...
	// }

	// setInterval(loadMessages, 5000);
	// loadMessages();

	document.addEventListener("keydown", (e) => {
		if (e.key === "Enter" && !chatActive) {
			e.preventDefault();
			chatActive = true;
			chatInput.style.display = "block";
			chatInput.focus();
		} else if (e.key === "Enter" && chatActive) {
			e.preventDefault();
			const message = chatInput.value.trim();
			if (message.length > 0) {
				// sendMessage(message); // Uncomment when implemented
				chatInput.value = "";
			} else {
				chatActive = false;
				chatInput.style.display = "none";
			}
		} else if (e.key === "Escape" && chatActive) {
			chatActive = false;
			chatInput.value = "";
			chatInput.style.display = "none";
		}
	});
}
