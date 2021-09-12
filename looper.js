let initToken        = 0;
let animToken        = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let audio            = [,,,,,,,,,,,,,,,,];
let loopParameters   = [,,,,,,,,,,,,,,,,];
let date             = new Date();
let loopTime         = 5000 ;
let multiplier       = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
let multiplierCount  = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
let synchroToken     = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const recButtons     = document.querySelectorAll(".rec");
const playButtons    = document.querySelectorAll(".play");
const inputVolume    = document.querySelectorAll('.volume');  
const LoopMultiplier = document.querySelectorAll('.loopMultiplier')
const multiplierValid= document.querySelectorAll('.multiplierValid')
const def            = document.querySelectorAll('.def')
const masterRecord   = document.querySelector('.masterRecord');
const inputValid     = document.querySelector('.inputValid');
const inputLoop      = document.querySelector('.inputLoop')
const LoopTimer      = document.querySelector('.loopTimer')
const masterDownLoad = document.querySelector('.masterDownLoad')


if (navigator.mediaDevices) {
  console.log('getUserMedia supported.');
  
  
  let track             = 0 ;
  let constraints       = { audio: {
    
    "mandatory": {
        "googEchoCancellation": "false",
        "googAutoGainControl": "false",
        "googNoiseSuppression": "false",
        "googHighpassFilter": "false",
      }
    } 
  };
  let chunks            = [];
  let masterConstraints = { audio:true, video : true};
  let jetton           = 0 ;

  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
  
    let mediaRecorder = new MediaRecorder(stream);
    
    timeInit();

    inputValid.addEventListener('click',function(){
      loopParameters = [,,,,,,,,,,,,,,,,];
      audio = [,,,,,,,,,,,,,,,,];
      timeInit()
      initToken = 0;
      animToken[0] = 0 ;
    })
    

    async function timeInit(){
      inputLoop.value = `${(Math.floor(loopTime/100))/10}` 
      track = 0 ;
      mediaRecorder.start();
      await sleep(loopTime*multiplier[0] + 100)
      mediaRecorder.stop();
      loopParameters[0]='masterLoop';
      initToken = 1;
      animToken[0] = 0;
    }
    for (let i = 1 ; i<recButtons.length ; i++){    
      recButtons[i].addEventListener("click", async function(){
        
        if(audio[0].duration > 0 & audio[0].duration < 100){
          document.querySelector(`.b${i}`).style.backgroundColor = `#FF9933`;
          await sleep((audio[0].duration - audio[0].currentTime)*1000)  ;
          if (audio[i]!=undefined){
            audio[i].pause();
          };
          document.querySelector(`.p${i}`).style.backgroundColor = `dimgrey`;
          document.querySelector(`.p${i}`).style.display = `none`;
          document.querySelector(`.b${i}`).style.backgroundColor = `#FF355E`;
          loopParameters[i]='record';
          mediaRecorder.start();
          await sleep(loopTime*multiplier[i] + 100);
          mediaRecorder.stop();
          document.querySelector(`.b${i}`).style.backgroundColor = `dimgray`;
          track = i;
          loopParameters[i] = undefined;
          
        }
      })
    }
    
    mediaRecorder.onstop = async function() {
      let audioStop = audio[track];
      if(audioStop != undefined){
        audioStop.pause();
      };    
      console.log("data available after MediaRecorder.stop() called.");
      const blob = new Blob(chunks, { type : 'audio/webm' });
      chunks = [];
      const audioURL = URL.createObjectURL(blob);
      audio[track] = new Audio(audioURL);
      console.log(audio)
      if(track > 0){
        document.querySelector(`.v${track}`).value = `${Math.floor(audio[track].volume*100)}`
      }
      console.log("recorder stopped");
      console.log(audio[track].duration)
      if( loopParameters[track] === 'masterLoop'){
        audio[0].muted = true ;
        audio[0].loop = true ;
        audio[0].ended= true;
        audio[0].play() ;
      }
    }

    for (let i = 1 ; i<playButtons.length ; i++){
      playButtons[i].addEventListener("click", async function(){
        console.log(audio);
        let token = 0 ;
        if((loopParameters[i] === "stop" | loopParameters[i] == undefined )&& token === 0 && audio[i] != undefined){
          document.querySelector(`.p${i}`).style.backgroundColor = `#66FF66`;
          audio[i].currentTime = audio[0].currentTime
          audio[i].play() ; 
          audio[i].loop = true;
          token = 2;
          loopParameters[i] = "start";  
          console.log(inputVolume[i])               
        }else if(loopParameters[i] === "start" && token === 0 && audio[i] != undefined){
          document.querySelector(`.p${i}`).style.backgroundColor = `dimgrey`;
          audio[i].pause();   
          token = 1 ;
          loopParameters[i]="stop";                       
        }; 
      })
    }
    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  })
  .catch(function(err) {
    console.log('The following error occurred: ' + err);
  })
  navigator.mediaDevices.getDisplayMedia(masterConstraints)
  .then(function(stream) {
    let recorder    = new MediaRecorder(stream);
    let masterAudioURL;
    let masterAudio = [];
    let masterBlob;
    stream.getVideoTracks()[0].stop();
    stream.removeTrack(stream.getVideoTracks()[0]);

    masterRecord.addEventListener("click", async function(){
      if (jetton === 1){
        recorder.stop();
        masterRecord.style.backgroundColor = `dimgray`;
        jetton = 0 ;
        console.log('master stop');
      }
      else if(jetton === 0 ){
        recorder.start();
        masterRecord.style.backgroundColor = `#FF355E`;
        jetton = 1;
        console.log('master start');
      }
    })
    
      function download(filename, audioExport) {
        if (masterAudio[0] != undefined){
        let element = document.createElement('a');
        element.setAttribute('href', `${masterAudioURL}`);
        element.setAttribute('type', `audio/webm`);
        element.setAttribute('download', filename);
    
        element.style.display = 'none';
        document.body.appendChild(element);
    
        element.click();
    
        document.body.removeChild(element);
        
        }
    }
    
    // Start file download.
    masterDownLoad.addEventListener("click", function(){
      
        // Generate download of hello.txt file with some content
        let audioExport = masterAudio[0];
        
        let filename = "track.wav";
        console.log(masterAudio)
        audioExport.Duration = audioExport.duration;
        console.log(audioExport.Duration)
        console.log(audioExport.duration)
        download(filename, audioExport);
        
    }, false);
    
    recorder.onstop = function() {
    console.log("data available after MediaRecorder.stop() called.");
    masterBlob = new Blob(chunks, { type : 'audio/wav' });
    
    chunks = [];
    masterAudioURL = URL.createObjectURL(masterBlob);
    masterAudio[0] = new Audio(masterAudioURL);
    console.log(masterAudio[0].duration)
    masterAudio[0].play()
  }

    recorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }  
  })
}

