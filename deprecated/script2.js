let form = document.querySelector('form');
let input = document.querySelector('input');
let button = document.querySelector('.all-monsters-btn');

let display = document.querySelector('.monsters-display');
let mainDisplay = document.querySelector('.main-display');
let totalDisplay = document.querySelector('.total-display');
let secondaryDisplay = document.querySelector('.secondary-display');

function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  menu.classList.toggle("open");
  document.body.classList.toggle("menu-open");
}

// Display All Monsters
  button.onclick = function () {
  
  let combinedUrl = 'https://www.dnd5eapi.co/api/monsters';
  
  console.log(combinedUrl);
  
  fetch(combinedUrl)
  .then((response) => response.json())
  .then((data) => {
    
    console.log(data);

    totalDisplay.innerHTML = 'There are ' + data.count + ' total monsters. <br> Disclaimer: Many API images are not present, resulting in broken .png links.';

// *** Trying to have this line produce the link to the subsection of the API for each entry, but cannot concatenate the variable into the passed HTML
    let i = 0;
function displayNextMonster() {
  if (i >= data.count) return;

  const monster = data.results[i];
  const slug = monster.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <br>Monster #${i + 1} is: ${monster.name}, 
    <a href="https://www.dnd5eapi.co${monster.url}" target="_blank">Here</a><br>
  `;

  const img = document.createElement('img');
  img.src = `https://www.dnd5eapi.co/api/2014/images/monsters/${slug}.png`;
  img.onerror = function () {
    this.style.display = 'none';

    const link = document.createElement('a');
    link.href = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(monster.name)}`;
    link.target = '_blank';
    link.innerText = 'Image not found. Search on Google Images';
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
    
    mainDisplay.style.display='block';
    secondaryDisplay.style.display='none';
  });
  
};

// Search and Display singular monster, needs development
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const monsterName = input.value.trim().toLowerCase().replace(/\s+/g, '-');
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

      totalDisplay.innerHTML = 'Specific Monster Datasheet:';
      secondaryDisplay.innerHTML = ''; // Clear previous

      // Helper: get safe nested value
      const getNested = (path, fallback = "N/A") => {
        try {
          return path() ?? fallback;
        } catch {
          return fallback;
        }
      };

      const slug = data.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      const imageUrl = `https://www.dnd5eapi.co/api/2014/images/monsters/${slug}.png`;

      secondaryDisplay.innerHTML += `
        <strong>Name:</strong> ${data.name}<br>
        <strong>Size:</strong> ${data.size}<br>
        <strong>Type:</strong> ${data.type} (${data.subtype || "None"})<br>
        <strong>Alignment:</strong> ${data.alignment}<br><br>

        <strong>Armor Class:</strong> ${getNested(() => data.armor_class[0].value)} 
          (${getNested(() => data.armor_class[0].armor[0].name)}, 
           ${getNested(() => data.armor_class[0].armor[1].name)})<br>

        <strong>Hit Points:</strong> ${data.hit_points} (${data.hit_points_roll})<br>
        <strong>Speed:</strong> ${getNested(() => data.speed.walk)}<br><br>

        <strong>STR:</strong> ${data.strength} |
        <strong>DEX:</strong> ${data.dexterity} |
        <strong>CON:</strong> ${data.constitution} |
        <strong>INT:</strong> ${data.intelligence} |
        <strong>WIS:</strong> ${data.wisdom} |
        <strong>CHA:</strong> ${data.charisma}<br><br>

        <strong>Proficiency:</strong> ${getNested(() => data.proficiencies[0].proficiency.name)} 
        +${getNested(() => data.proficiencies[0].value)}<br>

        <strong>Senses:</strong> darkvision ${getNested(() => data.senses.darkvision)}, 
        passive perception ${getNested(() => data.senses.passive_perception)}<br>

        <strong>Languages:</strong> ${data.languages}<br>
        <strong>Challenge Rating:</strong> ${data.challenge_rating} (${data.xp} XP)<br><br>

        <strong>Special Ability:</strong> ${getNested(() => data.special_abilities[0].name)} - 
        ${getNested(() => data.special_abilities[0].desc)}<br><br>

        <strong>Actions:</strong><br>
        ${getNested(() => data.actions[0].name)} - ${getNested(() => data.actions[0].desc)}<br>
        ${getNested(() => data.actions[1].name)} - ${getNested(() => data.actions[1].desc)}<br><br>

        <img src="${imageUrl}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
      `;

      mainDisplay.style.display = 'none';
      secondaryDisplay.style.display = 'block';
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
        outputHtml += `<p><strong>${count} × ${die}</strong>: [ ${rolls.join(", ")} ] = ${subtotal}</p>`;
        outputText += `${count} × ${die}: [ ${rolls.join(", ")} ] = ${subtotal}\n`;
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
    anchor.download = `dice-rolls-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  });
});
