# 🚀 KZ Node Launcher

![Version](https://img.shields.io/badge/Version-1.1.2-purple?style=for-the-badge) ![Electron](https://img.shields.io/badge/Electron-39.2.7-blue?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge) ![Author](https://img.shields.io/badge/Author-Kerem%20Zayim-red?style=for-the-badge)

**KZ Node Launcher**, Node.js projelerinizi (botlar, sunucular, API'ler) tek bir merkezden yönetmenizi, izlemenizi ve otomatikleştirmenizi sağlayan, geliştirici dostu bir masaüstü uygulamasıdır. 

Modern arayüzü ve güçlü arka plan yönetimi ile projelerinizi terminal karmaşasından kurtarıp kontrolü size verir.

---

## 🔥 Yeni Nesil Özellikler (v1.1.2)

Uygulamanın bu sürümü, standart bir başlatıcıyı tam kapsamlı bir **Süreç Yönetim Sistemi**'ne dönüştürür:

*   🛡️ **Watchdog (Otomatik Diriltme):** Çöken veya hata veren projeleri 2 saniye içinde otomatik yeniden başlatarak 7/24 çalışma garantisi sunar.
*   📝 **Görsel .env Editörü:** Çift modlu (Metin/Görsel) gelişmiş editör ile çevre değişkenlerini Key-Value ızgarasında güvenle yönetin.
*   ⚡ **Kategoriden Toplu İşlem:** Projelerinizi kategorilere ayırın ve tek tıkla "Hepsini Başlat/Durdur" butonlarıyla yönetin.
*   🚦 **Akıllı Port Takibi:** Başlatma öncesi portun meşguliyetini denetler ve çakışmaları önceden size bildirir.
*   🧠 **Hafıza Koruması (Memory Guard):** Belirlediğiniz RAM limitini aşan süreçleri sisteminizi korumak için otomatik durdurur.
*   📂 **Hızlı Konum Erişimi:** Proje dosyalarına doğrudan konsol ekranındaki butonla Windows Explorer üzerinden ulaşın.
*   🎨 **Lüks Tasarım & Temalar:** 4 farklı premium tema (Cyber, Carbon, Frost, Mint) ve modern yuvarlak ikonlu ayarlar panel.
*   🔄 **Akıllı Güncelleme & Changelog:** Yeni sürümleri otomatik denetler, indirir ve ilk açılışta neyin değiştiğini GitHub'dan çekerek "Neler Yeni?" penceresiyle sunar.
*   🖋️ **Markdown Desteği:** Sürüm notlarını GitHub üzerinde yazdığınız şık formatta (listeler, kalın yazılar vb.) uygulama içinden doğrudan okuyun.

---

## 🏗️ Proje Yapısı

```text
Node-Launcher/
├── main.js                  # Backend (Electron Ana Süreci)
├── package.json             # Bağımlılıklar ve Uygulama Ayarları
├── changelog.md             # Sürüm Geçmişi ve Güncelleme Notları
└── public/
    ├── index.html           # Arayüz Yapısı
    └── src/
        ├── renderer.js      # Frontend Mantığı (UI Etkileşimleri)
        └── styles.css       # Tasarım ve CSS Animasyonları
```

---

## 🚀 Kurulum ve Geliştirme

Projeyi yerel ortamınızda çalıştırmak için:

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/KeremZayim/KZ-Process-Manager.git
    cd KZ-Process-Manager
    ```
2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```
3.  **Geliştirici Modunda Başlatın:**
    ```bash
    npm start
    ```
4.  **Kurulum Dosyası (.exe) Oluşturun:**
    ```bash
    npm run dist
    ```

---

## 🛠️ Kullanılan Teknolojiler

*   **Electron:** Güçlü masaüstü uygulama altyapısı.
*   **Node.js:** Verimli süreç yönetimi.
*   **PID Usage & Systeminfo:** Doğru kaynak kullanımı verileri.
*   **Electron Store & Updater:** Kalıcı ayarlar ve sorunsuz güncellemeler.

---

## 🤝 İletişim ve Destek

Önerileriniz veya karşılaştığınız hatalar için GitHub üzerinden **Issue** açabilirsiniz.

*   **Geliştirici:** [Kerem Zayim](https://github.com/KeremZayim)
*   **Proje Sayfası:** [KZ-Process-Manager](https://github.com/KeremZayim/KZ-Process-Manager)

Eğer bu proje işinize yarıyorsa bir **Yıldız (⭐)** bırakarak destek olabilirsiniz!

--- 

**Lisans:** MIT License
