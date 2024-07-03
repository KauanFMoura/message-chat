const colors = document.querySelectorAll('.color');
window.addEventListener('resize', mudouTamanho);

colors.forEach(color => {
    color.addEventListener('click', (e) => {
        colors.forEach(c => c.classList.remove('selected'));
        const theme = color.getAttribute('data-color');
        document.body.setAttribute('data-theme', theme);
        color.classList.add('selected');
    });
});


function toggleButton() {
    document.body.classList.toggle('dark-mode');
}

function mudouTamanho() {
    var menu = document.getElementById('menu-conversas');
    var logo = document.getElementById('logo');
    var detailArea = document.getElementById('detail-area');
    var menuContato = document.getElementById('menu-contact');

    if (window.innerWidth >= 780) {
        menu.style.display = 'block';
        logo.onclick = null; // Remove a função onclick
        menuContato.style.display = 'none';
    } else if (window.innerWidth < 780) {
        menu.style.display = 'none';
        logo.onclick = toggleMenuConversa; // Adiciona a função onclick
        detailArea.style.display = 'none';
        menuContato.style.display = 'none';
    } else if (window.innerWidth >= 1120) {
        detailArea.style.display = 'flex';
        menuContato.style.display = 'none';
    }
}

function toggleMenuConversa() {
    var menu = document.getElementById('menu-conversas');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
    }
}

function toggleAreaDetalhe() {
    var detailArea = document.getElementById('detail-area');
    if (detailArea.style.display === 'flex') {
        detailArea.style.display = 'none';
    } else {
        detailArea.style.display = 'flex';
    }
}

// Chama a função ao carregar a página para definir o estado inicial e adiciona o listener para resize
window.onload = function () {
    mudouTamanho(); // Verifica o tamanho da janela e aplica as mudanças necessárias
    window.onresize = mudouTamanho; // Adiciona um listener para o evento resize
};

let selectionMode = false;
let selectedContacts = [];

function toggleMenuContatos() {
    var menuContato = document.getElementById('menu-contact');
    var menuConversas = document.getElementById('menu-conversas');
    if (menuContato.style.display === 'block') {
        menuContato.style.display = 'none';
        menuConversas.style.display = 'block';
    } else {
        menuContato.style.display = 'block';
        menuConversas.style.display = 'none';
    }
}

function toggleSelectionMode() {
    selectionMode = !selectionMode;
    const contacts = document.querySelectorAll('.list-contact:not(.group)');
    const buttonCancelDetail = document.querySelector('#button-cancel .button-cancel-username');
    const form = document.querySelector('.form-group');
    if (selectionMode) {
        buttonCancelDetail.innerText = "Cancelar";
        contacts.forEach(contact => {
            contact.addEventListener('click', handleContactClick);
        });
        form.style.display = 'flex';
    }
}

function handleContactClick(event) {
    if (selectionMode) {
        const contact = event.currentTarget;
        contact.classList.toggle('selected');
        const username = contact.getAttribute('data-username');
        if (contact.classList.contains('selected')) {
            selectedContacts.push(username);
        } else {
            selectedContacts = selectedContacts.filter(user => user !== username);
        }
    }
}

function cancelSelection() {
    const buttonCancelDetail = document.querySelector('#button-cancel .button-cancel-username');
    if (buttonCancelDetail.innerText === "Cancelar") {
        selectionMode = false;
        const contacts = document.querySelectorAll('.list-contact:not(.group)');
        const form = document.querySelector('.form-group');
        contacts.forEach(contact => {
            contact.classList.remove('selected');
            contact.removeEventListener('click', handleContactClick);
        });
        selectedContacts = [];
        form.style.display = 'none';
        buttonCancelDetail.innerText = "Fechar";
    } else {
        toggleMenuContatos(); // Fechar a lista de contatos
    }
}

