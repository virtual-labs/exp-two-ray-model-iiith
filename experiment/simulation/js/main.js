window.onload = function() {
    document.getElementById("tworay").style.display = "block";
};

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const resultsDiv = document.getElementById('results');
const messageDiv = document.getElementById('message');

const transmitter = { x: 0, y: 0, img: new Image(), width: 80, height: 80 };
const receiver = { x: 0, y: 0, velocity: 0, img: new Image(), direction: 1, isFlipped: false, width: 80, height: 80 };
const wall = { x: 0, y: 0, width: 15, height: 0 };

let animationFrame;
let frequency = 900e6;
const c = 3e8;
let maxDopplerShift;
let currentScenario = 1;

const wallSlider = document.getElementById('wallSlider');
const wallPositionDisplay = document.getElementById('wallPositionDisplay');
const wallSlider3 = document.getElementById('wallSlider3');
const wallPositionDisplay3 = document.getElementById('wallPositionDisplay3');

// --- Signal Plotting Variables ---
let signalCanvas, signalCtx;
let currentPhase = 0;
const signalHistory = [];
let directSignalHistory = [];
let reflectedSignalHistory = [];
const maxSignalPoints = 400;
const baseCarrierFreq = 0.4;
const dt_visual = 0.08;

let imagesLoaded = 0;
const totalImages = 2;

function onAllImagesLoaded() {
    console.log("All images loaded successfully. Initializing simulation.");
    rebuildSignalUI(); // Initial setup
    setScenario(1);
}

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        onAllImagesLoaded();
    }
}

transmitter.img.src = './images/antenna-svgrepo-com.svg'; // antenna
receiver.img.src = './images/car.svg'; // car

transmitter.img.onload = imageLoaded;
receiver.img.onload = imageLoaded;

transmitter.img.onerror = () => console.error("Failed to load transmitter image. Check path and server.");
receiver.img.onerror = () => console.error("Failed to load receiver image. Check path and server.");


// --- CONTROL FUNCTIONS ---
window.setScenario = (num) => {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    currentScenario = num;

    rebuildSignalUI();

    const velocityInputs = document.getElementById('velocity-inputs');
    const velocityInput = document.getElementById('velocity');
    const sc2Inputs = document.getElementById('scenario2-inputs');
    const sc3Inputs = document.getElementById('scenario3-inputs');

    velocityInputs.style.display = (num === 1 || num === 3) ? 'block' : 'none';
    sc2Inputs.style.display = num === 2 ? 'block' : 'none';
    sc3Inputs.style.display = num === 3 ? 'block' : 'none';

    if (num === 1) {
        velocityInput.max = 25;
    } else if (num === 3) {
        velocityInput.max = 50;
    }

    if (parseFloat(velocityInput.value) > parseFloat(velocityInput.max)) {
        velocityInput.value = velocityInput.max;
    }

    resultsDiv.innerHTML = `<p>Scenario ${num} selected. Configure inputs and click 'Start'.</p>`;

    signalHistory.length = 0;
    directSignalHistory.length = 0;
    reflectedSignalHistory.length = 0;

    if (num === 1) {
        transmitter.x = canvas.width / 2;
        transmitter.y = canvas.height / 6;
        receiver.x = canvas.width * 0.8;
        receiver.y = canvas.height / 2;
    } else if (num === 2) {
        transmitter.x = 100;
        transmitter.y = canvas.height / 6;
        receiver.x = canvas.width / 2;
        receiver.y = canvas.height / 2 + 30;
        updateWallPositionScenario2();
    } else if (num === 3) {
        transmitter.x = canvas.width / 2;
        transmitter.y = canvas.height / 6;
        receiver.x = 50;
        receiver.y = canvas.height / 2;
        updateWallPositionScenario3();
    }
    draw();
}

