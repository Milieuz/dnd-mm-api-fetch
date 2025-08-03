document.addEventListener("DOMContentLoaded", () => {
  const mainDisplay = document.querySelector(".main-display");
  const totalDisplay = document.querySelector(".total-display");
  const secondaryDisplay = document.querySelector(".secondary-display");

  // Allow toggleMenu to work from inline onclick
  window.toggleMenu = function () {
    const menu = document.getElementById("sideMenu");
    menu.classList.toggle("open");
    document.body.classList.toggle("menu-open");
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const cache = {};
  async function getDetail(url) {
    if (!cache[url]) {
      const res = await fetch(url);
      cache[url] = await res.json();
    }
    return cache[url];
  }

  async function fetchWithConcurrency(urls, limit = 6) {
    const results = [];
    let i = 0;

    async function worker() {
      while (i < urls.length) {
        const current = i++;
        try {
          const res = await fetch(urls[current]);
          results[current] = await res.json();
        } catch (e) {
          results[current] = null;
          console.error(`Error fetching ${urls[current]}`, e);
        }
      }
    }

    const workers = Array.from({ length: limit }, () => worker());
    await Promise.all(workers);
    return results;
  }

  function formatValue(val) {
    if (typeof val === "object" && val !== null) {
      if ("name" in val) return val.name;
      if ("index" in val) return val.index;
      return JSON.stringify(val);
    }
    return val;
  }

  async function fetchAndDisplayList(endpoint, label) {
    const listUrl = `https://www.dnd5eapi.co/api/${endpoint}`;

    try {
      const res = await fetch(listUrl);
      const data = await res.json();

      totalDisplay.textContent = `There are ${
        data.count
      } ${label.toLowerCase()}(s).`;
      mainDisplay.innerHTML = "";
      secondaryDisplay.style.display = "none";
      mainDisplay.style.display = "block";

      for (let i = 0; i < data.results.length; i++) {
        const item = data.results[i];
        const detailUrl = `https://www.dnd5eapi.co${item.url}`;

        try {
          const detailRes = await fetch(detailUrl);
          const detail = await detailRes.json();

          const block = document.createElement("div");
          block.classList.add("collapsible-block");

          const header = document.createElement("button");
          header.classList.add("collapsible");
          header.textContent = `${label} #${i + 1}: ${
            detail.name || detail.full_name || "Unnamed"
          }`;

          const content = document.createElement("div");
          content.classList.add("content");
          content.style.display = "none";

          let html = "";

          // Basic fields
          if (detail.full_name && detail.full_name !== detail.name) {
            html += `<strong>Full Name:</strong> ${detail.full_name}<br>`;
          }

          if (detail.desc) {
            const descArray = Array.isArray(detail.desc)
              ? detail.desc
              : [detail.desc];
            html += `<em>Description:</em><ul>${descArray
              .map((d) => `<li>${d}</li>`)
              .join("")}</ul>`;
          }

          // Ability Scores: fetch and show skill details
          if (endpoint === "ability-scores" && detail.skills?.length) {
            html += `<strong>Skills:</strong><div class="skills-display"></div>`;
          }

          // Classes: show full object
          if (endpoint === "classes") {
            html += `<div class="class-details"><h4>Class Features:</h4><ul>`;

            // Hit Die
            if (detail.hit_die) {
              html += `<li><strong>Hit Die:</strong> d${detail.hit_die}</li>`;
            }

            // Proficiencies
            if (Array.isArray(detail.proficiencies)) {
              html += `<li><strong>Proficiencies:</strong> ${detail.proficiencies
                .map((p) => p.name)
                .join(", ")}</li>`;
            }

            // Saving Throws
            if (Array.isArray(detail.saving_throws)) {
              html += `<li><strong>Saving Throws:</strong> ${detail.saving_throws
                .map((s) => s.name)
                .join(", ")}</li>`;
            }

            // Proficiency Choices
            if (Array.isArray(detail.proficiency_choices)) {
              html += `<li><strong>Proficiency Choices:</strong><ul>`;
              detail.proficiency_choices.forEach((choiceGroup, idx) => {
                html += `<li>Choose ${choiceGroup.choose} from:<ul>`;
                if (Array.isArray(choiceGroup.from)) {
                  choiceGroup.from.forEach((opt) => {
                    html += `<li>${opt.name || "[Unnamed Option]"}</li>`;
                  });
                }
                html += `</ul></li>`;
              });
              html += `</ul></li>`;
            }

            // Starting Equipment
            if (Array.isArray(detail.starting_equipment)) {
              html += `<li><strong>Starting Equipment:</strong><ul>`;
              detail.starting_equipment.forEach((eq) => {
                const name = eq.equipment?.name;
                const qty = eq.quantity;
                if (name && typeof qty === "number") {
                  html += `<li>${name} × ${qty}</li>`;
                }
              });
              html += `</ul></li>`;
            }

            // Starting Equipment Options
            if (Array.isArray(detail.starting_equipment_options)) {
              html += `<li><strong>Starting Equipment Options:</strong><ul>`;
              detail.starting_equipment_options.forEach((group, idx) => {
                html += `<li>Group #${idx + 1} (Choose ${group.choose}):<ul>`;
                const options = group.from?.options || [];
                options.forEach((opt) => {
                  let itemName = "Unknown";
                  if (opt.item?.name) itemName = opt.item.name;
                  else if (opt.of?.name) itemName = opt.of.name;
                  else if (opt.choice?.from?.options) {
                    itemName = opt.choice.from.options
                      .map((c) => c.item?.name || "[Option]")
                      .join(", ");
                  }
                  html += `<li>${itemName}</li>`;
                });
                html += `</ul></li>`;
              });
              html += `</ul></li>`;
            }

            // Spellcasting
            if (detail.spellcasting?.spellcasting_ability?.name) {
              html += `<li><strong>Spellcasting:</strong><ul>`;
              html += `<li><em>Ability:</em> ${detail.spellcasting.spellcasting_ability.name}</li>`;
              if (Array.isArray(detail.spellcasting.info)) {
                detail.spellcasting.info.forEach((info) => {
                  html += `<li><em>${info.name}:</em><ul>`;
                  if (Array.isArray(info.desc)) {
                    info.desc.forEach((d) => (html += `<li>${d}</li>`));
                  }
                  html += `</ul></li>`;
                });
              }
              html += `</ul></li>`;
            }

            // Subclasses
            if (Array.isArray(detail.subclasses)) {
              html += `<li><strong>Subclasses:</strong> ${detail.subclasses
                .map((sc) => sc.name)
                .join(", ")}</li>`;
            }

            // Multiclassing
            if (detail.multi_classing) {
              html += `<li><strong>Multiclassing:</strong><ul>`;
              const mc = detail.multi_classing;

              if (Array.isArray(mc.prerequisites)) {
                html += `<li><em>Prerequisites:</em> ${mc.prerequisites
                  .map((p) => `${p.ability_score.name} ${p.minimum_score}`)
                  .join(", ")}</li>`;
              }

              if (Array.isArray(mc.proficiencies)) {
                html += `<li><em>Gained Proficiencies:</em> ${mc.proficiencies
                  .map((p) => p.name)
                  .join(", ")}</li>`;
              }

              if (Array.isArray(mc.proficiency_choices)) {
                html += `<li><em>Proficiency Choices:</em><ul>`;
                mc.proficiency_choices.forEach((pc) => {
                  html += `<li>Choose ${pc.choose} from:<ul>`;
                  if (Array.isArray(pc.from)) {
                    pc.from.forEach((opt) => {
                      html += `<li>${opt.name || "[Unnamed Option]"}</li>`;
                    });
                  }
                  html += `</ul></li>`;
                });
                html += `</ul></li>`;
              }

              html += `</ul></li>`;
            }

            // Class Levels link
            if (detail.class_levels) {
              html += `<li><strong>Class Levels:</strong> <a href="https://www.dnd5eapi.co${detail.class_levels}" target="_blank">${detail.class_levels}</a></li>`;
            }

            html += `</ul></div>`;
          }

          // BREAK POINT

          if (endpoint === "equipment") {
            html += `<div class="equipment-details"><ul>`;

            // Description
            if (Array.isArray(detail.desc) && detail.desc.length) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((d) => (html += `<li>${d}</li>`));
              html += `</ul></li>`;
            }

            // Equipment Category
            if (detail.equipment_category?.name) {
              html += `<li><strong>Category:</strong> ${detail.equipment_category.name}</li>`;
            }

            // Gear Category
            if (detail.gear_category?.name) {
              html += `<li><strong>Gear Type:</strong> ${detail.gear_category.name}</li>`;
            }

            // Cost
            if (detail.cost?.quantity) {
              html += `<li><strong>Cost:</strong> ${detail.cost.quantity} ${detail.cost.unit}</li>`;
            }

            // Weight
            if (typeof detail.weight === "number") {
              html += `<li><strong>Weight:</strong> ${detail.weight} lb.</li>`;
            }

            // Properties (weapons or gear)
            if (Array.isArray(detail.properties) && detail.properties.length) {
              html += `<li><strong>Properties:</strong> ${detail.properties
                .map((p) => p.name)
                .join(", ")}</li>`;
            }

            // Special
            if (Array.isArray(detail.special) && detail.special.length) {
              html += `<li><strong>Special:</strong><ul>`;
              detail.special.forEach((s) => (html += `<li>${s}</li>`));
              html += `</ul></li>`;
            }

            // Contents (containers like backpacks)
            if (Array.isArray(detail.contents) && detail.contents.length) {
              html += `<li><strong>Contents:</strong><ul>`;
              detail.contents.forEach((c) => {
                const itemName = c.item?.name || "[Unknown]";
                html += `<li>${itemName} × ${c.quantity}</li>`;
              });
              html += `</ul></li>`;
            }

            // API Link
            if (detail.url) {
              html += `<li><strong>API Reference:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
          }

          // EQUIPMENT CATEGORIES

          if (endpoint === "equipment-categories") {
            html += `<div class="equipment-category-detail"><h3>${detail.name}</h3><ul>`;

            // Index
            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            // Description
            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((line) => (html += `<li>${line}</li>`));
              html += `</ul></li>`;
            }

            // Gear Category (some equipment categories include this)
            if (detail.gear_category?.name) {
              html += `<li><strong>Gear Category:</strong> ${detail.gear_category.name}</li>`;
            }

            // Equipment List
            if (
              Array.isArray(detail.equipment) &&
              detail.equipment.length > 0
            ) {
              html += `<li><strong>Equipment in this category:</strong><ul>`;
              detail.equipment.forEach((item, idx) => {
                const itemId = `equip-${detail.index}-${idx}`;
                html += `
        <li>
          <button class="gear-toggle" data-url="${item.url}" data-target="${itemId}">▶ ${item.name}</button>
          <div id="${itemId}" class="gear-detail" style="display:none; margin-left:1em;"></div>
        </li>`;
              });
              html += `</ul></li>`;
            } else {
              html += `<li><em>No equipment items listed in this category.</em></li>`;
            }

            html += `</ul></div>`;
            block.innerHTML = html;
            mainDisplay.appendChild(block);

            // Attach gear toggle logic
            block.querySelectorAll(".gear-toggle").forEach((button) => {
              button.addEventListener("click", async () => {
                const targetId = button.dataset.target;
                const container = document.getElementById(targetId);
                const url = `https://www.dnd5eapi.co${button.dataset.url}`;

                if (container.style.display === "block") {
                  container.style.display = "none";
                  button.textContent = button.textContent.replace("▼", "▶");
                  return;
                }

                try {
                  const res = await fetch(url);
                  const gear = await res.json();

                  let gearHTML = `<ul>`;
                  gearHTML += `<li><strong>Name:</strong> ${gear.name}</li>`;
                  if (gear.equipment_category?.name)
                    gearHTML += `<li><strong>Category:</strong> ${gear.equipment_category.name}</li>`;
                  if (gear.gear_category?.name)
                    gearHTML += `<li><strong>Gear Type:</strong> ${gear.gear_category.name}</li>`;
                  if (gear.cost)
                    gearHTML += `<li><strong>Cost:</strong> ${gear.cost.quantity} ${gear.cost.unit}</li>`;
                  if (typeof gear.weight === "number")
                    gearHTML += `<li><strong>Weight:</strong> ${gear.weight} lb</li>`;
                  if (Array.isArray(gear.desc) && gear.desc.length) {
                    gearHTML += `<li><strong>Description:</strong><ul>`;
                    gear.desc.forEach((d) => (gearHTML += `<li>${d}</li>`));
                    gearHTML += `</ul></li>`;
                  }
                  if (Array.isArray(gear.special) && gear.special.length) {
                    gearHTML += `<li><strong>Special:</strong><ul>`;
                    gear.special.forEach((s) => (gearHTML += `<li>${s}</li>`));
                    gearHTML += `</ul></li>`;
                  }
                  if (Array.isArray(gear.contents) && gear.contents.length) {
                    gearHTML += `<li><strong>Contents:</strong><ul>`;
                    gear.contents.forEach((c) => {
                      gearHTML += `<li>${c.item?.name || "[Item]"} × ${
                        c.quantity
                      }</li>`;
                    });
                    gearHTML += `</ul></li>`;
                  }
                  gearHTML += `</ul>`;

                  container.innerHTML = gearHTML;
                  container.style.display = "block";
                  button.textContent = button.textContent.replace("▶", "▼");
                } catch (err) {
                  container.innerHTML = "<em>Error loading gear item.</em>";
                  container.style.display = "block";
                  console.error(err);
                }
              });
            });
          }

          // FEATURES
          if (endpoint === "features") {
            html += `<div class="feature-details"><ul>`;

            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            if (detail.name) {
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            }

            if (detail.level !== undefined) {
              html += `<li><strong>Level:</strong> ${detail.level}</li>`;
            }

            if (detail.class?.name) {
              html += `<li><strong>Class:</strong> ${detail.class.name}</li>`;
            }

            if (detail.subclass?.name) {
              html += `<li><strong>Subclass:</strong> ${detail.subclass.name}</li>`;
            }

            if (detail.parent?.name) {
              html += `<li><strong>Parent Feature:</strong> ${detail.parent.name}</li>`;
            }

            if (
              Array.isArray(detail.prerequisites) &&
              detail.prerequisites.length > 0
            ) {
              html += `<li><strong>Prerequisites:</strong><ul>`;
              detail.prerequisites.forEach((p) => {
                html += `<li>${
                  p.ability_score?.name || p.name || "[Unknown]"
                }</li>`;
              });
              html += `</ul></li>`;
            }

            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((line) => (html += `<li>${line}</li>`));
              html += `</ul></li>`;
            }

            html += `</ul></div>`;
          }

          // LANGUAGES

          if (endpoint === "languages") {
            html += `<div class="language-details"><ul>`;

            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            if (detail.name) {
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            }

            if (detail.type) {
              html += `<li><strong>Type:</strong> ${detail.type}</li>`;
            }

            if (
              Array.isArray(detail.typical_speakers) &&
              detail.typical_speakers.length > 0
            ) {
              html += `<li><strong>Typical Speakers:</strong> ${detail.typical_speakers.join(
                ", "
              )}</li>`;
            }

            if (detail.script) {
              html += `<li><strong>Script:</strong> ${detail.script}</li>`;
            }

            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((line) => {
                html += `<li>${line}</li>`;
              });
              html += `</ul></li>`;
            }

            html += `</ul></div>`;
          }

          // MAGIC ITEMS

          if (endpoint === "magic-items") {
            html += `<div class="magic-item-details"><ul>`;

            // Index and Name
            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }
            if (detail.name) {
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            }

            // Equipment Category
            if (detail.equipment_category?.name) {
              html += `<li><strong>Category:</strong> ${detail.equipment_category.name}</li>`;
            }

            // Rarity
            if (detail.rarity?.name) {
              html += `<li><strong>Rarity:</strong> ${detail.rarity.name}</li>`;
            }

            // Is Variant
            html += `<li><strong>Variant Item:</strong> ${
              detail.variant ? "Yes" : "No"
            }</li>`;

            // Variants List
            if (Array.isArray(detail.variants) && detail.variants.length > 0) {
              html += `<li><strong>Variants:</strong><ul>`;
              detail.variants.forEach((v) => {
                html += `<li>${v.name || v.index || "[Unnamed Variant]"}</li>`;
              });
              html += `</ul></li>`;
            }

            // Description
            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((d) => (html += `<li>${d}</li>`));
              html += `</ul></li>`;
            }

            // Image
            if (detail.image) {
              html += `<li><strong>Image:</strong><br><img src="https://www.dnd5eapi.co${detail.image}" alt="${detail.name}" style="max-width: 200px;"></li>`;
            }

            // API URL
            if (detail.url) {
              html += `<li><strong>API Link:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
          }

          // PROFICIENCIES

          if (endpoint === "proficiencies") {
            html += `<div class="proficiency-details"><ul>`;

            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            if (detail.name) {
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            }

            if (detail.type) {
              html += `<li><strong>Type:</strong> ${detail.type}</li>`;
            }

            // Classes
            if (Array.isArray(detail.classes) && detail.classes.length > 0) {
              html += `<li><strong>Classes:</strong> ${detail.classes
                .map((c) => c.name)
                .join(", ")}</li>`;
            }

            // Races
            if (Array.isArray(detail.races) && detail.races.length > 0) {
              html += `<li><strong>Races:</strong> ${detail.races
                .map((r) => r.name)
                .join(", ")}</li>`;
            }

            // Reference
            if (detail.reference?.name && detail.reference?.url) {
              html += `<li><strong>Reference:</strong> <a href="https://www.dnd5eapi.co${detail.reference.url}" target="_blank">${detail.reference.name}</a></li>`;
            }

            // API URL
            if (detail.url) {
              html += `<li><strong>API Link:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
          }

          // RACES

          if (endpoint === "races") {
            html += `<div class="race-details"><ul>`;

            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            if (detail.name) {
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            }

            if (detail.speed !== undefined) {
              html += `<li><strong>Speed:</strong> ${detail.speed} ft</li>`;
            }

            if (
              Array.isArray(detail.ability_bonuses) &&
              detail.ability_bonuses.length > 0
            ) {
              html += `<li><strong>Ability Bonuses:</strong><ul>`;
              detail.ability_bonuses.forEach((bonus) => {
                html += `<li>${bonus.ability_score?.name || "[Ability]"} +${
                  bonus.bonus
                }</li>`;
              });
              html += `</ul></li>`;
            }

            if (detail.alignment) {
              html += `<li><strong>Alignment:</strong> ${detail.alignment}</li>`;
            }

            if (detail.age) {
              html += `<li><strong>Age:</strong> ${detail.age}</li>`;
            }

            if (detail.size) {
              html += `<li><strong>Size:</strong> ${detail.size}</li>`;
            }

            if (detail.size_description) {
              html += `<li><strong>Size Description:</strong> ${detail.size_description}</li>`;
            }

            // Starting Proficiencies
            if (
              Array.isArray(detail.starting_proficiencies) &&
              detail.starting_proficiencies.length > 0
            ) {
              html += `<li><strong>Starting Proficiencies:</strong> ${detail.starting_proficiencies
                .map((p) => p.name)
                .join(", ")}</li>`;
            }

            // Proficiency Options
            if (detail.starting_proficiency_options?.from?.length) {
              html += `<li><strong>Proficiency Choices:</strong> Choose ${detail.starting_proficiency_options.choose} from:<ul>`;
              detail.starting_proficiency_options.from.forEach((opt) => {
                html += `<li>${opt.name || opt.index || "[Option]"}</li>`;
              });
              html += `</ul></li>`;
            }

            // Languages
            if (
              Array.isArray(detail.languages) &&
              detail.languages.length > 0
            ) {
              html += `<li><strong>Languages:</strong> ${detail.languages
                .map((l) => l.name)
                .join(", ")}</li>`;
            }

            if (detail.language_desc) {
              html += `<li><strong>Language Description:</strong> ${detail.language_desc}</li>`;
            }

            // Traits
            if (Array.isArray(detail.traits) && detail.traits.length > 0) {
              html += `<li><strong>Traits:</strong><ul>`;
              detail.traits.forEach((t) => (html += `<li>${t.name}</li>`));
              html += `</ul></li>`;
            }

            // Subraces
            if (Array.isArray(detail.subraces) && detail.subraces.length > 0) {
              html += `<li><strong>Subraces:</strong><ul>`;
              detail.subraces.forEach((s) => (html += `<li>${s.name}</li>`));
              html += `</ul></li>`;
            }

            // API Link
            if (detail.url) {
              html += `<li><strong>API Link:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
          }

          // RULE SECTIONS

          if (endpoint === "rule-sections") {
            html += `<div class="rule-section-details"><ul>`;

            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            if (detail.name) {
              html += `<li><strong>Section Name:</strong> ${detail.name}</li>`;
            }

            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((paragraph) => {
                html += `<li>${paragraph}</li>`;
              });
              html += `</ul></li>`;
            }

            if (detail.url) {
              html += `<li><strong>API Link:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
          }

          // RULES

          if (endpoint === "rules") {
            html += `<div class="rule-details"><ul>`;

            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            if (detail.name) {
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            }

            // Description paragraphs
            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((paragraph) => {
                html += `<li>${paragraph}</li>`;
              });
              html += `</ul></li>`;
            }

            // Subsections
            if (
              Array.isArray(detail.subsections) &&
              detail.subsections.length > 0
            ) {
              html += `<li><strong>Subsections:</strong><ul>`;
              detail.subsections.forEach((sub) => {
                html += `<li><a href="https://www.dnd5eapi.co${sub.url}" target="_blank">${sub.name}</a></li>`;
              });
              html += `</ul></li>`;
            }

            // API link
            if (detail.url) {
              html += `<li><strong>API Link:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
          }

          // SPELLS

          if (endpoint === "spells") {
            html += `<div class="spell-details"><ul>`;

            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            if (detail.name) {
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            }

            if (detail.school?.name) {
              html += `<li><strong>School:</strong> ${detail.school.name}</li>`;
            }

            if (detail.level !== undefined) {
              html += `<li><strong>Level:</strong> ${detail.level}</li>`;
            }

            if (detail.casting_time) {
              html += `<li><strong>Casting Time:</strong> ${detail.casting_time}</li>`;
            }

            if (detail.range) {
              html += `<li><strong>Range:</strong> ${detail.range}</li>`;
            }

            if (
              Array.isArray(detail.components) &&
              detail.components.length > 0
            ) {
              html += `<li><strong>Components:</strong> ${detail.components.join(
                ", "
              )}</li>`;
            }

            if (detail.material) {
              html += `<li><strong>Material:</strong> ${detail.material}</li>`;
            }

            html += `<li><strong>Ritual:</strong> ${
              detail.ritual ? "Yes" : "No"
            }</li>`;
            html += `<li><strong>Concentration:</strong> ${
              detail.concentration ? "Yes" : "No"
            }</li>`;

            if (detail.duration) {
              html += `<li><strong>Duration:</strong> ${detail.duration}</li>`;
            }

            // Description
            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((d) => (html += `<li>${d}</li>`));
              html += `</ul></li>`;
            }

            // Higher-level info
            if (
              Array.isArray(detail.higher_level) &&
              detail.higher_level.length > 0
            ) {
              html += `<li><strong>At Higher Levels:</strong><ul>`;
              detail.higher_level.forEach(
                (line) => (html += `<li>${line}</li>`)
              );
              html += `</ul></li>`;
            }

            // Classes
            if (Array.isArray(detail.classes) && detail.classes.length > 0) {
              html += `<li><strong>Classes:</strong> ${detail.classes
                .map((cls) => cls.name)
                .join(", ")}</li>`;
            }

            // Subclasses
            if (
              Array.isArray(detail.subclasses) &&
              detail.subclasses.length > 0
            ) {
              html += `<li><strong>Subclasses:</strong> ${detail.subclasses
                .map((sub) => sub.name)
                .join(", ")}</li>`;
            }

            // API Link
            if (detail.url) {
              html += `<li><strong>API Link:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
          }

          // SUBCLASSES, NOT ENTIRELY WORKING

          if (endpoint === "subclasses") {
            html += `<div class="subclass-details"><ul>`;

            if (detail.index)
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            if (detail.name)
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            if (detail.class?.name)
              html += `<li><strong>Main Class:</strong> ${detail.class.name}</li>`;
            if (detail.subclass_flavor)
              html += `<li><strong>Flavor:</strong> ${detail.subclass_flavor}</li>`;

            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>${detail.desc
                .map((d) => `<li>${d}</li>`)
                .join("")}</ul></li>`;
            }

            // Features
            if (Array.isArray(detail.features) && detail.features.length > 0) {
              html += `<li><strong>Features:</strong><ul>`;
              detail.features.forEach((f) => {
                html += `<li><a href="https://www.dnd5eapi.co${f.url}" target="_blank">${f.name}</a></li>`;
              });
              html += `</ul></li>`;
            }

            // Placeholder for subclass spells
            html += `<li><strong>Subclass Spells:</strong><div class="subclass-spells-list"><em>Loading...</em></div></li>`;

            if (detail.url) {
              html += `<li><strong>API Link:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
            content.innerHTML = html;
            block.appendChild(header);
            block.appendChild(content);
            mainDisplay.appendChild(block);

            await delay(50); // Ensure DOM is updated

            // Fetch level data to get subclass spells
            const subclassSpells = [];

            try {
              const levelsUrl = `https://www.dnd5eapi.co/api/subclasses/${detail.index}/levels`;
              const levelsRes = await fetch(levelsUrl);
              const levels = await levelsRes.json();

              for (let level of levels) {
                if (Array.isArray(level.spellcasting)) {
                  subclassSpells.push(...level.spellcasting);
                }
                if (Array.isArray(level.spells)) {
                  subclassSpells.push(...level.spells);
                }
              }
            } catch (err) {
              console.error("Error fetching subclass level data:", err);
            }

            const spellsContainer = content.querySelector(
              ".subclass-spells-list"
            );
            spellsContainer.innerHTML = ""; // Clear "Loading..."

            if (subclassSpells.length === 0) {
              spellsContainer.innerHTML =
                "<em>No subclass spells found in level data.</em>";
            }

            // Fetch and render each spell
            for (let spell of subclassSpells) {
              try {
                const res = await fetch(`https://www.dnd5eapi.co${spell.url}`);
                const data = await res.json();

                const div = document.createElement("div");
                div.classList.add("spell-block");
                div.style.margin = "1em 0";
                div.style.padding = "0.5em 1em";
                div.style.borderLeft = "3px solid #999";

                div.innerHTML = `
        <strong>${data.name}</strong> (Level ${data.level}, ${
                  data.school?.name
                })<br>
        <em>Casting Time:</em> ${data.casting_time}<br>
        <em>Range:</em> ${data.range}<br>
        <em>Duration:</em> ${data.duration}<br>
        <em>Ritual:</em> ${data.ritual ? "Yes" : "No"}<br>
        <em>Concentration:</em> ${data.concentration ? "Yes" : "No"}<br>
        <em>Components:</em> ${data.components.join(", ")}${
                  data.material ? " (" + data.material + ")" : ""
                }<br>
        ${
          Array.isArray(data.desc)
            ? `<em>Description:</em><ul>${data.desc
                .map((d) => `<li>${d}</li>`)
                .join("")}</ul>`
            : ""
        }
        ${
          Array.isArray(data.higher_level) && data.higher_level.length > 0
            ? `<em>At Higher Levels:</em><ul>${data.higher_level
                .map((h) => `<li>${h}</li>`)
                .join("")}</ul>`
            : ""
        }
        <em>API Link:</em> <a href="https://www.dnd5eapi.co${
          data.url
        }" target="_blank">${data.url}</a>
      `;

                spellsContainer.appendChild(div);
              } catch (err) {
                const errorDiv = document.createElement("div");
                errorDiv.innerHTML = `<em>Error loading spell: ${spell.name}</em>`;
                spellsContainer.appendChild(errorDiv);
                console.error(err);
              }
            }
          }

          // SUBRACES

          if (endpoint === "subraces") {
            html += `<div class="subrace-details"><ul>`;

            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            if (detail.name) {
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            }

            if (detail.race?.name) {
              html += `<li><strong>Parent Race:</strong> ${detail.race.name}</li>`;
            }

            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((d) => (html += `<li>${d}</li>`));
              html += `</ul></li>`;
            }

            if (
              Array.isArray(detail.ability_bonuses) &&
              detail.ability_bonuses.length > 0
            ) {
              html += `<li><strong>Ability Bonuses:</strong><ul>`;
              detail.ability_bonuses.forEach((b) => {
                html += `<li>${b.ability_score?.name}: +${b.bonus}</li>`;
              });
              html += `</ul></li>`;
            }

            if (
              Array.isArray(detail.languages) &&
              detail.languages.length > 0
            ) {
              html += `<li><strong>Languages:</strong> ${detail.languages
                .map((lang) => lang.name)
                .join(", ")}</li>`;
            }

            if (
              Array.isArray(detail.language_options?.from?.options) &&
              detail.language_options.from.options.length > 0
            ) {
              html += `<li><strong>Language Options:</strong> Choose ${detail.language_options.choose} from:<ul>`;
              detail.language_options.from.options.forEach((opt) => {
                html += `<li>${opt.item?.name || "[Unknown]"}</li>`;
              });
              html += `</ul></li>`;
            }

            if (
              Array.isArray(detail.racial_traits) &&
              detail.racial_traits.length > 0
            ) {
              html += `<li><strong>Racial Traits:</strong><ul>`;
              detail.racial_traits.forEach((t) => {
                html += `<li><a href="https://www.dnd5eapi.co${t.url}" target="_blank">${t.name}</a></li>`;
              });
              html += `</ul></li>`;
            }

            if (
              Array.isArray(detail.starting_proficiencies) &&
              detail.starting_proficiencies.length > 0
            ) {
              html += `<li><strong>Starting Proficiencies:</strong> ${detail.starting_proficiencies
                .map((p) => p.name)
                .join(", ")}</li>`;
            }

            if (detail.url) {
              html += `<li><strong>API Reference:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
          }

          // TRAITS

          if (endpoint === "traits") {
            html += `<div class="trait-details"><ul>`;

            if (detail.index) {
              html += `<li><strong>Index:</strong> ${detail.index}</li>`;
            }

            if (detail.name) {
              html += `<li><strong>Name:</strong> ${detail.name}</li>`;
            }

            if (Array.isArray(detail.desc) && detail.desc.length > 0) {
              html += `<li><strong>Description:</strong><ul>`;
              detail.desc.forEach((d) => (html += `<li>${d}</li>`));
              html += `</ul></li>`;
            }

            if (Array.isArray(detail.races) && detail.races.length > 0) {
              html += `<li><strong>Associated Races:</strong> ${detail.races
                .map((r) => r.name)
                .join(", ")}</li>`;
            }

            if (Array.isArray(detail.subraces) && detail.subraces.length > 0) {
              html += `<li><strong>Associated Subraces:</strong> ${detail.subraces
                .map((sr) => sr.name)
                .join(", ")}</li>`;
            }

            if (
              Array.isArray(detail.proficiencies) &&
              detail.proficiencies.length > 0
            ) {
              html += `<li><strong>Granted Proficiencies:</strong> ${detail.proficiencies
                .map((p) => p.name)
                .join(", ")}</li>`;
            }

            if (detail.proficiency_choices) {
              html += `<li><strong>Proficiency Choices:</strong><ul>`;
              const pc = detail.proficiency_choices;
              html += `<li>Choose ${pc.choose} from:<ul>`;
              pc.from.options.forEach((opt) => {
                html += `<li>${opt.item?.name || "[Unknown]"}</li>`;
              });
              html += `</ul></li></ul></li>`;
            }

            if (detail.url) {
              html += `<li><strong>API Reference:</strong> <a href="https://www.dnd5eapi.co${detail.url}" target="_blank">${detail.url}</a></li>`;
            }

            html += `</ul></div>`;
          }

          content.innerHTML = html;
          block.appendChild(header);
          block.appendChild(content);
          mainDisplay.appendChild(block);

          // If ability-scores, now append skill details dynamically
          if (endpoint === "ability-scores" && detail.skills?.length) {
            const skillsDisplay = content.querySelector(".skills-display");

            for (let skill of detail.skills) {
              try {
                const skillUrl = `https://www.dnd5eapi.co${skill.url}`;
                const skillRes = await fetch(skillUrl);
                const skillData = await skillRes.json();

                const skillBlock = document.createElement("div");
                skillBlock.style.marginLeft = "1em";
                skillBlock.style.borderLeft = "2px solid #ccc";
                skillBlock.style.paddingLeft = "0.5em";
                skillBlock.innerHTML = `
                  <strong>${skillData.name}</strong><br>
                  <em>Ability Score:</em> ${skillData.ability_score.name}<br>
                  <em>Description:</em>
                  <ul>${skillData.desc
                    .map((line) => `<li>${line}</li>`)
                    .join("")}</ul>
                `;
                skillsDisplay.appendChild(skillBlock);
              } catch (skillErr) {
                const errDiv = document.createElement("div");
                errDiv.textContent = `Error loading skill: ${skill.name}`;
                skillsDisplay.appendChild(errDiv);
                console.error(skillErr);
              }
            }
          }

          header.addEventListener("click", () => {
            content.style.display =
              content.style.display === "none" ? "block" : "none";
          });
        } catch (detailErr) {
          const errorBlock = document.createElement("div");
          errorBlock.textContent = `Error fetching ${label} detail: ${item.name}`;
          mainDisplay.appendChild(errorBlock);
          console.error(detailErr);
        }

        await delay(5); // Delay between entries
      }
    } catch (err) {
      totalDisplay.textContent = `Failed to fetch ${label.toLowerCase()}s.`;
      console.error(`Error fetching ${label}:`, err);
    }
  }

  // Hook all buttons
  const apiButtons = document.querySelectorAll(".api-buttons button");
  apiButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const endpoint = btn.dataset.endpoint;
      const label = btn.textContent.trim();
      fetchAndDisplayList(endpoint, label);
    });
  });
});

