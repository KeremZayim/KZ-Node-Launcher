/*
  _  __  _____   ____    _____   __  __   _____      _     __   __  ___   __  __ 
 | |/ / | ____| |  _ \  | ____| |  \/  | |__  /     / \    \ \ / / |_ _| |  \/  |
 | ' /  |  _|   | |_) | |  _|   | |\/| |   / /     / _ \    \ V /   | |  | |\/| |
 | . \  | |___  |  _ <  | |___  | |  | |  / /_    / ___ \    | |    | |  | |  | |
 |_|\_\ |_____| |_| \_\ |_____| |_|  |_| /____|  /_/   \_\   |_|   |___| |_|  |_|
                                                                                 
 ===============================================================================
 DOSYA: 3 - public/src/renderer.js (Frontend Mantığı)
 ===============================================================================
 
 KOD HARİTASI:
 3.1 - Kütüphane ve DOM Elementleri
 3.2 - Yükleme Ekranı (Loading Screen Logic)
 3.3 - Yardımcı UI Fonksiyonları (Alerts, Window Controls)
 3.4 - Filtreleme Mantığı
 3.5 - Uygulama Yönetimi (Ekleme, Listeleme, Silme, Düzenleme)
 3.6 - Konsol Sayfası Mantığı
 3.7 - Otomatik Başlatma Yöneticisi Mantığı
 3.8 - IPC Dinleyicileri (Loglar, Kaynak Takibi, Durum)
 3.9 - Ghost Process Tarama Mantığı (Sonsuz Dönüş Fixi)
*/

// 3.1 - Kütüphane ve DOM Elementleri
const { ipcRenderer } = require("electron");

const appGrid = document.getElementById("appGrid");
const dashboardView = document.getElementById("dashboard-view");
const consoleView = document.getElementById("console-view");
const terminalOutput = document.getElementById("terminal-output");
const activeAppName = document.getElementById("activeAppName");
const activeAppPath = document.getElementById("activeAppPath");
const liveBadge = document.getElementById("liveBadge");
const toggleProcessBtn = document.getElementById("toggleProcessBtn");
const statsContainer = document.getElementById("statsContainer");
const cpuValue = document.getElementById("cpuValue");
const memValue = document.getElementById("memValue");

const openAutoStartManagerBtn = document.getElementById(
  "openAutoStartManagerBtn"
);
const openSettingsBtn = document.getElementById("openSettingsBtn");
const autoStartModal = document.getElementById("autoStartModal");
const autoStartListContainer = document.getElementById(
  "autoStartListContainer"
);
const settingsModal = document.getElementById("settingsModal");
const settingStartMinimized = document.getElementById("settingStartMinimized");
const winAutoStartToggle = document.getElementById("winAutoStartToggle");
const closeAutoStartModalBtn = document.getElementById(
  "closeAutoStartModalBtn"
);
const closeAutoStartBtn = document.getElementById("closeAutoStartBtn");
const closeSettingsModalBtn = document.getElementById("closeSettingsModalBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const manualCheckUpdateBtn = document.getElementById("manualCheckUpdateBtn");
const currentVerText = document.getElementById("currentVerText");
const updateStatusMsg = document.getElementById("updateStatusMsg");
const autoUpdateToggle = document.getElementById("autoUpdateToggle");

const filterDropdownBtn = document.getElementById("filterDropdownBtn");
const filterDropdownMenu = document.getElementById("filterDropdownMenu");
const editModal = document.getElementById("editModal");
const editNameInput = document.getElementById("editName");
const editPathInput = document.getElementById("editPath");
const editAutoStartInput = document.getElementById("editAutoStart");
const selectedIconDisplay = document.getElementById("selectedIconDisplay");
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const scanModal = document.getElementById("scanModal");
const scanResultsList = document.getElementById("scanResultsList");
const scanGhostsBtn = document.getElementById("scanGhostsBtn");
const closeScanModalBtn = document.getElementById("closeScanModalBtn");
const closeScanBtn = document.getElementById("closeScanBtn");
const alertModal = document.getElementById("alertModal");
const closeAlertModalBtn = document.getElementById("closeAlertModalBtn");

const loadingScreen = document.getElementById("loading-screen");

let currentViewingApp = null;
let currentAppPid = null;
let currentEditingAppId = null;
let currentSelectedIcon = "🚀";
let appLogs = {};
let currentFilter = "all";
let appToDeleteId = null;
let updateDotsInterval = null;

// 3.2 - Yükleme Ekranı (Loading Screen Logic)
document.addEventListener("DOMContentLoaded", async () => {
  setTimeout(async () => {
    if (loadingScreen) {
      loadingScreen.style.opacity = "0";
      loadingScreen.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 500);
    }
    await loadAndRenderApps();
  }, 3000);
});

