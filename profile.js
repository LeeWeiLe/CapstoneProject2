const historyList = document.getElementById('historyList');
if (historyList) {
  const history = JSON.parse(localStorage.getItem('pinballHistory') || '[]');

  if (history.length === 0) {
    historyList.innerHTML = "<li>No history yet. Play a game!</li>";
  } else {
    history.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.date} — Score: ${item.score}`;
      historyList.appendChild(li);
    });
  }
}
