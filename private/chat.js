const elementChatBody = document.querySelector('.chat-body');
const profileId = new URLSearchParams(window.location.search).get('profileId');
const userName = new URLSearchParams(window.location.search).get('name');
const socket = new WebSocket('wss://8080-sooqqa-telegrambot-4u4g9qnhkh6.ws-eu116.gitpod.io/');

socket.onopen = () => {
    socket.send(JSON.stringify({userName, profileId}));
}
socket.onmessage = (message) => {
    console.log(JSON.parse(message.data));
    const data = JSON.parse(message.data);
    if (data.chat) {
        let chat = '';
        for (const message of data.chat) {
            if (message.sender === 'inbox') {
                chat += `
                    <div class="message received">
                        <p>${message.message}</p>
                    </div>`
            } else {
                chat += `
                <div class="message sent">
                    <p>${message.message}</p>
                </div>`
            }
        }
        elementChatBody.innerHTML = chat;
        elementChatBody.scrollBy(0, 100000);
    } else if (data.newMessage) {
        elementChatBody.innerHTML += `<div class="message received">
        <p>${data.newMessage}</p>
    </div>`;
    }
}

const sendButton = document.querySelector('.send-button');
const messageValue = document.querySelector('.chat-input');
const form = document.querySelector('.chat-footer');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    socket.send(JSON.stringify({ message: messageValue.value }));

    document.querySelector('.chat-body').innerHTML += '<div class="message sent"><p class="message-value"></p></div>'
    const msg = document.querySelectorAll('.message-value');
    msg[msg.length - 1].innerText = messageValue.value;
    messageValue.value = '';
});
