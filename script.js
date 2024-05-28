var max = 6;
var min = 1;
var moveDelay = 500;
var turnAmount = 1/24;

var tetrisBag = [1, 2, 3, 4, 5, 6];
var currentRotation = 0.00;
var moveCount = 0;
var rollResult = 0;
var moveInterval;
var facing;
var audio = new Audio('images/click.wav');
var piece = document.getElementById('piece');
var die = document.getElementById('die');
var faceRotations = {1:`rotate3d(0, 0, 0, 90deg)`, 2:`rotate3d(0, 1, 0, 180deg)`, 3:`rotate3d(0, -1, 0, 90deg)`, 4:`rotate3d(0, 1, 0, 90deg)`, 5:`rotate3d(-1, 0, 0, 90deg)`, 6:`rotate3d(1, 0, 0, 90deg)`};
var tray = document.getElementById(`tray`);
var trayBounds = tray.getBoundingClientRect();
var inertiaVector = {x:0 , y:0, time:0, rotation:7.2};
var inertiaInterval;

window.onload = (event) => {
  dragElement(die.parentElement);
  facing = document.getElementById(`1`);
  facing.style.boxShadow = `none`;
}

function roll() {
  if(tetrisBag.length == 0) {
    tetrisBag = [1, 2, 3, 4, 5, 6];
  }
  rollResult = tetrisBag[Math.floor(Math.random() * tetrisBag.length)];
  tetrisBag = tetrisBag.filter((value, index) => value != rollResult);
  die.style.transform = `${faceRotations[rollResult]}`;
  facing = document.getElementById(`${rollResult}`);
  Array.from(document.querySelectorAll(`.face`)).forEach((element) => {
    if(element.id != facing.id) {
      element.style.boxShadow = ``;
    } else {
      element.style.boxShadow = `none`;
    }
  });
  if(!moveInterval) {
    moveInterval = setInterval(changePosition, moveDelay);
  }
}

function applyInertia(object) {
  let mu = 0.9;
  if(inertiaVector.x != 0 && inertiaVector.y != 0) {
    if(object.offsetTop >= trayBounds.top + 110 && object.offsetTop <= trayBounds.bottom - 100 - object.clientHeight) {
      object.style.top = object.offsetTop - inertiaVector.y + "px";      
    } else {
      object.style.top = closest(object.offsetTop, [trayBounds.top + 110, trayBounds.bottom - 110 - object.clientHeight]) + "px";
      inertiaVector.y = -inertiaVector.y;
    }
    if(object.offsetLeft >= trayBounds.left + 95 && object.offsetLeft <= trayBounds.right - 120 - object.clientWidth) {
      object.style.left = object.offsetLeft - inertiaVector.x + "px";      
    } else {
      object.style.left = closest(object.offsetLeft, [trayBounds.left + 95, trayBounds.right - 130 - object.clientWidth]) + "px";
      inertiaVector.x = -inertiaVector.x;
    }
    let xRatio = -inertiaVector.x / (Math.abs(inertiaVector.x) + Math.abs(inertiaVector.y));
    let yRatio = inertiaVector.y / (Math.abs(inertiaVector.x) + Math.abs(inertiaVector.y));
    object.children.die.style.transform = `rotate3d(${yRatio}, ${xRatio}, 0, ${inertiaVector.rotation}deg)`;
    inertiaVector.rotation += 7.2 * mu;
    inertiaVector.x *= mu;
    inertiaVector.y *= mu;
    if(Math.abs(inertiaVector.x) <= 0.5) {
      inertiaVector.x = 0;
    }
    if(Math.abs(inertiaVector.y) <= 0.5) {
      inertiaVector.y = 0;
    }
  } else {
    clearInterval(inertiaInterval);
    inertiaInterval = false;
    roll();
  }
}

function changePosition() {
  currentRotation += turnAmount;
  piece.style.transform = `rotate(${currentRotation}turn)`;
  audio.play();
  moveCount++;
  if(moveCount >= rollResult) {
    moveCount = 0;
    rollResult = 0;
    clearInterval(moveInterval);
    moveInterval = false;
  }
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    inertiaVector.x = pos3;
    inertiaVector.y = pos4;
    inertiaVector.time = Date.now();
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    if(elmnt.offsetTop >= trayBounds.top + 110 && elmnt.offsetTop <= trayBounds.bottom - 100 - elmnt.clientHeight) {
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";      
    } else {
      elmnt.style.top = closest(elmnt.offsetTop, [trayBounds.top + 110, trayBounds.bottom - 110 - elmnt.clientHeight]) + "px";
    }
    if(elmnt.offsetLeft >= trayBounds.left + 95 && elmnt.offsetLeft <= trayBounds.right - 120 - elmnt.clientWidth) {
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";      
    } else {
      elmnt.style.left = closest(elmnt.offsetLeft, [trayBounds.left + 95, trayBounds.right - 130 - elmnt.clientWidth]) + "px";
    }
  }

  function closeDragElement(e) {
    // stop moving when mouse button is released:
    inertiaVector.time -= Date.now();
    inertiaVector.x -= e.clientX;
    inertiaVector.x = inertiaVector.x/Math.abs(inertiaVector.time) * 50;
    inertiaVector.y -= e.clientY;
    inertiaVector.y = inertiaVector.y/Math.abs(inertiaVector.time) * 50;
    if(!inertiaInterval) {
      Array.from(document.querySelectorAll(`.face`)).forEach((element) => {
        element.style.boxShadow = `none`;
      });
      inertiaInterval = setInterval(applyInertia, 10, elmnt);
    }
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function closest(input, array) {
  var closest = array.reduce(function(prev, curr) {
    return (Math.abs(curr - input) < Math.abs(prev - input) ? curr : prev);
  });
  return closest;
}