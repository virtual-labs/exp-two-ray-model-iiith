
window.onload = function() {
    document.getElementById("tworay").style.display = "block";
        };

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const resultsDiv = document.getElementById('results');
const wallSlider = document.getElementById('wallSlider3');
const wallPositionDisplay = document.getElementById('wallPositionDisplay3');

const transmitter = { x: canvas.width / 2, y: 80, img: new Image() };
const receiver = { x: 400, y: 200, velocity: 0, img: new Image(), direction: 1, initialDistance: 300 };
const wall = { x: 600, y: 100, width: 20, height: 200 };

let animationFrame;
let frequency = 100e6; // Default frequency in Hz (100 MHz)
const c = 3e8; // Speed of light (m/s)
let maxDopplerShift; // To be calculated
let isScenario1Complete = false;
let currentScenario = 1; // Track the current scenario

// Preload images
transmitter.img.src = './images/antenna-svgrepo-com.svg';
receiver.img.src = './images/car.svg';

transmitter.img.onload = receiver.img.onload = () => {
    if (transmitter.img.complete && receiver.img.complete) {
        draw();
    }
};

function calculateMaxDopplerShift(freq, vel) {
    return freq * (vel / c);
}

function calculateInstantaneousDopplerShift() {
    const dx = receiver.x - transmitter.x;
    const dy = receiver.y - transmitter.y;
    const cosine = dx / Math.sqrt(dx ** 2 + dy ** 2);
    return maxDopplerShift * cosine * receiver.direction;
}

function startScenario1() {
    isScenario1Complete = true; // Mark Scenario 1 as done
    document.getElementById("scenario2").disabled = false; // Enable Scenario 2

    // Clear any existing animation
    cancelAnimationFrame(animationFrame);
    
    // Get inputs
    frequency = parseFloat(document.getElementById('frequency').value) * 1e6; // Hz
    receiver.velocity = parseFloat(document.getElementById('velocity').value); // m/s
    receiver.initialDistance = parseFloat(document.getElementById('initialDistance').value); // m

    // Calculate max Doppler shift
    maxDopplerShift = calculateMaxDopplerShift(frequency, receiver.velocity);

    isScenario1Complete = true;
    document.getElementById("scenario2").disabled = false;

    // Initialize receiver position
    receiver.x = transmitter.x + receiver.initialDistance;
    receiver.direction = 1;
    
    // Start the animation
    animateScenario1();
}

function animateScenario1() {
    if (currentScenario !== 1) {
        cancelAnimationFrame(animationFrame);
        return;
    }

    const margin = 50;

    // Update receiver position
    receiver.x += receiver.velocity * receiver.direction * 0.2;

    // Reverse direction at canvas edges
    if (receiver.x < margin) {
        receiver.x = margin;
        receiver.direction *= -1;
    }
    if (receiver.x > canvas.width - margin) {
        receiver.x = canvas.width - margin;
        receiver.direction *= -1;
    }

    // Calculate results
    const dopplerShift = calculateInstantaneousDopplerShift();
    const instantaneousFrequency = (frequency + dopplerShift) / 1e6;

    const dx = receiver.x - transmitter.x;
    const dy = receiver.y - transmitter.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    resultsDiv.innerHTML = `
        Distance from Transmitter: ${distance.toFixed(1)} m<br>
        Maximum Possible Doppler Shift: ${maxDopplerShift.toFixed(2)} Hz<br>
        Instantaneous Doppler Shift: ${dopplerShift.toFixed(2)} Hz<br>
        Instantaneous Frequency: ${instantaneousFrequency.toFixed(6)} MHz
    `;

    draw();

    // Request the next animation frame
    animationFrame = requestAnimationFrame(animateScenario1);
}

// Define wall movement limits
const WALL_MIN = -350;
const WALL_MAX = 350;

// Update wall position when slider changes
wallSlider.addEventListener('input', () => {
    const value = parseFloat(wallSlider.value);
    updateWallPosition(value);
});

function updateWallPosition(value) {
    wall.x = transmitter.x + value;
    wallPositionDisplay.textContent = `Current Wall Position: ${value} m`;
    draw(); // Redraw canvas with updated wall position
}

