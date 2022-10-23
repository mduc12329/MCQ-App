// TODO(you): Write the JavaScript necessary to complete the assignment.

const start = document.querySelector('#btn-start');
const intro = document.querySelector('#introduction');
const attempt = document.querySelector('#attempt-quiz');
const review = document.querySelector('#review-quiz');
let submit;

const result = document.querySelector('#result');
const resultPercentage = document.querySelector('#result_percentage');

// FETCH API
let questions = [];
let userID = 0;
const fetchAPI = () => {
  fetch('https://wpr-quiz-api.herokuapp.com/attempts', {
    method: 'POST',
    credentials: 'same-origin',
  })
    .then((res) => res.json())
    .then((data) => {
      userID = data._id;
      for (let ques of data.questions) {
        questions.push(ques);
      }
    })
    .then(() => {
      const createQuestion = () => {
        // let optionID = 1;
        for (let i = 0; i < questions.length; i++) {
          const question = document.createElement('div');
          question.classList.add('question');
          question.id = `${questions[i]._id}`;

          const h2 = document.createElement('h2');
          h2.classList.add('question-index', 'mg-btm', 'mg-top');
          h2.textContent = `Question ${i + 1} of ${questions.length}`;

          const p = document.createElement('p');
          p.classList.add('question-text');
          p.textContent = questions[i].text;

          const option_section = document.createElement('div');
          option_section.classList.add('option-section');
          let value = 0;
          for (let item of questions[i].answers) {
            const label = document.createElement('label');
            label.classList.add('option');
            // label.id = `option_${optionID++}`;

            const input = document.createElement('input');
            input.setAttribute('type', 'radio');
            input.setAttribute('name', `${questions[i]._id}`);
            input.setAttribute('value', `${value++}`);

            const span = document.createElement('span');
            span.textContent = item;

            option_section.appendChild(label);
            label.appendChild(input);
            label.appendChild(span);
          }

          question.appendChild(h2);
          question.appendChild(p);
          question.appendChild(option_section);
          attempt.appendChild(question);
        }
        const box = document.createElement('div');
        box.classList.add('box', 'mg-btm');
        box.id = 'box-submit';
        const submitBtn = document.createElement('button');
        submitBtn.classList.add('mg-top', 'mg-btm');
        submitBtn.id = 'btn-submit';
        submitBtn.textContent = 'Submit your answers ❯';
        box.appendChild(submitBtn);
        attempt.appendChild(box);
      };

      // start the attempt
      start.addEventListener('click', () => {
        createQuestion();
        submit = document.querySelector('#box-submit');
        intro.classList.add('hidden');
        attempt.classList.remove('hidden');
        submit.classList.remove('hidden');
        attempt.scrollIntoView();
        // Change 1 question
        const allOptions = document.querySelectorAll('.option');

        for (let item of allOptions) {
          item.addEventListener('click', onClick);
        }

        // SUBMIT
        submit.addEventListener('click', () => {
          if (confirm('You finished?') === true) {
            attempt.scrollIntoView();
            submit.classList.add('hidden');
            // SEND BACK TO SERVER
            const chosenOptions = document.querySelectorAll('.option-selected');
            let objLocal = {
              userAnswers: {},
            };

            for (let item of chosenOptions) {
              objLocal.userAnswers[item.firstElementChild.name] =
                item.firstElementChild.value;
            }

            const objSend = JSON.stringify(objLocal);
            fetch(
              `https://wpr-quiz-api.herokuapp.com/attempts/${userID}/submit`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: objSend,
              }
            )
              .then((res) => res.json())
              .then((data) => {
                // CALCULATE SCORE
                for (let item of chosenOptions) {
                  for (let item2 in data.correctAnswers) {
                    if (item.firstElementChild.name == item2) {
                      if (
                        item.firstElementChild.value ==
                        data.correctAnswers[item2]
                      ) {
                        addLabel(item, true);
                        item.classList.add('correct-answer');
                        break;
                      } else {
                        item.classList.add('wrong-answer');
                        addLabel(item, false);
                        break;
                      }
                    }
                  }
                }
                for (let item of allOptions) {
                  for (let item2 in data.correctAnswers) {
                    if (
                      item.firstElementChild.name == item2 &&
                      item.firstElementChild.value ==
                        data.correctAnswers[item2] &&
                      !item.classList.contains('correct-answer')
                    ) {
                      {
                        item.classList.add('option-correct');
                        addLabel(item, true);
                        break;
                      }
                    }
                  }
                }

                const box = document.createElement('div');
                box.classList.add('box', 'mg-btm');
                box.id = 'box-result';
                const h2 = document.createElement('h2');
                h2.classList.add('mg-top');
                h2.textContent = 'Result:';
                const p1 = document.createElement('p');
                p1.classList.add('mg-btm');
                p1.id = 'result';
                p1.textContent = `${data.score}/${data.questions.length}`;
                const b = document.createElement('b');
                const p2 = document.createElement('p');
                p2.classList.add('mg-btm');
                p2.id = 'result_percentage';
                p2.textContent = `${
                  (data.score / data.questions.length) * 100
                }%`;
                const p3 = document.createElement('p');
                p3.classList.add('mg-btm', 'scoreText');
                p3.textContent = data.scoreText;
                const btnSubmit = document.createElement('button');
                btnSubmit.classList.add('mg-top', 'mg-btm');
                btnSubmit.id = 'btn-try-again';
                btnSubmit.textContent = 'Try again';

                review.appendChild(box);
                box.appendChild(h2);
                box.appendChild(p1);
                box.appendChild(b);
                b.appendChild(p2);
                box.appendChild(p3);
                box.appendChild(btnSubmit);

                // Remove event listeners
                for (let item of allOptions) {
                  item.removeEventListener('click', onClick);
                  // Disable radio buttons
                  item.firstElementChild.disabled = true;
                }

                review.classList.remove('hidden');
                const tryAgain = document.querySelector('#btn-try-again');
                tryAgain.addEventListener('click', () => {
                  location.reload();
                });
              });
          }
        });
      });
    });
};
fetchAPI();

// CHANGE OPTIONS
const questionList = attempt.querySelectorAll('.question');
const input = document.querySelectorAll('input');

const onClick = (e) => {
  const option = e.currentTarget;
  const selected = option.parentElement.querySelector('.option-selected');
  if (selected) {
    selected.classList.remove('option-selected');
  }
  option.classList.add('option-selected');
};

// SUBMIT

const addLabel = (tag, state) => {
  const span = document.createElement('span');
  span.classList.add('notify');
  if (state === true) {
    span.textContent = 'Correct answer';
  } else {
    span.textContent = 'Your answer';
  }
  tag.appendChild(span);
};
