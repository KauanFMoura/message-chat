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
