// import { updateLeaderboard } from "./leaderBoard.js";

export class Fishing {
	constructor(scene, player, camera) {
		this.scene = scene;
		this.player = player;
		this.camera = camera;
		this.isFishing = false;
		this.fishingLine = null;
		this.fishingStartTime = null;
		this.fishCaught = false;
		this.fish = null;
		this.caughtRarities = {};

		// ─── Setup Daily Persistent State ─────────────────────────────
		this.today = new Date().toISOString().slice(0, 10); // e.g., "2025-04-10"
		this.catchOfTheDay = this.getCatchOfTheDay(); // Always a Common fish from our pool
		this.catchBonusRemaining = 0; // Number of bonus casts remaining (2x odds)
		// Initialize daily state only once
		this.initDailyState();

		// ─── Initialize Event Listeners & UI ───────────────────────────
		this.setupKeyListener();
		this.createPopupUI(); // Creates catch popup, bonus tracker, and CoTD banner
		this.updateCotdCheckmark(); // Ensures checkmark is hidden unless CoTD was caught
		this.updateBonusTracker();
	}

	// ─── DAILY STATE MANAGEMENT ─────────────────────────────────────────
	initDailyState() {
		// Retrieve saved state from localStorage
		const data = JSON.parse(localStorage.getItem("fishingGameState")) || {};
		if (data.date !== this.today) {
			// New day: reset state
			this.castsToday = 0;
			this.cotdCaught = false;
			this.catchBonusRemaining = 0;
		} else {
			// Restore saved state
			this.castsToday = data.castsToday || 0;
			this.cotdCaught = data.cotdCaught || false;
			this.catchBonusRemaining = data.catchBonusRemaining || 0;
		}
	}

	saveDailyState() {
		localStorage.setItem("fishingGameState", JSON.stringify({
			date: this.today,
			castsToday: this.castsToday,
			cotdCaught: this.cotdCaught,
			catchBonusRemaining: this.catchBonusRemaining
		}));
	}

	// ─── EVENT LISTENERS ────────────────────────────────────────────────────
	setupKeyListener() {
		document.addEventListener("keydown", (e) => {
			if (e.key.toLowerCase() === "f" && !this.isFishing) {
				this.startFishing();
			}
		});
		document.addEventListener("keyup", (e) => {
			if (e.key.toLowerCase() === "f" && this.isFishing && !this.fishCaught) {
				if (this.fishingLine) {
					this.scene.remove(this.fishingLine);
					this.fishingLine = null;
				}
				this.isFishing = false;
			}
		});
	}

	// ─── START FISHING ─────────────────────────────────────────────────────
	startFishing() {
		const playerPos = this.player.mesh.position;
		const playerRotation = this.player.mesh.rotation.y;
		const lakeCenter = new THREE.Vector3(0, 0, 0);
		const lakeRadius = 50;

		const castX = playerPos.x - Math.sin(playerRotation) * 5;
		const castZ = playerPos.z - Math.cos(playerRotation) * 5;
		const castDistance = Math.sqrt(castX ** 2 + castZ ** 2);
		const landsInWater = castDistance < lakeRadius;

		const toLakeVector = new THREE.Vector3(
			lakeCenter.x - playerPos.x,
			0,
			lakeCenter.z - playerPos.z
		).normalize();
		const playerForwardVector = new THREE.Vector3(
			-Math.sin(playerRotation),
			0,
			-Math.cos(playerRotation)
		);
		const angleToLake = toLakeVector.dot(playerForwardVector);

		if (!landsInWater || angleToLake < 0.7) {
			console.log("You must be facing the water to fish!");
			return;
		}

		this.isFishing = true;
		this.fishCaught = false;
		this.fishingStartTime = Date.now();

		// Draw the fishing line
		const start = new THREE.Vector3().copy(this.player.mesh.position);
		const end = new THREE.Vector3(
			start.x - Math.sin(playerRotation) * 10,
			start.y + 1,
			start.z - Math.cos(playerRotation) * 10
		);
		const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
		const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
		this.fishingLine = new THREE.Line(lineGeometry, lineMaterial);
		this.scene.add(this.fishingLine);
	}

