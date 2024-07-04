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
    var detailAreaPessoal = document.getElementById('detail-area-pessoal');
    var menuContato = document.getElementById('menu-contact');


    if (window.innerWidth >= 780) {
        menu.style.display = 'block';
        logoElement.onclick = null; // Remove a função onclick
        menuContato.style.display = 'none';
    } else if (window.innerWidth < 780) {
        menu.style.display = 'none';
        logoElement.onclick = toggleMenuConversa; // Adiciona a função onclick
        detailArea.style.display = 'none';
        detailAreaPessoal.style.display = 'none';
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
        document.getElementById('hallEntrada').style.display = 'none';
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

function getProfileImageURL(data) {
    if ('profileImage' in data){
        if (data['profileImage'] != null){
            return data['profileImage'];
        } else {
            return defaultProfileImage;
        }
    } else if ('imageURL' in data) {
        if (data['imageURL'] != null){
            return data['imageURL'];
        } else {
            return defaultGroupImage;
        }
    }
}


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

function toogleGroupEntrada(group_id, justUpdate=false) {
    let group = groups[group_id];
    let groupEntrada = document.getElementById('detail-pedidos-group');
    let detailGroup = document.getElementById('detail-group');

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
                    src="${getProfileImageURL(user)}" alt="" />
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
    let detailAreaPessoal = document.getElementById('detail-area-pessoal');
    return detailArea.style.display === 'flex' || detailAreaPessoal.style.display === 'flex';
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
    const detailAreaPessoal = document.getElementById('detail-area-pessoal');
    const detailGroup = document.getElementById('detail-group');

    detailAreaPessoal.style.display = 'none';  // Esconde a área de detalhes
    detailArea.style.display = 'none';  // Esconde a área de detalhes
    if (detailGroup.style.display === 'none') {
        toogleGroupEntrada();
    }
    hideEntryRequests();
}

function getRandomHexColor() {
    // Gera um número aleatório entre 0 e 16777215 (0xFFFFFF)
    const randomNum = Math.floor(Math.random() * 16777215);
    // Converte o número para uma string hexadecimal e preenche com zeros à esquerda se necessário
    const hexColor = `#${randomNum.toString(16).padStart(6, '0')}`;
    return hexColor;
}


function showDetails(type, keyValue) {
    var detailArea = document.getElementById('detail-area');
    var detailAreaPessoal = document.getElementById('detail-area-pessoal');
    var detailAreaUsuario = document.getElementById('detail-area-usuario');

    if (detailArea.style.display === 'flex' || detailAreaPessoal.style.display === 'flex' || detailAreaUsuario.style.display === 'flex') {
        detailArea.style.display = 'none';
        detailAreaPessoal.style.display = 'none';
        detailAreaUsuario.style.display = 'none';
    } else {
        if (type === 'group'){
            showGroupDetails(keyValue);
            detailArea.style.display = 'flex';
            detailAreaPessoal.style.display = 'none';
            detailAreaUsuario.style.display = 'none';
        } else if(type === 'user'){
            showUserDetails(keyValue);
            detailAreaPessoal.style.display = 'flex';
            detailArea.style.display = 'none';
            detailAreaUsuario.style.display = 'none';
        }
    }
}
// Evento show detalhes pessoal
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#config').addEventListener('click', function() {
        let detailAreaUsuario = document.getElementById('detail-area-usuario');
        if (detailsIsOpened()){
            hideDetails();
        }
        if (detailAreaUsuario.style.display === 'flex') {
            detailAreaUsuario.style.display = 'none';
        } else {
            detailAreaUsuario.style.display = 'flex';
        }
    });
});

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
let lastSelectedGroupDiv = null;
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
            users[username]['color'] = getRandomHexColor();

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
            document.getElementById('chat-header-contact-profile').classList.remove('online');
        }
    });
    hideDetails();
}

function updateOnlineStatus(usuarioDiv, user) {
    if (user.online) {
        usuarioDiv.classList.add('online');
        document.getElementById('chat-header-contact-profile').classList.add('online');
        document.getElementById('status-title').textContent = 'Online';
    } else {
        usuarioDiv.classList.remove('online');
        document.getElementById('chat-header-contact-profile').classList.remove('online');
        document.getElementById('status-title').display = 'none';
    }
}


