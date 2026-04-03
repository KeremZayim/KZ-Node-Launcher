/*
  _  __  _____   ____    _____   __  __   _____      _     __   __  ___   __  __ 
 | |/ / | ____| |  _ \  | ____| |  \/  | |__  /     / \    \ \ / / |_ _| |  \/  |
 | ' /  |  _|   | |_) | |  _|   | |\/| |   / /     / _ \    \ V /   | |  | |\/| |
 | . \  | |___  |  _ <  | |___  | |  | |  / /_    / ___ \    | |    | |  | |  | |
 |_|\_\ |_____| |_| \_\ |_____| |_|  |_| /____|  /_/   \_\   |_|   |___| |_|  |_|
                                                                                
 ===============================================================================
 DOSYA: renderer.js (Advanced UI Logic - Final Polish)
 ===============================================================================
*/

const { ipcRenderer } = require("electron");

// Dom Elements - Layout
const appGrid = document.getElementById("appGrid");
const loadingScreen = document.getElementById("loading-screen");
const navItems = document.querySelectorAll(".nav-item[data-view]");

// Dom Elements - Console
const terminalOutput = document.getElementById("terminal-output");
const activeAppName = document.getElementById("activeAppName");
const activeAppPath = document.getElementById("activeAppPath");
const liveBadge = document.getElementById("liveBadge");
const toggleProcessBtn = document.getElementById("toggleProcessBtn");
const cpuValue = document.getElementById("cpuValue");
const memValue = document.getElementById("memValue");
const statsContainer = document.getElementById("statsContainer");

// Dom Elements - Modals
const addChoiceModal = document.getElementById("addChoiceModal");
const editModal = document.getElementById("editModal");
const scanModal = document.getElementById("scanModal");
const autoStartModal = document.getElementById("autoStartModal");
const settingsModal = document.getElementById("settingsModal");
const promptModal = document.getElementById("promptModal");
const npmScriptModal = document.getElementById("npmScriptModal");

// State
let currentViewingApp = null;
let currentAppPid = null;
let currentEditingAppId = null;
let currentSelectedIcon = "🚀";
let appLogs = {};
let currentFilter = "all";
let currentSort = "status";

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
    // Reveal UI
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.opacity = "0";
            loadingScreen.style.pointerEvents = "none";
            setTimeout(() => loadingScreen.style.display = "none", 500);
        }
    }, 3000);

    initSidebar();
    initWindowControls();
    initModals();
    populateIconPool();
    loadAndRenderApps();
    initMouseGlow();

    // Load Theme
    const settings = await ipcRenderer.invoke("get-settings");
    setTheme(settings.theme || 'cyber-amethyst', false);
});

// --- INTERACTIVE FX ---

function initMouseGlow() {
    const glow = document.getElementById("mouse-glow");
    if (!glow) return;

    window.addEventListener("mousemove", (e) => {
        // Use requestAnimationFrame for performance
        requestAnimationFrame(() => {
            glow.style.left = e.clientX + "px";
            glow.style.top = e.clientY + "px";
        });
    });
}

// --- UI LOGIC ---

function initSidebar() {
    const allNavItems = document.querySelectorAll(".nav-item");
    allNavItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetView = item.getAttribute("data-view");
            const isModal = item.getAttribute("data-modal") === "true";

            if (targetView && !isModal) {
                switchView(targetView);
                allNavItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");
            }
        });
    });

    // ESC Key Support for Modals
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-overlay").forEach(m => m.style.display = "none");
            // Also close filter if open
            const menu = document.getElementById("filterDropdownMenu");
            if (menu) menu.style.display = "none";
        }
    });
}

function switchView(viewId) {
    const views = document.querySelectorAll(".view-content");
    views.forEach(v => {
        v.style.display = "none";
    });

    const target = document.getElementById(viewId);
    if (target) {
        target.style.display = (viewId === "console-view") ? "flex" : "block";
    }
}

function initWindowControls() {
    document.getElementById("minBtn")?.addEventListener("click", () => ipcRenderer.send("minimize-window"));
    document.getElementById("maxBtn")?.addEventListener("click", () => ipcRenderer.send("maximize-window"));
    document.getElementById("closeBtn")?.addEventListener("click", () => ipcRenderer.send("close-window"));
}

