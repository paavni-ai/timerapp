const minutesElement = document.getElementById('minutes');
     2 const secondsElement = document.getElementById('seconds');
     3 const startButton = document.getElementById('start');
     4 const stopButton = document.getElementById('stop');
     5 const resetButton = document.getElementById('reset');
     6 
     7 const pomodoroButton = document.getElementById('pomodoro');
     8 const shortBreakButton = document.getElementById('short-break');
     9 const longBreakButton = document.getElementById('long-break');
    10 
    11 const newTaskInput = document.getElementById('new-task');
    12 const addTaskButton = document.getElementById('add-task');
    13 const taskList = document.getElementById('task-list');
    14 const notesContent = document.getElementById('notes-content');
    15 
    16 const swMinutesElement = document.getElementById('sw-minutes');
    17 const swSecondsElement = document.getElementById('sw-seconds');
    18 const swMillisecondsElement = document.getElementById('sw-milliseconds');
    19 const swStartButton = document.getElementById('sw-start');
    20 const swStopButton = document.getElementById('sw-stop');
    21 const swResetButton = document.getElementById('sw-reset');
    22 
    23 let timer;
    24 let minutes = 25;
    25 let seconds = 0;
    26 let currentMode = 'pomodoro';
    27 let pomodoroCount = 0;
    28 
    29 let stopwatchInterval;
    30 let stopwatchMilliseconds = 0;
    31 let stopwatchSeconds = 0;
    32 let stopwatchMinutes = 0;
    33 
    34 const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    35 
    36 function createSilentAudio() {
    37     const buffer = audioContext.createBuffer(1, 1, 22050);
    38     const source = audioContext.createBufferSource();
    39     source.buffer = buffer;
    40     source.connect(audioContext.destination);
    41     return source;
    42 }
    43 
    44 function startTimer() {
    45     if (timer) {
    46         return;
    47     }
    48 
    49     timer = setInterval(() => {
    50         if (seconds === 0) {
    51             if (minutes === 0) {
    52                 clearInterval(timer);
    53                 timer = null;
    54                 const audio = createSilentAudio();
    55                 audio.start(0);
    56 
    57                 let notificationText = '';
    58                 if (currentMode === 'pomodoro') {
    59                     notificationText = 'Pomodoro finished. Time for a break!';
    60                     pomodoroCount++;
    61                     // Update pomodoro count for the active task
    62                     const activeTask = document.querySelector('#task-list li.active');
    63                     if (activeTask) {
    64                         let taskPomodoros = parseInt(activeTask.dataset.pomodoros || 0);
    65                         taskPomodoros++;
    66                         activeTask.dataset.pomodoros = taskPomodoros;
    67                         activeTask.querySelector('.pomodoro-count').textContent = `(${taskPomodoros})`;
    68                     }
    69 
    70                     if (pomodoroCount % 4 === 0) {
    71                         switchMode('long-break');
    72                     } else {
    73                         switchMode('short-break');
    74                     }
    75                 } else if (currentMode === 'short-break') {
    76                     notificationText = 'Short break finished. Back to work!';
    77                     switchMode('pomodoro');
    78                 } else if (currentMode === 'long-break') {
    79                     notificationText = 'Long break finished. Back to work!';
    80                     switchMode('pomodoro');
    81                 }
    82 
    83                 // Text-to-speech notification
    84                 if ('speechSynthesis' in window) {
    85                     const utterance = new SpeechSynthesisUtterance(notificationText);
    86                     speechSynthesis.speak(utterance);
    87                 }
    88 
    89                 startTimer();
    90                 return;
    91             }
    92             minutes--;
    93             seconds = 59;
    94         } else {
    95             seconds--;
    96         }
    97 
    98         minutesElement.textContent = minutes.toString().padStart(2, '0');
    99         secondsElement.textContent = seconds.toString().padStart(2, '0');
   100     }, 1000);
   101 }
   102 
   103 function stopTimer() {
   104     clearInterval(timer);
   105     timer = null;
   106 }
   107 
   108 function resetTimer() {
   109     stopTimer();
   110     minutes = 25;
   111     seconds = 0;
   112     minutesElement.textContent = '25';
   113     secondsElement.textContent = '00';
   114 }
   115 
   116 function switchMode(mode) {
   117     currentMode = mode;
   118     stopTimer();
   119     switch (mode) {
   120         case 'pomodoro':
   121             minutes = 25;
   122             break;
   123         case 'short-break':
   124             minutes = 5;
   125             break;
   126         case 'long-break':
   127             minutes = 15;
   128             break;
   129     }
   130     seconds = 0;
   131     minutesElement.textContent = minutes.toString().padStart(2, '0');
   132     secondsElement.textContent = '00';
   133 
   134     pomodoroButton.classList.toggle('active', mode === 'pomodoro');
   135     shortBreakButton.classList.toggle('active', mode === 'short-break');
   136     longBreakButton.classList.toggle('active', mode === 'long-break');
   137 }
   138 
   139 // Task List Functions
   140 function addTask() {
   141     const taskText = newTaskInput.value.trim();
   142     if (taskText === '') return;
   143 
   144     const listItem = document.createElement('li');
   145     listItem.innerHTML = `
   146         <span>${taskText}</span>
   147         <span class="pomodoro-count">(0)</span>
   148         <button class="delete-task">Delete</button>
   149     `;
   150     listItem.dataset.pomodoros = 0; // Initialize pomodoro count for the task
   151 
   152     listItem.querySelector('span').addEventListener('click', (event) => {
   153         // Only toggle completed if clicking on the text, not the count
   154         if (!event.target.classList.contains('pomodoro-count')) {
   155             listItem.classList.toggle('completed');
   156         }
   157         // Set active task for pomodoro tracking
   158         document.querySelectorAll('#task-list li').forEach(item => item.classList.remove('active'));
   159         listItem.classList.add('active');
   160     });
   161 
   162     listItem.querySelector('.delete-task').addEventListener('click', () => {
   163         taskList.removeChild(listItem);
   164     });
   165 
   166     taskList.appendChild(listItem);
   167     newTaskInput.value = '';
   168 }
   169 
   170 // Notes Functions
   171 function saveNotes() {
   172     localStorage.setItem('studyAppNotes', notesContent.value);
   173 }
   174 
   175 function loadNotes() {
   176     const savedNotes = localStorage.getItem('studyAppNotes');
   177     if (savedNotes) {
   178         notesContent.value = savedNotes;
   179     }
   180 }
   181 
   182 // Stopwatch Functions
   183 function startStopwatch() {
   184     if (stopwatchInterval) {
   185         return;
   186     }
   187     stopwatchInterval = setInterval(() => {
   188         stopwatchMilliseconds += 10;
   189         if (stopwatchMilliseconds === 1000) {
   190             stopwatchMilliseconds = 0;
   191             stopwatchSeconds++;
   192         }
   193         if (stopwatchSeconds === 60) {
   194             stopwatchSeconds = 0;
   195             stopwatchMinutes++;
   196         }
   197 
   198         swMillisecondsElement.textContent = stopwatchMilliseconds.toString().padStart(3, '0').slice(0, 2);
   199         swSecondsElement.textContent = stopwatchSeconds.toString().padStart(2, '0');
   200         swMinutesElement.textContent = stopwatchMinutes.toString().padStart(2, '0');
   201     }, 10);
   202 }
   203 
   204 function stopStopwatch() {
   205     clearInterval(stopwatchInterval);
   206     stopwatchInterval = null;
   207 }
   208 
   209 function resetStopwatch() {
   210     stopStopwatch();
   211     stopwatchMilliseconds = 0;
   212     stopwatchSeconds = 0;
   213     stopwatchMinutes = 0;
   214     swMillisecondsElement.textContent = '00';
   215     swSecondsElement.textContent = '00';
   216     swMinutesElement.textContent = '00';
   217 }
   218 
   219 // Event Listeners
   220 startButton.addEventListener('click', startTimer);
   221 stopButton.addEventListener('click', stopTimer);
   222 resetButton.addEventListener('click', () => switchMode(currentMode));
   223 
   224 pomodoroButton.addEventListener('click', () => switchMode('pomodoro'));
   225 shortBreakButton.addEventListener('click', () => switchMode('short-break'));
   226 longBreakButton.addEventListener('click', () => switchMode('long-break'));
   227 
   228 addTaskButton.addEventListener('click', addTask);
   229 newTaskInput.addEventListener('keypress', (e) => {
   230     if (e.key === 'Enter') {
   231         addTask();
   232     }
   233 });
   234 
   235 notesContent.addEventListener('input', saveNotes);
   236 
   237 swStartButton.addEventListener('click', startStopwatch);
   238 swStopButton.addEventListener('click', stopStopwatch);
   239 swResetButton.addEventListener('click', resetStopwatch);
   240 
   241 // Initial Load
   242 loadNotes();