window.startCalculation = () => {
    // Cancel any existing animation first
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    
    messageDiv.textContent = ''; // Clear previous messages
    let vel;

    try {
        frequency = parseFloat(document.getElementById('frequency').value) * 1e6;
        vel = parseFloat(document.getElementById('velocity').value);

        // --- NEW VALIDATION LOGIC ---
        // Check if it's Scenario 1 AND the velocity exceeds 25
        if (currentScenario === 1 && vel > 25) {
            // If it does, throw an error to stop the function and show a message
            throw new Error('For Scenario 1, receiver velocity must be 25 m/s or less.');
        }
        // --- END OF NEW LOGIC ---

        if (isNaN(frequency) || frequency <= 0 || (currentScenario !== 2 && (isNaN(vel) || vel < 0))) {
            throw new Error('Please enter valid, positive numbers for all fields.');
        }
    } catch (e) {
        messageDiv.textContent = e.message;
        return; 
    }

    // Reset receiver properties completely
    receiver.velocity = (currentScenario === 2) ? 0 : vel;
    receiver.direction = 1;
    receiver.isFlipped = false;
    
    // Reset receiver position to initial position based on scenario
    if (currentScenario === 1) {
        receiver.x = canvas.width * 0.8;
        receiver.y = canvas.height / 2;
    } else if (currentScenario === 3) {
        receiver.x = 50;
        receiver.y = canvas.height / 2;
    }
    
    maxDopplerShift = calculateMaxDopplerShift(frequency, receiver.velocity);
    signalHistory.length = 0;
    directSignalHistory.length = 0;
    reflectedSignalHistory.length = 0;
    currentPhase = 0;

    animate();
}

window.resetSimulation = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    document.getElementById('velocity').value = "20";
    document.getElementById('frequency').value = "900";
    document.getElementById('wallSlider').value = "650";
    document.getElementById('wallSlider3').value = "700";
    document.getElementById('scenario1').checked = true;
    messageDiv.textContent = '';
    setScenario(1);
}

// --- ANIMATION & SCENARIO LOGIC ---
function animate() {
    if (receiver.velocity <= 0 && currentScenario !== 2) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
        return;
    }

    if (currentScenario !== 2) {
        updateReceiverPosition();
    }

    updateSignal();

    if (currentScenario === 1) updateScenario1Results();
    if (currentScenario === 3) {
        updateWallPositionScenario3();
        updateScenario3Results();
    }

    draw();

    animationFrame = requestAnimationFrame(animate);
}

function updateReceiverPosition() {
    if (receiver.velocity === 0) return;

    const margin = 50;
    receiver.x += receiver.velocity * receiver.direction * 0.1;

    let leftBound = margin;
    let rightBound = canvas.width - margin;

    if (currentScenario === 3) {
        rightBound = wall.x - margin / 2;
    }

    if (receiver.direction === 1 && receiver.x > rightBound) {
        receiver.x = rightBound;
        receiver.direction = -1;
        receiver.isFlipped = true;
    } else if (receiver.direction === -1 && receiver.x < leftBound) {
        receiver.x = leftBound;
        receiver.direction = 1;
        receiver.isFlipped = false;
    }
}

function updateWallPositionScenario2() {
    const wallX = parseFloat(wallSlider.value);
    wall.x = wallX;
    wall.y = 50;
    wall.height = canvas.height - 100;
    wallPositionDisplay.textContent = `Wall X Position: ${wallX.toFixed(0)} m`;
    updateScenario2Results();
    if (!animationFrame) {
        draw();
    }
}

function updateWallPositionScenario3() {
    const wallX = parseFloat(wallSlider3.value);
    wall.x = wallX;
    wall.y = 50;
    wall.height = canvas.height - 100;
    wallPositionDisplay3.textContent = `Wall Position: ${wallX.toFixed(0)} m`;
}

// --- CALCULATION & RESULTS ---
function calculateMaxDopplerShift(freq, vel) { return freq * (Math.abs(vel) / c); }

function calculateInstantaneousDopplerShift() {
    if (receiver.velocity === 0) return 0;
    const dx = receiver.x - transmitter.x;
    const dy = receiver.y - transmitter.y;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) return 0;
    const dotProduct = (receiver.velocity * receiver.direction) * (-dx);
    const cosTheta = dotProduct / (Math.abs(receiver.velocity) * distance);
    return maxDopplerShift * cosTheta;
}

function updateScenario1Results() {
    const dopplerShift = calculateInstantaneousDopplerShift();
    resultsDiv.innerHTML = `<p><strong>Max Doppler (fd):</strong> ${maxDopplerShift.toFixed(2)} Hz</p><p><strong>Inst. Doppler:</strong> ${dopplerShift.toFixed(2)} Hz</p>`;
}

