// ========================================
// SISTEMA DE LOGIN UNIVERSAL - J&P INGENIEROS
// Incluye este archivo en todas tus páginas HTML
// ========================================

// ========= USUARIOS (registro simple en localStorage) =========
function getUsers() {
    try {
        const raw = localStorage.getItem('jp_users');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Error leyendo usuarios', e);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem('jp_users', JSON.stringify(users));
}

// ========= SESIÓN =========
function setLoggedIn() {
    localStorage.setItem('jp_logged_in', '1');
}

function clearSession() {
    localStorage.removeItem('jp_logged_in');
}

function isLoggedIn() {
    return localStorage.getItem('jp_logged_in') === '1';
}

// ========= TAREAS (localStorage) =========
function getTasks() {
    try {
        const raw = localStorage.getItem('jp_tasks');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Error leyendo tareas:', e);
        return [];
    }
}

function saveTasks(tasks) {
    localStorage.setItem('jp_tasks', JSON.stringify(tasks));
}

// ========= FILTROS DE TAREAS =========
let currentFilter = 'all'; // all | formulario | chatbot | manual

function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) return;

    const tasks = getTasks();

    // Filtrar según origen
    const filtered = currentFilter === 'all'
        ? tasks
        : tasks.filter(t => (t.source || 'manual') === currentFilter);

    tasksList.innerHTML = '';

    if (filtered.length === 0) {
        tasksList.innerHTML = '<li class="text-muted">No hay tareas para este filtro.</li>';
        return;
    }

    const sourceLabels = {
        formulario: 'Formulario de contacto',
        chatbot: 'Chatbot',
        manual: 'Creada manualmente',
        externo: 'Externo'
    };

    filtered.forEach((t, index) => {
        const li = document.createElement('li');

        const sourceKey  = t.source || 'manual';
        const sourceText = sourceLabels[sourceKey] || sourceKey;

        li.classList.add('task-item');
        li.dataset.source = sourceKey;

        let fechaText = '';
        if (t.createdAt) {
            try {
                const d = new Date(t.createdAt);
                fechaText = d.toLocaleString('es-PE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                fechaText = t.createdAt;
            }
        }

        li.innerHTML = `
            <div class="task-main">
                <strong>${sourceText}</strong>
                ${fechaText ? `<small class="d-block text-muted">${fechaText}</small>` : ''}
                <span class="task-text d-block mt-1">${t.text}</span>
            </div>
            <button class="btn btn-sm btn-outline-danger" data-index="${index}" title="Eliminar tarea">
                &times;
            </button>
        `;

        tasksList.appendChild(li);
    });

    // Botones para eliminar
    tasksList.querySelectorAll('button[data-index]').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            const tasks = getTasks();

            const filtered = currentFilter === 'all'
                ? tasks
                : tasks.filter(t => (t.source || 'manual') === currentFilter);

            const toDelete = filtered[idx];
            const newList = tasks.filter(t =>
                !(t.text === toDelete.text &&
                  t.source === toDelete.source &&
                  t.createdAt === toDelete.createdAt)
            );
            saveTasks(newList);
            renderTasks();
        });
    });
}

// ========= AGREGAR TAREA =========
function addTask(text, source) {
    const tasks = getTasks();
    tasks.push({
        text,
        source: source || 'manual',
        createdAt: new Date().toISOString()
    });
    saveTasks(tasks);
    renderTasks();
}

// Función global para otras páginas
window.jpAddTask = addTask;

