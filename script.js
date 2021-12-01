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
        title: "The Trolley Problem",
        prompt: "An out-of-control train is going down the tracks, and it will hit five people if it keeps going on its current course. However, you can pull a lever that redirects the train onto a different track, and it will only kill one person. Should you pull the lever?",
        options: ["Pull the lever (one dies)", "Don't pull the lever (five die)"],
        meanings: ["This choice is more consequentialist, since it aims to save more people.", "This choice is more deontological, since although you save less people, you are not the murderer of the one person."],
        outcomes: ["conseq2", "deonto3"]
      },
      {
        type: "slider",
        title: "The Trolley Problem 2",
        prompt: "Now, what if the people on the tracks are members of your friends or family? How much does this matter in your decision?",
        options: ["Matters very little", "Matters very much"],
        meanings: ["This side is more consequentialist, since it aims to save more people, even at the expense of family or friends.", "This side is more Confucian, since the decision itself is based on our obligations and connections to the people on the tracks."],
        barlength: 10,
        outcomes: ["conseq3", "confuc2"]
      },
      {
        type: "multiple choice",
        title: "The Trolley Problem 3",
        prompt: "Now, imagine that in our original scenario, rather than pulling a lever, you had to push a person in front of the train, which would stop the train on impact. Would you push the person in front of the train to save the other five?",
        options: ["Push them (one dies)", "Don't push them (five die)"],
        meanings: ["This choice is more consequentialist, since it aims to save more people.", "This choice is more deontological, since although you save less people, you are not the murderer of the one person."],
        outcomes: ["conseq3", "deonto2"]
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

  // returns whether or not the quiz has been finished
  isFinished() {
    return (this.currQuestion >= this.questions.length);
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

// making the quiz object
let quiz = new EthicsQuiz();
let tooltipsEnabled = false;

// converts a question to an HTML div
function questionToHTML(question) {
  // making the parent div
  let parentDiv = document.createElement("div");
  parentDiv.setAttribute("id", "question-div");
  parentDiv.setAttribute("question_type", question.type);
  parentDiv.classList.add("margin-bottom");

  // making the title
  let title = question.title;
  let questionTitle = document.createElement("h3");
  questionTitle.textContent = title;
  parentDiv.appendChild(questionTitle);

  // making the prompt
  let prompt = question.prompt;
  let questionPrompt = document.createElement("p");
  questionPrompt.textContent = prompt;
  parentDiv.appendChild(questionPrompt);

  if (question.type == "multiple choice") {
    // make each choice into a radio button choice
    for (let i = 0; i < question.options.length; i++) {
      let option = question.options[i];
      let meaning = question.meanings[i];

      // making the radio button
      let radioButton = document.createElement("input");
      radioButton.setAttribute("type", "radio");
      radioButton.setAttribute("id", ("question-radio-" + i));
      radioButton.setAttribute("name", "question-radio");
      radioButton.setAttribute("value", i);
      parentDiv.appendChild(radioButton);

      // making the label
      let radioLabel = document.createElement("label");
      radioLabel.setAttribute("for", ("question-radio-" + i));
      radioLabel.textContent = option;

      // making the tooltip
      radioLabel.classList.add(tooltipsEnabled ? "tooltip" : "tooltip-able");
      let tooltip = document.createElement("div");
      tooltip.textContent = meaning;
      tooltip.classList.add("tooltiptext");
      radioLabel.appendChild(tooltip);
      parentDiv.appendChild(radioLabel);

      // (newline)
      let radioNewline = document.createElement("br");
      parentDiv.appendChild(radioNewline);
    }
  } else if (question.type == "slider") {
    // making the left label
    let leftLabel = document.createElement("span");
    leftLabel.textContent = question.options[0];

    // (and its tooltip)
    leftLabel.classList.add(tooltipsEnabled ? "tooltip" : "tooltip-able");
    let leftTooltip = document.createElement("div");
    leftTooltip.textContent = question.meanings[0];
    leftTooltip.classList.add("tooltiptext");
    leftLabel.appendChild(leftTooltip);
    parentDiv.appendChild(leftLabel);

    // making the slider
    let slider = document.createElement("input");
    slider.setAttribute("type", "range");
    slider.setAttribute("id", "question-slider");
    slider.setAttribute("min", "0");
    slider.setAttribute("max", (question.barlength - 1));
    slider.setAttribute("value", Math.floor(question.barlength / 2));
    parentDiv.appendChild(slider);

    // making the right label
    let rightLabel = document.createElement("span");
    rightLabel.textContent = question.options[1];

    // (and its tooltip)
    rightLabel.classList.add(tooltipsEnabled ? "tooltip" : "tooltip-able");
    let rightTooltip = document.createElement("div");
    rightTooltip.textContent = question.meanings[1];
    rightTooltip.classList.add("tooltiptext");
    rightLabel.appendChild(rightTooltip);
    parentDiv.appendChild(rightLabel);
  }

  return parentDiv;
}

// finds the value that the user has selected for their current question
function getSelectedValue() {
  let parentDiv = document.getElementById("question-div");
  let questionType = parentDiv.getAttribute("question_type");

  if (questionType == "multiple choice") {
    // credit to https://stackoverflow.com/a/30917988
    // for how to effectively find the value of a radio group
    let checkedButton = document.querySelector("input[name='question-radio']:checked");
    if (checkedButton == undefined) {
      return -1;
    } else {
      return parseInt(checkedButton.value);
    }
  } else if (questionType == "slider") {
    let slider = document.getElementById("question-slider");
    return parseInt(slider.value);
  }
}

// displays the current question
function displayQuestion() {
  let question = quiz.getQuestion();
  let questionHTML = questionToHTML(question);

  let promptContainer = document.getElementById("question-prompt");
  promptContainer.textContent = "";
  promptContainer.appendChild(questionHTML);
}

// advances a question
function advanceQuestion() {
  quiz.advanceQuestion();
}

// submits a question (returns whether or not it was successfully submitted)
function submitQuestion() {
  // getting user's choice
  let choice = getSelectedValue();

  // applying user's choice
  if (choice == -1) {
    alert("Please select an answer!");
    return false;
  } else {
    quiz.submitQuestion(choice);
    quiz.renderBars();
    return true;
  }
}

// ends the quiz
function endQuiz() {
  // displaying results
  document.getElementById("setting-results").checked = true;
  document.getElementById("results-container").style.display = "";

  // hiding submit button
  document.getElementById("btn-submit").style.display = "none";

  // displaying final text
  let promptContainer = document.getElementById("question-prompt");
  promptContainer.textContent = "";

  let p1 = document.createElement("p");
  p1.textContent = "You've finished the quiz! Look at the three bars below to see which type or types of ethical thought you most often use in decision-making.";
  promptContainer.appendChild(p1);

  let p2 = document.createElement("p");
  p2.textContent = "Consequentialism dictates that decisions should be made based on how much they improve the overall happiness of different people. Regardless of what actions are taken, the more people made happy, the better.";
  promptContainer.appendChild(p2);

  let p3 = document.createElement("p");
  p3.textContent = "Deontology dictates that decisions should be made based on whether the action itself is generally right or wrong. Morality is based on rules, and not on consequences.";
  promptContainer.appendChild(p3);

  let p4 = document.createElement("p");
  p4.textContent = "Confucian Ethics dictates that decisions should be made based on the actor's relationship to the affected parties. We have different obligations to different people, and those obligations should determine how we act.";
  promptContainer.appendChild(p4);
}

// begin button
document.getElementById("btn-begin").onclick = (mouseEvent) => {
  // swapping begin button for submit button
  document.getElementById("btn-begin").style.display = "none";
  document.getElementById("btn-submit").style.display = "";

  // displaying first question
  displayQuestion();
}

// submit button
document.getElementById("btn-submit").onclick = (mouseEvent) => {
  // submitting a question
  let submitted = submitQuestion();

  // if we didn't submit successfully, don't proceed
  if (!submitted) {return;}

  // advancing a question
  advanceQuestion();

  if (quiz.isFinished()) {
    // finishing the quiz
    endQuiz();
  } else {
    // displaying the new question
    displayQuestion();
  }
}

// settings: display results
document.getElementById("setting-results").onchange = (event) => {
  let checked = document.getElementById("setting-results").checked;
  if (checked) {
    document.getElementById("results-container").style.display = "";
  } else {
    document.getElementById("results-container").style.display = "none";
  }
}

// settings: display tooltips
document.getElementById("setting-tooltips").onchange = (event) => {
  let checked = document.getElementById("setting-tooltips").checked;
  let toRemove, toAdd;
  if (checked) {
    toRemove = "tooltip-able";
    toAdd = "tooltip";
  } else {
    toRemove = "tooltip";
    toAdd = "tooltip-able";
    let toDeTooltip = document.getElementsByClassName("tooltip");
    for (let i = 0; i < toDeTooltip.length; i++) {
      let curr = toDeTooltip[i];
      curr.classList.remove("tooltip");
      curr.classList.add("tooltip-able");
    }
  }

  let toChange = document.getElementsByClassName(toRemove);
  let toChangeArr = [];
  for (let i = 0; i < toChange.length; i++) {
    toChangeArr.push(toChange[i]);
  }
  for (let i = 0; i < toChangeArr.length; i++) {
    let curr = toChangeArr[i];
    curr.classList.remove(toRemove);
    curr.classList.add(toAdd);
  }

  tooltipsEnabled = !tooltipsEnabled;
}