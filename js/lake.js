// js/fishing_game.js
// import * as THREE from 'three';

export function startGame() {
    // Create the scene
    const scene = new THREE.Scene();

    // Set up the camera (First-Person Perspective)
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 7, 65); // Position camera on the dock
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
    lake.position.set(0, 0.1, 0);
    scene.add(lake);

    // Create a wooden dock
    const dockWidth = 10;
    const dockLength = 15;
    const dockHeight = 2;
    
    const dockGeometry = new THREE.BoxGeometry(dockWidth, dockHeight, dockLength);
    const dockMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const dock = new THREE.Mesh(dockGeometry, dockMaterial);
    dock.position.set(0, 1, 60); // Position dock at the lake's edge
    scene.add(dock);

    // Add support pillars for the dock
    const pillarGeometry = new THREE.CylinderGeometry(1, 1, 5, 16);
    const pillarMaterial = new THREE.MeshBasicMaterial({ color: 0x5a3d1a });

    const pillarPositions = [
        [-4, -1.5, 52], [4, -1.5, 52],  // Front pillars
        [-4, -1.5, 67], [4, -1.5, 67],  // Back pillars
    ];

    pillarPositions.forEach(([x, y, z]) => {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, y, z);
        scene.add(pillar);
    });

    // Fishing Rod (Basic Representation)
    const rodGeometry = new THREE.CylinderGeometry(0.2, 0.2, 10);
    const rodMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const rod = new THREE.Mesh(rodGeometry, rodMaterial);
    rod.position.set(0, 7, 58); // Positioned in front of the camera
    scene.add(rod);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}
