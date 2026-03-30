const bookNameInput = document.getElementById('bookName');
const fileInput = document.getElementById('file-input');
const storyScript = document.getElementById('storyScript');
const imageIn = document.getElementById('image-input');
const imageNameDisplay = document.getElementById('file-name');
const imagePreview = document.getElementById('image-preview');
const publishBtn = document.getElementById('publish-btn');
const readerStatus = document.getElementById('reader-status');
const bookshelfContainer = document.getElementById('bookshelf');
const bookRead = document.getElementById("bookRead"); 

// Supported file types
const allowedTypes = {
  text: 'text/plain',
  pdf: 'application/pdf',
  image: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
};

// Track selected files
let selectedFile = null;
let selectedImage = null;

// Show file name when selected
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type === allowedTypes.text || file.type === allowedTypes.pdf) {
    const maxSize = file.type === allowedTypes.pdf ? 5 * 1024 * 1024 : 1 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(file.type === allowedTypes.pdf ? '⚠️ PDF too large! Keep under 5MB.' : '❌ File too large! Keep under 1MB.');
      fileInput.value = '';
      return;
    }
    imageNameDisplay.textContent = `📄 ${file.name}`;
    selectedFile = file;
  } else {
    alert('❌ Please select a .txt or .pdf file.');
    fileInput.value = '';
  }
});

// Show image preview
imageIn.addEventListener('change', (e) => {
  console.log('this is it ')
  const file = e.target.files[0];
  if (!file) return;

  if (allowedTypes.image.includes(file.type)) {
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.innerHTML = `<img src="${reader.result}" alt="Cover" style="height: 100px; object-fit: cover;">`;
    };
    reader.onerror = () => alert('❌ Failed to load image.');
    reader.readAsDataURL(file);
    selectedImage = file;
  } else {
    alert('❌ Please select a valid image (jpg, png, webp).');
  }
});

// Open indexedDB
let db;
const request = indexedDB.open('BookshelfDB', 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;
  if (!db.objectStoreNames.contains('books')) {
    db.createObjectStore('books', { keyPath: 'timestamp' });
  }
};

request.onsuccess = (e) => {
  db = e.target.result;
  // Load books once DB is ready
  renderBookshelf();
};

request.onerror = (e) => {
  console.error('DB Error:', e.target.error);
};

// Helper: Wait for DB
function withDB(callback) {
  if (db) callback(db);
  else request.onsuccess = () => callback(db);
}

// Create book object
function createBookObject(name, content, type, cover, description) {
  return {
    name,
    content,
    type,
    cover,
    description,
    timestamp: new Date().toISOString()
  };
}

// Save book to indexedDB
function addToDB(book) {
  const transaction = db.transaction('books', 'readwrite');
  const store = transaction.objectStore('books');
  const req = store.add(book);

  req.onsuccess = () => {
    readerStatus.textContent = `✅ "${book.name}" published!`;
    clearForm();
    renderBookshelf();
  };

  req.onerror = () => {
    if (req.error.name === 'ConstraintError') {
      alert('📚 Book already exists!');
    } else if (req.error.name === 'QuotaExceededError') {
      alert('📚 Storage full! Try smaller files or delete old books.');
    } else {
      alert('❌ Save failed: ' + req.error.name);
    }
  };
}

// Publish Book
publishBtn.addEventListener('click', () => {
  const bookName = bookNameInput.value.trim();
  const bookDescription = document.getElementById('bookDescriptuon')
  if (!bookName) {
    alert('⚠️ Please enter a book name.');
    return;
  }

  let content = null;
  let fileType = '';

  // Case 1: Text from textarea
  if (storyScript.value.trim()) {
    try {
      content = `data:text/plain;base64,${btoa(storyScript.value.trim())}`;
      fileType = 'text';
    } catch (e) {
      alert('❌ Text has unsupported characters.');
      return;
    }
  }
  // Case 2: .txt file
  else if (selectedFile && selectedFile.type === allowedTypes.text) {
const reader = new FileReader();
reader.onload = () => {
try {
content = `data:text/plain;base64,${btoa(reader.result)}`;
saveBook(bookName, content, 'text');
} catch (e) {
alert('❌ Failed to encode text.');
}
};
reader.onerror = () => alert('❌ Failed to read text file.');
reader.readAsText(selectedFile);
return;
}
// Case 3: .pdf file
else if (selectedFile && selectedFile.type === allowedTypes.pdf) {
const reader = new FileReader();
reader.onload = () => {
content = reader.result;
saveBook(bookName, content, 'pdf');
};
reader.onerror = () => alert('❌ Failed to read PDF.');
reader.readAsDataURL(selectedFile);
return;
} else {
alert('⚠️ Provide content via text or file.');
return;
}

// Save directly if content is ready
saveBook(bookName, content, fileType);
});

