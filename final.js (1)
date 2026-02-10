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
  if (file) {
    if (file.type === allowedTypes.text || file.type === allowedTypes.pdf) {
      // Limit file size to 1MB (safe for Indian low-end devices)
      if (file.size > 1024 * 1024) {
        alert('❌ File too large! Please keep under 1MB.');
        fileInput.value = '';
        return;
      }
      imageNameDisplay.textContent = `📄 ${file.name}`;
      selectedFile = file;
    } else {
      alert('❌ Please select a .txt or .pdf file.');
      fileInput.value = '';
    }
  }
});

// Show image preview
imageIn.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    if (allowedTypes.image.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        imagePreview.innerHTML = `<img src="${reader.result}" alt="Cover" style="height: 100px; object-fit: cover;">`;
      };
      reader.onerror = () => {
        alert('❌ Failed to load image. Try a different file.');
      };
      reader.readAsDataURL(file);
      selectedImage = file;
    } else {
      alert('❌ Please select a valid image (jpg, png, webp).');
      //imageIn.value = '';
    }
  }
});

// Publish Book Button
publishBtn.addEventListener('click', () => {
  const bookName = bookNameInput.value.trim();
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
      alert('❌ Text contains unsupported characters. Avoid emojis or special symbols.');
      return;
    }
  }
  // Case 2: .txt file
  else if (selectedFile && selectedFile.type === allowedTypes.text) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        content = `data:text/plain;base64,${btoa(e.target.result)}`;
        saveBook(bookName, content, 'text');
      } catch (err) {
        alert('❌ Failed to encode text. File may be corrupted.');
      }
    };
    reader.onerror = () => {
      alert('❌ Failed to read text file. Try a smaller file.');
    };
    reader.readAsText(selectedFile);
    return;
  }
  // Case 3: .pdf file
  else if (selectedFile && selectedFile.type === allowedTypes.pdf) {
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('⚠️ PDF too large! Keep under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      content = e.target.result;
      saveBook(bookName, content, 'pdf');
    };
    reader.onerror = () => {alert('❌ Failed to read PDF. Try a smaller file.');
};
reader.readAsDataURL(selectedFile);
return;
}
// No content
else {
alert('⚠️ Please provide content via text or file.');
return;
}

// If content is ready (from textarea), save directly
if (content) {
saveBook(bookName, content, fileType);
}
});

// Save book + cover to localStorage
function saveBook(name, content, type) {
if (selectedImage) {
const reader = new FileReader();
reader.onload = function (e) {
const book = createBookObject( name, content, type, e.target.result);
addToStorage(book);
};
reader.onerror = () => {
alert('❌ Failed to load cover image.');
};
reader.readAsDataURL(selectedImage);
} else {
const book = createBookObject(name, content, type, null);
addToStorage(book);
}
}

function createBookObject(name, content, type, coverData) {
return {
name,
content,
type,
cover: coverData,
timestamp: new Date().toISOString()
};
}

function addToStorage(book) {
const storedBooks = JSON.parse(localStorage.getItem('uploadedBooks') || '[]');
storedBooks.push(book);

try {
localStorage.setItem('uploadedBooks', JSON.stringify(storedBooks));
readerStatus.textContent = `✅ "${book.name}" published!`;
clearForm();
renderBookshelf();
} catch (e) {
if (e.name === 'QuotaExceededError') {
alert('📚 Storage full! Delete old books or use smaller files (text <1MB).');
} else {
alert('❌ Save failed: ' + e.name);
}
}
}

// Clear form after publish
function clearForm() {
bookNameInput.value = '';
fileInput.value = '';
storyScript.value = '';
imageIn.value = '';
imageNameDisplay.textContent = '';
imagePreview.innerHTML = '';
selectedFile = null;
selectedImage = null;
}

// Render all books in bookshelf
function renderBookshelf() {
const books = JSON.parse(localStorage.getItem('uploadedBooks') || '[]');
bookshelfContainer.innerHTML = '';

if (books.length === 0) {
bookshelfContainer.innerHTML = '<p>No books yet. Publish your first book!</p>';
return;
}

books.forEach((book, index) => {
const bookDiv = document.createElement('div');
bookDiv.className = 'book-item';
bookDiv.innerHTML = `<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 10px; border:none; border-radius: 12px; background: #f8f9fa; box-shadow:0 0 2px black;">  <div>  ${book.cover ?  `<img src="${book.cover}" alt="Cover" style="height: 100px; width: 80px; object-fit: cover; border:none; box-shadow:0 0 4px black; border-radius:10px;">`: `<div style="height: 80px; width: 60px; background: #eee; display: flex; align-items: center; justify-content: center;">📘</div>` }  </div>  <div style="flex: 1;">  <h3 style="margin: 0; font-size: 1.1em;">${book.name}</h3>  <p style="margin: 5px 0; font-size: 0.9em; color: #555;">  ${book.type === 'text' ? '📄 Text' : '📑 PDF'} • ${new Date(book.timestamp).toLocaleDateString()}  </p>  </div>  <div style="display: flex; flex-direction: column; gap: 5px;">  <button onclick="viewBook(${index})" style="padding: 5px 10px; font-size: 0.9em;">📘 Read</button>  <button onclick="editBook(${index})" style="padding: 5px 10px; font-size: 0.9em;">✏️ Edit</button>  <button onclick="deleteABook(${index})" style="padding: 5px 10px; font-size: 0.9em; color: white; background: #e74c3c; border: none;">🗑️ Delete</button>  </div>  </div>`;

bookshelfContainer.appendChild(bookDiv);
});
}

// View Book
function viewBook(index) {
  const books = JSON.parse(localStorage.getItem('uploadedBooks'));
  const book = books[index];
  
  // Remove any existing dialog
  let existingDialog = document.getElementById('reader-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }

  // Create dialog element
  const dialog = document.createElement('dialog');
  dialog.id = 'reader-dialog';
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
// Edit book (only for text)
function editBook(index) {
const books = JSON.parse(localStorage.getItem('uploadedBooks'));
const book = books[index];

if (book.type !== 'text') {
alert('Only text books can be edited.');
return;
}

const currentText = atob(book.content.split(',')[1]);
const newText = prompt ("edit your book or add new chapter", currentText);

if (newText !== null) {
books[index].content = `data:text/plain;base64,${btoa(newText)}`;
books[index].timestamp = new Date().toISOString();
books[index].content = `data:text/plain;base64,${btoa(newText)}`;
books[index].timestamp = new Date().toISOString();

// Save back to localStorage
localStorage.setItem('uploadedBooks', JSON.stringify(books));

// Show success message
readerStatus.textContent = `✅ "${book.name} " updated!`;

// Refresh the bookshelf display
renderBookshelf();
}
console.log("deleteABook",index)
// Delete a book

// Render books when page loads
//document.addEventListener('DOMContentLoaded', renderBookshelf);
};


window.onload = function () {
  renderBookshelf();
  
};

function deleteABook(index) {
  const books = JSON.parse(localStorage.getItem('uploadedBooks')) || [];

  // Guard: make sure the index exists
  if (!books[index]) {
    alert("Book not found");
    return;
  }

  const bookName = books[index].name;

  // Confirm deletion
  const confirmDelete = confirm(`Are you sure you want to delete "${bookName}"?`);
  if (confirmDelete) {
    books.splice(index, 1);
    localStorage.setItem('uploadedBooks', JSON.stringify(books));
    readerStatus.textContent = `🗑️ "${bookName}" deleted.`;
    renderBookshelf(); // Refresh UI
  }
}