// 3.3 - Yardımcı UI Fonksiyonları (Alerts, Window Controls)
function showCustomAlert(message, title = "Bilgi") {
  const titleEl = document.getElementById("alertTitle");
  const msgEl = document.getElementById("alertMessage");
  if (titleEl) titleEl.innerText = title;
  if (msgEl) msgEl.innerText = message;
  if (alertModal) alertModal.style.display = "flex";
}

if (closeAlertModalBtn)
  closeAlertModalBtn.addEventListener(
    "click",
    () => (alertModal.style.display = "none")
  );

const minBtn = document.getElementById("minBtn");
const maxBtn = document.getElementById("maxBtn");
const closeBtn = document.getElementById("closeBtn");

if (minBtn)
  minBtn.addEventListener("click", () => ipcRenderer.send("minimize-window"));
if (maxBtn)
  maxBtn.addEventListener("click", () => ipcRenderer.send("maximize-window"));
if (closeBtn)
  closeBtn.addEventListener("click", () => ipcRenderer.send("close-window"));

// 3.4 - Filtreleme Mantığı
if (filterDropdownBtn) {
  filterDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    filterDropdownMenu.classList.toggle("show");
  });
}
window.addEventListener("click", () => {
  if (filterDropdownMenu) filterDropdownMenu.classList.remove("show");
});

window.applyFilter = (filterType) => {
  currentFilter = filterType;
  if (filterDropdownBtn)
    filterDropdownBtn.classList.toggle(
      "filter-active-state",
      filterType !== "all"
    );
  if (filterDropdownMenu) filterDropdownMenu.classList.remove("show");
  loadAndRenderApps();
};

// 3.5 - Uygulama Yönetimi (Ekleme, Listeleme, Silme, Düzenleme)
async function loadAndRenderApps() {
  const apps = await ipcRenderer.invoke("get-apps");
  renderApps(apps);
}

const addBtn = document.getElementById("addBtn");
const addChoiceModal = document.getElementById("addChoiceModal");
const selectJsFileBtn = document.getElementById("selectJsFileBtn");
const selectNpmScriptBtn = document.getElementById("selectNpmScriptBtn");
const npmScriptModal = document.getElementById("npmScriptModal");
const npmScriptsList = document.getElementById("npmScriptsList");

if (addBtn) {
  addBtn.addEventListener("click", () => {
    if (addChoiceModal) addChoiceModal.style.display = "flex";
  });
}

if (selectJsFileBtn) {
  selectJsFileBtn.addEventListener("click", async () => {
    addChoiceModal.style.display = "none";
    const filePath = await ipcRenderer.invoke("select-file");
    if (filePath) {
      const apps = await ipcRenderer.invoke("get-apps");
      if (apps.some((app) => app.path === filePath))
        return showCustomAlert("Bu proje zaten ekli!", "Uyarı");
      const newApp = {
        id: Date.now(),
        name: filePath.replace(/^.*[\\\/]/, ""),
        path: filePath,
        icon: "🚀",
        autoStart: false,
        type: "js",
      };
      ipcRenderer.send("add-app", newApp);
    }
  });
}

if (selectNpmScriptBtn) {
  selectNpmScriptBtn.addEventListener("click", async () => {
    addChoiceModal.style.display = "none";
    const folderPath = await ipcRenderer.invoke("select-folder");
    if (folderPath) {
      const scripts = await ipcRenderer.invoke("read-package-scripts", folderPath);
      if (!scripts || Object.keys(scripts).length === 0) {
        return showCustomAlert("package.json bulunamadı veya scripts boş!", "Hata");
      }
      showNpmScripts(folderPath, scripts);
    }
  });
}

