import { updateLeaderboard } from "./leaderBoard.js";

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

		this.setupKeyListener();
		this.createPopupUI();
	}

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

	catchFish() {
		if (this.fishingLine) {
			this.scene.remove(this.fishingLine);
			this.fishingLine = null;
		}
		this.fishCaught = true;

		const fishType = this.getRandomFishType();
		this.incrementCaught(fishType.rarity, fishType.name);
		this.showPopup(`🎣 You caught a ${fishType.rarity} ${fishType.name}!`);

		this.fish = this.spawnFish(fishType);
		const targetY = 5;
		const animateFish = () => {
			if (this.fish && this.fish.position.y < targetY) {
				this.fish.position.y += 0.1;
				requestAnimationFrame(animateFish);
			} else {
				updateLeaderboard("player1", 1);
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

	getRandomFishType() {
		const roll = Math.random() * 100;
		let rarity = "Common";
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

		return {
			rarity,
			name: fishName,
			color: colors[rarity]
		};
	}

	incrementCaught(rarity, name) {
		if (!this.caughtRarities[rarity]) {
			this.caughtRarities[rarity] = 0;
		}
		this.caughtRarities[rarity]++;

		// Track in global collection
		window.fishCollection = window.fishCollection || [];
		window.fishCollection.push({ name, rarity });

		console.log("Caught so far:", this.caughtRarities);
	}

	showPopup(text) {
		const popup = document.getElementById("fishPopup");
		if (!popup) return;
		popup.innerText = text;
		popup.style.opacity = 1;
		popup.style.display = "block";
		setTimeout(() => {
			popup.style.opacity = 0;
			setTimeout(() => {
				popup.style.display = "none";
			}, 500);
		}, 2000);
	}

	createPopupUI() {
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
	}

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
		tailGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(tailVertices, 3)
		);
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
}