function concludeSelection() {
    if (selectedContacts.length === 0) {
        alert('Nenhum contato selecionado.');
        return;
    }

    let message = 'Selected contacts:\n';
    selectedContacts.forEach(contact => {
        const contactName = document.querySelector(`.list-contact[data-username="${contact}"] .list-contact-username`);
        if (contactName) {
            message += '- ' + contactName.innerText + '\n';
        }
    });

    const groupName = prompt('Nome do Grupo:');
    if (groupName === null || groupName.trim() === '') {
        alert('Por favor, insira um nome para o grupo.');
        return;
    }

    message += '\nNome do Grupo: ' + groupName;

    alert(message);
    toggleSelectionMode(); // Sair do modo de seleção após concluir
}

function toogleGroupEntrada(group_id, justUpdate) {
    let group = groups[group_id];
    var groupEntrada = document.getElementById('detail-pedidos-group');
    var detailGroup = document.getElementById('detail-group');

    // Limpa a lista de pedidos de entrada
    groupEntrada.innerHTML = '';

    if (groupEntrada.style.display === 'block' && !justUpdate) {
        groupEntrada.style.display = 'none';
        detailGroup.style.display = 'block';
    } else {
        groupEntrada.style.display = 'block';
        detailGroup.style.display = 'none';


        // Mostra os pedidos de entrada do grupo atual
        group.requests.forEach(request => {
            const requestDiv = document.createElement('div');
            let user = users[request];
            requestDiv.classList.add('contact');
            requestDiv.innerHTML = `
                <img class="contact-profile"
                    src="${user.profileImage}" alt="" />
                <div class="contact-detail">
                    <div class="contact-username">${request}</div>
                </div>
                <div class="contact-icon">
                    <span id="aceita" class="material-symbols-outlined">
                        check
                    </span>
                </div>
                <div class="contact-icon">
                    <span id="remove" class="material-symbols-outlined">
                        do_not_disturb_on
                    </span>
                </div>
            `;

            // Verifica se o usuário já está na lista de pedidos de entrada
            if (!isUserAlreadyInList(groupEntrada, request)) {
                groupEntrada.appendChild(requestDiv);
            }
        });
    }
}

function detailsIsOpened(){
    let detailArea = document.getElementById('detail-area');
    return detailArea.style.display === 'flex';
}

function hideEntryRequests() {
    let groupEntrada = document.getElementById('detail-pedidos-group');
    let detailGroup = document.getElementById('detail-group');
    groupEntrada.style.display = 'none';
    detailGroup.style.display = 'block';
}


// Função para esconder detalhes do grupo
function hideDetails() {
    const detailArea = document.getElementById('detail-area');
    const detailGroup = document.getElementById('detail-group');

    detailArea.style.display = 'none';  // Esconde a área de detalhes
    if (detailGroup.style.display === 'none') {
        toogleGroupEntrada();
    }
    hideEntryRequests();
}

function showDetails(type, keyValue) {
    var detailArea = document.getElementById('detail-area');

     if (detailArea.style.display === 'flex') {
        detailArea.style.display = 'none';
    } else {
        if (type === 'group'){
            showGroupDetails(keyValue);
        } else if(type === 'user'){
            showUserDetails(keyValue);
        }

        detailArea.style.display = 'flex';
    }


}


// Função auxiliar para verificar se um usuário já está na lista de pedidos de entrada
function isUserAlreadyInList(container, username) {
    const users = container.getElementsByClassName('contact-username');
    for (let user of users) {
        if (user.textContent.trim() === username.trim()) {
            return true;
        }
    }
    return false;
}

function getUsersFromDivs(divs){
    let users = [];
    for (let i = 0; i < divs.length; i++) {
        users.push(divs[i].dataset.user);
    }
    return users;
}


function getChatDiv(conversas, keyValue, type) {
    if (type === 'group') {
        for (let conversa of conversas) {
            if (conversa.dataset.group === keyValue) {
                return conversa;
            } // Encontrou um elemento com data-user igual a userId
        }
    } else if (type === 'user'){
        for (let conversa of conversas) {
            if (conversa.dataset.user === keyValue) {
                return conversa;
            } // Encontrou um elemento com data-user igual a userId
        }
    }

    return null; // Não encontrou nenhum elemento com data-user igual a userId
}

