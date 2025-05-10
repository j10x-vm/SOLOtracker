let gear = JSON.parse(localStorage.getItem("gear")) || {
    Head: null,
    Chest: null,
    Legs: null,
    Weapon: null,
    Accessory: null,
    Hands: null
  };
  
  function renderGear() {
    for (const slot in gear) {
      const slotDiv = document.getElementById(`slot-${slot}`);
      slotDiv.textContent = `${slot}: ${gear[slot] || "None"}`;
    }
  }
  
  function equipItem() {
    const name = document.getElementById("gear-name").value.trim();
    const slot = document.getElementById("gear-slot").value;
  
    if (!name) return;
  
    gear[slot] = name;
    saveGear();
    renderGear();
  
    // Reset input
    document.getElementById("gear-name").value = "";
  }
  
  function saveGear() {
    localStorage.setItem("gear", JSON.stringify(gear));
  }
  
  document.addEventListener("DOMContentLoaded", renderGear);
  