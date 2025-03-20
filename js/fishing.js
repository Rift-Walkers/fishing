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
		this.fish = null; // Holds the fish instance

		this.setupKeyListener();
	}

	setupKeyListener() {
		document.addEventListener("keydown", (e) => {
			if (e.key.toLowerCase() === "f" && !this.isFishing) {
				this.startFishing();
			}
		});
		document.addEventListener("keyup", (e) => {
			// Cancel fishing if "F" is released early
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
		const playerRotation = this.player.mesh.rotation.y; // Get player's facing direction
		const lakeCenter = new THREE.Vector3(0, 0, 0);
		const lakeRadius = 50;

		// Calculate cast position in front of the player
		const castX = playerPos.x - Math.sin(playerRotation) * 5;
		const castZ = playerPos.z - Math.cos(playerRotation) * 5;
		const castDistance = Math.sqrt(castX ** 2 + castZ ** 2);
		const landsInWater = castDistance < lakeRadius;

		// Ensure fishing only works if the player is facing the lake
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
			// 0.7 ensures player is mostly facing the lake
			console.log("You must be facing the water to fish!");
			return;
		}

		this.isFishing = true;
		this.fishCaught = false;
		this.fishingStartTime = Date.now();

		// Draw fishing line in front of the player
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

			// Trigger fish catch after 5 seconds
			const elapsed = (Date.now() - this.fishingStartTime) / 1000;
			if (elapsed >= 5 && !this.fishCaught) {
				this.catchFish();
			}
		}
	}

	catchFish() {
		// Remove fishing line
		if (this.fishingLine) {
			this.scene.remove(this.fishingLine);
			this.fishingLine = null;
		}
		this.fishCaught = true;

		// Spawn fish and animate it
		this.fish = this.spawnFish();
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

	spawnFish() {
		const fishGroup = new THREE.Group();

		// Fish body (oval shape)
		const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
		bodyGeometry.scale(1.5, 1, 1); // Stretch into an oval
		const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 }); // Orange
		const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
		fishGroup.add(body);

		// Fish tail (triangle shape)
		const tailGeometry = new THREE.BufferGeometry();
		const tailVertices = new Float32Array([
			0,
			0.3,
			0, // Top
			-0.3,
			-0.3,
			0, // Bottom left
			0.3,
			-0.3,
			0, // Bottom right
		]);
		tailGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(tailVertices, 3)
		);
		const tailMaterial = new THREE.MeshBasicMaterial({
			color: 0xff5500,
			side: THREE.DoubleSide,
		});
		const tail = new THREE.Mesh(tailGeometry, tailMaterial);
		tail.position.set(-0.8, 0, 0); // Position behind the body
		fishGroup.add(tail);

		// Position fish at the end of the fishing line
		const playerRotation = this.player.mesh.rotation.y;
		const pos = new THREE.Vector3().copy(this.player.mesh.position);
		pos.y = 0.5; // Water level
		pos.x -= Math.sin(playerRotation) * 10;
		pos.z -= Math.cos(playerRotation) * 10;
		fishGroup.position.copy(pos);

		this.scene.add(fishGroup);
		return fishGroup;
	}
}
