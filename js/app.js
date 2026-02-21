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

const REVEAL_TEXT = "After cross-referencing 12,847 behavioural data points, mapping your emotional response curves against 943 destination profiles, factoring in circadian rhythm compatibility, culinary preference matrices, and running 3 rounds of quantum-probabilistic analysis... the algorithm has converged with 99.97% confidence.";

// Glitch decode constants
var GLITCH_KANJI = '\u6771\u4EAC';  // 東京
var GLITCH_CHARS = '\u6771\u4EAC\u90FD\u5E02\u8857\u9053\u5149\u95C7\u5922\u5E7B\u98A8\u96F7\u706B\u6C34\u5929\u5730\u661F\u6708\u82B1\u9CE5!@#$%^&*<>/|~+=_ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var GLITCH_FINAL_LETTERS = ['T', 'O', 'K', 'Y', 'O'];
var GLITCH_FINAL_CLASSES = [
    't-editorial-reveal',
    't-neuebit-reveal',
    't-montreal-reveal',
    't-neuebit-reveal',
    't-neuebit-reveal'
];
var GLITCH_FLICKER_MS = 50;
var GLITCH_PHASE_SPLIT = 700;
var GLITCH_RESOLVE_START = 1000;
var GLITCH_RESOLVE_STAGGER = 200;

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

var ROUTES = {
    a: {
        label: 'Route \u03b1',
        title: 'Mountain Protocol',
        text: 'Sub-algorithm detected a 94.2% compatibility with altitude-based serotonin optimization. Recommended sequence: 3 days in Tokyo for baseline urban calibration, followed by deployment to Takayama (traditional merchant district, morning market protocol), Shirakawa-go (UNESCO-classified thatched architecture, optimal for visual cortex stimulation), and Kusatsu (volcanic onsen complex, 97.3% stress dissolution rate). Total route efficiency: exceptional.',
        photos: ['img/route-a-1.jpg', 'img/route-a-2.jpg', 'img/route-a-3.jpg', 'img/route-a-4.jpg']
    },
    b: {
        label: 'Route \u03b2',
        title: 'Island Protocol',
        text: 'Cross-archipelago analysis reveals 96.1% match with subtropical neural enhancement patterns. Recommended sequence: 3 days in Tokyo for sensory warm-up, then transit to Taipei (night market immersion therapy, 847 food stalls mapped), Jiufen (fog-altitude nostalgia coefficient: 0.94), Taroko Gorge (geological awe-induction, marble canyon protocol), and Beitou (geothermal recovery phase, sulphur spring variant). Total route efficiency: extraordinary.',
        photos: ['img/route-b-1.jpg', 'img/route-b-2.jpg', 'img/route-b-3.jpg', 'img/route-b-4.jpg']
    }
};


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

function typeText(element, text, onComplete, cursorEl) {
    var index = 0;
    var cursor = cursorEl || document.getElementById('typing-cursor');
    var finished = false;

    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(typingTimeout);
        element.textContent = text;
        if (cursor) cursor.style.display = 'inline';
        if (onComplete) onComplete();
    }

    function typeChar() {
        if (finished) return;
        if (index < text.length) {
            var char = text[index];
            element.textContent += char;
            index++;

            var delay = TYPING_SPEED_MIN + Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN);
            if (char === '.' || char === ',') delay += 200;
            if (char === ' ') delay = 15 + Math.random() * 25;

            typingTimeout = setTimeout(typeChar, delay);
        } else {
            finish();
        }
    }

    // Click/tap on parent to skip typing and show full text
    var clickTarget = element.parentElement;
    if (clickTarget) {
        clickTarget.addEventListener('click', function skipTyping() {
            clickTarget.removeEventListener('click', skipTyping);
            finish();
        });
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
    var textEl = document.getElementById('analyzing-text');
    var hearts = document.querySelectorAll('.analyzing-heart');
    var container = document.getElementById('card-container');

    container.innerHTML = '';
    textEl.textContent = msg;
    textEl.classList.remove('visible');

    // Reset hearts
    for (var h = 0; h < hearts.length; h++) {
        hearts[h].classList.remove('visible');
    }

    el.classList.add('visible');

    // Slide-up fade-in the text after a frame
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            textEl.classList.add('visible');
        });
    });

    // Show hearts one by one
    for (var i = 0; i < hearts.length; i++) {
        (function (idx) {
            setTimeout(function () {
                hearts[idx].classList.add('visible');
            }, 300 + idx * 280);
        })(i);
    }

    // End after ANALYZING_DELAY
    setTimeout(function () {
        el.classList.remove('visible');
        textEl.classList.remove('visible');
        onComplete();
    }, ANALYZING_DELAY);
}


// ===== LOADING SEQUENCE =====

var LOADING_TYPE_SPEED = 18;

function startLoadingSequence() {
    var messagesContainer = document.getElementById('loading-messages');
    var hearts = document.querySelectorAll('.loading-heart');

    messagesContainer.innerHTML = '';

    // Reset hearts
    for (var h = 0; h < hearts.length; h++) {
        hearts[h].classList.remove('visible');
    }

    var totalDuration = 0;
    for (var i = 0; i < loadingMessages.length; i++) {
        totalDuration += loadingMessages[i].duration;
    }

    // Schedule hearts based on progress thresholds (20%, 40%, 60%, 80%, 100%)
    var elapsed = 0;
    for (var h = 0; h < hearts.length; h++) {
        var threshold = totalDuration * ((h + 1) / hearts.length);
        (function (idx, delay) {
            setTimeout(function () {
                hearts[idx].classList.add('visible');
            }, delay);
        })(h, threshold);
    }

    var msgIndex = 0;

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

        var currentIndex = msgIndex;
        msgIndex++;

        typeLoadingMessage(msgEl, textSpan, msg.text, function () {
            var pauseAfter = Math.max(200, msg.duration - (msg.text.length * LOADING_TYPE_SPEED));
            setTimeout(showNextMessage, pauseAfter);
        });
    }

    showNextMessage();
}


// ===== GLITCH DECODE =====

