const API_BASE = 'api/';

function getToken() {
    return localStorage.getItem('flordosol-token');
}

function getUser() {
    const data = localStorage.getItem('flordosol-user');
    return data ? JSON.parse(data) : null;
}

async function login(email, senha) {
    const res = await fetch(API_BASE + 'usuarios/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Erro ao fazer login');
    localStorage.setItem('flordosol-token', data.token);
    localStorage.setItem('flordosol-user', JSON.stringify(data.usuario));
    return data.usuario;
}

async function cadastrar(nome, email, senha) {
    const res = await fetch(API_BASE + 'usuarios/cadastrar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Erro ao cadastrar');
    return data;
}

function logout() {
    localStorage.removeItem('flordosol-token');
    localStorage.removeItem('flordosol-user');
    fecharLogin();
    updateAuthUI();
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

function updateAuthUI() {
    const user = getUser();
    const loginBtn = document.getElementById('login-btn');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');

    if (loginBtn && userMenu) {
        if (user) {
            loginBtn.classList.add('hidden');
            userMenu.classList.remove('hidden');
            if (userName) userName.textContent = user.nome.split(' ')[0];
            // Procura o menu dropdown ou navbar para colocar o acesso ao painel
            let adminLink = document.getElementById('admin-panel-link');
            if (user.cargo === 'admin') {
                if (!adminLink) {
                    const dropdown = document.getElementById('user-dropdown');
                    if (dropdown) {
                        // Injeta um link estilizado dentro do seu menu de usuário existente
                        dropdown.insertAdjacentHTML('afterbegin', `
                            <a id="admin-panel-link" href="admin/index.html" class="block px-4 py-2 text-sm text-amber-600 font-semibold hover:bg-amber-50 border-b border-gray-100">
                                ⚙️ Painel Admin
                            </a>
                        `);
                    }
                }
            } else if (adminLink) {
                adminLink.remove(); // Remove caso mude de conta
            }
        } else {
            loginBtn.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
    }
}

document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('user-dropdown');
    const menu = document.getElementById('user-menu');
    if (dropdown && menu && !menu.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

window.getToken = getToken;
window.getUser = getUser;
window.login = login;
window.cadastrar = cadastrar;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.updateAuthUI = updateAuthUI;
