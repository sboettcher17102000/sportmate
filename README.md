# SportMate – Setup-Anleitung

Dieses Repo enthält ein Monorepo mit zwei Paketen:
- **`/frontend`** – React + Vite + TypeScript + Tailwind CSS
- **`/backend`** – Node.js + Express + TypeScript + Prisma + SQLite

---

## Voraussetzungen

- [Node.js](https://nodejs.org/) **v18 oder neuer** (empfohlen: v20 LTS)
- npm (kommt mit Node.js)
- Git

Node-Version prüfen:
```bash
node -v
```

---

## 1. Repository klonen

```bash
git clone <gitlab-repo-url>
cd sportmate
```

---

## 2. Abhängigkeiten installieren

Es müssen drei Ebenen installiert werden: Root, Backend und Frontend.

```bash
# Root (enthält das "concurrently"-Tool zum parallelen Starten)
npm install

# Backend
npm install --prefix backend

# Frontend
npm install --prefix frontend
```

---

## 3. Datenbank einrichten

Die Datenbank ist eine lokale SQLite-Datei und liegt **nicht** im Git-Repository. Sie muss einmalig auf jedem Gerät eingerichtet werden.

### 3a. Prisma Client generieren

```bash
cd backend
npx prisma generate
```

### 3b. Migrationen ausführen (Tabellen erstellen)

```bash
npx prisma migrate dev
```

> Wenn nach einem Migrationsnamen gefragt wird, einfach Enter drücken oder einen beliebigen Namen eingeben.

### 3c. Demo-Daten einspielen (optional, aber empfohlen)

```bash
npm run db:seed
```

Danach stehen folgende Test-Accounts zur Verfügung:

| E-Mail                    | Passwort    |
|---------------------------|-------------|
| max@hs-heilbronn.de       | password123 |
| anna@hs-heilbronn.de      | password123 |
| maxw@hs-heilbronn.de      | password123 |
| sarah@hs-heilbronn.de     | password123 |
| lena@hs-heilbronn.de      | password123 |

Danach wieder ins Root-Verzeichnis wechseln:

```bash
cd ..
```

---

## 4. App starten

```bash
npm run dev
```

Dieser Befehl startet Backend und Frontend parallel:

| Dienst   | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3001 |

---

## Komplette Ersteinrichtung auf einen Blick

```bash
git clone <gitlab-repo-url>
cd sportmate

npm install
npm install --prefix backend
npm install --prefix frontend

cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed
cd ..

npm run dev
```

---

## Nützliche Befehle

| Befehl                          | Beschreibung                                      |
|---------------------------------|---------------------------------------------------|
| `npm run dev`                   | Backend + Frontend gleichzeitig starten           |
| `npm run seed`                  | Demo-Daten in die Datenbank einspielen            |
| `cd backend && npx prisma studio` | Datenbank-Oberfläche im Browser öffnen (Port 5555) |
| `npm run db:migrate --prefix backend` | Neue Migrationen anwenden (nach Schema-Änderungen) |

---

## Hinweise für die Entwicklung

- **Datenbank ist lokal:** Die SQLite-Datei (`backend/prisma/dev.db`) liegt nur auf deinem Gerät und ist in `.gitignore` ausgeschlossen. Beim Wechsel auf ein neues Gerät muss Schritt 3 wiederholt werden.
- **Schema geändert?** Nach jeder Änderung an `backend/prisma/schema.prisma` müssen beide Befehle ausgeführt werden:
  ```bash
  cd backend
  npx prisma migrate dev --name <beschreibung-der-aenderung>
  npx prisma generate
  ```
- **API läuft auf Port 3001**, das Frontend proxied `/api`-Anfragen automatisch dorthin (konfiguriert in `frontend/vite.config.ts`).