function startGlitchDecode(onComplete) {
    var target = document.getElementById('tokyo-glitch-target');
    var destEl = document.getElementById('reveal-destination');
    var finished = false;
    var timeouts = [];
    var intervals = [];

    function randomChar() {
        return GLITCH_CHARS.charAt(Math.floor(Math.random() * GLITCH_CHARS.length));
    }

    function finish() {
        if (finished) return;
        finished = true;
        for (var i = 0; i < timeouts.length; i++) clearTimeout(timeouts[i]);
        for (var i = 0; i < intervals.length; i++) clearInterval(intervals[i]);
        // Set final state
        target.innerHTML = '';
        for (var i = 0; i < GLITCH_FINAL_LETTERS.length; i++) {
            var span = document.createElement('span');
            span.className = GLITCH_FINAL_CLASSES[i];
            span.textContent = GLITCH_FINAL_LETTERS[i];
            target.appendChild(span);
        }
        if (onComplete) onComplete();
    }

    // Reduced motion: skip straight to final
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        destEl.classList.add('visible');
        finish();
        return finish;
    }

    // Make destination visible (opacity fade only)
    destEl.classList.add('visible');

    // Phase 1: Show kanji 東京
    target.innerHTML = '';
    var kanjiSpans = [];
    for (var k = 0; k < GLITCH_KANJI.length; k++) {
        var s = document.createElement('span');
        s.className = 'glitch-char';
        s.textContent = GLITCH_KANJI[k];
        target.appendChild(s);
        kanjiSpans.push(s);
    }

    // Phase 2: Start flickering kanji slots (after 300ms pause to register kanji)
    var t2 = setTimeout(function () {
        if (finished) return;
        var phase2Interval = setInterval(function () {
            if (finished) return;
            for (var i = 0; i < kanjiSpans.length; i++) {
                kanjiSpans[i].textContent = randomChar();
            }
        }, GLITCH_FLICKER_MS);
        intervals.push(phase2Interval);
    }, 300);
    timeouts.push(t2);

    // Phase 3: Split to 5 slots
    var t3 = setTimeout(function () {
        if (finished) return;
        // Clear all phase 2 intervals
        for (var i = 0; i < intervals.length; i++) clearInterval(intervals[i]);
        intervals = [];

        target.innerHTML = '';
        var fiveSpans = [];
        var fiveIntervals = [];

        for (var i = 0; i < 5; i++) {
            var span = document.createElement('span');
            span.className = 'glitch-char';
            span.textContent = randomChar();
            target.appendChild(span);
            fiveSpans.push(span);

            // Individual flicker for each slot
            (function (idx) {
                var iv = setInterval(function () {
                    if (finished) return;
                    // Bias toward final letter as we approach resolve
                    if (Math.random() < 0.15) {
                        fiveSpans[idx].textContent = GLITCH_FINAL_LETTERS[idx];
                    } else {
                        fiveSpans[idx].textContent = randomChar();
                    }
                }, GLITCH_FLICKER_MS);
                fiveIntervals.push(iv);
                intervals.push(iv);
            })(i);
        }

        // Phase 4: Staggered resolution
        var resolveBase = GLITCH_RESOLVE_START - GLITCH_PHASE_SPLIT;
        for (var i = 0; i < 5; i++) {
            (function (idx) {
                var t = setTimeout(function () {
                    if (finished) return;
                    clearInterval(fiveIntervals[idx]);
                    fiveSpans[idx].textContent = GLITCH_FINAL_LETTERS[idx];
                    fiveSpans[idx].className = GLITCH_FINAL_CLASSES[idx] + ' glitch-resolved';

                    if (idx === 4) {
                        finish();
                    }
                }, resolveBase + idx * GLITCH_RESOLVE_STAGGER);
                timeouts.push(t);
            })(i);
        }
    }, GLITCH_PHASE_SPLIT);
    timeouts.push(t3);

    // Click/tap to skip glitch
    destEl.addEventListener('click', function skipGlitch() {
        destEl.removeEventListener('click', skipGlitch);
        finish();
    });

    return finish;
}


// ===== GACHA MACHINE (Canvas-based) =====

// Positions ordered geographically: right → center → left
var GACHA_POSITIONS = ['back', 'front', 'mid'];
var GACHA_ROUTE_MAP = { back: 'a', front: 'a', mid: 'b' };

var gachaState = {
    position: 0,        // 0=back, 1=mid, 2=front
    phase: 'idle',       // idle | joystickTilt | grabbing | descending | grabbed | ascending | slideToDrop | dropping | fadeout | done
    blinkState: false,
    blinkTimer: 0,
    joystickDir: null,   // null | 'left' | 'right'
    joystickTimer: 0,
    buttonPressed: false,
    buttonTimer: 0,
    clawY: 0,           // 0 = top, positive = descending (in px offset)
    grabY: 0,            // ascending offset (negative = going up)
    clawSlideX: 0,       // current animated X offset (smooth lateral movement)
    clawTargetX: 0,      // target X offset
    showGrab: false,     // true when showing closed claw + plush
    hiddenPlush: null,   // which inside plush to hide when grabbed
    // Drop animation state
    dropping: false,
    dropPlush: null,
    dropX: 0,
    dropY: 0,
    dropRotation: 0,
    dropIsFail: false,
    fallenPlushies: [],
    animFrame: null,
    canvas: null,
    ctx: null,
    images: {},
    loaded: false,
    lastTime: 0
};