document.getElementById("searchBtn").addEventListener("click", async () => {
  const query = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = `<p>Searching all endpoints for "<strong>${query}</strong>"...</p>`;

  if (!query) return;

  try {
    const baseUrl = "https://www.dnd5eapi.co/api/2014";
    const endpointsRes = await fetch(baseUrl);
    const endpointsData = await endpointsRes.json();

    const endpointKeys = Object.keys(endpointsData);
    let matches = [];

    for (const key of endpointKeys) {
      const endpointUrl = `${baseUrl}/${key}`;
      try {
        const endpointRes = await fetch(endpointUrl);
        const endpointData = await endpointRes.json();
        const items = endpointData.results || [];

        for (const item of items) {
          const itemUrl = `https://www.dnd5eapi.co${item.url}`;
          const itemRes = await fetch(itemUrl);
          const itemData = await itemRes.json();
          const itemText = JSON.stringify(itemData).toLowerCase();

          if (itemText.includes(query)) {
            matches.push({
              name: item.name || item.index,
              url: itemUrl,
            });
          }
        }
      } catch (innerErr) {
        console.warn(`Skipping ${key}: ${innerErr.message}`);
      }
    }

    if (matches.length === 0) {
      resultsDiv.innerHTML = `<p>No results found for "<strong>${query}</strong>".</p>`;
    } else {
      resultsDiv.innerHTML =
        `<h3>Found ${matches.length} match(es):</h3><ul>` +
        matches
          .map(
            (m) => `<li><a href="${m.url}" target="_blank">${m.name}</a></li>`
          )
          .join("") +
        `</ul>`;
    }
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
});
