const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const emojiSVG = document.getElementById('custom-emoji');
const exprText = document.getElementById('expression-name');
const startBtn = document.getElementById('start-btn');
const downloadBtn = document.getElementById('download-btn');

// Customization elements
const faceColorInput = document.getElementById('faceColor');
const accessorySelect = document.getElementById('accessory');

let faceMesh, camera;
let currentFaceColor = faceColorInput.value; // Default value
let currentAccessory = accessorySelect.value;

// Update customization on user action
faceColorInput.addEventListener('input', (e) => {
    currentFaceColor = e.target.value;
});
accessorySelect.addEventListener('input', (e) => {
    currentAccessory = e.target.value;
});

// Build an original emoji from a detected expression (SVG)
function drawCustomEmoji(expr, styling) {
    emojiSVG.innerHTML = "";

    // Face color: prioritizes user choice
    let color = currentFaceColor || styling.faceColor || "#FFE066";
    emojiSVG.innerHTML += `<circle cx="80" cy="80" r="70" fill="${color}" stroke="#bca057" stroke-width="5"/>`;

    // Eyes
    if (expr === "happy" || expr === "veryHappy") {
        emojiSVG.innerHTML += `<ellipse cx="55" cy="90" rx="10" ry="8" fill="#1b2000"/>
        <ellipse cx="105" cy="90" rx="10" ry="8" fill="#1b2000"/>`;
    } else if (expr === "sad") {
        emojiSVG.innerHTML += `<ellipse cx="55" cy="95" rx="10" ry="7" fill="#2f2a2f"/>
        <ellipse cx="105" cy="95" rx="10" ry="7" fill="#2f2a2f"/>`;
    } else if (expr === "surprised" || expr === "confused") {
        emojiSVG.innerHTML += `<ellipse cx="55" cy="80" rx="8" ry="12" fill="#222"/>
        <ellipse cx="105" cy="80" rx="8" ry="12" fill="#222"/>`;
    } else if (expr === "wink") {
        emojiSVG.innerHTML += `<ellipse cx="55" cy="92" rx="12" ry="7" fill="#222"/>
        <rect x="100" y="82" width="18" height="3" rx="1.5" fill="#222"/>`;
    } else {
        emojiSVG.innerHTML += `<ellipse cx="55" cy="90" rx="9" ry="8.5" fill="#1a1a1a"/>
        <ellipse cx="105" cy="90" rx="9" ry="8.5" fill="#1a1a1a"/>`;
    }

    // Mouth
    if (expr === "happy" || expr === "veryHappy") {
        emojiSVG.innerHTML += `<path d="M55 120 Q80 140 105 120" stroke="#c95a38" stroke-width="8" fill="none" stroke-linecap="round"/>`;
        if (expr === "veryHappy") {
            emojiSVG.innerHTML += `<ellipse cx="80" cy="128" rx="18" ry="11" fill="#fff"/>`;
        }
    } else if (expr === "sad") {
        emojiSVG.innerHTML += `<path d="M55 130 Q80 110 105 130" stroke="#372250" stroke-width="6" fill="none"/>`;
    } else if (expr === "surprised") {
        emojiSVG.innerHTML += `<ellipse cx="80" cy="125" rx="12" ry="16" fill="#fff" stroke="#444" stroke-width="3"/>`;
    } else if (expr === "confused") {
        emojiSVG.innerHTML += `<path d="M65 125 Q80 105 95 125" stroke="#333" stroke-width="7" fill="none"/>`;
    } else if (expr === "wink") {
        emojiSVG.innerHTML += `<path d="M65 120 Q80 127 95 120" stroke="#c95a38" stroke-width="6" fill="none"/>`;
    } else {
        emojiSVG.innerHTML += `<rect x="67" y="120" width="26" height="8" rx="4" fill="#444"/>`;
    }

    // Accessories - prioritizing user selection
    if (currentAccessory === "glasses") {
        emojiSVG.innerHTML += `<ellipse cx="55" cy="90" rx="15" ry="11" fill="none" stroke="#1a1a1a" stroke-width="4"/>
            <ellipse cx="105" cy="90" rx="15" ry="11" fill="none" stroke="#1a1a1a" stroke-width="4"/>
            <rect x="70" y="87" width="20" height="3" fill="#1a1a1a" rx="1.5"/>`;
    }
    if (currentAccessory === "hat") {
        emojiSVG.innerHTML += `<rect x="35" y="40" width="90" height="24" rx="16" fill="#3a1a3d"/>
            <ellipse cx="80" cy="56" rx="35" ry="16" fill="#6f42c1"/>`;
    }
    if (currentAccessory === "blush") {
        emojiSVG.innerHTML += `<ellipse cx="55" cy="110" rx="9" ry="4.5" fill="#FFC0CB" opacity="0.7"/>
            <ellipse cx="105" cy="110" rx="9" ry="4.5" fill="#FFC0CB" opacity="0.7"/>`;
    }
    if (currentAccessory === "stars") {
        emojiSVG.innerHTML += `<polygon points="40,60 42,66 48,66 43,70 45,77 40,73 35,77 37,70 32,66 38,66" fill="orange"/>
            <polygon points="120,60 122,65 128,65 123,70 125,76 120,72 115,76 117,70 112,65 118,65" fill="orange"/>`;
    }
}

