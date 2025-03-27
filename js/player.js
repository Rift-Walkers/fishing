export class Player {
	constructor(scene, camera) {
		this.scene = scene;
		this.camera = camera;
		this.speed = 0.5;
		this.rotationSpeed = 0.05;
		this.cameraYaw = 0; // Tracks camera and player rotation

		// Body mesh
		const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
		const bodyMaterial = new THREE.MeshBasicMaterial({ color: "#3E7B27" });
		this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);

		// Head mesh
		const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
		const headMaterial = new THREE.MeshBasicMaterial({ color: "#123524" });
		this.head = new THREE.Mesh(headGeometry, headMaterial);
		this.head.position.set(0, 1.5, 0);

		// Parent object for body and head
		this.mesh = new THREE.Group();
		this.mesh.add(this.body);
		this.mesh.add(this.head);
		this.mesh.position.set(60, 1, 60);

		// Ensure spawn is on grass, not in water
		this.ensureValidSpawn();

		scene.add(this.mesh);

		this.cameraMode = "third";
		this.keys = {};
		this.setupKeyListeners();
	}

	ensureValidSpawn() {
		const lakeCenter = new THREE.Vector3(0, 0, 0);
		const lakeRadius = 50;

		// Prevent spawning inside the lake
		while (this.mesh.position.distanceTo(lakeCenter) < lakeRadius) {
			this.mesh.position.set(
				Math.random() * 180 - 90, // Random position within (-90,90)
				1,
				Math.random() * 180 - 90
			);
		}
	}

	setupKeyListeners() {
		document.addEventListener("keydown", (e) => {
			this.keys[e.key.toLowerCase()] = true;
			if (e.key === "1") this.cameraMode = "first";
			if (e.key === "3") this.cameraMode = "third";
		});
		document.addEventListener("keyup", (e) => {
			this.keys[e.key.toLowerCase()] = false;
		});
	}

	update() {
		// Rotate the player and camera left/right using A & D keys
		if (this.keys["a"]) {
			this.cameraYaw += this.rotationSpeed; // Rotate left
		}
		if (this.keys["d"]) {
			this.cameraYaw -= this.rotationSpeed; // Rotate right
		}

		// Apply rotation to the player mesh
		this.mesh.rotation.y = this.cameraYaw;

		// Compute movement direction based on player rotation
		let dx = 0,
			dz = 0;
		const forwardVector = new THREE.Vector3(
			-Math.sin(this.cameraYaw),
			0,
			-Math.cos(this.cameraYaw)
		);

		if (this.keys["w"]) {
			dx = forwardVector.x * this.speed;
			dz = forwardVector.z * this.speed;
		}
		if (this.keys["s"]) {
			dx = -forwardVector.x * this.speed;
			dz = -forwardVector.z * this.speed;
		}

		const newX = this.mesh.position.x + dx;
		const newZ = this.mesh.position.z + dz;

		// Grass boundary check
		const onGrass = Math.abs(newX) <= 100 && Math.abs(newZ) <= 100;

		// Water check
		const lakeCenter = new THREE.Vector3(0, 0, 0);
		const lakeRadius = 50;
		const nearLake = Math.sqrt(newX ** 2 + newZ ** 2) < lakeRadius;

		// Only move if inside grass and not in water
		if (onGrass && !nearLake) {
			this.mesh.position.x = newX;
			this.mesh.position.z = newZ;
		}

		// Camera updates
		const cameraOffset = new THREE.Vector3(0, 1.5, -1);
		const rotationMatrix = new THREE.Matrix4().makeRotationY(this.cameraYaw);
		cameraOffset.applyMatrix4(rotationMatrix);

		if (this.cameraMode === "first") {
			// First-person: attach camera to the player's head with rotation
			this.camera.position.copy(this.mesh.position).add(cameraOffset);
			this.camera.lookAt(
				this.mesh.position.x,
				this.mesh.position.y + 1.5,
				this.mesh.position.z
			);
		} else {
			// Third-person: keep camera behind the player
			const thirdPersonOffset = new THREE.Vector3(0, 5, 10);
			thirdPersonOffset.applyMatrix4(
				new THREE.Matrix4().makeRotationY(this.cameraYaw)
			);
			this.camera.position.copy(this.mesh.position).add(thirdPersonOffset);
			this.camera.lookAt(this.mesh.position);
		}
	}
}