for (let i = 0 ; i<multiplierValid.length ;i++){
  multiplierValid[i].addEventListener('click', function(){
    multiplier[i+1] = parseInt(LoopMultiplier[i].value)
    def[i].innerHTML = `Loop X${multiplier[i+1]}:`
  })
}

function sleep(ms) {
  return new Promise(resolve => setInterval(resolve, ms));
}


function draw() { 
  let newLoop = parseFloat(inputLoop.value,10);
  
  if(audio[0] != undefined){
    document.querySelector('.masterLoop').innerHTML = ` ${(Math.round(audio[0].currentTime*10))/10} s`
    document.querySelector('.duration').innerHTML = ` ${(Math.round(audio[0].duration*10))/10} s`
  };
  
  if (newLoop !== (Math.floor(loopTime/100))/10 & newLoop >0 ){
    loopTime = newLoop*1000;
  };
  
  
  for (let i = 1 ; i <inputVolume.length ; i++ ){//volume control
    if (audio[i] != undefined && inputVolume[i].value != undefined){
      const newVolume = parseInt(inputVolume[i].value,10)   
      if (audio[i].volume * 100 != newVolume & newVolume >= 0 & newVolume <= 100){
        audio[i].volume = newVolume/100;
      };
    };
  };
  if (initToken === 0){//display buttons
    for (let i = 0; i<LoopMultiplier.length ; i++){
      LoopMultiplier[i].style.display   = `none`
    } 
    for (let i = 0; i<multiplierValid.length ; i++){
      multiplierValid[i].style.display   = `none`
    }  
    for (let i = 1; i<recButtons.length ; i++){
      recButtons[i].style.display   = `none`
    }  
    for (let i = 1; i<playButtons.length ; i++){
      playButtons[i].style.display  = `none`
    }
    for (let i = 1; i<playButtons.length ; i++){   
      inputVolume[i].style.display  = `none`
    }
    masterRecord.style.display   = `none`   
    inputValid.style.display     = `none`         
    inputLoop.style.display      = `none`
    LoopTimer.style.display      = `none`     
    masterDownLoad.style.display = `none`   
  }
  if (initToken ===1 ){
    for (let i = 0; i<LoopMultiplier.length ; i++){
      LoopMultiplier[i].style.display   = `block`
    } 
    for (let i = 0; i<multiplierValid.length ; i++){
      multiplierValid[i].style.display   = `block`
    }  
    for (let i = 1; i<recButtons.length ; i++){
      recButtons[i].style.display   = `inline`
    }  
    for (let i = 1; i<playButtons.length ; i++){
      playButtons[i].style.display  = `inline`
    }
    for (let i = 1; i<playButtons.length ; i++){   
      inputVolume[i].style.display  = `inline`
    }
    masterRecord.style.display   = `inline`   
    inputValid.style.display     = `inline`         
    inputLoop.style.display      = `inline`    
    LoopTimer.style.display      = `block`
    masterDownLoad.style.display = `inline`    
  }
  //animation 
  for (let i = 0 ; i < loopParameters.length; i++){
    
    if( (loopParameters[i] === 'masterLoop' | loopParameters[i] === 'start') & audio[i] !== undefined){
      if ( audio[i].duration > 0 & audio[i].duration < 100 ){
        document.querySelector(`.percent${i} circle:nth-child(2)`).style.stroke = '#D92121'
        document.querySelector(`.percent${i} circle:nth-child(2)`).style.strokeDashoffset = `calc(440 - (440 * ${(100*audio[i].currentTime)/audio[i].duration}) / 100)`
        animToken[i] = 0;
      }else{
        document.querySelector(`.percent${i} circle:nth-child(2)`).style.stroke = '#D92121'
        document.querySelector(`.percent${i} circle:nth-child(2)`).style.strokeDashoffset = `calc(440 - (440 * ${(1680*animToken[i])/(loopTime*multiplier[i] )}) / 100)`  
        animToken[i] ++;
      }
      
    }
    if((loopParameters[i] === 'stop'| loopParameters[i] === undefined) & loopParameters != 'masterLoop'& audio[0] !== undefined){
     animToken[i] = 0;
      document.querySelector(`.percent${i} circle:nth-child(2)`).style.stroke = `#D92121`
      document.querySelector(`.percent${i} circle:nth-child(2)`).style.strokeDashoffset = `calc(440 - (440 * 1) / 100)`
    }
    if( loopParameters[i] === 'record' & audio[0] !== undefined){
     animToken[i] ++;
    document.querySelector(`.percent${i} circle:nth-child(2)`).style.strokeDashoffset = `calc(440 - (440 * ${(1680*animToken[i])/(loopTime*multiplier[i] )}) / 100)`
    document.querySelector(`.percent${i} circle:nth-child(2)`).style.stroke = `#50BFE6`
    }
    if(audio[0] === undefined  ){
      animToken[0] ++ ;
      document.querySelector(`.percent${i} circle:nth-child(2)`).style.strokeDashoffset = `calc(440 - (440 * ${(100*animToken[0]/loopTime)}) / 100)`
      document.querySelector(`.percent${i} circle:nth-child(2)`).style.stroke    = `#50BFE6`
    }
  }
}



function loop(timestamp) {
  draw();
  
  lastRender = timestamp;
  window.requestAnimationFrame(loop);
};
let lastRender = 0;
window.requestAnimationFrame(loop);