let lastSelectedUserDiv = null;
var lastSelectedGroupDiv = null;
var users = {};
var groups = {};

// Função para adicionar uma nova pessoa na área de conversas
// Função para atualizar a lista de conversas com base no tipo (usuário ou grupo)
function updateConversationMenu(menu, data, currentUser, socket, firstTime = false) {
    const menuConversas = document.getElementById(menu);
    const conversas = menuConversas.getElementsByClassName('msg');
    let offlineUsers = getUsersFromDivs(conversas).filter(user => !Object.keys(data).includes(user));

    if (menu === 'conversas-pessoas') {
        updateUserConversations(menuConversas, conversas, data, currentUser, offlineUsers);
    } else if (menu === 'conversas-grupos') {
        updateGroupConversations(menuConversas, conversas, data, currentUser);
    }
}

function updateUserConversations(menuConversas, conversas, data, currentUser, offlineUsers) {
    for (let username in data) {
        if (data.hasOwnProperty(username)) {
            let user = data[username];
            let usuarioDiv = getChatDiv(conversas, username, 'user');
            users[username] = user;

            if (usuarioDiv) {
                updateOnlineStatus(usuarioDiv, user);
            } else if (username !== currentUser) {
                createUserDiv(menuConversas, user, username, currentUser);
            }
        }
    }

    offlineUsers.forEach(username => {
        let usuarioDiv = getChatDiv(conversas, username, 'user');
        if (usuarioDiv && usuarioDiv.classList.contains('online')) {
            usuarioDiv.classList.remove('online');
        }
    });

    hideDetails();
}

function updateOnlineStatus(usuarioDiv, user) {
    if (user.online) {
        usuarioDiv.classList.add('online');
    } else {
        usuarioDiv.classList.remove('online');
    }
}

function createUserDiv(menuConversas, user, username, currentUser) {
    const div = document.createElement('div');
    div.classList.add('msg');
    if (user.online) div.classList.add('online');
    div.dataset.user = username;
    div.innerHTML = `
        <img class="msg-profile" src="${user.profileImage}" alt="" />
        <div class="msg-detail">
            <div class="msg-username">${user.displayName}</div>
        </div>
    `;
    menuConversas.append(div);

    initializeChatStates(username, user);

    div.addEventListener('click', () => {
        document.getElementById('hallEntrada').style.display = 'none';
        handleUserClick(div, username, user.displayName);

    });
}

function initializeChatStates(username, user) {
    users[username]['chatState'] = { 'chat-area-main': '', 'inputText': '' };

    if (user['messages'] && user['messages'][username]) {
        user['messages'][username].forEach(message => {
            const messageElement = createMessageElement(message, username);
            users[username]['chatState']['chat-area-main'] += messageElement;
        });
    }
}

function createMessageElement(message, username) {
    let sender = message.sender;
    let timestamp = message.timestamp;
    let messageContent = message.message;
    let messageClass = 'chat-msg';

    if (sender !== username) {
        messageClass += ' owner';
    }

    return `
        <div class="${messageClass}">
            <div class="chat-msg-profile">
                <div class="chat-msg-date">Mensagem enviada ${timestamp}</div>
            </div>
            <div class="chat-msg-content">
                <div class="chat-msg-text">${messageContent}</div>
            </div>
        </div>
    `;
}

function handleUserClick(div, username, displayName) {
    hideDetails();

    let chatAreaMainDiv = document.querySelector('.chat-area-main');
    let inputText = document.getElementById('inputText');

    if (lastSelectedUserDiv && currentConversationType === 'user') {
        const previousUsername = lastSelectedUserDiv.dataset.user;
        saveCurrentChatState(previousUsername, chatAreaMainDiv, inputText);
        lastSelectedUserDiv.classList.remove('active');
    }

    setConversationType('user', username);
    restoreChatState(username, chatAreaMainDiv, inputText);

    document.getElementById('chat-area-title').innerText = displayName;
    document.getElementById('chat-user-image').src = div.querySelector('.msg-profile').src;

    div.classList.add('active');
    lastSelectedUserDiv = div;

    document.dispatchEvent(new CustomEvent('privateChatStarted', { detail: { otherUser: username } }));
    hideDetails();
}

