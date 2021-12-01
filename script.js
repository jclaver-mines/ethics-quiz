////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EthicsQuiz class
// Holds the quiz itself, and handles the balancing of ethical ways of thinking based on responses
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var canvasConseq = document.getElementById("canvas_conseq");
var ctxConseq = canvasConseq.getContext("2d");
var canvasDeonto = document.getElementById("canvas_deonto");
var ctxDeonto = canvasDeonto.getContext("2d");
var canvasConfuc = document.getElementById("canvas_confuc");
var ctxConfuc = canvasConfuc.getContext("2d");

var conseqColor = "#FF0000";
var deontoColor = "#0000FF";
var confucColor = "#FFFF00";

class EthicsQuiz {
  constructor() {
    this.conseq = 0;
    this.deonto = 0;
    this.confuc = 0;
    this.currQuestion = 0;

    this.questions = [
      {
        type: "multiple choice",
        prompt: "trolley problem default",
        options: ["pull lever (one dies)", "don't pull lever (five die)"],
        outcomes: ["conseq3", "deonto1"]
      },
      {
        type: "slider",
        prompt: "trolley problem family",
        options: ["matters little", "matters a lot"],
        barlength: 5,
        outcomes: ["conseq3", "confuc3"]
      },
      {
        type: "slider",
        prompt: "trolley problem push",
        options: ["push them", "don't push them"],
        barlength: 5,
        outcomes: ["conseq3", "deonto3"]
      }
    ]
  }

  // renders all bars for different ethical ways of thinking
  renderBars() {
    let maxVal = Math.max(this.conseq, this.deonto, this.confuc);
    if (maxVal == 0) {return;}

    renderBar(canvasConseq, ctxConseq, (this.conseq / maxVal), conseqColor);
    renderBar(canvasDeonto, ctxDeonto, (this.deonto / maxVal), deontoColor);
    renderBar(canvasConfuc, ctxConfuc, (this.confuc / maxVal), confucColor);
  }

  // applies an array of changes to ethical ways of thinking
  applyChange(changes) {
    this.conseq += changes[0];
    this.deonto += changes[1];
    this.confuc += changes[2];
  }

  // transforms a string into an array of changes to ethical ways of thinking
  strToChange(changeStr) {
    let changes = [0, 0, 0];

    let changeStrs = changeStr.split(' ');
    for (let i = 0; i < changeStrs.length; i++) {
      let curr = changeStrs[i];

      let ethicsStr = curr.substr(0, 6);
      let val = parseInt(curr.substr(6));

      if (ethicsStr == "conseq") {
        changes[0] += val;
      } else if (ethicsStr == "deonto") {
        changes[1] += val;
      } else if (ethicsStr == "confuc") {
        changes[2] += val;
      }
    }

    return changes;
  }

  // applies a string to ethical ways of thinking
  applyChangeStr(changeStr) {
    this.applyChange(
      this.strToChange(changeStr)
    );
  }

  // applies two linearly interpolated strings to ethical ways of thinking
  // ratio is from 0 to 1, with 0 being all changeStr1, and 1 being all changeStr2
  applyChangeStrs(changeStr1, changeStr2, ratio) {
    let changes1 = this.strToChange(changeStr1);
    let changes2 = this.strToChange(changeStr2);
    let changes = lerpArr(changes1, changes2, ratio);

    this.applyChange(changes);
  }

  // submits the current question with a given choice
  submitQuestion(choice) {
    let question = this.questions[this.currQuestion];

    if (question.type == "multiple choice") {
      this.applyChangeStr(
        question.outcomes[choice]
      );
    } else if (question.type == "slider") {
      this.applyChangeStrs(
        question.outcomes[0],
        question.outcomes[1],
        (choice / (question.barlength - 1))
      );
    }
  }

  // moves to the next question
  advanceQuestion() {
    this.currQuestion++;
  }

  // gets the current question
  getQuestion() {
    return this.questions[this.currQuestion];
  }
}

// renders a single canvas bar with how filled it should be and what color it should be
function renderBar(canvas, ctx, ratio, color) {
  let width = canvas.width * ratio;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, canvas.height);
}

// linearly interpolates between two arrays of numbers
function lerpArr(arr1, arr2, ratio) {
  let arrRes = [];
  for (let i = 0; i < arr1.length; i++) {
    arrRes[i] = (arr1[i] * (1 - ratio)) + (arr2[i] * ratio);
  }
  return arrRes;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DOM interaction
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function questionToHTML(question) {

}