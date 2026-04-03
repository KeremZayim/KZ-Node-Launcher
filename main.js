/*
  _  __  _____   ____    _____   __  __   _____      _     __   __  ___   __  __ 
 | |/ / | ____| |  _ \  | ____| |  \/  | |__  /     / \    \ \ / / |_ _| |  \/  |
 | ' /  |  _|   | |_) | |  _|   | |\/| |   / /     / _ \    \ V /   | |   | |\/| |
 | . \  | |___  |  _ <  | |___  | |  | |  / /_    / ___ \    | |    | |   | |\/| |
 |_|\_\ |_____| |_| \_\ |_____| |_|  |_| /____|  /_/   \_\   |_|   |___| |_|  |_|
                                                                                
 ===============================================================================
 DOSYA: 1 - main.js (Backend) - FIX: UI FLICKER & STABLE STATUS
 ===============================================================================
*/

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Tray,
  Menu,
  nativeImage,
  shell,
} = require("electron");
const path = require("path");
const Store = require("electron-store");
const fs = require("fs");
const net = require("net");
const { spawn, exec } = require("child_process");
const pidusage = require("pidusage");
const { autoUpdater } = require("electron-updater"); // Yeni
const log = require("electron-log"); // Yeni

const store = new Store();
// --- TEKİL ÖRNEK KİLİDİ (SINGLE INSTANCE LOCK) ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // Eğer kilit alınamadıysa (yani program zaten açıksa), bu ikinci kopyayı kapat
  app.quit();
} else {
  // İkinci bir kopya açılmaya çalışıldığında tetiklenir
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore(); // Simge durumundaysa geri getir
      if (!mainWindow.isVisible()) mainWindow.show(); // Gizliyse (Tray'deyse) göster
      mainWindow.focus(); // Pencereyi öne getir ve odaklan
    }
  });
}

let mainWindow;
let tray = null;
let isQuitting = false;
let runningProcesses = {};
let isInitialScanDone = false;

// AutoUpdater Ayarları
autoUpdater.logger = log;
autoUpdater.autoDownload = store.get("settings.autoUpdate", true);

// --- 1. PENCERE OLUŞTURMA ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: "#121212",
    frame: false,
    titleBarStyle: "hidden",
    icon: path.join(__dirname, "public/images/icon.png"),
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  mainWindow.loadFile("public/index.html");
  mainWindow.webContents.on("did-finish-load", () => {
    if (!isInitialScanDone) setTimeout(runWatchdog, 1000);
  });

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
  // Versiyon bilgisini frontend'e gönder
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("version-info", app.getVersion());
  });

  // Güncelleme Olay Dinleyicileri
  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send(
      "update-status",
      `Yeni sürüm bulundu (v${info.version}). İndiriliyor...`
    );
  });

  autoUpdater.on("download-progress", (progressObj) => {
    let log_message = "İndiriliyor: %" + Math.floor(progressObj.percent);
    mainWindow.webContents.send("update-status", log_message);
  });
  autoUpdater.on("update-downloaded", (info) => {
    mainWindow.webContents.send(
      "update-status",
      "Güncelleme hazır. 5 saniye içinde kurulacak..."
    );

    // Kullanıcıyı bekletmeden veya zorlayarak kurmak için:
    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 5000);
  });

  autoUpdater.on("error", (err) => {
    // Hatanın detayını frontend'e gönder
    mainWindow.webContents.send("update-status", "Hata: " + err.message);
    console.error("GÜNCELLEME DETAYLI HATA:", err);
  });


  // Güncelleme bulunamadığında "Denetleniyor" yazısında takılmaması için:
  autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("update-status", "Uygulama güncel.");
  });

  mainWindow.webContents.on("did-finish-load", async () => {
    const lastRunVersion = store.get("lastRunVersion", "0.0.0");
    const currentVersion = app.getVersion();

    // Sürüm değiştiyse (İlk açılış veya Güncelleme sonrası)
    if (currentVersion !== lastRunVersion) {
      log.info(`Sürüm değişti: ${lastRunVersion} -> ${currentVersion}. GitHub'dan notlar getiriliyor...`);
      
      try {
        const https = require("https");
        const options = {
          hostname: "api.github.com",
          path: `/repos/KeremZayim/KZ-Process-Manager/releases/tags/v${currentVersion}`,
          headers: { "User-Agent": "KZ-Node-Launcher" }
        };

        https.get(options, (res) => {
          let data = "";
          res.on("data", (chunk) => data += chunk);
          res.on("end", () => {
            const release = JSON.parse(data);
            if (release && release.body) {
              mainWindow.webContents.send("show-changelog", {
                version: currentVersion,
                body: release.body
              });
              // Başarıyla gösterildikten sonra yeni versiyonu kaydet
              store.set("lastRunVersion", currentVersion);
            }
          });
        }).on("error", (e) => {
          log.error("GitHub Changelog Fetch Hatası:", e);
        });
      } catch (err) {
        log.error("Changelog süreci başarısız:", err);
      }
    }
  });

}