// Save book (helper to handle image)
function saveBook(name, content, type,description) {
withDB(() => {
const book = createBookObject(name, content, type, null);
if (selectedImage) {
const reader = new FileReader();
reader.onload = () => {
book.cover = reader.result;
addToDB(book);
};
reader.onerror = () => alert('❌ Failed to read cover image.');
reader.readAsDataURL(selectedImage);
} else {
addToDB(book);
}
});
}

// Clear form
function clearForm() {
bookNameInput.value = '';
storyScript.value = '';
//fileInput.value = '';
//imageIn.value = '';
imageNameDisplay.textContent = '';
imagePreview.innerHTML = '';
selectedFile = null;
selectedImage = null;
}

// Render bookshelf
function renderBookshelf() {
  
  bookshelfContainer.innerHTML = ''; // clear current list

  const transaction = db.transaction('books', 'readonly');
  const store = transaction.objectStore('books');
  const request = store.getAll();

  request.onsuccess = () => {
    const books = request.result || [];

    if (books.length === 0) {
      bookshelfContainer.innerHTML = '<h3 style="color:white; margin-top:10%">No books yet. Publish your first book!</h3>';
      return;
    }

    // sort by timestamp (newest first)
    books.sort((a, b) => b.timestamp - a.timestamp);
    books.forEach((book, index) => {
      const bookDiv = document.createElement('div');
      bookDiv.className = 'book-item';
      bookDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 10px; border:none; border-radius: 25px; background: #f8f9fa; box-shadow:0 0 2px black;">
          <div>
            ${book.cover 
              ? `<img src="${book.cover}" alt="Cover" style="height: 100px; width: 80px; object-fit: cover; border:none; box-shadow:0 0 4px black; border-radius:10px;">` 
              : `<div style="height: 80px; width: 60px; background: #eee; display: flex; align-items: center; justify-content: center;">📘</div>`
            }
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0; font-size: 1.1em;">${book.name}</h3>
            <p style="margin: 5px 0; font-size: 0.9em; color: #555;">
              ${book.type === 'text' ? '📄 Text' : '📑 PDF'} • ${new Date(book.timestamp).toLocaleDateString()}
            </p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button onclick="viewBook('${book.timestamp}')" style="padding: 5px 5px; font-size: 0.9em;box-shadow:0 0 2px black;border-radius:20px;border:none;">📘 Read</button>
           <!-- <button onclick="editBook('${book.timestamp}')" style="padding: 5px 10px; font-size: 0.9em;box-shadow:0 0 4px black;border-radius:20px;border:none">✏️ Edit</button>-->
            <button onclick="addChapter('${book.timestamp}')" style="padding: 5px 10px; font-size: 0.9em;box-shadow:0 0 2px black;border-radius:20px;border:none;">➕ Add Chapter</button>
            <button onclick="deleteABook('${book.timestamp}')" style="padding: 5px 10px; font-size: 0.9em; color: white; background: #e74c3c; border: none;box-shadow:0 0 2px black;border-radius:20px;border:none;">🗑️ Delete</button>
          </div>
        </div>
      `;
      bookshelfContainer.appendChild(bookDiv);
    });
  };

  request.onerror = () => {
    console.error('Failed to load books:', request.error);
  };
    }

// View Book
function viewBook(timestamp) {
  const transaction = db.transaction('books', 'readonly');
  const store = transaction.objectStore('books');
  const request = store.get(timestamp);

  request.onsuccess = () => {
    const book = request.result;
    if (!book) {
      alert('Book not found!');
      return;
    }

    // Remove any existing dialog
    let existingDialog = document.getElementById('reader-dialog');
    if (existingDialog) existingDialog.remove();

    const dialog = document.createElement('dialog');
    dialog.id = 'reader-dialog';
    dialog.style.maxWidth = '800px';
    dialog.style.width = '96vw';
    dialog.style.height = '99vh';
    dialog.style.border = '1px solid #189';
    dialog.style.borderRadius = '12px';
    dialog.style.padding = '0';
    dialog.style.overflow = 'hidden';
    dialog.style.outline = 'none';
    dialog.style.boxShadow = '0 0 30px rgba(0,0,0,0.3)';
    dialog.style.color = "black";

    const modalHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; background:white;">
        <div style="flex-shrink: 0; padding: 15px 20px; background: #189; color:white; display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size:1.6em; text-align:center;">📖 ${book.name}</h2>
          <button id="close-btn" style="background: none; border: none; color: white; font-size: 1.5em; cursor: pointer;">×</button>
        </div>

        <div style="flex-shrink: 0; padding: 10px 20px; background: #888; display: flex; align-items: center; gap: 10px;">
          <label>🔤 Size: </label>
          <input type="range" id="fsSlider" min="12" max="30" value="16" style="flex:1;">
          <span id="fsValue">16px</span>
        </div>
        
        <div style="flex-shrink: 0; padding: 10px 20px; background:                                                       
  <label>🔤 Size: </label>
  <input type="range" id="fsSlider" min="12" max="30" value="16" style="flex:1;">
  <span id="fsValue"></span>
  
  <button id="addBookmark" style="padding: 8px 16px; background: #189; color: white; border: none; border-radius: 8px; cursor: pointer;">📖 Bookmark</button>
  <button id="removeBookmark" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">🗑️ Remove</p></button>
</div>

        <div style="flex: 1; overflow-y: auto; padding: 20px; line-height: 1.6;">
          ${book.cover 
            ? `<img src="${book.cover}" alt="Cover" style="max-width:35%; height: auto; display: block; margin: 20px auto; border-radius: 8px;box-shadow:2px 0 4px white;">` 
            : ""}

          <div id="contentArea" class="content" style="font-size: 16px; white-space: normal;">
            ${book.type === 'text' 
              ? atob(book.content.split(',')[1]).replace(/\n/g, '<br>')
              : `<p>📎 <a href="${book.content}" target="_blank">Download or view PDF</a></p>`
            }
          </div>
        </div>
      </div>
    `;

    dialog.innerHTML = modalHTML;
    document.body.appendChild(dialog);
    
 dialog.querySelector('#removeBookmark').onclick = () => {
  const bookmark = JSON.parse(localStorage.getItem('bookmark'));
  if (bookmark && bookmark.bookId === timestamp) {
    localStorage.removeItem('bookmark');
    alert('Bookmark removed!');
    // Refresh view
    viewBook(timestamp);
  } else {
    alert('No bookmark found!');
  }
};

    const slider = dialog.querySelector('#fsSlider');
    const valueDisplay = dialog.querySelector('#fsValue');
    const contentArea = dialog.querySelector('#contentArea');
    
   /* function getRangeAtPoint(x, y) {
  let range;
  if (document.caretRangeFromPoint) { // Chrome
    range = document.caretRangeFromPoint(x, y);
  } else if (document.caretPositionFromPoint) { // Firefox
    const pos = document.caretPositionFromPoint(x, y);
    range = document.createRange();
    range.setStart(pos.offsetNode, pos.offset);
    range.setEnd(pos.offsetNode, pos.offset);
  }
  return range;
}*/

// Check for bookmark
const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
if (bookmarks[timestamp]) {
  const contentArea = dialog.querySelector('#contentArea');
  const text = contentArea.textContent;
  const bookmarkText = bookmarks[timestamp].text;
  const pos = text.indexOf(bookmarkText);
  if (pos !== -1) {
    const range = document.createRange();
    range.setStart(contentArea.firstChild, pos);
    range.setEnd(contentArea.firstChild, pos + bookmarkText.length);
    // Insert bookmark indicator
    const bookmarkSpan = document.createElement('span');
    bookmarkSpan.id = 'bookmark-marker';
    bookmarkSpan.style.background = 'yellow';
    bookmarkSpan.textContent = '📖';
    range.insertNode(bookmarkSpan);
    // Scroll to bookmark
    setTimeout(() => {
      const marker = document.getElementById('bookmark-marker');
      if (marker) {
        marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}

contentArea.addEventListener('dblclick', (e) => {
  const range = getRangeAtPoint(e.clientX, e.clientY);
  if (!range) return;
  // Save bookmark position
  try {
    const text = range.toString();
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
    bookmarks[timestamp] = { text: text, emoji: '📖' };
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    // Insert bookmark indicator
    const bookmarkSpan = document.createElement('span');
    bookmarkSpan.style.background = 'yellow';
    bookmarkSpan.textContent = '📖';
    range.insertNode(bookmarkSpan);
    alert('Bookmark added!');
  } catch (e) {
    console.error('Bookmark save error:', e);
    console.log(timestamp);
  }
});

    slider.addEventListener('input', () => {
      const size = slider.value + 'px';
      contentArea.style.fontSize = size;
      valueDisplay.textContent = size;
    });

    dialog.querySelector('#close-btn').onclick = () => {
      dialog.close();
      dialog.remove();
    };

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dialog.close();
        dialog.remove();
      }
    });

    dialog.showModal();
  };
}

function editBook(timestamp) {
  const transaction = db.transaction('books', 'readonly');
  const store = transaction.objectStore('books');
  const request = store.get(timestamp);

  request.onsuccess = () => {
    const book = request.result;
    if (book.type !== 'text') {
      alert('Only text books can be edited.');
      return;
    }

    const currentText = atob(book.content.split(',')[1]);
    const newText = prompt("Edit your book",currentText);
if (newText === null) return;

const updatedContent = `data:text/plain;base64,${btoa(newText)}`;
book.content = updatedContent;
book.timestamp = new Date().toISOString();

// Now write back
const writeTx = db.transaction('books', 'readwrite');
const writeStore = writeTx.objectStore('books');
const updateReq = writeStore.put(book);

updateReq.onsuccess = () => {
  readerStatus.textContent = `✅ "${book.name}" updated!`;
  renderBookshelf();
};

updateReq.onerror = () => {
  alert('❌ Failed to save.');
};

};
};

function addChapter(timestamp) {
  const transaction = db.transaction('books', 'readonly');
  const store = transaction.objectStore('books');
  const request = store.get(timestamp);

  request.onsuccess = () => {
    const book = request.result;
    if (book.type !== 'text') {
      alert('Only text books can have chapters.');
      return;
    }

    // Remove existing modal
    let existing = document.getElementById('chapter-modal');
    if (existing) existing.remove();

    const modal = document.createElement('dialog');
    modal.id = 'chapter-modal';
    modal.style.maxWidth = '500px';
    modal.style.width = '95vw';
    modal.style.padding = '20px';
    modal.style.borderRadius = '12px';
    modal.style.border = '1px solid #189';
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
    modal.style.color = '#333';

    modal.innerHTML = `
      <h3>Add Chapter to "${book.name}"</h3>
      <textarea id="chapterText" rows="6" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px; margin-bottom:10px;" placeholder="Write your new chapter here..."></textarea>
      <div style="text-align: right;">
        <button id="cancelChapter" style="padding:8px 16px; background:#eee; border:none; border-radius:8px; cursor:pointer;">Cancel</button>
        <button id="saveChapter" style="padding:8px 16px; background:#189; color:white; border:none; border-radius:8px; cursor:pointer;">Add Chapter</button>
      </div>
    `;

    document.body.appendChild(modal);
    modal.showModal();

    modal.querySelector('#cancelChapter').onclick = () => {
      modal.close();
      modal.remove();
    };
    
    modal.querySelector('#saveChapter').onclick = () => {
  const chapterTitle = prompt('Enter chapter title (e.g. Chapter 1):', 'New Chapter');
  if (!chapterTitle) {
    alert('Chapter title required!');
    return;
  }

  const newChapter = modal.querySelector('#chapterText').value.trim();
  if (!newChapter) {
    alert('Chapter content required!');
    return;
  }

  // Decode current content
  const currentContent = atob(book.content.split(',')[1]);
  const updatedContent = `${currentContent}\n\n---\n\n# ${chapterTitle}\n${newChapter}`;

  // Encode back
  book.content = `data:text/plain;base64,${btoa(updatedContent)}`;

  // Save to indexedDB
  const writeTx = db.transaction('books', 'readwrite');
  const writeStore = writeTx.objectStore('books');
  const updateReq = writeStore.put(book);

  updateReq.onsuccess = () => {
    readerStatus.textContent = `✅ "${book.name}" updated with new chapter!`;
    alert("Chapter added");
    modal.close();
    modal.remove();
    renderBookshelf();
  };

  updateReq.onerror = () => {
    alert('❌ Failed to save chapter.');
  };
};
  };

}
function deleteABook(timestamp) {
  const confirmDelete = confirm("Are you sure you want to delete this book?");
  if (!confirmDelete) return;

  const transaction = db.transaction('books', 'readwrite');
  const store = transaction.objectStore('books');
  const request = store.delete(timestamp);

  request.onsuccess = () => {
    readerStatus.textContent = '🗑️ Book deleted.';
    renderBookshelf();
  };

  request.onerror = () => {
    alert('❌ Failed to delete.');
  };
}

// Render library function
const libraryP = document.getElementById('NoBooks');

function renderlibrary() {
  libraryP.innerHTML = ''; // clear current list
  console.log('at least it should have gotten here ')
  const transaction = db.transaction('books', 'readonly');
  const store = transaction.objectStore('books');
  const request = store.getAll();
  request.onsuccess = () => {
    const books = request.result || [];
    console.log('Books fetched:', books); // debug
    if (books.length === 0) {
      libraryP.innerHTML = '<h3 style="color:blue; margin-top:10%">No books yet. Publish your first book!</h3>';
      libraryP.style.display = "block";
      return;
    }
    // sort by timestamp (newest first)
    books.sort((a, b) => b.timestamp - a.timestamp);
    books.forEach((book, index) => {
      const bookDiv = document.createElement('div');
      console.log("did it get here")
      bookDiv.className = 'book-item';
      bookDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 10px; border:none; border-radius: 25px; background: #f8f9fa; box-shadow:0 0 2px black;">
          <div>
            ${book.cover ? `<img src="${book.cover}" alt="Cover" style="height: 100px; width: 80px; object-fit: cover; border:none; box-shadow:0 0 4px black; border-radius:10px;">` : `<div style="height: 80px; width: 60px; background: #eee; display: flex; align-items: center; justify-content: center;">📘</div>`}
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0; font-size: 1.1em;">${book.name}</h3>
            <p style="margin: 5px 0; font-size: 0.9em; color: #555;">
              ${book.type === 'text' ? '📄 Text' : '📑 PDF'} • ${new Date(book.timestamp).toLocaleDateString()}
            </p>
            <p style="margin: 5px 0; font-size: 0.9em; color: #555;">
              ${book.description}
            </p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button onclick="viewBook('${book.timestamp}')" style="padding: 5px 5px; box-shadow:0 0 2px black;border-radius:20px;border:none;">📘 Read</button>
            <button onclick="deleteABook('${book.timestamp}')" style="padding: 5px 10px; font-size: 0.9em; color: white; background: #e74c3c; border: none;box-shadow:0 0 2px black;border-radius:20px;border:none;">🗑️ Delete</button>
            <a href="${book.content}" download="${book.name}" style="padding: 5px 10px; font-size: 0.9em; background: #3498db; color: white; border: none; border-radius: 20px; text-decoration: none;">📥 Download</a>
          </div>
        </div>
      `;
      libraryP.appendChild(bookDiv);
    });
    libraryP.style.display = "block";
  };
  request.onerror = () => {
    console.error('Failed to load books:', request.error);
  };
}


let space = navigator.storage.estimate()
console.log(space)
