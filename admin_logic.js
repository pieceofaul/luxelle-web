// A. Inisialisasi Supabase (Paling Atas)
const URL = 'https://bnjjclwlxlrtduupunfw.supabase.co'; //
const KEY = 'sb_publishable_JL8x0bo17UvFdojemnZipw_CBSYxfY9'; //
const _supabase = supabase.createClient(URL, KEY);

// B. Penanganan Sesi Otomatis
window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        const { data: profile } = await _supabase
            .from('profiles')
            .select('name')
            .eq('user_id', session.user.id)
            .single();
        initApp(profile ? profile.name : 'Admin');
    }
});

// C. Fungsi Login (adminDashboardPage.dart & loginPage.dart)
async function authLogin() {
    const email = document.getElementById('email').value; //
    const password = document.getElementById('password').value; //
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('btn-login-action');

    btn.disabled = true;
    errorEl.classList.add('d-none');

    try {
        const { data, error } = await _supabase.auth.signInWithPassword({ email, password }); //
        if (error) throw error;

        // Validasi Role Admin (adminAccountPage.dart)
        const { data: profile } = await _supabase
            .from('profiles')
            .select('role, name')
            .eq('user_id', data.user.id) //
            .single();

        if (profile && profile.role.toLowerCase() === 'admin') {
            initApp(profile.name);
        } else {
            await _supabase.auth.signOut();
            throw new Error("Akses Ditolak: Anda bukan Admin.");
        }
    } catch (err) {
        errorEl.innerText = err.message;
        errorEl.classList.remove('d-none');
    } finally {
        btn.disabled = false;
    }
}

function initApp(adminName) {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('welcome-text').innerText = `Halo, ${adminName}! 👋`; //
    showPage('home');
    updateStats();
}

async function logout() {
    await _supabase.auth.signOut(); //
    location.reload();
}

// D. Navigasi & Fetch Data (adminDashboardPage.dart)
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById('page-' + pageId).style.display = 'block';
    if(event) event.currentTarget.classList.add('active');

    if (pageId === 'orders') fetchOrders();
    if (pageId === 'menu') fetchMenus();
    if (pageId === 'users') fetchUsers();
}

// E. Data Pre-Order (adminPreOrdersPage.dart)
async function fetchOrders() {
    const { data } = await _supabase.from('po').select('*, profiles(name)'); //
    const container = document.getElementById('orders-container');
    container.innerHTML = data.map(o => `
        <div class="card mb-2 p-3 shadow-sm border-0 d-flex flex-row justify-content-between align-items-center">
            <div><div class="fw-bold">${o.profiles?.name || 'Guest'}</div><small class="text-muted">ID: #${o.id}</small></div>
            <span class="badge bg-luxelle">${o.status}</span>
        </div>
    `).join('');
}

// F. Data Menu (adminMenuPage.dart)
async function fetchMenus() {
    const { data } = await _supabase.from('menu').select('*'); //
    document.getElementById('menu-container').innerHTML = data.map(m => `
        <div class="col-6">
            <div class="card h-100 overflow-hidden border-0 shadow-sm text-center">
                <img src="${m.img_url}" style="height:80px; object-fit:cover">
                <div class="p-2 fw-bold" style="font-size: 11px;">${m.name}</div>
            </div>
        </div>
    `).join('');
}

// G. Kelola User (adminAccountPage.dart)
async function fetchUsers() {
    const { data } = await _supabase.from('profiles').select('*').order('name'); //
    document.getElementById('users-container').innerHTML = data.map(u => `
        <div class="list-group-item d-flex justify-content-between border-0 shadow-sm mb-2 rounded">
            <div><div class="fw-bold">${u.name}</div><small class="text-muted">${u.role}</small></div>
            <button class="btn btn-sm btn-outline-secondary px-3 rounded-pill" onclick="alert('Ubah role user: ${u.user_id}')">Edit</button>
        </div>
    `).join('');
}

async function updateStats() {
    const { count: po } = await _supabase.from('po').select('*', { count: 'exact', head: true }); //
    const { count: menu } = await _supabase.from('menu').select('*', { count: 'exact', head: true }); //
    document.getElementById('stat-po').innerText = po || 0;
    document.getElementById('stat-menu').innerText = menu || 0;
}

function exportCSV() {
    alert("Fitur Export CSV (adminPreOrdersPage.dart) siap dikonversi."); //
}