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
const answerIcons={Snake:'🐍',Duck:'🦆',Cat:'🐱',Wings:'🪽',Fins:'🐟',Fur:'🐈',Scales:'🐠',Shell:'🐢',Two:'2️⃣',Three:'3️⃣',Five:'5️⃣',Four:'4️⃣',Six:'6️⃣',Eight:'8️⃣',Thorax:'🐜',Head:'🐜',Abdomen:'🐜','A shell':'🐢','A fin':'🐟','A wing':'🪽',Fox:'🦊',Spider:'🕷️',Bird:'🐦',Toys:'🧸','Food and water':'💧',Shoes:'👟',Ant:'🐜',Fish:'🐟',Butterfly:'🦋',Dog:'🐶',Elephant:'🐘','Polar bear':'🐻‍❄️',Air:'💨','A toy':'🧸','A shoe':'👟','In a nest':'🪹','In a shoe':'👟','In a book':'📖',Legs:'🐾'};

function showScreen(id){screens.forEach(screen=>screen.classList.toggle('active',screen.id===id));window.scrollTo(0,0)}
function stopAllAudio(){[lessonAudio,questionAudio,animalAudio].forEach(audio=>{audio.pause();audio.currentTime=0});if('speechSynthesis' in window)window.speechSynthesis.cancel()}
function shuffle(items){return [...items].sort(()=>Math.random()-.5)}
function showMap(){stopTimer();stopAllAudio();welcomeVideo.pause();showScreen('mapScreen')}

document.getElementById('startBtn').addEventListener('click',()=>{
  showScreen('videoScreen');
  welcomeVideo.currentTime=0;
  welcomeVideo.play().catch(()=>{document.getElementById('videoMessage').textContent='Tap the play button to begin.'});
});
welcomeVideo.addEventListener('ended',showMap);
welcomeVideo.addEventListener('error',showMap);
document.querySelectorAll('.map-node[data-lesson]').forEach(button=>button.addEventListener('click',()=>openLesson(Number(button.dataset.lesson))));
document.querySelectorAll('.go-map').forEach(button=>button.addEventListener('click',showMap));

function openLesson(index){
  stopAllAudio();
  lessonIndex=Math.max(0,Math.min(5,index));
  const n=String(lessonIndex+1).padStart(2,'0');
  lessonMobileSource.srcset=`lesson-${n}-mobile.jpg`;
  lessonImage.dataset.fallback=`lesson-${n}-mobile.jpg`;
  lessonImage.src=lessonIndex===0?`lesson-${n}-mobile.jpg`:`lesson-${n}-desktop.png`;
  lessonImage.alt=`Lesson ${lessonIndex+1}`;
  lessonAudio.src=`lesson-${n}.mp3`;
  document.getElementById('previousLesson').disabled=lessonIndex===0;
  document.getElementById('nextLesson').textContent=lessonIndex===5?'Take the challenge':'Next';
  showScreen('lessonScreen');
  lessonAudio.play().catch(()=>{});
}
lessonImage.addEventListener('error',()=>{
  const fallback=lessonImage.dataset.fallback;
  if(fallback&&lessonImage.src!==new URL(fallback,location.href).href)lessonImage.src=fallback;
});
document.getElementById('playLessonAudio').addEventListener('click',()=>{lessonAudio.currentTime=0;lessonAudio.play().catch(()=>{})});
document.getElementById('previousLesson').addEventListener('click',()=>openLesson(lessonIndex-1));
document.getElementById('nextLesson').addEventListener('click',()=>lessonIndex===5?startQuiz():openLesson(lessonIndex+1));
document.getElementById('openQuiz').addEventListener('click',startQuiz);
document.getElementById('retryQuiz').addEventListener('click',startQuiz);