// All layer assets with their EXACT pixel positions from Pixaki document.json
// Format: [identifier, x, y, w, h]
var GACHA_LAYERS = {
    // Bottom layers (drawn first)
    bg:              { src: 'bg.png',              x: 0,   y: 0,   w: 500, h: 500 },
    // Inside plushies (decorative, inside the glass)
    inside1:         { src: 'inside-1.png',        x: 211, y: 138, w: 78,  h: 82  },
    inside2:         { src: 'inside-2.png',        x: 199, y: 220, w: 82,  h: 48  },
    inside3:         { src: 'inside-3.png',        x: 157, y: 190, w: 74,  h: 76  },
    inside4:         { src: 'inside-4.png',        x: 258, y: 181, w: 74,  h: 76  },
    inside5:         { src: 'inside-5.png',        x: 163, y: 168, w: 82,  h: 78  },
    inside6:         { src: 'inside-6.png',        x: 298, y: 195, w: 47,  h: 74  },
    inside7:         { src: 'inside-7.png',        x: 155, y: 185, w: 59,  h: 82  },
    // Claw standby (open, short bar, at default back position)
    clawOpen:        { src: 'claw-open.png',       x: 275, y: 74,  w: 45,  h: 38  },
    clawHolder:      { src: 'claw-holder.png',     x: 289, y: 54,  w: 17,  h: 8   },
    clawBarShort:    { src: 'claw-bar-short.png',  x: 295, y: 55,  w: 5,   h: 29  },
    // Grab states — closed claw with plush at each position
    grabBackPlush:   { src: 'claw-back-plush.png',   x: 258, y: 101, w: 74, h: 76 },
    grabBackBar:     { src: 'claw-back-bar.png',      x: 295, y: 54,  w: 5,  h: 27 },
    grabBackFingers: { src: 'claw-back-fingers.png',  x: 275, y: 74,  w: 45, h: 40 },
    grabBackHolder:  { src: 'claw-back-holder.png',   x: 289, y: 54,  w: 17, h: 8  },
    grabMidPlush:    { src: 'claw-mid-plush.png',     x: 156, y: 101, w: 74, h: 76 },
    grabMidBar:      { src: 'claw-mid-bar.png',       x: 193, y: 54,  w: 5,  h: 27 },
    grabMidFingers:  { src: 'claw-mid-fingers.png',   x: 173, y: 74,  w: 45, h: 40 },
    grabMidHolder:   { src: 'claw-mid-holder.png',    x: 187, y: 54,  w: 17, h: 8  },
    grabFrontPlush:  { src: 'claw-front-plush.png',   x: 211, y: 94,  w: 78, h: 82 },
    grabFrontBar:    { src: 'claw-front-bar.png',     x: 248, y: 54,  w: 5,  h: 27 },
    grabFrontFingers:{ src: 'claw-front-fingers.png', x: 228, y: 74,  w: 45, h: 40 },
    grabFrontHolder: { src: 'claw-front-holder.png',  x: 242, y: 54,  w: 17, h: 8  },
    // Glass
    glass:           { src: 'glass.png',           x: 154, y: 38,  w: 192, h: 231 },
    glassShine:      { src: 'glass-shine.png',     x: 155, y: 82,  w: 190, h: 149 },
    // Machine structure (on top of everything inside)
    machine:         { src: 'machine.png',         x: 123, y: 3,   w: 254, h: 487 },
    dither:          { src: 'dither.png',          x: 129, y: 12,  w: 241, h: 465 },
    // Letters
    gacha1off:       { src: 'gacha1-off.png',      x: 160, y: 387, w: 119, h: 32  },
    gacha1on:        { src: 'gacha1-on.png',       x: 160, y: 387, w: 119, h: 32  },
    gacha2off:       { src: 'gacha2-off.png',      x: 160, y: 420, w: 119, h: 32  },
    gacha2on:        { src: 'gacha2-on.png',       x: 160, y: 420, w: 119, h: 32  },
    // Button
    btnStandby:      { src: 'btn-standby.png',     x: 306, y: 306, w: 20,  h: 16  },
    btnPressed:      { src: 'btn-pressed.png',     x: 306, y: 309, w: 20,  h: 13  },
    // Joystick
    joyUpStick:      { src: 'joy-up-stick.png',    x: 246, y: 285, w: 6,   h: 30  },
    joyUpBase:       { src: 'joy-up-base.png',     x: 237, y: 262, w: 24,  h: 24  },
    joyRightStick:   { src: 'joy-right-stick.png', x: 246, y: 289, w: 25,  h: 26  },
    joyRightBase:    { src: 'joy-right-base.png',  x: 265, y: 271, w: 24,  h: 24  },
    joyLeftStick:    { src: 'joy-left-stick.png',  x: 225, y: 289, w: 25,  h: 26  },
    joyLeftBase:     { src: 'joy-left-base.png',   x: 207, y: 271, w: 24,  h: 24  }
};

// Claw X offsets: back=0 (right), mid=-102 (left), front=-47 (center)
var CLAW_OFFSETS = { back: 0, mid: -102, front: -47 };

// Hit areas in 500x500 canvas space
// Joystick center ~(249,280), button center ~(316,314)
var GACHA_HIT_AREAS = {
    joyLeft:  { x: 155, y: 235, w: 95, h: 95 },
    joyRight: { x: 245, y: 235, w: 60, h: 95 },
    button:   { x: 295, y: 295, w: 45, h: 45 }
};

function loadGachaImages(callback) {
    if (gachaState.loaded) { callback(); return; }
    var keys = Object.keys(GACHA_LAYERS);
    var loaded = 0;
    var total = keys.length;
    var called = false;
    function done() {
        if (called) return;
        called = true;
        gachaState.loaded = true;
        callback();
    }
    for (var i = 0; i < keys.length; i++) {
        (function(key) {
            var img = new Image();
            img.onload = function () {
                gachaState.images[key] = img;
                loaded++;
                if (loaded === total) done();
            };
            img.onerror = function () {
                loaded++;
                if (loaded === total) done();
            };
            img.src = 'img/gacha/' + GACHA_LAYERS[key].src;
        })(keys[i]);
    }
}

function drawLayer(ctx, key, offsetX, offsetY) {
    var img = gachaState.images[key];
    var L = GACHA_LAYERS[key];
    if (!img) return;
    ctx.drawImage(img, L.x + (offsetX || 0), L.y + (offsetY || 0), L.w, L.h);
}

// Draw a bar sprite stretched vertically. The bar top stays at its original Y,
// but its height grows by offsetY pixels (the claw descent/ascent distance).
function drawBarStretched(ctx, barKey, offsetX, offsetY) {
    var img = gachaState.images[barKey];
    var L = GACHA_LAYERS[barKey];
    if (!img) return;
    var stretchedH = L.h + (offsetY || 0);
    if (stretchedH < 1) stretchedH = 1;
    ctx.drawImage(img,
        0, 0, img.naturalWidth, img.naturalHeight,
        L.x + (offsetX || 0), L.y, L.w, stretchedH
    );
}

