let level = parseInt(localStorage.getItem("level")) || 1;
let xp = parseInt(localStorage.getItem("xp")) || 0;
let xpToNext = 100;
let stats = JSON.parse(localStorage.getItem("stats")) || {
  Strength: 10,
  Agility: 10,
  Intelligence: 10,
  Endurance: 10,
  Perception: 10,
  Creativity: 10
};

const unlockedSkills = JSON.parse(localStorage.getItem("unlockedSkills")) || {};

for (let stat in unlockedSkills) {
  if (stats[stat] !== undefined) {
    stats[stat] += unlockedSkills[stat];
  }
}

let chart;

document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("hunterName") || "Hunter";
  document.getElementById("hunterName").textContent = name;
  document.getElementById("level").textContent = level;
  document.getElementById("xp").textContent = xp;
  document.getElementById("xp-max").textContent = xpToNext;
  updateXPBar();
  drawRadarChart();
  loadTasks();
});

function updateXPBar() {
  const percent = (xp / xpToNext) * 100;
  document.getElementById("xp-fill").style.width = `${percent}%`;
}

function drawRadarChart() {
  const ctx = document.getElementById("statChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: Object.keys(stats),
      datasets: [{
        label: "Stats",
        data: Object.values(stats),
        fill: true,
        backgroundColor: "rgba(0, 245, 160, 0.2)",
        borderColor: "#00f5a0",
        pointBackgroundColor: "#00f5a0"
      }]
    },
    options: {
      responsive: false,
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 50,
          ticks: {
            display: false // Hides the numbers
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)"
          },
          angleLines: {
            color: "rgba(255, 255, 255, 0.2)"
          },
          pointLabels: {
            color: "#fff"
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function addTask() {
  const taskInput = document.getElementById("new-task");
  const xpInput = document.getElementById("xp-reward");
  const statInput = document.getElementById("stat-select");

  const taskText = taskInput.value.trim();
  const xpValue = parseInt(xpInput.value);
  const statTarget = statInput.value;

  if (!taskText || isNaN(xpValue)) return;

  const task = {
    id: Date.now(),
    text: taskText,
    xp: xpValue,
    stat: statTarget
  };

  saveTask(task);
  renderTask(task);

  // Reset fields
  taskInput.value = "";
  xpInput.value = 20;
  statInput.value = "";
}

function saveTask(task) {
  const tasks = getSavedTasks();
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getSavedTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function loadTasks() {
  const tasks = getSavedTasks();
  tasks.forEach(renderTask);
}

function renderTask(task) {
  const ul = document.getElementById("task-list");
  const li = document.createElement("li");
  li.id = `task-${task.id}`;

  const title = document.createElement("span");
  title.textContent = `${task.text} (+${task.xp}XP${task.stat ? ", +" + task.stat : ""})`;

  const startBtn = document.createElement("button");
  startBtn.textContent = "Start Quest";
  startBtn.onclick = () => startQuest(task, li);

  const timer = document.createElement("span");
  timer.className = "quest-timer";
  timer.style.margin = "0 10px";

  const completeBtn = document.createElement("button");
  completeBtn.textContent = "Complete";
  completeBtn.disabled = false;
  completeBtn.onclick = () => {
    gainXP(task.xp);
    if (task.stat) stats[task.stat] += 1;
    deleteTask(task.id);
    li.remove();
    drawRadarChart();
  };

  li.appendChild(title);
  li.appendChild(timer);
  li.appendChild(startBtn);
  li.appendChild(completeBtn);
  ul.appendChild(li);
}

function deleteTask(id) {
  let tasks = getSavedTasks();
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function gainXP(amount) {
  xp += amount;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    levelUp();
  }

  saveProgress();
  updateUI();
}

function levelUp() {
  level++;
  xpToNext = Math.floor(100 * Math.pow(1.2, level - 1)); // XP requirement grows
  stats["Strength"] += 1; // Optional default boost on level up
}

function increaseStats() {
  for (let stat in stats) {
    stats[stat] += Math.floor(Math.random() * 3) + 1;
  }
  drawRadarChart();
}

function saveProgress() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("stats", JSON.stringify(stats));
}

function updateUI() {
  document.getElementById("level").textContent = level;
  document.getElementById("xp").textContent = xp;
  document.getElementById("xp-max").textContent = xpToNext;
  updateXPBar();
  drawRadarChart();
}
updateUI();

function startQuest(task, li) {
  const duration = 10 * 60; // 10 minutes in seconds (change this to your desired time)
  const timerSpan = li.querySelector(".quest-timer");
  const completeBtn = li.querySelector("button:nth-of-type(2)");
  const startBtn = li.querySelector("button:nth-of-type(1)");

  startBtn.disabled = true;

  let remaining = duration;

  const interval = setInterval(() => {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    timerSpan.textContent = ` | ⏳ ${mins}:${secs.toString().padStart(2, '0')}`;

    if (remaining <= 0) {
      clearInterval(interval);
      timerSpan.textContent = " | ✅ Quest Ready";
    }

    remaining--;
  }, 1000);
}