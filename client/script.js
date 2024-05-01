import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300)
}

function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
                </div>
                <div class="message" id="${uniqueId}">${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    // user's chatStripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();

    // bot's chatStripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);

    // fetch data from server -> bot's response
    try {
        const response = await fetch('http://localhost:5000', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: data.get('prompt')
            })
        });
    
        clearInterval(loadInterval); // Stop any loading indicator
        messageDiv.innerHTML = ''; // Clear any previous message
    
        if (response.ok) {
            // If response is okay, parse and display the bot's response
            const { bot } = await response.json();
            const parsedData = bot.trim();
            typeText(messageDiv, parsedData); // Assuming typeText function exists
        } else {
            // If there's an error response, display error message
            const err = await response.text();
            messageDiv.innerHTML = 'Something went wrong';
            alert(err); // Display error message in an alert box
        }
    } catch (err) {
        // Catch any errors that occur during the fetch operation
        console.error('Error:', err);
        messageDiv.innerHTML = 'Something went wrong';
    }
    
}

form.addEventListener('submit', handleSubmit);
