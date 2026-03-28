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