function showNpmScripts(folderPath, scripts) {
  if (!npmScriptsList) return;
  npmScriptsList.innerHTML = "";
  
  Object.entries(scripts).forEach(([name, cmd]) => {
    const item = document.createElement("div");
    item.className = "script-item";
    item.innerHTML = `
      <div style="display:flex; flex-direction:column;">
        <div class="script-name">${name}</div>
        <div class="script-cmd" title="${cmd}">${cmd}</div>
      </div>
      <button class="btn-select-script">SEÇ</button>
    `;
    item.querySelector(".btn-select-script").addEventListener("click", () => {
      addNpmApp(folderPath, name);
      if (npmScriptModal) npmScriptModal.style.display = "none";
    });
    npmScriptsList.appendChild(item);
  });
  
  if (npmScriptModal) npmScriptModal.style.display = "flex";
}

async function addNpmApp(folderPath, scriptName) {
  const apps = await ipcRenderer.invoke("get-apps");
  // Check if same folder and script already added
  if (apps.some((app) => app.path === folderPath && app.script === scriptName)) {
    return showCustomAlert("Bu script zaten ekli!", "Uyarı");
  }

  const newApp = {
    id: Date.now(),
    name: `${folderPath.replace(/^.*[\\\/]/, "")} (${scriptName})`,
    path: folderPath,
    icon: "📦",
    autoStart: false,
    type: "npm",
    script: scriptName,
  };
  ipcRenderer.send("add-app", newApp);
}

ipcRenderer.on("update-app-list", (event, apps) => {
  renderApps(apps);
  if (editModal) editModal.style.display = "none";
});

async function renderApps(apps) {
  if (!appGrid) return;
  appGrid.innerHTML = "";
  const appsWithStatus = await Promise.all(
    apps.map(async (app) => ({
      ...app,
      isRunning: await ipcRenderer.invoke("get-process-status", app.id),
    }))
  );

  let filtered = appsWithStatus;
  if (currentFilter === "running")
    filtered = appsWithStatus.filter((a) => a.isRunning);
  else if (currentFilter === "stopped")
    filtered = appsWithStatus.filter((a) => !a.isRunning);

  if (filtered.length === 0) {
    appGrid.innerHTML = `<div style="text-align:center; color:#555; grid-column:1/-1; margin-top:50px;">Henüz proje yok.</div>`;
    return;
  }

  filtered.forEach((app) => {
    const card = document.createElement("div");
    card.className = "app-card";
    const iconHtml =
      app.icon &&
      (app.icon.includes("/") ||
        app.icon.includes("\\") ||
        app.icon.includes(":"))
        ? `<img src="${app.icon}" class="app-icon-img">`
        : `<div class="app-icon-emoji">${app.icon || "🚀"}</div>`;

    const dotDisplay = app.isRunning ? "block" : "none";

    card.innerHTML = `
        <div class="app-status-dot" id="status-dot-${app.id}" style="display: ${dotDisplay}"></div>
        <button class="edit-card-btn" onclick="openEditModal(${app.id})">⚙️</button>
        <div class="app-icon-container">${iconHtml}</div>
        <div class="app-name">${app.name}</div>
    `;
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("edit-card-btn")) openConsolePage(app);
    });
    appGrid.appendChild(card);
  });
}

window.openEditModal = async (appId) => {
  const apps = await ipcRenderer.invoke("get-apps");
  const app = apps.find((a) => a.id === appId);
  if (!app) return;
  currentEditingAppId = appId;
  if (editNameInput) editNameInput.value = app.name;
  if (editPathInput) editPathInput.value = app.path;
  if (editAutoStartInput) editAutoStartInput.checked = !!app.autoStart;
  currentSelectedIcon = app.icon || "🚀";
  if (selectedIconDisplay)
    selectedIconDisplay.innerText =
      currentSelectedIcon.length > 5 ? "Resim Dosyası" : currentSelectedIcon;
  
  // Highlight currently selected icon element
  document.querySelectorAll(".preset-icon").forEach((el) => {
    if (el.innerText === currentSelectedIcon) el.classList.add("selected");
    else el.classList.remove("selected");
  });

  if (editModal) editModal.style.display = "flex";
};

window.selectIcon = (icon) => {
  currentSelectedIcon = icon;
  if (selectedIconDisplay) selectedIconDisplay.innerText = icon;

  // Visual feedback for selection
  document.querySelectorAll(".preset-icon").forEach((el) => {
    if (el.innerText === icon) el.classList.add("selected");
    else el.classList.remove("selected");
  });
};

const uploadImgBtn = document.getElementById("uploadImgBtn");
if (uploadImgBtn) {
  uploadImgBtn.addEventListener("click", async () => {
    const imgPath = await ipcRenderer.invoke("select-image");
    if (imgPath) {
      currentSelectedIcon = imgPath;
      if (selectedIconDisplay) selectedIconDisplay.innerText = "Resim Dosyası";
    }
  });
}

