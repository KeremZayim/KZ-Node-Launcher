# Release Notes / Sürüm Notları - v1.1.0

## [EN] English
### 🚀 New Features
- **Custom Dialog System**: Native Windows/Browser alert and confirm boxes have been replaced with premium, in-app themed modals.
- **Enhanced Ghost Process Management**:
    - **Quick Add**: You can now add "ghost" processes directly to your project list with a single click.
    - **Smart Filtering**: Projects already added to the launcher (including those started via `npm`) are now automatically filtered out from the ghost scan.
- **Dashboard Sorting**: Added a new sorting menu next to the filter button. You can now sort your projects by **Status (Online first)**, **Name (A-Z)**, and **Name (Z-A)**.
- **Log Management & Tools**:
    - **Clear All Logs**: Added a "Clear All Logs" tool to permanently delete historical log files and free up space.
    - **Improved Terminal**: Added ANSI color stripping for cleaner logs and a more reliable auto-scroll mechanism.

### 🎨 UI & UX Improvements
- **Sidebar Footer & GitHub Link**: Added a dedicated GitHub profile link to the sidebar with modern hover effects.
- **Modal Aesthetics**: Adjusted the opacity of modal overlays and cards for better legibility and a more refined glassmorphism look.
- **Update Check**: Restored the "Check for Updates" button to the settings menu for manual control.

### 🐛 Bug Fixes
- **NPM Ghost Filtering**: Resolved an issue where npm-started processes were still appearing as ghost processes despite being registered.
- **Sorting Direction**: Fixed the "By Status" sort order to ensure active processes always appear at the very top.

---

## [TR] Türkçe
### 🚀 Yeni Özellikler
- **Özel Diyalog Sistemi**: Standart Windows/Browser uyarı ve onay kutuları (alert/confirm), uygulamanın kendi temasına uygun premium modallarla değiştirildi.
- **Gelişmiş Dış Süreç Yönetimi**:
    - **Hızlı Ekleme**: Artık bulunan "ghost" süreçleri tek tıkla uygulama listenize dahil edebilirsiniz.
    - **Akıllı Filtreleme**: Launcher üzerinde ekli olan projeler (npm ile başlatılanlar dahil) artık dış süreç taramasında görünmez.
- **Dashboard Sıralama**: Filtreleme butonunun yanına yeni bir sıralama menüsü eklendi. Projeleri **Duruma Göre (Aktif Üstte)**, **İsim (A-Z)** ve **İsim (Z-A)** şeklinde dizebilirsiniz.
- **Log Yönetimi ve Araçlar**:
    - **Log Temizliği**: Tüm geçmiş log dosyalarını tek tıkla silmenizi sağlayan "Logları Temizle" özelliği eklendi.
    - **İyileştirilmiş Terminal**: Loglardaki renk kodları temizlendi ve otomatik kaydırma özelliği daha kararlı hale getirildi.

### 🎨 UI & UX Geliştirmeleri
- **Sidebar Footer ve GitHub Linki**: Sidebar'ın altına modern hover efektli doğrudan GitHub profil bağlantısı eklendi.
- **Modal Estetiği**: Açılır pencerelerin arka plan ve kart opaklıkları, okunabilirliği artıracak şekilde (Glassmorphism dengesi) optimize edildi.
- **Güncelleme Kontrolü**: "Güncellemeleri Denetle" butonu ayarlar menüsündeki yerine geri getirildi.

### 🐛 Hata Düzeltmeleri
- **NPM Filtreleme Hatası**: NPM üzerinden başlatılan süreçlerin, ekli oldukları halde dış süreç listesinde görünmesi hatası giderildi.
- **Sıralama Yönü**: "Duruma Göre" sıralamasında aktiflerin listenin en sonuna gitme sorunu düzeltilerek en başa sabitlendi.

---

# Release Notes / Sürüm Notları - v1.0.3

## [EN] English
### 🚀 New Features
- **Drag & Drop Reordering**: You can now reorder your project cards by simply dragging and dropping them within the grid.
- **"What's New" Modal**: A new modal automatically appears after an update to showcase the latest features and changes fetched directly from GitHub.
- **Premium UI Animations**: Added smoother transitions and micro-animations for a more refined user experience.

### 🎨 UI & UX Improvements
- **UI Stability**: Fixed flickering issues in the main dashboard and terminal views.
- **Synchronized Status Updates**: Improved the reliability of process status synchronization between the backend and frontend.
- **Enhanced Modal Layouts**: Refined the design of settings and project edit modals for better clarity.

### 🐛 Bug Fixes
- **Auto-Update Reliability**: Improved the update check logic and notification handling to ensure a smoother update process.
- **PID Tracking Fixes**: Resolved edge cases where process IDs were not correctly tracked after restarts.
- **Memory Leak Prevention**: Optimized resource monitoring to reduce background overhead.