function initModals() {
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        let isMouseDownOnOverlay = false;
        overlay.addEventListener("mousedown", (e) => {
            isMouseDownOnOverlay = (e.target === overlay);
        });
        overlay.addEventListener("mouseup", (e) => {
            if (isMouseDownOnOverlay && e.target === overlay) {
                overlay.style.display = "none";
            }
            isMouseDownOnOverlay = false;
        });
    });

    document.getElementById("addBtn")?.addEventListener("click", () => {
        addChoiceModal.style.display = "flex";
    });
    
    document.getElementById("backBtn")?.addEventListener("click", () => switchView("dashboard-view"));
    document.getElementById("closeModalBtn")?.addEventListener("click", () => editModal.style.display = "none");
    document.getElementById("cancelEditBtn")?.addEventListener("click", () => editModal.style.display = "none");
    
    // Ghost Scan
    document.getElementById("scanGhostsBtn")?.addEventListener("click", async () => {
        const icon = document.querySelector("#scanGhostsBtn i");
        icon.classList.add("fa-spin");
        const ghosts = await ipcRenderer.invoke("scan-ghost-processes");
        icon.classList.remove("fa-spin");
        showScanResults(ghosts);
    });

    // AutoStart Manager
    document.getElementById("openAutoStartManagerBtn")?.addEventListener("click", openAutoStartManager);
    document.getElementById("closeAutoStartBtn")?.addEventListener("click", () => autoStartModal.style.display = "none");

    // Settings
    document.getElementById("openSettingsBtn")?.addEventListener("click", openSettings);
    document.getElementById("closeSettingsBtn")?.addEventListener("click", () => settingsModal.style.display = "none");

    // Güncellemeleri Denetle
    document.getElementById("checkUpdateBtn")?.addEventListener("click", () => {
        const btn = document.getElementById("checkUpdateBtn");
        btn.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> Kontrol ediliyor...';
        btn.disabled = true;
        ipcRenderer.send("check-for-updates");
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-rotate"></i> Güncellemeleri Denetle';
            btn.disabled = false;
        }, 5000);
    });

    // GitHub Butonu
    document.getElementById("githubBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        const { shell } = require("electron");
        shell.openExternal("https://github.com/KeremZayim");
    });

    // Icon Upload
    document.getElementById("uploadImgBtn")?.addEventListener("click", async () => {
        const imgPath = await ipcRenderer.invoke("select-image");
        if (imgPath) {
            currentSelectedIcon = imgPath;
            const preview = document.createElement("img");
            preview.src = imgPath;
            preview.style.width = "40px";
            preview.style.height = "40px";
            preview.style.borderRadius = "8px";
            preview.style.objectFit = "cover";
            document.getElementById("uploadImgBtn").innerHTML = "";
            document.getElementById("uploadImgBtn").appendChild(preview);
        }
    });

    // Filter Dropdown
    document.getElementById("filterDropdownBtn")?.addEventListener("click", () => {
        const menu = document.getElementById("filterDropdownMenu");
        if (menu) menu.style.display = menu.style.display === "block" ? "none" : "block";
        const sortMenu = document.getElementById("sortDropdownMenu");
        if (sortMenu) sortMenu.style.display = "none";
    });

    // Sort Dropdown
    document.getElementById("sortDropdownBtn")?.addEventListener("click", () => {
        const menu = document.getElementById("sortDropdownMenu");
        if (menu) menu.style.display = menu.style.display === "block" ? "none" : "block";
        const filterMenu = document.getElementById("filterDropdownMenu");
        if (filterMenu) filterMenu.style.display = "none";
    });
}

// --- APP CORE LOGIC ---

async function loadAndRenderApps() {
    const apps = await ipcRenderer.invoke("get-apps");
    const groups = await ipcRenderer.invoke("get-groups");
    
    const appsWithStatus = await Promise.all(apps.map(async (app) => ({
        ...app,
        isRunning: await ipcRenderer.invoke("get-process-status", app.id)
    })));

    // Sıralama Uygula
    if (currentSort === "status") {
        appsWithStatus.sort((a, b) => (a.isRunning === b.isRunning) ? 0 : a.isRunning ? -1 : 1);
    } else if (currentSort === "az") {
        appsWithStatus.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === "za") {
        appsWithStatus.sort((a, b) => b.name.localeCompare(a.name));
    }

    let filtered = appsWithStatus;
    if (currentFilter === "running") filtered = appsWithStatus.filter(a => a.isRunning);
    else if (currentFilter === "stopped") filtered = appsWithStatus.filter(a => !a.isRunning);
    else if (typeof currentFilter === "number") filtered = appsWithStatus.filter(a => a.groupId == currentFilter);
    else if (currentFilter === "general") filtered = appsWithStatus.filter(a => !a.groupId);

    renderAppCards(filtered, groups);
    updateOverviewStats(appsWithStatus);
    renderGroups(groups);
    populateGroupSelect(groups);

    // Update Filter UI
    const titleEl = document.getElementById("dashboardTitle");
    const clearBtn = document.getElementById("clearFilterBtn");
    if (titleEl && clearBtn) {
        if (currentFilter === "all") {
            titleEl.innerText = "Projelerim";
            clearBtn.style.display = "none";
        } else {
            let filterName = "Filtrelenmiş Projeler";
            if (currentFilter === "running") filterName = "Aktif Projeler";
            else if (currentFilter === "stopped") filterName = "Durdurulmuş Projeler";
            else if (currentFilter === "general") filterName = "Genel Projeler";
            else {
                const group = groups.find(g => g.id == currentFilter);
                if (group) filterName = group.name;
            }
            titleEl.innerText = filterName;
            clearBtn.style.display = "flex";
            
            // Add Batch Buttons to Header if it's a specific group
            if (typeof currentFilter === "number") {
                const batchHtml = `
                    <div style="display:flex; gap:8px; margin-left:15px; border-left:1px solid var(--glass-border); padding-left:15px;">
                        <button class="mini-btn" onclick="batchAction(${currentFilter}, 'start')" style="color:#10b981; border-color:rgba(16,185,129,0.2);">
                            <i class="fa-solid fa-play"></i> HEPSİNİ BAŞLAT
                        </button>
                        <button class="mini-btn" onclick="batchAction(${currentFilter}, 'stop')" style="color:var(--danger); border-color:rgba(239,68,68,0.2);">
                            <i class="fa-solid fa-stop"></i> HEPSİNİ DURDUR
                        </button>
                    </div>
                `;
                titleEl.parentElement.insertAdjacentHTML('beforeend', batchHtml);
            }
        }
    }
}