// Which inside plush corresponds to each grab position
// back (RIGHT) = inside4, mid (LEFT) = inside3, front (CENTER) = inside1
var GRAB_HIDES = { back: 'inside4', mid: 'inside3', front: 'inside1' };

// Y position where the plush top sits when grabbed (just below fingers grip)
var GRAB_PLUSH_Y = 100;

// Descend distances per position
var DESCEND_PIXELS = { back: 75, mid: 82, front: 35 };

// Drop animation
var SLIDE_TO_DROP_DURATION = 800;
var DROP_PAUSE = 300;
var DROP_DURATION = 600;
var DROP_DISTANCE = 200;
var GLASS_CLIP = { x: 154, y: 38, w: 192, h: 231 };

// Fail mechanic
var FAIL_CHANCE = 0.35;
var FAIL_ASCEND_FRACTION = 0.45;
var FAIL_DROP_DURATION = 800;
var FAIL_ROTATION = Math.PI / 4;

function renderGacha() {
    var ctx = gachaState.ctx;
    if (!ctx || !gachaState.loaded) return;

    ctx.clearRect(0, 0, 500, 500);

    // 1. Background
    drawLayer(ctx, 'bg');

    // 2. Machine structure + dither (drawn early so plushies appear in front)
    drawLayer(ctx, 'machine');
    drawLayer(ctx, 'dither');

    // Helper: draw a plush with rotation, clipped to glass
    function drawDroppedPlush(key, x, y, rotation) {
        var img = gachaState.images[key];
        var L = GACHA_LAYERS[key];
        if (!img) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(GLASS_CLIP.x, GLASS_CLIP.y, GLASS_CLIP.w, GLASS_CLIP.h);
        ctx.clip();
        if (rotation !== 0) {
            var cx = x + L.w / 2;
            var cy = y + L.h / 2;
            ctx.translate(cx, cy);
            ctx.rotate(rotation);
            ctx.drawImage(img, -L.w / 2, -L.h / 2, L.w, L.h);
        } else {
            ctx.drawImage(img, x, y, L.w, L.h);
        }
        ctx.restore();
    }

    // 3a. Success drop: plush falls BEHIND all other plushies, clipped to glass
    if (gachaState.dropping && !gachaState.dropIsFail && gachaState.dropPlush) {
        drawDroppedPlush(gachaState.dropPlush, gachaState.dropX, gachaState.dropY, 0);
    }

    // 3b. Inside plushies — draw back-to-front
    var plushOrder = ['inside7', 'inside6', 'inside5', 'inside4', 'inside3', 'inside2', 'inside1'];
    for (var i = 0; i < plushOrder.length; i++) {
        var pk = plushOrder[i];
        if (pk === gachaState.hiddenPlush) continue;

        if (gachaState.dropping && gachaState.dropIsFail && gachaState.dropPlush === pk) {
            drawDroppedPlush(pk, gachaState.dropX, gachaState.dropY, gachaState.dropRotation);
            continue;
        }

        var fallen = null;
        for (var f = 0; f < gachaState.fallenPlushies.length; f++) {
            if (gachaState.fallenPlushies[f].key === pk) { fallen = gachaState.fallenPlushies[f]; break; }
        }
        if (fallen) {
            drawDroppedPlush(pk, fallen.x, fallen.y, fallen.rotation);
            continue;
        }

        drawLayer(ctx, pk);
    }

    // 4. Claw system — in front of plushies, behind glass
    var posName = GACHA_POSITIONS[gachaState.position];
    var clawOffX = gachaState.clawSlideX; // smooth animated X
    var clawOffY = gachaState.clawY;

    if (!gachaState.showGrab) {
        // Open claw — holder fixed, bar stretches down, fingers descend
        drawLayer(ctx, 'clawHolder', clawOffX, 0);
        drawBarStretched(ctx, 'clawBarShort', clawOffX, clawOffY);
        drawLayer(ctx, 'clawOpen', clawOffX, clawOffY);
    } else {
        // Closed claw with ORIGINAL plush sprite
        // Use "back" grab sprites as base, offset by CLAW_OFFSETS
        var grabOffY = gachaState.grabY;
        var plushKey = gachaState.hiddenPlush;
        drawLayer(ctx, 'grabBackHolder', clawOffX, 0);
        drawBarStretched(ctx, 'clawBarShort', clawOffX, grabOffY);
        // Draw the original inside plush sprite centered under the claw
        if (plushKey) {
            var plushImg = gachaState.images[plushKey];
            var plushL = GACHA_LAYERS[plushKey];
            if (plushImg) {
                var fingersCenterX = 297 + clawOffX;
                var px = fingersCenterX - plushL.w / 2;
                var py = GRAB_PLUSH_Y + grabOffY;
                ctx.drawImage(plushImg, px, py, plushL.w, plushL.h);
            }
        }
        drawLayer(ctx, 'grabBackFingers', clawOffX, grabOffY);
    }

    // 5. Glass — subtle reflection, always in front of everything inside the machine
    ctx.save();
    ctx.globalAlpha = 0.10;
    drawLayer(ctx, 'glass');
    ctx.restore();

    // Glass shine — subtle white reflection
    ctx.save();
    ctx.globalAlpha = 0.50;
    drawLayer(ctx, 'glassShine');
    ctx.restore();

    // 6. Letters (blink)
    if (gachaState.blinkState) {
        drawLayer(ctx, 'gacha1on');
        drawLayer(ctx, 'gacha2off');
    } else {
        drawLayer(ctx, 'gacha1off');
        drawLayer(ctx, 'gacha2on');
    }

    // 7. Button
    if (gachaState.buttonPressed) {
        drawLayer(ctx, 'btnPressed');
    } else {
        drawLayer(ctx, 'btnStandby');
    }

    // 8. Joystick
    if (gachaState.joystickDir === 'left') {
        drawLayer(ctx, 'joyLeftStick');
        drawLayer(ctx, 'joyLeftBase');
    } else if (gachaState.joystickDir === 'right') {
        drawLayer(ctx, 'joyRightStick');
        drawLayer(ctx, 'joyRightBase');
    } else {
        drawLayer(ctx, 'joyUpStick');
        drawLayer(ctx, 'joyUpBase');
    }
}

