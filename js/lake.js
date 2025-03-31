import { Player } from "./player.js";
import { Fishing } from "./fishing.js";
import { initMultiplayer, updateMultiplayer } from "./multiplayer.js";
import { generateHouses } from "./houses.js"; // Import houses

export function startGame() {
	console.log("✅ startGame called");
	const scene = new THREE.Scene();

	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.set(0, 7, 65);
	camera.lookAt(0, 0, 0);

	// Create the renderer and add it to the DOM
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("gameContainer").appendChild(renderer.domElement);

	// Update background and lighting based on time of day
	function updateBackground() {
		const currentHour = new Date().getHours();
		let backgroundColor, lightColor;
		if (currentHour >= 6 && currentHour < 18) {
			backgroundColor = 0x87ceeb;
			lightColor = 0xffffff;
		} else {
			backgroundColor = 0x0b3d91;
			lightColor = 0x9999ff;
		}
		scene.background = new THREE.Color(backgroundColor);
		scene.children = scene.children.filter(
			(obj) => !(obj instanceof THREE.AmbientLight)
		);
		const light = new THREE.AmbientLight(lightColor, 1);
		scene.add(light);
	}

	updateBackground();
	setInterval(updateBackground, 300000);

	// Create terrain
	const grassGeometry = new THREE.PlaneGeometry(200, 200);
	const grassMaterial = new THREE.MeshBasicMaterial({ color: "#443627" });
	const grass = new THREE.Mesh(grassGeometry, grassMaterial);
	grass.rotation.x = -Math.PI / 2;
	scene.add(grass);

	// Generate environmental elements
	generateGrass(scene);
	generateTrees(scene);
	createLake(scene);
	generateHouses(scene); // Fixed house locations

	// Create dock
	const dockGeometry = new THREE.BoxGeometry(10, 2, 15);
	const dockMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
	const dock = new THREE.Mesh(dockGeometry, dockMaterial);
	dock.position.set(0, 1, 60);
	scene.add(dock);

	// Dock pillars
	const pillarGeometry = new THREE.CylinderGeometry(1, 1, 5, 16);
	const pillarMaterial = new THREE.MeshBasicMaterial({ color: 0x5a3d1a });
	const pillarPositions = [
		[-4, -1.5, 52],
		[4, -1.5, 52],
		[-4, -1.5, 67],
		[4, -1.5, 67],
	];
	pillarPositions.forEach(([x, y, z]) => {
		const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
		pillar.position.set(x, y, z);
		scene.add(pillar);
	});

	// Create player and fishing instances
	const player = new Player(scene, camera);
	const fishing = new Fishing(scene, player, camera);

	// Initialize multiplayer
	initMultiplayer(player);

	// Main animation loop
	function animate() {
		requestAnimationFrame(animate);
		player.update();
		fishing.update();
		updateMultiplayer(player);
		renderer.render(scene, camera);
	}
	animate();
}

/**
 * Seeded Random Function
 */
function seededRandom(seed) {
	let x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/**
 * Create Lake with Depth Effect
 */
function createLake(scene) {
	const lakeCenter = new THREE.Vector3(0, 0.1, 0);
	const lakeRadius = 50;
	const numLayers = 5;
	const colorStart = new THREE.Color(0x3399ff);
	const colorEnd = new THREE.Color(0x000066);

	for (let i = 0; i < numLayers; i++) {
		const fraction = i / (numLayers - 1);
		const radius = lakeRadius * (1 - fraction * 0.2);
		const layerColor = colorStart.clone().lerp(colorEnd, fraction);

		const layerGeometry = new THREE.CircleGeometry(radius, 32);
		const layerMaterial = new THREE.MeshBasicMaterial({ color: layerColor });
		const lakeLayer = new THREE.Mesh(layerGeometry, layerMaterial);

		lakeLayer.rotation.x = -Math.PI / 2;
		lakeLayer.position.set(lakeCenter.x, lakeCenter.y + i * 0.01, lakeCenter.z);
		scene.add(lakeLayer);
	}
}

/**
 * Generate Grass
 */
function generateGrass(scene) {
	const numBlades = 15000;
	const seed = 42;
	const mapSize = 100;
	const lakeRadius = 50;

	for (let i = 0; i < numBlades; i++) {
		const x = seededRandom(i + seed) * 200 - mapSize;
		const z = seededRandom(i + seed * 2) * 200 - mapSize;

		if (Math.sqrt(x ** 2 + z ** 2) < lakeRadius) continue;

		const height = 0.3 + seededRandom(i + seed * 3) * 0.3;
		const colorVariation = 0.2 * seededRandom(i + seed * 4);
		const grassColor = new THREE.Color(0x228b22).lerp(
			new THREE.Color(0x008000),
			colorVariation
		);

		const grassGeometry = new THREE.CylinderGeometry(0.05, 0.05, height, 6);
		const grassMaterial = new THREE.MeshBasicMaterial({ color: grassColor });
		const grassBlade = new THREE.Mesh(grassGeometry, grassMaterial);

		grassBlade.position.set(x, height / 2, z);
		scene.add(grassBlade);
	}
}

/**
 * Generate Trees Around the Edges
 */
function generateTrees(scene) {
	const treeDensity = 100;

	for (let i = 0; i < treeDensity; i++) {
		const edgePositions = [
			[-100, seededRandom(i) * 2 + 5, i * 2 - 100],
			[100, seededRandom(i + 50) * 2 + 5, i * 2 - 100],
			[i * 2 - 100, seededRandom(i + 100) * 2 + 5, -100],
			[i * 2 - 100, seededRandom(i + 150) * 2 + 5, 100],
		];

		edgePositions.forEach(([x, y, z], index) => {
			const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
			const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
			const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
			trunk.position.set(x, 2.5, z);
			scene.add(trunk);

			const colorVariation = 0.2 * seededRandom(index + 300);
			const leavesColor = new THREE.Color(0x228b22).lerp(
				new THREE.Color(0x008000),
				colorVariation
			);

			const leavesGeometry = new THREE.SphereGeometry(3, 8, 8);
			const leavesMaterial = new THREE.MeshBasicMaterial({
				color: leavesColor,
			});
			const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
			leaves.position.set(x, y + 1, z);
			scene.add(leaves);
		});
	}
}
