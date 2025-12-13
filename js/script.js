// ==================================
// MOBILE REDIRECT (Runs first)
// ==================================
if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    window.location.href = "index-mobile.html";
}


// ==================================
// WINDOW CONTROL FUNCTIONS
// ==================================
function getNextZIndex() {
    // Finds the highest z-index currently used by a window and returns one higher
    let maxZ = 20; // Base z-index
    document.querySelectorAll('.window').forEach(windowEl => {
        let currentZ = parseInt(windowEl.style.zIndex) || 0;
        if (currentZ > maxZ) {
            maxZ = currentZ;
        }
    });
    return maxZ + 1;
}

function openWindow(id) {
    const windowElement = document.getElementById(id);
    if (windowElement) {
        windowElement.classList.remove('minimized');
        windowElement.classList.remove('maximized');
        windowElement.style.zIndex = getNextZIndex();
        // Bring the window to the front
        windowElement.addEventListener('mousedown', () => {
            windowElement.style.zIndex = getNextZIndex();
        }, { once: true });
    }
}

function closeWindow(id) {
    document.getElementById(id).classList.add('minimized');
    document.getElementById(id).classList.remove('maximized');
}

function minimizeWindow(id) {
    document.getElementById(id).classList.add('minimized');
    document.getElementById(id).classList.remove('maximized');
}

function maximizeWindow(id) {
    const windowElement = document.getElementById(id);
    if (windowElement) {
        windowElement.classList.toggle('maximized');
        windowElement.style.zIndex = getNextZIndex();
    }
}


// ==================================
// DRAGGING LOGIC
// ==================================

// Function to make elements draggable
function makeDraggable(element, dragHandle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    if (dragHandle) {
        // If the element has a drag handle (like a title bar)
        dragHandle.onmousedown = dragMouseDown;
    } else {
        // Otherwise, make the whole element the drag handle
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        if (element.classList.contains('maximized')) {
            // Prevent dragging if maximized
            return;
        }

        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // set the element's new position:
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";

        // Bring to front
        element.style.zIndex = getNextZIndex();
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Apply drag functionality to all windows
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.window').forEach(windowEl => {
        // Only apply drag to windows that are NOT the home window (which is static)
        if (windowEl.id !== 'homeWindow') {
            const dragHandle = document.getElementById(windowEl.id + '-drag');
            makeDraggable(windowEl, dragHandle);
        }
    });
});


// ==================================
// THEME & MUSIC TOGGLE LOGIC
// ==================================
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggle');
    const musicToggleBtn = document.getElementById('musicToggle');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const musicIcon = document.getElementById('musicToggleIcon');
    const isNightMode = localStorage.getItem('nightMode') === 'true';
    const isMusicPlaying = localStorage.getItem('musicPlaying') === 'true';

    // Apply saved theme state
    if (isNightMode) {
        document.body.classList.add('night-mode');
        themeToggleBtn.textContent = '☀️';
    } else {
        themeToggleBtn.textContent = '🌙';
    }

    // Apply saved music state
    if (isMusicPlaying) {
        backgroundMusic.play();
        musicIcon.src = 'https://media1.tenor.com/m/tB9MDMlIh_oAAAAC/squirtle-shame.gif'; // Play GIF
    } else {
        musicIcon.src = 'https://nursang.carrd.co/assets/images/image05.png?v=90346968'; // Static Image
    }


    themeToggleBtn.addEventListener('click', () => {
        const isNight = document.body.classList.toggle('night-mode');
        localStorage.setItem('nightMode', isNight);
        themeToggleBtn.textContent = isNight ? '☀️' : '🌙';
    });

    musicToggleBtn.addEventListener('click', () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            localStorage.setItem('musicPlaying', 'true');
            musicIcon.src = 'https://media1.tenor.com/m/tB9MDMlIh_oAAAAC/squirtle-shame.gif';
        } else {
            backgroundMusic.pause();
            localStorage.setItem('musicPlaying', 'false');
            musicIcon.src = 'https://nursang.carrd.co/assets/images/image05.png?v=90346968';
        }
    });

    // Attempt to auto-play music on page load (modern browsers often block this)
    if (isMusicPlaying) {
        backgroundMusic.play().catch(e => {
            console.log("Autoplay blocked. User needs to interact with the page.");
            // Optionally, show a message instructing the user to click the music button
        });
    }

    // Initial messages for chat
    const chatMessagesEl = document.getElementById('chatMessages');
    const initialMessage = `<div class="message system-message">Welcome to the Guest Book! Leave a message for Nuru. (Messages refresh on page reload)</div>`;
    chatMessagesEl.innerHTML = initialMessage;
});


// ==================================
// CHAT/GUESTBOOK LOGIC
// (Note: Since this is purely front-end, messages will not persist after refresh)
// ==================================
function sendMessage() {
    const input = document.getElementById('messageInput');
    const messageText = input.value.trim();
    const chatMessagesEl = document.getElementById('chatMessages');

    if (messageText !== "") {
        // Simple "User" Name for display
        const userName = "Guest"; 
        
        const messageHtml = `
            <div class="message user-message">
                <div class="sender-name">${userName}</div>
                ${messageText}
            </div>
        `;
        
        chatMessagesEl.innerHTML += messageHtml;
        input.value = ''; // Clear input
        
        // Scroll to the bottom of the chat
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
}

// Allow pressing Enter key to send message
document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
