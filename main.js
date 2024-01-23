const video = document.querySelector("#video");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
let predictedAges = [];
const yourAge = document.querySelector("#age");
const yourGender = document.querySelector("#gender");
const yourEmoji = document.querySelector("#emotion");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}
function screenResize(isScreenSmall) {
  if (isScreenSmall.matches) {
    // If media query matches
    video.style.width = "320px";
  } else {
    video.style.width = "500px";
  }
}

screenResize(isScreenSmall); // Call listener function at run time
isScreenSmall.addListener(screenResize);

video.addEventListener("playing", () => {
  console.log("playing called");
  const canvas = faceapi.createCanvasFromMedia(video);
  let container = document.querySelector(".container");
  container.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    console.log(resizedDetections);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    if (resizedDetections && Object.keys(resizedDetections).length > 0) {
      const age = resizedDetections.age;
      const interpolatedAge = interpolateAgePredictions(age);
      const gender = resizedDetections.gender;
      const expressions = resizedDetections.expressions;
      const maxValue = Math.max(...Object.values(expressions));
      const emotion = Object.keys(expressions).filter(
        item => expressions[item] === maxValue
      );
      yourAge.innerText = `Age - ${Math.trunc(interpolatedAge)}`;
      yourGender.innerText = `Gender - ${gender}`;
      gender == 'female' ?
        yourGender.style.background ='pink'
        : yourGender.style.background ='blue';
      if(emotion[0] === 'neutral'){
        yourEmoji.innerText = `Emotion - ${emotion[0]} 😐`
      } else if(emotion[0] === 'sad') {
        yourEmoji.innerText = `Emotion - ${emotion[0]} 🙁`
      } else if(emotion[0] === 'happy') {
        yourEmoji.innerText = `Emotion - ${emotion[0]} 😀`
      } else if(emotion[0] === 'surprised') {
        yourEmoji.innerText = `Emotion - ${emotion[0]} 😮`
      } else if(emotion[0] === 'angry') {
        yourEmoji.innerText = `Emotion - ${emotion[0]} 😡`
      } else {
        yourEmoji.innerText = `Emotion - ${emotion[0]}`
      }
    }
  }, 10);
});

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}

gsap.to('h1', {
  duration: 1,
  text: "Let's find your emotion!",
  ease: "none",
  repeat: -1,
  repeatDelay: 1,
  yoyo: 1
})

let headersTL = gsap.timeline()

headersTL.from("#emotion", {
    duration: 2, opacity:0, x: -400, ease: 'power2.inOut'
    })
    .from("#gender", {
         duration: 1, opacity:0, x: -400, ease: 'power2.inOut'
    })
    .from("#age", {
        duration: 1, opacity:0, x: -400, ease: 'power2.inOut'
    })




