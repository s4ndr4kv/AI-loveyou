// ===== STATE =====

let currentScreen = 'intro';
let currentQuestion = 0;
let answers = [];
let typingTimeout = null;

// ===== CONSTANTS =====

const TYPING_SPEED_MIN = 30;
const TYPING_SPEED_MAX = 60;
const ANALYZING_DELAY = 1800;

const INTRO_TEXT = "Hello. I am an AI designed to study your behavioural patterns in order to optimize your future. I've been fed your context, experiences and preferences. With a few questions I'll be able to present you the best options for your next destination, tailored just for you.";

const questions = [
    {
        question: "If your luggage was lost after a 14-hour flight, what would you feel?",
        options: [
            "Frustration",
            "I'd see it as an opportunity to go shopping",
            "*manic laugh*"
        ],
        analyzingMsg: "Processing emotional resilience data"
    },
    {
        question: "In an encounter with your alternate self from another dimension, what is your most likely reaction?",
        options: [
            "Indifference",
            "Disbelief",
            "\"Finally!\""
        ],
        analyzingMsg: "Cross-referencing dimensional compatibility"
    },
    {
        question: "Where was this photo taken?",
        hasImage: true,
        options: [
            "Bali",
            "Miami",
            "Tokyo"
        ],
        analyzingMsg: "Analyzing geographical neural patterns"
    },
    {
        question: "Pick the breakfast that calls to you.",
        options: [
            "A perfectly crafted ritual \u2014 warm broth, delicate bites, everything in its place",
            "Something sweet and fluffy from a tiny hidden shop",
            "The most photogenic plate you've ever seen"
        ],
        analyzingMsg: "Mapping gustatory preference matrix"
    },
    {
        question: "The algorithm needs one final data point. Choose a vibe.",
        options: [
            "Neon-lit streets and midnight ramen",
            "Bullet trains and cherry blossoms",
            "Organized chaos and vending machines everywhere"
        ],
        analyzingMsg: "Running quantum destination algorithm"
    }
];

const loadingMessages = [
    { text: "Initializing destination algorithm...", duration: 1200 },
    { text: "Cross-referencing with 847 global destinations...", duration: 1400 },
    { text: "Calculating optimal humidity preferences...", duration: 1200 },
    { text: "Factoring in star sign compatibility with time zones...", duration: 1300 },
    { text: "Running quantum destination algorithm...", duration: 1400 },
    { text: "Almost there... recalibrating for perfection...", duration: 1500 },
    { text: "Result locked. Confidence: 99.97%", duration: 1000 }
];


// ===== SCREEN MANAGEMENT =====

function showScreen(screenId) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    var target = document.getElementById(screenId + '-screen');
    if (target) {
        target.classList.add('active');
        currentScreen = screenId;
    }
}


// ===== TYPING EFFECT =====

function typeText(element, text, onComplete) {
    var index = 0;
    var cursor = document.getElementById('typing-cursor');

    function typeChar() {
        if (index < text.length) {
            var char = text[index];
            element.textContent += char;
            index++;

            var delay = TYPING_SPEED_MIN + Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN);
            if (char === '.' || char === ',') delay += 200;
            if (char === ' ') delay = 15 + Math.random() * 25;

            typingTimeout = setTimeout(typeChar, delay);
        } else {
            if (cursor) cursor.style.display = 'inline';
            if (onComplete) onComplete();
        }
    }

    if (cursor) cursor.style.display = 'inline';
    typeChar();
}


// ===== QUIZ =====

var selectedAnswers = []; // stores selected option index per question (-1 = unanswered)

function initQuiz() {
    currentQuestion = 0;
    answers = [];
    selectedAnswers = [];
    for (var i = 0; i < questions.length; i++) {
        selectedAnswers.push(-1);
    }
    updateProgressBar();
    showQuestion(0);
}

function updateProgressBar() {
    var bar = document.getElementById('progress-bar');
    var progress = ((currentQuestion + 1) / questions.length) * 100;
    bar.style.width = progress + '%';
}