function saveCurrentChatState(keyValue, chatAreaMainDiv, inputText) {
    if (currentConversationType === 'user'){
        if (!users[keyValue]['chatState']) {
            users[keyValue]['chatState'] = { 'chat-area-main': '', 'inputText': '' };
        }
        users[keyValue]['chatState']['chat-area-main'] = chatAreaMainDiv.innerHTML;
        users[keyValue]['chatState']['inputText'] = inputText.value;
    } else {
        if (!groups[keyValue]['chatState']) {
            groups[keyValue]['chatState'] = { 'chat-area-main': '', 'inputText': '' };
        }
        groups[keyValue]['chatState']['chat-area-main'] = chatAreaMainDiv.innerHTML;
        groups[keyValue]['chatState']['inputText'] = inputText.value;
    }

}

function restoreChatState(keyValue, chatAreaMainDiv, inputText) {
    if (currentConversationType === 'user'){
        if (!users[keyValue]['chatState']) {
            users[keyValue]['chatState'] = { 'chat-area-main': '', 'inputText': '' };
        }
        chatAreaMainDiv.innerHTML = users[keyValue]['chatState']['chat-area-main'];
        inputText.value = users[keyValue]['chatState']['inputText'];
    } else {
        if (!groups[keyValue]['chatState']) {
            groups[keyValue]['chatState'] = { 'chat-area-main': '', 'inputText': '' };
        }
        chatAreaMainDiv.innerHTML = groups[keyValue]['chatState']['chat-area-main'];
        inputText.value = groups[keyValue]['chatState']['inputText'];
    }

}

function createGroupDiv(menuConversas, group, group_id, currentUser) {
    const div = document.createElement('div');
    div.classList.add('msg');
    div.dataset.group = group_id;
    div.innerHTML = `
        <img class="msg-profile" src="${group.imageURL}" alt="" />
        <div class="msg-detail">
            <div class="msg-username">${group.name}</div>
            <div class="group-action-buttons"></div>
        </div>
    `;
    menuConversas.append(div);

    initializeGroupChatStates(group_id, group);

    div.addEventListener('click', () => {
        document.getElementById('hallEntrada').style.display = 'none';
        handleGroupClick(div, group, group_id, currentUser);
    });

}


function updateGroupConversations(menuConversas, conversas, data, currentUser) {
    for (let group_id in data) {
        let group = data[group_id];
        let groupDiv = getChatDiv(conversas, group_id, 'group');
        groups[group_id] = group;

        if (groupDiv) {
            groups[group_id] = group;
            if (lastSelectedGroupDiv === groupDiv && detailsIsOpened()){
                showGroupDetails(group_id);
                showEntryRequests(group_id);
            }
        } else {
            createGroupDiv(menuConversas, group, group_id, currentUser);
        }
    }
}

function initializeGroupChatStates(group_id, group) {
    groups[group_id]['chatState'] = { 'chat-area-main': '', 'inputText': '' };

    if (group['messages']) {
        group['messages'].forEach(message => {
            const messageElement = createGroupMessageElement(message);
            groups[group_id]['chatState']['chat-area-main'] += messageElement;
        });
    }
}

function createGroupMessageElement(message) {
    let sender = message.sender;
    let timestamp = message.timestamp;
    let messageContent = message.message;
    let messageClass = 'chat-msg';

    if (sender !== currentUser) {
        messageClass += ' owner';
    }

    return `
        <div class="${messageClass}">
            <div class="chat-msg-profile">
                <img class="chat-msg-img" src="${users[sender]['profileImage']}" alt="" />
                <div class="chat-msg-date">Mensagem enviada ${timestamp}</div>
            </div>
            <div class="chat-msg-content">
                <div class="chat-msg-text">${messageContent}</div>
            </div>
        </div>
    `;
}