function createUserDiv(menuConversas, user, username, currentUser) {
    const div = document.createElement('div');
    div.classList.add('msg');
    if (user.online) div.classList.add('online');
    div.dataset.user = username;
    div.innerHTML = `
        <img class="msg-profile" src="${getProfileImageURL(user)}" alt="" />
        <div class="msg-detail">
            <div class="msg-username">${user.displayName}</div>
        </div>
    `;
    menuConversas.append(div);

    initializeChatStates(username, user);

    div.addEventListener('click', () => {
        document.getElementById('hallEntrada').style.display = 'none';
        handleUserClick(div, username, user.displayName);
        document.getElementById('chatArea').style.display = 'flex';
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
    let file_uuid = message.file_uuid;

    let messageClass = 'chat-msg';
    let isMessageOwner = sender === username;

    if (isMessageOwner) {
        messageClass += ' owner';
    }

    if (file_uuid === null) {
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
    } else {
        return `
            <div class="${messageClass}">
                <div class="chat-msg-profile">
                    <div class="chat-msg-date">Mensagem enviada ${timestamp}</div>
                </div>
                <div class="chat-msg-content">
                    <div class="chat-msg-text">
                        <div class="chat-msg-text">Arquivo: <a href="/api/get_file/${file_uuid}" class="download-link">${messageContent}</a></div>
                        
                    </div>
                </div>
            </div>
            `;
    }
}

function getInitials(name) {
    name = name.trim();
    let firstInitial = name[0];
    let lastSpaceIndex = name.lastIndexOf(" ");
    let lastInitial = lastSpaceIndex !== -1 ? name[lastSpaceIndex + 1] : name[name.length - 1];
    return (firstInitial + lastInitial).toUpperCase();
}

function createGroupMessageElement(message, username) {
    let sender = message.sender;
    let timestamp = message.timestamp;
    let messageContent = message.message;
    let file_uuid = message.file_uuid;

    let messageClass = 'chat-msg';
    let isMessageOwner = sender === username;

    if (isMessageOwner) {
        messageClass += ' owner';
    }

    let newDiv = document.createElement('div');
    newDiv.className = messageClass;

    let chatMessageProfileDiv = document.createElement('div');
    chatMessageProfileDiv.className = 'chat-msg-profile';

    let chatProfileImgDiv = document.createElement('div');

    if(!isMessageOwner){
        if (users[sender]['profileImage'] == null){
            chatProfileImgDiv.className = 'user-icon';
            chatProfileImgDiv.style.backgroundColor = users[sender]['color'];
            chatProfileImgDiv.textContent = getInitials(users[sender].displayName);
    }   else {
            chatProfileImgDiv.className = 'chat-msg-img';
            chatMessageProfileDiv.innerHTML = `<img class="chat-msg-img" src="${users[sender].profileImage}" alt="" />`;
        }
        chatMessageProfileDiv.appendChild(chatProfileImgDiv);
    }

    let chatMessageDateDiv = document.createElement('div');
    chatMessageDateDiv.className = 'chat-msg-date';
    chatMessageDateDiv.textContent = `Mensagem enviada ${timestamp}`;
    chatMessageProfileDiv.appendChild(chatMessageDateDiv);

    newDiv.appendChild(chatMessageProfileDiv);

    let chatMessageTextDiv = document.createElement('div');
    chatMessageTextDiv.className = 'chat-msg-text';

    if(file_uuid !== null){
        chatMessageTextDiv.innerHTML = `Arquivo: <a href="/api/get_file/${file_uuid}" class="download-link">${messageContent}</a>`;
    } else {
        chatMessageTextDiv.textContent = messageContent;
    }

    let chatMessageContentDiv = document.createElement('div');
    chatMessageContentDiv.className = 'chat-msg-content';

    chatMessageContentDiv.appendChild(chatMessageTextDiv);

    newDiv.appendChild(chatMessageContentDiv);

    return newDiv.outerHTML;
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

    if (logoElement.onclick != null) {
        toggleMenuConversa();
    }

    let lastElement = chatAreaMainDiv.lastElementChild;
    if (lastElement) {
        chatAreaMainDiv.lastElementChild.scrollIntoView({behavior: 'smooth'});
    }
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
        <img class="msg-profile" src="${getProfileImageURL(group)}" alt="" />
        <div class="msg-detail">
            <div class="msg-username">${group.name}</div>
            <div class="group-action-buttons"></div>
        </div>
    `;
    menuConversas.append(div);

    initializeGroupChatStates(group_id, group);

    div.addEventListener('click', () => {
        document.getElementById('hallEntrada').style.display = 'none';
        handleGroupClick(div, group_id, currentUser);
        document.getElementById('chatArea').style.display = 'flex';
    });

}

function updateGroupConversations(menuConversas, conversas, data, currentUser) {
    for (let group_id in data) {
        let group = data[group_id];
        let groupDiv = getChatDiv(conversas, group_id, 'group');
        groups[group_id] = group;

        if (groupDiv) {
            groups[group_id] = group;

            if (lastSelectedGroupDiv === groupDiv && detailsIsOpened() && lastSelectedGroupDiv.dataset.group == group_id){
                showGroupDetails(group_id);
                showEntryRequests(group_id, true);
            }
            let actionButtonsDiv = groupDiv.querySelector('.group-action-buttons');
                actionButtonsDiv.innerHTML = '';

        } else {
            createGroupDiv(menuConversas, group, group_id, currentUser);
        }
    }
}

function initializeGroupChatStates(group_id, group) {
    groups[group_id]['chatState'] = { 'chat-area-main': '', 'inputText': '' };

    if (group['messages']) {
        group['messages'].forEach(message => {
            const messageElement = createGroupMessageElement(message, currentUser);
            groups[group_id]['chatState']['chat-area-main'] += messageElement;
        });
    }
}


function handleGroupClick(div, group_id, currentUser) {
    hideDetails();
    let group = groups[group_id];
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

    document.getElementById('chat-user-image').src = getProfileImageURL(group);
    document.getElementById('chat-header-contact-profile').classList.remove('online');
    document.getElementById('status-title').textContent = '';


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

    if (logoElement.onclick != null) {
        toggleMenuConversa();
    }

    let lastElement = chatAreaMainDiv.lastElementChild;
    if (lastElement) {
        chatAreaMainDiv.lastElementChild.scrollIntoView({behavior: 'smooth'});
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
    const titleElement = detailArea.querySelector('.detail-title');
    titleElement.textContent = group.name;
    const subtitleElement = detailArea.querySelector('.detail-subtitle');
    subtitleElement.textContent = `Created by ${group.admin}`;
    let imgProfileGroup = document.getElementById('detail-group-icon');
    imgProfileGroup.src = getProfileImageURL(group);

    // Exibe a área de detalhes de pedidos de entrada
    const detailButtons = detailArea.querySelector('.detail-buttons');
    const buttonEntrada = document.createElement('button');
    const buttonSair = document.createElement('button');
    buttonEntrada.classList.add('detail-button');
    buttonEntrada.innerHTML = `
        <span class="material-symbols-outlined">
            list
        </span>
        Pedidos de entrada
    `;

    buttonSair.classList.add('detail-button');
    buttonSair.id = 'button-close-admin';
    buttonSair.innerHTML =
        `<span class="material-symbols-outlined">
            logout
        </span>
        Sair do Grupo
    `;
    buttonEntrada.addEventListener('click', () => {
        showEntryRequests(group_id); // Mostra os pedidos de entrada ao clicar no botão
    });

    buttonSair.addEventListener('click', () => {
        leaveGroup(group_id);
    });

    detailButtons.innerHTML = ''; // Limpa botões anteriores (caso haja)
    detailButtons.appendChild(buttonEntrada);
    detailButtons.appendChild(buttonSair);


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
                    removeUserFromGroup(group_id, user);
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

function leaveGroup(group_id) {
    fetch('/api/leave_group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_id: group_id,
            username: currentUser
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Você saiu do grupo com sucesso.');
                hideDetails();
                lastSelectedGroupDiv.remove();
                lastSelectedGroupDiv = null;
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao sair do grupo:', error);
            alert('Erro ao sair do grupo. Verifique o console para mais detalhes.');
        });
}

function showUserDetails(username){
    let user = users[username];
    let detailArea = document.getElementById('detail-area-pessoal');

    // Atualiza os detalhes do grupo
    let titleElement = detailArea.querySelector('#detail-pessoal-name');
    titleElement.textContent = user.displayName;

    let subtitleElement = detailArea.querySelector('#detail-pessoal-username');
    subtitleElement.textContent = `${username}`;

    let recadoElement = detailArea.querySelector('#detail-recado');
    recadoElement.textContent = user.status;

    let imgProfileGroup = document.getElementById('detail-pessoal-icon');
    imgProfileGroup.src = getProfileImageURL(user);

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
                let groups = data.groups;
                alert(data.message);
            }
            if (data.groups) {
                console.log("Group from response:", data.group);
                updateConversationMenu('conversas-grupos', data.groups, currentUser, socket);
            }
        })
        .catch(error => {
            console.error('Erro ao aceitar pedido:', error);
            alert('Erro ao aceitar pedido. Verifique o console para mais detalhes.');
            return null;
        })
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
function removeUserFromGroup(groupId, username) {
    fetch('/api/remove_user_from_group', {
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

// Evento para selecionar e enviar arquivos
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('file-upload-icon').addEventListener('click', function() {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            let messageType = currentConversationType;
            // Enviar o arquivo para o servidor via AJAX (usando Fetch API)
            const formData = new FormData();
            formData.append('file', file);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (messageType === 'user'){
                    sendMessage(data.filename, data.file_uuid);
                } else if (messageType === 'group'){
                    sendGroupMessage(data.filename, data.file_uuid);
                }

            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        }
    });
});

function updateGroupRequests(data){
    let group_id = data['id'];
    let request_username = data['username'];
    let user = users[request_username];

    groups[group_id]['requests'].push(request_username);
    if (lastSelectedGroupDiv && currentConversationType === 'group' && lastSelectedGroupDiv.dataset.group === group_id){
        const requestDiv = document.createElement('div');
            requestDiv.classList.add('contact');
            requestDiv.innerHTML = `
                <img class="contact-profile"
                    src="$" alt="" />
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


// Evento para editar imagem de perfil
document.addEventListener('DOMContentLoaded', function () {
    const uploadImage = document.getElementById('edit-upload-image');
    const image = document.getElementById('image');
    const cropper = new Cropper(image, {
        aspectRatio: 1 / 1, // Define a proporção de aspecto desejada (opcional)
        viewMode: 1,        // Define o modo de visualização (opcional)
    });

    document.getElementById('edit-perfil-image').addEventListener('click', function () {
        document.getElementById('edit-upload-image').click();
    });

    uploadImage.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                image.src = e.target.result;
                image.style.display = 'block';
                document.getElementById('overlay-edit').style.display = 'flex'; // Mostra o overlay
                cropper.replace(e.target.result); // Define a imagem no Cropper.js
                document.getElementById('crop-button').style.display = 'block'; // Mostra botão de salvar
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('crop-button').addEventListener('click', function () {
        // Obtenha o recorte da imagem
        const canvas = cropper.getCroppedCanvas({
            maxWidth: 300,
            maxHeight: 300,
        });

        if (canvas) {
            canvas.toBlob(function (blob) {
                // Aqui você pode enviar o blob para o servidor ou fazer o que for necessário
                const formData = new FormData();
                formData.append('croppedImage', blob, 'cropped_image.png');

                // Armazena a URL da imagem cortada no campo oculto
                const croppedImageURL = canvas.toDataURL(); // Obtém a URL da imagem cortada em formato base64
                document.getElementById('cropped-image-url').value = croppedImageURL;

                // Esconde o Cropper e o overlay após salvar
                document.getElementById('overlay-edit').style.display = 'none';
                image.style.display = 'none';
                document.getElementById('crop-button').style.display = 'none';
            });
        }
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const uploadImage = document.getElementById('edit-upload-image-usu');
    const image = document.getElementById('image');
    const cropper = new Cropper(image, {
        aspectRatio: 1 / 1, // Define a proporção de aspecto desejada (opcional)
        viewMode: 1,        // Define o modo de visualização (opcional)
    });

    document.getElementById('edit-perfil-image-usu').addEventListener('click', function () {
        document.getElementById('edit-upload-image-usu').click();
    });

    uploadImage.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                image.src = e.target.result;
                image.style.display = 'block';
                document.getElementById('overlay-edit').style.display = 'flex'; // Mostra o overlay
                cropper.replace(e.target.result); // Define a imagem no Cropper.js
                document.getElementById('crop-button').style.display = 'block'; // Mostra botão de salvar
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('crop-button').addEventListener('click', function () {
        // Obtenha o recorte da imagem
        const canvas = cropper.getCroppedCanvas({
            maxWidth: 300,
            maxHeight: 300,
        });

        if (canvas) {
            canvas.toBlob(function (blob) {
                // Aqui você pode enviar o blob para o servidor ou fazer o que for necessário
                const formData = new FormData();
                formData.append('croppedImage', blob, 'cropped_image.png');

                // Armazena a URL da imagem cortada no campo oculto
                const croppedImageURL = canvas.toDataURL(); // Obtém a URL da imagem cortada em formato base64
                document.getElementById('cropped-image-url').value = croppedImageURL;

                // Esconde o Cropper e o overlay após salvar
                document.getElementById('overlay-edit').style.display = 'none';
                image.style.display = 'none';
                document.getElementById('crop-button').style.display = 'none';
            });
        }
    });
});