// --- 2. TRAY MENÜSÜ ---
function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "public/images/icon.png")
  );
  tray = new Tray(icon);
  tray.on("click", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  tray.on("double-click", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  tray.setToolTip("KZ Node Launcher (v1.1.1)");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Paneli Göster", click: () => mainWindow.show() },
      { label: "Hepsini Durdur", click: stopAllProcesses },
      { label: "Destek", click: () => shell.openExternal("https://github.com/KeremZayim") },
      { type: "separator" },
      {
        label: "Cikis",
        click: async () => {
          const activeCount = Object.keys(runningProcesses).length;
          if (activeCount > 0) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send("request-exit-confirmation", activeCount);
          } else {
            isQuitting = true;
            app.quit();
          }
        },
      },
    ])
  );
}

ipcMain.on("confirm-exit", () => {
  isQuitting = true;
  app.quit();
});


ipcMain.on("open-folder", (event, folderPath) => {
  shell.showItemInFolder(folderPath);
});

ipcMain.on("open-terminal", (event, folderPath) => {
  const { exec } = require("child_process");
  const command = process.platform === "win32" ? "start cmd" : "open -a Terminal";
  exec(command, { cwd: folderPath });
});


// --- 3. OTOMATİK BAŞLATMA ---

function runAutoStartSequence() {
  const savedApps = store.get("apps") || [];
  savedApps.forEach((app) => {
    if (app.autoStart && !runningProcesses[app.id]) {
      startNodeProcess(app.id, app.path, true);
    }
  });
}

// --- 4. WATCHDOG (KARARLI TARAMA) ---
function runWatchdog() {
  const savedAppsCheck = store.get("apps") || [];
  if (savedAppsCheck.length === 0) {
    isInitialScanDone = true;
    return;
  }

  // Sadece node.exe süreçlerini al (Windows için)
  const wmicCommand = `wmic process where "name='node.exe'" get ProcessId,CommandLine /format:csv`;

  exec(wmicCommand, { maxBuffer: 10e6 }, (err, stdout) => {
    if (!isInitialScanDone) {
      isInitialScanDone = true;
      setTimeout(runAutoStartSequence, 500);
    }

    if (err || !stdout) return;

    const lines = stdout.trim().split(/[\r\n]+/);
    const systemProcesses = [];

    lines.forEach((line) => {
      const parts = line.split(",");
      if (parts.length < 2) return;
      const pid = parseInt(parts[parts.length - 1]);
      parts.pop();
      parts.shift();
      const cmdRaw = parts.join(",").toLowerCase().trim().replace(/\//g, "\\");
      if (pid) systemProcesses.push({ pid, cmd: cmdRaw });
    });

    const now = Date.now();

    savedAppsCheck.forEach((app) => {
      const existing = runningProcesses[app.id];
      const appPathNorm = path.normalize(app.path).toLowerCase();
      const appDirName = path.basename(path.dirname(appPathNorm)).toLowerCase();
      const appFileName = path.basename(appPathNorm).toLowerCase();

      // Sistemde bu projeyle eşleşen bir süreç var mı?
      const foundInSystem = systemProcesses.find((proc) => {
        // Başka bir kart tarafından halihazırda sahiplenilmiş PID'leri atla (existing hariç)
        const isClaimedByOther = Object.entries(runningProcesses).some(
          ([id, rp]) => rp.pid === proc.pid && id !== app.id.toString()
        );
        if (isClaimedByOther) return false;

        return (
          proc.cmd.includes(appPathNorm) ||
          (proc.cmd.includes(appDirName) && proc.cmd.includes(appFileName))
        );
      });

      if (foundInSystem) {
        // --- DURUM A: SÜREÇ BULUNDU ---
        if (!existing) {
          // Yeni tespit (Dış kaynak)
          runningProcesses[app.id] = {
            pid: foundInSystem.pid,
            external: true,
            lastSeen: now,
          };
          updateUI(app.id, true);
        } else {
          // Zaten vardı, bilgilerini güncelle
          existing.nodePid = foundInSystem.pid;
          existing.lastSeen = now;
        }
      } else {
        // --- DURUM B: SÜREÇ SİSTEMDE GÖRÜNMEDİ ---
        if (existing) {
          if (!existing.external) {
            // Eger bizim tarafimizdan baslatildiysa wmic taramasina guvenmeyip
            // kapanip kapanmadigina child.on('close') ile karar veriyoruz!
            return;
          }

          // Eğer süreç yeni başlatıldıysa (ilk 10 saniye) veya
          // geçici bir tarama hatasıysa hemen kapatma (5 saniye bekle)
          const age = now - (existing.startTime || 0);
          const silenceDuration = now - (existing.lastSeen || now);

          if (age < 10000 || silenceDuration < 5000) {
            // Henüz çok yeni veya kısa süreli bir kayıp, UI'yı bozma
            return;
          }

          // Gerçekten kapandığına ikna olduk
          delete runningProcesses[app.id];
          updateUI(app.id, false);
        }
      }
    });
  });
}

function updateUI(appId, isRunning) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("app-status-change", {
      appId: parseInt(appId),
      isRunning,
    });
  }
}

