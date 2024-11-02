async function loadDialogs() {
    try {
        const response = await fetch('dialogs.json');
        const dialogs = await response.json();
        renderChatList(dialogs);
    } catch (error) {
        console.error('Error loading dialogs:', error);
    }
}

function renderChatList(dialogs) {
    const chatListContainer = document.getElementById('chat-list');
    chatListContainer.innerHTML = '';

    dialogs.forEach(dialog => {
        if (!dialog.viewed) {
            const lastMessage = dialog.messages.length > 0 ? dialog.messages[dialog.messages.length - 1].message : 'No messages';
            const chatItem = document.createElement('a');
            const viewedStatus = 'not-viewed';
            chatItem.classList.add(`chat-item`);
            chatItem.classList.add(`${viewedStatus}`);
            chatItem.setAttribute('href', `/chat?dialogId=${dialog.dialogId}&profileId=${dialog.profileId}&name=${dialog.name}&platform=${dialog.platform}`);


            chatItem.innerHTML = `
                <h3>${dialog.name}</h3>
                <p>${lastMessage}</p>
            `;

            chatListContainer.appendChild(chatItem);
        }
    });

    dialogs.forEach(dialog => {
        if (dialog.viewed) {
            const lastMessage = dialog.messages.length > 0 ? dialog.messages[dialog.messages.length - 1].message : 'No messages';
            const chatItem = document.createElement('a');
            const viewedStatus = 'viewed';
            chatItem.classList.add(`chat-item`);
            chatItem.classList.add(`${viewedStatus}`);
            chatItem.setAttribute('href', `/chat?dialogId=${dialog.dialogId}&profileId=${dialog.profileId}&name=${dialog.name}&platform=${dialog.platform}`);


            chatItem.innerHTML = `
                <h3>${dialog.name}</h3>
                <p>${lastMessage}</p>
            `;

            chatListContainer.appendChild(chatItem);
        }
    });
}

window.onload = loadDialogs;
