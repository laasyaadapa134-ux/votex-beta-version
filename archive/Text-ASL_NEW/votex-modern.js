document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('text-to-asl-form');
    const textInput = document.getElementById('text-input');
    const aslOutput = document.getElementById('asl-output');
    const charCounter = document.getElementById('char-counter');
    const clearBtn = document.getElementById('clear-btn');
    const canvas = document.getElementById('pose-canvas');
    const placeholder = document.getElementById('canvas-placeholder');
    
    // Initialize PosePlayer
    let posePlayer = null;
    try {
        posePlayer = new PosePlayer('pose-canvas');
        console.log('PosePlayer initialized successfully');
    } catch (error) {
        console.error('Error initializing PosePlayer:', error);
    }

    // Character counter
    textInput.addEventListener('input', function() {
        const count = this.value.length;
        charCounter.textContent = count;
        
        if (count > 500) {
            charCounter.style.color = '#ef4444';
        } else {
            charCounter.style.color = '#6366f1';
        }
    });

    // Clear button
    clearBtn.addEventListener('click', function() {
        textInput.value = '';
        charCounter.textContent = '0';
        
        if (posePlayer) {
            posePlayer.stop();
            posePlayer.clear();
        }
        
        canvas.classList.remove('active');
        placeholder.style.display = 'block';
        aslOutput.className = 'output-container';
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const text = textInput.value.trim();
        
        if (!text) {
            showMessage('Please enter some text to convert.', 'error');
            return;
        }

        // Show loading state
        aslOutput.className = 'output-container loading';
        placeholder.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <p>Converting to ASL...</p>
            <small>Loading pose data</small>
        `;
        placeholder.style.display = 'block';
        canvas.classList.remove('active');

        try {
            // Split text into words
            const words = text.toLowerCase().split(/\s+/);
            
            // For now, try to load the first word as a demo
            const firstWord = words[0];
            
            console.log(`Attempting to load pose for: ${firstWord}`);
            
            // Try to load and play the pose
            await posePlayer.loadPose(firstWord);
            
            // Hide placeholder, show canvas
            placeholder.style.display = 'none';
            canvas.classList.add('active');
            aslOutput.className = 'output-container has-content';
            
            // Play animation
            posePlayer.play();
            
            console.log(`Successfully loaded and playing: ${firstWord}`);
            
        } catch (error) {
            console.error('Error converting to ASL:', error);
            
            // Check if it's a file not found error
            if (error.message.includes('not found')) {
                showMessage(`No pose data found for the word. Available words: HELLO, GOOD, MORNING, etc.`, 'error');
            } else {
                showMessage('Error converting text to ASL. Please try again.', 'error');
            }
        }
    });

    function showMessage(message, type) {
        const iconClass = type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        const iconColor = type === 'error' ? '#ef4444' : '#00f2ff';
        
        canvas.classList.remove('active');
        placeholder.style.display = 'block';
        aslOutput.className = 'output-container';
        placeholder.innerHTML = `
            <i class="fas ${iconClass}" style="color: ${iconColor};"></i>
            <p style="color: #ffffff;">${message}</p>
        `;
    }
});