	// ─── UPDATE LOOP ───────────────────────────────────────────────────────
	update() {
		if (this.isFishing) {
			const playerRotation = this.player.mesh.rotation.y;
			const start = new THREE.Vector3().copy(this.player.mesh.position);
			const end = new THREE.Vector3(
				start.x - Math.sin(playerRotation) * 10,
				start.y + 1,
				start.z - Math.cos(playerRotation) * 10
			);
			if (this.fishingLine) {
				this.fishingLine.geometry.setFromPoints([start, end]);
			}
			const elapsed = (Date.now() - this.fishingStartTime) / 1000;
			if (elapsed >= 5 && !this.fishCaught) {
				this.catchFish();
			}
		}
	}

	// ─── HANDLE FISH CATCH ───────────────────────────────────────────────────
	catchFish() {
		if (this.fishingLine) {
			this.scene.remove(this.fishingLine);
			this.fishingLine = null;
		}
		this.fishCaught = true;

		// Increment casts
		this.castsToday++;
		let fishType = this.getRandomFishType();

		// Force CoTD on 10th cast if not yet caught
		if (this.castsToday === 10 && !this.cotdCaught) {
			fishType = { rarity: "Common", name: this.catchOfTheDay, color: 0x808080 };
		}

		this.incrementCaught(fishType.rarity, fishType.name);

		let catchText = `🎣 You caught a ${fishType.rarity} ${fishType.name}!`;

		// If this catch is the CoTD and it hasn’t been caught yet...
		if (fishType.name === this.catchOfTheDay && !this.cotdCaught) {
			this.cotdCaught = true;
			this.catchBonusRemaining = 5; // Activate bonus for 5 casts
			catchText += " 🌟 It's the Catch of the Day! 2x odds for 5 casts!";
			this.updateCotdCheckmark(); // Show checkmark on CoTD banner
			this.updateBonusTracker(); // Update bonus tracker display
		}

		this.saveDailyState(); // Persist state changes
		this.showPopup(catchText);

		this.fish = this.spawnFish(fishType);
		const targetY = 5;
		const animateFish = () => {
			if (this.fish && this.fish.position.y < targetY) {
				this.fish.position.y += 0.1;
				requestAnimationFrame(animateFish);
			} else {
				if (this.fish) {
					this.scene.remove(this.fish);
					this.fish = null;
				}
				this.isFishing = false;
				this.fishCaught = false;
			}
		};
		animateFish();
	}