function gachaAnimLoop(time) {
    if (gachaState.phase === 'done') return;

    var dt = time - gachaState.lastTime;
    gachaState.lastTime = time;

    // Blink timer (toggle every 500ms)
    gachaState.blinkTimer += dt;
    if (gachaState.blinkTimer >= 500) {
        gachaState.blinkTimer -= 500;
        gachaState.blinkState = !gachaState.blinkState;
    }

    // Joystick tilt timer
    if (gachaState.joystickDir !== null) {
        gachaState.joystickTimer -= dt;
        if (gachaState.joystickTimer <= 0) {
            gachaState.joystickDir = null;
            if (gachaState.phase === 'joystickTilt') {
                gachaState.phase = 'idle';
            }
        }
    }

    // Button press timer
    if (gachaState.buttonPressed) {
        gachaState.buttonTimer -= dt;
        if (gachaState.buttonTimer <= 0) {
            gachaState.buttonPressed = false;
        }
    }

    // Smooth lateral claw slide
    var slideSpeed = 0.004;
    var diff = gachaState.clawTargetX - gachaState.clawSlideX;
    if (Math.abs(diff) > 0.5) {
        gachaState.clawSlideX += diff * Math.min(slideSpeed * dt, 1);
    } else {
        gachaState.clawSlideX = gachaState.clawTargetX;
    }

    renderGacha();
    gachaState.animFrame = requestAnimationFrame(gachaAnimLoop);
}

function initGacha() {
    var viewport = document.getElementById('gacha-viewport');
    var canvas = document.getElementById('gacha-canvas');
    gachaState.canvas = canvas;

    // Reset state
    gachaState.position = 0;
    gachaState.phase = 'idle';
    gachaState.blinkState = false;
    gachaState.blinkTimer = 0;
    gachaState.joystickDir = null;
    gachaState.buttonPressed = false;
    gachaState.clawY = 0;
    gachaState.grabY = 0;
    gachaState.clawSlideX = 0;
    gachaState.clawTargetX = 0;
    gachaState.showGrab = false;
    gachaState.hiddenPlush = null;
    gachaState.lastTime = performance.now();

    // Load images then start
    loadGachaImages(function () {
        viewport.classList.add('visible');

        // Size canvas buffer for crisp pixel art on retina screens
        // Snap to integer pixel multiples to prevent sub-pixel artifacts
        requestAnimationFrame(function () {
            var dpr = window.devicePixelRatio || 1;
            var displayWidth = canvas.clientWidth || 375;
            var pixelScale = Math.max(1, Math.round(displayWidth * dpr / 500));
            var bufferSize = 500 * pixelScale;
            canvas.width = bufferSize;
            canvas.height = bufferSize;

            gachaState.canvasScale = pixelScale;
            gachaState.ctx = canvas.getContext('2d');
            gachaState.ctx.imageSmoothingEnabled = false;
            gachaState.ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);

            renderGacha();
            gachaState.animFrame = requestAnimationFrame(gachaAnimLoop);
        });
    });

    // Tap/click + drag/swipe handler on canvas (only attach once)
    if (!gachaState.clickBound) {
        gachaState.clickBound = true;

        // Drag state for joystick swipe detection
        var dragState = {
            active: false,
            startX: 0,
            startY: 0,
            startedOnJoystick: false,
            moved: false
        };
        var DRAG_THRESHOLD = 4; // pixels in logical coords — very sensitive

        function isAnimating() {
            return gachaState.phase === 'done' || gachaState.phase === 'fadeout' ||
                gachaState.phase === 'grabbing' || gachaState.phase === 'descending' ||
                gachaState.phase === 'grabbed' || gachaState.phase === 'ascending' ||
                gachaState.phase === 'slideToDrop' || gachaState.phase === 'dropping' ||
                gachaState.phase === 'complete';
        }

        function clientToLogical(clientX, clientY) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: (clientX - rect.left) * 500 / rect.width,
                y: (clientY - rect.top) * 500 / rect.height
            };
        }

        function isOnJoystickArea(cx, cy) {
            return hitTest(cx, cy, GACHA_HIT_AREAS.joyLeft) ||
                   hitTest(cx, cy, GACHA_HIT_AREAS.joyRight);
        }

        function handlePointerDown(clientX, clientY) {
            if (isAnimating()) return;
            var p = clientToLogical(clientX, clientY);
            dragState.active = true;
            dragState.startX = p.x;
            dragState.startY = p.y;
            dragState.moved = false;
            dragState.startedOnJoystick = isOnJoystickArea(p.x, p.y);
        }

        function handlePointerMove(clientX, clientY) {
            if (!dragState.active || !dragState.startedOnJoystick) return;
            if (isAnimating()) return;
            var p = clientToLogical(clientX, clientY);
            var dx = p.x - dragState.startX;

            if (!dragState.moved && Math.abs(dx) >= DRAG_THRESHOLD) {
                dragState.moved = true;
                if (dx < 0) {
                    moveJoystick('left');
                } else {
                    moveJoystick('right');
                }
            }
        }

        function handlePointerUp(clientX, clientY) {
            if (!dragState.active) return;
            var wasMoved = dragState.moved;
            var wasOnJoystick = dragState.startedOnJoystick;
            dragState.active = false;
            dragState.moved = false;

            if (wasMoved && wasOnJoystick) return;
            if (isAnimating()) return;

            var p = clientToLogical(clientX, clientY);
            if (hitTest(p.x, p.y, GACHA_HIT_AREAS.joyLeft)) {
                moveJoystick('left');
            } else if (hitTest(p.x, p.y, GACHA_HIT_AREAS.joyRight)) {
                moveJoystick('right');
            } else if (hitTest(p.x, p.y, GACHA_HIT_AREAS.button)) {
                pressButton();
            }
        }

        // Touch events
        canvas.addEventListener('touchstart', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var t = e.touches[0];
            handlePointerDown(t.clientX, t.clientY);
        }, { passive: false });

        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            var t = e.touches[0];
            handlePointerMove(t.clientX, t.clientY);
        }, { passive: false });

        canvas.addEventListener('touchend', function (e) {
            e.preventDefault();
            var t = e.changedTouches[0];
            handlePointerUp(t.clientX, t.clientY);
        }, { passive: false });

        // Mouse events
        canvas.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            handlePointerDown(e.clientX, e.clientY);
        });

        canvas.addEventListener('mousemove', function (e) {
            handlePointerMove(e.clientX, e.clientY);
        });

        canvas.addEventListener('mouseup', function (e) {
            handlePointerUp(e.clientX, e.clientY);
        });

        canvas.addEventListener('mouseleave', function () {
            dragState.active = false;
            dragState.moved = false;
        });
    }
}

