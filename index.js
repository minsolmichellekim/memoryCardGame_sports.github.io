const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let tries = 0; 
let participantNumber, studyTrial; 
let clickCount = 0; 
let dataToExport = [];
let click_timestamp; 
const gridSize = 6;

//document.querySelector(".score").textContent = score;

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

function generateCards() {
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.setAttribute("data-position", i); 
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", function() {
      click_timestamp = new Date().toISOString();
      flipCard.call(this, i); // or flipCard.bind(this, i)
    });
  }
}

function getRowAndColumn(index, numCols){
  const row = Math.floor(index/numCols); 
  const col = index % numCols; 
  return {row, col}; 
}

function flipCard(index) {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");
  clickCount++;

  if (!firstCard) {
    firstCard = this;
    firstCardIndex = index;
    recordGameData(index, -1);  
    return;
  }

  secondCard = this;
  secondCardIndex = index; 
  tries++; 
  lockBoard = true;

  isMatch = checkForMatch();
  if (isMatch){
    score++;
  }
  recordGameData(index, isMatch); 
}

function recordGameData(index, isMatch) {
  //const timestamp = new Date().toISOString();
  const label = clickCount % 2 === 0 ? 1 : 0; // 1 for first card, 0 for second card
  //const isMatched = clickCount % 2 === 1 && cards[firstCardIndex].name === cards[index].name ? 1 : 0; // 1 if matched, 0 otherwise
  const rowIndex = Math.floor(index / gridSize) ; // Adding 1 to make it 1-indexed
  const colIndex = index % gridSize; // Adding 1 to make it 1-indexed
  
  const rowData = {
    click_timestamp: click_timestamp,
    label: label,
    index: index,
    rowIndex: rowIndex,
    colIndex: colIndex,
    isMatch: isMatch
  };
  dataToExport.push(rowData);
}
/*
function recordGameData(index, isMatch) {
  //const timestamp = new Date().toISOString();
  const label = clickCount % 2 === 0 ? 1 : 0; // 1 for first card, 0 for second card
  //const isMatched = clickCount % 2 === 1 && cards[firstCardIndex].name === cards[index].name ? 1 : 0; // 1 if matched, 0 otherwise
  const rowIndex = Math.floor(index / gridSize) + 1; // Adding 1 to make it 1-indexed
  const colIndex = index % gridSize + 1; // Adding 1 to make it 1-indexed
  
  const rowData = `${click_timestamp},${label},${index},${rowIndex},${colIndex},${isMatch}`;
  dataToExport.push(rowData);
}*/

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards(); // If matched, Don't allow cards clicked again.  

  return isMatch; 
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  score++;
  //document.querySelector(".score").textContent = score;

  resetBoard();
}

function unflipCards() {
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
  //document.querySelector(".score").textContent = score;
  gridContainer.innerHTML = "";
  generateCards();
}

function exportCSV(){
  const participantNumber = document.getElementById("participant").value;
  const studyTrial = document.getElementById("trial").value;
  const fileName = `${participantNumber}_trial_${studyTrial}.csv`;
  const csvString= convertToCSV(dataToExport); 
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function convertToCSV(dataGiven) {
  const header = Object.keys(dataGiven[0]).join(',');
  const body = dataGiven.map(obj => Object.values(obj).join(',')).join('\n');
  return `${header}\n${body}`;
}

/*
function exportData() {
    participantNumber = document.getElementById("participant").value;
    studyTrial = document.getElementById("trial").value;
    const fileName = `${participantNumber}_trial_${studyTrial}.json`;

    const jsonData = JSON.stringify(gameData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });x
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  
  function exportToCSV(data) {
    const participantNumber = document.getElementById("participant").value;
    const studyTrial = document.getElementById("trial").value;
    
    // Define the header row for the CSV file
    const header = "Timestamp,Label,Index,Row,Column,Matched";
  
    // Create a Blob object from the CSV content
    const blob = new Blob([header, '\n', data], { type: "text/csv;charset=utf-8" });

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create an anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${participantNumber}_trial_${studyTrial}.csv`;

    // Append the anchor to the document body and trigger a click event
    document.body.appendChild(a);
    a.click();

    // Clean up by removing the anchor and revoking the URL
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
*/