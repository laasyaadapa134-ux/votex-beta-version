/**
 * PosePlayer - A class for rendering ASL pose animations on canvas
 * Matches the modern neon cyan theme
 */
class PosePlayer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.poseData = null;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.fps = 30; // Default FPS
        this.animationId = null;
        
        // Setup high-DPI canvas
        this.setupCanvas();
        
        // MediaPipe pose landmark connections
        this.connections = [
            // Face
            [0, 1], [1, 2], [2, 3], [3, 7],
            [0, 4], [4, 5], [5, 6], [6, 8],
            
            // Torso
            [9, 10], // Mouth
            [11, 12], // Shoulders
            [11, 23], [12, 24], // Shoulder to hip
            [23, 24], // Hips
            
            // Left arm
            [11, 13], [13, 15], // Shoulder -> elbow -> wrist
            
            // Right arm
            [12, 14], [14, 16], // Shoulder -> elbow -> wrist
            
            // Left leg
            [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
            
            // Right leg
            [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
        ];
        
        // Hand landmark indices (MediaPipe Pose includes hand landmarks after index 16)
        this.leftHandIndices = Array.from({length: 21}, (_, i) => 91 + i); // Approximate
        this.rightHandIndices = Array.from({length: 21}, (_, i) => 112 + i); // Approximate
    }
    
    /**
     * Setup canvas with high-DPI support
     */
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Set display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Set actual size in memory (scaled for DPI)
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale context to match DPI
        this.ctx.scale(dpr, dpr);
        
        // Store display dimensions
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }
    
    /**
     * Load pose data from JSON file
     * @param {string} word - The word to load (e.g., 'blue', 'hello')
     */
    async loadPose(word) {
        try {
            const wordUpper = word.toUpperCase();
            const response = await fetch(`/poses/${wordUpper}.json`);
            
            if (!response.ok) {
                throw new Error(`Could not load pose data for '${word}'. File not found.`);
            }
            
            this.poseData = await response.json();
            
            if (!this.poseData.frames || this.poseData.frames.length === 0) {
                throw new Error(`Invalid pose data for '${word}'`);
            }
            
            this.currentFrame = 0;
            console.log(`Loaded ${this.poseData.frames.length} frames for '${word}'`);
            return true;
        } catch (error) {
            console.error('Error loading pose:', error);
            throw error;
        }
    }
    
    /**
     * Start playing the animation
     */
    play() {
        if (!this.poseData) {
            console.error('No pose data loaded. Call loadPose() first.');
            return;
        }
        
        this.isPlaying = true;
        this.currentFrame = 0;
        this.animate();
    }
    
    /**
     * Stop the animation
     */
    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Animation loop
     */
    animate() {
        if (!this.isPlaying || !this.poseData) return;
        
        // Render current frame
        this.renderFrame(this.currentFrame);
        
        // Move to next frame
        this.currentFrame++;
        
        // Loop animation or stop at end
        if (this.currentFrame >= this.poseData.frames.length) {
            this.currentFrame = 0; // Loop
            // Or: this.stop(); return; // Stop at end
        }
        
        // Schedule next frame
        setTimeout(() => {
            this.animationId = requestAnimationFrame(() => this.animate());
        }, 1000 / this.fps);
    }
    
    /**
     * Render a single frame
     * @param {number} frameIndex - The frame to render
     */
    renderFrame(frameIndex) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        
        if (!this.poseData || frameIndex >= this.poseData.frames.length) {
            return;
        }
        
        const frame = this.poseData.frames[frameIndex];
        const landmarks = frame.pose_landmarks;
        
        if (!landmarks) return;
        
        // Draw connections (skeleton)
        this.drawConnections(landmarks);
        
        // Draw hand landmarks
        this.drawHandLandmarks(landmarks);
        
        // Draw main pose landmarks
        this.drawLandmarks(landmarks);
    }
    
    /**
     * Draw connections between landmarks
     */
    drawConnections(landmarks) {
        this.ctx.strokeStyle = '#00f2ff'; // Neon cyan
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.shadowBlur = 10;
        this.ctx.lineCap = 'round';
        
        for (const [startIdx, endIdx] of this.connections) {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];
            
            // Skip if landmarks don't exist or have low confidence
            if (!start || !end || 
                start.confidence < 0.3 || end.confidence < 0.3 ||
                start.x === null || end.x === null) {
                continue;
            }
            
            // Convert normalized coordinates to canvas coordinates
            const startX = start.x * this.displayWidth;
            const startY = start.y * this.displayHeight;
            const endX = end.x * this.displayWidth;
            const endY = end.y * this.displayHeight;
            
            // Draw line
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    /**
     * Draw landmark points
     */
    drawLandmarks(landmarks) {
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.shadowBlur = 8;
        
        // Draw key landmarks (shoulders, elbows, wrists)
        const keyIndices = [11, 12, 13, 14, 15, 16]; // Shoulders, elbows, wrists
        
        for (const idx of keyIndices) {
            const landmark = landmarks[idx];
            
            if (!landmark || landmark.confidence < 0.3 || landmark.x === null) {
                continue;
            }
            
            const x = landmark.x * this.displayWidth;
            const y = landmark.y * this.displayHeight;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    /**
     * Draw hand landmarks
     */
    drawHandLandmarks(landmarks) {
        this.ctx.fillStyle = '#ff00ea'; // Magenta for hands
        this.ctx.shadowColor = '#ff00ea';
        this.ctx.shadowBlur = 6;
        
        for (let i = 0; i < landmarks.length; i++) {
            const landmark = landmarks[i];
            
            // Only draw hand landmarks with confidence > 0.2
            if (!landmark || landmark.confidence <= 0.2 || landmark.x === null) {
                continue;
            }
            
            // Skip non-hand landmarks (hand landmarks typically after index 20 in some models)
            // For now, draw small dots for all high-confidence points
            if (landmark.confidence > 0.5) {
                const x = landmark.x * this.displayWidth;
                const y = landmark.y * this.displayHeight;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    }
}
