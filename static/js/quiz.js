// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  // Elements that might be on the current page
  const quizStart = document.getElementById("quiz-start");
  const question1 = document.getElementById("question-1");
  const question2 = document.getElementById("question-2");
  const question3 = document.getElementById("question-3");
  const question4 = document.getElementById("question-4");
  const question5 = document.getElementById("question-5");
  const question6 = document.getElementById("question-6");
  const question7 = document.getElementById("question-7");
  const quizComplete = document.getElementById("quiz-complete");

  // Current score (stored in localStorage)
  let currentScore = localStorage.getItem("quizScore")
    ? parseFloat(localStorage.getItem("quizScore"))
    : 10;

  // Update score displays on page load
  const scoreDisplays = document.querySelectorAll(".score-display span");
  scoreDisplays.forEach((display) => {
    display.textContent = currentScore.toFixed(1);
  });

  // Final score on certificate page
  const finalScore = document.getElementById("final-score");
  if (finalScore) {
    finalScore.textContent = currentScore.toFixed(1);
  }

  // Handle quiz start button
  const startQuizBtn = document.getElementById("start-quiz-btn");
  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", () => {
      // Initialize score when starting the quiz
      localStorage.setItem("quizScore", "10");
      window.location.href = "/quiz/1";
    });
  }

  // Handle hint buttons
  const hintBtns = document.querySelectorAll(".hint-btn");
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

  // Handle options click for multiple choice questions
  const options = document.querySelectorAll(".option");
  options.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove selected class from all options in the same question
      const parentQuestion = option.closest(".quiz-container");
      const questionOptions = parentQuestion.querySelectorAll(".option");
      questionOptions.forEach((opt) => {
        opt.classList.remove("selected");
        const checkbox = opt.querySelector(".option-checkbox");
        if (checkbox) checkbox.innerHTML = "";
      });

      // Add selected class to clicked option
      option.classList.add("selected");
      const checkbox = option.querySelector(".option-checkbox");

      // Hide all feedback messages first
      const allFeedback = parentQuestion.querySelectorAll(".feedback");
      allFeedback.forEach((f) => (f.style.display = "none"));

      // If it's a wrong answer, show error feedback
      if (!option.hasAttribute("data-correct")) {
        const errorFeedback = parentQuestion.querySelector(
          ".feedback:not(.success)"
        );
        if (errorFeedback) {
          errorFeedback.style.display = "block";
          if (checkbox) checkbox.innerHTML = "✗";
        }
        // Update score (deduct 0.5 point)
        currentScore -= 0.5;
        localStorage.setItem("quizScore", currentScore.toString());
        updateScores();
      } else {
        // Show success feedback
        const successFeedback =
          parentQuestion.querySelector(".feedback.success");
        if (successFeedback) successFeedback.style.display = "block";
        if (checkbox) checkbox.innerHTML = "✓";
      }
    });
  });

  // Handle navigation buttons
  const nextBtns = document.querySelectorAll('[data-action="next"]');
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Get current quiz ID from URL
      const pathParts = window.location.pathname.split("/");
      const currentQuizId = parseInt(pathParts[pathParts.length - 1]);

      // Validate answers before proceeding
      if (!validateCurrentQuestion(currentQuizId)) {
        return;
      }

      // Navigate to next question or certificate
      if (currentQuizId === 7) {
        window.location.href = "/quiz/8"; // Go to certificate
      } else {
        window.location.href = `/quiz/${currentQuizId + 1}`;
      }
    });
  });

  const prevBtns = document.querySelectorAll('[data-action="previous"]');
  prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Get current quiz ID from URL
      const pathParts = window.location.pathname.split("/");
      const currentQuizId = parseInt(pathParts[pathParts.length - 1]);

      // Navigate to previous question
      if (currentQuizId > 1) {
        window.location.href = `/quiz/${currentQuizId - 1}`;
      } else {
        window.location.href = "/quiz";
      }
    });
  });

  // Handle sound buttons
  const soundBtns = document.querySelectorAll(".sound-button");
  soundBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const soundType = btn.getAttribute("data-sound") || "default";
      playSound(soundType);

      // Highlight active sound button
      if (btn.closest(".quiz-container")) {
        const container = btn.closest(".quiz-container");
        container.querySelectorAll(".sound-button").forEach((button) => {
          button.classList.remove("active");
        });
        btn.classList.add("active");
      }
    });
  });

  // Handle text input questions (like question 4)
  const familyInput = document.getElementById("family-input");
  if (familyInput) {
    familyInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        const answer = familyInput.value.trim().toLowerCase();
        const errorFeedback = document.getElementById("feedback-4");
        const successFeedback = document.getElementById("success-4");

        // Hide all feedback first
        if (errorFeedback) errorFeedback.style.display = "none";
        if (successFeedback) successFeedback.style.display = "none";

        if (answer === "percussion") {
          // Correct answer
          if (successFeedback) successFeedback.style.display = "block";
        } else {
          // Wrong answer
          if (errorFeedback) errorFeedback.style.display = "block";
          currentScore -= 0.5;
          localStorage.setItem("quizScore", currentScore.toString());
          updateScores();
        }
      }
    });
  }

  // Initialize drag and drop functionality if present on page
  if (document.querySelector(".draggable")) {
    initDragAndDrop();
  }

  // Initialize sound matching if present on page
  if (document.querySelector(".sound-source")) {
    initSoundMatching();
  }

  // Initialize name matching if present on page
  if (document.querySelector(".name-tag")) {
    initNameMatching();
  }

  // Function to validate current question
  function validateCurrentQuestion(questionId) {
    switch (questionId) {
      case 1:
      case 2:
      case 5:
        // Multiple choice questions
        const selectedOption = document.querySelector(`.option.selected`);
        if (!selectedOption) {
          alert("Please select an answer before proceeding.");
          return false;
        }
        return true;

      case 3:
        // Drag and drop question
        const dropZones = document.querySelectorAll(".drop-zone");
        const draggables = document.querySelectorAll(".draggable");
        let allPlaced = true;

        // Check if all draggable items are placed in drop zones
        draggables.forEach((draggable) => {
          if (!draggable.parentElement.classList.contains("drop-zone")) {
            allPlaced = false;
          }
        });

        if (!allPlaced) {
          alert(
            "Please place all instruments in their correct families before proceeding."
          );
          return false;
        }
        return true;

      case 4:
        // Text input question
        const textInput = document.getElementById("family-input");
        if (textInput && textInput.value.trim() === "") {
          alert("Please enter an answer before proceeding.");
          return false;
        }
        return true;

      case 6:
        // Sound matching question
        const soundConnections = document.querySelectorAll(
          ".sound-connection.complete"
        );
        if (soundConnections.length < 3) {
          alert("Please complete all sound connections before proceeding.");
          return false;
        }
        return true;

      case 7:
        // Name matching question
        const nameConnections = document.querySelectorAll(
          ".name-connection.complete"
        );
        if (nameConnections.length < 3) {
          alert("Please connect all names to instruments before proceeding.");
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  // Function to update all score displays
  function updateScores() {
    scoreDisplays.forEach((display) => {
      display.textContent = currentScore.toFixed(1);
    });
    if (finalScore) {
      finalScore.textContent = currentScore.toFixed(1);
    }
  }

  // Function to play sound (placeholder)
  function playSound(soundType) {
    console.log(`Playing sound: ${soundType}`);
    // In a real implementation, this would play actual audio files
    alert(
      `This would play the ${soundType} sound in the actual implementation`
    );
  }

  // Keep the existing implementations of these functions
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
        const errorFeedback = document.getElementById("feedback-3");
        const successFeedback = document.getElementById("success-3");

        // Hide all feedback first
        if (errorFeedback) errorFeedback.style.display = "none";
        if (successFeedback) successFeedback.style.display = "none";

        if (this.dataset.category === category) {
          // Correct drop
          this.appendChild(dragging);

          // Check if all instruments are in correct places
          const allCorrect = Array.from(dropZones).every((zone) => {
            const items = zone.querySelectorAll(".draggable");
            return (
              items.length > 0 &&
              Array.from(items).every(
                (item) => item.dataset.category === zone.dataset.category
              )
            );
          });

          // Show success feedback if all correct
          if (allCorrect && successFeedback) {
            successFeedback.style.display = "block";
          }
        } else {
          // Wrong drop
          if (errorFeedback) errorFeedback.style.display = "block";
          currentScore -= 0.5;
          localStorage.setItem("quizScore", currentScore.toString());
          updateScores();
        }
      });
    });
  }

  function initSoundMatching() {
    const soundButtons = document.querySelectorAll(
      "#question-6 .sound-button[data-sound]"
    );
    const instrumentItems = document.querySelectorAll(
      "#question-6 .instrument-item"
    );
    let selectedSound = null;
    const errorFeedback = document.getElementById("feedback-6");
    const successFeedback = document.getElementById("success-6");
    const completedSoundConnections = new Set();

    if (soundButtons.length === 0 || instrumentItems.length === 0) {
      return;
    }

    // Hide feedback initially
    if (errorFeedback) errorFeedback.style.display = "none";
    if (successFeedback) successFeedback.style.display = "none";

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

        // Hide feedback
        if (errorFeedback) errorFeedback.style.display = "none";
        if (successFeedback) successFeedback.style.display = "none";

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
            // All connections made, show success feedback
            if (successFeedback) successFeedback.style.display = "block";
          }
        } else {
          // Wrong match
          if (errorFeedback) errorFeedback.style.display = "block";
          currentScore -= 0.5;
          localStorage.setItem("quizScore", currentScore.toString());
          updateScores();
        }
      });
    });
  }

  function initNameMatching() {
    const nameItems = document.querySelectorAll("#question-7 .name-item");
    const instrumentItems = document.querySelectorAll(
      "#question-7 .instrument-item"
    );
    let selectedName = null;
    const errorFeedback = document.getElementById("feedback-7");
    const successFeedback = document.getElementById("success-7");
    const completedNameConnections = new Set();

    if (nameItems.length === 0 || instrumentItems.length === 0) {
      return;
    }

    // Hide feedback initially
    if (errorFeedback) errorFeedback.style.display = "none";
    if (successFeedback) successFeedback.style.display = "none";

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
          alert("Please select a name first");
          return;
        }

        // Hide feedback
        if (errorFeedback) errorFeedback.style.display = "none";
        if (successFeedback) successFeedback.style.display = "none";

        // Check if this name-instrument pair has already been connected
        const connectionKey = `${selectedName}-${this.dataset.instrument}`;
        if (completedNameConnections.has(connectionKey)) {
          alert("This connection has already been made!");
          return;
        }

        // Check if match is correct
        if (selectedName === this.dataset.instrument) {
          // Add connection
          completedNameConnections.add(connectionKey);

          // Mark as connected visually
          const nameItem = document.querySelector(
            `#question-7 .name-item[data-name="${selectedName}"]`
          );
          nameItem.classList.add("connected");
          this.classList.add("connected");

          // Reset selection
          selectedName = null;
          nameItems.forEach((i) => i.classList.remove("active"));

          // Check if all connections are made
          if (completedNameConnections.size === 3) {
            // All connections made, show success feedback
            if (successFeedback) successFeedback.style.display = "block";
          }
        } else {
          // Wrong match
          if (errorFeedback) errorFeedback.style.display = "block";
          currentScore -= 0.5;
          localStorage.setItem("quizScore", currentScore.toString());
          updateScores();
        }
      });
    });
  }

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
});
