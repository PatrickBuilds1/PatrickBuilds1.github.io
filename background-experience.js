// background-experience.js

(function () {
  // Get the canvas element
  const canvas = document.getElementById("background-canvas");
  if (!canvas) {
    console.error("Canvas with id 'background-canvas' not found.");
    return;
  }

  // Create the Three.js scene
  const scene = new THREE.Scene();
  // Set a deep, subtle background color (will be blended with bloom)
  scene.background = new THREE.Color(0x000000);

  // Set up a perspective camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 100);
  scene.add(camera);

  // Create the WebGL renderer using the provided canvas
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // Transparent clear

  // Add soft ambient and directional lighting for a balanced, elegant illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);

  // Create a rotating torus knot as an elegant centerpiece
  const knotGeometry = new THREE.TorusKnotGeometry(20, 6, 150, 20);
  const knotMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7d5fff,
    metalness: 0.5,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    emissive: 0x443399,
    emissiveIntensity: 0.3,
  });
  const torusKnot = new THREE.Mesh(knotGeometry, knotMaterial);
  scene.add(torusKnot);

  // Create a sophisticated particle system for a dynamic, elegant feel
  const particleCount = 3000;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    // Distribute particles in a large volume for depth
    const x = (Math.random() - 0.5) * 600;
    const y = (Math.random() - 0.5) * 600;
    const z = (Math.random() - 0.5) * 600;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Use a subtle gradient from soft blue to violet for elegance
    const color = new THREE.Color();
    color.setHSL(0.6 + Math.random() * 0.1, 0.8, 0.6);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  // Set up post-processing using EffectComposer and UnrealBloomPass for a dreamy glow
  let composer = null;
  if (
    THREE.EffectComposer &&
    THREE.RenderPass &&
    THREE.UnrealBloomPass
  ) {
    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.0, // bloom strength
      0.5, // bloom radius
      0.85 // bloom threshold
    );
    composer.addPass(bloomPass);
  }

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Rotate the torus knot slowly
    torusKnot.rotation.x = elapsed * 0.2;
    torusKnot.rotation.y = elapsed * 0.1;

    // Animate particles with subtle oscillations for elegance
    const posAttr = particlesGeometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      // Apply a slight vertical oscillation and gentle swirl
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      const angle = Math.atan2(y, x) + 0.0005;
      const radius = Math.sqrt(x * x + y * y);
      posAttr.setXY(i, Math.cos(angle) * radius, Math.sin(angle) * radius);
      posAttr.setZ(i, z + Math.sin(elapsed + i * 0.001) * 0.05);
    }
    posAttr.needsUpdate = true;

    // Render scene with post-processing if available
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }
  animate();

  // Update on window resize
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if (composer) composer.setSize(width, height);
  });
})();