function handleGroupClick(div, group, group_id, currentUser) {
    hideDetails();

    let chatAreaMainDiv = document.querySelector('.chat-area-main');
    let inputText = document.getElementById('inputText');

    const actionButtonsDiv = div.querySelector('.group-action-buttons');
    actionButtonsDiv.innerHTML = '';

    if (lastSelectedGroupDiv && currentConversationType === 'group') {
        const previousGroup = lastSelectedGroupDiv.dataset.group;
        saveCurrentChatState(previousGroup, chatAreaMainDiv, inputText);
        lastSelectedGroupDiv.classList.remove('active');
    }

    setConversationType('group', group_id);
    restoreChatState(group_id, chatAreaMainDiv, inputText);
    document.getElementById('chat-area-title').innerText = group.name;
    document.getElementById('chat-user-image').src = group.imageURL;

    lastSelectedGroupDiv = div;
    div.classList.add('active');

    if (!group.users.includes(currentUser) && !group.requests.includes(currentUser)) {
        const requestButton = document.createElement('button');
        requestButton.classList.add('request-entry-button');
        requestButton.innerText = 'Solicitar entrada';
        requestButton.addEventListener('click', () => {
            requestGroupEntry(group_id, currentUser);
        });
        actionButtonsDiv.appendChild(requestButton);
    } else if (group.requests.includes(currentUser)) {
        const requestStatus = document.createElement('div');
        requestStatus.classList.add('request-status');
        requestStatus.innerText = 'Solicitação pendente';
        actionButtonsDiv.appendChild(requestStatus);
    }

    document.dispatchEvent(new CustomEvent('groupChatStarted', { detail: { groupName: group.name } }));
}

function requestGroupEntry(groupId, currentUser) {
    fetch('/api/request_group_entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_id: groupId,
            username: currentUser
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                let groupActionDiv = lastSelectedGroupDiv.querySelector('.group-action-buttons');
                groupActionDiv.innerHTML = '<div className="request-status">Solicitação pendente</div>';
                groups[groupId].requests.push(currentUser);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao solicitar entrada no grupo:', error);
            alert('Erro ao solicitar entrada no grupo. Verifique o console para mais detalhes.');
        });
}

    // Função para mostrar os pedidos de entrada
function showEntryRequests(group_id, justUpdate=false) {
    toogleGroupEntrada(group_id, justUpdate);

    let requests = groups[group_id].requests;
    // Adiciona eventos de aceitar e recusar pedidos de entrada
    const entryRequests = document.getElementById('detail-pedidos-group').querySelectorAll('.contact');
    entryRequests.forEach(requestDiv => {
        const acceptIcon = requestDiv.querySelector('#aceita');
        const rejectIcon = requestDiv.querySelector('#remove');

        acceptIcon.addEventListener('click', () => {
            acceptRequest(group_id, requestDiv.querySelector('.contact-username').textContent);
        });

        rejectIcon.addEventListener('click', () => {
            declineRequest(group_id, requestDiv.querySelector('.contact-username').textContent);
        });
    });
}

