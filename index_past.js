const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let participantNumber, studyTrial;
let clickCount = 0; 

document.querySelector(".score").textContent = score;

fetch("./data/cards.json")
  .then((res) => res.json())
  .then((data) => {
    cards = [...data, ...data];
    shuffleCards();
    generateCards();
  });

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}
/*
function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}*/
function generateCards() {
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.setAttribute("data-position", i); // Add position attribute
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}

function flipCard() {
  if (lockBoard || this.classList.contains('flipped')) return;

  this.classList.add("flipped");

  const index = parseInt(this.getAttribute('data-position'));

  if (clickCount % 2 === 0) {
    firstCard = this;
    firstCardIndex = index;
  } else {
    secondCard = this;
    secondCardIndex = index;
  }

  recordGameData(index); // Record game data

  clickCount++;

  if (clickCount % 2 === 0) {
    checkForMatch();
  }
}


function exportToCSV(participantNumber, studyTrial, data) {
  const csvContent = "data:text/csv;charset=utf-8," + data;

  // Create a link element
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `${participantNumber}_trial_${studyTrial}.csv`);

  // Simulate a click on the link to trigger the download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/*
function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  recordFlip(this); 
  score++;
  document.querySelector(".score").textContent = score;
  lockBoard = true;

  checkForMatch();
}*/

/*
function recordFlip(card) {
  const timestamp = new Date().toISOString();
  const label = firstCard ? "second" : "first";
  const position = card.getAttribute("data-position");
  const data = { timestamp, label, position };
  gameData.push(data);
}*/

function recordGameData(index) {
  const timestamp = new Date().toISOString();
  const label = clickCount % 2 === 0 ? 1 : 2; // 1 for first card, 2 for second card
  const isMatched = clickCount % 2 === 1 && cards[firstCardIndex].name === cards[index].name ? 1 : 0; // 1 if matched, 0 otherwise
  const rowIndex = Math.floor(index / gridSize) + 1; // Adding 1 to make it 1-indexed
  const colIndex = index % gridSize + 1; // Adding 1 to make it 1-indexed
  
  const rowData = `${timestamp},${label},${index},${rowIndex},${colIndex},${isMatched}`;
  
  // Export data to CSV
  exportToCSV(participantNumber, studyTrial, rowData);
}




/*
function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();
}*/

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  if (isMatch) {
    disableCards();
    score++;
    document.querySelector(".score").textContent = score;
  } else {
    setTimeout(unflipCards, 1000); // Delay unflipping the cards for 1 second
  }
}


function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  resetBoard();
}

function unflipCards() {
  lockBoard = true; // Prevent further card flipping during unflipping animation
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}


function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}


function restart() {
  resetBoard();
  shuffleCards();
  score = 0;
  document.querySelector(".score").textContent = score;
  gridContainer.innerHTML = "";
  generateCards();
}

function exportData() {
  participantNumber = document.getElementById("participant").value;
  studyTrial = document.getElementById("trial").value;
  const fileName = `${participantNumber}_trial_${studyTrial}.json`;
  const jsonData = JSON.stringify(gameData, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