function startQuiz(){
  stopAllAudio();
  const regular=shuffle(questions.filter(item=>item.type!=='sound')).slice(0,8);
  const sound=shuffle(questions.filter(item=>item.type==='sound')).slice(0,2);
  activeQuestions=shuffle([...regular,...sound]);
  questionIndex=0;score=0;showScreen('quizScreen');renderQuestion();
}
function renderQuestion(){
  answering=false;
  const item=activeQuestions[questionIndex];
  document.getElementById('questionCount').textContent=`Question ${questionIndex+1} of 10`;
  document.getElementById('questionText').textContent=item.q;
  document.getElementById('antRunner').style.left=`${(questionIndex/9)*100}%`;
  document.querySelectorAll('.ant-dot').forEach((dot,i)=>dot.classList.toggle('reached',i<=questionIndex));
  document.getElementById('quizFeedback').textContent='';
  const feedbackSticker=document.getElementById('feedbackSticker');
  feedbackSticker.hidden=true;feedbackSticker.src='correct.png';
  const answers=document.getElementById('answers');answers.innerHTML='';
  item.a.forEach((answer,i)=>{
    const button=document.createElement('button');
    button.className='answer-button';
    const icon=document.createElement('span');icon.className='answer-visual';icon.textContent=answerIcons[answer]||'🐾';icon.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.className='answer-label';label.textContent=answer;
    button.append(icon,label);
    button.addEventListener('click',()=>finishAnswer(i,button));answers.appendChild(button);
  });
  questionAudio.src=`question-${String(questions.indexOf(item)+1).padStart(2,'0')}.mp3`;
  animalAudio.src=item.sound||'';
  startTimer();setTimeout(playCurrentAudio,250);
}
function playCurrentAudio(){
  const item=activeQuestions[questionIndex];
  if(!item)return;
  if(item.type==='sound'){
    speak(item.q);
    setTimeout(()=>{animalAudio.currentTime=0;animalAudio.play().catch(()=>{})},1500);
  }else{
    questionAudio.currentTime=0;
    questionAudio.play().catch(()=>speak(item.q));
  }
}
function speak(text){
  if(!('speechSynthesis' in window))return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.84;window.speechSynthesis.speak(utterance);
}
document.getElementById('playQuestionAudio').addEventListener('click',playCurrentAudio);
function startTimer(){
  stopTimer();timeLeft=10;document.getElementById('timerValue').textContent=timeLeft;
  timerId=setInterval(()=>{timeLeft--;document.getElementById('timerValue').textContent=timeLeft;if(timeLeft<=0)finishAnswer(null)},1000);
}
function stopTimer(){if(timerId)clearInterval(timerId);timerId=null}
function finishAnswer(choice,chosenButton){
  if(answering)return;answering=true;stopTimer();
  const item=activeQuestions[questionIndex];
  const buttons=[...document.querySelectorAll('.answer-button')];
  buttons.forEach((button,i)=>{button.disabled=true;if(i===item.c)button.classList.add('correct');if(button===chosenButton&&i!==item.c)button.classList.add('wrong')});
  const correct=choice===item.c;if(correct)score++;
  const feedbackSticker=document.getElementById('feedbackSticker');
  feedbackSticker.src=correct?'correct.png':'wrong.png';feedbackSticker.hidden=false;
  document.getElementById('quizFeedback').textContent=correct?'Great job!':choice===null?'Time is up!':`Good try! The answer is ${item.a[item.c]}.`;
  setTimeout(()=>{questionIndex++;questionIndex<10?renderQuestion():showResult()},1250);
}
function showResult(){
  stopAllAudio();
  document.getElementById('resultScore').textContent=`${score}/10`;
  document.getElementById('scoreText').textContent=`You answered ${score} out of 10 questions correctly.`;
  document.getElementById('resultTitle').textContent=score>=8?'Amazing explorer!':score>=5?'Great exploring!':'Keep discovering!';
  showScreen('resultScreen');
}
document.querySelectorAll('#ratingButtons button').forEach(button=>button.addEventListener('click',()=>{
  const rating=Number(button.dataset.rating);localStorage.setItem('animalLessonRating',String(rating));
  document.querySelectorAll('#ratingButtons button').forEach((star,i)=>star.classList.toggle('selected',i<rating));
}));
