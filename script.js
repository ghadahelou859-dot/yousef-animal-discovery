const screens=[...document.querySelectorAll('.screen')];
const welcomeVideo=document.getElementById('welcomeVideo');
const lessonImage=document.getElementById('lessonImage');
const lessonMobileSource=document.getElementById('lessonMobileSource');
const lessonAudio=document.getElementById('lessonAudio');
const questionAudio=document.getElementById('questionAudio');
const animalAudio=document.getElementById('animalAudio');
let lessonIndex=0,questionIndex=0,score=0,timeLeft=10,timerId=null,answering=false,activeQuestions=[];

const questions=[
 {q:'Which animal can slither?',a:['Snake','Duck','Cat'],c:0},
 {q:'What does a fish use to swim?',a:['Wings','Fins','Fur'],c:1},
 {q:'What covering keeps a cat warm?',a:['Scales','Shell','Fur'],c:2},
 {q:'How many main body parts does an insect have?',a:['Two','Three','Five'],c:1},
 {q:'How many legs does an insect have?',a:['Four','Six','Eight'],c:1},
 {q:'Which is the middle part of an ant?',a:['Thorax','Head','Abdomen'],c:0},
 {q:'What protects the soft body of a turtle?',a:['A shell','A fin','A wing'],c:0},
 {q:'Which animal catches insects in a web?',a:['Fox','Spider','Bird'],c:1},
 {q:'What do all animals need?',a:['Toys','Food and water','Shoes'],c:1},
 {q:'Which one is an insect?',a:['Ant','Fish','Snake'],c:0},
 {q:'Which animal has feathers?',a:['Bird','Cat','Fish'],c:0},
 {q:'Which animal has scales?',a:['Fish','Dog','Butterfly'],c:0},
 {q:'Which body part holds an ant’s legs?',a:['Thorax','Head','Abdomen'],c:0},
 {q:'Which animal can fly?',a:['Bird','Turtle','Snake'],c:0},
 {q:'What does a dog use to walk and run?',a:['Legs','Fins','Wings'],c:0},
 {q:'Which animal is small?',a:['Ant','Elephant','Polar bear'],c:0},
 {q:'What does an animal need to breathe?',a:['Air','A toy','A shoe'],c:0},
 {q:'Where can a bird live?',a:['In a nest','In a shoe','In a book'],c:0},
 {q:'Listen carefully. Which animal makes this sound?',a:['Dog','Bird','Fish'],c:0,type:'sound',sound:'dog-sound.mp3'},
 {q:'Listen carefully. Which animal makes this sound?',a:['Cat','Bird','Snake'],c:1,type:'sound',sound:'bird-sound.mp3'}
];

function showScreen(id){screens.forEach(s=>s.classList.toggle('active',s.id===id));window.scrollTo(0,0)}
function stopAllAudio(){[lessonAudio,questionAudio,animalAudio].forEach(a=>{a.pause();a.currentTime=0});speechSynthesis.cancel()}
function shuffle(items){return [...items].sort(()=>Math.random()-.5)}

document.getElementById('startBtn').addEventListener('click',()=>{showScreen('videoScreen');welcomeVideo.play().catch(()=>{})});
welcomeVideo.addEventListener('ended',()=>showScreen('mapScreen'));
document.getElementById('skipVideo').addEventListener('click',()=>{welcomeVideo.pause();showScreen('mapScreen')});
document.querySelectorAll('.map-node[data-lesson]').forEach(btn=>btn.addEventListener('click',()=>openLesson(Number(btn.dataset.lesson))));
document.querySelectorAll('.go-map').forEach(btn=>btn.addEventListener('click',()=>{stopTimer();stopAllAudio();showScreen('mapScreen')}));