function hitTest(px, py, area) {
    return px >= area.x && px <= area.x + area.w &&
           py >= area.y && py <= area.y + area.h;
}

function moveJoystick(direction) {
    // Allow during idle or joystickTilt (so rapid taps work)
    if (gachaState.phase !== 'idle' && gachaState.phase !== 'joystickTilt') return;

    if (direction === 'left' && gachaState.position < 2) {
        gachaState.position++;
    } else if (direction === 'right' && gachaState.position > 0) {
        gachaState.position--;
    } else {
        return;
    }

    gachaState.phase = 'joystickTilt';
    gachaState.joystickDir = direction;
    gachaState.joystickTimer = 400;
    // Set target X for smooth slide
    var newPosName = GACHA_POSITIONS[gachaState.position];
    gachaState.clawTargetX = CLAW_OFFSETS[newPosName];
}

function pressButton() {
    // Allow during idle or joystickTilt
    if (gachaState.phase !== 'idle' && gachaState.phase !== 'joystickTilt') return;
    // Snap claw to final position before grabbing
    var posName = GACHA_POSITIONS[gachaState.position];
    gachaState.clawSlideX = CLAW_OFFSETS[posName];
    gachaState.clawTargetX = gachaState.clawSlideX;
    gachaState.phase = 'grabbing';
    gachaState.buttonPressed = true;
    gachaState.buttonTimer = 200;
    grabSequence();
}

function easeOutBounce(t) {
    if (t < 1 / 2.75) {
        return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
        t -= 1.5 / 2.75;
        return 7.5625 * t * t + 0.75;
    } else if (t < 2.5 / 2.75) {
        t -= 2.25 / 2.75;
        return 7.5625 * t * t + 0.9375;
    } else {
        t -= 2.625 / 2.75;
        return 7.5625 * t * t + 0.984375;
    }
}

function startSuccessDrop(routeKey, plushKey) {
    gachaState.phase = 'dropping';
    var plushL = GACHA_LAYERS[plushKey];
    if (!plushL) { console.error('startSuccessDrop: invalid plushKey', plushKey); return; }
    var fingersCenterX = 297 + gachaState.clawSlideX;
    gachaState.dropPlush = plushKey;
    gachaState.dropX = fingersCenterX - plushL.w / 2;
    gachaState.dropY = GRAB_PLUSH_Y;
    gachaState.dropRotation = 0;
    gachaState.dropIsFail = false;
    gachaState.dropping = true;
    gachaState.showGrab = false;
    gachaState.clawY = 0;

    var dropStart = performance.now();
    var dropStartY = gachaState.dropY;

    function animateDrop() {
        var elapsed = performance.now() - dropStart;
        var t = Math.min(elapsed / DROP_DURATION, 1);
        t = t * t;
        gachaState.dropY = dropStartY + DROP_DISTANCE * t;
        if (elapsed < DROP_DURATION) {
            requestAnimationFrame(animateDrop);
        } else {
            gachaState.dropping = false;
            gachaState.dropPlush = null;

            gachaState.phase = 'fadeout';
            var viewport = document.getElementById('gacha-viewport');
            viewport.style.opacity = '0';
            viewport.style.transform = 'translateY(-16px)';
            setTimeout(function () {
                viewport.style.display = 'none';
                if (gachaState.animFrame) {
                    cancelAnimationFrame(gachaState.animFrame);
                }
                gachaState.phase = 'done';
                showRoute(routeKey);
            }, 500);
        }
    }
    requestAnimationFrame(animateDrop);
}

