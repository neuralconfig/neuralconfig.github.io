// Matrix background effect
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/<>?{}[]|";
const characters = matrix.split("");
const fontSize = 14;
const columns = canvas.width/fontSize;
const drops = [];

for(let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    for(let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        } else {
            drops[i]++;
        }
    }
}

// Matrix animation control using requestAnimationFrame for better performance
let matrixAnimationId = null;
let lastFrameTime = 0;
const frameInterval = 50; // Target 50ms between frames (20 FPS for matrix effect)

function animateMatrix(currentTime) {
    if (!matrixAnimationId) return;

    // Throttle to ~20 FPS for the matrix effect
    if (currentTime - lastFrameTime >= frameInterval) {
        drawMatrix();
        lastFrameTime = currentTime;
    }

    matrixAnimationId = requestAnimationFrame(animateMatrix);
}

function startMatrix() {
    if (!matrixAnimationId) {
        lastFrameTime = 0;
        matrixAnimationId = requestAnimationFrame(animateMatrix);
    }
}

function stopMatrix() {
    if (matrixAnimationId) {
        cancelAnimationFrame(matrixAnimationId);
        matrixAnimationId = null;
    }
}

// Don't start automatically - will be started after banner

// Responsive canvas resize with debouncing for better performance
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Don't resize during game to prevent matrix restart
        if (window.gameActive) {
            return;
        }

        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        // Only resize if dimensions actually changed
        // Setting canvas.width/height clears the canvas, so avoid if unchanged
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Recalculate columns and drops after resize
            const newColumns = Math.floor(canvas.width / fontSize);

            // Validate newColumns to prevent RangeError
            if (isFinite(newColumns) && newColumns > 0 && newColumns < 10000) {
                drops.length = newColumns;
                for(let x = 0; x < newColumns; x++) {
                    if (drops[x] === undefined) {
                        drops[x] = Math.random() * -100; // Stagger initial drops
                    }
                }
            }
        }
    }, 250);
});
