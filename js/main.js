import { startGame } from "./lake.js";
import { loginUser, registerUser } from "./auth.js";
import { loadLeaderboard } from "./leaderBoard.js";
import { supabaseClient } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
	if (localStorage.getItem("isLoggedIn") === "true") {
		setTimeout(startGame, 0);
		setTimeout(initializeChat, 0);
	}

	const loginBtn = document.getElementById("loginBtn");
	const registerBtn = document.getElementById("registerBtn");
	const leaderboard = document.getElementById("leaderboard");

	if (loginBtn) {
		loginBtn.addEventListener("click", async () => {
			const loggedIn = await loginUser();
			if (loggedIn) {
				localStorage.setItem("isLoggedIn", "true");
				localStorage.setItem("loginTime", new Date().toISOString());
				document.getElementById("login").style.display = "none";
				document.getElementById("register").style.display = "none";
				setTimeout(startGame, 0);
				setTimeout(initializeChat, 0);
			}
		});
	}

	if (registerBtn) {
		registerBtn.addEventListener("click", async () => {
			await registerUser();
		});
	}

	leaderboard.style.display = "none";

	document.addEventListener("keydown", (e) => {
		if (e.key === "Tab") {
			e.preventDefault();
			leaderboard.style.display = "block";
			loadLeaderboard();
		}
	});

	document.addEventListener("keyup", (e) => {
		if (e.key === "Tab") {
			leaderboard.style.display = "none";
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

		async function loadMessages() {
			const { data, error } = await supabaseClient
				.from("messages")
				.select("*")
				.order("timestamp", { ascending: false })
				.limit(10);

			if (error) return console.error(error);

			chatBox.innerHTML = "";
			data.forEach((msg) => {
				const div = document.createElement("div");
				const time = new Date(msg.timestamp).toLocaleTimeString();
				div.textContent = `[${time}] ${msg.user_email}: ${msg.message}`;
				chatBox.appendChild(div); // append instead of prepend due to column-reverse
			});
		}

		setInterval(loadMessages, 5000);
		loadMessages();

		async function sendMessage(text) {
			const { data: userData } = await supabaseClient.auth.getUser();
			if (!userData.user) return;

			const { error } = await supabaseClient.from("messages").insert([
				{
					message: text,
					user_email: userData.user.email,
				},
			]);

			if (error) return console.error(error);
			loadMessages();
		}

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
					sendMessage(message);
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
});
