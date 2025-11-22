<!DOCTYPE html>
<html>
<head>
    <title>Digital Mimic - Real Time Face to Emoji</title>
    <script src="https://cdn.jsdelivr.net/npm/face-api.js"></script>
    <style>
        body { text-align: center; font-family: Arial; }
        video { width: 350px; border-radius: 12px; }
        #emoji { font-size: 80px; margin-top: 20px; }
    </style>
</head>

<body>
    <h1>Digital Mimic 😊 → 😃</h1>
    <video id="video" autoplay muted></video>
    <div id="emoji">🙂</div>

    <script>
        async function start() {
            await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models/")
            await faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models/")

            const video = document.getElementById("video")
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => { video.srcObject = stream })

            video.addEventListener("playing", () => {
                setInterval(async () => {
                    const detections = await faceapi.detectSingleFace(video, 
                        new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()

                    if (detections) {
                        const exp = detections.expressions
                        const emojiMap = {
                            happy: "😄",
                            sad: "😢",
                            angry: "😡",
                            surprised: "😮",
                            fearful: "😨",
                            disgusted: "🤢",
                            neutral: "🙂"
                        }

                        let best = Object.keys(exp).reduce((a, b) => exp[a] > exp[b] ? a : b)
                        document.getElementById("emoji").innerHTML = emojiMap[best]
                    }
                }, 500)
            })
        }
        start()
    </script>
</body>
</html>