function stopProcessLogic(appId) {
  const proc = runningProcesses[appId];
  if (proc) {
    if (process.platform === "win32" && proc.pid) {
      exec(`taskkill /pid ${proc.pid} /T /F`);
    } else if (proc.kill) {
      proc.kill();
    }
    delete runningProcesses[appId];
    updateUI(appId, false);
  }
}

function stopAllProcesses() {
  Object.keys(runningProcesses).forEach((id) => stopProcessLogic(id));
}


app.whenReady().then(() => {
  createWindow();
  createTray();
  setInterval(runWatchdog, 3000);

  // EKLENEN: Ayar açıksa güncellemeleri denetle
  if (store.get("settings.autoUpdate", true)) {
    autoUpdater.checkForUpdatesAndNotify();
  }


  // Start Minimized Check
  const isHiddenArg = process.argv.includes('--hidden');
  const settings = store.get("settings") || { startMinimized: false };
  
  if (isHiddenArg || settings.startMinimized) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }

  setInterval(() => {
    const apps = store.get("apps") || [];
    const activePids = Object.entries(runningProcesses)
      .map(([id, p]) => ({ id, pid: p.nodePid || p.pid }))
      .filter(p => p.pid);

    if (activePids.length > 0 && mainWindow && !mainWindow.isDestroyed()) {
      const pidMap = activePids.reduce((acc, p) => ({ ...acc, [p.pid]: p.id }), {});
      
      pidusage(Object.keys(pidMap), (err, stats) => {
        if (!err && stats) {
          mainWindow.webContents.send("resource-update", stats);

          // MEMORY LIMIT CHECK
          Object.entries(stats).forEach(([pid, stat]) => {
            const appId = pidMap[pid];
            const appInfo = apps.find(a => a.id == appId);
            
            if (appInfo && appInfo.memoryLimit) {
              const memMB = stat.memory / 1024 / 1024;
              if (memMB > appInfo.memoryLimit) {
                stopProcessLogic(appId); // Kill it
                if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("process-log", {
                    appId,
                    log: `\n[LIMIT] Hafıza sınırı (${appInfo.memoryLimit} MB) aşıldı (Şu an: ${memMB.toFixed(1)} MB). Süreç güvenlik nedeniyle durduruldu.`,
                  });
                }
              }
            }
          });
        }
      });
    }
  }, 2000);
});