	// ─── DETERMINE FISH TYPE, APPLYING BONUS IF ACTIVE ─────────────────────
	getRandomFishType() {
		let roll = Math.random() * 100;
		let rarity = "Common";

		// If bonus casts are active, apply 2x odds
		if (this.catchBonusRemaining > 0) {
			roll /= 2;
			this.catchBonusRemaining--;
			this.updateBonusTracker();
			console.log(`🎁 Bonus active! Casts left: ${this.catchBonusRemaining}`);
		}

		// Force CoTD catch on 10th cast if not yet caught
		if (this.castsToday === 10 && !this.cotdCaught) {
			return { rarity: "Common", name: this.catchOfTheDay, color: 0x808080 };
		}

		if (roll < 2) rarity = "Legendary";
		else if (roll < 10) rarity = "Epic";
		else if (roll < 25) rarity = "Rare";
		else if (roll < 50) rarity = "Uncommon";

		const namePool = {
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

		const colors = {
			Common: 0x808080,
			Uncommon: 0x00ff00,
			Rare: 0x0000ff,
			Epic: 0x800080,
			Legendary: 0xffd700
		};

		const fishNames = namePool[rarity];
		const fishName = fishNames[Math.floor(Math.random() * fishNames.length)];

		return { rarity, name: fishName, color: colors[rarity] };
	}

	// ─── TRACK CAUGHT FISH (for journal) ─────────────────────────────────────
	incrementCaught(rarity, name) {
		if (!this.caughtRarities[rarity]) {
			this.caughtRarities[rarity] = 0;
		}
		this.caughtRarities[rarity]++;
		window.fishCollection = window.fishCollection || [];
		window.fishCollection.push({ name, rarity });
		console.log("Caught so far:", this.caughtRarities);
	}

	// ─── DISPLAY POPUP FOR CATCHES ───────────────────────────────────────────
	showPopup(text) {
		const popup = document.getElementById("fishPopup");
		if (!popup) return;
		popup.innerText = text;
		popup.style.opacity = 1;
		popup.style.display = "block";
		clearTimeout(this.popupTimeout);
		// Display message for 4 seconds, then fade out
		this.popupTimeout = setTimeout(() => {
			popup.style.opacity = 0;
			setTimeout(() => {
				popup.style.display = "none";
			}, 500);
		}, 4000);
	}

	// ─── CREATE UI ELEMENTS: POPUP, BONUS TRACKER, & CoTD BANNER ─────────────
	createPopupUI() {
		// Create catch popup
		const popup = document.createElement("div");
		popup.id = "fishPopup";
		Object.assign(popup.style, {
			position: "absolute",
			top: "20px",
			left: "50%",
			transform: "translateX(-50%)",
			padding: "10px 20px",
			background: "rgba(0,0,0,0.7)",
			color: "white",
			fontSize: "18px",
			borderRadius: "10px",
			display: "none",
			zIndex: 999,
			transition: "opacity 0.5s ease"
		});
		document.body.appendChild(popup);

		// Create bonus tracker display
		const bonus = document.createElement("div");
		bonus.id = "bonusTracker";
		Object.assign(bonus.style, {
			position: "absolute",
			top: "45px",
			right: "20px",
			color: "#ffcc00",
			fontSize: "14px",
			display: "none",
			zIndex: 999
		});
		document.body.appendChild(bonus);

		// Create Catch of the Day banner with checkmark indicator
		const cotd = document.createElement("div");
		cotd.id = "cotdDisplay";
		// Initially the checkmark span is set to "none"
		cotd.innerHTML = `🎯 Catch of the Day: <strong>${this.catchOfTheDay}</strong> <span id="cotdCheck" style="display:none;">✅</span>`;
		Object.assign(cotd.style, {
			position: "absolute",
			top: "10px",
			right: "20px",
			background: "rgba(0,0,0,0.6)",
			color: "white",
			padding: "8px 12px",
			borderRadius: "10px",
			fontSize: "14px",
			zIndex: 999
		});
		document.body.appendChild(cotd);
	}

	// ─── UPDATE THE BONUS TRACKER UI ─────────────────────────────────────────
	updateBonusTracker() {
		const tracker = document.getElementById("bonusTracker");
		if (!tracker) return;
		if (this.catchBonusRemaining > 0) {
			tracker.innerText = `🔥 2x Odds: ${this.catchBonusRemaining} cast${this.catchBonusRemaining === 1 ? "" : "s"} left`;
			tracker.style.display = "block";
		} else {
			tracker.style.display = "none";
		}
	}

	// ─── UPDATE THE CoTD CHECKMARK ─────────────────────────────────────────────
	updateCotdCheckmark() {
		const check = document.getElementById("cotdCheck");
		if (check) {
			// Show checkmark only if cotdCaught is true
			check.style.display = this.cotdCaught ? "inline" : "none";
		}
	}

	// ─── SPAWN THE FISH MODEL IN THE SCENE ─────────────────────────────────────
	spawnFish(fishType) {
		const fishGroup = new THREE.Group();
		const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
		bodyGeometry.scale(1.5, 1, 1);
		const bodyMaterial = new THREE.MeshBasicMaterial({ color: fishType.color });
		const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
		fishGroup.add(body);

		const tailGeometry = new THREE.BufferGeometry();
		const tailVertices = new Float32Array([
			0, 0.3, 0,
			-0.3, -0.3, 0,
			0.3, -0.3, 0
		]);
		tailGeometry.setAttribute("position", new THREE.BufferAttribute(tailVertices, 3));
		const tailMaterial = new THREE.MeshBasicMaterial({
			color: fishType.color,
			side: THREE.DoubleSide
		});
		const tail = new THREE.Mesh(tailGeometry, tailMaterial);
		tail.position.set(-0.8, 0, 0);
		fishGroup.add(tail);

		const playerRotation = this.player.mesh.rotation.y;
		const pos = new THREE.Vector3().copy(this.player.mesh.position);
		pos.y = 0.5;
		pos.x -= Math.sin(playerRotation) * 10;
		pos.z -= Math.cos(playerRotation) * 10;
		fishGroup.position.copy(pos);

		this.scene.add(fishGroup);
		return fishGroup;
	}

	// ─── DETERMINE TODAY'S CATCH OF THE DAY (Always from Common Pool) ──────────
	getCatchOfTheDay() {
		const commonFish = [
			"Bubblebelly", "Mossfin", "Pebbletail", "Mudgleam", "Snagglefish",
			"Swampskipper", "Drizzlefin", "Slimescale", "Twigjaw", "Puddlepoke"
		];
		const today = new Date().toISOString().slice(0, 10);
		const hash = [...today].reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const index = hash % commonFish.length;
		return commonFish[index];
	}
}
