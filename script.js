const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");

//sounds effects
const scoreSound = new Audio("sounds/scoreReceived-sound.mp3");
const highScoreSound = new Audio("sounds/hurray-sound.mp3");

scoreSound.volume = 0.6;
highScoreSound.volume = 0.7;

//welcome screen
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

//score elements
const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeScore = document.querySelector("#time");

const blockHeight = 50;
const blockWidth = 50;

let highScore = localStorage.getItem("highScore") || 0;
highScoreElement.innerText = highScore;
let score = 0;        //initially we set score to 0
let time = localStorage.getItem("timeScore") || "00:00";

//we have to calculate the no .of rows and columns in a grid
const columns = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;         //for render function
let timerIntervalID = null;

//calculte food position
let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * columns),
};

const blockArr = []; //we have created the blockarr to store grid cell(block) so that we can instantly access and update the cell
// blockArr - poora grid => blockArr[0] - first row  =>  blockArr[0][0]- ek specific div(cell)

let snake = [
  /*we have created the snake array to store multiple values of snake */
  { x: 1, y: 3 }, //snake head
  // { x: 1, y: 4 }, //snake body
  // { x: 1, y: 5 }, //snake tail
];

// let snakeColors = ["#4CAF50"];   //starting snake color
// const colorPool = ["#4CAF50","#FF9800","#999","#E91E63","#9C27BO"];

let direction = "right";

for (let row = 0; row < rows; row++) {
  //this for loop will create the grid
  blockArr[row] = []; /*this line creates a new empty array inside blockArr for the current row  => kyuni har row k liye ek array create krna hai */
  /*blockArr = ek badi almari
                                          blockArr[row] = almari ki ek shelf
                                          blockArr[row][col] = shelf ek andar rakha hua items  */

  for (let col = 0; col < columns; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);

    blockArr[row][col] = block; // correct 2D storage           //blockArr[row]- current row  and blockArr[row][col] - us row ka current column
  }
}
//this variable is for highScore sound
let highScoreBeaten = false;              //sound abhi nhi baja
let recordBroken = false;   //abhi record break nhi hua

function render() {
  // this function will render/ show the snakarray ke elemnts
  let head = null;

  blockArr[food.x][food.y].classList.add("food");

  if (direction === "left") {
    head = {
      x: snake[0].x, //snake[0]= snake ka head    //snake[0].x = head ka current row
      y: snake[0].y - 1, //snake[0].y = head ka current column
    };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }
    //base conditions where our snake can reach out of the grid
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= columns) {
    clearInterval(intervalId); //this clearInterval method will clear the running setInterval to stop
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
    return;
  }

  //food consume logic
  if (head.x == food.x && head.y == food.y) {
    blockArr[food.x][food.y].classList.remove("food");
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * columns),
    }; //recalculate food location
    blockArr[food.x][food.y].classList.add("food");

    snake.unshift(head);

    score += 10;
    scoreSound.currentTime = 0; //currentTime = ye audio/video object ka property hai currtime =0 set krne se sound hamesha start se bajega
    scoreSound.play();
    scoreElement.innerText = score;

    //this part is for CSS animation
    scoreElement.classList.remove("score-pop"); //agar class already lagi ho, to pehle remove krna zaruri hai
    void scoreElement.offsetWidth; //ye trick hai repeatable CSS animation k liye
    scoreElement.classList.add("score-pop"); //class add hui - animation start
    
    //HighScore logic
    if ( !recordBroken && score > highScore) {        //record break hua hai
      highScore = score;
      localStorage.setItem("highScore", highScore.toString()); //setItem(key,value) why to String()--because localStorage me sirf Strings store hoti hai
      highScoreElement.innerText = highScore;
      
      highScoreSound.currentTime = 0; //rewind the sound to the beginning
      highScoreSound.play(); //play sound

      highScorePopUp(highScore);
      recordBroken = true; //mark that sound has been played, next time skip
      }
    }

  snake.forEach((segment) => {
    blockArr[segment.x][segment.y].classList.remove("fill"); //color bhi remove krva denge from end ----- render kabhi bhi ye assume nhi krta ki screen clean hai--wo khud pehle clean krta hai thats why we first use remove
    blockArr[segment.x][segment.y].classList.remove("snake-head"); //color bhi remove krva denge from end ----- render kabhi bhi ye assume nhi krta ki screen clean hai--wo khud pehle clean krta hai thats why we first use remove

  });

  snake.unshift(head); //unshift method add elemnt at start
  snake.pop(); //pop method removes the last elmnt

  //this segment is nothing but {x:1, y:3} these values
  snake.forEach((segment) => {
    blockArr[segment.x][segment.y].classList.add("fill"); //snake ke har segment k liye uski x y position nikalo
    blockArr[snake[0].x][snake[0].y].classList.add("snake-head");
  });
}

