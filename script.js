let habits = [];

// ========== NOTIFICATION SETUP ==========

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      console.log(`Notification permission: ${permission}`);
    });
  }
}

function sendReminderNotification() {
  if (Notification.permission === 'granted') {
    new Notification("📅 Daily Reminder", {
      body: "Don't forget to complete your habits today!",
      icon: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png"
    });
  }
}

function scheduleDailyReminder() {
  // 🧪 For testing: triggers after 5 seconds
  // In production, replace with a timed delay until desired reminder hour
  setTimeout(sendReminderNotification, 5000);
}

// ========== MAIN FUNCTIONS ==========

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

function isYesterday(dateStr) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return new Date(dateStr).toDateString() === yesterday.toDateString();
}

function loadHabits() {
  const stored = localStorage.getItem('habits');
  if (stored) {
    habits = JSON.parse(stored);
    const todayStr = new Date().toDateString();
    habits.forEach(habit => {
      if (!habit.startDate) habit.startDate = habit.lastUpdated;
      if (habit.lastUpdated !== todayStr && !isYesterday(habit.lastUpdated)) {
        habit.streak = 0;
      }
    });
    saveHabits();
  }

  renderHabits();
  renderLongestStreak();
  renderHistory();
  updateDarkModeButtons();
}

function addHabit() {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name) return;

  const todayStr = new Date().toDateString();
  habits.push({
    name,
    streak: 1,
    lastUpdated: todayStr,
    startDate: todayStr,
    history: [todayStr]
  });

  input.value = '';
  saveHabits();
  renderHabits();
  renderLongestStreak();
  renderHistory();
}

function renderHabits() {
  const list = document.getElementById('habitList');
  list.innerHTML = '';

  habits.forEach((habit, index) => {
    const li = document.createElement('li');
    li.className = 'bg-gray-100 dark:bg-gray-800 p-3 rounded flex justify-between items-center';
    li.innerHTML = `
      <span><strong>${habit.name}</strong> - Streak: ${habit.streak}</span>
      <div class="space-x-2">
        <button onclick="markComplete(${index})" class="bg-green-500 text-white px-2 py-1 rounded">+1</button>
        <button onclick="editHabit(${index})" class="bg-yellow-500 text-white px-2 py-1 rounded">✏️</button>
        <button onclick="deleteHabit(${index})" class="bg-red-500 text-white px-2 py-1 rounded">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function checkMotivationMilestone(habit) {
  const days = Math.floor((new Date() - new Date(habit.startDate)) / (1000 * 60 * 60 * 24));
  if (days > 0 && days % 7 === 0) {
    const messages = [
      "🔥 One week down! Keep up the amazing work!",
      "🌟 You're forming a powerful habit—stay strong!",
      "💪 7 days of progress—you're unstoppable!",
      "👏 One week of consistency! That's awesome!",
      "🏆 Your future self is already proud!"
    ];
    showNotification(`🎉 ${habit.name}: ${messages[Math.floor(Math.random() * messages.length)]}`);
  }
}

function markComplete(index) {
  const todayStr = new Date().toDateString();
  const habit = habits[index];
  if (habit.lastUpdated !== todayStr) {
    habit.streak += 1;
    habit.lastUpdated = todayStr;
    if (!habit.history.includes(todayStr)) habit.history.push(todayStr);

    showNotification(`${habit.name} streak is now ${habit.streak}!`);
    checkMotivationMilestone(habit);
    saveHabits();
    renderHabits();
    renderLongestStreak();
    renderHistory();
  } else {
    showNotification(`You've already marked ${habit.name} today.`);
  }
}

function deleteHabit(index) {
  if (confirm("Are you sure you want to delete this habit?")) {
    habits.splice(index, 1);
    saveHabits();
    renderHabits();
    renderLongestStreak();
    renderHistory();
  }
}

function editHabit(index) {
  const newName = prompt("Edit habit name:", habits[index].name);
  if (newName && newName.trim()) {
    habits[index].name = newName.trim();
    saveHabits();
    renderHabits();
    renderHistory();
  }
}

function renderLongestStreak() {
  const container = document.getElementById('longestStreaks');
  container.innerHTML = '<h3 class="text-xl font-semibold mb-2">Top Streaks</h3>';

  if (!habits.length) {
    container.innerHTML += '<p>No habits tracked yet.</p>';
    return;
  }

  const top = habits.sort((a, b) => b.streak - a.streak).slice(0, 3);
  const ul = document.createElement('ul');
  ul.className = 'space-y-1';

  top.forEach(h => {
    const li = document.createElement('li');
    li.textContent = `${h.name} - ${h.streak} days`;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.className = 'fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded shadow z-50';
  notif.textContent = msg;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

function updateDarkModeButtons() {
  const toggle = document.getElementById('toggleDarkMode');
  const toggleMobile = document.getElementById('toggleDarkModeMobile');
  const dark = document.documentElement.classList.contains('dark');

  if (toggle) toggle.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
  if (toggleMobile) toggleMobile.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function renderHistory() {
  const container = document.getElementById('historyContainer');
  if (!container) return;
  container.innerHTML = '';

  const today = new Date();
  const days = 30;
  const dateList = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });

  habits.forEach(habit => {
    const row = document.createElement('div');
    row.className = 'habit-row';

    const name = document.createElement('div');
    name.className = 'habit-name';
    name.textContent = habit.name;
    row.appendChild(name);

    const grid = document.createElement('div');
    grid.className = 'habit-history';

    const formatted = (habit.history || []).map(d => {
      const dt = new Date(d);
      return !isNaN(dt) ? dt.toISOString().slice(0, 10) : d;
    });

    dateList.forEach(dateStr => {
      const block = document.createElement('div');
      block.title = dateStr;
      block.className = 'block';
      if (formatted.includes(dateStr)) block.classList.add('done');
      grid.appendChild(block);
    });

    row.appendChild(grid);
    container.appendChild(row);
  });
}

// ========== SINGLE WINDOW ONLOAD ==========

window.onload = () => {
  requestNotificationPermission();
  loadHabits();
  scheduleDailyReminder();

  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) document.documentElement.classList.add('dark');
  updateDarkModeButtons();

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    updateDarkModeButtons();
  };

  document.getElementById('toggleDarkMode')?.addEventListener('click', toggleDarkMode);
  document.getElementById('toggleDarkModeMobile')?.addEventListener('click', toggleDarkMode);

  document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('mobileMenu')?.classList.toggle('hidden');
  });
};
