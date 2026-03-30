const bttn = document.getElementById("search");
bttn.addEventListener('click', async () => {
  const searchBar = document.getElementById("searchBAR").value.trim();
  const display = document.getElementById("display");
  searchBar.addEventListener(keydown,(e)=>{
    if(e.key === "Enter"){
      console.log('yep');
    }
  })
   
  if (!searchBar) {
    display.textContent = "Search for something first";
    display.style.color = "#ff5454";
    return;
  }

  // Fetch all books from IndexedDB
  const transaction = db.transaction('books', 'readonly');
  const store = transaction.objectStore('books');
  const request = store.getAll();

  request.onsuccess = () => {
    const books = request.result;
    if (!books || books.length === 0) {
     display.style.fontSize = "25px"
      display.textContent = "No books found.";
      return;
    }

    // Create search index
    function normalize(str) {
      return str.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, ' ').trim();
    }

    function levenshtein(a, b) {
      const matrix = Array(b.length + 2).fill().map(() => Array(a.length + 2).fill(0));
      for (let i = 1; i <= b.length; i++) matrix[i][0] = i;
      for (let j = 1; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b[i - 1] === a[j - 1]) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j] + 2,
              matrix[i][j - 1] + 2,
              matrix[i - 1][j - 2] + 2
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }

    const searchIndex = books.map(book => {
      const name = normalize(book.name);
      const tokens = name.split(/\s+/);
      return { ...book, name, tokens };
    });

    // Search function
    function searchBooks(query, index) {
      const normalizedQuery = normalize(query);
      const queryWords = normalizedQuery.split(/\s+/);
      if (normalizedQuery.length < 3) return [];

      const results = [];
      for (const item of index) {
        let matchCount = 0;
        for (const qWord of queryWords) {
          if (qWord.length < 3 || new Set(qWord).size === 1) continue;
          const isMatch = item.tokens.some(token =>
            token.length >= 3 && (levenshtein(qWord, token) <= 2 || token.includes(qWord))
          );
          if (isMatch) matchCount++;
        }
        if (item.name.includes(normalizedQuery)) matchCount += 3;
        const score = matchCount / queryWords.length;
        if (score >= 0.5) {
          results.push({ item, score });
        }
      }
      return results.sort((a, b) => b.score - a.score).map(r => r.item);
    }

    const results = searchBooks(searchBar, searchIndex);
    display.innerHTML = "";

    if (results.length === 0) {
      display.style.marginTop = "30%";
      display.style.textShadow = "0 0 1px white";
      display.style.fontSize = "25px";
      display.textContent = "No matching results found";
      display.style.color = "black";
      return;
    }

    results.forEach(book => {
      const coverDiv = document.createElement("div");
      coverDiv.className = "layout2";
      coverDiv.style.display = "inline-block";
      coverDiv.style.margin = "10px";
      coverDiv.style.cursor = "pointer";

      coverDiv.innerHTML = `
        <img src="${book.cover}" alt="cover" style="width:140px; height:140px; object-fit:cover; border-radius:10px;"/>
        <h2 style="width:120px; height:80px; margin-top:10%;">${book.name}</h2>
      `;

      coverDiv.addEventListener('click', () => {
        // Open book using its timestamp
        viewBook(book.timestamp); // ✅ passes correct timestamp
      });

      display.appendChild(coverDiv);
    });
  };

  request.onerror = () => {
    display.textContent = "Error loading books.";
  };
});