window.batchAction = async (groupId, action) => {
    const apps = await ipcRenderer.invoke("get-apps");
    const groupApps = apps.filter(a => a.groupId == groupId);
    
    if (groupApps.length === 0) return;

    for (const app of groupApps) {
        const isRunning = await ipcRenderer.invoke("get-process-status", app.id);
        if (action === "start" && !isRunning) {
            ipcRenderer.send("start-process", app);
        } else if (action === "stop" && isRunning) {
            ipcRenderer.send("stop-process", app);
        }
    }
    
    showAlert("Grup İşlemi", `${groupApps.length} proje için '${action}' komutu gönderildi.`, "success");
};

function populateGroupSelect(groups) {
    const select = document.getElementById("editGroup");
    if (!select) return;
    
    // Save current value
    const val = select.value;
    
    select.innerHTML = '<option value="">Genel</option>';
    groups.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g.id;
        opt.innerText = g.name;
        select.appendChild(opt);
    });
    
    // Restore value
    select.value = val;
}

function updateOverviewStats(apps) {
    const activeCount = apps.filter(a => a.isRunning).length;
    const overview = document.getElementById("statsOverview");
    if (overview) overview.innerText = `Şu an aktif ${activeCount} proje yönetiliyor`;
}

window.applyFilter = (filter) => {
    currentFilter = filter;
    switchView("dashboard-view");
    
    // Highlight Dashboard in sidebar
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(i => {
        i.classList.remove("active");
        if (i.getAttribute("data-view") === "dashboard-view") i.classList.add("active");
    });

    loadAndRenderApps();
    const filterMenu = document.getElementById("filterDropdownMenu");
    if (filterMenu) filterMenu.style.display = "none";
};

window.applySort = (sort) => {
    currentSort = sort;
    loadAndRenderApps();
    const sortMenu = document.getElementById("sortDropdownMenu");
    if (sortMenu) sortMenu.style.display = "none";
};

async function renderGroups(groups) {
    const apps = await ipcRenderer.invoke("get-apps");
    const container = document.getElementById("groupsContainer");
    if (!container) return;
    container.innerHTML = "";

    // Virtual "General" Group
    const generalProjectCount = apps.filter(a => !a.groupId).length;
    const generalCard = document.createElement("div");
    generalCard.className = "app-card system-card";
    generalCard.style.textAlign = "center";
    generalCard.innerHTML = `
        <div class="card-body">
            <i class="fa-solid fa-layer-group" style="font-size:32px; color:var(--accent-cyan); margin-bottom:12px;"></i>
            <h3>Genel</h3>
            <p style="font-size:12px; opacity:0.6;">${generalProjectCount} Proje</p>
        </div>
        <div class="card-footer" style="padding:15px; border-top:1px solid rgba(255,255,255,0.05); color:var(--text-dim); font-size:11px;">
            SİSTEM KATEGORİSİ
        </div>
    `;
    generalCard.onclick = () => applyFilter("general");
    container.appendChild(generalCard);

    // Custom Groups
    groups.forEach(group => {
        const projectCount = apps.filter(a => a.groupId == group.id).length;
        const card = document.createElement("div");
        card.className = "app-card";
        card.style.textAlign = "center";
        card.style.cursor = "pointer";
        card.innerHTML = `
            <div class="card-body">
                <i class="fa-solid fa-folder" style="font-size:32px; color:var(--accent-solid); margin-bottom:12px;"></i>
                <h3>${group.name}</h3>
                <p style="font-size:12px; opacity:0.6;">${projectCount} Proje</p>
            </div>
            <div class="card-footer" style="display:flex; flex-direction:column; gap:8px; padding:15px; border-top:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex; gap:10px; width:100%;">
                    <button class="mini-btn" onclick="event.stopPropagation(); batchAction(${group.id}, 'start')" style="flex:1; color:#10b981;">BAŞLAT</button>
                    <button class="mini-btn" onclick="event.stopPropagation(); batchAction(${group.id}, 'stop')" style="flex:1; color:var(--danger);">DURDUR</button>
                </div>
                <div style="display:flex; gap:10px; width:100%;">
                    <button class="mini-btn" onclick="event.stopPropagation(); openGroupModal(${group.id}, '${group.name}')" style="flex:1; opacity:0.6;">DÜZENLE</button>
                    <button class="mini-btn" onclick="event.stopPropagation(); deleteGroup(${group.id})" style="flex:1; border-color:rgba(239,68,68,0.2); color:var(--danger); opacity:0.6;">SİL</button>
                </div>
            </div>
        `;
        card.onclick = () => applyFilter(group.id);
        container.appendChild(card);
    });
}

