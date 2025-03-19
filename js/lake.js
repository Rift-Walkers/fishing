// js/lake.js
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
	camera.position.set(0, 100, 100);
	camera.lookAt(0, 0, 0);

	// Create the renderer and add it to the DOM
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("gameContainer").appendChild(renderer.domElement);

	// Add a plane for grass (green ground)
	const grassGeometry = new THREE.PlaneGeometry(200, 200);
	const grassMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const grass = new THREE.Mesh(grassGeometry, grassMaterial);
	grass.rotation.x = -Math.PI / 2;
	scene.add(grass);

	// Add a circle for the lake (blue water)
	const lakeGeometry = new THREE.CircleGeometry(50, 32);
	const lakeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
	const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
	lake.rotation.x = -Math.PI / 2;
	scene.add(lake);

	// Animation loop
	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}
	animate();
}
