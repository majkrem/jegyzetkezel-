# Jegyzetkezelő webalkalmazás

## Projekt leírása
A Jegyzetkezelő egy webalkalmazás, amely lehetővé teszi a felhasználók számára jegyzetek létrehozását, megtekintését, szerkesztését és törlését.  
A rendszer regisztrációhoz és bejelentkezéshez kötött, így minden felhasználó kizárólag a saját jegyzeteit érheti el.

A projekt célja egy teljes, dokumentált szoftverfejlesztési folyamat bemutatása a követelmények összegyűjtésétől a megvalósításon át a tesztelésig.

## Fő funkciók
- Felhasználó regisztráció
- Felhasználó bejelentkezés (JWT alapú hitelesítés)
- Jegyzet létrehozása
- Jegyzetek listázása
- Jegyzet törlése
- Jogosultságkezelés (csak saját jegyzetek)

## Használt technológiák

### Backend
- Node.js
- Express
- SQLite
- bcrypt (jelszó hash-elés)
- JSON Web Token (JWT)

### Frontend
- HTML
- CSS
- JavaScript (fetch API)

### Tesztelés
- Jest (egységtesztek)

### Verziókezelés
- Git
- GitHub


## Telepítés és futtatás

### Előfeltételek
- Node.js (LTS verzió ajánlott)
- npm

### 1. Projekt klónozása
```bash
git clone <repository-url>
cd notes-app
```

### 2. Függőségek telepítése
```bash
npm install
```

### 3. Környezeti változók beállítása
- .env file-ba:
JWT_SECRET=egy_titkos_kulcs
JWT_EXPIRES_IN=7d

### 4. Alkalmazás indítása
```bash
npm run dev
```

### 5. Alkalmazás elérhetődége
http://localhost:3000

### 6. Teszt futtatása
```bash
npm test
```