function updateScenario2Results() {
    const directPath = Math.hypot(receiver.x - transmitter.x, receiver.y - transmitter.y);
    const tx_image_x = wall.x + (wall.x - transmitter.x);
    const reflectedPath = Math.hypot(receiver.x - tx_image_x, receiver.y - transmitter.y);
    const delaySpread = Math.abs(reflectedPath - directPath) / c;
    const coherenceBW = (delaySpread > 0) ? 1 / (2 * delaySpread) : Infinity;

    resultsDiv.innerHTML = `<p><strong>Delay Spread (τ):</strong> ${(delaySpread * 1e9).toFixed(2)} ns</p><p><strong>Coherence BW (Bc):</strong> ${isFinite(coherenceBW) ? (coherenceBW / 1e6).toFixed(2) + ' MHz' : 'Infinite'}</p>`;
}

function updateScenario3Results() {
    const directPath = Math.hypot(receiver.x - transmitter.x, receiver.y - transmitter.y);
    const tx_image_x = wall.x + (wall.x - transmitter.x);
    const reflectedPath = Math.hypot(receiver.x - tx_image_x, receiver.y - transmitter.y);
    const delaySpread = Math.abs(reflectedPath - directPath) / c;
    const coherenceBW = (delaySpread > 0) ? 1 / (2 * delaySpread) : Infinity;

    const dopplerShift = calculateInstantaneousDopplerShift();
    const dopplerSpread = maxDopplerShift;
    const coherenceTime = (dopplerSpread > 0) ? 1 / (2 * dopplerSpread) : Infinity;

    resultsDiv.innerHTML = `<p><strong>Inst. Doppler:</strong> ${dopplerShift.toFixed(2)} Hz</p><p><strong>Doppler Spread (fd):</strong> ${dopplerSpread.toFixed(2)} Hz</p><p><strong>Coherence Time (Tc):</strong> ${isFinite(coherenceTime) ? (coherenceTime * 1000).toFixed(2) + ' ms' : 'Inf.'}</p><hr><p><strong>Delay Spread (τ):</strong> ${(delaySpread * 1e9).toFixed(2)} ns</p><p><strong>Coherence BW (Bc):</strong> ${isFinite(coherenceBW) ? (coherenceBW / 1e6).toFixed(2) + ' MHz' : 'Inf.'}</p>`;
}

// --- SIGNAL PLOTTING ---
function rebuildSignalUI() {
    const container = document.getElementById('signal-graph-container');
    container.innerHTML = ''; // Clear previous canvases

    if (currentScenario === 2) {
        // Create UI for Direct Path Signal
        const directTitle = document.createElement('h4');
        directTitle.textContent = 'Direct Path Signal';
        directTitle.style.cssText = 'margin-top: 15px; margin-bottom: 5px;';
        container.appendChild(directTitle);

        const directCanvas = document.createElement('canvas');
        directCanvas.id = 'directSignalCanvas';
        directCanvas.width = 360; directCanvas.height = 100;
        directCanvas.style.border = '1px solid #ddd';
        container.appendChild(directCanvas);

        // Create UI for Reflected Path Signal
        const reflectedTitle = document.createElement('h4');
        reflectedTitle.textContent = 'Reflected Path Signal';
        reflectedTitle.style.cssText = 'margin-top: 15px; margin-bottom: 5px;';
        container.appendChild(reflectedTitle);

        const reflectedCanvas = document.createElement('canvas');
        reflectedCanvas.id = 'reflectedSignalCanvas';
        reflectedCanvas.width = 360; reflectedCanvas.height = 100;
        reflectedCanvas.style.border = '1px solid #ddd';
        container.appendChild(reflectedCanvas);

        // Create UI for Combined Signal
        const combinedTitle = document.createElement('h4');
        combinedTitle.textContent = 'Combined Signal (Superposition)';
        combinedTitle.style.cssText = 'margin-top: 15px; margin-bottom: 5px;';
        container.appendChild(combinedTitle);

        // Add legend
        const legend = document.createElement('div');
        legend.style.cssText = 'display: flex; justify-content: center; gap: 15px; margin: 5px 0; font-size: 11px;';
        legend.innerHTML = `
            <span style="color: #22c55e;">■ Constructive Interference (High Amplitude)</span>
            <span style="color: #f59e0b;">■ Partial Interference (Medium)</span>
            <span style="color: #ef4444;">■ Destructive Interference (Low Amplitude)</span>
        `;
        container.appendChild(legend);
    } else {
        container.innerHTML = '<h3>Received Signal Waveform</h3>';
    }

    // Create the main canvas for the final signal (used by all scenarios)
    signalCanvas = document.createElement('canvas');
    signalCanvas.width = 360; signalCanvas.height = 150;
    signalCanvas.style.border = '1px solid #ddd';
    container.appendChild(signalCanvas);
    signalCtx = signalCanvas.getContext('2d');
}

