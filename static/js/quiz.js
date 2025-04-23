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
  const scoreDisplays = document.querySelectorAll(".score-display span");
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

  // Track completed connections for sound and name matching
  const completedSoundConnections = new Set();
  const completedNameConnections = new Set();

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

      // For question 5, check if an option is selected before proceeding
      if (currentQuestionIndex === 5) {
        const selectedOption = question5.querySelector(".option.selected");
        if (!selectedOption) {
          alert("Please select an answer before proceeding.");
          return;
        }
      }

      // For question 6, check if all connections are made
      if (currentQuestionIndex === 6 && completedSoundConnections.size < 3) {
        alert("Please complete all sound connections before proceeding.");
        return;
      }

      // For question 7, check if all connections are made
      if (currentQuestionIndex === 7 && completedNameConnections.size < 3) {
        alert("Please connect all names to instruments before proceeding.");
        return;
      }

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

      // Highlight the button that was clicked for questions 5, 6, and 7
      if (btn.closest("#question-5, #question-6, #question-7")) {
        // Remove active class from all sound buttons in this container
        const container = btn.closest(".quiz-container");
        container.querySelectorAll(".sound-button").forEach((button) => {
          button.classList.remove("active");
        });

        // Add active class to the clicked button
        btn.classList.add("active");
      }
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

  // Handle connection lines for sound matching (Question 6)
  initSoundMatching();

  // Handle name to image connections (Question 7)
  initNameMatching();

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

  // Initialize sound matching for Question 6
  function initSoundMatching() {
    const soundButtons = document.querySelectorAll(
      "#question-6 .sound-button[data-sound]"
    );
    const instrumentItems = document.querySelectorAll(
      "#question-6 .instrument-item"
    );
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
        if (!selectedSound) {
          alert("Please select a sound first by clicking 'Play Sound'");
          return;
        }

        // Check if this sound-instrument pair has already been connected
        const connectionKey = `${selectedSound}-${this.dataset.instrument}`;
        if (completedSoundConnections.has(connectionKey)) {
          alert("This connection has already been made!");
          return;
        }

        // Check if match is correct
        if (selectedSound === this.dataset.instrument) {
          // Draw connection line
          const soundButton = document.querySelector(
            `#question-6 .sound-button[data-sound="${selectedSound}"]`
          );

          drawConnectionLine(
            soundButton,
            this,
            document.getElementById("connection-lines")
          );

          // Add to completed connections
          completedSoundConnections.add(connectionKey);

          // Mark as connected visually
          soundButton.classList.add("connected");
          this.classList.add("connected");

          // Reset selection
          selectedSound = null;
          soundButtons.forEach((b) => b.classList.remove("active"));

          // Check if all connections are made
          if (completedSoundConnections.size === 3) {
            // All connections made, enable next button
            const nextBtn = document.querySelector(
              "#question-6 [data-action='next']"
            );
            nextBtn.disabled = false;
          }
        } else {
          // Wrong match
          alert("That's not the correct match. Try again!");
          currentScore -= 0.5;
          updateScores();
        }
      });
    });
  }

  // Initialize name matching for Question 7
  function initNameMatching() {
    const nameItems = document.querySelectorAll("#question-7 .name-item");
    const instrumentItems = document.querySelectorAll(
      "#question-7 .instrument-item"
    );
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
        if (!selectedName) {
          alert("Please select an instrument name first");
          return;
        }

        // Check if this name-instrument pair has already been connected
        const connectionKey = `${selectedName}-${this.dataset.instrument}`;
        if (completedNameConnections.has(connectionKey)) {
          alert("This connection has already been made!");
          return;
        }

        // Check if match is correct
        if (selectedName === this.dataset.instrument) {
          // Draw connection line
          const nameItem = document.querySelector(
            `#question-7 .name-item[data-name="${selectedName}"]`
          );

          drawConnectionLine(
            nameItem,
            this,
            document.getElementById("name-connection-lines")
          );

          // Add to completed connections
          completedNameConnections.add(connectionKey);

          // Mark as connected visually
          nameItem.classList.add("connected");
          this.classList.add("connected");

          // Reset selection
          selectedName = null;
          nameItems.forEach((i) => i.classList.remove("active"));

          // Check if all connections are made
          if (completedNameConnections.size === 3) {
            // All connections made, enable next button
            const nextBtn = document.querySelector(
              "#question-7 [data-action='next']"
            );
            nextBtn.disabled = false;
          }
        } else {
          // Wrong match
          alert("That's not the correct match. Try again!");
          currentScore -= 0.5;
          updateScores();
        }
      });
    });
  }

  // Function to draw connection lines between elements
  function drawConnectionLine(from, to, container) {
    if (!from || !to || !container) return;

    // Get positions of elements
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Create line element
    const line = document.createElement("div");
    line.classList.add("connection-line");

    // Calculate positions relative to container
    const fromX = fromRect.right - containerRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
    const toX = toRect.left - containerRect.left;
    const toY = toRect.top + toRect.height / 2 - containerRect.top;

    // Calculate line properties
    const length = Math.sqrt(
      Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)
    );
    const angle = (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI;

    // Set line styles
    line.style.width = `${length}px`;
    line.style.left = `${fromX}px`;
    line.style.top = `${fromY}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = "0 0";

    // Add line to container
    container.appendChild(line);
  }

  // Display summary modal for Question 5
  const summaryLinks = document.querySelectorAll(".summary-link");
  summaryLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      alert(
        "Summary: In this excerpt, the violin is providing the main melodic line. The violin's distinctive timbre and expressiveness make it well-suited for lyrical melodies in orchestral music."
      );
    });
  });

  // Initialize the quiz
  function initQuiz() {
    showQuestion(0);
    updateScores();

    // Initially disable next buttons for connection questions until all connections are made
    const q6NextBtn = document.querySelector(
      "#question-6 [data-action='next']"
    );
    const q7NextBtn = document.querySelector(
      "#question-7 [data-action='next']"
    );

    if (q6NextBtn) q6NextBtn.disabled = false; // Will be checked on click
    if (q7NextBtn) q7NextBtn.disabled = false; // Will be checked on click
  }

  // Add specific CSS for connected elements
  const style = document.createElement("style");
  style.textContent = `
    .connection-line {
      position: absolute;
      height: 2px;
      background-color: #8b4513;
      transform-origin: left center;
    }
    .connected {
      opacity: 0.7;
      border: 2px solid #8b4513;
    }
    .sound-button.active, .name-item.active {
      background-color: #daa520;
      color: #fff;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);

  // Start the quiz
  initQuiz();
});
