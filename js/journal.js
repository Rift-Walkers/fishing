export function createFishJournalUI() {
	const journal = document.createElement("div");
	journal.id = "fishJournal";
	Object.assign(journal.style, {
		position: "absolute",
		top: "50px",
		left: "50%",
		transform: "translateX(-50%)",
		width: "600px",
		maxHeight: "80vh",
		overflowY: "auto",
		background: "rgba(0,0,0,0.8)",
		color: "white",
		padding: "20px",
		borderRadius: "12px",
		display: "none",
		zIndex: 999
	});
	document.body.appendChild(journal);
}

export function toggleFishJournal() {
	const journal = document.getElementById("fishJournal");
	if (!journal) return;

	if (journal.style.display === "none") {
		updateFishJournal();
		journal.style.display = "block";
	} else {
		journal.style.display = "none";
	}
}

export function updateFishJournal() {
	const journal = document.getElementById("fishJournal");
	if (!journal) return;

	const collection = window.fishCollection || [];

	journal.innerHTML = "<h2>📘 Fish Journal</h2>";
	const grouped = {};

	collection.forEach(({ name, rarity }) => {
		if (!grouped[name]) {
			grouped[name] = { name, rarity, count: 1 };
		} else {
			grouped[name].count++;
		}
	});

	Object.values(grouped).forEach(({ name, rarity, count }) => {
		const entry = document.createElement("div");
		entry.style.marginBottom = "12px";
		entry.innerHTML = `
			<strong style="color:${getRarityColor(rarity)}">${rarity}</strong> 
			- <span>${name}</span> 
			(×${count})<br>
			<em>${getFishLore(name)}</em>
			<hr />
		`;
		journal.appendChild(entry);
	});
}

function getRarityColor(rarity) {
	return {
		Common: "#aaa",
		Uncommon: "#00ff00",
		Rare: "#3399ff",
		Epic: "#b266ff",
		Legendary: "#ffd700"
	}[rarity] || "#fff";
}

function getFishLore(name) {
	const lore = {
		"Bubblebelly": "A puffy fish full of hot air.",
		"Mossfin": "Camouflages perfectly in lake algae.",
		"Phantomfin": "Only appears in reflections.",
		"Leviathan of Light": "Said to illuminate the darkest oceans.",
		"Ancient Chest": "Contains whispers from deep time.",
		"Eternal Chest": "Shimmers with cosmic energy.",
		// Add more lore as desired
	};
	return lore[name] || "A mysterious catch with untold origins...";
}
