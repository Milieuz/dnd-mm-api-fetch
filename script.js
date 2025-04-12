let form = document.querySelector('form');
let input = document.querySelector('input');
let button = document.querySelector('.all-monsters-btn');

let display = document.querySelector('.monsters-display');
let mainDisplay = document.querySelector('.main-display');
let totalDisplay = document.querySelector('.total-display');
let secondaryDisplay = document.querySelector('.secondary-display');

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
    for (let i=0; i<data.count; i++){
      mainDisplay.innerHTML += '<br>' + 'Monster #'+ [i+1] + ' is: '+ data.results[i].name + ',' + ' <a href="https://www.dnd5eapi.co'+ `${data.results[i].url}` + '">Here</a>' + '<br>' + '<img src="https://www.dnd5eapi.co/api/2014/images/monsters/' + `${data.results[i].name.replace(/\s+/g, '-').toLowerCase()}` + '.png">' + '<br>';
    }
    
    mainDisplay.style.display='block';
    secondaryDisplay.style.display='none';
  });
  
};

// Search and Display singular monster, needs development
form.addEventListener("submit", (event) => {
  event.preventDefault();
  
  
  let combinedUrl = 'https://www.dnd5eapi.co/api/monsters/'+ `${input.value}`;
  
  console.log(combinedUrl);
  
  fetch(combinedUrl)
  .then((response) => response.json())
  .then((data) => {
    
  console.log(data);
    
  totalDisplay.innerHTML = 'Specific Monster Datasheet:';
    
  secondaryDisplay.innerHTML += 'Name: ' + data.name + '<br>' + 
    'Size: ' + data.size + '<br>' +
    'Type: ' + data.type + ' (' + data.subtype + ')' + '<br>' +
    'Alignment: ' + data.alignment + '<br>' +
    '<br>' +
    'Armor Class: ' + data.armor_class[0].value + ' (' + data.armor_class[0].armor[0].name + ', ' + data.armor_class[0].armor[1].name + ')' + '<br>' +
    'Hit Points: ' + data.hit_points + ' (' + data.hit_points_roll + ')' + '<br>' +
    'Speed: ' + data.speed.walk + '<br>' +
    '<br>' +
    'STR: ' + data.strength + '<br>' +
    'DEX: ' + data.dexterity + '<br>' +
    'CON: ' + data.constitution + '<br>' +
    'INT: ' + data.intelligence + '<br>' +
    'WIS: ' + data.wisdom + '<br>' +
    'CHA: ' + data.charisma + '<br>' +
    '<br>' +
    data.proficiencies[0].proficiency.name + ' +' + data.proficiencies[0].value + '<br>' +
    'Senses: ' + 'darkvision ' + data.senses.darkvision + ' passive Perception ' + data.senses.passive_perception + '<br>' +
    'Languages: ' + data.languages + '<br>' +
    'Challenge Rating: ' + data.challenge_rating + ' (' + data.xp + ' XP)' + '<br>' +
    'Special Abilities: ' + data.special_abilities[0].name + ' - ' + data.special_abilities[0].desc + '<br>' +
    '<br>' +
    'Actions: ' + data.actions[0].name + ' - ' + data.actions[0].desc + '<br>' +
    data.actions[1].name + ' - ' + data.actions[1].desc +
    '<br>' +   
    '<br>' +    
    '<img src="https://www.dnd5eapi.co/api/2014/images/monsters/goblin.png">'; // HOW TO PASS THIS VARIABLE ??? 
// WORKING ABOVE HERE, FORMATTED 
    
    mainDisplay.style.display='none';
    secondaryDisplay.style.display='block';
    
  });
  
});