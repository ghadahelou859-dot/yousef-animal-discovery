const lessons = [
  {
    title: "What kinds of animals are there?",
    question: "Animals are everywhere!",
    emoji: "🦒",
    image: "assets/images/lesson-1.jpg",
    intro: "Animals come in many sizes, shapes and colours. We can observe their bodies and notice how they are alike and different.",
    facts: ["Some animals are very big, like giraffes.", "Some animals are small, like insects.", "Animals can fly, crawl, walk, swim or slither."],
    compare: "Which is bigger: a polar bear or a frog? Which animal can fly?"
  },
  {
    title: "How do animals move?",
    question: "Animals move in many ways.",
    emoji: "🐍",
    image: "assets/images/lesson-2.jpg",
    intro: "Animals use different body parts to move from place to place.",
    facts: ["A dog uses its legs to walk and run.", "A snake slithers on the ground.", "A fish uses fins to swim.", "A duck uses its webbed feet to swim."],
    compare: "A snake and a fish have no legs. How is their movement different?"
  },
  {
    title: "What coverings do animals have?",
    question: "Coverings protect animals.",
    emoji: "🐦",
    image: "assets/images/lesson-3.jpg",
    intro: "Animal coverings help them stay warm, move and stay safe.",
    facts: ["Fur keeps a cat warm.", "Feathers keep a bird warm and help keep water out.", "Fish scales are slippery and help fish swim.", "A shell protects the soft body inside."],
    compare: "Touch a soft fabric and a smooth surface. Which feels more like fur? Which feels more like scales?"
  },
  {
    title: "What is an insect?",
    question: "Insects creep, crawl and fly.",
    emoji: "🦋",
    image: "assets/images/lesson-4.jpg",
    intro: "An insect is an animal with three main body parts.",
    facts: ["The three parts are the head, thorax and abdomen.", "Insects have six legs.", "Butterflies, beetles, flies, ants and grasshoppers are insects."],
    compare: "Count the legs on an ant. Does a spider have the same number of legs?"
  },
  {
    title: "What are the parts of an ant?",
    question: "Meet the ant — our tiny lesson hero!",
    emoji: "🐜",
    image: "assets/images/lesson-5.jpg",
    intro: "An ant is an insect. Its body is divided into three clear sections.",
    facts: ["The head has eyes, a mouth and antennae.", "The thorax is the middle body part and holds the six legs.", "The abdomen is the back body part."],
    compare: "Point to the head, thorax and abdomen in the book picture. Which part holds the legs?"
  },
  {
    title: "What do animals need?",
    question: "Every animal has basic needs.",
    emoji: "🕷️",
    image: "assets/images/lesson-6.jpg",
    intro: "Animals need food, water, air and a safe place to live.",
    facts: ["Birds may eat berries for food and water.", "A spider catches insects in its web.", "Animals live in habitats that help meet their needs."],
    compare: "A fox and a spider eat different food, but what needs do they share?"
  }
];

const questions = [
  { q: "Which animal can slither?", a: ["Snake", "Duck", "Cat"], c: 0 },
  { q: "What does a fish use to swim?", a: ["Wings", "Fins", "Fur"], c: 1 },
  { q: "What covering keeps a cat warm?", a: ["Scales", "Shell", "Fur"], c: 2 },
  { q: "How many main body parts does an insect have?", a: ["Two", "Three", "Five"], c: 1 },
  { q: "How many legs does an insect have?", a: ["Four", "Six", "Eight"], c: 1 },
  { q: "Which is the middle part of an ant?", a: ["Thorax", "Head", "Abdomen"], c: 0 },
  { q: "What protects the soft body of some animals?", a: ["A shell", "A fin", "A wing"], c: 0 },
  { q: "Which animal catches insects in a web?", a: ["Fox", "Spider", "Bird"], c: 1 },
  { q: "What do all animals need?", a: ["Toys", "Food and water", "Shoes"], c: 1 },
  { q: "Which one is an insect?", a: ["Ant", "Fish", "Snake"], c: 0 }
];

const screens = [...document.querySelectorAll(".screen")];
const map = document.getElementById("lessonMap");
const welcomeVideo = document.getElementById("welcomeVideo");
let lessonIndex = 0;
let questionIndex = 0;
let score = 0;
let timerId = null;
let timeLeft = 10;
let answering = false;

function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle("active", screen.id === id));
  window.scrollTo(0, 0);
}

lessons.forEach((lesson, index) => {
  const button = document.createElement("button");
  button.className = "lesson-node";
  button.type = "button";
  button.innerHTML = `<span class="emoji">${lesson.emoji}</span><small>Lesson ${index + 1}</small><strong>${lesson.title}</strong>`;
  button.addEventListener("click", () => openLesson(index));
  map.appendChild(button);
});

document.getElementById("startBtn").addEventListener("click", () => {
  showScreen("videoScreen");
  welcomeVideo.play().catch(() => {});
});
welcomeVideo.addEventListener("ended", () => showScreen("mapScreen"));
document.getElementById("skipVideo").addEventListener("click", () => {
  welcomeVideo.pause();
  showScreen("mapScreen");
});
document.querySelectorAll(".go-map").forEach(button => button.addEventListener("click", () => {
  stopQuizTimer();
  speechSynthesis.cancel();
  showScreen("mapScreen");
}));
document.querySelectorAll(".go-welcome").forEach(button => button.addEventListener("click", () => showScreen("welcome")));