// 1.6 - Node İşlemi Başlatma Fonksiyonu
async function startNodeProcess(appId, appPath, isAuto = false) {
  if (runningProcesses[appId]) return;
  
  const apps = store.get("apps") || [];
  const appInfo = apps.find(a => a.id === appId);

  // PORT KONTROLÜ
  if (appInfo && appInfo.watchPort) {
    const inUse = await isPortInUse(appInfo.watchPort);
    if (inUse) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("process-log", {
          appId,
          log: `\n[HATA] Port ${appInfo.watchPort} şu an başka bir uygulama tarafından kullanılıyor! Başlatma iptal edildi.`,
        });
      }
      return;
    }
  }

  if (isAuto) console.log(`>> OTO-BASLATMA: ${path.basename(appPath)}`);
  
  let command, args, cwd;

  if (appInfo && appInfo.type === "npm") {
    // NPM Script handling
    command = "npm";
    args = ["--prefix", `"${appPath}"`, "run", appInfo.script];
    cwd = appPath; // For npm, path is the folder
  } else {
    // Legacy / Direct JS handling
    command = "node";
    args = [`"${appPath}"`];
    cwd = path.dirname(appPath);
  }

  const child = spawn(
    "cmd.exe",
    ["/c", `chcp 65001 > nul && ${command} ${args.join(" ")}`],
    {
      cwd: cwd,
      shell: true,
      env: { ...process.env, FORCE_COLOR: "true", LANG: "tr_TR.UTF-8" },
    }
  );


  // START_TIME ve LAST_SEEN ekleyerek Watchdog'a "bu sürece 10 saniye dokunma" diyoruz
  runningProcesses[appId] = {
    pid: child.pid,
    child: child,
    external: false,
    startTime: Date.now(),
    lastSeen: Date.now(),
    kill: () => child.kill(),
  };

  updateUI(appId, true);

  child.stdout.on("data", (data) => {
    const logStr = data.toString();
    appendToFileLog(appId, logStr); // Lokale kaydet
    if (mainWindow && !mainWindow.isDestroyed())
      mainWindow.webContents.send("process-log", {
        appId,
        log: logStr,
      });
  });

  child.stderr.on("data", (data) => {
    const logStr = `HATA: ${data.toString()}`;
    appendToFileLog(appId, logStr); // Lokale kaydet
    if (mainWindow && !mainWindow.isDestroyed())
      mainWindow.webContents.send("process-log", {
        appId,
        log: logStr,
      });
  });


  child.on("close", (code) => {
    const proc = runningProcesses[appId];
    if (proc && proc.child === child) {
      const isWatchdogEnabled = appInfo && appInfo.watchdog;
      
      delete runningProcesses[appId];
      updateUI(appId, false);

      if (mainWindow && !mainWindow.isDestroyed())
        mainWindow.webContents.send("process-log", {
          appId,
          log: `\n--- Kapanis (Kod: ${code}) ---`,
        });

      // WATCHDOG LOGIC
      if (isWatchdogEnabled && code !== 0 && code !== null) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("process-log", {
            appId,
            log: `\n[WATCHDOG] Beklenmedik kapanis tespit edildi. 2 saniye icinde yeniden baslatiliyor...`,
          });
        }
        setTimeout(() => {
          // Restart only if it's not already running (double check)
          if (!runningProcesses[appId]) {
            startNodeProcess(appId, appPath, true);
          }
        }, 2000);
      }
    }
  });
}

// IPC HANDLERS
ipcMain.on("minimize-window", () => mainWindow.minimize());
ipcMain.on("close-window", () => mainWindow.hide());
ipcMain.on("maximize-window", () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle("select-file", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "JavaScript", extensions: ["js"] }],
  });
  return result.filePaths[0];
});
ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  return result.filePaths[0];
});

ipcMain.handle("read-package-scripts", async (event, folderPath) => {
  const fs = require("fs");
  const packagePath = path.join(folderPath, "package.json");
  if (fs.existsSync(packagePath)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      return packageData.scripts || {};
    } catch (err) {
      console.error("package.json reading error:", err);
      return null;
    }
  }
  return null;
});

