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

    if (window.innerWidth >= 780) {
        menu.style.display = 'block';
        logo.onclick = null; // Remove a função onclick
    } else if (window.innerWidth < 780) {
        menu.style.display = 'none';
        logo.onclick = toggleMenuConversa; // Adiciona a função onclick
        detailArea.style.display = 'none';
    } else if (window.innerWidth >= 1120) {
        detailArea.style.display = 'flex';
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
window.onload = function() {
    mudouTamanho(); // Verifica o tamanho da janela e aplica as mudanças necessárias
    window.onresize = mudouTamanho; // Adiciona um listener para o evento resize
};


// Função para adicionar uma nova pessoa na área de conversas
function updateConversationMenu(users, currentUser, socket) {
    const menuConversas = document.getElementById('menu-conversas');
    menuConversas.innerHTML = '';

    users.forEach(user => {
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
            menuConversas.appendChild(div);

            // Adiciona um evento de clique para iniciar uma conversa privada
            div.addEventListener('click', () => {
                startPrivateChat(currentUser, user, socket);
            });
        }
    });
}

// Função para iniciar ou entrar em uma sala privada ao clicar em uma conversa
function startPrivateChat(currentUser, otherUser, socket) {
    const room = `${currentUser}-${otherUser}`;

    // Emitir evento 'join_room' para o servidor
    socket.emit('join_room', { username: currentUser, room: room });

    // Limpar a área de chat principal
    clearChatAreaMain();

    // Emitir evento personalizado para indicar que um novo usuário foi selecionado
    const event = new CustomEvent('privateChatStarted', { detail: { otherUser: otherUser } });
    document.dispatchEvent(event);

    // Retornar o outro usuário para o HTML
    return otherUser;
}

// Função para limpar mensagens na área de chat principal
function clearChatAreaMain() {
    const chatAreaMain = document.querySelector('.chat-area-main');
    chatAreaMain.innerHTML = ''; // Limpa o conteúdo da área de chat principal
}