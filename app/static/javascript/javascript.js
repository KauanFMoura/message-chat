const toggleButton = document.querySelector('.dark-light');
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

toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

function mudouTamanho() {
    var menu = document.getElementById('menu-conversas');
    if (window.innerWidth >= 780) {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}
function toggleMenu() {
    var menu = document.getElementById('menu-conversas');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
    }
}