// Função para mostrar detalhes do grupo
function showGroupDetails(group_id) {
    let group = groups[group_id];
    const detailArea = document.getElementById('detail-area');

    // Atualiza os detalhes do grupo
    const titleElement = detailArea.querySelector('.detail-title');
    titleElement.textContent = group.name;

    const subtitleElement = detailArea.querySelector('.detail-subtitle');
    subtitleElement.textContent = `Created by ${group.admin}`;

    let imgProfileGroup = document.getElementById('detail-group-icon');
    imgProfileGroup.src = group.imageURL;


    // Exibe a área de detalhes de pedidos de entrada
    const detailButtons = detailArea.querySelector('.detail-buttons');
    const button = document.createElement('button');
    button.classList.add('detail-button');
    button.innerHTML = `
        <span class="material-symbols-outlined">
            list
        </span>
        Pedidos de entrada
    `;
    button.addEventListener('click', () => {
        showEntryRequests(group_id); // Mostra os pedidos de entrada ao clicar no botão
    });
    detailButtons.innerHTML = ''; // Limpa botões anteriores (caso haja)
    detailButtons.appendChild(button);

    // Exibe a lista de membros do grupo
    const detailGroup = document.getElementById('detail-group');
    detailGroup.innerHTML = ''; // Limpa a lista de membros anteriores (caso haja)
    group.users.forEach(user => {
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('contact', 'online'); // Adapte as classes conforme necessário
        memberDiv.innerHTML = `
            <img class="contact-profile" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3364143/download+%281%29.png" alt="" />
            <div class="contact-detail">
                <div class="contact-username">${user}</div>
            </div>
            <div class="contact-icon-remove">
                <span class="material-symbols-outlined" data-group="${group.name}" data-user="${user}">
                    do_not_disturb_on
                </span>
            </div>
        `;
        detailGroup.appendChild(memberDiv);

        // Adiciona evento para remover usuário do grupo (somente admin)
        if (user !== group.admin) { // Não permite remover o próprio admin
            const removeIcon = memberDiv.querySelector('.contact-icon-remove');
            removeIcon.addEventListener('click', () => {
                if (confirm(`Tem certeza que deseja remover ${user} do grupo ${group.name}?`)) {
                    removeUserFromGroup(group.name, user);
                }
            });
        } else {
            const removeIcon = memberDiv.querySelector('.contact-icon-remove');
            removeIcon.remove(); // Remove o botão de remoção do admin
            const contactDetail = memberDiv.querySelector('.contact-detail');
            const adminMessage = document.createElement('div');
            adminMessage.classList.add('admin-message');
            adminMessage.textContent = 'Admin';
            contactDetail.appendChild(adminMessage);
        }
    });
}

function showUserDetails(username){
    let user = users[username];
    let detailArea = document.getElementById('detail-area');

    // Atualiza os detalhes do grupo
    let titleElement = detailArea.querySelector('.detail-title');
    titleElement.textContent = user.displayName;

    let subtitleElement = detailArea.querySelector('.detail-subtitle');
    subtitleElement.textContent = `${username}`;

    let imgProfileGroup = document.getElementById('detail-group-icon');
    imgProfileGroup.src = user.profileImage;
}

// Função para aceitar pedido de entrada no grupo
function acceptRequest(groupId, username) {
    fetch('/api/accept_request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_id: groupId,
            username: username
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao aceitar pedido:', error);
            alert('Erro ao aceitar pedido. Verifique o console para mais detalhes.');
        });
}

// Função para recusar pedido de entrada no grupo
function declineRequest(groupId, username) {
    fetch('/api/decline_request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_id: groupId,
            username: username
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao recusar pedido:', error);
            alert('Erro ao recusar pedido. Verifique o console para mais detalhes.');
        });
}

// Função para remover usuário do grupo (somente admin)
function removeUserFromGroup(groupName, username) {
    fetch('/api/remove_user_from_group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_name: groupName,
            username: username
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                let group_id = data.group_id;
                showGroupDetails(group_id);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao remover usuário do grupo:', error);
            alert('Erro ao remover usuário do grupo. Verifique o console para mais detalhes.');
        });
}




// Função para iniciar ou entrar em uma sala privada ao clicar em uma conversa


// Função para limpar mensagens na área de chat principal
function clearChatAreaMain() {
    const chatAreaMain = document.querySelector('.chat-area-main');
    chatAreaMain.innerHTML = ''; // Limpa o conteúdo da área de chat principal
}

let currentConversationType = 'user'; // Inicialmente configurado para conversa com usuário
let currentChatTarget = ''; // Variável para armazenar o nome do grupo ou usuário atual

// Função para mudar o tipo de conversa
function setConversationType(type, target) {
    if (type === 'user' && lastSelectedGroupDiv){
        lastSelectedGroupDiv.classList.remove('active');
    } else if (type === 'group' && lastSelectedUserDiv) {
        lastSelectedUserDiv.classList.remove('active');
    }

    currentConversationType = type;
    currentChatTarget = target;
}

