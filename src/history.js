// 1. SAVE DATA (add new game history)
function saveGameHistory(username, score) {
    // Get existing history or empty array
    const history = JSON.parse(localStorage.getItem('pinballHistory') || '[]');
    
    // Create new history item
    const newItem = {
        username: username || "GuestPlayer", // default if no username
        date: new Date().toLocaleString(), // current date/time
        score: score
    };
    
    // Add to history array
    history.push(newItem);
    
    // Save back to localStorage
    localStorage.setItem('pinballHistory', JSON.stringify(history));
    
    console.log('Game history saved!');
    return true;
}

// 2. CHECK DATA (you already have this)
function checkHistory() {
    const history = JSON.parse(localStorage.getItem('pinballHistory') || '[]');
    
    if (history.length === 0) {
        console.log('No saved game history found.');
        return false;
    }
    
    console.log(`Found ${history.length} saved games`);
    console.log('Latest game:', history[history.length - 1]);
    return history;
}

// 3. DELETE DATA (clear all history)
function clearHistory() {
    localStorage.removeItem('pinballHistory');
    console.log('Game history cleared!');
    
    // Update the display to show empty list
    const historyList = document.getElementById('historyList');
    if (historyList) {
        historyList.innerHTML = "<li>No history yet. Play a game!</li>";
    }
    
    return true;
}

// 4. DELETE SPECIFIC GAME (by index)
function deleteHistoryItem(index) {
    const history = JSON.parse(localStorage.getItem('pinballHistory') || '[]');
    
    if (index >= 0 && index < history.length) {
        history.splice(index, 1); // Remove item at index
        localStorage.setItem('pinballHistory', JSON.stringify(history));
        console.log(`Deleted game at index ${index}`);
        
        // Refresh the display
        displayHistory();
        return true;
    }
    return false;
}

// 5. DISPLAY HISTORY (update your existing code)
function displayHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    const history = JSON.parse(localStorage.getItem('pinballHistory') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = "<li>No history yet. Play a game!</li>";
    } else {
        historyList.innerHTML = ""; // Clear existing list
        
        history.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = `${item.username} : ${item.date} — Score: ${item.score}`;
            
            // Add delete button for each item
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X';
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.onclick = () => {
                if (confirm('Delete this game record?')) {
                    deleteHistoryItem(index);
                }
            };
            
            li.appendChild(deleteBtn);
            historyList.appendChild(li);
        });
    }
}

// saveGameHistory('TestUser', 1500); // Example usage
displayHistory(); // Refresh display after saving