function updateSignal() {
    if (!signalCtx) return;

    let signalValue = 0;

    if (currentScenario === 1) {
        let dopplerShift = calculateInstantaneousDopplerShift();
        let normalizedDoppler = (maxDopplerShift > 0) ? (dopplerShift / maxDopplerShift) : 0;
        let freqDeviation = normalizedDoppler * 0.15;
        let instantFreq = baseCarrierFreq + freqDeviation;
        currentPhase += instantFreq * dt_visual;
        signalValue = Math.sin(currentPhase);

    } else if (currentScenario === 2) {
        const directPath = Math.hypot(receiver.x - transmitter.x, receiver.y - transmitter.y);
        const wavelength = c / frequency;
        const tx_image_x = wall.x + (wall.x - transmitter.x);
        const reflectedPath = Math.hypot(receiver.x - tx_image_x, receiver.y - transmitter.y);
        const pathDifference = reflectedPath - directPath;
        const phaseDifference = (2 * Math.PI * pathDifference) / wavelength;

        currentPhase += baseCarrierFreq * dt_visual;

        const directSignal = 1.0 * Math.sin(currentPhase);
        const reflectedSignal = 0.7 * Math.sin(currentPhase + phaseDifference);

        directSignalHistory.push(directSignal);
        reflectedSignalHistory.push(reflectedSignal);
        if (directSignalHistory.length > maxSignalPoints) directSignalHistory.shift();
        if (reflectedSignalHistory.length > maxSignalPoints) reflectedSignalHistory.shift();

        signalValue = (directSignal + reflectedSignal) / 1.7; // Normalize combined signal

    } // Updated signal generation for scenario 3
// Replace the scenario 3 part in your updateSignal() function with this:

else if (currentScenario === 3) {
    const directPath = Math.hypot(receiver.x - transmitter.x, receiver.y - transmitter.y);
    const tx_image_x = wall.x + (wall.x - transmitter.x);
    const reflectedPath = Math.hypot(receiver.x - tx_image_x, receiver.y - transmitter.y);
    const pathDifference = reflectedPath - directPath;
    
    // Calculate the wavelength
    const wavelength = c / frequency;
    
    // Phase difference between direct and reflected paths
    const phaseDifference = (2 * Math.PI * pathDifference) / wavelength;
    
    // High-frequency carrier (much faster oscillation)
    currentPhase += baseCarrierFreq * 50 * dt_visual; // Increased multiplier for higher frequency
    
    // Calculate envelope based on path difference
    // This creates the slow fading pattern
    const envelopePhase = (2 * Math.PI * pathDifference) / wavelength;
    
    // Envelope varies from 0 to 2 (constructive to destructive interference)
    const envelope = Math.abs(1 + 0.8 * Math.cos(envelopePhase));
    
    // Apply envelope to high-frequency carrier
    signalValue = envelope * Math.sin(currentPhase);
    
    // Normalize to keep within [-1, 1] range
    signalValue = signalValue / 1.8;
}

    signalHistory.push(signalValue);
    if (signalHistory.length > maxSignalPoints) signalHistory.shift();
}

