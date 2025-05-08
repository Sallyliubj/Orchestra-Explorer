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

  // Get current question ID from URL
  const pathParts = window.location.pathname.split("/");
  const currentQuizId = parseInt(pathParts[pathParts.length - 1]) || 0;

  // Initialize score and attempts tracking
  let currentScore = localStorage.getItem("quizScore") ? parseInt(localStorage.getItem("quizScore")) : 0;
  let attempts = localStorage.getItem(`quiz_${currentQuizId}_attempts`) ? parseInt(localStorage.getItem(`quiz_${currentQuizId}_attempts`)) : 0;
  let questionAnswered = localStorage.getItem(`quiz_${currentQuizId}_answered`) ? localStorage.getItem(`quiz_${currentQuizId}_answered`) === 'true' : false;

  // Show score displays during quiz
  const scoreDisplays = document.querySelectorAll(".score-display");
  const totalQuestions = 7; // Total number of questions in the quiz
  
  // Create and update attempt counter
  function createAttemptCounter() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;

    // Remove existing attempt counter if any
    const existingCounter = document.getElementById('attempt-counter');
    if (existingCounter) {
      existingCounter.remove();
    }

    // Create new attempt counter
    const attemptCounter = document.createElement('div');
    attemptCounter.id = 'attempt-counter';
    attemptCounter.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: #f0f0f0;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 14px;
      color: #333;
    `;
    attemptCounter.textContent = `Attempts: ${attempts}/3`;
    quizContainer.style.position = 'relative';
    quizContainer.appendChild(attemptCounter);
  }

  // Update attempt counter
  function updateAttemptCounter() {
    const attemptCounter = document.getElementById('attempt-counter');
    if (attemptCounter) {
      attemptCounter.textContent = `Attempts: ${attempts}/3`;
    }
  }
  
  // Update all score displays
  function updateScoreDisplays() {
    scoreDisplays.forEach((display) => {
      display.style.display = "block";
      display.textContent = `Score: ${currentScore}/${totalQuestions}`;
    });
  }

  // Initial score display update and attempt counter creation
  updateScoreDisplays();
  createAttemptCounter();

  // Show final score on certificate page
  const finalScore = document.getElementById("final-score");
  if (finalScore) {
    finalScore.textContent = `${currentScore}/${totalQuestions}`;
  }

  // Handle quiz start button
  const startQuizBtn = document.getElementById("start-quiz-btn");
  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", () => {
      // Initialize score and attempts when starting the quiz
      localStorage.setItem("quizScore", "0");
      // Clear previous quiz progress and attempts
      for (let i = 1; i <= 7; i++) {
        localStorage.removeItem(`quiz_${i}_state`);
        localStorage.removeItem(`quiz_${i}_attempts`);
        localStorage.removeItem(`quiz_${i}_answered`);
      }
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

  // Restore state for the current question
  restoreQuizState(currentQuizId);

  // Function to update score (ensures score is never negative)
  function updateScore(points) {
    currentScore = Math.max(0, currentScore + points);
    localStorage.setItem("quizScore", currentScore.toString());
  }

  // Handle options click for multiple choice questions
  const options = document.querySelectorAll(".option");
  options.forEach((option) => {
    option.addEventListener("click", () => {
      // Skip if question already answered correctly
      if (questionAnswered) {
        return;
      }

      // Check if max attempts reached
      if (attempts >= 3) {
        alert("Maximum attempts reached. Moving to next question.");
        window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
        return;
      }

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

      // Increment attempts
      attempts++;
      localStorage.setItem(`quiz_${currentQuizId}_attempts`, attempts.toString());
      updateAttemptCounter();

      // If it's a wrong answer, show error feedback
      if (!option.hasAttribute("data-correct")) {
        const errorFeedback = parentQuestion.querySelector(".feedback:not(.success)");
        if (errorFeedback) {
          errorFeedback.style.display = "block";
          if (checkbox) checkbox.innerHTML = "✗";
        }
        
        // Check if max attempts reached
        if (attempts >= 3) {
          alert("Maximum attempts reached. Moving to next question.");
          setTimeout(() => {
            window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
          }, 1000);
        }
      } else {
        // Show success feedback
        const successFeedback = parentQuestion.querySelector(".feedback.success");
        if (successFeedback) successFeedback.style.display = "block";
        if (checkbox) checkbox.innerHTML = "✓";
        
        // Add point for correct answer
        currentScore += 1;
        localStorage.setItem("quizScore", currentScore.toString());
        localStorage.setItem(`quiz_${currentQuizId}_answered`, 'true');
        
        // Update score display
        updateScoreDisplays();
        
        // Move to next question after short delay
        setTimeout(() => {
          window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
        }, 1000);
      }

      // Save the state of the current question
      saveQuizState(currentQuizId);
    });
  });

  // Handle navigation buttons
  const nextBtns = document.querySelectorAll('[data-action="next"]');
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
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
      // Save state before navigating away
      saveQuizState(currentQuizId);

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
    // Add a check button next to the input
    const inputContainer = familyInput.closest(".input-container");
    if (inputContainer) {
      const checkBtn = document.createElement("button");
      checkBtn.id = "check-answer-btn";
      checkBtn.className = "btn";
      checkBtn.textContent = "Check Answer";
      checkBtn.style.marginLeft = "10px";
      inputContainer.appendChild(checkBtn);

      // Function to check the answer
      const checkAnswer = () => {
        // Skip if max attempts reached or question already answered
        if (attempts >= 3 || questionAnswered) {
          return;
        }

        const answer = familyInput.value.trim().toLowerCase();
        const errorFeedback = document.getElementById("feedback-4");
        const successFeedback = document.getElementById("success-4");

        // Hide all feedback first
        if (errorFeedback) errorFeedback.style.display = "none";
        if (successFeedback) successFeedback.style.display = "none";

        if (answer === "percussion") {
          // Correct answer
          if (successFeedback) successFeedback.style.display = "block";
          familyInput.dataset.correct = "true";
          // Add point for correct answer
          currentScore += 1;
          localStorage.setItem("quizScore", currentScore.toString());
          localStorage.setItem(`quiz_${currentQuizId}_answered`, 'true');
          // Update score display
          updateScoreDisplays();
          // Move to next question after short delay
          setTimeout(() => {
            window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
          }, 1000);
        } else {
          // Wrong answer - only increment attempts for incorrect submissions
          if (errorFeedback) errorFeedback.style.display = "block";
          familyInput.dataset.correct = "false";
          
          // Increment attempts only for incorrect submissions
          attempts++;
          localStorage.setItem(`quiz_${currentQuizId}_attempts`, attempts.toString());
          updateAttemptCounter();
          
          // Check if max attempts reached
          if (attempts >= 3) {
            alert("Maximum attempts reached. Moving to next question.");
            setTimeout(() => {
              window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
            }, 1000);
          }
        }

        // Save the state
        saveQuizState(currentQuizId);
      };

      // Check answer on button click
      checkBtn.addEventListener("click", checkAnswer);

      // Check answer on Enter key
      familyInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          checkAnswer();
        } else {
          // Save input as user types
          saveQuizState(currentQuizId);
        }
      });
    }
  }

  // Initialize drag and drop functionality if present on page
  if (document.querySelector(".draggable")) {
    initDragAndDrop();
  }

  // Initialize sound matching if present on page
  if (document.querySelector(".sound-button[data-sound]")) {
    initSoundMatching();
  }

  // Initialize name matching if present on page
  if (document.querySelector(".name-item")) {
    initNameMatching();
  }

  // Function to save quiz state to localStorage
  function saveQuizState(questionId) {
    // Only save if we have a valid question ID
    if (!questionId || questionId < 1 || questionId > 7) return;

    let state = {};

    switch (questionId) {
      case 1:
      case 2:
      case 5:
        // Multiple choice questions
        const selectedOption = document.querySelector(
          `#question-${questionId} .option.selected`
        );
        if (selectedOption) {
          state.selectedValue = selectedOption.getAttribute("data-value");
        }
        break;

      case 3:
        // Drag and drop question
        const dropZones = document.querySelectorAll(".drop-zone");
        state.dropZones = {};

        dropZones.forEach((zone) => {
          const category = zone.getAttribute("data-category");
          const items = zone.querySelectorAll(".draggable");
          state.dropZones[category] = Array.from(items).map((item) =>
            item.getAttribute("data-category")
          );
        });
        break;

      case 4:
        // Text input question
        const textInput = document.getElementById("family-input");
        if (textInput) {
          state.inputValue = textInput.value;
          if (textInput.hasAttribute("data-correct")) {
            state.inputCorrect = textInput.getAttribute("data-correct");
          }
        }
        break;

      case 6:
        // Sound matching
        state.soundConnections = [];
        document
          .querySelectorAll("#question-6 .sound-button.connected")
          .forEach((btn) => {
            if (btn.getAttribute("data-sound")) {
              state.soundConnections.push(btn.getAttribute("data-sound"));
            }
          });
        break;

      case 7:
        // Name matching
        state.nameConnections = [];
        document
          .querySelectorAll("#question-7 .name-item.connected")
          .forEach((item) => {
            if (item.getAttribute("data-name")) {
              state.nameConnections.push(item.getAttribute("data-name"));
            }
          });
        break;
    }

    // Include feedback visibility state
    const errorFeedback = document.querySelector(`#feedback-${questionId}`);
    const successFeedback = document.querySelector(`#success-${questionId}`);

    if (errorFeedback) {
      state.errorFeedbackVisible = errorFeedback.style.display === "block";
    }

    if (successFeedback) {
      state.successFeedbackVisible = successFeedback.style.display === "block";
    }

    // Save state
    localStorage.setItem(`quiz_${questionId}_state`, JSON.stringify(state));
  }

  // Function to restore quiz state from localStorage
  function restoreQuizState(questionId) {
    // Only restore if we have a valid question ID
    if (!questionId || questionId < 1 || questionId > 7) return;

    const savedState = localStorage.getItem(`quiz_${questionId}_state`);
    if (!savedState) return;

    try {
      const state = JSON.parse(savedState);

      switch (questionId) {
        case 1:
        case 2:
        case 5:
          // Multiple choice questions
          if (state.selectedValue) {
            const option = document.querySelector(
              `#question-${questionId} .option[data-value="${state.selectedValue}"]`
            );
            if (option) {
              option.click(); // Simulate click to trigger the selection logic
            }
          }
          break;

        case 3:
          // Drag and drop question - will be handled by initDragAndDrop
          // We store the state for restoration after the drag and drop is initialized
          window.savedDragDropState = state;
          break;

        case 4:
          // Text input question
          const textInput = document.getElementById("family-input");
          if (textInput && state.inputValue) {
            textInput.value = state.inputValue;

            if (state.inputCorrect) {
              textInput.dataset.correct = state.inputCorrect;

              // Show appropriate feedback
              const errorFeedback = document.getElementById("feedback-4");
              const successFeedback = document.getElementById("success-4");

              if (errorFeedback) errorFeedback.style.display = "none";
              if (successFeedback) successFeedback.style.display = "none";

              if (state.inputCorrect === "true" && successFeedback) {
                successFeedback.style.display = "block";
              } else if (state.inputCorrect === "false" && errorFeedback) {
                errorFeedback.style.display = "block";
              }
            }
          }
          break;

        case 6:
        case 7:
          // Connection questions (sound/name matching)
          // We store the state for restoration after initialization
          window.savedConnectionState = state;
          break;
      }

      // Restore feedback visibility if not handled by other logic
      if (state.errorFeedbackVisible || state.successFeedbackVisible) {
        const errorFeedback = document.querySelector(`#feedback-${questionId}`);
        const successFeedback = document.querySelector(
          `#success-${questionId}`
        );

        if (errorFeedback && state.errorFeedbackVisible) {
          errorFeedback.style.display = "block";
        }

        if (successFeedback && state.successFeedbackVisible) {
          successFeedback.style.display = "block";
        }
      }
    } catch (e) {
      console.error("Error restoring quiz state:", e);
    }
  }

  // Function to validate current question
  function validateCurrentQuestion(questionId) {
    // Skip validation if question already answered correctly
    if (questionAnswered) {
      return true;
    }

    // Check if max attempts reached
    if (attempts >= 3) {
      return true; // Allow proceeding if max attempts reached
    }

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
          alert("Please place all instruments in their correct families before proceeding.");
          return false;
        }
        return true;

      case 4:
        // Text input question
        const textInput = document.getElementById("family-input");
        if (!textInput) return true;

        // If no input given
        if (textInput.value.trim() === "") {
          alert("Please enter an answer before proceeding.");
          return false;
        }

        // If answer hasn't been checked yet
        if (!textInput.hasAttribute("data-correct")) {
          // Automatically check the answer
          const answer = textInput.value.trim().toLowerCase();
          const errorFeedback = document.getElementById("feedback-4");
          const successFeedback = document.getElementById("success-4");

          // Hide all feedback first
          if (errorFeedback) errorFeedback.style.display = "none";
          if (successFeedback) successFeedback.style.display = "none";

          if (answer === "percussion") {
            // Correct answer
            if (successFeedback) successFeedback.style.display = "block";
            textInput.dataset.correct = "true";
            // Add point for correct answer
            currentScore += 1;
            localStorage.setItem("quizScore", currentScore.toString());
            localStorage.setItem(`quiz_${currentQuizId}_answered`, 'true');
            // Update score display
            updateScoreDisplays();
            // Save state after validation
            saveQuizState(questionId);
            return true;
          } else {
            // Wrong answer - only increment attempts for incorrect submissions
            if (errorFeedback) errorFeedback.style.display = "block";
            textInput.dataset.correct = "false";
            
            // Increment attempts only for incorrect submissions
            attempts++;
            localStorage.setItem(`quiz_${currentQuizId}_attempts`, attempts.toString());
            updateAttemptCounter();
            
            // Check if max attempts reached
            if (attempts >= 3) {
              alert("Maximum attempts reached. Moving to next question.");
              return true;
            }
            
            alert("Please enter the correct answer before proceeding.");
            return false;
          }
        }

        // If answer has been checked and it's wrong
        if (textInput.dataset.correct === "false") {
          alert("Please enter the correct answer before proceeding.");
          return false;
        }

        return true;

      case 6:
        // Sound matching question
        const soundConnections = document.querySelectorAll(".sound-button.connected");
        if (soundConnections.length < 3) {
          alert("Please complete all sound connections before proceeding.");
          return false;
        }
        return true;

      case 7:
        // Name matching question
        const nameConnections = document.querySelectorAll(".name-item.connected");
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
      finalScore.textContent = Math.max(0, currentScore).toFixed(1);
    }
  }

  // Function to play sound (placeholder)
  function playSound(soundType) {
    // Get the current quiz question from URL
    const pathParts = window.location.pathname.split("/");
    const currentQuizId = parseInt(pathParts[pathParts.length - 1]) || 0;
    let soundFile = null;

    // Handle specific question types
    if (currentQuizId === 1) {
      // Question 1: Instrument family identification
      if (soundType === "default") {
        // Play all three sounds sequentially
        playInstrumentSound("strings/violin.mp3");
        setTimeout(() => playInstrumentSound("strings/cello.mp3"), 1500);
        setTimeout(() => playInstrumentSound("brass/trumpet.mp3"), 3000);
        return;
      } else if (soundType === "violin") {
        soundFile = "strings/violin.mp3";
      } else if (soundType === "cello") {
        soundFile = "strings/cello.mp3";
      } else if (soundType === "trumpet") {
        soundFile = "brass/trumpet.mp3";
      }
    } else if (currentQuizId === 2) {
      // Question 2: Sound matching
      if (soundType === "default") {
        soundFile = "strings/violin.mp3";
      } else if (soundType) {
        // Handle specific instrument
        if (soundType === "timpani") {
          soundFile = "percussion/timpani.mp3";
        } else if (soundType === "violin") {
          soundFile = "strings/violin.mp3";
        } else if (soundType === "trumpet") {
          soundFile = "brass/trumpet.mp3";
        } else if (soundType === "clarinet") {
          soundFile = "woodwinds/clarinet.mp3";
        }
      }
    } else if (currentQuizId === 3) {
      // Question 3: Drag and drop (instrument sorting)
      if (soundType && soundType.includes("/")) {
        // Direct sound file path provided
        soundFile = soundType;
      } else {
        // Map the instrument category to a sample sound
        const familySoundMap = {
          strings: "strings/violin.mp3",
          woodwinds: "woodwinds/flute.mp3",
          brass: "brass/trumpet.mp3",
          percussion: "percussion/timpani.mp3",
        };
        soundFile = familySoundMap[soundType] || null;
      }
    } else if (currentQuizId === 4) {
      // Question 4: Identify instrument family by sound
      soundFile = "percussion/timpani.mp3";
    } else if (currentQuizId === 5) {
      // Question 5: Identify the instrument
      if (soundType === "default") {
        soundFile = "woodwinds/oboe.mp3";
      } else {
        // Map specific instruments
        const instrumentSoundMap = {
          flute: "woodwinds/flute.mp3",
          oboe: "woodwinds/oboe.mp3",
          clarinet: "woodwinds/clarinet.mp3",
          violin: "strings/violin.mp3",
        };
        soundFile = instrumentSoundMap[soundType] || null;
      }
    } else if (currentQuizId === 6) {
      // Question 6: Match sounds to instruments
      // Handle direct instrument sound mappings
      if (soundType === "trumpet") {
        soundFile = "brass/trumpet.mp3";
      } else if (soundType === "violin") {
        soundFile = "strings/violin.mp3";
      } else if (soundType === "cello") {
        soundFile = "strings/cello.mp3";
      } else if (soundType === "bass") {
        soundFile = "strings/bass.mp3";
      } else if (soundType === "flute") {
        soundFile = "woodwinds/flute.mp3";
      } else if (soundType === "timpani") {
        soundFile = "percussion/timpani.mp3";
      }
    } else if (currentQuizId === 7) {
      // Question 7: Identify orchestra sections
      if (soundType === "strings") {
        soundFile = "strings/violin.mp3";
      } else if (soundType === "woodwinds") {
        soundFile = "woodwinds/flute.mp3";
      } else if (soundType === "brass") {
        soundFile = "brass/trumpet.mp3";
      } else if (soundType === "percussion") {
        soundFile = "percussion/timpani.mp3";
      }
    }

    // Play the sound if we have a valid sound file
    if (soundFile) {
      playInstrumentSound(soundFile);
    } else {
      console.error(`No sound file found for type: ${soundType}`);
    }
  }

  // Helper function to play actual instrument sounds
  function playInstrumentSound(soundPath) {
    const audio = new Audio(`/static/sounds/${soundPath}`);
    audio.play().catch((error) => {
      console.error(`Error playing sound: ${error.message}`);
    });
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
        // Skip if max attempts reached or question already answered
        if (attempts >= 3 || questionAnswered) {
          e.preventDefault();
          return;
        }
        this.classList.add("dragging");
        e.dataTransfer.setData("text/plain", this.dataset.category);
      });

      draggable.addEventListener("dragend", function () {
        this.classList.remove("dragging");
        // Save state after drag ends
        saveQuizState(currentQuizId);
      });

      // Make elements draggable
      draggable.setAttribute("draggable", "true");
    });

    dropZones.forEach((dropZone) => {
      dropZone.addEventListener("dragover", function (e) {
        // Skip if max attempts reached or question already answered
        if (attempts >= 3 || questionAnswered) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        this.classList.add("drag-over");
      });

      dropZone.addEventListener("dragleave", function () {
        this.classList.remove("drag-over");
      });

      dropZone.addEventListener("drop", function (e) {
        // Skip if max attempts reached or question already answered
        if (attempts >= 3 || questionAnswered) {
          e.preventDefault();
          return;
        }

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
          if (allCorrect) {
            if (successFeedback) successFeedback.style.display = "block";
            // Add point for correct answer
            currentScore += 1;
            localStorage.setItem("quizScore", currentScore.toString());
            localStorage.setItem(`quiz_${currentQuizId}_answered`, 'true');
            // Update score display
            updateScoreDisplays();
            // Move to next question after short delay
            setTimeout(() => {
              window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
            }, 1000);
          }
        } else {
          // Wrong drop - only increment attempts for incorrect placements
          if (errorFeedback) errorFeedback.style.display = "block";
          
          // Increment attempts only for incorrect placements
          attempts++;
          localStorage.setItem(`quiz_${currentQuizId}_attempts`, attempts.toString());
          updateAttemptCounter();
          
          // Check if max attempts reached
          if (attempts >= 3) {
            alert("Maximum attempts reached. Moving to next question.");
            setTimeout(() => {
              window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
            }, 1000);
          }
        }

        // Save state after drop
        saveQuizState(currentQuizId);
      });
    });

    // Restore saved drag-drop state if available
    if (window.savedDragDropState && window.savedDragDropState.dropZones) {
      const state = window.savedDragDropState;

      Object.keys(state.dropZones).forEach((category) => {
        const dropZone = document.querySelector(
          `.drop-zone[data-category="${category}"]`
        );
        if (!dropZone) return;

        state.dropZones[category].forEach((itemCategory) => {
          const draggable = document.querySelector(
            `.draggable[data-category="${itemCategory}"]:not(.placed)`
          );
          if (draggable) {
            dropZone.appendChild(draggable);
            draggable.classList.add("placed");
          }
        });
      });

      // Check if all items are correctly placed
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
      const successFeedback = document.getElementById("success-3");
      if (allCorrect && successFeedback) {
        successFeedback.style.display = "block";
      }

      // Clean up
      delete window.savedDragDropState;
    }
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
        // Skip if max attempts reached or question already answered
        if (attempts >= 3 || questionAnswered) {
          return;
        }
        selectedSound = this.dataset.sound;
        soundButtons.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
      });
    });

    // Add click events to instrument items
    instrumentItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Skip if max attempts reached or question already answered
        if (attempts >= 3 || questionAnswered) {
          return;
        }

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
            // Add point for correct answer
            currentScore += 1;
            localStorage.setItem("quizScore", currentScore.toString());
            localStorage.setItem(`quiz_${currentQuizId}_answered`, 'true');
            // Update score display
            updateScoreDisplays();
            // Move to next question after short delay
            setTimeout(() => {
              window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
            }, 1000);
          }

          // Save state after successful connection
          saveQuizState(currentQuizId);
        } else {
          // Wrong match - only increment attempts for incorrect connections
          if (errorFeedback) errorFeedback.style.display = "block";
          
          // Increment attempts only for incorrect connections
          attempts++;
          localStorage.setItem(`quiz_${currentQuizId}_attempts`, attempts.toString());
          updateAttemptCounter();
          
          // Check if max attempts reached
          if (attempts >= 3) {
            alert("Maximum attempts reached. Moving to next question.");
            setTimeout(() => {
              window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
            }, 1000);
          }

          // Save state after unsuccessful attempt
          saveQuizState(currentQuizId);
        }
      });
    });

    // Restore saved connections if available
    if (
      window.savedConnectionState &&
      window.savedConnectionState.soundConnections &&
      currentQuizId === 6
    ) {
      const state = window.savedConnectionState;

      state.soundConnections.forEach((soundType) => {
        const soundButton = document.querySelector(
          `#question-6 .sound-button[data-sound="${soundType}"]`
        );
        const instrumentItem = document.querySelector(
          `#question-6 .instrument-item[data-instrument="${soundType}"]`
        );

        if (soundButton && instrumentItem) {
          // Mark as connected
          soundButton.classList.add("connected");
          instrumentItem.classList.add("connected");

          // Draw the connection line
          drawConnectionLine(
            soundButton,
            instrumentItem,
            document.getElementById("connection-lines")
          );

          // Add to tracked connections
          completedSoundConnections.add(`${soundType}-${soundType}`);
        }
      });

      // Show success feedback if all connections were made
      if (completedSoundConnections.size === 3 && successFeedback) {
        successFeedback.style.display = "block";
      }
    }
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
        // Skip if max attempts reached or question already answered
        if (attempts >= 3 || questionAnswered) {
          return;
        }
        nameItems.forEach((i) => i.classList.remove("active"));
        this.classList.add("active");
        selectedName = this.dataset.name;
      });
    });

    // Add click events to instrument items
    instrumentItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Skip if max attempts reached or question already answered
        if (attempts >= 3 || questionAnswered) {
          return;
        }

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
          // Draw connection line
          const nameItem = document.querySelector(
            `#question-7 .name-item[data-name="${selectedName}"]`
          );
          drawConnectionLine(
            nameItem,
            this,
            document.getElementById("connection-lines")
          );

          // Add connection
          completedNameConnections.add(connectionKey);

          // Mark as connected visually
          nameItem.classList.add("connected");
          this.classList.add("connected");

          // Reset selection
          selectedName = null;
          nameItems.forEach((i) => i.classList.remove("active"));

          // Check if all connections are made
          if (completedNameConnections.size === 3) {
            // All connections made, show success feedback
            if (successFeedback) successFeedback.style.display = "block";
            // Add point for correct answer
            currentScore += 1;
            localStorage.setItem("quizScore", currentScore.toString());
            localStorage.setItem(`quiz_${currentQuizId}_answered`, 'true');
            // Update score display
            updateScoreDisplays();
            // Move to next question after short delay
            setTimeout(() => {
              window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
            }, 1000);
          }

          // Save state after successful connection
          saveQuizState(currentQuizId);
        } else {
          // Wrong match - only increment attempts for incorrect connections
          if (errorFeedback) errorFeedback.style.display = "block";
          
          // Increment attempts only for incorrect connections
          attempts++;
          localStorage.setItem(`quiz_${currentQuizId}_attempts`, attempts.toString());
          updateAttemptCounter();
          
          // Check if max attempts reached
          if (attempts >= 3) {
            alert("Maximum attempts reached. Moving to next question.");
            setTimeout(() => {
              window.location.href = currentQuizId === 7 ? "/quiz/8" : `/quiz/${currentQuizId + 1}`;
            }, 1000);
          }

          // Save state after unsuccessful attempt
          saveQuizState(currentQuizId);
        }
      });
    });

    // Restore saved connections if available
    if (
      window.savedConnectionState &&
      window.savedConnectionState.nameConnections &&
      currentQuizId === 7
    ) {
      const state = window.savedConnectionState;

      state.nameConnections.forEach((itemName) => {
        const nameItem = document.querySelector(
          `#question-7 .name-item[data-name="${itemName}"]`
        );
        const instrumentItem = document.querySelector(
          `#question-7 .instrument-item[data-instrument="${itemName}"]`
        );

        if (nameItem && instrumentItem) {
          // Mark as connected
          nameItem.classList.add("connected");
          instrumentItem.classList.add("connected");

          // Draw the connection line
          drawConnectionLine(
            nameItem,
            instrumentItem,
            document.getElementById("connection-lines")
          );

          // Add to tracked connections
          completedNameConnections.add(`${itemName}-${itemName}`);
        }
      });

      // Show success feedback if all connections were made
      if (completedNameConnections.size === 3 && successFeedback) {
        successFeedback.style.display = "block";
      }
    }
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
