function openPart(evt, name) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
}
var outputDisplayed = {
    output1: false,
    output2: false,
    output3: false
};

function getOutput() {
    var r1 = parseFloat(document.getElementById("r1").value);
    var v1 = parseFloat(document.getElementById("v1").value);
    var f1 = parseFloat(document.getElementById("f1").value);
    
    // Perform calculations based on the input values
    var dopplerSpread = (f1 * 1e6 * v1) / 3e8; // Doppler Spread formula
    var coherenceTime = 3e8 / (4 * dopplerSpread); // Coherence time formula
    
    // Format the output in scientific notation
    var dopplerSpreadFormatted = dopplerSpread.toExponential(2); // 2 decimal places
    var coherenceTimeFormatted = coherenceTime.toExponential(2); // 2 decimal places
    
    // Display the results in the Observations section
    var observations1 = document.getElementById("observations1");
    observations1.innerHTML = ""; // Clear previous content
    observations1.innerHTML += "<br>Case I:";
    observations1.innerHTML += "<br>Doppler Spread: " + dopplerSpreadFormatted + " Hz";
    observations1.innerHTML += "<br>Coherence time: " + coherenceTimeFormatted + " s";
    
    // Show additional input fields if needed
    document.getElementById("additionalFields1").style.display = "block";
    document.getElementById("imageDisplay2").style.display = "block";
    hideOutputsExcept("output1");
}


function getOutput2() {
    var r2 = parseFloat(document.getElementById("r2").value);
    var d2 = parseFloat(document.getElementById("d2").value);
    var f2 = parseFloat(document.getElementById("f2").value);
    
    // Perform calculations based on the input values
    var delaySpread = (2 * (d2 - r2)) / 3e8; // Delay Spread formula
    var coherenceBandwidth = 1 / (2 * delaySpread); // Coherence Bandwidth formula
    
    // Format the output in scientific notation
    var delaySpreadFormatted = delaySpread.toExponential(2); // 2 decimal places
    var coherenceBandwidthFormatted = coherenceBandwidth.toExponential(2); // 2 decimal places
    
    // Display the results in the Observations section
    var observations1 = document.getElementById("observations1");
    observations1.innerHTML += "<br>Case II:";
    observations1.innerHTML += "<br>Delay Spread: " + delaySpreadFormatted + " s";
    observations1.innerHTML += "<br>Coherence Bandwidth: " + coherenceBandwidthFormatted + " Hz";
    
    // Show additional input fields if needed
    document.getElementById("additionalFields2").style.display = "block";
    document.getElementById("imageDisplay3").style.display = "block";
    hideOutputsExcept("output2");
}

function getOutput3() {
    var r3 = parseFloat(document.getElementById("r3").value);
    var d3 = parseFloat(document.getElementById("d3").value);
    var v3 = parseFloat(document.getElementById("v3").value);
    var f3 = parseFloat(document.getElementById("f3").value);
    
    // Perform calculations based on the input values
    var dopplerSpread = (f3*1e6 * v3) / 3e8; // Doppler Spread formula
    var coherenceTime = 3e8 / (4 * dopplerSpread); // Coherence time formula
    var delaySpread = (2 * (d3 - r3)) / 3e8; // Delay Spread formula
    var coherenceBandwidth = 1 / (2 * delaySpread); // Coherence Bandwidth formula

    // Format the output in scientific notation
    var dopplerSpreadFormatted = dopplerSpread.toExponential(2); // 2 decimal places
    var coherenceTimeFormatted = coherenceTime.toExponential(2); // 2 decimal places
    var delaySpreadFormatted = delaySpread.toExponential(2); // 2 decimal places
    var coherenceBandwidthFormatted = coherenceBandwidth.toExponential(2); // 2 decimal places
    
    // Display the results in the Observations section
    var observations1 = document.getElementById("observations1");
    observations1.innerHTML += "<br>Case III:";
    observations1.innerHTML += "<br>Doppler Spread: " + dopplerSpreadFormatted + " Hz";
    observations1.innerHTML += "<br>Coherence time: " + coherenceTimeFormatted + " s";
    observations1.innerHTML += "<br>Delay Spread: " + delaySpreadFormatted + " s";
    observations1.innerHTML += "<br>Coherence Bandwidth: " + coherenceBandwidthFormatted+ " Hz";
    
    // Show additional input fields if needed
    hideOutputsExcept("output3");
}

function hideOutputsExcept(except) {
    for (var key in outputDisplayed) {
        if (key !== except) {
            outputDisplayed[key] = false;
        }
    }
}

function startup()
{
    document.getElementById("default").click();
}

window.onload = startup;