function drawSignal() {
    if (!signalCtx) return;

    if (currentScenario === 2) {
        const directCanvas = document.getElementById('directSignalCanvas');
        if (directCanvas) {
            drawIndividualSignal(directCanvas, directSignalHistory, '#2563eb', true);
        }

        const reflectedCanvas = document.getElementById('reflectedSignalCanvas');
        if (reflectedCanvas) {
            drawIndividualSignal(reflectedCanvas, reflectedSignalHistory, '#dc2626', true);
        }
    }

    drawIndividualSignal(signalCanvas, signalHistory, '#16a085', true);
    
    // Add interference indicators to the combined signal in scenario 2
    if (currentScenario === 2) {
        drawInterferenceIndicators(signalCanvas, signalHistory);
    }
}

// 1. Updated drawIndividualSignal function - change Time label to Time (μs)
function drawIndividualSignal(canvas, history, color, drawAxes = false) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw axes if requested
    if (drawAxes) {
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        const center_y = canvas.height / 2;
        const axis_x = 30;
        ctx.beginPath();
        ctx.moveTo(axis_x, center_y);
        ctx.lineTo(canvas.width - 10, center_y); // X-axis
        ctx.moveTo(axis_x, 10);
        ctx.lineTo(axis_x, canvas.height - 10); // Y-axis
        ctx.stroke();

        ctx.fillStyle = '#555';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';

        // X-axis label - CHANGED FROM 'Time' to 'Time (μs)'
        ctx.fillText('Time (μs)', canvas.width / 2, canvas.height - 5);

        // Draw Amplitude Label (Y-axis)
        ctx.save();
        ctx.translate(15, center_y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Amplitude', 0, 0);
        ctx.restore();

        // Y-axis scale
        ctx.textAlign = 'right';
        ctx.fillText('1.0', 25, center_y - (canvas.height / 2.5) + 5);
        ctx.fillText('0.0', 25, center_y + 5);
        ctx.fillText('-1.0', 25, center_y + (canvas.height / 2.5) + 5);
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const stepX = (canvas.width - 30) / (maxSignalPoints - 1);

    history.forEach((val, i) => {
        const y = canvas.height / 2 - val * (canvas.height / 2.5);
        const x = 30 + i * stepX;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

// 2. Corrected drawInterferenceIndicators function - shows where peaks align/cancel
function drawInterferenceIndicators(canvas, history) {
    if (history.length < 10 || currentScenario !== 2) return;
    
    const ctx = canvas.getContext('2d');
    const stepX = (canvas.width - 30) / (maxSignalPoints - 1);
    
    // Calculate actual phase difference from path difference
    const directPath = Math.hypot(receiver.x - transmitter.x, receiver.y - transmitter.y);
    const tx_image_x = wall.x + (wall.x - transmitter.x);
    const reflectedPath = Math.hypot(receiver.x - tx_image_x, receiver.y - transmitter.y);
    const pathDifference = reflectedPath - directPath;
    const wavelength = c / frequency;
    const phaseDifference = (2 * Math.PI * pathDifference) / wavelength;
    
    // Normalize phase difference to [0, 2π]
    const normalizedPhase = ((phaseDifference % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    
    // Determine if we have constructive or destructive interference
    // Constructive: phase ≈ 0, 2π (cos(phase) ≈ 1)
    // Destructive: phase ≈ π (cos(phase) ≈ -1)
    const cosineFactor = Math.cos(normalizedPhase);
    
    ctx.globalAlpha = 0.25;
    
    // Check both direct and reflected signal histories
    for (let i = 0; i < Math.min(directSignalHistory.length, reflectedSignalHistory.length); i++) {
        const directVal = directSignalHistory[i];
        const reflectedVal = reflectedSignalHistory[i];
        const combinedVal = history[i];
        
        const x = 30 + i * stepX;
        const width = stepX * 1.5;
        
        // Check if signals are adding constructively or destructively at this point
        // Constructive: both signals have same sign and combined amplitude is high
        // Destructive: signals have opposite signs and combined amplitude is low
        
        const bothPositive = directVal > 0.3 && reflectedVal > 0.3;
        const bothNegative = directVal < -0.3 && reflectedVal < -0.3;
        const opposingSigns = (directVal > 0.3 && reflectedVal < -0.3) || (directVal < -0.3 && reflectedVal > 0.3);
        
        if (bothPositive || bothNegative) {
            // Signals adding constructively
            const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, 0, width, canvas.height);
        } else if (opposingSigns) {
            // Signals canceling destructively
            const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, 0, width, canvas.height);
        }
    }
    
    ctx.globalAlpha = 1.0;
    
    // Add indicators showing overall interference state
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    // Overall characterization based on phase difference
    let overallType = '';
    if (Math.abs(cosineFactor) > 0.7) {
        overallType = cosineFactor > 0 ? 'Mostly Constructive' : 'Mostly Destructive';
    } else {
        overallType = 'Mixed Interference';
    }
    
    ctx.fillStyle = cosineFactor > 0.7 ? '#16a34a' : cosineFactor < -0.7 ? '#dc2626' : '#d97706';
    ctx.fillText(overallType, canvas.width / 2, 15);
    
    // Show phase info
    ctx.font = '9px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Phase Diff: ${(normalizedPhase * 180 / Math.PI).toFixed(1)}°`, canvas.width / 2, canvas.height - 2);
}

// --- DRAWING FUNCTIONS ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaths();
    drawLabels();
    if (currentScenario === 2 || currentScenario === 3) drawWall();
    drawTransmitter();
    drawReceiver();
    if (signalCtx) drawSignal();
}

function drawLabels() {
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';

    ctx.fillText('Transmitter', transmitter.x, transmitter.y - transmitter.height / 2 - 5);
    ctx.fillText('Receiver', receiver.x, receiver.y + receiver.height / 2 + 15);
    if (currentScenario === 2 || currentScenario === 3) {
        ctx.fillText('Wall', wall.x, wall.y - 5);
    }
}

function drawTransmitter() { ctx.drawImage(transmitter.img, transmitter.x - transmitter.width / 2, transmitter.y - transmitter.height / 2, transmitter.width, transmitter.height); }
function drawReceiver() {
    ctx.save();
    ctx.translate(receiver.x, receiver.y);
    if (receiver.isFlipped) ctx.scale(-1, 1);
    ctx.drawImage(receiver.img, -receiver.width / 2, -receiver.height / 2, receiver.width, receiver.height);
    ctx.restore();
}
function drawWall() {
    ctx.fillStyle = '#64748b'; ctx.fillRect(wall.x - wall.width / 2, wall.y, wall.width, wall.height);
    ctx.strokeStyle = '#334155'; ctx.strokeRect(wall.x - wall.width / 2, wall.y, wall.width, wall.height);
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, -7);
    ctx.lineTo(-12, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawPaths() {
    ctx.setLineDash([8, 8]);

    ctx.beginPath();
    ctx.moveTo(transmitter.x, transmitter.y);
    ctx.lineTo(receiver.x, receiver.y);
    ctx.strokeStyle = '#2563eb'; // Blue
    ctx.fillStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawArrow(ctx, transmitter.x, transmitter.y, receiver.x, receiver.y);

    if (currentScenario === 2 || currentScenario === 3) {
        const tx_image_x = wall.x + (wall.x - transmitter.x);
        const slope = (receiver.y - transmitter.y) / (tx_image_x - transmitter.x);
        const reflection_y = transmitter.y + slope * (wall.x - transmitter.x);

        if (reflection_y >= wall.y && reflection_y <= (wall.y + wall.height)) {
            ctx.beginPath();
            ctx.moveTo(transmitter.x, transmitter.y);
            ctx.lineTo(wall.x, reflection_y);
            ctx.lineTo(receiver.x, receiver.y);
            ctx.strokeStyle = '#dc2626'; // Red
            ctx.fillStyle = '#dc2626';
            ctx.stroke();
            drawArrow(ctx, transmitter.x, transmitter.y, wall.x, reflection_y);
            drawArrow(ctx, wall.x, reflection_y, receiver.x, receiver.y);

            ctx.beginPath();
            ctx.arc(wall.x, reflection_y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    ctx.setLineDash([]);
}

wallSlider.addEventListener('input', () => { if (currentScenario === 2) updateWallPositionScenario2() });
wallSlider3.addEventListener('input', () => {
    if (currentScenario === 3) {
        updateWallPositionScenario3();
        if (!animationFrame) {
            updateScenario3Results();
            draw();
        }
    }
});