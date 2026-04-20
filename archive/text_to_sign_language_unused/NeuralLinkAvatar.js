/**
 * Neural-Link Mannequin Avatar
 * A crystalline, tech-style 3D avatar for ASL sign language visualization
 * Features: Octahedron joints, frosted glass bones, wireframe head, full hand hierarchy
 */

(function() {
  'use strict';

  // Wait for THREE.js to load
  if (typeof window === 'undefined') return;
  
  if (typeof window.THREE === 'undefined') {
    console.log('[NeuralLinkAvatar] Waiting for THREE.js...');
    const checkInterval = setInterval(() => {
      if (typeof window.THREE !== 'undefined') {
        clearInterval(checkInterval);
        console.log('[NeuralLinkAvatar] THREE.js loaded, initializing...');
        initNeuralLinkAvatar();
      }
    }, 50);
    return;
  }

  initNeuralLinkAvatar();

  function initNeuralLinkAvatar() {
    const THREE = window.THREE;

    /**
     * PoseBridge - Manages pose data loading and frame interpolation
     */
    class PoseBridge {
      constructor() {
        this.poseData = null;
        this.frames = [];
        this.currentFrame = 0;
        this.fps = 30;
        this.isPlaying = false;
        this.lastUpdateTime = 0;
      }

      async loadPoseFile(word) {
        try {
          const response = await fetch(`/poses/${word.toUpperCase()}.pose`);
          if (!response.ok) {
            throw new Error(`Failed to load pose file: ${response.statusText}`);
          }
          
          this.poseData = await response.json();
          this.frames = this.poseData.frames || [];
          this.fps = this.poseData.fps || 30;
          this.currentFrame = 0;
          this.isPlaying = true;
          this.lastUpdateTime = Date.now();
          
          console.log(`[PoseBridge] Loaded "${word}": ${this.frames.length} frames @ ${this.fps} fps`);
          return true;
        } catch (error) {
          console.error('[PoseBridge] Error loading pose:', error);
          return false;
        }
      }

      getCurrentFrame() {
        if (!this.isPlaying || this.frames.length === 0) {
          return null;
        }

        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        const frameDelta = deltaTime * this.fps;
        
        this.currentFrame += frameDelta;
        this.lastUpdateTime = now;

        if (this.currentFrame >= this.frames.length) {
          this.currentFrame = 0; // Loop
        }

        return this.frames[Math.floor(this.currentFrame)];
      }

      getInterpolatedFrame() {
        if (!this.isPlaying || this.frames.length === 0) {
          return null;
        }

        const frameIndex = this.currentFrame;
        const frame1Index = Math.floor(frameIndex);
        const frame2Index = Math.min(frame1Index + 1, this.frames.length - 1);
        const alpha = frameIndex - frame1Index; // Interpolation factor

        const frame1 = this.frames[frame1Index];
        const frame2 = this.frames[frame2Index];

        // Lerp between frames
        return this.lerpFrames(frame1, frame2, alpha);
      }

      lerpFrames(frame1, frame2, alpha) {
        if (!frame1 || !frame2) return frame1 || frame2;

        const interpolated = {
          pose_landmarks: [],
          left_hand_landmarks: [],
          right_hand_landmarks: []
        };

        // Lerp pose landmarks
        const pose1 = frame1.pose_landmarks || [];
        const pose2 = frame2.pose_landmarks || [];
        for (let i = 0; i < Math.max(pose1.length, pose2.length); i++) {
          const p1 = pose1[i] || { x: 0.5, y: 0.5, z: 0, confidence: 0 };
          const p2 = pose2[i] || { x: 0.5, y: 0.5, z: 0, confidence: 0 };
          
          interpolated.pose_landmarks.push({
            x: p1.x + (p2.x - p1.x) * alpha,
            y: p1.y + (p2.y - p1.y) * alpha,
            z: p1.z + (p2.z - p1.z) * alpha,
            confidence: p1.confidence + (p2.confidence - p1.confidence) * alpha
          });
        }

        // Lerp hand landmarks
        ['left_hand_landmarks', 'right_hand_landmarks'].forEach(handKey => {
          const hand1 = frame1[handKey] || [];
          const hand2 = frame2[handKey] || [];
          
          for (let i = 0; i < Math.max(hand1.length, hand2.length); i++) {
            const h1 = hand1[i] || { x: 0, y: 0, z: 0, visibility: 0 };
            const h2 = hand2[i] || { x: 0, y: 0, z: 0, visibility: 0 };
            
            interpolated[handKey].push({
              x: h1.x + (h2.x - h1.x) * alpha,
              y: h1.y + (h2.y - h1.y) * alpha,
              z: h1.z + (h2.z - h1.z) * alpha,
              visibility: h1.visibility + (h2.visibility - h1.visibility) * alpha
            });
          }
        });

        return interpolated;
      }

      stop() {
        this.isPlaying = false;
      }

      reset() {
        this.currentFrame = 0;
        this.lastUpdateTime = Date.now();
      }
    }

    /**
     * NeuralLinkAvatar - The main 3D avatar class
     */
    class NeuralLinkAvatar {
      constructor(containerId, options = {}) {
        this.container = typeof containerId === 'string' 
          ? document.getElementById(containerId) 
          : containerId;
        
        if (!this.container) {
          throw new Error('[NeuralLinkAvatar] Container not found');
        }

        this.options = {
          jointSize: 0.035,
          boneRadius: 0.015,
          fingerJointSize: 0.012,
          fingerBoneRadius: 0.008,
          glowIntensity: 0.8,
          pulseSpeed: 0.002,
          lerpFactor: 0.35,
          ...options
        };

        this.poseBridge = new PoseBridge();
        this.joints = {};
        this.bones = [];
        this.fingerBones = [];
        this.targetPositions = new Map();
        this.currentPositions = new Map();

        this.setupScene();
        this.buildAvatar();
        this.animate = this.animate.bind(this);
        this.onResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.onResize);
        this.handleResize();
        this.animate();
      }

      setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e1f);
        this.scene.fog = new THREE.Fog(0x0a0e1f, 5, 15);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
          38,
          this.container.clientWidth / this.container.clientHeight,
          0.1,
          100
        );
        this.camera.position.set(0, 1.4, 4.2);
        this.camera.lookAt(0, 1.1, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Professional 3-point lighting
        const ambientLight = new THREE.AmbientLight(0x4a5b8c, 0.5);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0x6bb6ff, 1.2);
        keyLight.position.set(5, 8, 6);
        keyLight.castShadow = true;
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xff8844, 0.4);
        fillLight.position.set(-4, 3, -2);
        this.scene.add(fillLight);

        const rimLight = new THREE.PointLight(0x22d3ee, 2.5, 15);
        rimLight.position.set(-3, 2, -3);
        this.scene.add(rimLight);

        // Subtle floor plane
        const floorGeometry = new THREE.CircleGeometry(3, 48);
        const floorMaterial = new THREE.MeshStandardMaterial({
          color: 0x0d1428,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.scene.add(floor);
      }

      buildAvatar() {
        console.log('[NeuralLinkAvatar] Building avatar...');
        
        this.avatarRoot = new THREE.Group();
        this.scene.add(this.avatarRoot);

        // Create materials
        this.createMaterials();
        
        // Build skeleton hierarchy
        this.buildHead();
        this.buildTorso();
        this.buildArms();
        this.buildLegs();
        
        console.log('[NeuralLinkAvatar] Avatar built with', Object.keys(this.joints).length, 'joints');
      }

      createMaterials() {
        // Frosted glass material for bones
        this.boneMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x88aaff,
          metalness: 0.1,
          roughness: 0.2,
          transparent: true,
          opacity: 0.6,
          transmission: 0.5,
          thickness: 0.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.3
        });

        // Crystalline joint material - pulsing glow
        this.jointMaterial = new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x0ea5e9,
          emissiveIntensity: 0.8,
          metalness: 0.7,
          roughness: 0.3
        });

        // Left arm materials (blue tint)
        this.leftArmBoneMaterial = this.boneMaterial.clone();
        this.leftArmBoneMaterial.color.setHex(0x6bb6ff);
        
        this.leftArmJointMaterial = this.jointMaterial.clone();
        this.leftArmJointMaterial.color.setHex(0x3b82f6);
        this.leftArmJointMaterial.emissive.setHex(0x2563eb);

        // Right arm materials (green tint)
        this.rightArmBoneMaterial = this.boneMaterial.clone();
        this.rightArmBoneMaterial.color.setHex(0x86efac);
        
        this.rightArmJointMaterial = this.jointMaterial.clone();
        this.rightArmJointMaterial.color.setHex(0x22c55e);
        this.rightArmJointMaterial.emissive.setHex(0x16a34a);

        // Leg material (gray/purple tint)
        this.legBoneMaterial = this.boneMaterial.clone();
        this.legBoneMaterial.color.setHex(0x9ca3af);
        
        this.legJointMaterial = this.jointMaterial.clone();
        this.legJointMaterial.color.setHex(0x6366f1);
        this.legJointMaterial.emissive.setHex(0x4f46e5);
      }

      createJoint(size, material, name) {
        // Octahedron for crystalline look
        const geometry = new THREE.OctahedronGeometry(size, 0);
        const joint = new THREE.Mesh(geometry, material);
        joint.name = name;
        joint.castShadow = true;
        this.joints[name] = joint;
        return joint;
      }

      createBone(length, radiusTop, radiusBottom, material, startJoint, endJoint) {
        // Tapered cylinder for bones
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 8, 1);
        const bone = new THREE.Mesh(geometry, material);
        bone.castShadow = true;
        
        this.bones.push({
          mesh: bone,
          startJoint: startJoint,
          endJoint: endJoint,
          length: length
        });
        
        return bone;
      }

      buildHead() {
        // Wireframe icosahedron head with glowing core
        const headGroup = new THREE.Group();
        headGroup.name = 'head';
        
        // Glowing core sphere
        const coreGeometry = new THREE.SphereGeometry(0.10, 20, 20);
        const coreMaterial = new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x22d3ee,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.9
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        headGroup.add(core);
        
        // Wireframe icosahedron shell
        const shellGeometry = new THREE.IcosahedronGeometry(0.16, 1);
        const shellMaterial = new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        });
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        headGroup.add(shell);
        
        headGroup.position.set(0, 1.65, 0);
        this.avatarRoot.add(headGroup);
        this.joints.head = headGroup;
        this.headCore = core;
        this.headShell = shell;
      }

      buildTorso() {
        // Neck joint
        const neck = this.createJoint(0.04, this.jointMaterial, 'neck');
        neck.position.set(0, 1.48, 0);
        this.avatarRoot.add(neck);
        
        // Upper chest joint
        const upperChest = this.createJoint(0.05, this.jointMaterial, 'upperChest');
        upperChest.position.set(0, 1.3, 0);
        this.avatarRoot.add(upperChest);
        
        // Chest/shoulders joint
        const chest = this.createJoint(0.06, this.jointMaterial, 'chest');
        chest.position.set(0, 1.15, 0);
        this.avatarRoot.add(chest);
        
        // Spine joint
        const spine = this.createJoint(0.05, this.jointMaterial, 'spine');
        spine.position.set(0, 0.85, 0);
        this.avatarRoot.add(spine);
        
        // Hips joint
        const hips = this.createJoint(0.06, this.jointMaterial, 'hips');
        hips.position.set(0, 0.6, 0);
        this.avatarRoot.add(hips);
        
        // Spine bones
        const neckBone = this.createBone(0.18, 0.025, 0.028, this.boneMaterial, 'neck', 'upperChest');
        neckBone.position.copy(neck.position).lerp(upperChest.position, 0.5);
        this.avatarRoot.add(neckBone);
        
        const upperSpine = this.createBone(0.15, 0.03, 0.032, this.boneMaterial, 'upperChest', 'chest');
        upperSpine.position.copy(upperChest.position).lerp(chest.position, 0.5);
        this.avatarRoot.add(upperSpine);
        
        const midSpine = this.createBone(0.3, 0.032, 0.035, this.boneMaterial, 'chest', 'spine');
        midSpine.position.copy(chest.position).lerp(spine.position, 0.5);
        this.avatarRoot.add(midSpine);
        
        const lowerSpine = this.createBone(0.25, 0.03, 0.032, this.boneMaterial, 'spine', 'hips');
        lowerSpine.position.copy(spine.position).lerp(hips.position, 0.5);
        this.avatarRoot.add(lowerSpine);
      }

      buildArms() {
        // LEFT ARM
        const leftShoulder = this.createJoint(0.048, this.leftArmJointMaterial, 'leftShoulder');
        leftShoulder.position.set(-0.20, 1.15, 0);
        this.avatarRoot.add(leftShoulder);
        
        const leftElbow = this.createJoint(0.042, this.leftArmJointMaterial, 'leftElbow');
        leftElbow.position.set(-0.42, 0.95, 0.08);
        this.avatarRoot.add(leftElbow);
        
        const leftWrist = this.createJoint(0.038, this.leftArmJointMaterial, 'leftWrist');
        leftWrist.position.set(-0.58, 0.78, 0.12);
        this.avatarRoot.add(leftWrist);
        
        // Left arm bones
        const leftUpperArmBone = this.createBone(0.28, 0.022, 0.018, this.leftArmBoneMaterial, 'leftShoulder', 'leftElbow');
        leftUpperArmBone.position.copy(leftShoulder.position).lerp(leftElbow.position, 0.5);
        this.avatarRoot.add(leftUpperArmBone);
        
        const leftForearmBone = this.createBone(0.25, 0.018, 0.015, this.leftArmBoneMaterial, 'leftElbow', 'leftWrist');
        leftForearmBone.position.copy(leftElbow.position).lerp(leftWrist.position, 0.5);
        this.avatarRoot.add(leftForearmBone);
        
        // LEFT HAND with full finger hierarchy
        this.buildHand('left', leftWrist.position, this.leftArmJointMaterial, this.leftArmBoneMaterial);
        
        // RIGHT ARM
        const rightShoulder = this.createJoint(0.048, this.rightArmJointMaterial, 'rightShoulder');
        rightShoulder.position.set(0.20, 1.15, 0);
        this.avatarRoot.add(rightShoulder);
        
        const rightElbow = this.createJoint(0.042, this.rightArmJointMaterial, 'rightElbow');
        rightElbow.position.set(0.42, 0.95, 0.08);
        this.avatarRoot.add(rightElbow);
        
        const rightWrist = this.createJoint(0.038, this.rightArmJointMaterial, 'rightWrist');
        rightWrist.position.set(0.58, 0.78, 0.12);
        this.avatarRoot.add(rightWrist);
        
        // Right arm bones
        const rightUpperArmBone = this.createBone(0.28, 0.022, 0.018, this.rightArmBoneMaterial, 'rightShoulder', 'rightElbow');
        rightUpperArmBone.position.copy(rightShoulder.position).lerp(rightElbow.position, 0.5);
        this.avatarRoot.add(rightUpperArmBone);
        
        const rightForearmBone = this.createBone(0.25, 0.018, 0.015, this.rightArmBoneMaterial, 'rightElbow', 'rightWrist');
        rightForearmBone.position.copy(rightElbow.position).lerp(rightWrist.position, 0.5);
        this.avatarRoot.add(rightForearmBone);
        
        // RIGHT HAND with full finger hierarchy
        this.buildHand('right', rightWrist.position, this.rightArmJointMaterial, this.rightArmBoneMaterial);
        
        // Connect shoulders to chest
        const leftShoulderBone = this.createBone(0.15, 0.02, 0.022, this.leftArmBoneMaterial, 'chest', 'leftShoulder');
        leftShoulderBone.position.copy(this.joints.chest.position).lerp(leftShoulder.position, 0.5);
        this.avatarRoot.add(leftShoulderBone);
        
        const rightShoulderBone = this.createBone(0.15, 0.02, 0.022, this.rightArmBoneMaterial, 'chest', 'rightShoulder');
        rightShoulderBone.position.copy(this.joints.chest.position).lerp(rightShoulder.position, 0.5);
        this.avatarRoot.add(rightShoulderBone);
      }

      buildHand(side, wristPos, jointMat, boneMat) {
        const xSign = side === 'left' ? -1 : 1;
        const baseX = wristPos.x + (xSign * 0.02);
        const baseY = wristPos.y - 0.05;
        const baseZ = wristPos.z + 0.03;

        // Hand palm base
        const palmBase = this.createJoint(this.options.fingerJointSize * 1.2, jointMat, `${side}PalmBase`);
        palmBase.position.set(baseX, baseY, baseZ);
        this.avatarRoot.add(palmBase);

        // 5 fingers, each with 3 segments (21 points total per hand in MediaPipe)
        const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'];
        
        fingerNames.forEach((fingerName, fingerIndex) => {
          const spreadAngle = (fingerIndex - 2) * 0.25; // -0.5 to +0.5 radians
          const fingerLength = fingerIndex === 0 ? 0.055 : 0.07; // Thumb shorter
          
          // 4 joints per finger (base at palm, then 3 segments)
          for (let segment = 0; segment < 4; segment++) {
            const jointName = `${side}Hand_${fingerName}_${segment}`;
            const progress = segment / 3;
            
            // Calculate position along finger
            const offsetX = Math.sin(spreadAngle) * 0.04 * progress;
            const offsetY = -fingerLength * progress;
            const offsetZ = Math.cos(spreadAngle) * 0.02 * progress + 0.01 * progress;
            
            const joint = this.createJoint(
              this.options.fingerJointSize * (1 - progress * 0.3),
              jointMat,
              jointName
            );
            joint.position.set(
              baseX + (xSign * offsetX),
              baseY + offsetY,
              baseZ + offsetZ
            );
            this.avatarRoot.add(joint);
            
            // Create bone between segments
            if (segment > 0) {
              const prevJointName = `${side}Hand_${fingerName}_${segment - 1}`;
              const prevJoint = this.joints[prevJointName];
              const segmentLength = fingerLength / 3;
              
              const bone = this.createBone(
                segmentLength,
                this.options.fingerBoneRadius,
                this.options.fingerBoneRadius * 0.8,
                boneMat,
                prevJointName,
                jointName
              );
              bone.position.copy(prevJoint.position).lerp(joint.position, 0.5);
              this.avatarRoot.add(bone);
              this.fingerBones.push(bone);
            }
          }
        });
      }

      buildLegs() {
        // LEFT LEG
        const leftHip = this.createJoint(0.045, this.legJointMaterial, 'leftHip');
        leftHip.position.set(-0.10, 0.58, 0);
        this.avatarRoot.add(leftHip);
        
        const leftKnee = this.createJoint(0.042, this.legJointMaterial, 'leftKnee');
        leftKnee.position.set(-0.11, 0.30, 0);
        this.avatarRoot.add(leftKnee);
        
        const leftAnkle = this.createJoint(0.038, this.legJointMaterial, 'leftAnkle');
        leftAnkle.position.set(-0.11, 0.05, 0.02);
        this.avatarRoot.add(leftAnkle);
        
        // Left leg bones
        const leftThigh = this.createBone(0.28, 0.025, 0.020, this.legBoneMaterial, 'leftHip', 'leftKnee');
        leftThigh.position.copy(leftHip.position).lerp(leftKnee.position, 0.5);
        this.avatarRoot.add(leftThigh);
        
        const leftShin = this.createBone(0.25, 0.020, 0.018, this.legBoneMaterial, 'leftKnee', 'leftAnkle');
        leftShin.position.copy(leftKnee.position).lerp(leftAnkle.position, 0.5);
        this.avatarRoot.add(leftShin);
        
        // RIGHT LEG
        const rightHip = this.createJoint(0.045, this.legJointMaterial, 'rightHip');
        rightHip.position.set(0.10, 0.58, 0);
        this.avatarRoot.add(rightHip);
        
        const rightKnee = this.createJoint(0.042, this.legJointMaterial, 'rightKnee');
        rightKnee.position.set(0.11, 0.30, 0);
        this.avatarRoot.add(rightKnee);
        
        const rightAnkle = this.createJoint(0.038, this.legJointMaterial, 'rightAnkle');
        rightAnkle.position.set(0.11, 0.05, 0.02);
        this.avatarRoot.add(rightAnkle);
        
        // Right leg bones
        const rightThigh = this.createBone(0.28, 0.025, 0.020, this.legBoneMaterial, 'rightHip', 'rightKnee');
        rightThigh.position.copy(rightHip.position).lerp(rightKnee.position, 0.5);
        this.avatarRoot.add(rightThigh);
        
        const rightShin = this.createBone(0.25, 0.020, 0.018, this.legBoneMaterial, 'rightKnee', 'rightAnkle');
        rightShin.position.copy(rightKnee.position).lerp(rightAnkle.position, 0.5);
        this.avatarRoot.add(rightShin);
        
        // Connect hips to pelvis
        const leftHipBone = this.createBone(0.12, 0.022, 0.025, this.legBoneMaterial, 'hips', 'leftHip');
        leftHipBone.position.copy(this.joints.hips.position).lerp(leftHip.position, 0.5);
        this.avatarRoot.add(leftHipBone);
        
        const rightHipBone = this.createBone(0.12, 0.022, 0.025, this.legBoneMaterial, 'hips', 'rightHip');
        rightHipBone.position.copy(this.joints.hips.position).lerp(rightHip.position, 0.5);
        this.avatarRoot.add(rightHipBone);
      }

      updateBonePositionAndRotation(boneInfo) {
        const startJoint = this.joints[boneInfo.startJoint];
        const endJoint = this.joints[boneInfo.endJoint];
        
        if (!startJoint || !endJoint) return;
        
        const bone = boneInfo.mesh;
        const direction = new THREE.Vector3().subVectors(
          endJoint.position,
          startJoint.position
        );
        
        const distance = direction.length();
        
        // Position at midpoint
        bone.position.copy(startJoint.position).add(direction.multiplyScalar(0.5));
        
        // Scale to match distance
        bone.scale.y = distance / boneInfo.length;
        
        // Rotate to point from start to end
        bone.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.normalize()
        );
      }

      applyPoseFrame(frame) {
        if (!frame || !frame.pose_landmarks) return;
        
        const pose = frame.pose_landmarks;
        const leftHand = frame.left_hand_landmarks || [];
        const rightHand = frame.right_hand_landmarks || [];
        
        // MediaPipe pose landmark indices
        const POSE_LANDMARKS = {
          nose: 0,
          leftShoulder: 11,
          rightShoulder: 12,
          leftElbow: 13,
          rightElbow: 14,
          leftWrist: 15,
          rightWrist: 16,
          leftHip: 23,
          rightHip: 24,
          leftKnee: 25,
          rightKnee: 26,
          leftAnkle: 27,
          rightAnkle: 28
        };

        // Convert normalized coordinates to 3D space
        const toWorld = (landmark, scale = 1.8) => {
          if (!landmark) return new THREE.Vector3(0, 0, 0);
          return new THREE.Vector3(
            (landmark.x - 0.5) * scale,
            (1 - landmark.y) * scale,
            landmark.z * scale * 0.5
          );
        };

        // Update targets for smooth lerping
        const updateTarget = (jointName, landmark) => {
          if (landmark && this.joints[jointName]) {
            const target = toWorld(landmark);
            this.targetPositions.set(jointName, target);
          }
        };

        // Map pose landmarks to joints
        if (pose.length >= 33) {
          updateTarget('head', pose[POSE_LANDMARKS.nose]);
          updateTarget('leftShoulder', pose[POSE_LANDMARKS.leftShoulder]);
          updateTarget('rightShoulder', pose[POSE_LANDMARKS.rightShoulder]);
          updateTarget('leftElbow', pose[POSE_LANDMARKS.leftElbow]);
          updateTarget('rightElbow', pose[POSE_LANDMARKS.rightElbow]);
          updateTarget('leftWrist', pose[POSE_LANDMARKS.leftWrist]);
          updateTarget('rightWrist', pose[POSE_LANDMARKS.rightWrist]);
          updateTarget('leftHip', pose[POSE_LANDMARKS.leftHip]);
          updateTarget('rightHip', pose[POSE_LANDMARKS.rightHip]);
          updateTarget('leftKnee', pose[POSE_LANDMARKS.leftKnee]);
          updateTarget('rightKnee', pose[POSE_LANDMARKS.rightKnee]);
          updateTarget('leftAnkle', pose[POSE_LANDMARKS.leftAnkle]);
          updateTarget('rightAnkle', pose[POSE_LANDMARKS.rightAnkle]);
        }

        // Map hand landmarks to fingers (21 points per hand)
        ['left', 'right'].forEach(side => {
          const handLandmarks = side === 'left' ? leftHand : rightHand;
          if (handLandmarks.length >= 21) {
            const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'];
            const fingerIndices = [
              [1, 2, 3, 4],      // Thumb
              [5, 6, 7, 8],      // Index
              [9, 10, 11, 12],   // Middle
              [13, 14, 15, 16],  // Ring
              [17, 18, 19, 20]   // Pinky
            ];

            fingerNames.forEach((fingerName, fingerIdx) => {
              fingerIndices[fingerIdx].forEach((lmIdx, segmentIdx) => {
                const jointName = `${side}Hand_${fingerName}_${segmentIdx + 1}`;
                const landmark = handLandmarks[lmIdx];
                
                if (landmark && this.joints[jointName]) {
                  const wrist = this.joints[`${side}Wrist`];
                  if (wrist) {
                    const handScale = 0.15;
                    const target = new THREE.Vector3(
                      wrist.position.x + (landmark.x - 0.5) * handScale * (side === 'left' ? -1 : 1),
                      wrist.position.y - landmark.y * handScale,
                      wrist.position.z + landmark.z * handScale
                    );
                    this.targetPositions.set(jointName, target);
                  }
                }
              });
            });
          }
        });

        // Apply smooth lerping to all joints
        this.targetPositions.forEach((target, jointName) => {
          const joint = this.joints[jointName];
          if (joint) {
            joint.position.lerp(target, this.options.lerpFactor);
          }
        });

        // Update all bone positions and rotations
        this.bones.forEach(boneInfo => {
          this.updateBonePositionAndRotation(boneInfo);
        });
      }

      async loadAndPlayPose(word) {
        console.log(`[NeuralLinkAvatar] Loading pose: ${word}`);
        const success = await this.poseBridge.loadPoseFile(word);
        
        if (success) {
          console.log(`[NeuralLinkAvatar] Playing "${word}" with ${this.poseBridge.frames.length} frames`);
        }
        
        return success;
      }

      animate() {
        requestAnimationFrame(this.animate);
        
        const time = Date.now();
        
        // Pulsing glow effect on joints
        const pulseValue = Math.sin(time * this.options.pulseSpeed) * 0.3 + 0.7;
        
        Object.values(this.joints).forEach(joint => {
          if (joint.material && joint.material.emissiveIntensity !== undefined) {
            joint.material.emissiveIntensity = this.options.glowIntensity * pulseValue;
          }
        });
        
        // Pulse head core
        if (this.headCore) {
          this.headCore.material.emissiveIntensity = 1.5 * pulseValue;
        }
        
        // Rotate head shell slowly
        if (this.headShell) {
          this.headShell.rotation.y += 0.005;
          this.headShell.rotation.x = Math.sin(time * 0.001) * 0.1;
        }
        
        // Get and apply current pose frame
        const frame = this.poseBridge.getInterpolatedFrame();
        if (frame) {
          this.applyPoseFrame(frame);
        }
        
        this.renderer.render(this.scene, this.camera);
      }

      handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }

      destroy() {
        window.removeEventListener('resize', this.onResize);
        this.poseBridge.stop();
        if (this.renderer) {
          this.renderer.dispose();
        }
        if (this.container && this.renderer && this.renderer.domElement) {
          this.container.removeChild(this.renderer.domElement);
        }
      }
    }

    // Export to window
    window.NeuralLinkAvatar = NeuralLinkAvatar;
    
    window.NeuralLinkAvatarAPI = {
      instance: null,
      
      mount(containerId, options) {
        if (this.instance) {
          this.instance.destroy();
        }
        this.instance = new NeuralLinkAvatar(containerId, options);
        console.log('[NeuralLinkAvatarAPI] Avatar mounted successfully');
        return this.instance;
      },
      
      async loadAndPlay(word) {
        if (!this.instance) {
          console.error('[NeuralLinkAvatarAPI] No instance mounted');
          return false;
        }
        return await this.instance.loadAndPlayPose(word);
      },
      
      stop() {
        if (this.instance) {
          this.instance.poseBridge.stop();
        }
      },
      
      reset() {
        if (this.instance) {
          this.instance.poseBridge.reset();
        }
      }
    };

    console.log('[NeuralLinkAvatar] Module loaded successfully');
  }
})();
