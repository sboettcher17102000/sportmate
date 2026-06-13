# CLAUDE.md – SportMate (Arbeitstitel)

## Projektkontext
Dieses Projekt entsteht im Rahmen einer Projektstudie. Wir haben einen Design-Thinking-Prozess durchlaufen und entwickeln nun einen Prototyp (App + Backend) für die entstandene Idee.

**Problem:** Sportangebote für Studierende sind stark verstreut und nicht zentral abgebildet (z. B. Hochschulsport, von der Stadt organisierte Events wie Marathons, private Treffen wie Fußball-Kicks unter Kommilitonen). Es gibt keine zentrale Übersicht, und bestehende Portale (z. B. Hochschulsportportal) sind nutzerunfreundlich.

**Lösung:** Eine App, die Sportangebote zentral zugänglich macht und eine soziale Komponente einbindet – Nutzer sehen, welche Sportangebote ihre Freunde wahrnehmen ("Freund X macht bei Sportart Y mit"), können selbst Events erstellen und sich unkompliziert anmelden.

## Zielgruppe
Studierende ("Sportmate User"), die:
- nach Sportmöglichkeiten in ihrer Umgebung suchen (Hochschulsport, städtische Angebote, private Treffen)
- sich mit Kommilitonen zu Sportaktivitäten verabreden möchten
- sich für Hochschulsport-Termine anmelden müssen, ohne ein unübersichtliches Portal nutzen zu wollen

## MVP-Funktionen (Core Features – Prio 1)
Diese Funktionen sollen im Prototyp umgesetzt werden:

1. **Eigene Sportevents erstellen**
   Als Nutzer möchte ich eigene Sportevents erstellen können, zu denen sich Kommilitonen anmelden können, damit die Gruppenbildung leichter fällt.

2. **Übersicht angemeldeter Angebote (eigenes + fremde Profile)**
   Als Nutzer möchte ich auf meinem Profil und auf den Profilen anderer Nutzer sehen können, zu welchen Sportevents/Hochschulsport-Angeboten sie angemeldet sind, damit ich auf einen Blick erkenne, welche Angebote von mir oder anderen genutzt werden.

3. **Vereinfachte Hochschulsport-Anmeldung**
   Als Nutzer möchte ich mich unkompliziert über die App zum Hochschulsport anmelden können, damit ich mich nicht für jeden einzelnen Termin über das nutzerunfreundliche Hochschulsportportal anmelden muss.

4. **Freunde & Event-Teilnahme sehen**
   Als Nutzer möchte ich sehen können, welche meiner Freunde sich zu einer Sportveranstaltung angemeldet haben, und sie ggf. einladen können, damit ich erkenne, ob bereits Freunde an einem Event teilnehmen.

## Funktionen für spätere Versionen (2nd Prio – NICHT Teil des aktuellen Prototyps)
5. **Erinnerungen & personalisierte Empfehlungen**
   Erinnerung an bevorstehende Events sowie regelmäßige Information über neue Events, die zu den eigenen Interessen passen – damit der Nutzer auf dem Laufenden bleibt und keine Sportevents verpasst.

6. **Anwesenheitsstatistiken & Ziele**
   Statistiken zur eigenen und fremden Anwesenheit bei Angeboten, inkl. Anwesenheitszielen zur Motivation für regelmäßige Teilnahme am Hochschulsport.

> Hinweis für Claude: Funktionen 5 und 6 erst implementieren, wenn der Kern (1–4) steht und explizit dazu aufgefordert wird.

## Vorläufiges Datenmodell (Entwurf – zur Diskussion)
- **User**: id, name, email, profilbild, interessen (Sportarten)
- **Event**: id, titel, sportart, datum/zeit, ort, beschreibung, ersteller_id, quelle (selbst erstellt / Hochschulsport / extern)
- **Participation**: user_id, event_id, status (angemeldet, eingeladen, abgesagt)
- **Friendship**: user_id, friend_id, status (angefragt, bestätigt)

