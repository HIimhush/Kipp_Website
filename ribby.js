import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ================================
// 3D MODEL LOGIC
// ================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Ribby: Initializing...');
    if (document.getElementById('ribby-3d-scene')) {
        new RibbyModel('ribby-3d-scene', '.ribby-section');
    } else {
        console.warn('Ribby 3D scene container not found.');
    }
});


class RibbyModel {
    constructor(containerId, sectionSelector) {
        this.container = document.getElementById(containerId);
        this.section = document.querySelector(sectionSelector);
        
        if (!this.container || !this.section) {
            console.error('RibbyModel: Container or section not found', {
                container: containerId,
                section: sectionSelector
            });
            return;
        }

        console.log('RibbyModel: Initializing...');

     
        this.modelConfig = {
            position: {
                x: -0.8,     
                y: 0,   
                z: -15,   
            },
            
            // Initial rotation
            rotation: {
                x: 0,      // Pitch
                y: -1.8,     // Yaw
                z: 0,      // Roll
            },
            
            // Scale
            scale: 2.2,
            
            // Mouse follow sensitivity
            mouseSensitivity: 1.4
        };
        // ==========================================

        // Mouse position relative to section (normalized -1 to 1)
        this.mouse = { x: 0, y: 0 };
        
        // The loaded 3D model
        this.model = null;

        // Start initialization
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 0);

        // Create renderer with transparency
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        this.container.appendChild(this.renderer.domElement);

        // Add OrbitControls for DEBUGGING (can disable later)
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.enableDamping = true;
        
        // Add lights
        this.setupLights();

        // Load the 3D model
        this.loadModel();

        // Setup event listeners
        this.setupEventListeners();

        // Start animation loop
        this.animate();
    }

    setupLights() {
        // Ambient light for overall illumination
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);

        // Directional light from top-right
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);

        // Fill light from left
        const fillLight = new THREE.DirectionalLight(0xaaddff, 0.8);
        fillLight.position.set(-5, 5, 5);
        this.scene.add(fillLight);
    }

    loadModel() {
        console.log('RibbyModel: Starting model load...');
        
        const loader = new GLTFLoader();
        // Path adjusted for standard static serving, handling the space in filename
        const modelPath = 'Recursos/3D_MODELS/RIBBY_3D_MODEL/RIBBY_3D%20MODELgltf.gltf';
        
        console.log('RibbyModel: Loading from path:', modelPath);

        loader.load(
            modelPath,
            (gltf) => {
                console.log('RibbyModel: ✓ Model loaded successfully!');
                
                this.model = gltf.scene;

                // Center the model geometry
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.sub(center);

                // Apply initial scale
                this.model.scale.setScalar(this.modelConfig.scale);

                // Create a parent group to hold the model. 
                // This allows us to rotate the group for mouse movement while keeping the model's base rotation.
                this.modelGroup = new THREE.Group();
                this.modelGroup.add(this.model);
                this.scene.add(this.modelGroup);

                // Apply config position to the group
                this.modelGroup.position.set(
                    this.modelConfig.position.x,
                    this.modelConfig.position.y,
                    this.modelConfig.position.z
                );
                
                // Apply base rotation to the model itself or the group
                this.modelGroup.rotation.set(
                    this.modelConfig.rotation.x,
                    this.modelConfig.rotation.y,
                    this.modelConfig.rotation.z
                );

                // Set transparency/opacity if needed
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            },
            (progress) => {
                // optional progress
            },
            (error) => {
                console.error('RibbyModel: ✗ Failed to load model:', error);
            }
        );
    }

    setupEventListeners() {
        // Track mouse movement within the section
        if (this.section) {
            this.section.addEventListener('mousemove', (e) => {
                const rect = this.section.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                // Normalize to -1 to 1
                this.mouse.x = (x - 0.5) * 2;
                this.mouse.y = (y - 0.5) * 2;
            });

            this.section.addEventListener('mouseleave', () => {
                // Smoothly return to center? Or keep last position?
                // Let's reset to look forward
                this.mouse.x = 0;
                this.mouse.y = 0;
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (!this.container) return;
            const aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update model rotation
        if (this.modelGroup) {
            const sens = this.modelConfig.mouseSensitivity;
            
            // Target rotations based on mouse
            // Mouse X controls Y rotation (Yaw)
            // Mouse Y controls X rotation (Pitch)
            
            const targetRotX = this.modelConfig.rotation.x + (this.mouse.y * sens * 0.5); 
            const targetRotY = this.modelConfig.rotation.y + (this.mouse.x * sens * 0.5);

            // Lerp current rotation to target
            this.modelGroup.rotation.x += (targetRotX - this.modelGroup.rotation.x) * 0.1;
            this.modelGroup.rotation.y += (targetRotY - this.modelGroup.rotation.y) * 0.1;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
