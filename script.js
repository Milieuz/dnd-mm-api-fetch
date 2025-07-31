// ---- Begin charscript.js ----
function exportCharacter() {
  const form = document.getElementById("character-sheet");
  const data = {};
  let characterName = "character"; // default fallback

  for (let el of form.elements) {
    if (el.name) {
      data[el.name] = el.value;
      if (el.name === "characterName") {
        characterName = el.value.trim() || "character";
      }
    }
  }

  // Clean characterName for filename safety
  characterName = characterName.replace(/[^a-z0-9_-]/gi, "_");

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "text/plain",
  });
  const url = URL.createObjectURL(blob);

  // Timestamp
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:T]/g, "-").split(".")[0];

  const a = document.createElement("a");
  a.href = url;
  a.download = `${characterName}-${timestamp}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCharacter() {
  document.getElementById("importFile").click();
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      const form = document.getElementById("character-sheet");
      for (let key in data) {
        if (form.elements[key]) {
          form.elements[key].value = data[key];
        }
      }
    } catch (err) {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
}

function calculateModifiers() {
  const scores = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ];
  for (let stat of scores) {
    const scoreInput = document.querySelector(`[name="\${stat}"]`);
    const modInput = document.querySelector(`[name="\${stat}Mod"]`);
    if (scoreInput && modInput) {
      const score = parseInt(scoreInput.value, 10);
      if (!isNaN(score)) {
        const mod = Math.floor((score - 10) / 2);
        modInput.value = (mod >= 0 ? "+" : "") + mod;
      } else {
        modInput.value = "";
      }
    }
  }
}

// Attach listeners to update modifiers when ability scores change
document.addEventListener("DOMContentLoaded", () => {
  const scores = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ];
  for (let stat of scores) {
    const el = document.querySelector(`[name="\${stat}"]`);
    if (el) {
      el.addEventListener("input", calculateModifiers);
    }
  }
  calculateModifiers();
});

function calculateModifiers() {
  const scores = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ];
  for (let stat of scores) {
    const scoreInput = document.querySelector(`[name="${stat}"]`);
    const modInput = document.querySelector(`[name="${stat}Mod"]`);
    if (scoreInput && modInput) {
      const score = parseInt(scoreInput.value, 10);
      if (!isNaN(score)) {
        const mod = Math.floor((score - 10) / 2);
        modInput.value = (mod >= 0 ? "+" : "") + mod;
      } else {
        modInput.value = "";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const scores = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ];
  for (let stat of scores) {
    const el = document.querySelector(`[name="${stat}"]`);
    if (el) {
      el.addEventListener("input", calculateModifiers);
    }
  }
  calculateModifiers();
});

// ---- End charscript.js ----

// ---- Begin script.js ----
let form = document.querySelector("form");
let input = document.querySelector("input");
let button = document.querySelector(".all-monsters-btn");

let display = document.querySelector(".monsters-display");
let mainDisplay = document.querySelector(".main-display");
let totalDisplay = document.querySelector(".total-display");
let secondaryDisplay = document.querySelector(".secondary-display");

function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  menu.classList.toggle("open");
  document.body.classList.toggle("menu-open");
}

// Display All Monsters
button.onclick = function () {
  let combinedUrl = "https://www.dnd5eapi.co/api/monsters";

  console.log(combinedUrl);

  fetch(combinedUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      totalDisplay.innerHTML =
        "There are " +
        data.count +
        " total monsters. <br> Disclaimer: Many API images are not present, resulting in broken .png links.";

      // *** Trying to have this line produce the link to the subsection of the API for each entry, but cannot concatenate the variable into the passed HTML
      let i = 0;
      function displayNextMonster() {
        if (i >= data.count) return;

        const monster = data.results[i];
        const slug = monster.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");

        // 'HERE' Link queries search
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `
    <br>Monster #${i + 1} is: ${monster.name}, 
    <a href="#" class="search-link" data-name="${monster.name}">Here</a><br>
  `;

        document.querySelectorAll(".search-link").forEach((link) => {
          link.addEventListener("click", function (e) {
            e.preventDefault();
            const name = this.dataset.name;

            // Set the input field
            const input = document.querySelector("form input");
            input.value = name;

            // Trigger the search by calling the same logic used by the form
            const form = document.querySelector("form");
            const submitEvent = new Event("submit", {
              bubbles: true,
              cancelable: true,
            });
            form.dispatchEvent(submitEvent);
          });
        });
        // 'HERE' Link queries search

        const img = document.createElement("img");
        img.src = `https://www.dnd5eapi.co/api/2014/images/monsters/${slug}.png`;
        img.onerror = function () {
          this.style.display = "none";

          const link = document.createElement("a");
          link.href = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
            monster.name
          )}`;
          link.target = "_blank";
          link.innerText = "Image not found. Search on Google Images";
          wrapper.appendChild(link);
        };

        wrapper.appendChild(img);
        mainDisplay.appendChild(wrapper);

        i++;
        setTimeout(displayNextMonster, 200);
      }
      displayNextMonster();

      // for (let i=0; i<data.count; i++){
      //   mainDisplay.innerHTML += '<br>' + 'Monster #'+ (i+1) + ' is: '+ data.results[i].name + ',' + ' <a href="https://www.dnd5eapi.co'+ `${data.results[i].url}` + '">Here</a>' + '<br>' + '<img src="https://www.dnd5eapi.co/api/2014/images/monsters/' + `${data.results[i].name.replace(/\s+/g, '-').toLowerCase()}` + '.png">' + '<br>';
      // }

      mainDisplay.style.display = "block";
      secondaryDisplay.style.display = "none";
    });
};

// Search and Display singular monster, needs development
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const monsterName = input.value.trim().toLowerCase().replace(/\s+/g, "-");
  const combinedUrl = `https://www.dnd5eapi.co/api/monsters/${monsterName}`;

  console.log("Fetching:", combinedUrl);

  fetch(combinedUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Monster not found.");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      totalDisplay.innerHTML = "Specific Monster Datasheet:";
      secondaryDisplay.innerHTML = ""; // Clear previous

      // Helper: get safe nested value
      const getNested = (path, fallback = "N/A") => {
        try {
          return path() ?? fallback;
        } catch {
          return fallback;
        }
      };

      const slug = data.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      const imageUrl = `https://www.dnd5eapi.co/api/2014/images/monsters/${slug}.png`;

      secondaryDisplay.innerHTML += `
        <h1><strong>Name:</strong> ${data.name}</h1>
        <strong>Size:</strong> ${data.size}<br>
        <strong>Type:</strong> ${data.type} (${data.subtype || "None"})<br>
        <strong>Alignment:</strong> ${data.alignment}<br>
        <hr>
        <strong>Armor Class:</strong> 
        ${getNested(() => data.armor_class[0].value)} 
        (${getNested(() => data.armor_class[0].type)}, 
        ${getNested(() => data.armor_class[0].armor[0].name)})<br>

        <strong>Hit Points:</strong> ${data.hit_points} (${
        data.hit_points_roll
      })<br>
        <strong>Speed:</strong> ${getNested(
          () => data.speed.walk
        )}, climb ${getNested(() => data.speed.climb)}, fly ${getNested(
        () => data.speed.fly
      )}<br>
        <hr>

        <div style="display: flex; justify-content: space-between; text-align: center; width: 100%; max-width: 800px; margin: 0 auto; gap: 0.5rem; flex-wrap: wrap;">
            <div><strong>STR:<br></strong> ${data.strength} (${
        Math.floor((data.strength - 10) / 2) >= 0 ? "+" : ""
      }${Math.floor((data.strength - 10) / 2)})</div>
            <div><strong>DEX:<br></strong> ${data.dexterity} (${
        Math.floor((data.dexterity - 10) / 2) >= 0 ? "+" : ""
      }${Math.floor((data.dexterity - 10) / 2)})</div>
            <div><strong>CON:<br></strong> ${data.constitution} (${
        Math.floor((data.constitution - 10) / 2) >= 0 ? "+" : ""
      }${Math.floor((data.constitution - 10) / 2)})</div>
            <div><strong>INT:<br></strong> ${data.intelligence} (${
        Math.floor((data.intelligence - 10) / 2) >= 0 ? "+" : ""
      }${Math.floor((data.intelligence - 10) / 2)})</div>
            <div><strong>WIS:<br></strong> ${data.wisdom} (${
        Math.floor((data.wisdom - 10) / 2) >= 0 ? "+" : ""
      }${Math.floor((data.wisdom - 10) / 2)})</div>
            <div><strong>CHA:<br></strong> ${data.charisma} (${
        Math.floor((data.charisma - 10) / 2) >= 0 ? "+" : ""
      }${Math.floor((data.charisma - 10) / 2)})</div>
        </div>
        <hr>

        <strong>Damage Immunities:</strong> 
        ${
          data.damage_immunities.length
            ? data.damage_immunities.join(", ")
            : "None"
        }<br>

        <strong>Condition Immunities:</strong> 
        ${
          data.condition_immunities.length
            ? data.condition_immunities.map((c) => c.name).join(", ")
            : "None"
        }<br>


        <strong>Proficiencies:</strong>
        ${data.proficiencies
          .map((p) => `${p.proficiency.name} +${p.value}`)
          .join(", ")}<br>
        <strong>Proficiency Bonus:</strong> ${data.proficiency_bonus}<br>

        <strong>Senses:</strong> 
        Blindsight ${getNested(() => data.senses.blindsight)},
        Darkvision ${getNested(() => data.senses.darkvision)}, 
        Passive Perception ${getNested(
          () => data.senses.passive_perception
        )}<br>

        <strong>Languages:</strong> ${data.languages}<br>
        <strong>Challenge Rating:</strong> ${data.challenge_rating} (${
        data.xp
      } XP)<br>
        
        <hr>
        <strong><u>All Special Abilities:</u></strong><br>
        ${data.special_abilities
          .map(
            (ab) => `
          <strong>${ab.name}:</strong> ${ab.desc}<br><br>
        `
          )
          .join("")}

        ${
          data.special_abilities.find((ab) => ab.spellcasting)
            ? `
          <strong><u>Spellcasting Spells:</u></strong><br>
          ${data.special_abilities
            .find((ab) => ab.spellcasting)
            .spellcasting.spells.map(
              (spell) => `
            • ${spell.name} (Level ${spell.level}, ${spell.usage.type}${
                spell.usage.times ? `: ${spell.usage.times}/day` : ""
              })<br>
          `
            )
            .join("")}<br>
        `
            : ""
        }

        <hr>
        <strong><u>All Actions:</u></strong><br>
        ${data.actions
          .map(
            (ac) => `
          <strong>${ac.name}:</strong> ${ac.desc}<br><br>
        `
          )
          .join("")}

        <hr>
        <strong><u>Legendary Actions:</u></strong><br>
        ${
          data.legendary_actions.length
            ? data.legendary_actions
                .map(
                  (la) => `
          <strong>${la.name}:</strong> ${la.desc}<br><br>
        `
                )
                .join("")
            : "None"
        }<br>



        <img src="${imageUrl}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'"><br>

        <strong>Monster URL:</strong> 
        <a href="https://www.dnd5eapi.co${getNested(() => data.url)}">
          https://www.dnd5eapi.co${getNested(() => data.url)}
        </a><br>

        <strong>Last Updated:</strong> ${getNested(
          () => data.updated_at
        )}<br><br>

      `;

      mainDisplay.style.display = "none";
      secondaryDisplay.style.display = "block";
    })
    .catch((error) => {
      console.error("Error:", error);
      totalDisplay.innerHTML = "Monster not found or API error.";
      secondaryDisplay.innerHTML = "";
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("dice-form");
  const resultDiv = document.getElementById("dice-results");
  const saveButton = document.getElementById("save-results-btn");

  let lastResultsText = ""; // Store raw text for saving

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    let outputHtml = "";
    let outputText = "";
    let grandTotal = 0;

    for (const [die, countStr] of formData.entries()) {
      const count = parseInt(countStr);
      const sides = parseInt(die.slice(1)); // e.g. "d20" → 20

      if (count > 0) {
        let rolls = [];
        for (let i = 0; i < count; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          rolls.push(roll);
          grandTotal += roll;
        }
        const subtotal = rolls.reduce((a, b) => a + b, 0);
        outputHtml += `<p><strong>${count} × ${die}</strong>: [ ${rolls.join(
          ", "
        )} ] = ${subtotal}</p>`;
        outputText += `${count} × ${die}: [ ${rolls.join(
          ", "
        )} ] = ${subtotal}\n`;
      }
    }

    if (!outputText) {
      outputHtml = "<p>Please select at least one die to roll.</p>";
      saveButton.style.display = "none";
    } else {
      outputHtml += `<h3>Total Sum: ${grandTotal}</h3>`;
      outputText += `\nTotal Sum: ${grandTotal}\n`;
      saveButton.style.display = "inline-block";
    }

    resultDiv.innerHTML = outputHtml;
    lastResultsText = outputText;
  });

  saveButton.addEventListener("click", function () {
    const blob = new Blob([lastResultsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dice-rolls-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  });
});