const changePathBtn = document.getElementById("changePathBtn");
if (changePathBtn) {
  changePathBtn.addEventListener("click", async () => {
    const newPath = await ipcRenderer.invoke("select-file");
    if (newPath && editPathInput) editPathInput.value = newPath;
  });
}

const saveEditBtn = document.getElementById("saveEditBtn");
if (saveEditBtn) {
  saveEditBtn.addEventListener("click", () => {
    ipcRenderer.send("edit-app", {
      id: currentEditingAppId,
      name: editNameInput.value,
      path: editPathInput.value,
      icon: currentSelectedIcon,
      autoStart: editAutoStartInput.checked,
    });
  });
}

const deleteAppBtn = document.getElementById("deleteAppBtn");
if (deleteAppBtn)
  deleteAppBtn.addEventListener("click", () => {
    if (editModal) editModal.style.display = "none";
    appToDeleteId = currentEditingAppId;
    if (deleteModal) deleteModal.style.display = "flex";
  });

if (confirmDeleteBtn)
  confirmDeleteBtn.addEventListener("click", () => {
    if (appToDeleteId) {
      ipcRenderer.send("delete-app", appToDeleteId);
      appToDeleteId = null;
      if (deleteModal) deleteModal.style.display = "none";
    }
  });
if (cancelDeleteBtn)
  cancelDeleteBtn.addEventListener("click", () => {
    appToDeleteId = null;
    if (deleteModal) deleteModal.style.display = "none";
  });

const closeModalBtn = document.getElementById("closeModalBtn");
if (closeModalBtn)
  closeModalBtn.addEventListener("click", () => {
    if (editModal) editModal.style.display = "none";
  });

const cancelEditBtn = document.getElementById("cancelEditBtn");
if (cancelEditBtn)
  cancelEditBtn.addEventListener("click", () => {
    if (editModal) editModal.style.display = "none";
  });

// 3.6 - Konsol Sayfası Mantığı
async function openConsolePage(app) {
  currentViewingApp = app;
  if (activeAppName) activeAppName.innerText = app.name;
  if (activeAppPath) {
    activeAppPath.innerText = app.path;
    activeAppPath.title = app.path;
  }

  if (appLogs[app.id]) terminalOutput.innerText = appLogs[app.id];
  else {
    terminalOutput.innerText = `> Konsol hazır: ${app.name}\n> Başlatmak için butona basın.\n\n`;
    appLogs[app.id] = terminalOutput.innerText;
  }

  setTimeout(() => {
    if (terminalOutput) terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }, 50);
  if (dashboardView) dashboardView.style.display = "none";
  if (consoleView) consoleView.style.display = "flex";

  await updateStatusUI(app.id);
  const pid = await ipcRenderer.invoke("get-process-pid", app.id);
  currentAppPid = pid || null;
  if (statsContainer) statsContainer.style.display = pid ? "flex" : "none";
}

const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    if (consoleView) consoleView.style.display = "none";
    if (dashboardView) dashboardView.style.display = "block";
    currentViewingApp = null;
    currentAppPid = null;
    if (statsContainer) statsContainer.style.display = "none";
    loadAndRenderApps();
  });
}

// 3.7 - Otomatik Başlatma Yöneticisi Mantığı
const openAutoStartModal = async () => {
  const apps = await ipcRenderer.invoke("get-apps");
  autoStartListContainer.innerHTML = "";
  if (apps.length === 0) {
    autoStartListContainer.innerHTML = `<div style="padding:15px; text-align:center; color:#666;">Hiç proje yok.</div>`;
  } else {
    apps.forEach((app) => {
      const row = document.createElement("div");
      row.style.cssText =
        "display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #222;";
      const isChecked = app.autoStart ? "checked" : "";
      const iconShow = app.icon && app.icon.length < 5 ? app.icon : "🚀";
      row.innerHTML = `
                  <div style="display:flex; align-items:center; gap:10px;">
                      <span style="font-size:18px;">${iconShow}</span>
                      <span style="font-size:14px; font-weight:500;">${app.name}</span>
                  </div>
                  <label class="switch" style="display:flex; align-items:center;">
                      <input type="checkbox" ${isChecked} onchange="toggleAutoStartFromList(${app.id}, this.checked)">
                      <span class="slider" style="position:relative; width:34px; height:20px; display:inline-block; margin-right:0;"></span>
                  </label>
              `;
      autoStartListContainer.appendChild(row);
    });
  }
  if (autoStartModal) autoStartModal.style.display = "flex";
};