ipcMain.handle("get-logs", async (event, appId) => {
  const fs = require("fs");
  const logsDir = path.join(app.getPath("userData"), "logs");
  const logFile = path.join(logsDir, `app_${appId}.log`);
  if (fs.existsSync(logFile)) {
    try {
      const stats = fs.statSync(logFile);
      const size = stats.size;
      const readSize = Math.min(size, 100 * 1024); // Limit to 100KB
      const fd = fs.openSync(logFile, 'r');
      const buffer = Buffer.alloc(readSize);
      fs.readSync(fd, buffer, 0, readSize, size - readSize);
      fs.closeSync(fd);
      return buffer.toString("utf8");
    } catch (err) {
      console.error("Log reading error:", err);
      return "Loglar okunamadı.";
    }
  }
  return "Henüz log kaydı yok.";
});

// --- GRUP & PROJE YÖNETİMİ ---

ipcMain.handle("get-groups", () => store.get("groups") || []);

ipcMain.on("add-group", (event, groupName) => {
  const groups = store.get("groups") || [];
  const newGroup = { id: Date.now(), name: groupName };
  groups.push(newGroup);
  store.set("groups", groups);
  event.sender.send("update-group-list", groups);
});

ipcMain.on("edit-group", (event, { id, name }) => {
  let groups = store.get("groups") || [];
  const index = groups.findIndex(g => g.id === id);
  if (index !== -1) {
    groups[index].name = name;
    store.set("groups", groups);
    event.sender.send("update-group-list", groups);
  }
});

ipcMain.on("delete-group", (event, groupId) => {
  let groups = store.get("groups") || [];
  groups = groups.filter(g => g.id !== groupId);
  store.set("groups", groups);

  let apps = store.get("apps") || [];
  apps = apps.map(app => {
    if (app.groupId === groupId) delete app.groupId;
    return app;
  });
  store.set("apps", apps);
  
  event.sender.send("update-group-list", groups);
  event.sender.send("update-app-list", apps);
});

ipcMain.on("add-app", (event, appData) => {
  const apps = store.get("apps") || [];
  apps.push(appData);
  store.set("apps", apps);
  event.sender.send("update-app-list", apps);
});

ipcMain.handle("get-apps", () => store.get("apps") || []);

ipcMain.handle(
  "get-process-pid",
  (event, appId) => runningProcesses[appId]?.pid
);

ipcMain.handle(
  "get-process-status",
  (event, appId) => !!runningProcesses[appId]
);

ipcMain.on("start-process", (event, appInfo) =>
  startNodeProcess(appInfo.id, appInfo.path)
);

ipcMain.on("stop-process", (event, appId) => stopProcessLogic(appId));

ipcMain.on("edit-app", (event, updatedApp) => {

  let apps = store.get("apps") || [];
  const index = apps.findIndex((app) => app.id === updatedApp.id);
  if (index !== -1) {
    apps[index] = { ...apps[index], ...updatedApp };
    store.set("apps", apps);
    event.sender.send("update-app-list", apps);
  }
});

ipcMain.on("update-auto-start", (event, { appId, enabled }) => {
  const apps = store.get("apps") || [];
  const index = apps.findIndex((app) => app.id === appId);
  if (index !== -1) {
    apps[index].autoStart = enabled;
    store.set("apps", apps);
    event.sender.send("update-app-list", apps);
  }
});
ipcMain.on("delete-app", (event, appId) => {
  let apps = store.get("apps") || [];
  const newApps = apps.filter((app) => app.id !== appId);
  store.set("apps", newApps);
  event.sender.send("update-app-list", newApps);
});
ipcMain.handle("get-settings", () => {
  const settings = store.get("settings") || { startMinimized: false, windowsStart: false, autoUpdate: true };
  return {
    ...settings,
    winAutoStart: app.getLoginItemSettings().openAtLogin,
  };
});

ipcMain.on("update-settings", (event, newSettings) => {
  const settings = store.get("settings") || {};
  const updatedSettings = { ...settings, ...newSettings };
  store.set("settings", updatedSettings);

  if (newSettings.hasOwnProperty("windowsStart")) {
    app.setLoginItemSettings({
      openAtLogin: newSettings.windowsStart,
      path: app.getPath("exe"),
      args: ["--hidden"]
    });
  }
});