---

## [TR] Türkçe
### 🚀 Yeni Özellikler
- **Sürükle ve Bırak ile Sıralama**: Proje kartlarını ızgara üzerinde sürükleyip bırakarak dilediğiniz gibi sıralayabilirsiniz.
- **"Neler Yeni?" Penceresi**: Güncelleme sonrası otomatik olarak açılan ve GitHub üzerinden son yenilikleri çeken yeni bir bilgilendirme ekranı eklendi.
- **Premium Arayüz Animasyonları**: Daha rafine bir kullanıcı deneyimi için akıcı geçişler ve mikro animasyonlar eklendi.

### 🎨 UI & UX Geliştirmeleri
- **Arayüz Kararlılığı**: Ana panel ve terminal görünümlerindeki titreme (flicker) sorunları giderildi.
- **Senkronize Durum Güncellemeleri**: Arka plan ve ön yüz arasındaki işlem durumu senkronizasyonunun güvenilirliği artırıldı.
- **Gelişmiş Modal Tasarımları**: Ayarlar ve proje düzenleme pencereleri daha net bir görünüm için optimize edildi.

### 🐛 Hata Düzeltmeleri
- **Güvenilir Otomatik Güncelleme**: Güncelleme kontrol mantığı ve bildirim yönetimi iyileştirilerek daha sorunsuz bir süreç sağlandı.
- **PID Takip Düzeltmeleri**: Yeniden başlatma sonrası işlem kimliklerinin (PID) yanlış eşleştiği uç durumlar giderildi.
- **Bellek Sızıntısı Önlemleri**: Kaynak izleme sistemi, arka plan yükünü azaltacak şekilde optimize edildi.

---

# Release Notes / Sürüm Notları - v1.0.2

## [EN] English
### 🚀 New Features
- **NPM Script Support**: You can now add projects by selecting a folder and choosing a script from `package.json` (e.g., `npm run dev`).
- **System Settings**: Added "Start Minimized" and "Windows Startup" options to the settings menu.
- **Enhanced Icon Selection**: The icon picker now features premium hover effects, scaling, and glowing selection feedback.
- **Expanded Icon Palette**: More emoji options added for project icons.

### 🎨 UI & UX Improvements
- **Original Aesthetics Restored**: Reverted the settings button to the original SVG icon and restored the classic modal design.
- **Improved Update UI**: The update check button now features a dynamic "Checking..." dots animation.
- **Tray Interaction**: Double-clicking the tray icon now brings the application to the front.
- **Console Layout**: Adjusted terminal view height to prevent overlapping with the GitHub logo.

### 🐛 Bug Fixes
- **NPM Status Fix**: Resolved an issue where NPM processes would incorrectly show as "Online" after being stopped.
- **Process Termination**: Improved signal handling for child processes to ensure accurate status reporting.
- **Version Display**: Fixed the version text to correctly reflect the current application version.

---

## [TR] Türkçe
### 🚀 Yeni Özellikler
- **NPM Script Desteği**: Artık klasör seçerek `package.json` içindeki scriptleri (örneğin: `npm run dev`) listeleyip ekleyebilirsiniz.
- **Sistem Ayarları**: Ayarlar menüsüne "Küçültülmüş Olarak Başlat" ve "Windows Başlangıcında Çalıştır" seçenekleri eklendi.
- **Gelişmiş İkon Seçimi**: İkon seçim menüsüne büyüme (scale), gölge ve parlama efektleri eklendi.
- **Genişletilmiş İkon Paleti**: Projeler için daha fazla emoji seçeneği eklendi.

### 🎨 UI & UX Geliştirmeleri
- **Orijinal Görünüm Restorasyonu**: Ayarlar butonu orijinal SVG ikonuna döndürüldü ve klasik modal tasarımı geri getirildi.
- **Güncellenmiş Kontrol Arayüzü**: Güncelleme denetleme butonuna dinamik "Denetleniyor..." nokta animasyonu eklendi.
- **Tray Etkileşimi**: Sağ alt (tray) ikonuna çift tıklandığında uygulama artık direkt öne geliyor.
- **Konsol Yerleşimi**: Terminal ekranı, GitHub logosuyla çakışmayacak şekilde yeniden boyutlandırıldı.

### 🐛 Hata Düzeltmeleri
- **NPM Durum Hatası**: NPM projelerinin durdurulduktan sonra bile "Online" gözükmesi hatası giderildi.
- **İşlem Sonlandırma**: Alt işlemlerin (child processes) kapanış sinyalleri iyileştirilerek durum bilgisinin doğruluğu sağlandı.
- **Versiyon Gösterimi**: Ayarlar menüsündeki versiyon bilgisinin doğru yansıması sağlandı.