const openSystemSettings = async () => {
  const settings = await ipcRenderer.invoke("get-settings");
  if (settingStartMinimized) settingStartMinimized.checked = !!settings.startMinimized;
  if (winAutoStartToggle) winAutoStartToggle.checked = !!settings.windowsStart;
  if (autoUpdateToggle) autoUpdateToggle.checked = !!settings.autoUpdate;
  if (settingsModal) settingsModal.style.display = "flex";
};

if (openAutoStartManagerBtn) {
  openAutoStartManagerBtn.addEventListener("click", openAutoStartModal);
}

if (openSettingsBtn) {
  openSettingsBtn.addEventListener("click", openSystemSettings);
}

if (closeSettingsModalBtn) {
  closeSettingsModalBtn.addEventListener("click", () => {
    if (settingsModal) settingsModal.style.display = "none";
  });
}

if (closeSettingsBtn) {
  closeSettingsBtn.addEventListener("click", () => {
    if (settingsModal) settingsModal.style.display = "none";
  });
}

if (settingStartMinimized) {
  settingStartMinimized.addEventListener("change", (e) => {
    ipcRenderer.send("update-settings", { startMinimized: e.target.checked });
  });
}

if (winAutoStartToggle) {
  winAutoStartToggle.addEventListener("change", (e) => {
    ipcRenderer.send("update-settings", { windowsStart: e.target.checked });
  });
}

if (autoUpdateToggle) {
  autoUpdateToggle.addEventListener("change", (e) => {
    ipcRenderer.send("update-settings", { autoUpdate: e.target.checked });
  });
}

if (manualCheckUpdateBtn) {
  manualCheckUpdateBtn.addEventListener("click", () => {
    if (updateDotsInterval) clearInterval(updateDotsInterval);
    
    let dots = 0;
    if (updateStatusMsg) updateStatusMsg.innerText = "Denetleniyor";
    
    updateDotsInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      if (updateStatusMsg) updateStatusMsg.innerText = "Denetleniyor" + ".".repeat(dots);
    }, 500);
    
    ipcRenderer.send("check-for-updates");
  });
}

window.toggleAutoStartFromList = (appId, isEnabled) => {
  ipcRenderer.send("update-auto-start", { appId, enabled: isEnabled });
};

if (closeAutoStartModalBtn)
  closeAutoStartModalBtn.addEventListener(
    "click",
    () => (autoStartModal.style.display = "none")
  );
if (closeAutoStartBtn)
  closeAutoStartBtn.addEventListener(
    "click",
    () => (autoStartModal.style.display = "none")
  );