function startScenario2() {
    isScenario2Complete = true; // Mark Scenario 2 as done
    document.getElementById("scenario3").disabled = false; // Enable Scenario 3

    // Cancel any existing animation from scenario 1
    cancelAnimationFrame(animationFrame);

    if (!isScenario1Complete) {
        alert("Please complete Scenario 1 first.");
        return;
    }
    
    receiver.velocity = 0;

    // Get wall position from the slider
    const wallDistance = parseFloat(wallSlider.value);

    // Static positions
    receiver.x = transmitter.x + 200; // Receiver fixed position
    wall.x = transmitter.x + wallDistance; // Wall dynamic position

    // Calculate distances
    const directPathDistance = Math.abs(receiver.x - transmitter.x);
    const reflectedPathDistance = directPathDistance + 2 * wallDistance;

    // Calculate delay spread and coherence bandwidth
    const delaySpread = Math.abs((reflectedPathDistance / c) - (directPathDistance / c));
    const coherenceBandwidth = 1 / (2 * delaySpread);

    // Update output
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        Direct Path Distance: ${directPathDistance.toFixed(1)} m<br>
        Reflected Path Distance: ${reflectedPathDistance.toFixed(1)} m<br>
        Delay Spread: ${(delaySpread * 1e9).toFixed(2)} ns<br>
        Coherence Bandwidth: ${(coherenceBandwidth / 1e6).toFixed(2)} MHz
    `;

    // Redraw canvas
    draw();

    console.log("Wall Distance:", wallDistance);
    console.log("Direct Path Distance:", directPathDistance);
    console.log("Reflected Path Distance:", reflectedPathDistance);
    console.log("Delay Spread:", delaySpread);
    console.log("Coherence Bandwidth:", coherenceBandwidth);
}

// Add event listener for the wall slider in Scenario 3
document.getElementById('wallSlider3').addEventListener('input', function() {
    const value = parseFloat(this.value);
    if (currentScenario === 3) {
        updateWallPositionScenario3(value);
    }
});

// Update wall position in Scenario 3
function updateWallPositionScenario3(position) {
    wall.x = transmitter.x + position;
    document.getElementById('wallPositionDisplay3').innerText = `Current Wall Position: ${position} m`;
    
    // Redraw everything
    if (currentScenario === 3) {
        draw();
    }
}

// Function to calculate and update Scenario 3
function startScenario3() {
    // Cancel any existing animation
    cancelAnimationFrame(animationFrame);

    // Get and validate inputs
    function getInputValue(id) {
        return parseFloat(document.getElementById(id).value);
    }

    const frequency = getInputValue('frequency') * 1e6; // Convert to Hz
    const velocity = getInputValue('velocity');
    const distance = Math.abs(receiver.x - transmitter.x); // Calculate current distance
    const wallDistance = getInputValue('wallSlider3'); // Wall position

    if (!frequency || !velocity || distance <= 0) {
        alert("Invalid inputs. Frequency must be positive, and receiver must move.");
        return;
    }

    // Calculate reflection path
    const distanceToWall = wallDistance;
    const wallPosition = transmitter.x + distanceToWall;

    const tx = transmitter.x;
    const rx = wallPosition + (receiver.x - wallPosition); // Receiver position after reflection

    const directPathDistance = distance;
    const reflectedPathDistance = Math.abs(rx - tx);

    let delaySpread, coherenceBandwidth, dopplerSpread, coherenceTime;

    if (reflectedPathDistance > 0) {
        const txToWall = wallPosition - tx; // Distance from transmitter to wall
        const wallToRx = rx - wallPosition; // Distance from wall to receiver

        // Calculate delay and spread
        const txToWallTime = txToWall / c;
        const wallToRxTime = wallToRx / c;
        const txToRxTime = reflectedPathDistance / c;

        delaySpread = Math.abs(txToRxTime - txToWallTime);
        coherenceBandwidth = 1 / (2 * delaySpread);
        coherenceTime = 1 / (2 * calculateMaxDopplerShift(frequency, velocity));

        // Ensure finite values
        if (isNaN(coherenceBandwidth) || isNaN(coherenceTime)) {
            coherenceBandwidth = 0;
            coherenceTime = 0;
            delaySpread = 0;
        }
    } else {
        // No reflection path exists
        delaySpread = 0;
        coherenceBandwidth = 0;
        dopplerSpread = 0;
        coherenceTime = 0;
    }

    // Update results for Scenario 3
    resultsDiv.innerHTML = `
        Direct Path Distance: ${directPathDistance.toFixed(1)} m<br>
        Reflected Path Distance: ${reflectedPathDistance > 0 ? reflectedPathDistance.toFixed(1) : 'N/A'} m<br>
        ${isWallBetween ? "Wall is between transmitter and receiver<br>" : ""}
        Delay Spread: ${delaySpread > 0 ? (delaySpread * 1e9).toFixed(2) : '0.00'} ns<br>
        Coherence Bandwidth: ${isFinite(coherenceBandwidth) ? (coherenceBandwidth / 1e6).toFixed(2) : 'N/A'} MHz<br>
        Instantaneous Doppler Shift: ${dopplerShift.toFixed(2)} Hz<br>
        Instantaneous Frequency: ${instantaneousFrequency.toFixed(2)} MHz<br>
        Coherence Time: ${isFinite(coherenceTime) ? (coherenceTime * 1000).toFixed(2) : 'N/A'} ms
    `;

    // Continue with animation setup
    transmitter.x = 100;
    receiver.x = wallPosition + (distance + 2 * distanceToWall);
    transmitter.y = canvas.height / 2;
    receiver.y = canvas.height / 2;
    receiver.direction = 1;

    animateScenario3();
}

function animateScenario3() {
    if (currentScenario !== 3) {
        cancelAnimationFrame(animationFrame);
        return;
    }

    try {
        // Get current velocity value
        const currentVelocity = parseFloat(document.getElementById('velocity').value);
        receiver.velocity = currentVelocity;

        // Calculate movement bounds
        const minPosition = transmitter.x - 350; // Left bound (350 units left of transmitter)
        const maxPosition = wall.x - 30; // Right bound is wall position

        // Update receiver position
        receiver.x += receiver.velocity * receiver.direction * 0.2; // Reduced multiplier for smoother motion

        // Reverse direction at boundaries and update flipping state
        if (receiver.x < minPosition) {
            receiver.x = minPosition;
            receiver.direction *= -1;
            receiver.isFlipped = receiver.direction === -1; // Update flipping state
        }
        if (receiver.x > maxPosition) {
            receiver.x = maxPosition;
            receiver.direction *= -1;
            receiver.isFlipped = receiver.direction === -1; // Update flipping state
        }

        // Calculate distances and path differences
        const dx = receiver.x - transmitter.x;
        const directPathDistance = Math.abs(dx);

        // Check if the wall is between the transmitter and receiver
        const isWallBetween = wall.x > transmitter.x && wall.x < receiver.x;

        // Calculate reflected path distance
        const reflectedPathDistance = isWallBetween
            ? Math.sqrt(Math.pow(wall.x - transmitter.x, 2)) + Math.sqrt(Math.pow(receiver.x - wall.x, 2))
            : 0;

        // Calculate Doppler shift
        const dopplerShift = calculateInstantaneousDopplerShift();
        const instantaneousFrequency = (frequency + dopplerShift) / 1e6;

        // Calculate multipath parameters
        const delaySpread = reflectedPathDistance > 0
            ? Math.abs((reflectedPathDistance / c) - (directPathDistance / c))
            : 0;

        const coherenceBandwidth = delaySpread > 0
            ? 1 / (2 * delaySpread)
            : Infinity;

        // Calculate coherence time
        const dopplerSpread = calculateMaxDopplerShift(frequency, receiver.velocity);
        const coherenceTime = dopplerSpread > 0 ? 1 / (2 * dopplerSpread) : Infinity;

        // Update results with all parameters
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `
            Direct Path Distance: ${directPathDistance.toFixed(1)} m<br>
            Reflected Path Distance: ${reflectedPathDistance > 0 ? reflectedPathDistance.toFixed(1) : 'N/A'} m<br>
            ${isWallBetween ? "Wall is between transmitter and receiver<br>" : ""}
            Delay Spread: ${delaySpread > 0 ? (delaySpread * 1e9).toFixed(2) : '0.00'} ns<br>
            Coherence Bandwidth: ${isFinite(coherenceBandwidth) ? (coherenceBandwidth / 1e6).toFixed(2) : 'N/A'} MHz<br>
            Instantaneous Doppler Shift: ${dopplerShift.toFixed(2)} Hz<br>
            Instantaneous Frequency: ${instantaneousFrequency.toFixed(2)} MHz<br>
            Coherence Time: ${isFinite(coherenceTime) ? (coherenceTime * 1000).toFixed(2) : 'N/A'} ms
        `;

        // Redraw the canvas
        draw();

        // Request the next animation frame
        animationFrame = requestAnimationFrame(animateScenario3);

    } catch (error) {
        console.error("Error in animateScenario3:", error);
        cancelAnimationFrame(animationFrame);
    }
}

function setScenario(num) {
    if (num === 2 && !isScenario1Complete) {
        alert("Please complete Scenario 1 first.");
        return;
    }
    if (num === 3 && !isScenario2Complete) {
        alert("Please complete Scenario 2 first.");
        return;
    }

    currentScenario = num;

    // Show/hide inputs based on the selected scenario
    document.getElementById('scenario1-inputs').style.display = num === 1 ? 'block' : 'none';
    document.getElementById('scenario2-inputs').style.display = num === 2 ? 'block' : 'none';
    document.getElementById('scenario3-inputs').style.display = num === 3 ? 'block' : 'none';

    // Reset receiver and wall positions for the new scenario
    if (num === 1) {
        receiver.x = transmitter.x + receiver.initialDistance;
        receiver.velocity = 0;
        wall.x = -1000; // Hide the wall
    } else if (num === 2) {
        receiver.x = transmitter.x + 200; // Fixed receiver position
        wall.x = transmitter.x + parseFloat(document.getElementById('wallSlider').value);
    } else if (num === 3) {
        receiver.x = transmitter.x + receiver.initialDistance;
        wall.x = transmitter.x + parseFloat(document.getElementById('wallSlider3').value);
    }

    draw(); // Redraw the canvas
}


function resetSimulation() {
    // Stop any ongoing animation
    cancelAnimationFrame(animationFrame);

    // Reset scenario flags
    isScenario1Complete = false;
    isScenario2Complete = false;

    // Reset inputs to default values
    document.getElementById('frequency').value = '100';
    document.getElementById('velocity').value = '0';
    document.getElementById('initialDistance').value = '300';
    document.getElementById('distance').value = '100';
    document.getElementById('wallSlider').value = '0';
    document.getElementById('wallSlider3').value = '0';

    // Reset receiver state
    receiver.x = transmitter.x + receiver.initialDistance;
    receiver.velocity = 0;
    receiver.direction = 1;
    receiver.isFlipped = false;

    // Reset wall position
    wall.x = -1000; // Move the wall off-screen

    // Clear results
    resultsDiv.innerHTML = '';

    // Redraw the simulation
    draw();

    // Log reset for debugging
    console.log("Simulation reset to initial state");
}


function startCalculation() {
    // Stop any ongoing animation
    cancelAnimationFrame(animationFrame);

    const frequency = parseFloat(document.getElementById('frequency').value) * 1e6; // Convert MHz to Hz
    const distance = parseFloat(document.getElementById('distance').value); // Receiver distance

    if (currentScenario === 1) {
        // Scenario 1: Free Space
        const velocity = parseFloat(document.getElementById('velocity').value);

        // Scenario 1 calculations
        maxDopplerShift = calculateMaxDopplerShift(frequency, velocity);
        receiver.velocity = velocity;
        receiver.x = transmitter.x + distance;
        receiver.direction = 1;

        animateScenario1();
        isScenario1Complete = true
    } else if (currentScenario === 2) {
        // Scenario 2: Reflection
        const obstacleDistance = parseFloat(document.getElementById('wallSlider').value);

        // Scenario 2 calculations
        const directPathDistance = distance;
        const reflectedPathDistance = 2 * obstacleDistance - directPathDistance;
        const delaySpread = Math.abs((reflectedPathDistance / c) - (directPathDistance / c));
        const coherenceBandwidth = 1 / (2 * delaySpread);

        // Position objects for scenario 2
        receiver.x = transmitter.x + distance; // Receiver fixed position
        wall.x = transmitter.x + obstacleDistance; // Wall position based on slider

        // Update results for Scenario 2
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `
            Direct Path Distance: ${directPathDistance.toFixed(1)} m<br>
            Reflected Path Distance: ${reflectedPathDistance.toFixed(1)} m<br>
            Delay Spread: ${(delaySpread * 1e9).toFixed(2)} ns<br>
            Coherence Bandwidth: ${(coherenceBandwidth / 1e6).toFixed(2)} MHz
        `;

        draw();
        isScenario2Complete = true;
    } else if (currentScenario === 3) {
        // Scenario 3: Combination of Free Space and Reflection
        const velocity = parseFloat(document.getElementById('velocity').value);
        const obstacleDistance = parseFloat(document.getElementById('wallSlider').value);
        
        // Calculate distance between transmitter and receiver
        const distance = Math.abs(receiver.x - transmitter.x);

        // Scenario 3 calculations
        const directPathDistance = distance;
        const reflectedPathDistance = obstacleDistance > transmitter.x && obstacleDistance < receiver.x 
            ? Math.sqrt(Math.pow(obstacleDistance - transmitter.x, 2)) + 
            Math.sqrt(Math.pow(receiver.x - obstacleDistance, 2))
            : 0;

        // Check if the wall is between the transmitter and receiver
        const isSignalBlocked = obstacleDistance > transmitter.x && obstacleDistance < receiver.x;

        let delaySpread = 0;
        let coherenceBandwidth = 0;
        let dopplerSpread = 0;
        let coherenceTime = 0;

        if (reflectedPathDistance > 0) {
            // Compute Delay Spread and Coherence Bandwidth
            delaySpread = Math.abs((reflectedPathDistance / c) - (directPathDistance / c));
            coherenceBandwidth = 1 / (2 * delaySpread);

            // Compute Doppler Spread and Coherence Time
            dopplerSpread = calculateMaxDopplerShift(frequency, velocity);
            coherenceTime = 1 / (2 * dopplerSpread);
        }

        // Update results for Scenario 3
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `
            Direct Path Distance: ${directPathDistance.toFixed(1)} m<br>
            Reflected Path Distance: ${reflectedPathDistance > 0 ? reflectedPathDistance.toFixed(1) : 'N/A'} m<br>
            ${isSignalBlocked ? "Wall is between transmitter and receiver<br>" : ""}
            Delay Spread: ${reflectedPathDistance > 0 ? (delaySpread * 1e9).toFixed(2) : 'N/A'} ns<br>
            Coherence Bandwidth: ${reflectedPathDistance > 0 ? (coherenceBandwidth / 1e6).toFixed(2) : 'N/A'} MHz<br>
            Doppler Spread: ${reflectedPathDistance > 0 ? dopplerSpread.toFixed(2) : 'N/A'} Hz<br>
            Coherence Time: ${reflectedPathDistance > 0 ? (coherenceTime * 1000).toFixed(2) : 'N/A'} ms<br>
            Instantaneous Frequency: ${((frequency + calculateInstantaneousDopplerShift()) / 1e6).toFixed(2)} MHz
        `;

        // Debugging
        console.log("Scenario 3:", {
            directPathDistance,
            reflectedPathDistance,
            delaySpread,
            coherenceBandwidth,
            dopplerSpread,
            coherenceTime,
            isSignalBlocked,
        });

        animateScenario3();
    }
}

function drawArrowhead(context, fromX, fromY, toX, toY) {
    const headLength = 20; // Increased length of the arrowhead
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    context.beginPath();
    context.moveTo(midX, midY);
    context.lineTo(midX - headLength * Math.cos(angle - Math.PI / 6), midY - headLength * Math.sin(angle - Math.PI / 6));
    context.lineTo(midX - headLength * Math.cos(angle + Math.PI / 6), midY - headLength * Math.sin(angle + Math.PI / 6));
    context.lineTo(midX, midY);
    context.closePath();
    context.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentScenario === 1) {
        // Scenario 1 code remains unchanged
        ctx.drawImage(transmitter.img, transmitter.x - 40, transmitter.y - 40, 80, 80);
        ctx.fillStyle = '#1e293b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText("Transmitter", transmitter.x, transmitter.y - 50);
        
        // Draw receiver with flipping
        ctx.save(); // Save the current context state
        if (receiver.isFlipped) {
            ctx.translate(receiver.x, receiver.y);
            ctx.scale(-1, 1); // Flip horizontally
            ctx.drawImage(receiver.img, -30, -30, 60, 60); // Adjust for flipped coordinates
            ctx.translate(-receiver.x, -receiver.y); // Reset translation
        } else {
            ctx.drawImage(receiver.img, receiver.x - 30, receiver.y - 30, 60, 60);
        }
        ctx.restore(); // Restore the context to its original state

        ctx.fillText("Receiver", receiver.x, receiver.y - -50);

        // Draw the signal
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(transmitter.x, transmitter.y);
        ctx.lineTo(receiver.x, receiver.y);
        ctx.stroke();
        drawArrowhead(ctx, transmitter.x, transmitter.y, receiver.x, receiver.y); // Add arrowhead
        ctx.setLineDash([]);
    } else if (currentScenario === 2) {
        const transmitterX = 50;
        const commonY = receiver.y;

        // Draw transmitter
        ctx.drawImage(transmitter.img, transmitterX - 40, commonY - 30, 80, 80);
        ctx.fillStyle = '#1e293b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText("Transmitter", transmitterX, commonY - 50);

        // Draw receiver
        ctx.drawImage(receiver.img, receiver.x - 30, commonY - 10, 60, 60);
        ctx.fillText("Receiver", receiver.x, commonY - 50);

        // Draw wall
        ctx.fillStyle = '#64748b';
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        ctx.fillText("Wall", wall.x + wall.width / 2, wall.y - 10);

        // Check if wall is between transmitter and receiver
        if (wall.x > transmitterX && wall.x < receiver.x) {
            // Do not display any signal
        } else {
            // Draw complete direct path
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(transmitterX, commonY + 20);  // Changed from -20 to +20
            ctx.lineTo(receiver.x, commonY + 20);    // Changed from -20 to +20
            ctx.stroke();
            drawArrowhead(ctx, transmitterX, commonY + 20, receiver.x, commonY + 20); // Add arrowhead

            // Draw reflected path
            ctx.strokeStyle = '#ef4444';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(transmitterX, commonY - 20);  // Changed from +20 to -20
            
            const wallCenterX = wall.x + wall.width / 2;
            const reflectionY = wall.y + wall.height / 3;
            ctx.lineTo(wallCenterX, reflectionY);
            ctx.lineTo(receiver.x, commonY - -10);    // Changed from +20 to -20
            ctx.stroke();
            drawArrowhead(ctx, wallCenterX, reflectionY, receiver.x, commonY - -10); // Add arrowhead
            
            ctx.setLineDash([]);

            // Add reflection point marker
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(wallCenterX, reflectionY, 3, 0, Math.PI * 2);
            ctx.fill();
        }

    } else if (currentScenario === 3) {
        // Set receiver.y if not already set
        if (!receiver.y) {
            receiver.y = canvas.height / 2; // Same as transmitter.y
        }
        const commonY = receiver.y;

        // Draw transmitter
        ctx.drawImage(transmitter.img, transmitter.x - 40, transmitter.y - 40, 80, 80);
        ctx.fillStyle = '#1e293b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText("Transmitter", transmitter.x, transmitter.y - 50);

        // Update receiver's flipped state
        if (receiver.direction === -1) {
            receiver.isFlipped = true;
        } else {
            receiver.isFlipped = false;
        }

        // Draw receiver with flipping
        ctx.save(); // Save the current context state
        if (receiver.isFlipped) {
            // Translate to receiver position and flip horizontally
            ctx.translate(receiver.x - 30, receiver.y - 30); // Adjust to the receiver's position
            ctx.scale(-1, 1); // Flip horizontally
            ctx.drawImage(receiver.img, -60, 0, 60, 60); // Draw the flipped image
        } else {
            ctx.drawImage(receiver.img, receiver.x - 30, receiver.y - 30, 60, 60); // Draw normally
        }
        ctx.restore(); // Restore the context to its original state

        ctx.fillText("Receiver", receiver.x, receiver.y - -50);

        // Draw wall (Scenario 2)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(wall.x, wall.y + 50, wall.width, wall.height);

        // Draw direct path - Starting from transmitter center
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(transmitter.x, transmitter.y); // Start from transmitter center
        ctx.lineTo(receiver.x, commonY);
        ctx.stroke();
        drawArrowhead(ctx, transmitter.x, transmitter.y, receiver.x, commonY); // Add arrowhead

        // Draw reflected path - Transmitter to wall
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        const wallCenterX = wall.x + wall.width / 2;
        const reflectionY = wall.y + wall.height / 2;
        ctx.moveTo(transmitter.x, transmitter.y); // Start from transmitter
        ctx.lineTo(wallCenterX, reflectionY);
        ctx.stroke();
        drawArrowhead(ctx, transmitter.x, transmitter.y, wallCenterX, reflectionY); // Arrowhead from transmitter to wall

        // Draw signal from wall to receiver
        ctx.beginPath();
        ctx.moveTo(wallCenterX, reflectionY);
        ctx.lineTo(receiver.x, commonY);
        ctx.stroke();
        drawArrowhead(ctx, wallCenterX, reflectionY, receiver.x, commonY); // Arrowhead from wall to receiver
    }
}