// ========= INICIALIZACIÓN DEL SISTEMA =========
function initLoginSystem() {
    const loginOverlay   = document.getElementById('loginOverlay');
    const openLoginBtn   = document.getElementById('openLoginBtn');
    const closeLoginBtn  = document.getElementById('closeLoginBtn');

    const loginFormEl    = document.getElementById('loginForm');
    const loginError     = document.getElementById('loginError');
    const loginFormWrap  = document.getElementById('loginFormWrapper');

    const registerWrap   = document.getElementById('registerWrapper');
    const registerForm   = document.getElementById('registerForm');
    const registerMsg    = document.getElementById('registerMsg');

    const tasksWrapper   = document.getElementById('tasksWrapper');
    const logoutBtn      = document.getElementById('logoutBtn');

    const manualTaskForm = document.getElementById('manualTaskForm');
    const newTaskText    = document.getElementById('newTaskText');

    const loginTabBtns   = document.querySelectorAll('.login-tab-btn');

    // ========= TABS: INICIAR SESIÓN / REGISTRARSE =========
    loginTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.getAttribute('data-target');

            if (target === 'loginFormWrapper') {
                loginFormWrap.style.display = 'block';
                registerWrap.style.display  = 'none';
                tasksWrapper.style.display  = 'none';
            } else if (target === 'registerWrapper') {
                loginFormWrap.style.display = 'none';
                registerWrap.style.display  = 'block';
                tasksWrapper.style.display  = 'none';
            }
        });
    });

    // ========= ABRIR/CERRAR OVERLAY =========
    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginOverlay.style.display = 'flex';
            document.body.classList.add('login-open');

            if (isLoggedIn()) {
                loginFormWrap.style.display = 'none';
                registerWrap.style.display  = 'none';
                tasksWrapper.style.display  = 'block';
                renderTasks();
            } else {
                loginFormWrap.style.display = 'block';
                registerWrap.style.display  = 'none';
                tasksWrapper.style.display  = 'none';

                loginTabBtns.forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-target') === 'loginFormWrapper');
                });
            }
        });
    }

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', function() {
            loginOverlay.style.display = 'none';
            document.body.classList.remove('login-open');
            if (loginError) loginError.style.display = 'none';
        });
    }

    if (loginOverlay) {
        loginOverlay.addEventListener('click', function(e) {
            if (e.target === loginOverlay) {
                loginOverlay.style.display = 'none';
                document.body.classList.remove('login-open');
                if (loginError) loginError.style.display = 'none';
            }
        });
    }

    // ========= LOGIN =========
if (loginFormEl) {
    loginFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value.trim();

        // 👉 SOLO ADMIN PUEDE ENTRAR
        if (user === 'admin' && pass === '123456') {
            setLoggedIn();
            if (loginError) loginError.style.display = 'none';
            loginFormWrap.style.display = 'none';
            registerWrap.style.display  = 'none';
            tasksWrapper.style.display  = 'block';
            renderTasks();
            return;
        }

        // Cualquier otro usuario NO entra al panel
        if (loginError) {
            loginError.textContent = 'Tu registro está en revisión. Un administrador se comunicará contigo para activar tu acceso.';
            loginError.style.display = 'block';
        }
    });
}

// ========= REGISTRO =========
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name  = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass  = document.getElementById('regPass').value.trim();

        if (!name || !email || !pass) return;

        const users = getUsers();
        const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            registerMsg.style.display = 'block';
            registerMsg.style.color = '#f97316';
            registerMsg.textContent = 'Este correo ya envió una solicitud. Un administrador se comunicará contigo.';
            return;
        }

        // 👉 Guardamos solo como "solicitud" local (para que el admin la vea después si quiere)
        users.push({ name, email, pass, createdAt: new Date().toISOString() });
        saveUsers(users);

        registerMsg.style.display = 'block';
        registerMsg.style.color = '#16a34a';
        registerMsg.textContent = 'Tu registro ha sido enviado. Un administrador se comunicará contigo o recibirás un correo de confirmación.';
        registerForm.reset();
    });
}

    // ========= LOGOUT =========
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            clearSession();
            tasksWrapper.style.display  = 'none';
            loginFormWrap.style.display = 'block';
            registerWrap.style.display  = 'none';

            loginTabBtns.forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-target') === 'loginFormWrapper');
            });
        });
    }

    // ========= AGREGAR TAREA MANUAL =========
    if (manualTaskForm && newTaskText) {
        manualTaskForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const txt = newTaskText.value.trim();
            if (!txt) return;
            addTask(txt, 'manual');
            newTaskText.value = '';
        });
    }

    // ========= FILTROS DE TAREAS =========
    const tasksFilter = document.getElementById('tasksFilter');
    if (tasksFilter) {
        tasksFilter.addEventListener('click', function (e) {
            const btn = e.target.closest('button[data-filter]');
            if (!btn) return;

            currentFilter = btn.getAttribute('data-filter');

            tasksFilter.querySelectorAll('button[data-filter]').forEach(b => {
                b.classList.toggle('active', b === btn);
            });

            renderTasks();
        });
    }
}

// ========= AUTO-INICIALIZACIÓN =========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoginSystem);
} else {
    initLoginSystem();
}
