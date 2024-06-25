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
window.onload = function() {
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
    const concludeBtn = document.getElementById('conclude-btn');
    const buttonCancelDetail = document.querySelector('#button-cancel .button-cancel-username');

    if (selectionMode) {
        buttonCancelDetail.innerText = "Cancelar";
        concludeBtn.classList.add('active');
        contacts.forEach(contact => {
            contact.addEventListener('click', handleContactClick);
        });
    } else {
        buttonCancelDetail.innerText = "Fechar";
        concludeBtn.classList.remove('active');
        contacts.forEach(contact => {
            contact.classList.remove('selected');
            contact.removeEventListener('click', handleContactClick);
        });
        selectedContacts = [];
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
        contacts.forEach(contact => {
            contact.classList.remove('selected');
            contact.removeEventListener('click', handleContactClick);
        });
        selectedContacts = [];
        document.getElementById('conclude-btn').classList.remove('active');
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