let currentEditingGroupId = null;

window.openGroupModal = (groupId = null, name = "") => {
    currentEditingGroupId = groupId;
    const modal = document.getElementById("groupModal");
    const title = document.getElementById("groupModalTitle");
    const input = document.getElementById("groupNameInput");

    title.innerText = groupId ? "Kategoriyi Düzenle" : "Yeni Kategori";
    input.value = name;
    modal.style.display = "flex";
    input.focus();
};

document.getElementById("saveGroupBtn")?.addEventListener("click", () => {
    const name = document.getElementById("groupNameInput").value.trim();
    if (!name) return;

    if (currentEditingGroupId) {
        ipcRenderer.send("edit-group", { id: currentEditingGroupId, name });
    } else {
        ipcRenderer.send("add-group", name);
    }
    document.getElementById("groupModal").style.display = "none";
});

window.createNewGroup = () => openGroupModal();

window.deleteGroup = async (groupId) => {
    const confirm = await showConfirm("Kategori Silinsin mi?", "Bu kategoriyi silmek istediğinize emin misiniz? Projeler 'Genel' kategorisine taşınır.");
    if (confirm) {
        ipcRenderer.send("delete-group", groupId);
    }
};

function renderAppCards(apps, groups) {
    if (!appGrid) return;
    appGrid.innerHTML = "";

    apps.forEach((app, index) => {
        const card = document.createElement("div");
        card.className = "app-card";
        
        const isRunning = app.isRunning;
        const group = groups.find(g => g.id == app.groupId);
        const iconHtml = (app.icon && app.icon.length > 5) 
            ? `<img src="${app.icon}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`
            : app.icon || "🚀";

        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">${iconHtml}</div>
                <div class="status-indicator ${isRunning ? 'running' : 'stopped'}">
                    <i class="fa-solid fa-circle"></i> ${isRunning ? 'AKTİF' : 'DURDU'}
                </div>
            </div>
            <div class="card-body">
                <div class="category-tag">${group ? group.name : 'Genel'}</div>
                <h3>${app.name}</h3>
                <p>${app.type === 'npm' ? 'NPM: ' + app.script : app.path.split(/[\\\/]/).pop()}</p>
            </div>
            <div class="card-footer">
                <button class="mini-btn" onclick="handleCardAction(${app.id}, 'view')">İzle</button>
                <button class="mini-btn" onclick="handleCardAction(${app.id}, 'edit')">Düzenle</button>
            </div>
        `;
        
        card.onclick = (e) => {
            if (!e.target.closest('button')) openConsolePage(app);
        };

        // Stagger Reveal Effect
        card.style.opacity = "0";
        card.style.animation = "none";
        setTimeout(() => {
            card.style.animation = "cardFade 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) forwards";
        }, index * 50);

        appGrid.appendChild(card);
    });
}

window.handleCardAction = (appId, action) => {
    event.stopPropagation();
    if (action === 'view') {
        ipcRenderer.invoke("get-apps").then(apps => {
            const app = apps.find(a => a.id === appId);
            if (app) openConsolePage(app);
        });
    } else {
        openEditModal(appId);
    }
};

// --- CHART & CONSOLE ---

let cpuChart = null;
let ramChart = null;

function initChart() {
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');
    const ramCtx = document.getElementById('ramChart').getContext('2d');
    
    if (cpuChart) cpuChart.destroy();
    if (ramChart) ramChart.destroy();

    const commonOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { color: '#94a3b8', font: { size: 10, weight: '600' } } } },
        scales: { 
            x: { display: false }, 
            y: { min: 0, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 10 } } } 
        },
        animation: { duration: 400 }
    };

    cpuChart = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{ 
                label: 'CPU %', data: Array(20).fill(0), 
                borderColor: '#7000ff', tension: 0.4, fill: true, 
                backgroundColor: 'rgba(112,0,255,0.05)', pointRadius: 0 , borderWidth: 2
            }]
        },
        options: commonOptions
    });

    ramChart = new Chart(ramCtx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{ 
                label: 'RAM MB', data: Array(20).fill(0), 
                borderColor: '#00f2fe', tension: 0.4, fill: true, 
                backgroundColor: 'rgba(0,242,254,0.05)', pointRadius: 0, borderWidth: 2
            }]
        },
        options: commonOptions // Dynamically scales because no suggestedMax
    });
}

async function openConsolePage(app) {
    currentViewingApp = app;
    activeAppName.innerText = app.name;
    activeAppPath.innerText = app.path;
    currentAppPid = await ipcRenderer.invoke("get-process-pid", app.id);
    
    const history = await ipcRenderer.invoke("get-logs", app.id);
    terminalOutput.innerHTML = `<div>${history.replace(/\n/g, '<br>')}</div>`;
    
    switchView("console-view");
    initChart();
    updateProcessStatusUI(app.id);
}

// --- IPC EVENTS ---

// ANSI Escape Codes (Terminal Colors) Stripper
function stripAnsi(text) {
    return text.replace(/[\u001b\u009b][[()#;?]*(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d]*)*)?\u0007/g, '');
}

ipcRenderer.on("process-log", (event, { appId, log }) => {
    if (currentViewingApp && currentViewingApp.id === appId) {
        const cleanLog = stripAnsi(log).replace(/\n/g, '<br>');
        terminalOutput.innerHTML += `<div>${cleanLog}</div>`;
        
        // Auto-scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
});

ipcRenderer.on("resource-update", (event, stats) => {
    if (currentViewingApp && currentAppPid && stats[currentAppPid] && cpuChart && ramChart) {
        const stat = stats[currentAppPid];
        if (stat) {
            const cpu = stat.cpu;
            const mem = stat.memory / 1024 / 1024;
            document.getElementById("cpuValue").innerText = cpu.toFixed(1) + "%";
            document.getElementById("memValue").innerText = mem.toFixed(1) + " MB";
            
            cpuChart.data.datasets[0].data.push(cpu);
            cpuChart.data.datasets[0].data.shift();
            cpuChart.update('none');

            ramChart.data.datasets[0].data.push(mem);
            ramChart.data.datasets[0].data.shift();
            ramChart.update('none');
        }
    }
});

ipcRenderer.on("app-status-change", (event, { appId, isRunning }) => {
    if (currentViewingApp && currentViewingApp.id === appId) updateProcessStatusUI(appId);
    loadAndRenderApps();
});

ipcRenderer.on("update-app-list", () => loadAndRenderApps());
ipcRenderer.on("update-group-list", () => loadAndRenderApps());

// --- PROCESS CONTROLS ---

async function updateProcessStatusUI(appId) {
    const isRunning = await ipcRenderer.invoke("get-process-status", appId);
    toggleProcessBtn.innerHTML = isRunning ? '<i class="fa-solid fa-stop"></i> Durdur' : '<i class="fa-solid fa-play"></i> Başlat';
    toggleProcessBtn.classList.toggle("stop", isRunning);
    toggleProcessBtn.classList.toggle("start", !isRunning);
    liveBadge.style.display = isRunning ? "flex" : "none";
}

toggleProcessBtn.addEventListener("click", async () => {
    if (!currentViewingApp) return;
    const isRunning = await ipcRenderer.invoke("get-process-status", currentViewingApp.id);
    if (isRunning) ipcRenderer.send("stop-process", currentViewingApp.id);
    else ipcRenderer.send("start-process", currentViewingApp);
});

// --- MODALS & FORMS ---

function populateIconPool() {
    const pool = document.getElementById("iconPool");
    const icons = ["🚀", "💻", "🌐", "🎮", "🔥", "🤖", "⚡", "🛠️", "📦", "🖥️", "🔋", "🔑"];
    pool.innerHTML = "";
    icons.forEach(icon => {
        const div = document.createElement("div");
        div.style.cssText = "font-size:24px; padding:8px; cursor:pointer; text-align:center; border-radius:8px; hover:background:rgba(255,255,255,0.05);";
        div.innerText = icon;
        div.onclick = () => {
            currentSelectedIcon = icon;
            document.querySelectorAll("#iconPool div").forEach(d => d.style.background = "");
            div.style.background = "var(--glass-border)";
        };
        pool.appendChild(div);
    });
}

window.openEditModal = async (appId) => {
    const apps = await ipcRenderer.invoke("get-apps");
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    currentEditingAppId = appId;
    const groups = await ipcRenderer.invoke("get-groups");
    populateGroupSelect(groups);

    document.getElementById("editName").value = app.name;
    document.getElementById("editPath").value = app.path;
    document.getElementById("editAutoStart").checked = !!app.autoStart;
    document.getElementById("editWatchdog").checked = !!app.watchdog;
    document.getElementById("editWatchPort").value = app.watchPort || "";
    document.getElementById("editMemoryLimit").value = app.memoryLimit || "";
    document.getElementById("editGroup").value = app.groupId || "";
    currentSelectedIcon = app.icon || "🚀";

    // NPM Script Support
    const scriptGroup = document.getElementById("editNpmScriptGroup");
    const scriptSelect = document.getElementById("editNpmScript");
    
    if (app.type === 'npm') {
        scriptGroup.style.display = "block";
        const scripts = await ipcRenderer.invoke("read-package-scripts", app.path);
        scriptSelect.innerHTML = "";
        if (scripts) {
            Object.keys(scripts).forEach(s => {
                const opt = document.createElement("option");
                opt.value = opt.innerText = s;
                if (s === app.script) opt.selected = true;
                scriptSelect.appendChild(opt);
            });
        }
    } else {
        scriptGroup.style.display = "none";
    }

    editModal.style.display = "flex";
};

document.getElementById("saveEditBtn")?.addEventListener("click", () => {
    const editData = {
        id: currentEditingAppId,
        name: document.getElementById("editName").value,
        path: document.getElementById("editPath").value,
        groupId: parseInt(document.getElementById("editGroup").value) || null,
        icon: currentSelectedIcon,
        autoStart: document.getElementById("editAutoStart").checked,
        watchdog: document.getElementById("editWatchdog").checked,
        watchPort: parseInt(document.getElementById("editWatchPort").value) || null,
        memoryLimit: parseInt(document.getElementById("editMemoryLimit").value) || null
    };

    // If NPM, add script
    const scriptSelect = document.getElementById("editNpmScript");
    if (document.getElementById("editNpmScriptGroup").style.display === "block") {
        editData.script = scriptSelect.value;
    }

    ipcRenderer.send("edit-app", editData);
    editModal.style.display = "none";
});

document.getElementById("changePathBtn")?.addEventListener("click", async () => {
    const path = await ipcRenderer.invoke("select-folder");
    if (path) {
        document.getElementById("editPath").value = path;
        // If NPM, refresh scripts
        const scriptGroup = document.getElementById("editNpmScriptGroup");
        if (scriptGroup.style.display === "block") {
            const scripts = await ipcRenderer.invoke("read-package-scripts", path);
            const scriptSelect = document.getElementById("editNpmScript");
            scriptSelect.innerHTML = "";
            if (scripts) {
                Object.keys(scripts).forEach(s => {
                    const opt = document.createElement("option");
                    opt.value = opt.innerText = s;
                    scriptSelect.appendChild(opt);
                });
            }
        }
    }
});

document.getElementById("deleteAppBtn")?.addEventListener("click", async () => {
    const confirm = await showConfirm("Projeyi Sil", "Bu projeyi listeden kaldırmak istediğinize emin misiniz?");
    if (confirm) {
        ipcRenderer.send("delete-app", currentEditingAppId);
        editModal.style.display = "none";
    }
});

// Select Handlers
document.getElementById("selectJsFileBtn")?.addEventListener("click", async () => {
    const path = await ipcRenderer.invoke("select-file");
    if (path) ipcRenderer.send("add-app", { id: Date.now(), name: path.split(/[\\\/]/).pop(), path, icon: "🚀", type: "js" });
    addChoiceModal.style.display = "none";
});

document.getElementById("selectNpmScriptBtn")?.addEventListener("click", async () => {
    const path = await ipcRenderer.invoke("select-folder");
    if (path) {
        const scripts = await ipcRenderer.invoke("read-package-scripts", path);
        if (scripts) {
            const list = document.getElementById("npmScriptsList");
            list.innerHTML = "";
            Object.keys(scripts).forEach(s => {
                const b = document.createElement("button");
                b.className = "btn-secondary";
                b.style.width = "100%";
                b.style.marginBottom = "5px";
                b.innerText = s;
                b.onclick = () => {
                    ipcRenderer.send("add-app", { id: Date.now(), name: s, path, icon: "📦", type: "npm", script: s });
                    npmScriptModal.style.display = "none";
                    addChoiceModal.style.display = "none";
                };
                list.appendChild(b);
            });
            npmScriptModal.style.display = "flex";
        }
    }
});

window.openEnvEditor = async () => {
    const content = await ipcRenderer.invoke("read-env", currentViewingApp.path);
    if (content !== null) {
        document.getElementById("envContent").value = content;
        // Reset to Text Mode always when opening, but skip syncing from empty grid
        switchEnvMode('text', true); 
        document.getElementById("envModal").style.display = "flex";
    } else {
        showAlert("Dosya Bulunamadı", ".env dosyası mevcut değil.", "warning");
    }
};
window.saveEnvContent = async () => {
    // If we are in grid mode, sync to textarea first
    if (document.getElementById("envGridView").style.display === "block") {
        syncGridToText();
    }
    
    const res = await ipcRenderer.invoke("save-env", { folderPath: currentViewingApp.path, content: document.getElementById("envContent").value });
    if (res.success) document.getElementById("envModal").style.display = "none";
};

// --- .env Visual Editor Logic ---
window.switchEnvMode = (mode, skipSync = false) => {
    const textBtn = document.getElementById("envTextModeBtn");
    const gridBtn = document.getElementById("envGridModeBtn");
    const textView = document.getElementById("envContent");
    const gridView = document.getElementById("envGridView");

    if (mode === "grid") {
        if (!skipSync) syncTextToGrid();
        textView.style.display = "none";
        gridView.style.display = "block";
        textBtn.classList.remove("active");
        gridBtn.classList.add("active");
    } else {
        if (!skipSync) syncGridToText();
        textView.style.display = "block";
        gridView.style.display = "none";
        textBtn.classList.add("active");
        gridBtn.classList.remove("active");
    }
};

function syncTextToGrid() {
    const text = document.getElementById("envContent").value;
    const lines = text.split("\n");
    const pairs = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return; // Skip empty and comments for grid
        
        const firstEq = trimmed.indexOf("=");
        if (firstEq !== -1) {
            const key = trimmed.substring(0, firstEq).trim();
            let value = trimmed.substring(firstEq + 1).trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }
            pairs.push({ key, value });
        }
    });

    renderEnvGrid(pairs);
}

function syncGridToText() {
    const rows = document.querySelectorAll(".env-row");
    let text = "";
    rows.forEach(row => {
        const key = row.querySelector(".env-key").value.trim();
        const value = row.querySelector(".env-value").value.trim();
        if (key) {
            text += `${key}=${value}\n`;
        }
    });
    document.getElementById("envContent").value = text;
}

function renderEnvGrid(pairs) {
    const list = document.getElementById("envGridList");
    list.innerHTML = "";
    
    pairs.forEach((pair, index) => {
        addEnvRow(pair.key, pair.value);
    });
}

window.addEnvRow = (key = "", value = "") => {
    const list = document.getElementById("envGridList");
    const row = document.createElement("div");
    row.className = "env-row";
    row.innerHTML = `
        <input type="text" class="form-input env-key" placeholder="ANAHTAR" value="${key}">
        <span style="color:var(--text-dim);">=</span>
        <input type="text" class="form-input env-value" placeholder="DEĞER" value="${value}">
        <button class="env-delete-btn" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;
    list.appendChild(row);
};
window.openProjectFolder = () => {
    if (currentViewingApp) {
        ipcRenderer.send("open-folder", currentViewingApp.path);
    }
};

window.runMaintenance = (cmd) => ipcRenderer.send("run-maintenance", { appId: currentViewingApp.id, appPath: currentViewingApp.path, command: cmd });
window.openExternalTerminal = () => ipcRenderer.send("open-terminal", currentViewingApp.path);

async function openSettings() {
    const s = await ipcRenderer.invoke("get-settings");
    document.getElementById("winAutoStartToggle").checked = s.winAutoStart;
    document.getElementById("settingStartMinimized").checked = s.startMinimized;
    document.getElementById("autoUpdateToggle").checked = s.autoUpdate;
    document.getElementById("currentVerText").innerText = "Sürüm: v1.1.1";
    
    // Highlight Active Theme
    const currentTheme = s.theme || 'cyber-amethyst';
    document.querySelectorAll(".theme-dot").forEach(dot => {
        dot.classList.toggle("active", dot.onclick.toString().includes(currentTheme));
    });

    settingsModal.style.display = "flex";
}

window.setTheme = (name, save = true) => {
    document.documentElement.setAttribute('data-theme', name);
    
    // UI Update (Dots)
    const currentTheme = name;
    document.querySelectorAll(".theme-dot").forEach(dot => {
        dot.classList.remove("active");
        if (dot.getAttribute("onclick").includes(currentTheme)) dot.classList.add("active");
    });

    if (save) {
        ipcRenderer.send("update-settings", { theme: name });
    }
};

function showScanResults(ghosts) {
    const list = document.getElementById("scanResultsList");
    const modal = document.getElementById("scanModal");

    list.innerHTML = "";

    if (!ghosts || ghosts.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding: 30px; color: var(--text-dim);">
                <i class="fa-solid fa-circle-check" style="font-size:32px; color:#10b981; margin-bottom:12px; display:block;"></i>
                <span>Dış süreç bulunamadı. Sistem temiz.</span>
            </div>`;
    } else {
        ghosts.forEach(g => {
            const row = document.createElement("div");
            row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:var(--card-bg); border:1px solid var(--glass-border); border-radius:12px; margin-bottom:10px; gap:10px;";
            row.innerHTML = `
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:700; font-size:13px; color:var(--text-primary); margin-bottom:4px;">${g.name}</div>
                    <div style="font-size:11px; color:var(--text-dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${g.path}</div>
                    <div style="font-size:11px; color:var(--accent-purple); margin-top:2px;">${g.memory}</div>
                </div>
            <div style="display:flex; gap:8px;">
                <button onclick="addGhost('${g.name}', '${g.path.replace(/\\/g, '\\\\')}', this)" class="btn-primary" style="padding:8px 14px; font-size:12px; white-space:nowrap; box-shadow:none;">
                    <i class="fa-solid fa-plus"></i> Ekle
                </button>
                <button onclick="killGhost(${g.pid}, this)" class="btn-delete" style="padding:8px 14px; font-size:12px; white-space:nowrap;">
                    <i class="fa-solid fa-skull"></i> Sonlandır
                </button>
            </div>`;
            list.appendChild(row);
        });
    }

    modal.style.display = "flex";
}

window.addGhost = (name, path, btn) => {
    // Port bilgisini temizleyerek sadece script adını alalım
    let cleanName = name.includes(" - ") ? name.split(" - ").pop() : name;
    ipcRenderer.send("add-app", { 
        id: Date.now(), 
        name: cleanName, 
        path: path, 
        icon: "👻", 
        type: "js" 
    });
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Eklendi';
    btn.disabled = true;
    btn.style.opacity = "0.7";
};

window.killGhost = (pid, btn) => {
    ipcRenderer.send("kill-ghost-process", pid);
    btn.closest("div[style]").style.opacity = "0.4";
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Sonlandırıldı';
};

window.clearAllLogs = async () => {
    const confirm = await showConfirm("Günlükleri Temizle", "Tüm uygulama loglarını kalıcı olarak silmek istediğinize emin misiniz?");
    if (confirm) {
        const res = await ipcRenderer.invoke("clear-all-logs");
        if (res.success) {
            if (terminalOutput) terminalOutput.innerHTML = '<div style="color:var(--success)">[SİSTEM] Tüm loglar başarıyla temizlendi.</div>';
            showAlert("Başarılı", "Tüm loglar temizlendi.", "success");
        } else {
            showAlert("Hata", "Log temizleme sırasında bir hata oluştu: " + res.error, "error");
        }
    }
};

// Custom UI Dialog Helpers
window.showAlert = (title, message, type = 'warning') => {
    return new Promise((resolve) => {
        const modal = document.getElementById("promptModal");
        const titleEl = document.getElementById("promptTitle");
        const msgEl = document.getElementById("promptMessage");
        const iconEl = document.getElementById("promptIcon");
        const confirmBtn = document.getElementById("promptConfirmBtn");
        const cancelBtn = document.getElementById("promptCancelBtn");

        titleEl.innerText = title;
        msgEl.innerText = message;
        cancelBtn.style.display = "none";
        confirmBtn.innerText = "Anladım";

        // Set Icon & Color
        let icon = '<i class="fa-solid fa-circle-exclamation" style="color: var(--warning);"></i>';
        if (type === 'success') icon = '<i class="fa-solid fa-circle-check" style="color: var(--success);"></i>';
        if (type === 'error') icon = '<i class="fa-solid fa-circle-xmark" style="color: var(--danger);"></i>';
        iconEl.innerHTML = icon;

        modal.style.display = "flex";

        const handleClose = () => {
            modal.style.display = "none";
            confirmBtn.removeEventListener("click", handleClose);
            resolve();
        };
        confirmBtn.addEventListener("click", handleClose);
    });
};

window.showConfirm = (title, message) => {
    return new Promise((resolve) => {
        const modal = document.getElementById("promptModal");
        const titleEl = document.getElementById("promptTitle");
        const msgEl = document.getElementById("promptMessage");
        const iconEl = document.getElementById("promptIcon");
        const confirmBtn = document.getElementById("promptConfirmBtn");
        const cancelBtn = document.getElementById("promptCancelBtn");

        titleEl.innerText = title;
        msgEl.innerText = message;
        cancelBtn.style.display = "block";
        confirmBtn.innerText = "Onayla";
        iconEl.innerHTML = '<i class="fa-solid fa-circle-question" style="color: var(--accent-purple);"></i>';

        modal.style.display = "flex";

        const onConfirm = () => {
            modal.style.display = "none";
            cleanup();
            resolve(true);
        };
        const onCancel = () => {
            modal.style.display = "none";
            cleanup();
            resolve(false);
        };
        const cleanup = () => {
            confirmBtn.removeEventListener("click", onConfirm);
            cancelBtn.removeEventListener("click", onCancel);
        };

        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click", onCancel);
    });
};

// Handle Exit Confirmation from Main Process
ipcRenderer.on("request-exit-confirmation", async (event, activeCount) => {
    const confirm = await showConfirm(
        "Açık Projeler Var!", 
        `Arka planda hala çalışmakta olan ${activeCount} projeniz var. Yine de çıkmak istiyor musunuz?`
    );
    if (confirm) {
        ipcRenderer.send("confirm-exit");
    }
});
async function openAutoStartManager() {
    const apps = await ipcRenderer.invoke("get-apps");
    const container = document.getElementById("autoStartListContainer");
    if (!container) return;
    container.innerHTML = "";
    apps.forEach(app => {
        const d = document.createElement("div");
        d.style.display = "flex"; d.style.justifyContent = "space-between"; d.style.padding = "10px";
        d.innerHTML = `<span>${app.name}</span> <label class="switch"><input type="checkbox" ${app.autoStart ? 'checked' : ''} onchange="ipcRenderer.send('update-auto-start', {appId:${app.id}, enabled:this.checked})"><span class="slider"></span></label>`;
        container.appendChild(d);
    });
    autoStartModal.style.display = "flex";
}
