// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87CEEB); // Sky blue background for debugging
document.body.appendChild(renderer.domElement);

// Cannon.js setup
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // m/s²

// Materials
const groundMaterial = new CANNON.Material("groundMaterial");
const wheelMaterial = new CANNON.Material("wheelMaterial");
const carMaterial = new CANNON.Material("carMaterial");

const wheelGroundContactMaterial = new CANNON.ContactMaterial(groundMaterial, wheelMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000000 // N/m
});
world.addContactMaterial(wheelGroundContactMaterial);

const carGroundContactMaterial = new CANNON.ContactMaterial(groundMaterial, carMaterial, {
    friction: 0.3,
    restitution: 0.1,
    contactEquationStiffness: 1000000 // N/m
});
world.addContactMaterial(carGroundContactMaterial);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(20, 30, 10);
scene.add(directionalLight);

// Car setup
const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.2, 1));
const carBody = new CANNON.Body({
    mass: 150, // kg
    position: new CANNON.Vec3(0, 0.5, 0), // Normal position
    shape: carBodyShape,
    material: carMaterial,
});
world.addBody(carBody);

const carBodyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.4, 2), // Double the half extents for actual size
    new THREE.MeshLambertMaterial({ color: 0xff0000 })
);
scene.add(carBodyMesh);

// Wheels setup
const wheelRadius = 0.3;
const wheelThickness = 0.15;
const wheelSegments = 8;

const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, wheelSegments);
const wheelMeshMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

const wheels = [];
const wheelBodies = [];

const addWheel = (x, y, z) => {
    const wheelBody = new CANNON.Body({
        mass: 1, // kg
        position: new CANNON.Vec3(x, y + 0.5, z), // Normal position (relative to car body)
        shape: new CANNON.Cylinder(wheelRadius, wheelRadius, wheelThickness, wheelSegments),
        material: wheelMaterial,
    });
    world.addBody(wheelBody);
    wheelBodies.push(wheelBody);

    const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMeshMaterial);
    scene.add(wheelMesh);
    wheels.push(wheelMesh);

    // Create a HingeConstraint to connect the wheel to the car body
    const axis = new CANNON.Vec3(0, 1, 0); // Y-axis for rotation
    const pCar = new CANNON.Vec3(x, y, z).vsub(carBody.position); // Pivot point on the car body
    const pWheel = new CANNON.Vec3(0, 0, 0); // Pivot point on the wheel body

    const hinge = new CANNON.HingeConstraint(carBody, wheelBody, {
        pivotA: pCar,
        axisA: axis,
        pivotB: pWheel,
        axisB: axis,
        collideConnected: false,
    });
    world.addConstraint(hinge);

    return { wheelBody, wheelMesh };
};

// Front wheels
addWheel(0.6, 0.3, 0.8);
addWheel(-0.6, 0.3, 0.8);
// Rear wheels
addWheel(0.6, 0.3, -0.8);
addWheel(-0.6, 0.3, -0.8);

// Ground
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Rotate ground to be horizontal
world.addBody(groundBody);

const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 10, 10),
    new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// Keyboard controls
const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});

const maxSteerVal = 0.5; // radians
const maxForce = 500;

function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60, 3); // Re-enable physics update

    // Car control
    let engineForce = 0;
    let steer = 0;

    if (keys['w']) {
        engineForce = maxForce;
    }
    if (keys['s']) {
        engineForce = -maxForce;
    }
    if (keys['a']) {
        steer = maxSteerVal;
    }
    if (keys['d']) {
        steer = -maxSteerVal;
    }

    // Apply force to front wheels (even with physics off, to test controls if needed later)
    // wheelBodies[0].applyLocalForce(new CANNON.Vec3(0, 0, engineForce), new CANNON.Vec3(0, 0, 0));
    // wheelBodies[1].applyLocalForce(new CANNON.Vec3(0, 0, engineForce), new CANNON.Vec3(0, 0, 0));

    // Steer front wheels (even with physics off, to test controls if needed later)
    // wheelBodies[0].quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), steer);
    // wheelBodies[1].quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), steer);


    // Update car body and wheels (still need to update meshes based on physics bodies even if physics is off)
    carBodyMesh.position.copy(carBody.position);
    carBodyMesh.quaternion.copy(carBody.quaternion);

    for (let i = 0; i < wheels.length; i++) {
        wheels[i].position.copy(wheelBodies[i].position);
        wheels[i].quaternion.copy(wheelBodies[i].quaternion);
    }

    // Update camera to follow the car (simplified logic)
    camera.position.set(
        carBody.position.x,
        carBody.position.y + 3,
        carBody.position.z - 5
    );
    camera.lookAt(carBody.position);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