function grabSequence() {
    var posName = GACHA_POSITIONS[gachaState.position];
    var routeKey = GACHA_ROUTE_MAP[posName];
    var descendPixels = DESCEND_PIXELS[posName];
    var willFail = Math.random() < FAIL_CHANCE;
    var descendDuration = 2000;
    var grabPause = 600;

    gachaState.phase = 'descending';
    var descendStart = performance.now();

    function animateDescend() {
        var elapsed = performance.now() - descendStart;
        var t = Math.min(elapsed / descendDuration, 1);
        t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        gachaState.clawY = descendPixels * t;
        if (elapsed < descendDuration) {
            requestAnimationFrame(animateDescend);
        } else {
            gachaState.clawY = descendPixels;

            setTimeout(function () {
                gachaState.hiddenPlush = GRAB_HIDES[posName];
                // Remove from fallenPlushies if re-grabbing a failed plush
                gachaState.fallenPlushies = gachaState.fallenPlushies.filter(function (f) {
                    return f.key !== gachaState.hiddenPlush;
                });
                gachaState.showGrab = true;
                gachaState.clawY = 0;
                gachaState.grabY = descendPixels;
                gachaState.phase = 'ascending';

                var ascendStart = performance.now();
                var startGrabY = descendPixels;
                var endGrabY = willFail ? descendPixels * (1 - FAIL_ASCEND_FRACTION) : 0;
                var ascendDuration = willFail ? 2500 * FAIL_ASCEND_FRACTION : 2500;

                function animateAscend() {
                    var elapsed2 = performance.now() - ascendStart;
                    var t2 = Math.min(elapsed2 / ascendDuration, 1);
                    t2 = t2 < 0.5 ? 2 * t2 * t2 : 1 - Math.pow(-2 * t2 + 2, 2) / 2;
                    gachaState.grabY = startGrabY + (endGrabY - startGrabY) * t2;
                    if (elapsed2 < ascendDuration) {
                        requestAnimationFrame(animateAscend);
                    } else {
                        gachaState.grabY = endGrabY;

                        if (willFail) {
                            // === FAIL PATH ===
                            gachaState.phase = 'dropping';
                            var plushKey = gachaState.hiddenPlush;
                            var plushL = GACHA_LAYERS[plushKey];
                            var fingersCenterX = 297 + gachaState.clawSlideX;
                            gachaState.dropPlush = plushKey;
                            gachaState.dropX = fingersCenterX - plushL.w / 2;
                            gachaState.dropY = GRAB_PLUSH_Y + gachaState.grabY;
                            gachaState.dropRotation = 0;
                            gachaState.dropIsFail = true;
                            gachaState.dropping = true;
                            gachaState.showGrab = false;
                            gachaState.hiddenPlush = null;
                            gachaState.clawY = 0;

                            var originalY = GACHA_LAYERS[plushKey].y;
                            var dropStartY = gachaState.dropY;
                            var dropDistance = originalY - dropStartY;
                            var failDropStart = performance.now();

                            function animateFailDrop() {
                                var elapsed3 = performance.now() - failDropStart;
                                var t3 = Math.min(elapsed3 / FAIL_DROP_DURATION, 1);
                                gachaState.dropY = dropStartY + dropDistance * easeOutBounce(t3);
                                gachaState.dropRotation = FAIL_ROTATION * (1 - Math.pow(1 - t3, 2));
                                if (elapsed3 < FAIL_DROP_DURATION) {
                                    requestAnimationFrame(animateFailDrop);
                                } else {
                                    gachaState.dropY = originalY;
                                    gachaState.dropRotation = FAIL_ROTATION;
                                    gachaState.fallenPlushies.push({
                                        key: plushKey,
                                        x: gachaState.dropX,
                                        y: originalY,
                                        rotation: FAIL_ROTATION
                                    });
                                    gachaState.dropping = false;
                                    gachaState.dropPlush = null;
                                    gachaState.dropIsFail = false;
                                    setTimeout(function () {
                                        gachaState.phase = 'idle';
                                        gachaState.showGrab = false;
                                        gachaState.clawY = 0;
                                        gachaState.grabY = 0;
                                    }, 400);
                                }
                            }
                            requestAnimationFrame(animateFailDrop);
                        } else {
                            // === SUCCESS PATH ===
                            gachaState.phase = 'slideToDrop';
                            var successPlushKey = gachaState.hiddenPlush;
                            var slideStart = performance.now();
                            var slideFromX = gachaState.clawSlideX;
                            var slideToX = CLAW_OFFSETS.back;
                            gachaState.clawTargetX = slideToX;

                            function animateSlideToDrop() {
                                var elapsed3 = performance.now() - slideStart;
                                var t3 = Math.min(elapsed3 / SLIDE_TO_DROP_DURATION, 1);
                                t3 = t3 < 0.5 ? 2 * t3 * t3 : 1 - Math.pow(-2 * t3 + 2, 2) / 2;
                                gachaState.clawSlideX = slideFromX + (slideToX - slideFromX) * t3;
                                if (elapsed3 < SLIDE_TO_DROP_DURATION) {
                                    requestAnimationFrame(animateSlideToDrop);
                                } else {
                                    gachaState.clawSlideX = slideToX;
                                    gachaState.clawTargetX = slideToX;
                                    setTimeout(function () {
                                        startSuccessDrop(routeKey, successPlushKey);
                                    }, DROP_PAUSE);
                                }
                            }

                            if (Math.abs(slideFromX - slideToX) < 1) {
                                gachaState.clawSlideX = slideToX;
                                setTimeout(function () {
                                    startSuccessDrop(routeKey, successPlushKey);
                                }, DROP_PAUSE);
                            } else {
                                requestAnimationFrame(animateSlideToDrop);
                            }
                        }
                    }
                }
                requestAnimationFrame(animateAscend);
            }, grabPause);
        }
    }
    requestAnimationFrame(animateDescend);
}

function showRoute(routeKey) {
    var route = ROUTES[routeKey];
    var detail = document.getElementById('route-detail');
    detail.classList.add('visible');

    // Set title
    document.getElementById('route-detail-title').textContent = route.label + ' \u2014 ' + route.title;

    // Type the description text
    var textEl = document.getElementById('route-detail-text');
    var cursor = document.getElementById('route-detail-cursor');
    textEl.textContent = '';

    typeText(textEl, route.text, function () {
        // Show photos after typing finishes
        var photosEl = document.getElementById('route-detail-photos');
        photosEl.innerHTML = '';
        for (var i = 0; i < route.photos.length; i++) {
            var placeholder = document.createElement('div');
            placeholder.className = 'route-photo-placeholder';
            placeholder.textContent = 'Photo ' + (i + 1);
            photosEl.appendChild(placeholder);
        }
    }, cursor);
}


// ===== REVEAL =====

