document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe?.user;
  const nameUser = user?.first_name || 'друг';
  console.log(`Hello, ${nameUser}!`)
  const photo = user?.photo_url;

  const nameHello = document.getElementById("name")
  const greeting = document.getElementById('greeting');
  const avatar = document.getElementById('user-photo');
  const mainScreen = document.getElementById('main-screen');
  const entryScreen = document.getElementById('entry-screen');
  const newEntryBtn = document.getElementById('new-entry-btn');
  const backBtn = document.getElementById('back-btn');
  const saveEntryBtn = document.getElementById('save-entry-btn');
  const entryText = document.getElementById('entry-text');
  const entriesList = document.getElementById('entries-list');
  const entryTitle = document.getElementById('entry-title');

let longPressTimer;
let selectedEntryIndex = null;
const contextMenu = document.getElementById('context-menu');
const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');

  let editingIndex = null;

  // Greeting logic
  const hour = new Date().getHours();
  let timeGreeting = 'Здравствуйте';
  if (hour >= 5 && hour < 12) timeGreeting = 'Доброе утро';
  else if (hour >= 12 && hour < 17) timeGreeting = 'Добрый день';
  else if (hour >= 17 && hour < 23) timeGreeting = 'Добрый вечер';
  else timeGreeting = 'Доброй ночи';

  greeting.textContent = `${timeGreeting}, ${nameUser}`;
  if (photo) avatar.src = photo;

  function getEntries() {
    return JSON.parse(localStorage.getItem('entries') || '[]');
  }

  function saveEntries(entries) {
    localStorage.setItem('entries', JSON.stringify(entries));
  }

  function renderEntries() {
    const entries = getEntries();
    entriesList.innerHTML = '';
    entries.forEach((entry, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <p>${entry.text.length < 200 ? entry.text.slice(0, 20) + '...' : entry.text}</р>
        <small>${new Date(entry.date).toLocaleString()}</small>
      `;
      li.addEventListener('touchstart', () => {
      longPressTimer = setTimeout(() => {
        selectedEntryIndex = index;
        contextMenu.classList.remove('hidden');
      }, 600); // 600ms — считается "долгим"
    });
    li.addEventListener('touchend', () => clearTimeout(longPressTimer));

    // Клик для обычного редактирования
    li.addEventListener('click', () => editEntry(index));

    entriesList.appendChild(li);
      
    });
  }

  editBtn.addEventListener('click', () => {
  if (selectedEntryIndex !== null) {
    editEntry(selectedEntryIndex);
    hideContextMenu();
  }
});




// Кнопка "Удалить"
deleteBtn.addEventListener('click', () => {
  if (selectedEntryIndex !== null) {
    const entries = getEntries();
    if (confirm('Удалить эту запись?')) {
      entries.splice(selectedEntryIndex, 1);
      saveEntries(entries);
      renderEntries();
    }
    hideContextMenu();
  }
});

function hideContextMenu() {
  contextMenu.classList.add('hidden');
  selectedEntryIndex = null;
}

// При клике вне меню — закрываем
document.addEventListener('click', (e) => {
  if (!contextMenu.contains(e.target)) {
    hideContextMenu();
  }
});


  function saveEntry() {
    const text = entryText.value.trim();
    if (!text) return;

    const entries = getEntries();
    const newEntry = {
      text,
      date: new Date().toISOString()
    };

    if (editingIndex !== null) {
      entries[editingIndex] = newEntry;
    } else {
      entries.unshift(newEntry);
    }

    saveEntries(entries);
    entryText.value = '';
    editingIndex = null;
    showMainScreen();
    renderEntries();
  }

  function editEntry(index) {
    const entries = getEntries();
    const entry = entries[index];
    entryText.value = entry.text;
    editingIndex = index;
    entryTitle.textContent = 'Редактирование записи';
    showEntryScreen();
  }

  function showMainScreen() {
    mainScreen.hidden = false;
    entryScreen.hidden = true;
    entryTitle.textContent = 'Запись мыслей';
  }

  function showEntryScreen() {
    mainScreen.hidden = true;
    entryScreen.hidden = false;
    entryText.focus();
  }

  newEntryBtn.addEventListener('click', () => {
    entryText.value = '';
    editingIndex = null;
    showEntryScreen();
  });

  backBtn.addEventListener('click', () => {
    showMainScreen();
  });

  saveEntryBtn.addEventListener('click', saveEntry);

  renderEntries();

  // Notifications
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  function scheduleDailyNotification() {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const target = new Date();
    target.setHours(20, 0, 0, 0);
    if (now > target) target.setDate(target.getDate() + 1);

    const delay = target - now;

    setTimeout(() => {
      new Notification('Напоминание', {
        body: 'Напомни себе, как прошёл день 🌆',
        icon: photo || ''
      });

      setInterval(() => {
        new Notification('Напоминание', {
          body: 'Что произошло сегодня? ✍️',
          icon: photo || ''
        });
      }, 24 * 60 * 60 * 1000);
    }, delay);
  }

  scheduleDailyNotification();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
});


document.addEventListener("keydown", function(event) {
  if (event.metaKey && event.key === "Enter") {
    event.preventDefault(); 
    saveEntry()
  }
});

window.addEventListener('load', () => {
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe?.user;
  const modal = document.getElementById('welcome-modal');
  const blur = document.getElementById('modal-blur-overlay');
  const startBtn = document.getElementById('start-btn');
  const nameHello = document.getElementById("name")
  const nameUser = user?.first_name || 'друг';

  nameHello.textContent = nameUser

  const isFirstVisit = !localStorage.getItem('visitedOnce');

  if (isFirstVisit) {
    modal.classList.remove('hidden');
    blur.classList.remove('hidden');
  }

  startBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    blur.classList.add('hidden');
    localStorage.setItem('visitedOnce', 'true');
  });
});