const exprMap = {
    neutral: "Neutral",
    happy: "Happy",
    veryHappy: "Very Happy",
    sad: "Sad",
    surprised: "Surprised",
    wink: "Wink",
    confused: "Confused"
};

function detectExpression(landmarks) {
    const leftEye = landmarks[159], rightEye = landmarks[386], nose = landmarks[1];
    const leftMouth = landmarks[61], rightMouth = landmarks[291];
    const topLip = landmarks[13], bottomLip = landmarks[14];
    const leftEyebrow = landmarks[70], rightEyebrow = landmarks[300];

    const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
    const mouthHeight = Math.abs(bottomLip.y - topLip.y);

    const smileRatio = mouthWidth / mouthHeight;

    const eyebrowHeight = (leftEyebrow.y + rightEyebrow.y) / 2;
    const eyeHeight = (leftEye.y + rightEye.y) / 2;
    const eyebrowRaise = eyeHeight - eyebrowHeight;

    if (smileRatio > 3.6) {
        return "veryHappy";
    } else if (smileRatio > 2.9) {
        if (eyebrowRaise > 0.065) return "wink";
        return "happy";
    } else if (mouthHeight > 0.035 && eyebrowRaise > 0.06) {
        return "surprised";
    } else if (mouthHeight < 0.022 && eyebrowRaise < 0.03) {
        return "sad";
    } else if (eyebrowRaise < 0.01) {
        return "confused";
    }
    return "neutral";
}

function initFaceMesh() {
    faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    faceMesh.onResults(onResults);
}
function drawMesh(landmarks) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = "#10B981";
    for (const lm of landmarks) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 1.6, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.restore();
}
function onResults(results) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        drawMesh(landmarks);

        const expr = detectExpression(landmarks);
        drawCustomEmoji(expr, {});

        exprText.textContent = exprMap[expr];
        downloadBtn.style.display = "inline-block";
    } else {
        emojiSVG.innerHTML = "";
        exprText.textContent = "Waiting for face...";
        downloadBtn.style.display = "none";
    }
}
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        video.srcObject = stream;
        camera = new Camera(video, {
            onFrame: async () => {
                await faceMesh.send({ image: video });
            },
            width: 320,
            height: 240
        });
        camera.start();
        startBtn.style.display = "none";
    } catch (err) {
        alert("Camera access failed. Please allow permissions.");
        console.error(err);
    }
}
function downloadEmoji() {
    // Create image from SVG
    const svgData = new XMLSerializer().serializeToString(emojiSVG);
    const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = function() {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = 160;
        tmpCanvas.height = 160;
        
        const tmpCtx = tmpCanvas.getContext('2d');
        tmpCtx.drawImage(img, 0, 0);

        const link = document.createElement('a');
        link.download = `custom-emoji-${Date.now()}.png`;
        link.href = tmpCanvas.toDataURL("image/png");
        link.click();

        URL.revokeObjectURL(url);
    };
    img.src = url;
}
startBtn.addEventListener("click", () => {
    initFaceMesh();
    startCamera();
});
downloadBtn.addEventListener("click", downloadEmoji);
