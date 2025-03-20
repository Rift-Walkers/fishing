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
		this.fish = null; // Will hold the current fish instance

		this.setupKeyListener();
	}

	setupKeyListener() {
		document.addEventListener("keydown", (e) => {
			if (e.key.toLowerCase() === "f" && !this.isFishing) {
				this.startFishing();
			}
		});
		document.addEventListener("keyup", (e) => {
			// If F is released before the fish is caught, cancel the fishing attempt.
			if (e.key.toLowerCase() === "f" && this.isFishing && !this.fishCaught) {
				if (this.fishingLine) {
					this.scene.remove(this.fishingLine);
					this.fishingLine = null;
				}
				this.isFishing = false;
			}
		});
	}

	// Spawns a new fish of the singular type at the end of the fishing line.
	spawnFish() {
		const geometry = new THREE.SphereGeometry(0.5, 16, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const fish = new THREE.Mesh(geometry, material);
		// Position the fish at the end of the fishing line (relative to the player)
		const pos = new THREE.Vector3().copy(this.player.mesh.position);
		pos.y = 0.5; // water level
		pos.z -= 10; // same offset as the fishing line end
		fish.position.copy(pos);
		this.scene.add(fish);
		return fish;
	}

	startFishing() {
		this.isFishing = true;
		this.fishCaught = false;
		this.fishingStartTime = Date.now();
		// Draw the fishing line from the player's position to a point 10 units ahead (-Z direction)
		const start = new THREE.Vector3().copy(this.player.mesh.position);
		const end = new THREE.Vector3(start.x, start.y + 1, start.z - 10);
		const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
		const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
		this.fishingLine = new THREE.Line(lineGeometry, lineMaterial);
		this.scene.add(this.fishingLine);
	}

	update() {
		if (this.isFishing) {
			// Update the fishing line to follow the player's movement
			const start = new THREE.Vector3().copy(this.player.mesh.position);
			const end = new THREE.Vector3(start.x, start.y + 1, start.z - 10);
			if (this.fishingLine) {
				this.fishingLine.geometry.setFromPoints([start, end]);
			}

			// If 10 seconds have elapsed, trigger the fish catch animation
			const elapsed = (Date.now() - this.fishingStartTime) / 1000;
			if (elapsed >= 10 && !this.fishCaught) {
				this.catchFish();
			}
		}
	}

	catchFish() {
		// Remove the fishing line from the scene
		if (this.fishingLine) {
			this.scene.remove(this.fishingLine);
			this.fishingLine = null;
		}
		this.fishCaught = true;
		// Spawn the fish now, and animate it being pulled out of the water
		this.fish = this.spawnFish();
		const targetY = 5; // target y position when fish is fully pulled out
		const animateFish = () => {
			if (this.fish && this.fish.position.y < targetY) {
				this.fish.position.y += 0.1; // adjust speed as necessary
				requestAnimationFrame(animateFish);
			} else {
				// Once the fish reaches target height, update the leaderboard and remove the fish
				updateLeaderboard("player1", 1);
				if (this.fish) {
					this.scene.remove(this.fish);
					this.fish = null;
				}
				// Reset fishing state to allow another attempt
				this.isFishing = false;
				this.fishCaught = false;
			}
		};
		animateFish();
	}
}
