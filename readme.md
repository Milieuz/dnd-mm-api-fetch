# 🐉 Dungeons & Dragons 5E API Toolkit ⚔️

### Available Live, here: [https://dnd5eapi.netlify.app/](https://dnd5eapi.netlify.app/)

**August 3, 2025 — Evan Wheeler**

Welcome to the **Dungeons & Dragons 5th Edition API Toolkit**, a dynamic, API-powered resource that brings the full breadth of the [D&D 5E API](https://www.dnd5eapi.co/) directly to your browser.

This project is an ambitious dive into complex API integrations and modular content rendering, providing Dungeon Masters and Players with an intuitive interface to explore game material, characters and character sheets, monsters (their stats and behaviors), as well as comprehensive dice rolling and creative randomization tools.

---

## 💡 Project Overview

This web application allows users to browse and interact with material sourced in real time from the D&D 5E System Reference Document (SRD) API. Built for utility and exploration, the interface emphasizes a clean UI, fast data fetching, and organized presentation of content such as monsters, rules, and character mechanics.

---

## 📜 Main Features and Subpages

### 🧭 Homepage
- Header with D&D logo
- Splash page art by legendary illustrator **Larry Elmore** (credited)
- "Blog"-like posts notifying users of updates
- Side-menu with navigation and usage instructions
- Quick links to:
  - Dungeon Master's Guide
  - Player's Handbook
  - Monster Manual
  - Character Sheet
  - Dice Roller
  - API utilities (Search, Browser, Endpoints)
  - Official external resources (D&D Beyond, WotC, etc.)
  - Legal documents (OGL, Internet Archive, etc.)

---

### 📚 Dungeon Master's Guide
**Path:** `/dmg.html`

- Allows the user to access the Official DMG PDF, including various browser compatibility (embed or download/open). 
- Includes chapter sections list and relevant accessible API endpoints.

✅ **Status:** Fully Functional, with room for future expansion.

---

### 📚 Player's Handbook
**Path:** `/phb.html`

- Allows the user to access the Official PHB PDF, including various browser compatibility (embed or download/open). 
- Includes chapter sections list and relevant accessible API endpoints.

✅ **Status:** Fully Functional, with room for future expansion.

---

### 📚 Monster Manual
**Path:** `/mm.html`

Fetches and displays images and links for the **full list of monsters** available from the API. Also allows the user to directly search via input field.

- Allows the user to access the Official MM PDF, including various browser compatibility (embed or download/open).
- Alphabetically sorted and numbered monster list.
- Clickable links to individual monster datasheet pages.
- Monster images (if available), with placeholders or alt text as fallback.
- Direct search field for quick monster lookup.

### 🔍 Individual Monster Detail Page  

Provides comprehensive details about a selected monster:

- 📸 Image (if available)
- 📖 Name, type, size, alignment
- ❤️ Hit Points, speed, and armor class
- 💪 Core stats: STR, DEX, CON, INT, WIS, CHA
- 🧠 Languages spoken
- 🛠 Proficiencies, abilities, special traits
- ⚔️ Actions, legendary actions, reactions
- 📊 Challenge rating, experience points
- 🎯 Saving throws and skills
- 🌎 Environment tags (if included in API)

✅ **Status:** Fully Functional.

---

### 📚 Character Sheet(s)
**Path:** `/char.html`

- Allows the user to Write, Edit, View, Import, and Export various Character Sheets.
- Exports and imports from text file in JSON format, this could be readily adapted to an external API through CRUD operations. This might yield a possible future expansion, such as utilizing a database of shared and communicable character sheets.
- Exported files include Character Name and Time Stamp for posterity.
- Stats sheet includes live modifiers ((ability score - 10) / 2, rounded down).
- Modeled after official D&D 5E Character Sheet.

✅ **Status:** Fully Functional, with room for future expansion.

---

### 🎲 Dice Roller
**Path:** `/dice.html`

- Allows the user to roll large quantities of varied dice from the D&D 5E repertoire (d2, d3, d4, d6, d8, d10, d12, d20, d100).
- Showcases the roll results, including an array of each roll, followed by a sum, and total sum(s).
- Includes numerous randomization dice for on-the-fly creativity, ranging from conditions, to hit effects, and character generation.
  - **Dungeon Dice**: direction, hazards, traps, monsters, treasure, terrain, weather
  - **Hit Dice**: body parts, damage types, critical effects, armor, fumbles, psychology
  - **NPC Dice**: physical traits, race, class, gender, occupation, clothing, equipment


✅ **Status:** Fully Functional, with room for future expansion.

---

### 🔍 API Tools: Search, Browser, and Endpoints
**Paths:** `/search.html` `/api.html` `/endpoints.html`

- **Search**: Keyword-based full text search of the D&D 5E API (functional but slower due to depth).
- **Browser**: Similar to Postman, this allows the browsing of the root JSON Response Object and all Endpoints. Navigation works end-to-end through related links. Reload returns to Root.
- **Endpoints**: Visual representation of Endpoints and object responses, these are identical to those placed earlier in DMG.html and PHB.html.

✅ **Status:** Fully Functional.

---

### 📖 External Links

- Links to external resources: D&D 5E API, D&D Official Store, Official D&D Beyond, Official WotC.
  - [D&D 5E API](https://www.dnd5eapi.co/)
  - [Official D&D Store](https://dndstore.wizards.com/us/en)
  - [D&D Beyond](https://www.dndbeyond.com/)
  - [Wizards of the Coast](https://company.wizards.com/en)


✅ **Status:** Fully Functional.

---

### 📖 Legal

- Includes link to official OGL Licensing data, materials from the Internet Archive, Copyright Information, and About sections.
- Includes:
  - [OGL v1.0a License](https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf)
  - Archive.org reference materials
  - Copyright acknowledgments
  - Site disclaimers and about section

✅ **Status:** Fully Functional.

---

### 📂 Sidebar & Navigation
- Responsive left-side navigation with 'hamburger'-style button.
- Quick access to:
  - Subpages and Tools
  - API Tools
  - External Links
  - Legal
- Scrollable on small screens

✅ **Status:** Fully Functional and Responsive.

---

## 🛠 Tech Stack

- **HTML5 / CSS3** – Semantic markup and responsive styling
- **Vanilla JavaScript** – Event handling, Asynchronous logic, DOM manipulation, dynamic rendering
- **Fetch API** – Real-time calls to external REST API
- **Responsive Design** – Works on desktop, tablet, and mobile. Tested for Chrome, Firefox, Brave, Safari, etc. under numerous viewing conditions and sizes.
- **Modular Code** – Logical separation of rendering and fetching, scripts segmented for maintainability and reuse

---

## 🚧 To Do / Improvements

- [ ] Refactor some variable names and logic blocks for clarity
- [ ] Division of JavaScript code into page-specific modules
- [ ] Expand DMG beyond endpoints with deeper content integration
- [ ] Expand PHB beyond endpoints with deeper content integration
- [ ] Improve error handling in Monster search
- [ ] Improve Monster detail UI
- [ ] Add Monster filters by difficulty (CR), type, etc.
- [ ] Add Character Sheet database and/or API for saving/communication
- [ ] Style enhancements (e.g. menu icons, stat bars, etc.)
- [ ] Optional stretch: Add encounter builder, map handler, campaign handler

---

## 🎯 Vision Statement

This project aims to be a comprehensive companion toolkit for **Dungeons & Dragons 5th Edition**. While it currently focuses on foundational elements like core rulebooks, monster data, character sheets, and advanced dice randomization, it is designed with scalability and modularity in mind.

The long-term vision is to transform this from a static API viewer into a fully interactive and extensible digital platform — a one-stop hub for DMs and Players alike. Planned expansions include tools for encounter generation, map integration, campaign management, and persistent character tracking via APIs or databases.

By embracing open-source D&D data and modern web technologies, the toolkit strives to provide an elegant, fast, and immersive way to interact with the 5E API. Whether at the table or online, this resource seeks to empower players, storytellers, and game designers with intuitive tools that enhance creativity, immersion, and gameplay flow — without ever getting in the way of imagination.

This is not just a technical project, it's a tribute to the fantasy genre and the roleplaying tradition. As it grows, the 5E API Toolkit aims to become a reliable companion on countless quests, forging a bridge between analog storytelling and digital convenience.