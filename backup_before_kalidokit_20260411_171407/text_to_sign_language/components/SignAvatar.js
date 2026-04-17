class SignAvatar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.token = 0;
    this.rafId = null;
    this.defaultDuration = 900;
    this.loopDelay = 220;
    this.upperArmLength = 58;
    this.forearmLength = 60;
    this.refs = null;
    this.stageReady = false;
    this.neutralPose = this.makeFrame({
      motion: { path: '', accent: 'cyan' },
      leftHand: { x: 188, y: 232, rotate: -12, shape: 'open', motion: '' },
      rightHand: { x: 232, y: 232, rotate: 12, shape: 'open', motion: '' },
      duration: this.defaultDuration
    });
    this.currentPose = this.clonePose(this.neutralPose);
    this.currentShapes = { left: '', right: '' };
  }

  async displaySentence(words, options = {}) {
    const normalizedWords = words.map((word) => word.toLowerCase().trim()).filter(Boolean);
    const loop = options.loop !== false;
    const token = ++this.token;

    if (normalizedWords.length === 0) {
      this.clear();
      return;
    }

    this.ensureStage();
    const frames = this.getFramesForWords(normalizedWords);

    do {
      for (const frame of frames) {
        if (token !== this.token) {
          return;
        }

        await this.animatePose(frame, frame.duration || this.defaultDuration, token);
      }

      if (!loop || token !== this.token) {
        return;
      }

      await this.pause(this.loopDelay, token);
    } while (token === this.token);
  }

  async showWord(word) {
    const normalizedWord = word.toLowerCase().trim();
    const token = ++this.token;

    this.ensureStage();
    const frames = this.getFramesForWords([normalizedWord]);

    for (const frame of frames) {
      if (token !== this.token) {
        return;
      }

      await this.animatePose(frame, frame.duration || this.defaultDuration, token);
    }
  }

  stop() {
    this.token += 1;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  clear() {
    this.stop();
    this.container.innerHTML = '';
    this.refs = null;
    this.stageReady = false;
    this.currentPose = this.clonePose(this.neutralPose);
  }

  ensureStage() {
    if (this.stageReady && this.refs) {
      return;
    }

    this.container.innerHTML = `
      <div class="avatar-stage">
        <div class="avatar-screen">
          <svg class="sign-avatar-figure" viewBox="0 0 420 480" xmlns="http://www.w3.org/2000/svg" aria-label="Animated sign avatar">
            <defs>
              <linearGradient id="avatarGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#312e81" />
                <stop offset="100%" stop-color="#0f172a" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="420" height="480" rx="28" fill="url(#avatarGlow)" />
            <circle cx="210" cy="96" r="118" class="avatar-aura" />
            <path class="avatar-motion avatar-motion--cyan" data-role="motion" d="" />
            <path class="avatar-head-outline" d="M 180 66 C 192 40 228 38 244 60 C 258 78 258 112 244 132 C 230 152 196 154 182 132 C 168 110 166 84 180 66 Z" />
            <path class="avatar-eye" d="M 189 90 Q 199 84 208 90" />
            <path class="avatar-eye" d="M 212 90 Q 222 84 231 90" />
            <path class="avatar-mouth" d="M 198 120 Q 210 128 222 120" />
            <path class="avatar-torso" d="M 152 178 L 268 178 L 305 420 L 165 432 L 138 222 Z" />
            <line class="avatar-arm avatar-upper-arm" data-role="upper-left" />
            <line class="avatar-arm avatar-forearm" data-role="forearm-left" />
            <circle class="avatar-joint" data-role="elbow-left" r="4.5" />
            <g class="avatar-hand-anchor" data-role="hand-left"></g>
            <line class="avatar-arm avatar-upper-arm" data-role="upper-right" />
            <line class="avatar-arm avatar-forearm" data-role="forearm-right" />
            <circle class="avatar-joint" data-role="elbow-right" r="4.5" />
            <g class="avatar-hand-anchor" data-role="hand-right"></g>
            <path class="avatar-leg" d="M 165 432 L 140 474" />
            <path class="avatar-leg avatar-leg--right" d="M 305 420 L 344 478" />
          </svg>
        </div>
      </div>
    `;

    this.refs = {
      motion: this.container.querySelector('[data-role="motion"]'),
      upperLeft: this.container.querySelector('[data-role="upper-left"]'),
      forearmLeft: this.container.querySelector('[data-role="forearm-left"]'),
      elbowLeft: this.container.querySelector('[data-role="elbow-left"]'),
      handLeft: this.container.querySelector('[data-role="hand-left"]'),
      upperRight: this.container.querySelector('[data-role="upper-right"]'),
      forearmRight: this.container.querySelector('[data-role="forearm-right"]'),
      elbowRight: this.container.querySelector('[data-role="elbow-right"]'),
      handRight: this.container.querySelector('[data-role="hand-right"]')
    };

    this.stageReady = true;
    this.applyPose(this.currentPose);
  }

  async animatePose(targetPose, duration, token) {
    const startPose = this.clonePose(this.currentPose);
    const finalPose = this.clonePose(targetPose);
    const startedAt = performance.now();

    return new Promise((resolve) => {
      const step = (now) => {
        if (token !== this.token) {
          resolve();
          return;
        }

        const elapsed = now - startedAt;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOut(progress);
        const pose = this.interpolatePose(startPose, finalPose, eased, elapsed);

        this.applyPose(pose);

        if (progress < 1) {
          this.rafId = requestAnimationFrame(step);
        } else {
          this.rafId = null;
          this.currentPose = this.clonePose(finalPose);
          this.applyPose(this.currentPose);
          resolve();
        }
      };

      this.rafId = requestAnimationFrame(step);
    });
  }

  applyPose(pose) {
    if (!this.refs) {
      return;
    }

    this.updateMotionPath(pose.motion);
    this.updateSide('left', pose.leftHand);
    this.updateSide('right', pose.rightHand);
  }

  updateMotionPath(motion) {
    if (!this.refs.motion) {
      return;
    }

    this.refs.motion.setAttribute('d', motion && motion.path ? motion.path : '');
    this.refs.motion.setAttribute('class', `avatar-motion avatar-motion--${motion && motion.accent ? motion.accent : 'cyan'}`);
    this.refs.motion.style.opacity = motion && motion.path ? '0.8' : '0';
  }

  updateSide(side, hand) {
    const shoulder = this.getShoulder(side);
    const elbow = this.getElbow(shoulder, hand, side);
    const upperRef = side === 'left' ? this.refs.upperLeft : this.refs.upperRight;
    const forearmRef = side === 'left' ? this.refs.forearmLeft : this.refs.forearmRight;
    const elbowRef = side === 'left' ? this.refs.elbowLeft : this.refs.elbowRight;
    const handRef = side === 'left' ? this.refs.handLeft : this.refs.handRight;

    this.setLine(upperRef, shoulder.x, shoulder.y, elbow.x, elbow.y);
    this.setLine(forearmRef, elbow.x, elbow.y, hand.x, hand.y);
    elbowRef.setAttribute('cx', elbow.x.toFixed(2));
    elbowRef.setAttribute('cy', elbow.y.toFixed(2));

    if (this.currentShapes[side] !== hand.shape) {
      handRef.innerHTML = this.buildHandMarkup(side, hand.shape);
      this.currentShapes[side] = hand.shape;
    }

    handRef.setAttribute('transform', `translate(${hand.x.toFixed(2)} ${hand.y.toFixed(2)}) rotate(${hand.rotate.toFixed(2)})`);
  }

  buildHandMarkup(side, shape) {
    const palmClass = side === 'right' ? 'avatar-hand-palm avatar-hand-palm--right' : 'avatar-hand-palm';
    return `
      <ellipse class="${palmClass}" cx="0" cy="0" rx="12" ry="16" />
      ${this.buildFingers(shape)}
    `;
  }

  interpolatePose(startPose, targetPose, progress, elapsed) {
    return {
      duration: targetPose.duration,
      motion: targetPose.motion,
      leftHand: this.interpolateHand(startPose.leftHand, targetPose.leftHand, progress, elapsed, 'left'),
      rightHand: this.interpolateHand(startPose.rightHand, targetPose.rightHand, progress, elapsed, 'right')
    };
  }

  interpolateHand(startHand, targetHand, progress, elapsed, side) {
    const base = {
      x: this.lerp(startHand.x, targetHand.x, progress),
      y: this.lerp(startHand.y, targetHand.y, progress),
      rotate: this.lerp(startHand.rotate, targetHand.rotate, progress),
      elbowOut: this.lerp(startHand.elbowOut || 0, targetHand.elbowOut || 0, progress),
      shape: targetHand.shape,
      motion: targetHand.motion
    };
    const offset = this.getMotionOffset(targetHand.motion, elapsed, side);

    return {
      ...base,
      x: base.x + offset.x,
      y: base.y + offset.y,
      rotate: base.rotate + offset.rotate
    };
  }

  getMotionOffset(motion, elapsed, side) {
    const direction = side === 'left' ? -1 : 1;
    const phase = elapsed / 1000;

    switch (motion) {
      case 'wave':
        return {
          x: 4 * direction * Math.sin(phase * 10),
          y: -10 * Math.abs(Math.sin(phase * 5)),
          rotate: 18 * Math.sin(phase * 10)
        };
      case 'orbit':
        return {
          x: 12 * direction * Math.cos(phase * 8),
          y: 10 * Math.sin(phase * 8),
          rotate: 12 * Math.sin(phase * 8)
        };
      case 'pulse':
        return {
          x: 8 * direction * Math.sin(phase * 6),
          y: -6 * Math.abs(Math.sin(phase * 6)),
          rotate: 6 * Math.sin(phase * 6)
        };
      case 'point':
        return {
          x: 24 * direction * Math.max(0, Math.sin(phase * 5)),
          y: -8 * Math.max(0, Math.sin(phase * 5)),
          rotate: 8 * Math.sin(phase * 5)
        };
      case 'sweep':
        return {
          x: 16 * direction * Math.sin(phase * 4),
          y: 10 * Math.sin(phase * 8),
          rotate: 16 * Math.sin(phase * 4)
        };
      case 'nod':
        return {
          x: 0,
          y: 10 * Math.abs(Math.sin(phase * 8)),
          rotate: 4 * Math.sin(phase * 8)
        };
      case 'tap':
        return {
          x: 0,
          y: 12 * Math.abs(Math.sin(phase * 10)),
          rotate: -8 * Math.abs(Math.sin(phase * 10))
        };
      case 'chestTap':
        return {
          x: -4 * direction * Math.abs(Math.sin(phase * 8)),
          y: 6 * Math.abs(Math.sin(phase * 8)),
          rotate: -4 * direction * Math.sin(phase * 8)
        };
      case 'nameTap':
        return {
          x: 6 * direction * Math.sin(phase * 9),
          y: 2 * Math.sin(phase * 9),
          rotate: 4 * direction * Math.sin(phase * 9)
        };
      case 'question':
        return {
          x: 9 * direction * Math.sin(phase * 8),
          y: 4 * Math.sin(phase * 16),
          rotate: 8 * direction * Math.sin(phase * 8)
        };
      case 'your':
        return {
          x: 16 * direction * Math.max(0, Math.sin(phase * 4.5)),
          y: 2 * Math.sin(phase * 4.5),
          rotate: 5 * direction * Math.sin(phase * 4.5)
        };
      case 'doing':
        return {
          x: 6 * direction * Math.sin(phase * 10),
          y: -10 * Math.abs(Math.sin(phase * 5)),
          rotate: 10 * direction * Math.sin(phase * 10)
        };
      default:
        return { x: 0, y: 0, rotate: 0 };
    }
  }

  getFramesForWords(words) {
    const phraseKey = words.join(' ');
    const phraseFrames = this.getPhraseFrames(phraseKey);

    if (phraseFrames) {
      return phraseFrames;
    }

    const frames = [];
    let index = 0;

    while (index < words.length) {
      const phraseMatch = this.matchPhrase(words, index);

      if (phraseMatch) {
        frames.push(...phraseMatch.frames);
        index += phraseMatch.length;
        continue;
      }

      frames.push(...this.getWordFrames(words[index]));
      index += 1;
    }

    return frames;
  }

  matchPhrase(words, startIndex) {
    const phrases = ['what are you doing', 'what is your name', 'what your name', 'my name is', 'my name', 'how are you'];

    for (const phrase of phrases) {
      const parts = phrase.split(' ');
      const candidate = words.slice(startIndex, startIndex + parts.length).join(' ');

      if (candidate === phrase) {
        return {
          length: parts.length,
          frames: this.getPhraseFrames(phrase)
        };
      }
    }

    return null;
  }

  getPhraseFrames(phraseKey) {
    const phrases = {
      'what are you doing': [
        this.makeFrame({
          motion: { path: 'M 170 212 Q 210 244 250 212', accent: 'violet' },
          leftHand: { x: 188, y: 214, rotate: -14, shape: 'open', motion: 'question', elbowOut: 14 },
          rightHand: { x: 232, y: 214, rotate: 14, shape: 'open', motion: 'question', elbowOut: 14 },
          duration: 760
        }),
        this.makeFrame({
          motion: { path: 'M 244 186 Q 304 164 348 142', accent: 'cyan' },
          leftHand: { x: 184, y: 232, rotate: -10, shape: 'open', motion: '', elbowOut: 0 },
          rightHand: { x: 248, y: 184, rotate: 18, shape: 'point', motion: 'point', elbowOut: 12 },
          duration: 840
        }),
        this.makeFrame({
          motion: { path: 'M 184 226 C 196 202 224 202 236 226', accent: 'gold' },
          leftHand: { x: 192, y: 224, rotate: -10, shape: 'fist', motion: 'doing', elbowOut: 10 },
          rightHand: { x: 228, y: 224, rotate: 10, shape: 'fist', motion: 'doing', elbowOut: 10 },
          duration: 920
        })
      ],
      'what is your name': [
        this.makeFrame({
          motion: { path: 'M 170 212 Q 210 244 250 212', accent: 'violet' },
          leftHand: { x: 188, y: 214, rotate: -14, shape: 'open', motion: 'question', elbowOut: 14 },
          rightHand: { x: 232, y: 214, rotate: 14, shape: 'open', motion: 'question', elbowOut: 14 },
          duration: 760
        }),
        this.makeFrame({
          motion: { path: 'M 244 188 Q 300 176 340 166', accent: 'cyan' },
          leftHand: { x: 186, y: 232, rotate: -10, shape: 'open', motion: '', elbowOut: 0 },
          rightHand: { x: 246, y: 188, rotate: 8, shape: 'flat', motion: 'your', elbowOut: 14 },
          duration: 760
        }),
        this.makeFrame({
          motion: { path: 'M 186 204 L 236 204', accent: 'violet' },
          leftHand: { x: 192, y: 204, rotate: -22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          rightHand: { x: 228, y: 204, rotate: 22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          duration: 900
        })
      ],
      'what your name': [
        this.makeFrame({
          motion: { path: 'M 170 212 Q 210 244 250 212', accent: 'violet' },
          leftHand: { x: 188, y: 214, rotate: -14, shape: 'open', motion: 'question', elbowOut: 14 },
          rightHand: { x: 232, y: 214, rotate: 14, shape: 'open', motion: 'question', elbowOut: 14 },
          duration: 760
        }),
        this.makeFrame({
          motion: { path: 'M 244 188 Q 300 176 340 166', accent: 'cyan' },
          leftHand: { x: 186, y: 232, rotate: -10, shape: 'open', motion: '', elbowOut: 0 },
          rightHand: { x: 246, y: 188, rotate: 8, shape: 'flat', motion: 'your', elbowOut: 14 },
          duration: 760
        }),
        this.makeFrame({
          motion: { path: 'M 186 204 L 236 204', accent: 'violet' },
          leftHand: { x: 192, y: 204, rotate: -22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          rightHand: { x: 228, y: 204, rotate: 22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          duration: 900
        })
      ],
      'how are you': [
        this.makeFrame({
          motion: { path: 'M 160 232 C 184 194 236 194 260 232', accent: 'cyan' },
          leftHand: { x: 182, y: 228, rotate: -20, shape: 'fist', motion: 'orbit' },
          rightHand: { x: 238, y: 228, rotate: 20, shape: 'fist', motion: 'orbit' },
          duration: 820
        }),
        this.makeFrame({
          motion: { path: 'M 178 210 Q 210 238 242 210', accent: 'violet' },
          leftHand: { x: 190, y: 214, rotate: -10, shape: 'open', motion: 'pulse' },
          rightHand: { x: 230, y: 214, rotate: 10, shape: 'open', motion: 'pulse' },
          duration: 780
        }),
        this.makeFrame({
          motion: { path: 'M 244 186 Q 302 164 348 138', accent: 'cyan' },
          leftHand: { x: 184, y: 230, rotate: -10, shape: 'open', motion: '' },
          rightHand: { x: 248, y: 184, rotate: 18, shape: 'point', motion: 'point' },
          duration: 940
        })
      ],
      'my name': [
        this.makeFrame({
          motion: { path: 'M 204 208 Q 218 198 226 214', accent: 'gold' },
          leftHand: { x: 186, y: 236, rotate: -10, shape: 'open', motion: '', elbowOut: 0 },
          rightHand: { x: 216, y: 212, rotate: 10, shape: 'flat', motion: 'chestTap', elbowOut: 16 },
          duration: 760
        }),
        this.makeFrame({
          motion: { path: 'M 186 204 L 236 204', accent: 'violet' },
          leftHand: { x: 192, y: 204, rotate: -22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          rightHand: { x: 228, y: 204, rotate: 22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          duration: 860
        })
      ],
      'my name is': [
        this.makeFrame({
          motion: { path: 'M 204 208 Q 218 198 226 214', accent: 'gold' },
          leftHand: { x: 186, y: 236, rotate: -10, shape: 'open', motion: '', elbowOut: 0 },
          rightHand: { x: 216, y: 212, rotate: 10, shape: 'flat', motion: 'chestTap', elbowOut: 16 },
          duration: 760
        }),
        this.makeFrame({
          motion: { path: 'M 186 204 L 236 204', accent: 'violet' },
          leftHand: { x: 192, y: 204, rotate: -22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          rightHand: { x: 228, y: 204, rotate: 22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          duration: 860
        })
      ]
    };

    return phrases[phraseKey] || null;
  }

  getWordFrames(word) {
    const library = {
      hello: [
        this.makeFrame({
          motion: { path: 'M 248 176 Q 284 142 304 116', accent: 'cyan' },
          leftHand: { x: 186, y: 232, rotate: -10, shape: 'open', motion: '' },
          rightHand: { x: 252, y: 174, rotate: -16, shape: 'open', motion: 'wave' }
        })
      ],
      hi: [
        this.makeFrame({
          motion: { path: 'M 248 176 Q 284 142 304 116', accent: 'cyan' },
          leftHand: { x: 186, y: 232, rotate: -10, shape: 'open', motion: '' },
          rightHand: { x: 252, y: 174, rotate: -16, shape: 'open', motion: 'wave' }
        })
      ],
      how: [
        this.makeFrame({
          motion: { path: 'M 160 232 C 184 194 236 194 260 232', accent: 'cyan' },
          leftHand: { x: 182, y: 228, rotate: -20, shape: 'fist', motion: 'orbit' },
          rightHand: { x: 238, y: 228, rotate: 20, shape: 'fist', motion: 'orbit' }
        })
      ],
      are: [
        this.makeFrame({
          motion: { path: 'M 178 210 Q 210 238 242 210', accent: 'violet' },
          leftHand: { x: 190, y: 214, rotate: -10, shape: 'open', motion: 'pulse' },
          rightHand: { x: 230, y: 214, rotate: 10, shape: 'open', motion: 'pulse' },
          duration: 780
        })
      ],
      you: [
        this.makeFrame({
          motion: { path: 'M 244 186 Q 302 164 348 138', accent: 'cyan' },
          leftHand: { x: 184, y: 230, rotate: -10, shape: 'open', motion: '' },
          rightHand: { x: 248, y: 184, rotate: 18, shape: 'point', motion: 'point' }
        })
      ],
      thank: [
        this.makeFrame({
          motion: { path: 'M 226 146 Q 246 182 274 212', accent: 'gold' },
          leftHand: { x: 186, y: 232, rotate: -10, shape: 'open', motion: '' },
          rightHand: { x: 228, y: 150, rotate: -28, shape: 'flat', motion: 'sweep' }
        })
      ],
      thanks: [
        this.makeFrame({
          motion: { path: 'M 226 146 Q 246 182 274 212', accent: 'gold' },
          leftHand: { x: 186, y: 232, rotate: -10, shape: 'open', motion: '' },
          rightHand: { x: 228, y: 150, rotate: -28, shape: 'flat', motion: 'sweep' }
        })
      ],
      please: [
        this.makeFrame({
          motion: { path: 'M 188 226 C 188 198 232 198 232 226 C 232 254 188 254 188 226', accent: 'violet' },
          leftHand: { x: 188, y: 226, rotate: -8, shape: 'open', motion: '' },
          rightHand: { x: 222, y: 226, rotate: 10, shape: 'flat', motion: 'orbit' }
        })
      ],
      yes: [
        this.makeFrame({
          motion: { path: 'M 244 174 Q 248 146 244 126', accent: 'cyan' },
          leftHand: { x: 188, y: 232, rotate: -12, shape: 'fist', motion: '' },
          rightHand: { x: 244, y: 180, rotate: 8, shape: 'fist', motion: 'nod' }
        })
      ],
      no: [
        this.makeFrame({
          motion: { path: 'M 238 178 Q 256 160 278 156', accent: 'cyan' },
          leftHand: { x: 188, y: 232, rotate: -12, shape: 'open', motion: '' },
          rightHand: { x: 242, y: 182, rotate: 22, shape: 'point', motion: 'tap' }
        })
      ],
      my: [
        this.makeFrame({
          motion: { path: 'M 204 208 Q 218 198 226 214', accent: 'gold' },
          leftHand: { x: 186, y: 236, rotate: -10, shape: 'open', motion: '', elbowOut: 0 },
          rightHand: { x: 216, y: 212, rotate: 10, shape: 'flat', motion: 'chestTap', elbowOut: 16 },
          duration: 760
        })
      ],
      name: [
        this.makeFrame({
          motion: { path: 'M 186 204 L 236 204', accent: 'violet' },
          leftHand: { x: 192, y: 204, rotate: -22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          rightHand: { x: 228, y: 204, rotate: 22, shape: 'name', motion: 'nameTap', elbowOut: 22 },
          duration: 860
        })
      ],
      is: [
        this.makeFrame({
          motion: { path: '', accent: 'cyan' },
          leftHand: { x: 188, y: 232, rotate: -10, shape: 'open', motion: '', elbowOut: 0 },
          rightHand: { x: 232, y: 228, rotate: 10, shape: 'open', motion: '', elbowOut: 0 },
          duration: 320
        })
      ],
      what: [
        this.makeFrame({
          motion: { path: 'M 170 212 Q 210 244 250 212', accent: 'violet' },
          leftHand: { x: 188, y: 214, rotate: -14, shape: 'open', motion: 'question', elbowOut: 14 },
          rightHand: { x: 232, y: 214, rotate: 14, shape: 'open', motion: 'question', elbowOut: 14 },
          duration: 760
        })
      ],
      your: [
        this.makeFrame({
          motion: { path: 'M 244 188 Q 300 176 340 166', accent: 'cyan' },
          leftHand: { x: 186, y: 232, rotate: -10, shape: 'open', motion: '', elbowOut: 0 },
          rightHand: { x: 246, y: 188, rotate: 8, shape: 'flat', motion: 'your', elbowOut: 14 },
          duration: 760
        })
      ],
      doing: [
        this.makeFrame({
          motion: { path: 'M 184 226 C 196 202 224 202 236 226', accent: 'gold' },
          leftHand: { x: 192, y: 224, rotate: -10, shape: 'fist', motion: 'doing', elbowOut: 10 },
          rightHand: { x: 228, y: 224, rotate: 10, shape: 'fist', motion: 'doing', elbowOut: 10 },
          duration: 920
        })
      ]
    };

    return library[word] || [
      this.makeFrame({
        motion: { path: 'M 176 230 Q 210 188 244 230', accent: 'violet' },
        leftHand: { x: 188, y: 232, rotate: -10, shape: 'open', motion: 'pulse' },
        rightHand: { x: 232, y: 232, rotate: 10, shape: 'open', motion: 'pulse' },
        duration: 720
      })
    ];
  }

  makeFrame(overrides = {}) {
    return {
      duration: this.defaultDuration,
      leftHand: { x: 188, y: 232, rotate: -12, shape: 'open', motion: '', elbowOut: 0 },
      rightHand: { x: 232, y: 232, rotate: 12, shape: 'open', motion: '', elbowOut: 0 },
      motion: { path: '', accent: 'cyan' },
      ...overrides
    };
  }

  clonePose(pose) {
    return {
      duration: pose.duration,
      motion: { ...pose.motion },
      leftHand: { ...pose.leftHand },
      rightHand: { ...pose.rightHand }
    };
  }

  getShoulder(side) {
    return side === 'left' ? { x: 170, y: 186 } : { x: 250, y: 186 };
  }

  getElbow(shoulder, hand, side) {
    const dx = hand.x - shoulder.x;
    const dy = hand.y - shoulder.y;
    const distance = Math.max(8, Math.hypot(dx, dy));
    const clamped = Math.min(distance, this.upperArmLength + this.forearmLength - 2);
    const unitX = dx / distance;
    const unitY = dy / distance;
    const reach = (this.upperArmLength ** 2 - this.forearmLength ** 2 + clamped ** 2) / (2 * clamped);
    const height = Math.sqrt(Math.max(this.upperArmLength ** 2 - reach ** 2, 0));
    const midX = shoulder.x + unitX * reach;
    const midY = shoulder.y + unitY * reach;
    const bend = side === 'left' ? -1 : 1;
    const elbowBias = hand.elbowOut || 0;

    return {
      x: midX + (-unitY * height * bend) + elbowBias * bend,
      y: midY + (unitX * height * bend) - Math.abs(elbowBias) * 0.18
    };
  }

  buildFingers(shape) {
    const colors = ['#60a5fa', '#34d399', '#fde047', '#fb7185'];

    if (shape === 'fist') {
      return colors.map((color, index) => {
        const offset = -7 + index * 4.5;
        return `<line class="avatar-finger" x1="${offset}" y1="-2" x2="${offset + 2}" y2="-9" stroke="${color}" />`;
      }).join('');
    }

    if (shape === 'point') {
      return `
        <line class="avatar-finger" x1="-5" y1="-2" x2="-3" y2="-10" stroke="#34d399" />
        <line class="avatar-finger avatar-finger--point" x1="0" y1="-4" x2="0" y2="-32" stroke="#60a5fa" />
        <line class="avatar-finger" x1="5" y1="-2" x2="7" y2="-8" stroke="#fb7185" />
      `;
    }

    if (shape === 'name') {
      return `
        <line class="avatar-finger avatar-finger--name" x1="-2" y1="-4" x2="-2" y2="-26" stroke="#60a5fa" />
        <line class="avatar-finger avatar-finger--name" x1="3" y1="-4" x2="3" y2="-25" stroke="#34d399" />
        <line class="avatar-finger avatar-finger--folded" x1="-7" y1="-1" x2="-2" y2="-7" stroke="#fde047" />
        <line class="avatar-finger avatar-finger--folded" x1="8" y1="-1" x2="3" y2="-7" stroke="#fb7185" />
      `;
    }

    if (shape === 'flat') {
      return colors.map((color, index) => {
        const x = -7 + index * 4.5;
        return `<line class="avatar-finger" x1="${x}" y1="-4" x2="${x}" y2="-26" stroke="${color}" />`;
      }).join('');
    }

    return colors.map((color, index) => {
      const x = -8 + index * 5;
      const endX = x + (index - 1.5) * 2.5;
      return `<line class="avatar-finger" x1="${x}" y1="-4" x2="${endX}" y2="-25" stroke="${color}" />`;
    }).join('');
  }

  setLine(line, x1, y1, x2, y2) {
    line.setAttribute('x1', x1.toFixed(2));
    line.setAttribute('y1', y1.toFixed(2));
    line.setAttribute('x2', x2.toFixed(2));
    line.setAttribute('y2', y2.toFixed(2));
  }

  lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  easeInOut(value) {
    return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  pause(ms, token) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        if (token && token !== this.token) {
          resolve();
          return;
        }
        resolve();
      }, ms);
    });
  }
}
