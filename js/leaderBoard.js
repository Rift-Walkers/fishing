// export async function updateLeaderboard(user_id, weight) {
// 	const { data, error } = await supabaseClient
// 		.from("leaderboard")
// 		.upsert({ user_id: user_id, highest_catch_weight: weight });
// 	if (error) {
// 		console.error("Leaderboard update error: ", error);
// 	} else {
// 		console.log("Leaderboard updated: ", data);
// 		loadLeaderboard();
// 	}
// }

// export async function loadLeaderboard() {
// 	const { data, error } = await supabaseClient
// 		.from("leaderboard")
// 		.select("*")
// 		.order("highest_catch_weight", { ascending: false });
// 	if (error) {
// 		console.error("Leaderboard fetch error: ", error);
// 	} else {
// 		const leaderboardList = document.getElementById("leaderboardList");
// 		leaderboardList.innerHTML = ""; // Clear current list
// 		data.forEach((entry) => {
// 			const li = document.createElement("li");
// 			li.textContent = `User: ${entry.user_id} - Weight: ${entry.highest_catch_weight}`;
// 			leaderboardList.appendChild(li);
// 		});
// 	}
// }