function showQuestion(index) {
    var container = document.getElementById('card-container');
    var analyzingEl = document.getElementById('analyzing-msg');
    var q = questions[index];

    analyzingEl.classList.remove('visible');

    var optionsHtml = '';
    var letters = ['A', 'B', 'C'];
    for (var i = 0; i < q.options.length; i++) {
        var selectedClass = (selectedAnswers[index] === i) ? ' selected' : '';
        optionsHtml += '<button class="option-btn' + selectedClass + '" data-option="' + i + '">' +
            '<span class="option-letter">' + letters[i] + '</span>' +
            '<span class="option-text">' + q.options[i] + '</span>' +
            '</button>';
    }

    var imageHtml = '';
    if (q.hasImage) {
        imageHtml = '<div class="card-image-placeholder" style="width:100%;height:160px;border:1.5px dashed rgba(255,38,52,0.2);border-radius:4px;display:flex;align-items:center;justify-content:center;color:rgba(255,38,52,0.45);font-family:var(--font-mondwest);font-size:0.8rem;margin-bottom:var(--spacing-md);">' +
            '<span>Photo placeholder</span></div>';
    }

    // Back/Next buttons
    var backClass = (index === 0) ? ' hidden' : '';
    var nextLabel = (index === questions.length - 1) ? 'finish >>' : 'next >>';

    var navHtml = '<div class="quiz-nav">' +
        '<button class="quiz-nav-btn btn-back' + backClass + '">&lt;&lt; back</button>' +
        '<button class="quiz-nav-btn btn-next">' + nextLabel + '</button>' +
        '</div>';

    container.innerHTML = '<div class="quiz-card card-enter">' +
        '<h2 class="card-question">' + q.question + '</h2>' +
        imageHtml +
        '<div class="card-options">' + optionsHtml + '</div>' +
        navHtml +
        '</div>';

    var card = container.querySelector('.quiz-card');

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            card.classList.remove('card-enter');
            card.classList.add('card-enter-active');
        });
    });

    // Option click: just select, don't advance
    var buttons = container.querySelectorAll('.option-btn');
    for (var b = 0; b < buttons.length; b++) {
        buttons[b].addEventListener('click', (function (btn, idx) {
            return function () {
                // Deselect all
                var allBtns = container.querySelectorAll('.option-btn');
                for (var j = 0; j < allBtns.length; j++) {
                    allBtns[j].classList.remove('selected');
                }
                btn.classList.add('selected');
                selectedAnswers[index] = parseInt(btn.dataset.option);
            };
        })(buttons[b], index));
    }

    // Next button
    var nextBtn = container.querySelector('.btn-next');
    nextBtn.addEventListener('click', function () {
        if (selectedAnswers[index] === -1) return; // must select an option

        var card = container.querySelector('.quiz-card');
        card.classList.add('card-exit');

        currentQuestion = index + 1;
        updateProgressBar();

        setTimeout(function () {
            if (index < questions.length - 1) {
                showAnalyzingMessage(questions[index].analyzingMsg, function () {
                    showQuestion(index + 1);
                });
            } else {
                var bar = document.getElementById('progress-bar');
                bar.style.width = '100%';
                setTimeout(function () {
                    showScreen('loading');
                    startLoadingSequence();
                }, 400);
            }
        }, 400);
    });

    // Back button
    var backBtn = container.querySelector('.btn-back');
    if (backBtn && index > 0) {
        backBtn.addEventListener('click', function () {
            var card = container.querySelector('.quiz-card');
            card.classList.add('card-exit');
            currentQuestion = index - 1;
            updateProgressBar();
            setTimeout(function () {
                showQuestion(index - 1);
            }, 400);
        });
    }
}

function showAnalyzingMessage(msg, onComplete) {
    var el = document.getElementById('analyzing-msg');
    var textEl = el.querySelector('.analyzing-text');
    var dotsEl = el.querySelector('.analyzing-dots');
    var container = document.getElementById('card-container');
    var miniBar = document.getElementById('analyzing-progress-bar');

    container.innerHTML = '';
    textEl.textContent = msg;

    // Reset mini progress bar
    miniBar.style.transition = 'none';
    miniBar.style.width = '0%';

    el.classList.add('visible');

    // Start the mini bar fill after reflow
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            miniBar.style.transition = 'width ' + (ANALYZING_DELAY / 1000) + 's linear';
            miniBar.style.width = '100%';
        });
    });

    var dotCount = 0;
    var dotInterval = setInterval(function () {
        dotCount = (dotCount + 1) % 4;
        dotsEl.textContent = '.'.repeat(dotCount);
    }, 300);

    setTimeout(function () {
        clearInterval(dotInterval);
        el.classList.remove('visible');
        miniBar.style.transition = 'none';
        miniBar.style.width = '0%';
        onComplete();
    }, ANALYZING_DELAY);
}


// ===== LOADING SEQUENCE =====

var LOADING_TYPE_SPEED = 18;

