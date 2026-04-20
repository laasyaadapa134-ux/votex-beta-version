window.addEventListener('load', () => {
  console.log('===== ThreeIKAvatar.js LOADED =====');

  if (typeof window === 'undefined') {
    return;
  }

  function initVotexAvatar() {
    console.log('[initVotexAvatar] Starting...');

    // Check if THREE is loaded
    if (typeof window.THREE === 'undefined') {
      console.error('[ThreeIKAvatar] THREE library not found. Ensure the script tag for Three.js is included before ThreeIKAvatar.js.');
      return;
    }

    console.log('[initVotexAvatar] THREE already available, initializing immediately');
    initThreeIKAvatar();
  }

  function initThreeIKAvatar() {
    console.log('[initThreeIKAvatar] Starting initialization...');
    const THREE = window.THREE;

  const POSE = {
    nose: 0,
    leftShoulder: 11,
    rightShoulder: 12,
    leftElbow: 13,
    rightElbow: 14,
    leftWrist: 15,
    rightWrist: 16,
    leftHip: 23,
    rightHip: 24,
    leftIndex: 19,
    rightIndex: 20,
    leftPinky: 17,
    rightPinky: 18,
  };

  const HAND_GROUPS = {
    thumb: [1, 2, 3, 4],
    index: [5, 6, 7, 8],
    middle: [9, 10, 11, 12],
    ring: [13, 14, 15, 16],
    pinky: [17, 18, 19, 20],
  };

  class ThreeIKAvatar {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.getElementById(container) : container;
      if (!this.container) {
        throw new Error('ThreeIKAvatar container not found');
      }

      this.options = {
        targetFps: 60,
        limbRadius: 0.042,
        fingerRadius: 0.016,
        jointRadius: 0.028,
        avatarScale: 2.9,
        positionLerp: 0.45,
        fingerLerp: 0.72,
        ...options,
      };

      this.latestFrame = null;
      this.stream = [];
      this.streamIndex = 0;
      this.streamAccum = 0;
      this.isPlayingStream = false;
      this.clock = new THREE.Clock();
      this.frameInterval = 1 / this.options.targetFps;
      this.lastFrameTime = 0;
      this.tmpVector = new THREE.Vector3();
      this.tmpQuaternion = new THREE.Quaternion();
      this.tmpMatrix = new THREE.Matrix4();
      this.prevTime = performance.now();
      this.frameTargets = new Map();
      this.handBases = {
        left: this.createDefaultHandBase('left'),
        right: this.createDefaultHandBase('right'),
      };

      this.setupScene();
      this.setupRig();
      this.setupShell();
      this.onResize = this.handleResize.bind(this);
      window.addEventListener('resize', this.onResize);
      this.handleResize();
      this.animate = this.animate.bind(this);
      this.rafId = requestAnimationFrame(this.animate);
    }

    setupShell() {
      this.container.innerHTML = '';
      this.shell = document.createElement('div');
      this.shell.className = 'three-ik-avatar-shell';
      this.badge = document.createElement('div');
      this.badge.className = 'three-ik-avatar-badge';
      this.badge.textContent = '3D IK Avatar';
      this.overlay = document.createElement('div');
      this.overlay.className = 'three-ik-avatar-overlay';
      this.shell.appendChild(this.renderer.domElement);
      this.shell.appendChild(this.overlay);
      this.shell.appendChild(this.badge);
      this.container.appendChild(this.shell);
      
      console.log(`[setupShell] Avatar shell created and added to container`);
      console.log(`[setupShell] Container:`, this.container);
      console.log(`[setupShell] Renderer canvas size:`, this.renderer.domElement.width, 'x', this.renderer.domElement.height);
    }

    setupScene() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x08111f);

      this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      this.camera.position.set(0, 1.65, 6.6);  // RESTORED - avatar on screen
      this.camera.lookAt(0, 0.2, 0);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;

      const ambient = new THREE.HemisphereLight(0xbfe3ff, 0x05070b, 1.35);
      const key = new THREE.DirectionalLight(0xf8fbff, 1.2);
      key.position.set(4, 6, 5);
      const rim = new THREE.PointLight(0x22d3ee, 1.8, 20, 2);
      rim.position.set(-2.8, 2.6, 2.2);

      this.scene.add(ambient, key, rim);

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(2.2, 48),
        new THREE.MeshStandardMaterial({ color: 0x0b1220, transparent: true, opacity: 0.9 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.55;
      this.scene.add(floor);
    }

    setupRig() {
      this.avatarRoot = new THREE.Group();
      this.avatarRoot.position.set(0, -0.75, 0);
      this.scene.add(this.avatarRoot);

      this.joints = {};
      this.segments = [];

      const jointMaterial = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.18,
        metalness: 0.15,
        roughness: 0.42,
      });

      const bodyJointNames = [
        'hips', 'spine', 'chest', 'neck', 'head',
        'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist'
      ];

      bodyJointNames.forEach((name) => {
        const joint = new THREE.Mesh(
          new THREE.SphereGeometry(this.options.jointRadius, 18, 18),
          jointMaterial.clone()
        );
        joint.name = name;
        this.avatarRoot.add(joint);
        this.joints[name] = joint;
      });

      this.handJoints = { left: {}, right: {} };
      ['left', 'right'].forEach((side) => {
        for (let index = 0; index <= 20; index += 1) {
          const joint = new THREE.Mesh(
            new THREE.SphereGeometry(index === 0 ? 0.018 : 0.012, 14, 14),
            new THREE.MeshStandardMaterial({
              color: side === 'left' ? 0x7dd3fc : 0x86efac,
              emissive: side === 'left' ? 0x0ea5e9 : 0x16a34a,
              emissiveIntensity: 0.2,
              metalness: 0.08,
              roughness: 0.48,
            })
          );
          joint.visible = false;
          this.avatarRoot.add(joint);
          this.handJoints[side][index] = joint;
        }
      });

      const torsoMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x0b1b38,
        emissiveIntensity: 0.18,
        metalness: 0.12,
        roughness: 0.62,
      });

      this.bodyMeshes = {
        chest: new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.1, 10, 18), torsoMaterial),
        hips: new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.55, 8, 16), torsoMaterial.clone()),
        head: new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 28), new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0x94a3b8,
          emissiveIntensity: 0.25,
          metalness: 0.1,
          roughness: 0.6,
        })),
      };

      this.bodyMeshes.chest.position.set(0, 0.55, 0);
      this.bodyMeshes.hips.position.set(0, -0.3, 0);
      this.bodyMeshes.head.position.set(0, 1.52, 0.04);
      this.avatarRoot.add(this.bodyMeshes.chest, this.bodyMeshes.hips, this.bodyMeshes.head);

      this.createSegment('hips', 'spine', 0.11, 0x475569);
      this.createSegment('spine', 'chest', 0.12, 0x64748b);
      this.createSegment('chest', 'neck', 0.11, 0x64748b);
      this.createSegment('neck', 'head', 0.09, 0x94a3b8);
      this.createSegment('leftShoulder', 'leftElbow', this.options.limbRadius, 0x60a5fa);
      this.createSegment('leftElbow', 'leftWrist', this.options.limbRadius * 0.92, 0x38bdf8);
      this.createSegment('rightShoulder', 'rightElbow', this.options.limbRadius, 0x4ade80);
      this.createSegment('rightElbow', 'rightWrist', this.options.limbRadius * 0.92, 0x22c55e);

      ['left', 'right'].forEach((side) => {
        this.createSegment(`${side}Wrist`, `${side}Hand0`, 0.024, side === 'left' ? 0x7dd3fc : 0x86efac);
        Object.values(HAND_GROUPS).forEach((indices) => {
          let prev = 0;
          indices.forEach((index) => {
            this.createSegment(`${side}Hand${prev}`, `${side}Hand${index}`, this.options.fingerRadius, side === 'left' ? 0x93c5fd : 0xbbf7d0);
            prev = index;
          });
        });
      });

      this.resetToNeutralPose();
    }

    createSegment(startName, endName, radius, color) {
      const geometry = new THREE.CylinderGeometry(radius, radius, 1, 12);
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.08,
        metalness: 0.14,
        roughness: 0.44,
      });
      const mesh = new THREE.Mesh(geometry, material);
      this.avatarRoot.add(mesh);
      this.segments.push({ mesh, startName, endName });
    }

    createDefaultHandBase(side) {
      const x = side === 'left' ? -0.65 : 0.65;
      return {
        wrist: new THREE.Vector3(x, 0.62, 0.18),
        index: new THREE.Vector3(x + (side === 'left' ? -0.08 : 0.08), 0.68, 0.12),
        pinky: new THREE.Vector3(x + (side === 'left' ? 0.08 : -0.08), 0.65, 0.22),
        middle: new THREE.Vector3(x, 0.8, 0.1),
      };
    }

    resetToNeutralPose() {
      const neutral = {
        hips: new THREE.Vector3(0, 0, 0),
        spine: new THREE.Vector3(0, 0.36, 0),
        chest: new THREE.Vector3(0, 0.82, 0.02),
        neck: new THREE.Vector3(0, 1.14, 0.02),
        head: new THREE.Vector3(0, 1.44, 0.04),
        leftShoulder: new THREE.Vector3(-0.34, 0.95, 0.06),
        rightShoulder: new THREE.Vector3(0.34, 0.95, 0.06),
        leftElbow: new THREE.Vector3(-0.56, 0.72, 0.18),
        rightElbow: new THREE.Vector3(0.56, 0.72, 0.18),
        leftWrist: new THREE.Vector3(-0.66, 0.44, 0.22),
        rightWrist: new THREE.Vector3(0.66, 0.44, 0.22),
      };

      Object.entries(neutral).forEach(([name, position]) => {
        this.joints[name].position.copy(position);
      });

      this.applyDefaultHand('left');
      this.applyDefaultHand('right');
      this.updateSegments();
    }

    applyDefaultHand(side) {
      const base = this.handBases[side];
      const sideKey = side === 'left' ? -1 : 1;
      const anchors = {
        0: base.wrist.clone(),
        1: base.wrist.clone().add(new THREE.Vector3(sideKey * -0.06, 0.03, -0.03)),
        5: base.index.clone(),
        9: base.middle.clone(),
        13: base.middle.clone().add(new THREE.Vector3(-0.02 * sideKey, -0.01, 0.02)),
        17: base.pinky.clone(),
      };

      for (let index = 0; index <= 20; index += 1) {
        const joint = this.handJoints[side][index];
        joint.visible = true;
        if (anchors[index]) {
          joint.position.copy(anchors[index]);
          continue;
        }

        const fingerName = this.findFingerByIndex(index);
        const fingerIndices = HAND_GROUPS[fingerName];
        const startIndex = fingerIndices[0];
        const order = fingerIndices.indexOf(index);
        const anchorSource = anchors[startIndex] || anchors[0];
        const anchor = anchorSource.clone();
        anchor.y += 0.08 * (order + 1);
        anchor.x += sideKey * 0.01 * (fingerName === 'thumb' ? -order : 0.18 * (fingerIndices[0] - 9));
        anchor.z -= 0.02 * order;
        joint.position.copy(anchor);
      }
    }

    findFingerByIndex(index) {
      return Object.keys(HAND_GROUPS).find((name) => HAND_GROUPS[name].includes(index)) || 'middle';
    }

    setFrame(frame) {
      this.latestFrame = frame || null;
    }

    setStream(frames, fps = 60) {
      this.stream = Array.isArray(frames) ? frames.filter(Boolean) : [];
      this.streamIndex = 0;
      this.streamAccum = 0;
      this.isPlayingStream = this.stream.length > 0;
      if (fps > 0) {
        this.frameInterval = 1 / fps;
      }
    }

    stopStream() {
      this.isPlayingStream = false;
      this.stream = [];
      this.streamIndex = 0;
      this.streamAccum = 0;
    }

    clear() {
      this.setFrame(null);
      this.stopStream();
      this.resetToNeutralPose();
    }

    animate(now) {
      this.rafId = requestAnimationFrame(this.animate);
      const deltaSeconds = Math.min((now - this.prevTime) / 1000, 0.05);
      this.prevTime = now;

      if (this.isPlayingStream && this.stream.length > 0) {
        this.streamAccum += deltaSeconds;
        while (this.streamAccum >= this.frameInterval) {
          this.streamAccum -= this.frameInterval;
          this.latestFrame = this.stream[this.streamIndex];
          
          // Debug every 30 frames
          if (this.streamIndex % 30 === 0) {
            console.log(`[animate] Playing frame ${this.streamIndex}/${this.stream.length}`);
          }
          
          this.streamIndex = (this.streamIndex + 1) % this.stream.length;
        }
      }

      if (this.latestFrame) {
        this.applyMediaPipeFrame(this.latestFrame, deltaSeconds);
      }

      this.updateSegments();
      this.renderer.render(this.scene, this.camera);
      
      // Debug: Check scene content on first render
      if (!this._debuggedSceneContent && this.latestFrame) {
        console.log('[DEBUG] Scene content check:');
        console.log('  Scene children:', this.scene.children.length);
        console.log('  AvatarRoot children:', this.avatarRoot.children.length);
        console.log('  Renderer domElement size:', this.renderer.domElement.width, 'x', this.renderer.domElement.height);
        console.log('  Canvas parentNode:', this.renderer.domElement.parentNode);
        console.log('  Canvas style.display:', this.renderer.domElement.style.display);
        console.log('  Camera looking at origin by default (no lookAt called)');
        this._debuggedSceneContent = true;
      }
    }

    applyMediaPipeFrame(frame, deltaSeconds) {
      // Support both camelCase and snake_case naming (backend uses snake_case)
      const poseLandmarks = frame.poseLandmarks || frame.pose_landmarks || frame.pose || [];
      const leftHandLandmarks = frame.leftHandLandmarks || frame.left_hand_landmarks || frame.leftHand || [];
      const rightHandLandmarks = frame.rightHandLandmarks || frame.right_hand_landmarks || frame.rightHand || [];

      // Debug first frame
      if (!this._debuggedFirstFrame) {
        console.log(`[applyMediaPipeFrame] First frame:`, frame);
        console.log(`[applyMediaPipeFrame] poseLandmarks count: ${poseLandmarks.length}`);
        console.log(`[applyMediaPipeFrame] leftHandLandmarks count: ${leftHandLandmarks.length}`);
        console.log(`[applyMediaPipeFrame] rightHandLandmarks count: ${rightHandLandmarks.length}`);
        console.log(`[applyMediaPipeFrame] Sample landmarks:`, poseLandmarks.slice(0, 5));
        console.log(`[applyMediaPipeFrame] Nose (0):`, poseLandmarks[0]);
        console.log(`[applyMediaPipeFrame] LShoulder (11):`, poseLandmarks[11]);
        console.log(`[applyMediaPipeFrame] RShoulder (12):`, poseLandmarks[12]);
        console.log(`[applyMediaPipeFrame] LWrist (15):`, poseLandmarks[15]);
        console.log(`[applyMediaPipeFrame] RWrist (16):`, poseLandmarks[16]);
        this._debuggedFirstFrame = true;
      }

      if (poseLandmarks.length >= 25) {
        this.applyBodyFrame(poseLandmarks, deltaSeconds);
         
        // Debug: Log joint positions after first application
        if (!this._debuggedJointPositions) {
          console.log(`[DEBUG] Joint positions after applyBodyFrame:`);
          console.log(`  Nose joint:`, this.joints.head?.position);
          console.log(`  LShoulder joint:`, this.joints.leftShoulder?.position);
          console.log(`  RShoulder joint:`, this.joints.rightShoulder?.position);
          console.log(`  LWrist joint:`, this.joints.leftWrist?.position);
          console.log(`  RWrist joint:`, this.joints.rightWrist?.position);
          console.log(`  AvatarRoot position:`, this.avatarRoot.position);
          console.log(`  Camera position:`, this.camera.position);
          this._debuggedJointPositions = true;
        }
      } else {
        console.warn(`[applyMediaPipeFrame] Not enough pose landmarks: ${poseLandmarks.length} (need 25)`);
      }

      this.applyHandFrame('left', leftHandLandmarks, poseLandmarks, deltaSeconds);
      this.applyHandFrame('right', rightHandLandmarks, poseLandmarks, deltaSeconds);
      this.updateSegments();
    }

    applyBodyFrame(poseLandmarks, deltaSeconds) {
      const smoothing = 1 - Math.pow(1 - this.options.positionLerp, Math.max(1, deltaSeconds * 60));
      const leftHip = this.toAvatarVector(poseLandmarks[POSE.leftHip]);
      const rightHip = this.toAvatarVector(poseLandmarks[POSE.rightHip]);
      const leftShoulder = this.toAvatarVector(poseLandmarks[POSE.leftShoulder]);
      const rightShoulder = this.toAvatarVector(poseLandmarks[POSE.rightShoulder]);
      const leftElbowHint = this.toAvatarVector(poseLandmarks[POSE.leftElbow]);
      const rightElbowHint = this.toAvatarVector(poseLandmarks[POSE.rightElbow]);
      const leftWristTarget = this.toAvatarVector(poseLandmarks[POSE.leftWrist]);
      const rightWristTarget = this.toAvatarVector(poseLandmarks[POSE.rightWrist]);
      const nose = this.toAvatarVector(poseLandmarks[POSE.nose]);

      const hips = leftHip.clone().add(rightHip).multiplyScalar(0.5);
      const chest = leftShoulder.clone().add(rightShoulder).multiplyScalar(0.5);
      const spine = hips.clone().lerp(chest, 0.5);
      const neck = chest.clone().lerp(nose, 0.25);
      const head = neck.clone().add(new THREE.Vector3(0, 0.35, 0));  // Fixed offset above neck - head always attached to body

      this.lerpJoint('hips', hips, smoothing);
      this.lerpJoint('spine', spine, smoothing);
      this.lerpJoint('chest', chest, smoothing);
      this.lerpJoint('neck', neck, smoothing);
      this.lerpJoint('head', head, smoothing);
      this.lerpJoint('leftShoulder', leftShoulder, smoothing);
      this.lerpJoint('rightShoulder', rightShoulder, smoothing);

      const leftArm = this.solveTwoBoneIK(leftShoulder, leftWristTarget, leftElbowHint, 0.38, 0.34);
      const rightArm = this.solveTwoBoneIK(rightShoulder, rightWristTarget, rightElbowHint, 0.38, 0.34);

      this.lerpJoint('leftElbow', leftArm.elbow, smoothing);
      this.lerpJoint('leftWrist', leftArm.wrist, smoothing);
      this.lerpJoint('rightElbow', rightArm.elbow, smoothing);
      this.lerpJoint('rightWrist', rightArm.wrist, smoothing);

      this.bodyMeshes.chest.position.copy(this.joints.spine.position.clone().lerp(this.joints.chest.position, 0.55));
      
      // FIXED HEAD POSITION - Stick head directly above chest (ignore nose landmark completely)
      const chestPos = this.joints.chest.position;
      this.bodyMeshes.head.position.set(
        chestPos.x,           // Same X as chest
        chestPos.y + 0.72,    // Fixed offset above chest
        chestPos.z            // Same Z as chest
      );
      
      this.bodyMeshes.hips.position.copy(this.joints.hips.position.clone().add(new THREE.Vector3(0, -0.08, 0)));
    }

    applyHandFrame(side, handLandmarks, poseLandmarks, deltaSeconds) {
      const fingerSmoothing = 1 - Math.pow(1 - this.options.fingerLerp, Math.max(1, deltaSeconds * 60));
      const wristJointName = side === 'left' ? 'leftWrist' : 'rightWrist';
      const wristTarget = this.joints[wristJointName].position.clone();

      if (!Array.isArray(handLandmarks) || handLandmarks.length < 21) {
        this.applyDefaultHand(side);
        return;
      }

      const sideKey = side === 'left' ? 1 : -1;  // Inverted to fix backward palms
      const root = this.toAvatarVector(handLandmarks[0]);
      const indexBase = this.toAvatarVector(handLandmarks[5]);
      const pinkyBase = this.toAvatarVector(handLandmarks[17]);
      const middleBase = this.toAvatarVector(handLandmarks[9]);
      const palmScale = Math.max(indexBase.distanceTo(pinkyBase), 0.08);

      const xAxis = indexBase.clone().sub(pinkyBase).normalize().multiplyScalar(sideKey);
      const yAxis = middleBase.clone().sub(root).normalize();
      const zAxis = new THREE.Vector3().crossVectors(yAxis, xAxis).normalize();  // Swap cross product order for palm orientation

      for (let index = 0; index <= 20; index += 1) {
        const landmark = handLandmarks[index];
        const jointName = `${side}Hand${index}`;
        const joint = this.resolveHandJoint(jointName, side, index);
        joint.visible = true;

        const normalized = this.toLocalHandVector(landmark, handLandmarks[0], palmScale, sideKey);
        const worldTarget = wristTarget.clone()
          .addScaledVector(xAxis, normalized.x)
          .addScaledVector(yAxis, normalized.y)
          .addScaledVector(zAxis, normalized.z);

        joint.position.lerp(worldTarget, fingerSmoothing);
      }

      const wristJoint = this.handJoints[side][0];
      wristJoint.position.lerp(wristTarget, fingerSmoothing * 0.9);
      this.handBases[side] = {
        wrist: wristJoint.position.clone(),
        index: this.handJoints[side][5].position.clone(),
        pinky: this.handJoints[side][17].position.clone(),
        middle: this.handJoints[side][9].position.clone(),
      }; 
    }

    resolveHandJoint(jointName, side, index) {
      if (!this.joints[jointName]) {
        this.joints[jointName] = this.handJoints[side][index];
      }
      return this.handJoints[side][index];
    }

    toLocalHandVector(point, wrist, palmScale, sideKey) {
  const dx = ((point.x || 0) - (wrist.x || 0)) * this.options.avatarScale * 1.6;
  const dy = (((wrist.y || 0) - (point.y || 0))) * this.options.avatarScale * 1.9;
  const dz = ((wrist.z || 0) - (point.z || 0)) * this.options.avatarScale * 1.2;
  return new THREE.Vector3(dx * sideKey, dy, dz).multiplyScalar(Math.max(palmScale * 3.6, 1));
}

    toAvatarVector(point) {
      if (!point) {
        return new THREE.Vector3();
      }

      let rawX = point.x || 0;
      let rawY = point.y || 0;
      let rawZ = point.z || 0;

      // Auto-Detect and Normalize
      if (rawX > 2 || rawY > 2) {
        rawX /= 640;
        rawY /= 480;
      }

      // Center and Vertical Flip
      rawX -= 0.5;
      rawY = 0.5 - rawY;

      // Scale for Visibility
      const VIEW_SCALE = 1.4;
      rawX *= VIEW_SCALE;
      rawY *= VIEW_SCALE;
      rawZ *= VIEW_SCALE * 0.8;

      // Clamp Values (adjusted for new scale)
      rawX = Math.max(-2, Math.min(2, rawX));
      rawY = Math.max(-2, Math.min(2, rawY));
      rawZ = Math.max(-1.5, Math.min(1.5, rawZ));

      return new THREE.Vector3(rawX, rawY, rawZ);
    }

    lerpJoint(name, target, alpha) {
      this.joints[name].position.lerp(target, alpha);
    }

    solveTwoBoneIK(root, target, hint, upperLength, lowerLength) {
      const toTarget = target.clone().sub(root);
      const distance = THREE.MathUtils.clamp(toTarget.length(), 0.02, upperLength + lowerLength - 0.0001);
      const direction = toTarget.normalize();

      const hintDir = hint.clone().sub(root);
      const planeNormal = new THREE.Vector3().crossVectors(direction, hintDir).normalize();
      if (planeNormal.lengthSq() < 1e-6) {
        planeNormal.set(0, 0, 1);
      }

      const bendDir = new THREE.Vector3().crossVectors(planeNormal, direction).normalize();
      const reach = (upperLength * upperLength - lowerLength * lowerLength + distance * distance) / (2 * distance);
      const height = Math.sqrt(Math.max(upperLength * upperLength - reach * reach, 0));
      const elbow = root.clone()
        .addScaledVector(direction, reach)
        .addScaledVector(bendDir, height);

      const wrist = root.clone().addScaledVector(direction, distance);
      return { elbow, wrist };
    }

    updateSegments() {
      this.segments.forEach(({ mesh, startName, endName }) => {
        const start = this.getJointPosition(startName);
        const end = this.getJointPosition(endName);
        if (!start || !end) {
          mesh.visible = false;
          return;
        }

        const dir = end.clone().sub(start);
        const length = dir.length();
        if (length < 1e-5) {
          mesh.visible = false;
          return;
        }

        mesh.visible = true;
        const mid = start.clone().add(end).multiplyScalar(0.5);
        mesh.position.copy(mid);
        mesh.scale.set(1, length, 1);
        this.tmpQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        mesh.setRotationFromQuaternion(this.tmpQuaternion);
      });
    }

    getJointPosition(name) {
      if (this.joints[name]) {
        return this.joints[name].position;
      }

      const handMatch = name.match(/^(left|right)Hand(\d+)$/);
      if (handMatch) {
        return this.handJoints[handMatch[1]][Number(handMatch[2])].position;
      }

      return null;
    }

    handleResize() {
      const width = this.container.clientWidth || 640;
      const height = Math.max(460, Math.round(width * 0.72));
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
      if (this.shell) {
        this.shell.style.height = `${height}px`;
      }
    }

    async loadAndPlayPose(word) {
      try {
        const upperWord = word.toUpperCase();
        console.log(`[loadAndPlayPose] Fetching: /poses/${upperWord}.pose`);
        const response = await fetch(`/poses/${upperWord}.pose`);
        
        if (!response.ok) {
          throw new Error(`Failed to load pose file for "${word}": ${response.status} ${response.statusText}`);
        }

        const poseData = await response.json();
        console.log(`[loadAndPlayPose] Loaded pose data:`, poseData);
        console.log(`[loadAndPlayPose] FPS: ${poseData.fps}, Total frames: ${poseData.total_frames}`);
        
        if (!poseData.frames || !Array.isArray(poseData.frames) || poseData.frames.length === 0) {
          throw new Error(`Pose file for "${word}" has no frames`);
        }
        
        console.log(`[loadAndPlayPose] Processing ${poseData.frames.length} frames...`);

        // Convert pose file format to MediaPipe format
        const convertedFrames = poseData.frames.map(frame => {
          const landmarks = frame.pose_landmarks || []; // Ensure pose_landmarks is used

          // Map 17-landmark format to 33-landmark MediaPipe format
          const poseLandmarks = Array(33).fill(null).map((_, i) => {
            let sourceLandmark = null;

            // Mapping 17 landmarks to MediaPipe 33 landmarks
            if (i === 0 && landmarks[0]) sourceLandmark = landmarks[0]; // nose
            else if (i === 11 && landmarks[2]) sourceLandmark = landmarks[2]; // left shoulder
            else if (i === 12 && landmarks[5]) sourceLandmark = landmarks[5]; // right shoulder
            else if (i === 13 && landmarks[3]) sourceLandmark = landmarks[3]; // left elbow
            else if (i === 14 && landmarks[6]) sourceLandmark = landmarks[6]; // right elbow
            else if (i === 15 && landmarks[4]) sourceLandmark = landmarks[4]; // left wrist
            else if (i === 16 && landmarks[7]) sourceLandmark = landmarks[7]; // right wrist
            else if (i === 23 && landmarks[8]) sourceLandmark = landmarks[8]; // left hip
            else if (i === 24 && landmarks[11]) sourceLandmark = landmarks[11]; // right hip
            else if (i === 25 && landmarks[9]) sourceLandmark = landmarks[9]; // left knee
            else if (i === 26 && landmarks[12]) sourceLandmark = landmarks[12]; // right knee
            else if (i === 27 && landmarks[10]) sourceLandmark = landmarks[10]; // left ankle
            else if (i === 28 && landmarks[13]) sourceLandmark = landmarks[13]; // right ankle

            if (sourceLandmark) {
              return {
                x: sourceLandmark.x || 0,
                y: sourceLandmark.y || 0,
                z: sourceLandmark.z || 0,
                visibility: sourceLandmark.confidence || sourceLandmark.visibility || 1.0
              };
            }
          });

          return poseLandmarks;
        });

        const fps = poseData.fps || 30;
        console.log(`[loadAndPlayPose] Converted ${convertedFrames.length} frames`);
        console.log(`[loadAndPlayPose] Sample frame 0:`, convertedFrames[0]);
        console.log(`[loadAndPlayPose] Calling setStream with ${convertedFrames.length} frames @ ${fps} fps`);
        
        this.setStream(convertedFrames, fps);
        
        console.log(`[loadAndPlayPose] Stream set. isPlayingStream:`, this.isPlayingStream);
        console.log(`[loadAndPlayPose] Stream length:`, this.stream.length);
        console.log(`[loadAndPlayPose] SUCCESS - Loaded and playing "${word}" (${convertedFrames.length} frames @ ${fps} fps)`);
        return true;
      } catch (error) {
        console.error(`[loadAndPlayPose] ERROR loading pose for "${word}":`, error);
        return false;
      }
    }

    destroy() {
      cancelAnimationFrame(this.rafId);
      window.removeEventListener('resize', this.onResize);
      this.renderer.dispose();
      if (this.shell && this.container.contains(this.shell)) {
        this.container.removeChild(this.shell);
      }
    }
  }

  window.ThreeIKAvatar = ThreeIKAvatar;

  window.VOTEXMediaPipeAvatar = {
    instance: null,
    mount(containerId, options) {
      if (this.instance) {
        this.instance.destroy();
      }
      this.instance = new ThreeIKAvatar(containerId, options);
      return this.instance;
    },
    setFrame(frame) {
      if (!this.instance) {
        return;
      }
      this.instance.setFrame(frame);
    },
    setStream(frames, fps) {
      if (!this.instance) {
        return;
      }
      this.instance.setStream(frames, fps);
    },
    async loadAndPlayPose(word) {
      if (!this.instance) {
        console.error('[VOTEXMediaPipeAvatar] ERROR - ThreeIKAvatar not mounted. Call mount() first.');
        return false;
      }
      return await this.instance.loadAndPlayPose(word);
    },
    clear() {
      if (!this.instance) {
        return;
      }
      this.instance.clear();
    },
  };
  
  // CRITICAL: Set readiness flag and broadcast
  console.log('[ThreeIKAvatar] Setting window.VotexAvatarIsActuallyReady = true');
  window.VotexAvatarIsActuallyReady = true;
  console.log('[ThreeIKAvatar] Dispatching VotexAvatarReady event...');
  window.dispatchEvent(new CustomEvent('VotexAvatarReady'));
  console.log('3D System: Ready and Broadcasting.');
  //alert('3D System: Ready and Broadcasting!');
  } // End initThreeIKAvatar function
  
  // Manual Trigger
  window.forceInitAvatar = function () {
    console.log('[ThreeIKAvatar] Manual initialization triggered.');
    initVotexAvatar();
  };

  // Start initialization
  initVotexAvatar();
});