function openLesson(index){lessonIndex=Math.max(0,Math.min(5,index));const n=String(lessonIndex+1).padStart(2,'0');lessonImage.src=`lesson-${n}-desktop.png`;lessonMobileSource.srcset=`lesson-${n}-mobile.jpg`;lessonImage.alt=`Lesson ${lessonIndex+1}`;lessonAudio.src=`lesson-${n}.mp3`;document.getElementById('previousLesson').disabled=lessonIndex===0;document.getElementById('nextLesson').textContent=lessonIndex===5?'Take the challenge':'Next';showScreen('lessonScreen')}
document.getElementById('playLessonAudio').addEventListener('click',()=>{lessonAudio.currentTime=0;lessonAudio.play().catch(()=>{})});
document.getElementById('previousLesson').addEventListener('click',()=>openLesson(lessonIndex-1));
document.getElementById('nextLesson').addEventListener('click',()=>lessonIndex===5?startQuiz():openLesson(lessonIndex+1));
document.getElementById('openQuiz').addEventListener('click',startQuiz);
document.getElementById('retryQuiz').addEventListener('click',startQuiz);

function startQuiz(){const regular=shuffle(questions.filter(q=>q.type!=='sound')).slice(0,8);const sound=shuffle(questions.filter(q=>q.type==='sound')).slice(0,2);activeQuestions=shuffle([...regular,...sound]);questionIndex=0;score=0;showScreen('quizScreen');renderQuestion()}
function renderQuestion(){answering=false;const item=activeQuestions[questionIndex];document.getElementById('questionCount').textContent=`Question ${questionIndex+1} of 10`;document.getElementById('questionText').textContent=item.q;document.getElementById('quizProgress').style.width=`${(questionIndex+1)*10}%`;document.getElementById('quizFeedback').textContent='';const answers=document.getElementById('answers');answers.innerHTML='';item.a.forEach((answer,i)=>{const b=document.createElement('button');b.className='answer-button';b.textContent=answer;b.addEventListener('click',()=>finishAnswer(i,b));answers.appendChild(b)});questionAudio.src=`question-${String((questions.indexOf(item)+1)).padStart(2,'0')}.mp3`;animalAudio.src=item.sound||'';if(item.type==='sound')playCurrentAudio();startTimer()}
function playCurrentAudio(){const item=activeQuestions[questionIndex];if(item.type==='sound'){animalAudio.currentTime=0;animalAudio.play().catch(()=>speak(item.q))}else{questionAudio.currentTime=0;questionAudio.play().catch(()=>speak(item.q))}}
function speak(text){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.84;speechSynthesis.speak(u)}
document.getElementById('playQuestionAudio').addEventListener('click',playCurrentAudio);
function startTimer(){stopTimer();timeLeft=10;document.getElementById('timerValue').textContent=timeLeft;timerId=setInterval(()=>{timeLeft--;document.getElementById('timerValue').textContent=timeLeft;if(timeLeft<=0)finishAnswer(null)},1000)}
function stopTimer(){if(timerId)clearInterval(timerId);timerId=null}
function finishAnswer(choice,chosenButton){if(answering)return;answering=true;stopTimer();const item=activeQuestions[questionIndex];const buttons=[...document.querySelectorAll('.answer-button')];buttons.forEach((b,i)=>{b.disabled=true;if(i===item.c)b.classList.add('correct');if(b===chosenButton&&i!==item.c)b.classList.add('wrong')});const correct=choice===item.c;if(correct)score++;document.getElementById('quizFeedback').textContent=correct?'Great job!':choice===null?'Time is up!':`Good try! The answer is ${item.a[item.c]}.`;setTimeout(()=>{questionIndex++;questionIndex<10?renderQuestion():showResult()},1250)}
function showResult(){stopAllAudio();document.getElementById('scoreText').textContent=`You answered ${score} out of 10 questions correctly.`;document.getElementById('resultTitle').textContent=score>=8?'Amazing explorer!':score>=5?'Great exploring!':'Keep discovering!';showScreen('resultScreen')}
document.querySelectorAll('#ratingButtons button').forEach((b)=>b.addEventListener('click',()=>{const rating=Number(b.dataset.rating);localStorage.setItem('animalLessonRating',rating);document.querySelectorAll('#ratingButtons button').forEach((star,i)=>star.classList.toggle('selected',i<rating))}));