function loadAndDisplayMessages(user1, user2) {
    fetch(`/api/messages/${user1}/${user2}`)
        .then(response => response.json())
        .then(messages => {
            // Garantir que messages seja uma array
            if (!Array.isArray(messages)) {
                messages = [];
            }

            // Limpa a área de chat principal
            clearChatAreaMain();
            // Exibe cada mensagem na área de chat
            messages.forEach(message => {
                const {sender, message: msg} = message;
                const currentTime = new Date().toLocaleTimeString();
                let messageClass = 'chat-msg';

                // A mensagem deve ser classificada como 'owner' se o remetente for o usuário atual
                if (sender !== currentChatTarget) {
                    messageClass += ' owner';
                }

                const messageElement = `
                    <div class="${messageClass}">
                        <div class="chat-msg-profile">
                            <img class="chat-msg-img" src="icone_usuario.png" alt="" /> <!-- Ícone do usuário ou grupo aqui -->
                            <div class="chat-msg-date">Mensagem enviada ${currentTime}</div>
                        </div>
                        <div class="chat-msg-content">
                            <div class="chat-msg-text">${msg}</div>
                        </div>
                    </div>
                `;

                chatAreaMain.insertAdjacentHTML('beforeend', messageElement);
            });

            // Rolagem automática para a parte inferior do chat
            chatAreaMain.scrollTop = chatAreaMain.scrollHeight;
        })
        .catch(error => console.error('Error fetching messages:', error));
}

// Função para carregar e exibir mensagens de grupo
function loadAndDisplayGroupMessages(currentUser, groupName) {
    fetch(`/api/messages/group/${groupName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar mensagens do grupo');
            }
            return response.json();
        })
        .then(messages => {
            // Limpa a área de chat principal
            clearChatAreaMain();
            // Exibe cada mensagem na área de chat
            messages.forEach(message => {
                const { sender, message: msg } = message;
                const currentTime = new Date().toLocaleTimeString();
                let messageClass = 'chat-msg';
                // A mensagem deve ser classificada como 'owner' se o remetente for o usuário atual
                if (sender === localStorage.getItem('username')) {
                    messageClass += ' owner';
                }

                const messageElement = `
                    <div class="${messageClass}">
                        <div class="chat-msg-profile">
                            <img class="chat-msg-img" src="icone_grupo.png" alt="" /> <!-- Ícone do grupo aqui -->
                            <div class="chat-msg-date">Mensagem enviada ${currentTime}</div>
                        </div>
                        <div class="chat-msg-content">
                            <div class="chat-msg-text">${msg}</div>
                        </div>
                    </div>
                `;

                chatAreaMain.insertAdjacentHTML('beforeend', messageElement);
            });

            // Rolagem automática para a parte inferior do chat
            chatAreaMain.scrollTop = chatAreaMain.scrollHeight;
        })
        .catch(error => console.error('Erro ao carregar mensagens do grupo:', error));
}

// Evento para selecionar e enviar arquivos
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('file-upload-icon').addEventListener('click', function() {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            // Aqui você pode adicionar o código para enviar o arquivo
        }
    });
});

function updateGroupRequests(data){
    let group_id = data['id'];
    let request_username = data['username'];
    let user = users[request_username];

    groups[group_id]['requests'].push(request_username);
    if (lastSelectedGroupDiv && currentConversationType === 'group'){
        const requestDiv = document.createElement('div');
            requestDiv.classList.add('contact');
            requestDiv.innerHTML = `
                <img class="contact-profile"
                    src="${user.profileImage}" alt="" />
                <div class="contact-detail">
                    <div class="contact-username">${request_username}</div>
                </div>
                <div class="contact-icon">
                    <span id="aceita" class="material-symbols-outlined">
                        check
                    </span>
                </div>
                <div class="contact-icon">
                    <span id="remove" class="material-symbols-outlined">
                        do_not_disturb_on
                    </span>
                </div>
            `;
        document.getElementById('detail-pedidos-group').appendChild(requestDiv);
    }
}