Dieses Datenmodell ist ein erster Entwurf und soll vor der Backend-Implementierung gemeinsam überprüft und ggf. angepasst werden.

## Tech-Stack
- **Frontend:** React (mit Vite) + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Node.js mit Express + TypeScript
- **ORM:** Prisma (für Schema-Definition, Migrationen und typensichere DB-Zugriffe)
- **Datenbank:** SQLite (lokale Datei, für den Prototyp ausreichend)
- **Authentifizierung:** einfache E-Mail/Passwort-Anmeldung mit JWT (JSON Web Token)

**Begründung:** Frontend und Backend nutzen beide TypeScript – das sorgt für konsistenten Code und macht es einfacher, Typen (z. B. für Event- oder User-Objekte) zwischen beiden Seiten zu teilen. Prisma passt sehr gut zu SQLite und erzeugt aus einem einfachen Schema automatisch Datenbanktabellen samt Migrationen, was die Umsetzung des oben skizzierten Datenmodells deutlich vereinfacht.

*Alternative, falls euer Team mit Python vertrauter ist:* Backend mit FastAPI + SQLAlchemy statt Node/Express/Prisma – das Frontend (React + Vite) würde gleich bleiben. Sag Bescheid, falls das passender für euch ist, dann passe ich den Abschnitt an.

## Offene Fragen / Annahmen (vor Implementierung klären)
- Wie werden externe Angebote (Hochschulsport, städtische Events) ins System gebracht – manuell eingepflegt, Beispieldaten, oder über eine Schnittstelle?
- Wie funktioniert die Authentifizierung? (eigenes Login-System für den Prototyp ausreichend)
- Wie werden Freundschaften hergestellt (z. B. über Benutzername/E-Mail suchen)?

## Konventionen
- **Ordnerstruktur:** Monorepo mit zwei Ordnern `/frontend` (React/Vite) und `/backend` (Express/Prisma)
- **API:** REST-Endpunkte unter `/api/...`, JSON als Datenformat
- **Sprache im Code:** Variablen-/Funktionsnamen auf Englisch, UI-Texte auf Deutsch
- **Komponenten:** funktionale React-Komponenten mit TypeScript (`.tsx`)
- **Datenbankschema:** zentral in `backend/prisma/schema.prisma` definiert, Änderungen über Prisma-Migrationen

## Projektstatus / Setup (Stand: 2026-06-13)

**Grundgerüst vollständig umgesetzt.** Beide Pakete sind bereit.

### Starten
```
npm run dev          # startet backend (Port 3001) + frontend (Port 5173) parallel
```
Oder einzeln:
```
cd backend && npm run dev    # Express-Server auf :3001
cd frontend && npm run dev   # Vite auf :5173 (proxied /api → :3001)
```

### Wichtige Hinweise
- **Prisma v7** mit `@prisma/adapter-libsql` – PrismaClient benötigt zwingend einen Adapter:
  `new PrismaClient({ adapter: new PrismaLibSql({ url: '...' }) })`
- **`db.ts`** in `backend/src/db.ts` kapselt die Adapter-Initialisierung – immer darüber importieren
- **Seed-Daten** (4 Demo-User + 7 Events): `npm run seed`  
  Login: `max@hs-heilbronn.de / password123` (und anna, maxw, sarah)
- **Generierter Prisma-Client** in `backend/src/generated/prisma/` – nie manuell editieren;  
  nach Schema-Änderungen: `npx prisma migrate dev --name <name>` + `npx prisma generate`

### Aktuelle API-Endpunkte
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/events?source=&sport=&search=
GET    /api/events/mine
GET    /api/events/:id
POST   /api/events
POST   /api/events/:id/join
DELETE /api/events/:id/join
GET    /api/users/search?q=
GET    /api/users/:id
GET    /api/friendships
GET    /api/friendships/pending
POST   /api/friendships/request
PATCH  /api/friendships/:id/accept
DELETE /api/friendships/:id
```