function startLoadingSequence() {
    var messagesContainer = document.getElementById('loading-messages');
    var progressBar = document.getElementById('loading-progress-bar');
    var percentageEl = document.getElementById('loading-percentage');

    messagesContainer.innerHTML = '';
    progressBar.style.width = '0%';
    percentageEl.textContent = '0%';

    var totalDuration = 0;
    for (var i = 0; i < loadingMessages.length; i++) {
        totalDuration += loadingMessages[i].duration;
    }

    var msgIndex = 0;
    var elapsed = 0;

    function typeLoadingMessage(msgEl, textSpan, text, onComplete) {
        var charIndex = 0;
        var cursor = document.createElement('span');
        cursor.className = 'loading-cursor';
        cursor.textContent = '_';
        msgEl.appendChild(cursor);

        function typeNext() {
            if (charIndex < text.length) {
                textSpan.textContent += text[charIndex];
                charIndex++;
                setTimeout(typeNext, LOADING_TYPE_SPEED + Math.random() * 10);
            } else {
                cursor.remove();
                if (onComplete) onComplete();
            }
        }
        typeNext();
    }

    function showNextMessage() {
        if (msgIndex >= loadingMessages.length) {
            setTimeout(function () {
                showScreen('reveal');
                startRevealSequence();
            }, 800);
            return;
        }

        var msg = loadingMessages[msgIndex];

        // Dim previous messages
        var allMsgs = messagesContainer.querySelectorAll('.loading-msg');
        for (var i = 0; i < allMsgs.length; i++) {
            allMsgs[i].classList.add('dimmed');
        }

        var msgEl = document.createElement('div');
        msgEl.className = 'loading-msg';

        var prefix = document.createElement('span');
        prefix.className = 'msg-prefix';
        prefix.innerHTML = '&gt;';
        msgEl.appendChild(prefix);
        msgEl.appendChild(document.createTextNode(' '));

        var textSpan = document.createElement('span');
        msgEl.appendChild(textSpan);

        messagesContainer.appendChild(msgEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Update progress
        elapsed += msg.duration;
        var progress = Math.min((elapsed / totalDuration) * 100, 100);
        progressBar.style.width = progress + '%';
        percentageEl.textContent = Math.round(progress) + '%';

        var currentIndex = msgIndex;
        msgIndex++;

        typeLoadingMessage(msgEl, textSpan, msg.text, function () {
            var pauseAfter = Math.max(200, msg.duration - (msg.text.length * LOADING_TYPE_SPEED));
            setTimeout(showNextMessage, pauseAfter);
        });
    }

    showNextMessage();
}


// ===== REVEAL =====

function startRevealSequence() {
    var overlay = document.getElementById('reveal-overlay');
    var destination = document.getElementById('reveal-destination');
    var message = document.getElementById('reveal-message');
    var photos = document.getElementById('reveal-photos');
    var cta = document.getElementById('reveal-cta');

    // Phase 1: Overlay fades out
    setTimeout(function () {
        overlay.classList.add('fade-out');
    }, 800);

    // Phase 2: TOKYO appears
    setTimeout(function () {
        destination.classList.add('visible');
        startConfetti();
    }, 2000);

    // Phase 3: Message
    setTimeout(function () {
        message.classList.add('visible');
    }, 4000);

    // Phase 4: Photos + CTA
    setTimeout(function () {
        if (photos) photos.classList.add('visible');
    }, 5500);

    setTimeout(function () {
        if (cta) cta.classList.add('visible');
    }, 6500);
}


// ===== CONFETTI =====

function startConfetti() {
    var canvas = document.getElementById('confetti-canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var isMobile = window.innerWidth <= 768;
    var PIECE_COUNT = isMobile ? 80 : 150;
    var colors = ['#FF2634', '#ff6b74', '#ffb3b8', '#FFEDFA', '#ffd700', '#ff8a80', '#ff4d5a'];
    var pieces = [];

    for (var i = 0; i < PIECE_COUNT; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: (Math.random() * canvas.height) - canvas.height,
            w: 4 + Math.random() * 8,
            h: 3 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: -4 + Math.random() * 8,
            speedX: -1.5 + Math.random() * 3,
            speedY: 1.5 + Math.random() * 4,
            opacity: 1
        });
    }

    var frameCount = 0;
    var MAX_FRAMES = 300;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frameCount++;

        for (var i = 0; i < pieces.length; i++) {
            var p = pieces[i];
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            if (frameCount > MAX_FRAMES * 0.7) {
                p.opacity = Math.max(0, 1 - (frameCount - MAX_FRAMES * 0.7) / (MAX_FRAMES * 0.3));
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }

        if (frameCount < MAX_FRAMES) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animate();

    window.addEventListener('resize', function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}


// ===== UTILITIES =====

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}


// ===== INIT =====

document.addEventListener('DOMContentLoaded', function () {
    // Start on intro screen
    showScreen('intro');

    // Slot machine animation on Honeymoon letters — flip forward, then back, repeat
    var slots = document.querySelectorAll('.title-line-slots .slot');
    var STAGGER = 100;          // ms between each letter
    var INITIAL_DELAY = 300;    // ms before first flip
    var PAUSE_BETWEEN = 3000;   // ms to hold before flipping back
    var CYCLE_INTERVAL = 6000;  // ms between full cycles

    function flipSlots(forward) {
        slots.forEach(function (slot, i) {
            setTimeout(function () {
                if (forward) {
                    slot.classList.add('animate');
                } else {
                    slot.classList.remove('animate');
                }
            }, i * STAGGER);
        });
    }

    // First cycle after initial delay
    setTimeout(function () {
        flipSlots(true);
        setTimeout(function () {
            flipSlots(false);
        }, PAUSE_BETWEEN);
    }, INITIAL_DELAY);

    // Repeat every CYCLE_INTERVAL
    setInterval(function () {
        flipSlots(true);
        setTimeout(function () {
            flipSlots(false);
        }, PAUSE_BETWEEN);
    }, CYCLE_INTERVAL);

    // Begin typing animation
    var terminalText = document.getElementById('terminal-text');
    var btnStart = document.getElementById('btn-start');

    typeText(terminalText, INTRO_TEXT, function () {
        btnStart.classList.add('visible');
    });

    // START button handler
    btnStart.addEventListener('click', function () {
        showScreen('quiz');
        initQuiz();
    });
});
