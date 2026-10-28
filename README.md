# 🌯 M.T. DÖNER — Orijinal Berlin Usulü Döner QR Menü & Yönetim Sistemi

M.T. Döner için özel olarak tasarlanmış, **Next.js 16 (App Router)**, **TypeScript** ve **Tailwind CSS** tabanlı, mobil öncelikli, ultra hızlı ve yüksek güvenlikli QR dijital menü ve restoran yönetim sistemi.

Vercel ve GitHub ile %100 tam uyumlu olarak çalışacak şekilde hazırlanmıştır.

---

## 🌟 Öne Çıkan Özellikler

### 1. Müşteri QR Menü Deneyimi (`/`)
- **Berlin Döner Görsel Kimliği:** Siyah ve altın varaklı lüks sokak lezzeti (Gourmet Street Food) tasarımı, M.T. Döner logosu ve akıcı animasyonlar.
- **Kategori Filtreleme:**
  - 🌯 **Berlin Dönerler:** Çıtır susamlı üçgen ekmek, dürüm, pommes döner kutu, porsiyon.
  - 🥣 **Berlin Sosları:** Orijinal reçeteli Kräuter (Yeşillikli), Knoblauch (Sarımsaklı), Scharf (Berlin Acı Sosu), MT Şef Sos.
  - 🥤 **İçecekler:** Fritz-Kola, Yayık Ayranı, Uludağ Gazoz, soğuk meşrubatlar.
  - 🥗 **Ekstra Malzemeler:** Hakiki Feta peyniri, erimiş cheddar, ekstra yaprak et, çıtır patates.
  - 🍰 **Tatlılar:** Antep fıstıklı baklava, fırın sütlaç, Alman Berliner çöreği.
- **Akıllı Döner Özelleştirme:**
  - Berlin usulü sos tercihi (Kräuter, Knoblauch, Scharf).
  - İstemediğiniz malzemeleri tek dokunuşla çıkarma (Soğansız, Domatessiz vs.).
  - Ekstra malzeme ve peynir ilavesi.
- **Sipariş & Sepet:**
  - Masaya özel sipariş listesi (`?table=1` desteği).
  - WhatsApp üzerinden sipariş iletme (mutfak veya garsona detaylı fiş formatında).
  - Dijital fiş modu (garsona ekrandan gösterme).
- **Garson & Masa Çağırma:**
  - Garson Çağır, Nakit/POS Hesap İste, Peçete/Servis talepleri.
- **Müşteri Wi-Fi & İletişim:**
  - Tek dokunuşla Wi-Fi ağ adı ve şifresi görüntüleme.

---

### 2. Güvenli Admin Yönetim Paneli (`/admin`)
- **Yüksek Güvenlik Mimarisi:**
  - Kriptografik SHA-256 HMAC parola doğrulaması.
  - HTTP-Only, Secure ve SameSite oturum çerezleri (XSS & CSRF korumalı).
  - Kaba kuvvet (brute-force) saldırılarına karşı otomatik IP hız sınırlama (Rate Limiting).
  - Panelden şifre değiştirebilme imkânı.
- **Ürün Yönetimi (CRUD):**
  - Ürün adı, kategori, tutar (fiyat), detay açıklama, görsel URL.
  - Hızlı stok durumu değiştirme (Mevcut / Tükendi).
  - Rozetler: Çok Satan, Şefin Seçimi, Yeni, Acılı, Vejetaryen.
  - Ürüne özel Berlin sosları, çıkarılabilir malzemeler ve ekstra lezzetler tanımlama.
- **Masa & Menü QR Kod Stüdyosu:**
  - Genel menü veya Masa 1, Masa 2 ... Masa 50 için anında yüksek çözünürlüklü QR kod üretimi.
  - M.T. Döner logolu hazır masa kartı şablonu.
  - PNG indirme ve doğrudan yazdırma desteği.
- **Restoran Ayarları:**
  - Restoran adı, slogan, telefon, WhatsApp sipariş numarası, adres, Wi-Fi şifresi, çalışma saatleri.
- **Yedekleme & Geri Yükleme:**
  - Tek tıkla tüm menüyü ve ayarları `.json` dosyası olarak bilgisayarınıza indirme.
  - Yedekten geri yükleme ile 2 saniyede menüyü senkronize etme.

---

## 🔑 Varsayılan Giriş Bilgileri

- **Admin Paneli Adresi:** `http://localhost:3000/admin` (veya Vercel domaininiz `/admin`)
- **Varsayılan Admin Şifresi:** `mtdoner2026`

> **Not:** Şifreyi `/admin` panelinde **"Güvenlik & Şifre"** sekmesinden veya `.env.local` dosyasındaki `ADMIN_PASSWORD` değişkeninden istediğiniz zaman değiştirebilirsiniz.

---

## 🚀 Kurulum & Çalıştırma (Yerel Geliştirme)

```bash
# 1. Proje dizinine gidin
cd d:\mtdoner

# 2. Bağımlılıkları yükleyin (zaten kuruldu)
npm install

# 3. Geliştirici sunucusunu başlatın
npm run dev

# 4. Tarayıcınızda açın:
# Menü: http://localhost:3000
# Masa 5 Menüsü: http://localhost:3000/?table=5
# Admin: http://localhost:3000/admin
```

---

## ☁️ GitHub ve Vercel'e Yükleme Adımları

### 1. GitHub'a Gönderme
```bash
git add .
git commit -m "feat: M.T. Doner Berlin Usulu QR Menu & Admin System"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
git push -u origin main
```

### 2. Vercel'e Dağıtım (1 Tıkla)
1. [vercel.com](https://vercel.com) adresine gidin ve GitHub hesabınızla giriş yapın.
2. **"Add New Project"** butonuna basarak GitHub reponuzu seçin.
3. **Environment Variables** bölümüne isteğe bağlı olarak şunları ekleyebilirsiniz:
   - `ADMIN_PASSWORD`: `SizinBelirlediginizSifre`
   - `ADMIN_JWT_SECRET`: `RastgeleGucluBirGizliAnahtar`
4. **"Deploy"** butonuna tıklayın. 1-2 dakika içinde siteniz canlıya alınacaktır!
