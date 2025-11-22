const video = document.getElementById("webcam");
const emojiDisplay = document.getElementById("emojiDisplay");

// face expression thresholds
const mouthOpenThreshold = 0.03;

// Load Camera
const camera = new Camera(video, {
    onFrame: async () => {
        await faceMesh.send({image: video});
    },
    width: 420,
    height: 320
});
camera.start();

// FaceMesh setup
const faceMesh = new FaceMesh({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// Emoji mapping based on landmarks
faceMesh.onResults(results => {
    if (!results.multiFaceLandmarks.length) return;

    const points = results.multiFaceLandmarks[0];

    const topLip = points[13];
    const bottomLip = points[14];
    const leftEye = points[159];
    const rightEye = points[386];

    let mouthOpen = Math.abs(bottomLip.y - topLip.y);
    let eyeLeft = leftEye.y;
    let eyeRight = rightEye.y;

    let emoji = "😐"; // default

    if (mouthOpen > mouthOpenThreshold) emoji = "😮"; // Surprised open mouth
    if (eyeLeft < 0.32 && eyeRight < 0.32) emoji = "😉"; // Eyes squeezed
    if (mouthOpen < 0.01 && eyeLeft < 0.35) emoji = "😊"; // Smile-ish

    emojiDisplay.innerHTML = emoji;
});
