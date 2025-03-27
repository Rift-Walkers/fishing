export class House {
	constructor(scene, position = { x: 0, z: 0 }, baseColor, roofColor) {
		this.scene = scene;

		// House body (rectangular prism)
		const baseGeometry = new THREE.BoxGeometry(6, 4, 8);
		const baseMaterial = new THREE.MeshBasicMaterial({ color: baseColor });
		this.base = new THREE.Mesh(baseGeometry, baseMaterial);
		this.base.position.set(position.x, 2, position.z);

		// Roof (pyramid shape)
		const roofGeometry = new THREE.ConeGeometry(5, 3, 4);
		const roofMaterial = new THREE.MeshBasicMaterial({ color: roofColor });
		this.roof = new THREE.Mesh(roofGeometry, roofMaterial);
		this.roof.position.set(position.x, 5.5, position.z);
		this.roof.rotation.y = Math.PI / 4; // Align with house base

		// Door (smaller cube)
		const doorGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.1);
		const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x6b4226 });
		this.door = new THREE.Mesh(doorGeometry, doorMaterial);
		this.door.position.set(position.x, 1.25, position.z + 4.05); // Front-facing

		// Window (small square)
		const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.1);
		const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		this.window = new THREE.Mesh(windowGeometry, windowMaterial);
		this.window.position.set(position.x + 2, 2.5, position.z + 4.05);

		// Steps (two small cubes)
		const step1Geometry = new THREE.BoxGeometry(2.5, 0.5, 1);
		const step2Geometry = new THREE.BoxGeometry(2, 0.5, 1);
		const stepMaterial = new THREE.MeshBasicMaterial({ color: 0x8b5a2b });
		this.step1 = new THREE.Mesh(step1Geometry, stepMaterial);
		this.step2 = new THREE.Mesh(step2Geometry, stepMaterial);
		this.step1.position.set(position.x, 0.25, position.z + 4);
		this.step2.position.set(position.x, 0.5, position.z + 4.5);

		// Add all parts to the scene
		scene.add(this.base);
		scene.add(this.roof);
		scene.add(this.door);
		scene.add(this.window);
		scene.add(this.step1);
		scene.add(this.step2);
	}
}

export function generateHouses(scene) {
	const housePositions = [
		{ x: -90, z: 90 },
		{ x: 90, z: 90 },
		{ x: -90, z: -90 },
		{ x: 90, z: -90 },
	];

	housePositions.forEach((pos) => {
		new House(scene, pos, getRandomHouseColor(), getRandomRoofColor());
	});
}

// Helper functions for color variation
function getRandomHouseColor() {
	const colors = [0xb5651d, 0xd2691e, 0x8b4513]; // Brownish house colors
	return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomRoofColor() {
	const colors = [0xff0000, 0x8b0000, 0x800000]; // Red and dark roof colors
	return colors[Math.floor(Math.random() * colors.length)];
}
