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

  renderBars() {
    let maxVal = Math.max(this.conseq, this.deonto, this.confuc);
    if (maxVal == 0) {return;}

    renderBar(canvasConseq, ctxConseq, (this.conseq / maxVal), conseqColor);
    renderBar(canvasDeonto, ctxDeonto, (this.deonto / maxVal), deontoColor);
    renderBar(canvasConfuc, ctxConfuc, (this.confuc / maxVal), confucColor);
  }

  applyChange(changes) {
    this.conseq += changes[0];
    this.deonto += changes[1];
    this.confuc += changes[2];
  }

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

  applyChangeStr(changeStr) {
    this.applyChange(
      this.strToChange(changeStr)
    );
  }

  applyChangeStrs(changeStr1, changeStr2, ratio) {
    let changes1 = this.strToChange(changeStr1);
    let changes2 = this.strToChange(changeStr2);
    let changes = lerpArr(changes1, changes2, ratio);

    this.applyChange(changes);
  }

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

  advanceQuestion() {
    this.currQuestion++;
  }

  getQuestion() {
    return this.questions[this.currQuestion];
  }
}

function renderBar(canvas, ctx, ratio, color) {
  let width = canvas.width * ratio;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, canvas.height);
}

function lerpArr(arr1, arr2, ratio) {
  let arrRes = [];
  for (let i = 0; i < arr1.length; i++) {
    arrRes[i] = (arr1[i] * (1 - ratio)) + (arr2[i] * ratio);
  }
  return arrRes;
}