// ---- End script.js ----

function rollDungeonDice() {
  const directionOptions = [
    // Basic cardinal movement
    "Left",
    "Right",
    "Forward",
    "Backward",

    // Vertical directions
    "Upward Stairs",
    "Downward Stairs",
    "Climb Up",
    "Drop Down",
    "Elevator Shaft",
    "Ladder Up",
    "Ladder Down",
    "Floating Platform",

    // Branching and alternate routes
    "T-Junction Left",
    "T-Junction Right",
    "Four-Way Intersection",
    "Diagonal Left",
    "Diagonal Right",
    "Split Passageway",
    "Fork in the Path",
    "Curving Corridor Left",
    "Curving Corridor Right",

    // Special & environmental transitions
    "Into a Cave Opening",
    "Behind a Hidden Door",
    "Through an Illusory Wall",
    "Into a Collapsed Tunnel",
    "Through a Cracked Archway",
    "Past a Magical Portal",
    "Into a Sewer Tunnel",
    "Behind a Waterfall",
    "Across a Rope Bridge",
    "Under a Fallen Statue",
    "Through a Trapdoor in the Floor",
    "Up Through a Chimney",
    "Down a Slippery Slope",
    "Into the Shadows",

    // End states
    "Dead End",
    "Blocked Passage",
    "Looping Path",
    "Back Where You Started",
    "Sealed by Magic",
    "Collapsed Rubble",
    "Door Locked from Other Side",

    // Extra-dimensional or magical
    "Into a Portal of Light",
    "Step into the Feywild",
    "Dimensional Rift",
    "Time Distortion Loop",
    "Into the Ethereal Plane",
    "Fall into the Shadow Realm",
  ];

  const mapOptions = [
    "Twisting Tunnels",
    "Flooded Chambers",
    "Collapsed Caverns",
    "Runed Halls",
    "Lava Chasm",
    "Moss-Covered Passage",
    "Ancient Stone Hallway",
    "Trap-Laden Corridor",
    "Cracked Mosaic Floor",
    "Overgrown Vines Tunnel",
    "Echoing Marble Gallery",
    "Dim Torchlit Passage",
    "Slime-Slick Passage",
    "Frozen Ice Tunnel",
    "Alchemical Spillway",
    "Chiseled Dwarven Hall",
    "Secret Sliding Wall",
    "Shadowy Arcane Hall",
    "Underground River Crossing",
    "Bone-Strewn Passage",
    "Cursed Sigil Corridor",
    "Misty Enchanted Tunnel",
    "Glass-Floored Hall",
    "Spiderwebbed Crawlspace",
    "Giant Footprint Tunnel",
    "Crystal-Lined Tunnel",
    "Obsidian-Cut Pathway",
    "Magma-Dripping Passage",
    "Sewer Drainage Channel",
    "Wind-Tunnel Ruins",
    "Stalactite Maze",
    "Tomb-Inscribed Gallery",
    "Clockwork Shaft",
    "Mural-Covered Passage",
    "Hall of Whispering Voices",
    "Rubble-Filled Crawlspace",
    "Dimensional Rift Hallway",
    "Time-Warped Hall",
    "Rotating Stone Passage",
    "Collapsed Spiral Stair",
    "Oil-Slicked Service Tunnel",
    "Ethereal Veil Corridor",
  ];

  const trapOptions = [
    // Classic physical traps
    "Pit Trap",
    "Arrow Trap",
    "Falling Rocks",
    "Swinging Blade",
    "Pressure Plate Spike",
    "Collapsing Floor",
    "Tripwire Darts",
    "Rolling Boulder",

    // Magical traps
    "Magic Rune",
    "Glyph of Warding",
    "Illusory Floor",
    "Teleportation Sigil",
    "Summoning Circle Trap",
    "Fire Glyph Explosion",
    "Necrotic Pulse Field",
    "Sleep Enchantment Trap",

    // Elemental/environmental traps
    "Poison Gas",
    "Freezing Mist",
    "Blinding Flash",
    "Electric Discharge",
    "Acid Spray Nozzles",
    "Steam Blast Vents",
    "Slippery Ice Patch",
    "Gravity Shift Zone",

    // Mechanical/clockwork traps
    "Clockwork Saw Blades",
    "Crushing Walls",
    "Spinning Blade Pillars",
    "Retracting Bridge",
    "Pendulum Scythe",
    "Spring-Loaded Floor Spikes",

    // Psychological and curse-based traps
    "Fear Glyph Trap",
    "Hallucinogenic Dust",
    "Whispers of Madness",
    "Mirror of Entrapment",
    "Binding Curse Trap",
    "Confusion Rune",

    // Specialized or thematic traps
    "Spider Nest Drop",
    "Mimic Treasure Chest",
    "Exploding Statue",
    "Siren Lure Trap",
    "Arcane Feedback Loop",
    "Shadowbind Net",
  ];

  const monsterOptions = [
    // Humanoids
    "Goblins",
    "Orcs",
    "Kobolds",
    "Bandits",
    "Cultists",
    "Drow",
    "Gnolls",
    "Hobgoblins",
    "Tritons",

    // Undead
    "Skeletons",
    "Zombies",
    "Wights",
    "Ghouls",
    "Ghosts",
    "Vampires",
    "Liches",
    "Shadows",

    // Beasts and Animals
    "Dire Wolves",
    "Giant Spiders",
    "Swarm of Bats",
    "Giant Scorpions",
    "Rats",
    "Bears",
    "Lions",

    // Aberrations
    "Ooze",
    "Mind Flayers",
    "Beholders",
    "Gibbering Mouthers",
    "Aboleths",

    // Dragons
    "Dragon Whelp",
    "Young Red Dragon",
    "Black Dragon",
    "Dracolich",
    "Wyvern",

    // Fiends
    "Imps",
    "Barbed Devils",
    "Succubi/Incubi",
    "Balor",
    "Dretches",

    // Celestials
    "Angels",
    "Devas",
    "Unicorns",
    "Couatls",

    // Constructs
    "Animated Armor",
    "Helmed Horrors",
    "Golems",
    "Flying Swords",

    // Elementals
    "Fire Elemental",
    "Earth Elemental",
    "Water Elemental",
    "Air Elemental",
    "Mephits",

    // Fey
    "Dryads",
    "Hags",
    "Pixies",
    "Satyrs",

    // Giants
    "Hill Giants",
    "Stone Giants",
    "Frost Giants",
    "Ogres",
    "Ettins",
    "Cyclopes",

    // Monstrosities
    "Minotaur",
    "Manticore",
    "Chimera",
    "Hydra",
    "Ankheg",
    "Otyugh",

    // Plants
    "Shambling Mound",
    "Myconids",
    "Vine Blight",

    // Swarms
    "Swarms of Insects",
    "Swarms of Rats",
    "Swarms of Wasps",
  ];

  const treasureOptions = [
    // Coins and currency
    "Gold Coins",
    "Silver Coins",
    "Platinum Ingot",
    "Copper Scattered Pouch",
    "Gem-Encrusted Coin Box",

    // Gems and jewelry
    "Minor Gem",
    "Polished Sapphire",
    "Uncut Ruby",
    "Jeweled Crown",
    "Platinum Ring",
    "Silver Necklace with Opal",

    // Scrolls and tomes
    "Ancient Scroll",
    "Spell Scroll (Level 1)",
    "Spell Scroll (Level 3)",
    "Map Fragment",
    "Worn Journal with Secrets",
    "Celestial Prophecy Tablet",

    // Magic potions
    "Potion of Healing",
    "Potion of Invisibility",
    "Potion of Strength",
    "Potion of Fire Breath",
    "Potion of Water Breathing",
    "Elixir of Mind Shielding",

    // Magic weapons and gear
    "Magical Weapon",
    "Enchanted Dagger",
    "Longsword +1",
    "Bow of Returning Arrows",
    "Armor of Resistance",
    "Ring of Protection",
    "Cloak of Elvenkind",
    "Boots of Speed",
    "Bag of Holding",

    // Rare or thematic items
    "Dragon Scale Fragment",
    "Deck of Illusions Card",
    "Phoenix Feather",
    "Cursed Amulet",
    "Infernal Contract",
    "Runed Stone Tablet",
    "Broken Wand (Sparking)",
    "Whistle of Ghostly Summons",

    // Mundane or fun items
    "Ornate Goblet",
    "Ivory Dice Set",
    "Ancient Coin of a Forgotten King",
    "Velvet Mask with Gold Trim",
    "Silver Pipe with Initials",
    "Carved Bone Figurine",
  ];

const terrainOptions = [
  // Plains & Fields
  "Grassland",
  "Savanna",
  "Rolling Hills",
  "Farmland",
  "Meadow",
  "Steppe",

  // Mountains & Highlands
  "Mountain",
  "Highlands",
  "Foothills",
  "Craggy Peak",
  "Rocky Cliff",
  "Snow-Capped Summit",

  // Valleys & Lowlands
  "Valley",
  "Canyon",
  "Gorge",
  "Ravine",
  "Floodplain",
  "Basalt Basin",

  // Forests
  "Temperate Forest",
  "Rainforest",
  "Pine Woods",
  "Old-Growth Forest",
  "Haunted Forest",
  "Mushroom Grove",
  "Bamboo Thicket",

  // Wetlands
  "Swamp",
  "Bog",
  "Marsh",
  "Fen",
  "Quagmire",
  "Mangrove Delta",

  // Deserts
  "Desert",
  "Dune Field",
  "Salt Flat",
  "Wadi (Dry Riverbed)",
  "Oasis",
  "Glass Waste",

  // Arctic & Tundra
  "Tundra",
  "Glacier",
  "Frozen Lake",
  "Permafrost Plain",
  "Icy Ridge",
  "Snowfield",

  // Aquatic
  "Riverbank",
  "Coastal Shore",
  "Ocean Reef",
  "Lakebed",
  "Underwater Trench",
  "Coral Forest",
  "Isle or Atoll",

  // Underground & Subterranean
  "Cave",
  "Cavern System",
  "Underdark",
  "Crystal Tunnel",
  "Lava Tube",
  "Abandoned Mine",
  "Fungal Cavern",

  // Urban & Civilized
  "City Streets",
  "Village Square",
  "Castle Courtyard",
  "Ruined City",
  "Sewer System",
  "Market Bazaar",
  "Temple Grounds",

  // Magical or Anomalous Terrain
  "Shadowfell Blight",
  "Feywild Grove",
  "Planar Rift Zone",
  "Wild Magic Field",
  "Arcane Wastes",
  "Floating Islands",
  "Time-Lost Ruins",
  "Dreamscape Field",

  // Otherworldly/Extraplanar
  "Infernal Wasteland",
  "Celestial Plateau",
  "Elemental Fire Plain",
  "Elemental Water Expanse",
  "Elemental Earth Labyrinth",
  "Astral Void",
  "Ethereal Borderlands"
];

  const weatherOptions = [
    // Mundane weather
    "Clear Skies",
    "Partly Cloudy",
    "Overcast",
    "Light Rain",
    "Heavy Rain",
    "Drizzle",
    "Thunderstorm",
    "Lightning Storm",
    "High Winds",
    "Gusty Breeze",
    "Heavy Fog",
    "Morning Mist",
    "Freezing Rain",
    "Snowfall",
    "Blizzard",
    "Hailstorm",
    "Sweltering Heat",
    "Chilly Breeze",
    "Dust Storm",
    "Humidity Surge",

    // Magical or unique fantasy weather
    "Arcane Winds",
    "Blood Rain",
    "Falling Ash",
    "Ethereal Haze",
    "Wild Magic Storm",
    "Shadow Mist",
    "Planar Distortion Surge",
    "Faerie Light Rain",
    "Radiant Aurora",
    "Elemental Flux (fire/ice zones)",
    "Necrotic Chill",
    "Tempest of Whispers",
    "Mana Flare Showers",
    "Celestial Comet Night",
    "Storm of Echoes",
    "Prismatic Rainfall",
    "Static Storm (lightning strikes trigger magic surges)",
    "Starlight Blizzard (glowing snow)",
    "Inverted Rain (falls upward)",
    "Temporal Fog (slows time within it)",
    "Whispering Winds (carry voices from elsewhere)",
  ];

  document.getElementById("direction-die-result").textContent =
    directionOptions[Math.floor(Math.random() * mapOptions.length)];
  document.getElementById("map-die-result").textContent =
    mapOptions[Math.floor(Math.random() * mapOptions.length)];
  document.getElementById("trap-die-result").textContent =
    trapOptions[Math.floor(Math.random() * trapOptions.length)];
  document.getElementById("monster-die-result").textContent =
    monsterOptions[Math.floor(Math.random() * monsterOptions.length)];
  document.getElementById("treasure-die-result").textContent =
    treasureOptions[Math.floor(Math.random() * treasureOptions.length)];
  document.getElementById("terrain-die-result").textContent =
    terrainOptions[Math.floor(Math.random() * terrainOptions.length)];
  document.getElementById("weather-die-result").textContent =
    weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
}