// 3.8 - IPC Dinleyicileri (Loglar, Kaynak Takibi, Durum)
ipcRenderer.on("process-log", (event, { appId, log }) => {
  if (!appLogs[appId]) appLogs[appId] = "";
  appLogs[appId] += log;
  if (currentViewingApp && currentViewingApp.id === appId && terminalOutput) {
    terminalOutput.innerText += log;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
});

ipcRenderer.on("resource-update", (event, stats) => {
  if (
    consoleView &&
    consoleView.style.display !== "none" &&
    currentAppPid &&
    stats[currentAppPid]
  ) {
    if (statsContainer) statsContainer.style.display = "flex";
    if (cpuValue)
      cpuValue.innerText = stats[currentAppPid].cpu.toFixed(1) + "%";
    if (memValue)
      memValue.innerText =
        (stats[currentAppPid].memory / 1024 / 1024).toFixed(1) + " MB";
  }
});

ipcRenderer.on("process-started", (event, { appId, pid }) => {
  if (currentViewingApp && currentViewingApp.id === appId) currentAppPid = pid;
});

ipcRenderer.on("app-status-change", async (event, { appId, isRunning }) => {
  if (dashboardView && dashboardView.style.display !== "none") {
    await loadAndRenderApps();
  } else {
    const dot = document.getElementById(`status-dot-${appId}`);
    if (dot) dot.style.display = isRunning ? "block" : "none";
  }

  if (currentViewingApp && currentViewingApp.id === appId) {
    await updateStatusUI(appId);
    if (isRunning) {
      const pid = await ipcRenderer.invoke("get-process-pid", appId);
      if (pid) {
        currentAppPid = pid;
        if (statsContainer) statsContainer.style.display = "flex";
      }
    } else {
      currentAppPid = null;
      if (statsContainer) statsContainer.style.display = "none";
    }
  }
});

ipcRenderer.on("version-info", (event, version) => {
  if (currentVerText) currentVerText.innerText = "v" + version;
});

ipcRenderer.on("update-status", (event, msg) => {
  if (updateDotsInterval) {
    clearInterval(updateDotsInterval);
    updateDotsInterval = null;
  }
  if (updateStatusMsg) updateStatusMsg.innerText = msg;
});

async function updateStatusUI(appId) {
  const isRunning = await ipcRenderer.invoke("get-process-status", appId);
  if (isRunning) {
    if (toggleProcessBtn) {
      toggleProcessBtn.innerHTML = "Durdur 🟥";
      toggleProcessBtn.className = "action-btn stop";
      toggleProcessBtn.disabled = false;
    }
    if (liveBadge) liveBadge.style.display = "flex";
  } else {
    if (toggleProcessBtn) {
      toggleProcessBtn.innerHTML = "Başlat ▶";
      toggleProcessBtn.className = "action-btn start";
      toggleProcessBtn.disabled = false;
    }
    if (liveBadge) liveBadge.style.display = "none";
  }
}

if (toggleProcessBtn) {
  toggleProcessBtn.addEventListener("click", async () => {
    if (!currentViewingApp) return;
    const isRunning = await ipcRenderer.invoke(
      "get-process-status",
      currentViewingApp.id
    );
    toggleProcessBtn.disabled = true;
    if (isRunning) {
      ipcRenderer.send("stop-process", currentViewingApp.id);
      toggleProcessBtn.innerText = "Durduruluyor...";
      if (statsContainer) statsContainer.style.display = "none";
      currentAppPid = null;
    } else {
      ipcRenderer.send("start-process", currentViewingApp);
      toggleProcessBtn.innerText = "Başlatılıyor...";
    }
    setTimeout(() => {
      if (currentViewingApp) updateStatusUI(currentViewingApp.id);
    }, 500);
  });
}

// 3.9 - Ghost Process Tarama Mantığı (Sonsuz Dönüş Fixi)
if (scanGhostsBtn) {
  scanGhostsBtn.addEventListener("click", async () => {
    const icon = scanGhostsBtn.querySelector("svg");
    if (icon) icon.classList.add("spinning");

    try {
      const ghosts = await ipcRenderer.invoke("scan-ghost-processes");
      showScanResults(ghosts);
    } catch (err) {
      showCustomAlert("Hata: " + err, "Hata");
    } finally {
      if (icon) icon.classList.remove("spinning");
    }
  });
}

function showScanResults(ghosts) {
  if (!scanResultsList) return;
  scanResultsList.innerHTML = "";
  if (ghosts.length === 0)
    scanResultsList.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">Bulunamadı.</div>`;
  else {
    ghosts.forEach((ghost) => {
      const item = document.createElement("div");
      item.className = "scan-item";
      item.innerHTML = `
        <div class="scan-info">
            <div class="scan-name">👻 ${ghost.path.replace(
              /^.*[\\\/]/,
              ""
            )}</div>
            <div class="scan-path" title="${ghost.path}">${ghost.path}</div>
            <div class="scan-meta"><span>PID: ${ghost.pid}</span><span>PORT: ${
        ghost.port
      }</span></div>
        </div>
        <button class="btn-add-ghost">EKLE</button>`;
      item.querySelector(".btn-add-ghost").addEventListener("click", (e) => {
        addGhostApp(ghost);
        e.target.innerText = "EKLENDİ";
        e.target.disabled = true;
      });
      scanResultsList.appendChild(item);
    });
  }
  if (scanModal) scanModal.style.display = "flex";
}
function addGhostApp(g) {
  ipcRenderer.send("add-app", {
    id: Date.now(),
    name: g.path.replace(/^.*[\\\/]/, ""),
    path: g.path,
    icon: "👻",
    autoStart: false,
  });
}

if (closeScanModalBtn)
  closeScanModalBtn.addEventListener("click", () => {
    if (scanModal) scanModal.style.display = "none";
  });
if (closeScanBtn)
  closeScanBtn.addEventListener("click", () => {
    if (scanModal) scanModal.style.display = "none";
  });
