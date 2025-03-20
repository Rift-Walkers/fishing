import { Player } from "./player.js";
import { Fishing } from "./fishing.js";
import { initMultiplayer, updateMultiplayer } from "./multiplayer.js";

export function startGame() {
	// Create the scene
	const scene = new THREE.Scene();

	// Set up the camera
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
			backgroundColor = 0x87ceeb; // Daytime sky
			lightColor = 0xffffff;
		} else {
			backgroundColor = 0x0b3d91; // Nighttime sky
			lightColor = 0x9999ff;
		}
		scene.background = new THREE.Color(backgroundColor);
		// Remove any existing ambient lights and add a new one
		scene.children = scene.children.filter(
			(obj) => !(obj instanceof THREE.AmbientLight)
		);
		const light = new THREE.AmbientLight(lightColor, 1);
		scene.add(light);
	}

	updateBackground();
	setInterval(updateBackground, 300000);

	// Create environment objects
	const grassGeometry = new THREE.PlaneGeometry(200, 200);
	const grassMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const grass = new THREE.Mesh(grassGeometry, grassMaterial);
	grass.rotation.x = -Math.PI / 2;
	scene.add(grass);

	const lakeGeometry = new THREE.CircleGeometry(50, 32);
	const lakeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
	const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
	lake.rotation.x = -Math.PI / 2;
	lake.position.set(0, 0.1, 0);
	scene.add(lake);

	const dockWidth = 10;
	const dockLength = 15;
	const dockHeight = 2;
	const dockGeometry = new THREE.BoxGeometry(dockWidth, dockHeight, dockLength);
	const dockMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
	const dock = new THREE.Mesh(dockGeometry, dockMaterial);
	dock.position.set(0, 1, 60);
	scene.add(dock);

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

	// (Optional) Static fishing rod parts for visual flavor
	const handleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5);
	const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
	const handle = new THREE.Mesh(handleGeometry, handleMaterial);
	handle.position.set(0, 5, 55);
	scene.add(handle);

	const rodGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4);
	const rodMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
	const rod = new THREE.Mesh(rodGeometry, rodMaterial);
	rod.position.set(0, 6, 58);
	scene.add(rod);

	const lineGeometry = new THREE.CylinderGeometry(0.02, 0.02, 4);
	const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const line = new THREE.Mesh(lineGeometry, lineMaterial);
	line.position.set(0, 7, 58);
	scene.add(line);

	// Create player and fishing instances
	const player = new Player(scene, camera);
	const fishing = new Fishing(scene, player, camera);

	// Initialize multiplayer (placeholder)
	initMultiplayer(player);

	// Main animation loop
	function animate() {
		requestAnimationFrame(animate);

		// Update player movement and camera mode
		player.update();

		// Update fishing logic (line position and catch check)
		fishing.update();

		// Update multiplayer state (placeholder)
		updateMultiplayer(player);

		renderer.render(scene, camera);
	}
	animate();
}
