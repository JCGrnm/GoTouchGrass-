let classifier;
let mobilenetModel;
let video;

const startButton = document.getElementById("startButton");
const homePage = document.getElementById("homePage");
const mainApp = document.getElementById("mainApp");
const loader = document.getElementById("loader");

let grassCount = 0;
let notGrassCount = 0;

startButton.addEventListener("click", async () => {
  loader.classList.add("active"); // Show loader

  // Fade out homepage
  homePage.classList.add("fade-out");

  setTimeout(async () => {
    homePage.style.display = "none";
    mainApp.classList.replace("mainApp-hidden", "mainApp-visible"); // Show main app

    // Start webcam
    video = document.getElementById("video");
    await setupWebcam();

    // Load MobileNet model
    mobilenetModel = await mobilenet.load();
    classifier = knnClassifier.create();

    loader.classList.remove("active"); // Hide loader
  }, 1000);
});

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", resolve);
      })
      .catch(reject);
  });
}

function addExample(label) {
  const activation = mobilenetModel.infer(video, true);
  classifier.addExample(activation, label);

  if (label === "grass") {
    grassCount++;
    document.getElementById("grass-count").innerText = grassCount;
  } else {
    notGrassCount++;
    document.getElementById("notgrass-count").innerText = notGrassCount;
  }
}

async function predict() {
  if (classifier.getNumClasses() > 0) {
    const activation = mobilenetModel.infer(video, true);
    const result = await classifier.predictClass(activation);

    const isGrass = result.label === "grass";
    showFeedback(isGrass); // Show feedback above video

    document.getElementById("output").innerText = `Prediction: ${result.label}`;
  }
}

// Event listeners for buttons
document
  .getElementById("addGrass")
  .addEventListener("click", () => addExample("grass"));
document
  .getElementById("addNotGrass")
  .addEventListener("click", () => addExample("not grass"));
document.getElementById("predictButton").addEventListener("click", predict);

// Function to show feedback
function showFeedback(isGrass) {
  const feedback = document.getElementById("feedback");

  // Update text and style based on prediction result
  if (isGrass) {
    feedback.innerText = "Nice one, you finally went out of the cave! 🌿";
    feedback.classList.add("success");
    feedback.classList.remove("failure");
  } else {
    feedback.innerText = "You loser, it ain't grass! Try again. 😜";
    feedback.classList.add("failure");
    feedback.classList.remove("success");
  }

  // Make feedback visible with animation
  feedback.classList.add("visible");

  // Hide feedback after 3 seconds
  setTimeout(() => {
    feedback.classList.remove("visible");
  }, 3000);
}
