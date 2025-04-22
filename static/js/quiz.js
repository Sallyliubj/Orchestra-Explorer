// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  const quizStart = document.getElementById("quiz-start");
  const question1 = document.getElementById("question-1");
  const question2 = document.getElementById("question-2");
  const question3 = document.getElementById("question-3");
  const question4 = document.getElementById("question-4");
  const question5 = document.getElementById("question-5");
  const question6 = document.getElementById("question-6");
  const question7 = document.getElementById("question-7");
  const quizComplete = document.getElementById("quiz-complete");
  const orchestraPerformance = document.getElementById("orchestra-performance");

  const startQuizBtn = document.getElementById("start-quiz-btn");
  const hintBtns = document.querySelectorAll(".hint-btn");
  const hintContents = document.querySelectorAll(".hint-content");
  const options = document.querySelectorAll(".option");
  const nextBtns = document.querySelectorAll('[data-action="next"]');
  const prevBtns = document.querySelectorAll('[data-action="previous"]');
  const soundBtns = document.querySelectorAll(".sound-button");
  const feedbacks = document.querySelectorAll(".feedback");
  const familyInput = document.getElementById("family-input");
  const scoreDisplays = document.querySelectorAll("#current-score");
  const finalScore = document.getElementById("final-score");

  // Current state
  let currentScore = 10;
  let currentQuestion = 0;
  const questions = [
    quizStart,
    question1,
    question2,
    question3,
    question4,
    question5,
    question6,
    question7,
    quizComplete,
    orchestraPerformance,
  ];

  // Handle start quiz
  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", () => {
      showQuestion(1);
    });
  }

  // Handle hint buttons
  hintBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const hintContent = btn
        .closest(".hint-container")
        .querySelector(".hint-content");
      if (hintContent) {
        hintContent.style.display =
          hintContent.style.display === "block" ? "none" : "block";
      }
    });
  });

  // Handle options click
  options.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove selected class from all options in the same question
      const parentQuestion = option.closest(".quiz-container");
      const questionOptions = parentQuestion.querySelectorAll(".option");
      questionOptions.forEach((opt) => {
        opt.classList.remove("selected");
        const checkbox = opt.querySelector(".option-checkbox");
        if (checkbox) {
          checkbox.innerHTML = "";
        }
      });

      // Add selected class to clicked option
      option.classList.add("selected");
      const checkbox = option.querySelector(".option-checkbox");

      // If it's a wrong answer, show feedback
      if (!option.hasAttribute("data-correct")) {
        const feedback = parentQuestion.querySelector(".feedback");
        if (feedback) {
          feedback.style.display = "block";
          if (checkbox) {
            checkbox.innerHTML = "✗";
          }

          // Update score (deduct 1 point)
          currentScore -= 1;
          updateScores();
        }
      } else {
        // Hide feedback if previously shown
        const feedback = parentQuestion.querySelector(".feedback");
        if (feedback) {
          feedback.style.display = "none";
        }
        if (checkbox) {
          checkbox.innerHTML = "✓";
        }
      }
    });
  });

  // Handle next button
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentQuestionIndex = [...questions].findIndex(
        (q) => q.style.display !== "none"
      );
      showQuestion(currentQuestionIndex + 1);
    });
  });

  // Handle previous button
  prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentQuestionIndex = [...questions].findIndex(
        (q) => q.style.display !== "none"
      );
      showQuestion(currentQuestionIndex - 1);
    });
  });

  // Handle sound buttons
  soundBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Get data-sound attribute or assign a default sound
      const soundType = btn.getAttribute("data-sound") || "default";
      playSound(soundType);
    });
  });

  // Handle family input (for question 4)
  if (familyInput) {
    familyInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        const answer = familyInput.value.trim().toLowerCase();
        const feedback = document.getElementById("feedback-4");

        if (answer === "percussion") {
          // Correct answer
          if (feedback) {
            feedback.style.display = "none";
          }
        } else {
          // Wrong answer
          if (feedback) {
            feedback.style.display = "block";
          }
          currentScore -= 1;
          updateScores();
        }
      }
    });
  }

  // Handle drag and drop
  initDragAndDrop();

  // Handle connection lines for sound matching
  initSoundMatching();

  // Function to play sound (placeholder)
  function playSound(soundType) {
    console.log(`Playing sound: ${soundType}`);
    // In a real implementation, this would play actual audio files
    alert(
      `This would play the ${soundType} sound in the actual implementation`
    );
  }

  // Function to show a specific question
  function showQuestion(index) {
    // Hide all questions
    questions.forEach((q) => {
      if (q) q.style.display = "none";
    });

    // Show the requested question
    if (index >= 0 && index < questions.length && questions[index]) {
      questions[index].style.display = "block";
      currentQuestion = index;
    }
  }

  // Function to update all score displays
  function updateScores() {
    scoreDisplays.forEach((display) => {
      display.textContent = currentScore;
    });
    if (finalScore) {
      finalScore.textContent = currentScore;
    }
  }

  // Initialize drag and drop functionality
  function initDragAndDrop() {
    const draggables = document.querySelectorAll(".draggable");
    const dropZones = document.querySelectorAll(".drop-zone");

    if (draggables.length === 0 || dropZones.length === 0) {
      return;
    }

    draggables.forEach((draggable) => {
      draggable.addEventListener("dragstart", function (e) {
        this.classList.add("dragging");
        e.dataTransfer.setData("text/plain", this.dataset.category);
      });

      draggable.addEventListener("dragend", function () {
        this.classList.remove("dragging");
      });

      // Make elements draggable
      draggable.setAttribute("draggable", "true");
    });

    dropZones.forEach((dropZone) => {
      dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        this.classList.add("drag-over");
      });

      dropZone.addEventListener("dragleave", function () {
        this.classList.remove("drag-over");
      });

      dropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        this.classList.remove("drag-over");

        const category = e.dataTransfer.getData("text/plain");
        const dragging = document.querySelector(".dragging");

        if (this.dataset.category === category) {
          // Correct drop
          this.appendChild(dragging);
          document.getElementById("feedback-3").style.display = "none";
        } else {
          // Wrong drop
          document.getElementById("feedback-3").style.display = "block";
          currentScore -= 0.5;
          updateScores();
        }
      });
    });
  }

  // Initialize sound matching
  function initSoundMatching() {
    const soundButtons = document.querySelectorAll("[data-sound]");
    const instrumentItems = document.querySelectorAll(".instrument-item");
    let selectedSound = null;

    if (soundButtons.length === 0 || instrumentItems.length === 0) {
      return;
    }

    // Add click events to sound buttons
    soundButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        selectedSound = this.dataset.sound;
        soundButtons.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
      });
    });

    // Add click events to instrument items
    instrumentItems.forEach((item) => {
      item.addEventListener("click", function () {
        if (!selectedSound) return;

        // Check if match is correct
        if (selectedSound === this.dataset.instrument) {
          // Draw connection line
          drawConnectionLine(
            document.querySelector(
              `.sound-button[data-sound="${selectedSound}"]`
            ),
            this,
            document.getElementById("connection-lines")
          );

          // Reset selection
          selectedSound = null;
          document
            .querySelectorAll(".sound-button")
            .forEach((b) => b.classList.remove("active"));
        } else {
          // Wrong match
          currentScore -= 0.5;
          updateScores();
        }
      });
    });

    // Handle name-image connections
    initNameMatching();
  }

  // Initialize name matching
  function initNameMatching() {
    const nameItems = document.querySelectorAll(".name-item");
    const instrumentItems = document.querySelectorAll(".instrument-item");
    let selectedName = null;

    if (nameItems.length === 0 || instrumentItems.length === 0) {
      return;
    }

    // Add click events to name items
    nameItems.forEach((item) => {
      item.addEventListener("click", function () {
        nameItems.forEach((i) => i.classList.remove("active"));
        this.classList.add("active");
        selectedName = this.dataset.name;
      });
    });

    // Add click events to instrument items
    instrumentItems.forEach((item) => {
      item.addEventListener("click", function () {
        if (!selectedName) return;

        // Check if match is correct
        if (selectedName === this.dataset.instrument) {
          // Draw connection line
          drawConnectionLine(
            document.querySelector(`.name-item[data-name="${selectedName}"]`),
            this,
            document.getElementById("name-connection-lines")
          );

          // Reset selection
          selectedName = null;
          document
            .querySelectorAll(".name-item")
            .forEach((i) => i.classList.remove("active"));
        } else {
          // Wrong match
          currentScore -= 0.5;
          updateScores();
        }
      });
    });
  }

  // Function to draw connection lines
  function drawConnectionLine(from, to, container) {
    if (!from || !to || !container) return;

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const line = document.createElement("div");
    line.classList.add("connection-line");

    const fromX = fromRect.right - containerRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
    const toX = toRect.left - containerRect.left;
    const toY = toRect.top + toRect.height / 2 - containerRect.top;

    const length = Math.sqrt(
      Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)
    );
    const angle = (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI;

    line.style.width = `${length}px`;
    line.style.left = `${fromX}px`;
    line.style.top = `${fromY}px`;
    line.style.transform = `rotate(${angle}deg)`;

    container.appendChild(line);
  }

  // Initialize the quiz
  function initQuiz() {
    showQuestion(0);
    updateScores();
  }

  // Start the quiz
  initQuiz();
});