startButton.addEventListener("click", () => {
  modal.style.display = "none";
  intervalId = setInterval(() => { render();},200);
    //setInterval - run the same function again n again after a fixed time---it doesnt stop automatically so we need a clearInterval.
    //why does clearinterval need a parameter?-
    //intervalId = setInterval(render,300) => javascript internally says...i started one interval.its Id is 3(forEx) so now intervalId =3.
    //if we dont store the id javscript says konsa interval stop krna hai

  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split(":").map(Number); //de-structuring-----   time= "02:45" (String)  split method divides the time by ':'  result = ["02","45"]
    //                                            //.map(Number) is array ke har String element ko lega and convert it into Number ==> min = 02 sec = 45
    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    const formattedMin = String(min).padStart(2, "0"); //padStart() is STring method--it adds characters at the Start of a String. it doesnt work on Numbers(Strings Only)
    const formattedSec = String(sec).padStart(2, "0"); //Syntax = String.padStart(targetlength, padString) -- targetLength--total length you want, padString--what you want to add At Start usually"0"

    time = `${formattedMin}:${formattedSec}`;
    timeScore.innerText = time;
  }, 1000);
});

function highScorePopUp(score){
  const popup = document.querySelector(".newRecordText");
  // console.log("popup class name:", popup.className);
  popup.classList.remove("show-record");        //remove the class if already present
  void popup.offsetWidth;
  popup.classList.add("show-record");
  // popup.textContent = `NEW RECORD: ${highScore}!🎉`
}

restartButton.addEventListener("click", restartGame);
function restartGame() {
  blockArr[food.x][food.y].classList.remove("food");
  snake.forEach((segment) => {
    blockArr[segment.x][segment.y].classList.remove("fill");
    blockArr[segment.x][segment.y].classList.remove("snake-head")
  });
  score = 0;
  recordBroken = false; //restartGame()-- naya game start hota hai--phirse high score cross ho sakta hai that's why we set highScoreBeaten = false
  time = "00:00";
  scoreElement.innerText = score;
  timeScore.innerText = time;

  modal.style.display = "none";
  direction = "down";
  snake = [{ x: 1, y: 3 }];
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * columns),
  };
  intervalId = setInterval(() => {
    render();
  }, 300);
}

//created the eventListener so that we can change the snake's direction in real time
addEventListener("keydown", (event) => {
  // console.log(event.code);                       //event.code = keyboard ka button ka naam
  if (event.key == "ArrowUp") {
    direction = "up";
  } else if (event.key == "ArrowDown") {
    direction = "down";
  } else if (event.key == "ArrowRight") {
    direction = "right";
  } else if (event.key == "ArrowLeft") {
    direction = "left";
  }
  // console.log(event.key)                         //event.key = button se nikla hua charcter
});

/**
 Execution flow
 1. Grid create hoti hai
 2. Food location decide hoti hai
 3. snake array create hoti hai
 4. render() call hota hai.
 5. Game start with setInterval


 "setInterval uses a intervalId because to stop the interval,we need a intervalId to pass in clearInterval"
 
 
 
 
 
 */
