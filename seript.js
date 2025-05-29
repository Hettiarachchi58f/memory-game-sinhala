// Game Constants
    const themes = {
      sinhala: ['අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'එ', 'ඔ', 'ක', 'ග', 'ච', 'ජ', 'ට', 'ඩ'],
      numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
      fruits: ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍉', '🍇', '🍐', '🍑', '🥭', '🍍', '🥥', '🥝', '🍏', '🍈'],
      animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
      vehicles: ['🚗', '🚕', '🚙', '🚌', '🚑', '🚒', '🚲', '🏍', '✈️', '🚀', '🛳', '🚁', '🚚', '🚜', '🏎', '🛵'],
      sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥊'],
      foods: ['🍔', '🍕', '🌭', '🥪', '🍣', '🍛', '🍜', '🍝', '🍠', '🍦', '🍩', '🍪', '🎂', '🍫', '🍬', '🍭']
    };

    const themeNames = {
      sinhala: 'සිංහල අක්ෂර',
      numbers: 'අංක',
      fruits: 'පළතුරු',
      animals: 'සතුන්',
      vehicles: 'වාහන',
      sports: 'ක්‍රීඩා',
      foods: 'ආහාර'
    };

    const CLASSIC_UNLOCK_REQUIREMENT = 10; // Easy rounds needed to unlock classic mode

    // DOM Elements
    const board = document.getElementById("gameBoard");
    const timerDisplay = document.getElementById("timer");
    const attemptsDisplay = document.getElementById("attempts");
    const matchesDisplay = document.getElementById("matches");
    const totalPairsDisplay = document.getElementById("totalPairs");
    const leaderboard = document.getElementById("leaderboard");
    const nameInputContainer = document.getElementById("nameInputContainer");
    const playerNameInput = document.getElementById("playerName");
    const nameSubmitBtn = document.getElementById("nameSubmit");
    const typewriterElement = document.getElementById("typewriter");
    const cursorElement = document.getElementById("cursor");
    const progressBar = document.getElementById("progressBar");
    const levelsPlayedElement = document.getElementById("levelsPlayed");
    const cardsMatchedElement = document.getElementById("cardsMatched");
    const winsElement = document.getElementById("wins");
    const hintButton = document.getElementById("hintButton");
    const kenoAssistant = document.getElementById("kenoAssistant");

    // Game State
    let timer, time = 0, attempts = 0, matches = 0, totalPairs = 0;
    let currentTheme = 'sinhala';
    let soundEnabled = true;
    let darkMode = false;
    let cardSize = 80;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let deferredPrompt;
    let easyRoundsCompleted = 0;
    let classicUnlocked = false;
    let helperInterval;

    // Keno Assistant State
    let playerName = localStorage.getItem('playerName') || '';
    let hasCompletedIntro = localStorage.getItem('hasCompletedIntro') === 'true';
    let assistantPoints = parseInt(localStorage.getItem('assistantPoints')) || 0;
    const maxAssistantPoints = 40;
    let levelsPlayed = parseInt(localStorage.getItem('levelsPlayed')) || 0;
    let cardsMatched = parseInt(localStorage.getItem('cardsMatched')) || 0;
    let wins = parseInt(localStorage.getItem('wins')) || 0;
    let currentLevel = 'medium';
    let unlockedLevels = ['easy', 'medium'];

    // Initialize the game
    function initGame() {
      // Create background particles
      const particlesContainer = document.getElementById('particles');
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = `${Math.random() * 10 + 5}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particlesContainer.appendChild(particle);
      }
      
      // Check if player is new
      if (!playerName && !hasCompletedIntro) {
        nameInputContainer.classList.add('show');
      } else {
        nameInputContainer.classList.remove('show');
        startKenoIntroduction();
      }
      
      // Update stats
      updateStats();
      
      // Create game board
      createBoard(currentLevel);
      
      // Setup event listeners
      nameSubmitBtn.addEventListener('click', savePlayerName);
      hintButton.addEventListener('click', requestHint);
      initToggles();
      initSettings();
      renderLeaderboard();
    }
    
    // Save player name
    function savePlayerName() {
      const name = playerNameInput.value.trim();
      if (name) {
        playerName = name;
        localStorage.setItem('playerName', name);
        nameInputContainer.classList.remove('show');
        startKenoIntroduction();
      } else {
        playerNameInput.placeholder = "කරුණාකර ඔබගේ නම ඇතුළත් කරන්න...";
        playerNameInput.focus();
      }
    }
    
    // Keno introduction sequence
    function startKenoIntroduction() {
      if (hasCompletedIntro) {
        return;
      }
      
      // Type the welcome message
      setTimeout(() => {
        typeMessage(`සුභ දවසක් ${playerName}! මතක තරඟයට ඔබව සාදරයෙන් පිළිගනිමු!`, 5000);
      }, 1000);
      
      // Then show the play button instruction
      setTimeout(() => {
        typeMessage("මෙය ඔබගේ ක්‍රීඩාව ආරම්භ කිරීමේ බොත්තමයි", 4000);
      }, 7000);
    }
    
    // Typewriter effect for messages
    function typeMessage(message, displayTime) {
      typewriterElement.textContent = '';
      cursorElement.style.display = 'inline-block';
      
      let i = 0;
      const typing = setInterval(() => {
        if (i < message.length) {
          typewriterElement.textContent += message.charAt(i);
          i++;
        } else {
          clearInterval(typing);
          
          // Hide cursor after typing completes
          setTimeout(() => {
            cursorElement.style.display = 'none';
          }, 500);
          
          // Clear message after display time
          if (displayTime) {
            setTimeout(() => {
              typewriterElement.textContent = '';
            }, displayTime);
          }
        }
      }, 50);
    }
    
    // Update game stats display
    function updateStats() {
      levelsPlayedElement.textContent = levelsPlayed;
      cardsMatchedElement.textContent = cardsMatched;
      winsElement.textContent = wins;
      hintButton.disabled = assistantPoints < 5;
      
      // Update progress bar based on levels completed
      if (unlockedLevels.includes('hard')) {
        progressBar.style.width = '100%';
      } else if (unlockedLevels.includes('medium')) {
        progressBar.style.width = '66%';
      } else {
        progressBar.style.width = '33%';
      }
    }
    
    // Request hint
    function requestHint() {
      if (assistantPoints < 5) {
        typeMessage("ඔබට ප්‍රමාණවත් ඇසිස්ටන්ට් පොයින්ට් නැත!", 3000);
        return;
      }
      
      assistantPoints -= 5;
      localStorage.setItem('assistantPoints', assistantPoints);
      updateStats();
      
      // Find unflipped cards
      const unflippedCards = Array.from(document.querySelectorAll('.card:not(.flipped):not(.matched)'));
      
      if (unflippedCards.length < 2) {
        typeMessage("ඉඟි සඳහා ප්‍රමාණවත් කාඩ්පත් නැත!", 3000);
        return;
      }
      
      // Try to find a matching pair
      let card1 = null, card2 = null;
      const symbols = {};
      
      for (const card of unflippedCards) {
        const symbol = card.dataset.value;
        
        if (symbols[symbol]) {
          card1 = symbols[symbol];
          card2 = card;
          break;
        }
        
        symbols[symbol] = card;
      }
      
      // If no matching pair, select two random cards
      if (!card1 || !card2) {
        card1 = unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
        
        // Get another random card that's not card1
        let index2;
        do {
          index2 = Math.floor(Math.random() * unflippedCards.length);
        } while (index2 === unflippedCards.indexOf(card1));
        
        card2 = unflippedCards[index2];
      }
      
      // Highlight the cards
      card1.classList.add('hint');
      card2.classList.add('hint');
      
      typeMessage("ඉඟියක්: මෙම කාඩ්පත් ගැලපිය හැකිය!", 3000);
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        card1.classList.remove('hint');
        card2.classList.remove('hint');
      }, 3000);
    }
    
    // Existing game functions from script.js
    // (Only showing the structure to keep the response within limits)
    function initSettings() {
      // Sound settings
      const savedSound = localStorage.getItem('soundEnabled');
      if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
        document.getElementById('soundToggle').textContent = 
          `ශබ්දය: ${soundEnabled ? 'සක්‍රීය' : 'අක්‍රීය'}`;
      }

      // Dark mode
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      if (savedDarkMode) {
        darkMode = true;
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('darkModeToggle').textContent = 'සාමාන්‍ය ප්‍රකාරය';
      }

      // Card size
      const savedCardSize = localStorage.getItem('cardSize');
      if (savedCardSize) {
        cardSize = parseInt(savedCardSize);
        document.getElementById('cardSize').value = cardSize;
      }
      
      // Easy rounds completed
      easyRoundsCompleted = parseInt(localStorage.getItem('easyRounds') || '0');
    }
    
    function toggleSound() {
      soundEnabled = !soundEnabled;
      document.getElementById('soundToggle').textContent = 
        `ශබ්දය: ${soundEnabled ? 'සක්‍රීය' : 'අක්‍රීය'}`;
      localStorage.setItem('soundEnabled', soundEnabled);
    }
    
    function toggleDarkMode() {
      darkMode = !darkMode;
      document.body.setAttribute('data-theme', darkMode ? 'dark' : '');
      document.getElementById('darkModeToggle').textContent = 
        darkMode ? 'සාමාන්‍ය ප්‍රකාරය' : 'අඳුරු ප්‍රකාරය';
      localStorage.setItem('darkMode', darkMode);
    }
    
    function updateCardSize() {
      cardSize = parseInt(document.getElementById('cardSize').value);
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.style.width = `${cardSize}px`;
        card.style.height = `${cardSize}px`;
        card.style.fontSize = `${cardSize * 0.45}px`;
      });
      localStorage.setItem('cardSize', cardSize);
    }
    
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    
    function createBoard(level) {
      board.innerHTML = "";
      clearInterval(timer);
      if (helperInterval) clearInterval(helperInterval);
      time = 0;
      attempts = 0;
      matches = 0;
      firstCard = null;
      secondCard = null;
      lockBoard = false;
      
      timerDisplay.textContent = "0";
      attemptsDisplay.textContent = "0";
      matchesDisplay.textContent = "0";
      timer = setInterval(updateTimer, 1000);

      currentTheme = document.getElementById("themeSelect").value;
      const emojis = themes[currentTheme];
      let pairCount, columns;

      if (level === "easy") {
        pairCount = 4;
        columns = 4;
      } else if (level === "medium") {
        pairCount = 8;
        columns = 4;
      } else if (level === "hard") {
        pairCount = 12;
        columns = 6;
      } else if (level === "classic") {
        pairCount = 8;
        columns = 4;
      }

      totalPairs = pairCount;
      totalPairsDisplay.textContent = pairCount;
      board.style.gridTemplateColumns = `repeat(${columns}, ${cardSize}px)`;

      let selected = emojis.slice(0, pairCount);
      let cardValues = shuffle([...selected, ...selected]);

      cardValues.forEach((value) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.value = value;
        card.textContent = "?";
        card.style.width = `${cardSize}px`;
        card.style.height = `${cardSize}px`;
        card.style.fontSize = `${cardSize * 0.45}px`;

        card.addEventListener("click", flipCard);
        card.addEventListener("touchstart", flipCard, { passive: true });
        board.appendChild(card);
      });

      // For classic level, show all cards briefly
      if (level === "classic") {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
          card.textContent = card.dataset.value;
          card.classList.add('flipped');
        });
        
        setTimeout(() => {
          cards.forEach(card => {
            card.textContent = '?';
            card.classList.remove('flipped');
          });
        }, 5000);
      }
    }
    
    function flipCard() {
      if (lockBoard || this.classList.contains("flipped")) return;

      this.textContent = this.dataset.value;
      this.classList.add("flipped");

      if (!firstCard) {
        firstCard = this;
        return;
      }

      secondCard = this;
      lockBoard = true;
      attempts++;
      attemptsDisplay.textContent = attempts;

      checkForMatch();
    }
    
    function checkForMatch() {
      const isMatch = firstCard.dataset.value === secondCard.dataset.value;

      if (isMatch) {
        matches++;
        matchesDisplay.textContent = matches;
        cardsMatched += 2;
        localStorage.setItem('cardsMatched', cardsMatched);
        updateStats();
        
        // Award assistant points for match
        assistantPoints += 1;
        localStorage.setItem('assistantPoints', assistantPoints);
        updateStats();
        
        firstCard.removeEventListener("click", flipCard);
        firstCard.removeEventListener("touchstart", flipCard);
        secondCard.removeEventListener("click", flipCard);
        secondCard.removeEventListener("touchstart", flipCard);
        
        if (matches === totalPairs) {
          clearInterval(timer);
          if (helperInterval) clearInterval(helperInterval);
          
          // Track easy rounds for classic unlock
          if (currentLevel === "easy") {
            easyRoundsCompleted++;
            localStorage.setItem('easyRounds', easyRoundsCompleted);
          }
          
          wins++;
          levelsPlayed++;
          localStorage.setItem('wins', wins);
          localStorage.setItem('levelsPlayed', levelsPlayed);
          updateStats();
          
          // Award bonus assistant points for win
          assistantPoints += 5;
          localStorage.setItem('assistantPoints', assistantPoints);
          updateStats();
          
          // Handle level progression
          if (currentLevel === 'easy' && !unlockedLevels.includes('medium')) {
            unlockedLevels.push('medium');
            typeMessage(`සුභ පැතුම් ${playerName}! ඔබ පහසු මට්ටම ජයග්‍රහණය කළා! දැන් ඔබට මධ්‍යම මට්ටම ක්‍රීඩා කළ හැකිය.`, 4000);
          } else if (currentLevel === 'medium' && !unlockedLevels.includes('hard')) {
            unlockedLevels.push('hard');
            typeMessage(`පුංචි ජයග්‍රාහකයා! ඔබ මධ්‍යම මට්ටම ද ජයග්‍රහණය කළා! දැන් ඔබට උපරිම මට්ටම ක්‍රීඩා කළ හැකිය.`, 4000);
          } else if (currentLevel === 'hard' && !hasCompletedIntro) {
            hasCompletedIntro = true;
            localStorage.setItem('hasCompletedIntro', 'true');
            typeMessage(`ඔබ දැන් සෑම මට්ටමක්ම ක්‍රීඩා කළ හැක. සුභ පතමි!`, 5000);
          }
          
          typeMessage("සුභ පැතුම්! ඔබ ජයග්‍රහණය කළා!", 3000);
          showWinMessage();
          saveScore(time, attempts);
        }
        
        resetBoard();
      } else {
        setTimeout(() => {
          firstCard.textContent = "?";
          secondCard.textContent = "?";
          firstCard.classList.remove("flipped");
          secondCard.classList.remove("flipped");
          resetBoard();
        }, 800);
      }
    }
    
    function resetBoard() {
      [firstCard, secondCard] = [null, null];
      lockBoard = false;
    }
    
    function updateTimer() {
      time++;
      timerDisplay.textContent = time;
    }
    
    function showWinMessage() {
      document.getElementById('finalTime').textContent = time;
      document.getElementById('finalAttempts').textContent = attempts;
      document.getElementById('winMessage').classList.add('show');
    }
    
    function hideWinMessage() {
      document.getElementById('winMessage').classList.remove('show');
    }
    
    function saveScore(time, attempts) {
      const scores = JSON.parse(localStorage.getItem("scores") || "[]");
      scores.push({ 
        username: playerName,
        time, 
        attempts, 
        theme: currentTheme,
        date: new Date().toLocaleDateString('si-LK'),
        level: document.getElementById("levelSelect").value
      });
      scores.sort((a, b) => a.time - b.time || a.attempts - b.attempts);
      localStorage.setItem("scores", JSON.stringify(scores.slice(0, 10)));
      renderLeaderboard();
    }
    
    function renderLeaderboard() {
      leaderboard.innerHTML = "";
      const scores = JSON.parse(localStorage.getItem("scores") || "[]");
      scores.forEach((score, index) => {
        const item = document.createElement("li");
        item.innerHTML = `
          <span class="rank">${index + 1}.</span>
          <span class="username">${score.username}</span>
          <span class="time">${score.time}s</span>
          <span class="attempts">${score.attempts} පි.</span>
          <span class="level">${getLevelName(score.level)}</span>
          <span class="theme">${themeNames[score.theme] || score.theme}</span>
          <span class="date">${score.date}</span>
        `;
        leaderboard.appendChild(item);
      });
    }
    
    function getLevelName(level) {
      switch(level) {
        case 'easy': return 'පහසු';
        case 'medium': return 'මධ්‍යම';
        case 'hard': return 'උපරිම';
        case 'classic': return 'සම්භාව්‍ය';
        default: return level;
      }
    }
    
    function startGame() {
      const level = document.getElementById("levelSelect").value;
      currentLevel = level;
      createBoard(level);
      hideControls();
      document.getElementById("gameContainer").classList.add("game-focused");
      
      setTimeout(() => {
        document.getElementById("gameContainer").scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 100);
    }
    
    function restartGame() {
      const level = document.getElementById("levelSelect").value;
      createBoard(level);
      showControls();
      document.getElementById("gameContainer").classList.remove("game-focused");
      hideWinMessage();
    }
    
    function showControls() {
      document.querySelector(".controls").classList.remove("controls-collapsed");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function hideControls() {
      document.querySelector(".controls").classList.add("controls-collapsed");
    }
    
    function showInstructions() {
      document.getElementById('instructionsModal').classList.add('show');
    }
    
    function closeInstructions() {
      document.getElementById('instructionsModal').classList.remove('show');
    }
    
    function initToggles() {
      // Leaderboard toggle
      document.getElementById('toggleLeaderboard').addEventListener('click', function() {
        this.classList.toggle('active');
        const container = document.getElementById('leaderboardContainer');
        container.classList.toggle('show');
      });

      // About page toggle
      document.getElementById('aboutToggle').addEventListener('click', function() {
        this.classList.toggle('active');
        const content = document.getElementById('aboutContent');
        content.classList.toggle('show');
      });

      // Close both sections by default
      document.getElementById('leaderboardContainer').classList.remove('show');
      document.getElementById('aboutContent').classList.remove('show');
      
      // Sound toggle
      document.getElementById('soundToggle').addEventListener('click', toggleSound);
      // Dark mode toggle
      document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
      // Card size
      document.getElementById('cardSize').addEventListener('input', updateCardSize);
    }
    
    // On Page Load
    window.onload = () => {
      const splash = document.getElementById('splash');
      const loadingBar = document.querySelector('.loading-bar');
      const loadingPercentage = document.querySelector('.loading-percentage');
      
      // Simulate loading progress
      let progress = 0;
      const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        
        loadingBar.style.width = `${progress}%`;
        loadingPercentage.textContent = `${Math.floor(progress)}%`;
        
        // Change loading messages based on progress
        const messages = [
          "පද්ධතිය පූරණය වෙමින්...",
          "කාඩ්පත් සූදානම් කරමින්...",
          "තේමා පටිගත කරමින්...",
          "ස්කෝර් ලබා ගැනීම...",
          "සූදානම් වෙමින්..."
        ];
        
        if (progress < 30) {
          document.querySelector('.loading-message').textContent = messages[0];
        } else if (progress < 50) {
          document.querySelector('.loading-message').textContent = messages[1];
        } else if (progress < 70) {
          document.querySelector('.loading-message').textContent = messages[2];
        } else if (progress < 90) {
          document.querySelector('.loading-message').textContent = messages[3];
        } else {
          document.querySelector('.loading-message').textContent = messages[4];
        }
        
        if (progress >= 100) {
          clearInterval(loadingInterval);
          splash.classList.add('fade-out');
          
          setTimeout(() => {
            splash.remove();
            initGame();
          }, 500);
        }
      }, 200);
    };
