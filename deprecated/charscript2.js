


function exportCharacter() {
  const form = document.getElementById('character-sheet');
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
  characterName = characterName.replace(/[^a-z0-9_-]/gi, '_');

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  // Timestamp
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:T]/g, '-').split('.')[0];

  const a = document.createElement("a");
  a.href = url;
  a.download = `${characterName}-${timestamp}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}



function importCharacter() {
  document.getElementById('importFile').click();
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      const form = document.getElementById('character-sheet');
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
  const scores = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
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
  const scores = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  for (let stat of scores) {
    const el = document.querySelector(`[name="\${stat}"]`);
    if (el) {
      el.addEventListener("input", calculateModifiers);
    }
  }
  calculateModifiers();
});



function calculateModifiers() {
  const scores = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
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
  const scores = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  for (let stat of scores) {
    const el = document.querySelector(`[name="${stat}"]`);
    if (el) {
      el.addEventListener("input", calculateModifiers);
    }
  }
  calculateModifiers();
});
