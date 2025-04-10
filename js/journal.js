// 🛠️ Creates the Fish Journal UI element and appends it to the document
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

// 🔁 Toggles visibility of the journal and updates it when opened
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

// 🧠 Updates the journal with all fish (caught + uncaught placeholders)
export function updateFishJournal() {
	const journal = document.getElementById("fishJournal");
	if (!journal) return;

	const caught = window.fishCollection || [];
	const caughtNames = new Set(caught.map(f => f.name)); // Stores all caught fish names

	journal.innerHTML = "<h2>📘 Fish Journal</h2>";

	// Full list of all fish in game, organized by rarity
	const allFishByRarity = {
		Common: [
			"Bubblebelly", "Mossfin", "Pebbletail", "Mudgleam", "Snagglefish",
			"Swampskipper", "Drizzlefin", "Slimescale", "Twigjaw", "Puddlepoke"
		],
		Uncommon: [
			"Glimmerscale", "Flickerfin", "Bogshadow", "Twilight Carp", "Blazegill",
			"Splashmancer", "Needlenose", "Fae Trout", "Barkbass", "Frostmuck"
		],
		Rare: [
			"Stormjaw", "Voltarra", "Icewhisker", "Glowfin", "Duskscale",
			"Lavacod", "Crysteel", "Shadowlurker", "Ember Pike", "Phantomfin"
		],
		Epic: [
			"Spectralfin", "Tempest Ray", "Voidtail", "Nether Trout", "Solarflare Eel",
			"Shimmercrab", "Aetherfin", "Ancient Chest"
		],
		Legendary: [
			"Leviathan of Light", "Abyssal Doomscale", "Celestial Serpent",
			"Worldfin", "Eternal Chest"
		]
	};

	// Count how many of each fish was caught
	const caughtCount = {};
	caught.forEach(({ name }) => {
		caughtCount[name] = (caughtCount[name] || 0) + 1;
	});

	// Loop through all rarities and fish to render journal entries
	Object.entries(allFishByRarity).forEach(([rarity, names]) => {
		// Rarity header (e.g., "Rare")
		const rarityHeader = document.createElement("h3");
		rarityHeader.style.color = getRarityColor(rarity);
		rarityHeader.textContent = rarity;
		journal.appendChild(rarityHeader);

		// Loop through each fish name
		names.forEach((name) => {
			const hasCaught = caughtNames.has(name);
			const entry = document.createElement("div");
			entry.style.marginBottom = "10px";

			if (hasCaught) {
				// ✅ Show full info for caught fish
				entry.innerHTML = `
					<strong style="color:${getRarityColor(rarity)}">${name}</strong> 
					(×${caughtCount[name]})<br>
					<em>${getFishLore(name)}</em>
					<hr />
				`;
			} else {
				// ❌ Show blurred "undiscovered" entry for uncaught fish
				entry.innerHTML = `
					<strong style="color:gray; filter: blur(1px);">?????</strong><br>
					<em style="filter: blur(2px); color: gray;">Undiscovered</em>
					<hr />
				`;
			}

			journal.appendChild(entry);
		});
	});
}

// 🎨 Returns the color used for each rarity tier
function getRarityColor(rarity) {
	return {
		Common: "#aaa",
		Uncommon: "#00ff00",
		Rare: "#3399ff",
		Epic: "#b266ff",
		Legendary: "#ffd700"
	}[rarity] || "#fff";
}

// 📚 Returns the lore/description for each fish (only if discovered)
function getFishLore(name) {
	const lore = {
		"Bubblebelly": "A puffy fish full of hot air.",
		"Mossfin": "Camouflages perfectly in lake algae.",
		"Phantomfin": "Only appears in reflections.",
		"Leviathan of Light": "Said to illuminate the darkest oceans.",
		"Ancient Chest": "Contains whispers from deep time.",
		"Eternal Chest": "Shimmers with cosmic energy.",
		"Glowfin": "Emits faint bioluminescence in deep waters.",
		"Barkbass": "Barks like a dog when spooked.",
		"Aetherfin": "Swims slightly above the water's surface.",
		"Stormjaw": "Rumbles with static electricity.",
		"Frostmuck": "Freezes everything it touches.",
		// Add more as you like
	};
	return lore[name] || "A mysterious catch with untold origins...";
}
