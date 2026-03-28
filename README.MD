# 🚀 KZ Node Launcher

![Version](https://img.shields.io/badge/version-1.0.3-blue.svg) ![Electron](https://img.shields.io/badge/Electron-39.2.7-green.svg) ![License](https://img.shields.io/badge/license-ISC-orange.svg) ![Author](https://img.shields.io/badge/Author-Kerem%20Zayim-red)

**KZ Node Launcher**, Node.js projelerinizi (botlar, sunucular, API'ler) tek bir merkezden yönetmenizi, izlemenizi ve otomatikleştirmenizi sağlayan, geliştirici dostu bir masaüstü uygulamasıdır. 

Modern arayüzü ve güçlü arka plan yönetimi ile projelerinizi terminal karmaşasından kurtarıp kontrolü size verir.

<img width="1097" height="747" alt="Node Launcher Dashboard" src="https://github.com/user-attachments/assets/57a6204c-48ab-489f-86e8-b32f9b8b2eb7" />

---

## ✨ Temel Özellikler

*   **📂 Akıllı Proje Yönetimi:** .js dosyalarını doğrudan ekleyebilir veya `package.json` üzerinden **NPM scriptlerini** (dev, start vb.) otomatik içe aktarabilirsiniz.
*   **🖱️ Gelişmiş Sürükle-Bırak:** Proje kartlarınızı ana ekranda sürükleyip bırakarak dilediğiniz gibi sıralayın.
*   **📊 Anlık Kaynak Takibi:** Her projenin kullandığı **CPU** ve **RAM** miktarını gerçek zamanlı grafiklerle izleyin.
*   **👻 Hayalet İşlem Tespiti:** Uygulama dışından (terminal vb.) başlattığınız projeleri otomatik tespit eder ve panele entegre eder.
*   **⚡ Otomatik Başlatma:** Bilgisayar açıldığında veya uygulama başladığında kritik projelerinizin otomatik çalışmasını sağlayın.
*   **🛠️ Entegre Konsol:** Her projenin loglarını renkli ve temiz bir terminal arayüzünde takip edin.
*   **📥 Sistem Tepsisi (Tray):** Uygulamayı kapatsanız bile arka planda çalışmaya devam eder, tray simgesinden hızlıca yönetebilirsiniz.
*   **🎨 Modern Dark UI:** Göz yormayan, premium animasyonlarla desteklenen şık karanlık tema.
*   **🔄 Otomatik Güncelleme:** GitHub üzerinden yeni sürümleri otomatik denetler ve "Neler Yeni?" bilgilendirmesi sunar.

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

**Lisans:** ISC License