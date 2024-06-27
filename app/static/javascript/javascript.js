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
        console.log(contactName)
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

function toogleGroupEntrada(group) {
    var groupEntrada = document.getElementById('detail-pedidos-group');
    var detailGroup = document.getElementById('detail-group');

    // Limpa a lista de pedidos de entrada
    groupEntrada.innerHTML = '';

    if (groupEntrada.style.display === 'block') {
        groupEntrada.style.display = 'none';
        detailGroup.style.display = 'block';
    } else {
        groupEntrada.style.display = 'block';
        detailGroup.style.display = 'none';

        // Mostra os pedidos de entrada do grupo atual
        group.requests.forEach(request => {
            const requestDiv = document.createElement('div');
            requestDiv.classList.add('contact');
            requestDiv.innerHTML = `
                <img class="contact-profile"
                    src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3364143/download+%2812%29.png" alt="" />
                <div class="contact-detail">
                    <div class="contact-username">${request}</div>
                </div>
                <div class="contact-icon-aceita">
                    <span id="aceita" class="material-symbols-outlined">
                        check
                    </span>
                </div>
                <div class="contact-icon-reject">
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


// Função para adicionar uma nova pessoa na área de conversas
// Função para atualizar a lista de conversas com base no tipo (usuário ou grupo)
function updateConversationMenu(type, data, currentUser, socket) {
    const menuConversas = document.getElementById('conversas');
    const conversas = menuConversas.getElementsByClassName('msg');

    // Limpa as conversas existentes
    Array.from(conversas).forEach((conversa) => {
        conversa.remove();
    });

    // Adiciona usuários na lista de conversas se o tipo for 'user'
    if (type === 'user') {
        data.forEach(user => {
            if (user !== currentUser) {
                const div = document.createElement('div');
                div.classList.add('msg');
                div.dataset.user = user; // Adiciona um atributo de dados para identificar o usuário
                div.innerHTML = `
                    <img class="msg-profile" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3364143/download+%281%29.png" alt="" />
                    <div class="msg-detail">
                        <div class="msg-username">${user}</div>
                    </div>
                `;
                menuConversas.append(div);

                // Adiciona um evento de clique para iniciar uma conversa privada
                div.addEventListener('click', () => {
                    startPrivateChat(currentUser, user, socket);
                    document.getElementById('chat-area-title').innerText = user;
                    hideGroupDetails(); // Esconde os detalhes do grupo ao clicar em uma pessoa
                });
            }
        });
        hideGroupDetails(); // Garante que os detalhes do grupo sejam escondidos ao alternar para 'user'
    }

    // Adiciona grupos na lista de conversas se o tipo for 'group'
    else if (type === 'group') {
        data.forEach(group => {
            const div = document.createElement('div');
            div.classList.add('msg');
            div.dataset.group = group.name; // Adiciona um atributo de dados para identificar o grupo
            div.innerHTML = `
                <img class="msg-profile" src="icone_grupo.png" alt="" /> <!-- Adicione o ícone do grupo aqui -->
                <div class="msg-detail">
                    <div class="msg-username">${group.name}</div>
                    <div class="group-action-buttons"></div>
                </div>
            `;
            menuConversas.append(div);

            // Adiciona um evento de clique para iniciar uma conversa em grupo
            div.addEventListener('click', () => {
                startGroupChat(currentUser, group.name, socket);
                document.getElementById('chat-area-title').innerText = group.name;
                showGroupDetails(group); // Mostra os detalhes do grupo ao clicar no grupo

                // Verifica se o usuário pode solicitar entrada no grupo
                const actionButtonsDiv = div.querySelector('.group-action-buttons');
                actionButtonsDiv.innerHTML = ''; // Limpa quaisquer botões existentes

                if (!group.users.includes(currentUser) && !group.requests.includes(currentUser)) {
                    const requestButton = document.createElement('button');
                    requestButton.classList.add('request-entry-button');
                    requestButton.innerText = 'Solicitar entrada';
                    requestButton.addEventListener('click', () => {
                        requestGroupEntry(group.name, currentUser);
                    });
                    actionButtonsDiv.appendChild(requestButton);
                } else if (group.requests.includes(currentUser)) {
                    const requestStatus = document.createElement('div');
                    requestStatus.classList.add('request-status');
                    requestStatus.innerText = 'Solicitação pendente';
                    actionButtonsDiv.appendChild(requestStatus);
                }
            });
        });
    }
}

function requestGroupEntry(groupName, currentUser) {
    fetch('/api/request_group_entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_name: groupName,
            username: currentUser
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Solicitação enviada com sucesso.');
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao solicitar entrada no grupo:', error);
            alert('Erro ao solicitar entrada no grupo. Verifique o console para mais detalhes.');
        });
}


// Função para mostrar detalhes do grupo
function showGroupDetails(group) {
    const detailArea = document.getElementById('detail-area');
    detailArea.style.display = 'block';  // Mostra a área de detalhes

    // Atualiza os detalhes do grupo
    const titleElement = detailArea.querySelector('.detail-title');
    titleElement.textContent = group.name;

    const subtitleElement = detailArea.querySelector('.detail-subtitle');
    subtitleElement.textContent = `Created by ${group.admin}`;

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
        showEntryRequests(group.requests); // Mostra os pedidos de entrada ao clicar no botão
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

    // Função para mostrar os pedidos de entrada
    function showEntryRequests(requests) {
        toogleGroupEntrada(group);
        console.log('Pedidos de entrada:', requests);

        // Adiciona eventos de aceitar e recusar pedidos de entrada
        const entryRequests = document.getElementById('detail-pedidos-group').querySelectorAll('.contact');
        entryRequests.forEach(requestDiv => {
            const acceptIcon = requestDiv.querySelector('.contact-icon-aceita');
            const rejectIcon = requestDiv.querySelector('.contact-icon-reject');

            acceptIcon.addEventListener('click', () => {
                acceptRequest(group.name, requestDiv.querySelector('.contact-username').textContent);
            });

            rejectIcon.addEventListener('click', () => {
                declineRequest(group.name, requestDiv.querySelector('.contact-username').textContent);
            });
        });
    }
}

// Função para aceitar pedido de entrada no grupo
function acceptRequest(groupName, username) {
    fetch('/api/accept_request', {
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
                const updatedGroup = data.groups.find(g => g.name === groupName);
                showGroupDetails(updatedGroup);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao aceitar pedido:', error);
            alert('Erro ao aceitar pedido. Verifique o console para mais detalhes.');
        });
}

// Função para recusar pedido de entrada no grupo
function declineRequest(groupName, username) {
    fetch('/api/decline_request', {
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
                const updatedGroup = data.groups.find(g => g.name === groupName);
                showGroupDetails(updatedGroup);
            } else {
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
                const updatedGroup = data.groups.find(g => g.name === groupName);
                showGroupDetails(updatedGroup);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao remover usuário do grupo:', error);
            alert('Erro ao remover usuário do grupo. Verifique o console para mais detalhes.');
        });
}


// Função para esconder detalhes do grupo
function hideGroupDetails() {
    const detailArea = document.getElementById('detail-area');
    detailArea.style.display = 'none';  // Esconde a área de detalhes
}

// Função para iniciar ou entrar em uma sala privada ao clicar em uma conversa
function startPrivateChat(currentUser, otherUser, socket) {
    const room = `${currentUser}-${otherUser}`;

    // Emitir evento 'join_room' para o servidor
    socket.emit('join_room', {username: currentUser, room: room});
    setConversationType('user', otherUser);
    // Limpar a área de chat principal
    clearChatAreaMain();
    loadAndDisplayMessages(currentUser, otherUser);

    // Emitir evento personalizado para indicar que um novo usuário foi selecionado
    const event = new CustomEvent('privateChatStarted', {detail: {otherUser: otherUser}});
    document.dispatchEvent(event);

    // Retornar o outro usuário para o HTML
    return otherUser;
}

// Função para limpar mensagens na área de chat principal
function clearChatAreaMain() {
    const chatAreaMain = document.querySelector('.chat-area-main');
    chatAreaMain.innerHTML = ''; // Limpa o conteúdo da área de chat principal
}


function startGroupChat(currentUser, groupName, socket) {
    const room = `${groupName}`;

    // Emitir evento 'join_room' para o servidor
    socket.emit('join_group', {username: currentUser, group_name: groupName, room: room});
    setConversationType('group', groupName)
    // Limpar a área de chat principal
    clearChatAreaMain();
    loadAndDisplayGroupMessages(currentUser, groupName);

    // Emitir evento personalizado para indicar que um novo grupo foi selecionado
    const event = new CustomEvent('groupChatStarted', {detail: {groupName: groupName}});
    document.dispatchEvent(event);

    // Retornar o nome do grupo para o HTML
    return groupName;
}

let currentConversationType = 'user'; // Inicialmente configurado para conversa com usuário
let currentChatTarget = ''; // Variável para armazenar o nome do grupo ou usuário atual

// Função para mudar o tipo de conversa
function setConversationType(type, target) {
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
                            <div class="chat-msg-date">Mensagem vista ${currentTime}</div>
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
                console.log(sender, localStorage.getItem('username'))
                // A mensagem deve ser classificada como 'owner' se o remetente for o usuário atual
                if (sender === localStorage.getItem('username')) {
                    messageClass += ' owner';
                }

                const messageElement = `
                    <div class="${messageClass}">
                        <div class="chat-msg-profile">
                            <img class="chat-msg-img" src="icone_grupo.png" alt="" /> <!-- Ícone do grupo aqui -->
                            <div class="chat-msg-date">Mensagem vista ${currentTime}</div>
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