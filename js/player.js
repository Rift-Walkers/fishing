// js/player.js
// import * as THREE from "three";

export class Player {
	constructor(scene, camera) {
		this.scene = scene;
		this.camera = camera;
		this.speed = 0.5;
		// Create a simple box mesh to represent the player
		const geometry = new THREE.BoxGeometry(1, 2, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.set(0, 1, 0);
		scene.add(this.mesh);

		// Default camera mode is third-person
		this.cameraMode = "third";

		// Object to track pressed keys
		this.keys = {};
		this.setupKeyListeners();
	}

	setupKeyListeners() {
		document.addEventListener("keydown", (e) => {
			this.keys[e.key.toLowerCase()] = true;
			// Switch camera modes
			if (e.key === "1") {
				this.cameraMode = "first";
			}
			if (e.key === "3") {
				this.cameraMode = "third";
			}
		});
		document.addEventListener("keyup", (e) => {
			this.keys[e.key.toLowerCase()] = false;
		});
	}

	update() {
		// WASD movement
		let dx = 0,
			dz = 0;
		if (this.keys["w"]) {
			dz -= this.speed;
		}
		if (this.keys["s"]) {
			dz += this.speed;
		}
		if (this.keys["a"]) {
			dx -= this.speed;
		}
		if (this.keys["d"]) {
			dx += this.speed;
		}
		this.mesh.position.x += dx;
		this.mesh.position.z += dz;

		// Update camera position based on mode
		if (this.cameraMode === "first") {
			// First-person: camera is at the player's head
			this.camera.position.set(
				this.mesh.position.x,
				this.mesh.position.y + 1.5,
				this.mesh.position.z
			);
			// Look in an approximate forward direction (here, slightly toward -Z)
			this.camera.lookAt(
				this.mesh.position.x,
				this.mesh.position.y + 1.5,
				this.mesh.position.z - 1
			);
		} else {
			// Third-person: camera follows behind and above the player
			this.camera.position.set(
				this.mesh.position.x,
				this.mesh.position.y + 5,
				this.mesh.position.z + 10
			);
			this.camera.lookAt(this.mesh.position);
		}
	}
}
