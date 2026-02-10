// BOOK SYSTEM (bS.js) is for the books rendered on library page both for the publisher and landing page of the app

let library = document.querySelector(".library")
function loadBookshelf() {
  const noBooks = document.getElementById('NoBooks')
  const books = JSON.parse(localStorage.getItem("uploadedBooks")) || [];

  if (books.length === 0) {
    noBooks.innerHTML = "<p>No books yet. Write your first one!</p>";
    return;
  }

  library.innerHTML = "";

  books.forEach((book,index)=> {
    let coverDiv = document.createElement("div");
    coverDiv.className = "layout"
    coverDiv.style.textAlign = "left";
    coverDiv.style.cursor = "pointer";
    coverDiv.name = book.name;

    coverDiv.innerHTML = `
    <h3 style=" position:absolute; left:35%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${book.name}</h3>
      <img src="${book.cover}" alt="Cover" style="width:100px; height:100px; object-fit:; border-radius: 8px; border: 2px solid #ddd;">
      
    `;

    // Open full book on click
    coverDiv.addEventListener('click',() => openBook(index))
    library.appendChild(coverDiv);
  });
}

// Load bookshelf when page loads
window.addEventListener("load", loadBookshelf);

function openBook(index) {
  const books = JSON.parse(localStorage.getItem('uploadedBooks'));
  const book = books[index];

  let existingDialog = document.getElementById('dialog');
  if (existingDialog) {
    existingDialog.remove();
  }

  // Create dialog element
  const dialog = document.createElement('dialog');
  dialog.id = 'dialog';
  dialog.style.maxWidth = '800px';
  dialog.style.width = '95vw';
  dialog.style.height = '95vh';
  dialog.style.border = 'none';
  dialog.style.borderRadius = '12px';
  dialog.style.padding = '0';
  dialog.style.overflow = 'hidden';
  dialog.style.outline = 'none';
  dialog.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';

  // Modal HTML content (NO SCRIPT TAG)
  const modalHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; background: white;">
      <!-- Header -->
      <div style="flex-shrink: 0; padding: 15px 20px; background: #189; color: white; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size:1.6em; text-align:center;">📖 ${book.name}</h2>
        <button id="close-btn" style="background: none; border: none; color: white; font-size: 1.5em; cursor: pointer;">×</button>
      </div>

      <!-- Font Size Control -->
      <div style="flex-shrink: 0; padding: 10px 20px; background: #888; display: flex; align-items: center; gap: 10px;">
        <label>🔤 Size: </label>
        <input type="range" id="fsSlider" min="12" max="30" value="16" style="flex:1;">
        <span id="fsValue">16px</span>
      </div>

      <!-- Scrollable Content -->
      <div style="flex: 1; overflow-y: auto; padding: 20px; line-height: 1.6;">
        ${book.cover ? `<img src="${book.cover}" alt="Cover" style="max-width:35%; height: auto; display: block; margin: 20px auto; border-radius: 8px;">` : ""}

        <div id="contentArea" class="content" style="font-size: 16px; white-space: normal;">
          ${book.type === 'text' 
            ? (book.content.startsWith('data:text/plain;base64,')
                ? atob(book.content.split(',')[1]).replace(/\n/g, '<br>')
                : book.content.replace(/\n/g, '<br>')
              )
            : `<p>📎 <a href="${book.content}" target="_blank">Download or view PDF</a></p>`
          }
        </div>
      </div>
    </div>
  `;

  dialog.innerHTML = modalHTML;
  document.body.appendChild(dialog);

  // ✅ Now get elements and attach slider logic
  const slider = dialog.querySelector('#fsSlider');
  const valueDisplay = dialog.querySelector('#fsValue');
  const contentArea = dialog.querySelector('#contentArea');

  // Update font size live
  slider.addEventListener('input', function () {
    const size = this.value + 'px';
    contentArea.style.fontSize = size;
    valueDisplay.textContent = size;
  });

  // Close button action
  dialog.querySelector('#close-btn').onclick = () => {
    dialog.close();
    dialog.remove();
  };

  // Press Escape to close
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dialog.close();
      dialog.remove();
    }
  });

  // Show modal
  dialog.showModal();
}

const btn = document.getElementById("find1");


btn.addEventListener('click',()=>{
  let searchBar = document.getElementById("searchBar").value.trim();
let display = document.getElementById("display");
if(!searchBar){
  display.textContent = "Search for something first";
  display.style.color = "#ff5454";
  return;
}
function levenshtein(a, b) {
  const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
  for (let i = 1; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 1; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function normalize(str) {
  return str.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, ' ').trim();
}
 
function createSearchIndex(books) {
  return books.map(book => {
    const name = normalize(book.name);
    const tokens = name.split(/\s+/);
    return { ...book, name, tokens };
  });
}

function searchBooks(query, index) {
  const normalizedQuery = normalize(query);
  const queryWords = normalizedQuery.split(/\s+/);
  const results = [];
  
  for (const item of index) {
    let matchCount = 0;

if(normalizedQuery.length < 3 ){
   return[];
 }

    for (const qWord of queryWords) {
    if(qWord.length < 3 || new Set(qWord).size === 1) continue ;
      const isMatch = item.tokens.some(token => token.length >= 3 && (levenshtein(qWord,token) <= 2 || token.includes(qWord))
      );
    if (isMatch) matchCount++;
    }
    // Strong boost for full title match
    if (item.name.includes(normalizedQuery)) matchCount += 3;

    const score = matchCount / queryWords.length;
    if (score >= 0.5) { // Minimum relevance threshold
      results.push({ item, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map(r => r.item);
}
// Sample data
const books = JSON.parse(localStorage.getItem('uploadedBooks')) || [];

const searchIndex = createSearchIndex(books);
const results = searchBooks(searchBar,searchIndex);

display.innerHTML = "";
if(results.length === 0){
  display.textContent = "matching results not found";
  display.style.color = "black";
}

results.forEach(book => {
  let coverDiv = document.createElement("div");
  coverDiv.className = "layout2";
  coverDiv.style.display = "inline-block";
  coverDiv.style.margin = "10px";
  coverDiv.style.cursor = "pointer";
  coverDiv.style.color = 'black';


coverDiv.innerHTML = `
      <img src="${book.cover}" alt ="cover" style="width:140px; height:140px; object-fit:cover; border-radius:10px;"/>
      <h2 style="width:120px;height:80px;margin-top:10%;">${book.name}</h2>
`;
coverDiv.addEventListener('click',()=>{
  //full books 
  const allBooks = JSON.parse(localStorage.getItem("uploadedBooks"));
  const index = allBooks.findIndex(b => b.timestamp === book.timestamp);
    if(index !== -1){
      openBook(index);
    }else{
      console.log("book not found");
    }
      console.log("book opened", index)
});
   display.appendChild(coverDiv);
});
});