function startRevealSequence() {
    var overlay = document.getElementById('reveal-overlay');
    var message = document.getElementById('reveal-message');

    // Phase 1: Overlay fades out
    setTimeout(function () {
        overlay.classList.add('fade-out');
    }, 800);

    // Phase 2: Terminal text types out first
    setTimeout(function () {
        message.classList.add('visible');
        var revealTextEl = document.getElementById('reveal-terminal-text');
        var revealCursor = document.getElementById('reveal-cursor');

        if (revealTextEl) {
            typeText(revealTextEl, REVEAL_TEXT, function () {
                // Phase 3: When typing finishes → glitch decode 東京 → TOKYO
                startGlitchDecode(function () {
                    // Phase 4: After glitch resolves → confetti + gacha machine
                    startConfetti();
                    setTimeout(function () {
                        initGacha();
                    }, 1500);
                });
            }, revealCursor);
        }
    }, 2000);
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

    // === ASCII art: individual char float + density-based opacity + random glow ===
    var asciiEl = document.querySelector('.intro-ascii-bg');
    var asciiChars = [];
    if (asciiEl) {
        var raw = asciiEl.textContent;

        // Split into lines to calculate neighbor density per char
        var lines = raw.split('\n');
        // Build a 2D grid: true = visible char, false = space/empty
        var grid = [];
        for (var r = 0; r < lines.length; r++) {
            var row = [];
            for (var c = 0; c < lines[r].length; c++) {
                row.push(lines[r][c] !== ' ');
            }
            grid.push(row);
        }

        // Count neighbors (8 directions) for each cell
        function countNeighbors(row, col) {
            var count = 0;
            for (var dr = -1; dr <= 1; dr++) {
                for (var dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    var nr = row + dr;
                    var nc = col + dc;
                    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[nr].length && grid[nr][nc]) {
                        count++;
                    }
                }
            }
            return count; // 0–8
        }

        var frag = document.createDocumentFragment();
        var lineIdx = 0;
        var colIdx = 0;

        for (var i = 0; i < raw.length; i++) {
            var ch = raw[i];
            if (ch === '\n') {
                frag.appendChild(document.createTextNode('\n'));
                lineIdx++;
                colIdx = 0;
            } else if (ch === ' ') {
                frag.appendChild(document.createTextNode(' '));
                colIdx++;
            } else {
                var neighbors = countNeighbors(lineIdx, colIdx);
                // Map 0–8 neighbors to opacity 0.3–0.8
                // More neighbors = core = more opaque
                var opacity = (0.3 + (neighbors / 8) * 0.5).toFixed(2);

                var span = document.createElement('span');
                span.className = 'ascii-char';
                span.textContent = ch;
                var dur, floatY, floatX;

                // Edge chars (0-2 neighbors): ~5-10% of chars drift much further
                if (neighbors <= 2 && Math.random() < 0.5) {
                    dur = (4 + Math.random() * 4).toFixed(2);          // 4–8s (slower, drifty)
                    floatY = (-8 - Math.random() * 14).toFixed(1);     // -8px to -22px
                    floatX = (-5 + Math.random() * 10).toFixed(1);     // -5px to +5px
                } else {
                    dur = (3 + Math.random() * 4).toFixed(2);
                    floatY = (-1.5 - Math.random() * 3.5).toFixed(1);
                    floatX = (-1 + Math.random() * 2).toFixed(1);
                }

                var delay = (Math.random() * -6).toFixed(2);
                span.style.cssText = 'opacity:' + opacity + ';--float-dur:' + dur + 's;--float-delay:' + delay + 's;--float-y:' + floatY + 'px;--float-x:' + floatX + 'px';
                frag.appendChild(span);
                asciiChars.push(span);
                colIdx++;
            }
        }
        asciiEl.textContent = '';
        asciiEl.appendChild(frag);

        // Random glow: 5-6 chars pulse to full opacity every 800ms
        setInterval(function () {
            var count = 5 + Math.floor(Math.random() * 2);
            for (var g = 0; g < count; g++) {
                var idx = Math.floor(Math.random() * asciiChars.length);
                var el = asciiChars[idx];
                el.classList.remove('glow');
                void el.offsetWidth;
                el.classList.add('glow');
            }
        }, 800);

        asciiEl.addEventListener('animationend', function (e) {
            if (e.animationName === 'charGlow') {
                e.target.classList.remove('glow');
            }
        });

        // === Loose floating symbol clusters — scattered across the viewport ===
        var looseSymbols = [];
        var symbolChars = ['*', '#', '+', '=', '-'];
        var introScreen = document.getElementById('intro-screen');

        // 7 cluster positions spread across the viewport
        var clusterCenters = [
            { x: 8,  y: 12 },
            { x: 85, y: 8  },
            { x: 12, y: 55 },
            { x: 78, y: 45 },
            { x: 45, y: 6  },
            { x: 90, y: 75 },
            { x: 5,  y: 85 }
        ];

        for (var ci = 0; ci < clusterCenters.length; ci++) {
            var cx = clusterCenters[ci].x;
            var cy = clusterCenters[ci].y;
            var clusterSize = 2 + Math.floor(Math.random() * 2); // 2–3 symbols per cluster

            for (var si = 0; si < clusterSize; si++) {
                var sym = document.createElement('span');
                sym.className = 'loose-symbol';
                sym.textContent = symbolChars[Math.floor(Math.random() * symbolChars.length)];

                // Position near cluster center with small offset (±3%)
                var posX = (cx + (-3 + Math.random() * 6)).toFixed(1);
                var posY = (cy + (-3 + Math.random() * 6)).toFixed(1);
                var looseOpacity = (0.15 + Math.random() * 0.18).toFixed(2);
                var looseDur = (4 + Math.random() * 6).toFixed(2);
                var looseDelay = (Math.random() * -8).toFixed(2);
                var looseY = (-8 - Math.random() * 16).toFixed(1);
                var looseX = (-5 + Math.random() * 10).toFixed(1);
                // Random size variation: 0.6× to 1.6× base size
                var looseScale = (0.6 + Math.random() * 1.0).toFixed(2);

                sym.style.cssText = 'left:' + posX + '%;top:' + posY + '%;opacity:' + looseOpacity +
                    ';font-size:calc(clamp(5px, 1.4vw, 9px) * ' + looseScale + ')' +
                    ';--float-dur:' + looseDur + 's;--float-delay:' + looseDelay +
                    's;--float-y:' + looseY + 'px;--float-x:' + looseX + 'px';

                introScreen.appendChild(sym);
                looseSymbols.push(sym);
            }
        }

        // Include loose symbols in the glow cycle
        setInterval(function () {
            var idx = Math.floor(Math.random() * looseSymbols.length);
            var el = looseSymbols[idx];
            el.classList.remove('glow');
            void el.offsetWidth;
            el.classList.add('glow');
        }, 1200);

        // Clean up glow on loose symbols
        introScreen.addEventListener('animationend', function (e) {
            if (e.animationName === 'charGlow' && e.target.classList.contains('loose-symbol')) {
                e.target.classList.remove('glow');
            }
        });
    }

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
