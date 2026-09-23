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
 {q:'Where can a bird live?',a:['In a nest','In a shoe','In a book'],c:0}
];
const answerStickers={Snake:'snake.png',Cat:'cat.png',Wings:'feather.png',Fins:'fin.png',Fur:'fur.png',Scales:'scales.png',Shell:'shell.png',Thorax:'ant-thorax.png',Head:'ant-head.png',Abdomen:'ant-abdomen.png','A shell':'shell.png','A fin':'fin.png','A wing':'feather.png',Spider:'spider.png',Bird:'bird.png','Food and water':'water.png',Ant:'ant.png',Fish:'fish.png',Butterfly:'butterfly.png',Dog:'dog.png','Polar bear':'polar-bear.png',Air:'air.png','In a nest':'nest.png',Legs:'six-legs.png',Turtle:'turtle.png'};
const answerFallback={Duck:'🦆',Two:'2️⃣',Three:'3️⃣',Five:'5️⃣',Four:'4️⃣',Six:'6️⃣',Eight:'8️⃣',Fox:'🦊',Toys:'🧸',Shoes:'👟',Elephant:'🐘','A toy':'🧸','A shoe':'👟','In a shoe':'👟','In a book':'📖'};

function showScreen(id){screens.forEach(screen=>screen.classList.toggle('active',screen.id===id));window.scrollTo(0,0)}
function stopAllAudio(){[lessonAudio,questionAudio,animalAudio].forEach(audio=>{audio.pause();audio.currentTime=0});if('speechSynthesis' in window)window.speechSynthesis.cancel()}
function shuffle(items){return [...items].sort(()=>Math.random()-.5)}
function showMap(){stopTimer();stopAllAudio();welcomeVideo.pause();showScreen('mapScreen');positionMapTargets()}

document.getElementById('startBtn').addEventListener('click',()=>{
  showScreen('videoScreen');
  welcomeVideo.currentTime=0;
  welcomeVideo.play().catch(()=>{document.getElementById('videoMessage').textContent='Tap the play button to begin.'});
});
welcomeVideo.addEventListener('ended',showMap);
welcomeVideo.addEventListener('error',showMap);
document.querySelectorAll('.map-node[data-lesson]').forEach(button=>button.addEventListener('click',()=>openLesson(Number(button.dataset.lesson))));
document.querySelector('.map-bear').addEventListener('click',()=>openLesson(0));
document.querySelectorAll('.go-map').forEach(button=>button.addEventListener('click',showMap));

function openLesson(index){
  stopAllAudio();
  lessonIndex=Math.max(0,Math.min(5,index));
  const n=String(lessonIndex+1).padStart(2,'0');
  lessonMobileSource.srcset=`lesson-${n}-mobile.jpg`;
  lessonImage.dataset.fallback=`lesson-${n}-mobile.jpg`;
  lessonImage.src=`lesson-${n}-desktop.png`;
  lessonImage.alt=`Lesson ${lessonIndex+1}`;
  lessonAudio.src=`lesson-${n}.mp3`;
  document.getElementById('previousLesson').disabled=lessonIndex===0;
  document.getElementById('nextLesson').textContent=lessonIndex===5?'Take the challenge':'Next';
  showScreen('lessonScreen');
  if(lessonIndex===0)lessonAudio.play().catch(()=>{});
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
  document.getElementById('celebration').hidden=true;
  activeQuestions=shuffle(questions).slice(0,10);
  questionIndex=0;score=0;showScreen('quizScreen');
  const runner=document.getElementById('antRunner');
  runner.classList.add('resetting');
  runner.style.left='0%';
  renderQuestion();
  requestAnimationFrame(()=>requestAnimationFrame(()=>runner.classList.remove('resetting')));
}
function renderQuestion(){
  answering=false;
  const item=activeQuestions[questionIndex];
  document.getElementById('questionCount').textContent=`Question ${questionIndex+1} of 10`;
  document.getElementById('questionText').textContent=item.q;
  updateAntProgress();
  document.getElementById('quizFeedback').textContent='';
  const feedbackSticker=document.getElementById('feedbackSticker');
  feedbackSticker.hidden=true;feedbackSticker.src='correct.png';
  const answers=document.getElementById('answers');answers.innerHTML='';
  item.a.forEach((answer,i)=>{
    const button=document.createElement('button');
    button.className='answer-button';
    const icon=document.createElement('span');icon.className='answer-visual';icon.setAttribute('aria-hidden','true');
    if(answerStickers[answer]){const image=document.createElement('img');image.src=answerStickers[answer];image.alt='';icon.appendChild(image)}else{icon.textContent=answerFallback[answer]||'🐾'}
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
function updateAntProgress(){
  document.getElementById('antRunner').style.left=`${(questionIndex/9)*100}%`;
  document.querySelectorAll('.ant-dot').forEach((dot,i)=>dot.classList.toggle('reached',i<=questionIndex));
}
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
  const celebration=document.getElementById('celebration');
  celebration.replaceChildren();
  celebration.hidden=score<8;
  if(score>=8){
    for(let i=0;i<12;i++){
      const piece=document.createElement('img');
      piece.src='confetti.png';piece.alt='';
      piece.style.left=`${(i*37)%96}%`;
      piece.style.animationDelay=`${(i%6)*.18}s`;
      celebration.appendChild(piece);
    }
  }
  showScreen('resultScreen');
}
document.querySelectorAll('#ratingButtons button').forEach(button=>button.addEventListener('click',()=>{
  const rating=Number(button.dataset.rating);localStorage.setItem('animalLessonRating',String(rating));
  document.querySelectorAll('#ratingButtons button').forEach((star,i)=>star.classList.toggle('selected',i<rating));
}));

// Match the clickable circles to the artwork, including when object-fit crops the map.
function positionMapTargets(){
  const frame=document.getElementById('mapScreen');
  if(!frame.clientWidth||!frame.clientHeight)return;
  const portrait=window.matchMedia('(max-width:700px)').matches;
  const art=portrait?{width:941,height:1672,circles:[[590,1010,100],[800,915,96],[535,776,92],[750,669,92],[638,523,92],[828,394,92]],bear:[330,1180,210]}:
    {width:1672,height:941,circles:[[951,747,95],[1275,718,96],[1077,563,88],[1256,490,88],[1378,372,88],[1492,219,88]],bear:[630,615,210]};
  const scale=Math.max(frame.clientWidth/art.width,frame.clientHeight/art.height);
  const offsetX=(frame.clientWidth-art.width*scale)/2;
  const offsetY=(frame.clientHeight-art.height*scale)/2;
  frame.querySelectorAll('.map-node').forEach((button,index)=>{
    const [x,y,r]=art.circles[index];
    button.style.left=`${offsetX+(x-r)*scale}px`;
    button.style.top=`${offsetY+(y-r)*scale}px`;
    button.style.width=`${2*r*scale}px`;
  });
  const bear=frame.querySelector('.map-bear');
  bear.style.left=`${offsetX+art.bear[0]*scale}px`;
  bear.style.top=`${offsetY+art.bear[1]*scale}px`;
  bear.style.width=`${art.bear[2]*scale}px`;
}
window.addEventListener('resize',positionMapTargets);
positionMapTargets();