function openLesson(index) {
  lessonIndex = (index + lessons.length) % lessons.length;
  const lesson = lessons[lessonIndex];
  document.getElementById("lessonNumber").textContent = `Lesson ${lessonIndex + 1}`;
  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("lessonQuestion").textContent = lesson.question;
  document.getElementById("lessonIntro").textContent = lesson.intro;
  document.getElementById("lessonImage").src = lesson.image;
  document.getElementById("lessonImage").alt = `Original book page: ${lesson.title}`;
  document.getElementById("animalBadge").textContent = lesson.emoji;
  document.getElementById("lessonFacts").innerHTML = lesson.facts.map(fact => `<li>${fact}</li>`).join("");
  document.getElementById("lessonCompare").textContent = lesson.compare;
  document.getElementById("previousLesson").disabled = lessonIndex === 0;
  document.getElementById("nextLesson").textContent = lessonIndex === lessons.length - 1 ? "Take the challenge" : "Next lesson";
  showScreen("lessonScreen");
}

document.getElementById("previousLesson").addEventListener("click", () => openLesson(lessonIndex - 1));
document.getElementById("nextLesson").addEventListener("click", () => {
  if (lessonIndex === lessons.length - 1) startQuiz(); else openLesson(lessonIndex + 1);
});
document.getElementById("speakLesson").addEventListener("click", () => {
  const lesson = lessons[lessonIndex];
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`${lesson.title}. ${lesson.intro}. ${lesson.facts.join(". ")}`);
  utterance.lang = "en-US";
  utterance.rate = .88;
  speechSynthesis.speak(utterance);
});

document.getElementById("openQuiz").addEventListener("click", startQuiz);
document.getElementById("retryQuiz").addEventListener("click", startQuiz);

function startQuiz() {
  questionIndex = 0;
  score = 0;
  showScreen("quizScreen");
  renderQuestion();
}

function renderQuestion() {
  answering = false;
  const item = questions[questionIndex];
  document.getElementById("questionCount").textContent = `Question ${questionIndex + 1} of ${questions.length}`;
  document.getElementById("questionText").textContent = item.q;
  document.getElementById("quizProgress").style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  document.getElementById("quizFeedback").textContent = "";
  const answers = document.getElementById("answers");
  answers.innerHTML = "";
  item.a.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = answer;
    button.addEventListener("click", () => chooseAnswer(index, button));
    answers.appendChild(button);
  });
  startQuizTimer();
}

function startQuizTimer() {
  stopQuizTimer();
  timeLeft = 10;
  document.getElementById("timerValue").textContent = timeLeft;
  timerId = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("timerValue").textContent = timeLeft;
    if (timeLeft <= 0) finishAnswer(null);
  }, 1000);
}

function stopQuizTimer() {
  clearInterval(timerId);
  timerId = null;
}

function chooseAnswer(index, button) {
  if (answering) return;
  button.dataset.chosen = "true";
  finishAnswer(index);
}

function finishAnswer(chosenIndex) {
  if (answering) return;
  answering = true;
  stopQuizTimer();
  const item = questions[questionIndex];
  const buttons = [...document.querySelectorAll(".answer-button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.c) button.classList.add("correct");
    if (button.dataset.chosen && index !== item.c) button.classList.add("wrong");
  });
  const correct = chosenIndex === item.c;
  if (correct) score += 1;
  document.getElementById("quizFeedback").textContent = correct ? "Great job!" : chosenIndex === null ? "Time is up!" : `Good try! The answer is ${item.a[item.c]}.`;
  setTimeout(() => {
    questionIndex += 1;
    if (questionIndex < questions.length) renderQuestion(); else showResult();
  }, 1200);
}

function showResult() {
  stopQuizTimer();
  document.getElementById("scoreText").textContent = `You answered ${score} out of ${questions.length} questions correctly.`;
  document.getElementById("resultTitle").textContent = score >= 8 ? "Amazing explorer!" : score >= 5 ? "Great exploring!" : "Keep discovering!";
  showScreen("resultScreen");
}

document.querySelectorAll("#ratingButtons button").forEach(button => {
  button.addEventListener("click", () => {
    const rating = Number(button.dataset.rating);
    localStorage.setItem("animalLessonRating", String(rating));
    document.querySelectorAll("#ratingButtons button").forEach((star, index) => star.classList.toggle("selected", index < rating));
  });
});

const savedRating = Number(localStorage.getItem("animalLessonRating") || 0);
document.querySelectorAll("#ratingButtons button").forEach((star, index) => star.classList.toggle("selected", index < savedRating));

// Add the final WhatsApp and Facebook links here when they are available.
document.getElementById("whatsappLink").addEventListener("click", event => {
  if (event.currentTarget.getAttribute("href") === "#") event.preventDefault();
});
document.getElementById("facebookLink").addEventListener("click", event => {
  if (event.currentTarget.getAttribute("href") === "#") event.preventDefault();
});