ipcMain.handle("scan-ghost-processes", async () => {
  const myPid = process.pid;
  const resultsMap = new Map();
  const savedApps = store.get("apps") || [];

  // Sistem servislerini hariç tutmak için
  const IGNORED_PATHS = ["\\windows\\system32", "svchost.exe"];

  try {
    // 1. ADIM: Netstat ile port dinleyen TÜM işlemleri çek
    // (Encoding sorunu olmaması için iconv veya chcp kullanılabilir ama basit regex iş görür)
    const netstat = await new Promise((resolve) => {
      exec("netstat -ano", { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
        if (err) resolve("");
        else resolve(stdout);
      });
    });

    const lines = netstat.split(/[\r\n]+/);

    for (const line of lines) {
      const lineTrimmed = line.trim();

      // Sadece TCP bağlantıları
      if (!lineTrimmed.startsWith("TCP")) continue;

      // Port durumu kontrolü (Türkçe/İngilizce uyumlu)
      const lineUpper = lineTrimmed.toUpperCase();
      const isListening =
        lineUpper.includes("LISTENING") ||
        lineUpper.includes("DINLIYOR") ||
        lineUpper.includes("DİNLİYOR");

      if (!isListening) continue;

      // Satırı parçala
      const parts = lineTrimmed.split(/\s+/);
      // PID en sondadır
      const pid = parseInt(parts[parts.length - 1]);
      // Port bilgisi 2. sıradadır (0.0.0.0:3000)
      const localAddress = parts[1];

      // KRİTİK FİLTRE: Kendi PID'imizi ve ZATEN YÖNETİLEN (ekli ve çalışan) PID'leri atla
      const managedPids = Object.values(runningProcesses).map(p => p.nodePid || p.pid);
      if (!pid || pid === myPid || managedPids.includes(pid)) continue;

      // Portu temizle (IP kısmını at)
      const port = localAddress.includes(":")
        ? localAddress.split(":").pop()
        : "???";

      // 2. ADIM: Bu PID kimin? (WMIC ile detay sor)
      // ExecutablePath ve CommandLine istiyoruz
      const wmicOutput = await new Promise((resolve) => {
        exec(
          `wmic process where processid=${pid} get CommandLine,ExecutablePath /format:csv`,
          { maxBuffer: 2 * 1024 * 1024 },
          (err, stdout) => resolve(stdout || "")
        );
      });

      // WMIC çıktısını temizle
      const wmicLines = wmicOutput.trim().split(/[\r\n]+/);
      // Başlık satırını atla, veri satırını al
      if (wmicLines.length < 2) continue;

      // Veri satırı virgülle ayrılmıştır ama CommandLine içinde de virgül olabilir.
      // Bu yüzden sondan (ExecutablePath) başa doğru gidelim ya da basitçe string check yapalım.
      const rawData = wmicLines.slice(1).join(" "); // Bazen birden fazla satıra taşabilir
      const lowerData = rawData.toLowerCase();

      // KRİTİK KONTROL: Bu bir Node.js işlemi mi?
      // Sadece node.exe veya electron.exe ise kabul et.
      const isNode =
        lowerData.includes("node.exe") || lowerData.includes("electron.exe");

      if (!isNode) continue;

      // --- PATH VE İSİM BULMA MANTIĞI ---
      let displayPath = "Bilinmeyen Konum";
      let displayName = `Node App (Port ${port})`;

      // 1. Deneme: .js dosyası var mı?
      const jsMatch = rawData.match(
        /(?:"|')([^"']+\.(?:js|mjs|cjs))(?:"|')|([^\s"']+\.(?:js|mjs|cjs))/i
      );

      // 2. Deneme: Eğer .js yoksa, 'npm start' gibi bir şey mi?
      // Genelde CommandLine içinde çalışılan klasör yazar

      if (jsMatch) {
        displayPath = jsMatch[1] || jsMatch[2];
        displayName = path.basename(displayPath);
      } else {
        // Dosya bulunamadı ama Node çalışıyor (Örn: REPL veya Binary)
        // ExecutablePath'i kullanabiliriz veya CommandLine'ın tamamını gösteririz
        displayPath = rawData.split(",").pop() || "Yol Bulunamadi"; // Kabaca path almaya çalış

        // Eğer yol çok uzunsa veya bozuksa temizle
        if (displayPath.length > 100) displayPath = "Komut Satiri Baslatmasi";

        displayName = "Node Script/Servis";
      }

      // Sistem dosyası koruması
      if (IGNORED_PATHS.some((p) => lowerData.includes(p))) continue;

      // Kayıtlı uygulamalarda zaten bu süreç var mı?
      const isAlreadyRegistered = savedApps.some(app => {
          const appPathNorm = path.normalize(app.path).toLowerCase();
          const ghostPathNorm = path.normalize(displayPath).toLowerCase();
          const cmdNorm = rawData.toLowerCase();

          // Yol eşleşmesi veya Komut Satırı içinde uygulamanın klasörünün geçmesi
          return ghostPathNorm.includes(appPathNorm) || 
                 appPathNorm.includes(ghostPathNorm) || 
                 cmdNorm.includes(appPathNorm);
      });

      if (isAlreadyRegistered) continue;

      // Benzersiz ID (PID + Port)
      const uniqueKey = `ghost_${pid}_${port}`;

      if (!resultsMap.has(uniqueKey)) {
        resultsMap.set(uniqueKey, {
          pid: pid,
          port: port,
          path: displayPath,
          name: `🌍 Port ${port} - ${displayName}`,
          memory: `PID: ${pid}`,
        });
      }
    }
  } catch (error) {
    console.error("Ghost scan hatasi:", error);
  }

  return [...resultsMap.values()];
});

ipcMain.handle("read-env", async (event, folderPath) => {
  const fs = require("fs");
  const envPath = path.join(folderPath, ".env");
  if (fs.existsSync(envPath)) {
    try {
      return fs.readFileSync(envPath, "utf8");
    } catch (err) {
      console.error("Env reading error:", err);
      return null;
    }
  }
  return null;
});

ipcMain.handle("save-env", async (event, { folderPath, content }) => {
  const fs = require("fs");
  const envPath = path.join(folderPath, ".env");
  try {
    fs.writeFileSync(envPath, content, "utf8");
    return { success: true };
  } catch (err) {
    console.error("Env saving error:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.on("run-maintenance", (event, { appId, appPath, command }) => {
  // npm install, npm update vb. için
  const child = spawn("cmd.exe", ["/c", `chcp 65001 > nul && npm ${command}`], {
    cwd: appPath,
    shell: true,
    env: { ...process.env, FORCE_COLOR: "true" }
  });

  child.stdout.on("data", (data) => {
    mainWindow.webContents.send("process-log", { appId, log: data.toString() });
  });

  child.stderr.on("data", (data) => {
    mainWindow.webContents.send("process-log", { appId, log: `HATA: ${data.toString()}` });
  });

  child.on("close", (code) => {
    mainWindow.webContents.send("process-log", { appId, log: `\n--- Bakım Tamamlandı (Kod: ${code}) ---` });
  });
});

ipcMain.handle("select-image", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Görseller", extensions: ["png", "jpg", "jpeg", "ico", "svg"] },
    ],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.on("reorder-apps", (event, newAppsList) => {
  store.set("apps", newAppsList);
  event.sender.send("update-app-list", newAppsList);
});

ipcMain.on("check-for-updates", () => {
  autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on("kill-ghost-process", (event, pid) => {
  if (process.platform === "win32") {
    exec(`taskkill /pid ${pid} /T /F`);
  } else {
    try {
      process.kill(pid, "SIGKILL");
    } catch (e) {
      console.error("Ghost kill error:", e);
    }
  }
});

ipcMain.handle("clear-all-logs", async () => {
    const fs = require("fs");
    const logsDir = path.join(app.getPath("userData"), "logs");
    if (fs.existsSync(logsDir)) {
        try {
            const files = fs.readdirSync(logsDir);
            for (const file of files) {
                fs.unlinkSync(path.join(logsDir, file));
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
    return { success: true };
});

// --- LOG YÖNETİMİ ---

function appendToFileLog(appId, logStr) {
  const fs = require("fs");
  const logsDir = path.join(app.getPath("userData"), "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  
  const logFile = path.join(logsDir, `app_${appId}.log`);
  fs.appendFileSync(logFile, `[${new Date().toLocaleString()}] ${logStr}`, "utf8");
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', (err) => resolve(err.code === 'EADDRINUSE'))
      .once('listening', () => server.close().once('close', () => resolve(false)))
      .listen(port);
  });
}




