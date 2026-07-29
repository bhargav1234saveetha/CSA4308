// Initial Seed Data
const INITIAL_BOOKS = [
  { id: "b-101", title: "Introduction to Algorithms", author: "Cormen", isbn: "978-026204", category: "Computer Science", shelfLocation: "Rack CS-04", totalCopies: 8, availableCopies: 5, cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400" },
  { id: "b-102", title: "Clean Code", author: "Robert C. Martin", isbn: "978-013235", category: "Software Engineering", shelfLocation: "Rack SE-08", totalCopies: 10, availableCopies: 7, cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400" }
];
const INITIAL_STUDENTS = [
  { id: "std-1", name: "Alex Morgan", email: "alex.morgan@college.edu", rollNo: "22CSE042", department: "Computer Science", year: "3rd Year", semester: "Semester 5", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }
];
const INITIAL_BORROWS = [];
const INITIAL_FINES = [];
const INITIAL_MATERIALS = [
  { id: "mat-1", title: "Design & Analysis of Algorithms Notes", year: "3rd Year", semester: "Semester 5", subject: "Computer Science", type: "Lecture Notes", fileSize: "4.2 MB", uploadDate: "2026-07-05", downloads: 142 }
];

// App State Manager
const app = {
  role: localStorage.getItem('lms_role') || 'student',
  currentStudentId: localStorage.getItem('lms_current_student_id') || 'std-1',
  activeTab: localStorage.getItem('lms_active_tab') || 'catalog',
  
  data: {
    books: JSON.parse(localStorage.getItem('lms_books')) || INITIAL_BOOKS,
    students: JSON.parse(localStorage.getItem('lms_students')) || INITIAL_STUDENTS,
    borrows: JSON.parse(localStorage.getItem('lms_borrows')) || INITIAL_BORROWS,
    fines: JSON.parse(localStorage.getItem('lms_fines')) || INITIAL_FINES,
    materials: JSON.parse(localStorage.getItem('lms_materials')) || INITIAL_MATERIALS
  },

  saveData(key) { localStorage.setItem(`lms_${key}`, JSON.stringify(this.data[key])); },

  toast(msg, type='info') {
    const cont = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeft = `4px solid ${type === 'success' ? '#34d399' : type === 'error' ? '#fb7185' : '#6366f1'}`;
    t.innerText = msg;
    cont.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },

  openModal(id) { document.getElementById(id).classList.remove('d-none'); },
  closeModal(id) { document.getElementById(id).classList.add('d-none'); },

  switchRole(newRole) {
    this.role = newRole;
    localStorage.setItem('lms_role', newRole);
    this.switchTab(newRole === 'admin' ? 'admin-dashboard' : 'catalog');
    this.renderNavbar();
    this.toast(`Switched to ${newRole === 'admin' ? 'Admin' : 'Student'} mode`, 'success');
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    localStorage.setItem('lms_active_tab', tabId);
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    const view = document.getElementById(`view-${tabId}`);
    if(view) view.classList.remove('d-none');
    
    document.querySelectorAll('.nav-tab').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tabId);
    });

    this.renderCurrentView();
  },

  loginDemo(email, role) {
    if(role === 'admin') {
      this.switchRole('admin');
    } else {
      const student = this.data.students.find(s => s.email === email);
      if(student) {
        this.currentStudentId = student.id;
        localStorage.setItem('lms_current_student_id', student.id);
        this.switchRole('student');
      }
    }
    this.closeModal('auth-modal');
  },

  renderNavbar() {
    const nav = document.getElementById('nav-tabs-container');
    const tabs = this.role === 'admin' ? [
      { id: 'admin-dashboard', label: 'Dashboard' },
      { id: 'admin-inventory', label: 'Inventory' },
      { id: 'admin-issue-return', label: 'Issue / Return' },
      { id: 'admin-fines', label: 'Fines' },
      { id: 'admin-materials', label: 'Materials' }
    ] : [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'catalog', label: 'Catalog' },
      { id: 'borrow', label: 'Borrow History' },
      { id: 'fines', label: 'Fines' },
      { id: 'materials', label: 'Study Materials' },
      { id: 'profile', label: 'Profile' }
    ];

    nav.innerHTML = tabs.map(t => `<button class="nav-tab ${this.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}" onclick="app.switchTab('${t.id}')">${t.label}</button>`).join('');
    
    const roleBtn = document.getElementById('role-toggle-btn');
    roleBtn.innerHTML = this.role === 'admin' ? '🛡️ Admin Mode' : '🎓 Student Mode';
    roleBtn.onclick = () => this.switchRole(this.role === 'admin' ? 'student' : 'admin');
  },

  renderCurrentView() {
    if(this.role === 'student') {
      if(this.activeTab === 'dashboard') this.renderStudentDashboard();
      if(this.activeTab === 'catalog') this.renderCatalog();
      if(this.activeTab === 'borrow') this.renderBorrow();
      if(this.activeTab === 'fines') this.renderStudentFines();
      if(this.activeTab === 'materials') this.renderMaterials('student');
      if(this.activeTab === 'profile') this.renderProfile();
    } else {
      if(this.activeTab === 'admin-dashboard') this.renderAdminDashboard();
      if(this.activeTab === 'admin-inventory') this.renderAdminInventory();
      if(this.activeTab === 'admin-issue-return') this.renderAdminIssueReturn();
      if(this.activeTab === 'admin-fines') this.renderAdminFines();
      if(this.activeTab === 'admin-materials') this.renderMaterials('admin');
    }
  },

  renderStudentDashboard() {
    const student = this.data.students.find(s => s.id === this.currentStudentId);
    if(!student) return;
    document.getElementById('dash-avatar').src = student.avatar;
    document.getElementById('dash-name').innerText = student.name;
    document.getElementById('dash-details').innerText = `${student.department} • ${student.year} • Roll: ${student.rollNo}`;

    const myBorrows = this.data.borrows.filter(b => b.studentId === student.id);
    const active = myBorrows.filter(b => b.status === 'Issued' || b.status === 'Overdue');
    document.getElementById('stat-active-books').innerText = active.length;
    document.getElementById('stat-overdue').innerText = active.filter(b => b.status === 'Overdue').length;
    
    const myFines = this.data.fines.filter(f => f.studentId === student.id && f.status === 'Pending');
    document.getElementById('stat-fines').innerText = '$' + myFines.reduce((s, f) => s + f.amount, 0);
  },

  renderCatalog() {
    const q = document.getElementById('catalog-search')?.value.toLowerCase() || '';
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = this.data.books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)).map(b => `
      <div class="book-card glass-panel">
        <img src="${b.cover}" class="book-cover" />
        <div class="book-details">
          <h3>${b.title}</h3>
          <p>by ${b.author}</p>
          <span class="badge badge-indigo" style="align-self:start">${b.category}</span>
          <div class="book-footer">
            <span class="badge ${b.availableCopies > 0 ? 'badge-emerald' : 'badge-rose'}">${b.availableCopies} Available</span>
            <button class="btn btn-sm btn-primary" onclick="app.requestBorrow('${b.id}')">Borrow</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  requestBorrow(bookId) {
    if(this.role !== 'student') return this.toast('Only students can request borrow', 'error');
    const book = this.data.books.find(b => b.id === bookId);
    if(!book || book.availableCopies <= 0) return this.toast('Book unavailable', 'error');
    
    const today = new Date();
    const due = new Date(); due.setDate(due.getDate() + 14);
    
    this.data.borrows.push({
      id: 'brw-' + Date.now(),
      bookId, bookTitle: book.title,
      studentId: this.currentStudentId, studentName: this.data.students.find(s=>s.id===this.currentStudentId).name,
      issueDate: today.toISOString().split('T')[0],
      expDate: due.toISOString().split('T')[0],
      returnDate: null,
      status: 'Issued',
      fineAmount: 0
    });
    book.availableCopies--;
    this.saveData('borrows'); this.saveData('books');
    this.toast(`Successfully borrowed ${book.title}`, 'success');
    this.renderCatalog();
  },

  renderBorrow() {
    const tbody = document.querySelector('#borrow-table tbody');
    tbody.innerHTML = this.data.borrows.filter(b => b.studentId === this.currentStudentId).map(b => `
      <tr>
        <td>${b.id}</td><td>${b.bookTitle}</td><td>${b.issueDate}</td><td>${b.expDate}</td>
        <td>${b.returnDate || '-'}</td>
        <td><span class="badge ${b.status==='Returned'?'badge-emerald':'badge-indigo'}">${b.status}</span></td>
        <td>$${b.fineAmount}</td>
      </tr>
    `).join('');
  },

  renderStudentFines() {
    const myFines = this.data.fines.filter(f => f.studentId === this.currentStudentId);
    const pendingTotal = myFines.filter(f => f.status === 'Pending').reduce((s,f) => s+f.amount, 0);
    document.getElementById('total-fine-display').innerText = '$' + pendingTotal.toFixed(2);
    
    document.querySelector('#student-fine-table tbody').innerHTML = myFines.map(f => `
      <tr>
        <td>${f.id}</td><td>${f.reason}</td><td>${f.createdDate}</td>
        <td>$${f.amount}</td>
        <td><span class="badge ${f.status==='Paid'?'badge-emerald':'badge-amber'}">${f.status}</span></td>
        <td>${f.status==='Pending' ? `<button class="btn btn-sm btn-emerald" onclick="app.payFine('${f.id}')">Pay</button>` : '-'}</td>
      </tr>
    `).join('');
  },

  payFine(fineId) {
    const f = this.data.fines.find(x => x.id === fineId);
    if(f) { f.status = 'Paid'; this.saveData('fines'); this.toast('Fine Paid successfully', 'success'); this.renderStudentFines(); }
  },

  renderAdminInventory() {
    document.querySelector('#admin-inv-table tbody').innerHTML = this.data.books.map(b => `
      <tr>
        <td>${b.title}<br/><small>${b.author}</small></td>
        <td>${b.isbn}</td>
        <td><span class="badge badge-indigo">${b.category}</span></td>
        <td>${b.availableCopies} / ${b.totalCopies}</td>
        <td><button class="btn btn-sm btn-secondary" onclick="app.deleteBook('${b.id}')">Trash</button></td>
      </tr>
    `).join('');
  },

  deleteBook(id) {
    this.data.books = this.data.books.filter(b => b.id !== id);
    this.saveData('books'); this.toast('Book deleted', 'success'); this.renderAdminInventory();
  },

  renderAdminDashboard() {
    document.getElementById('admin-stat-books').innerText = this.data.books.length;
    document.getElementById('admin-stat-loans').innerText = this.data.borrows.filter(b=>b.status==='Issued').length;
    document.getElementById('admin-stat-fines').innerText = '$' + this.data.fines.filter(f=>f.status==='Paid').reduce((s,f)=>s+f.amount,0);
  },

  renderAdminIssueReturn() {
    document.querySelector('#admin-return-table tbody').innerHTML = this.data.borrows.map(b => `
      <tr>
        <td>${b.id}</td><td>${b.studentName}</td><td>${b.bookTitle}</td>
        <td>${b.issueDate}</td><td>${b.expDate}</td><td>${b.returnDate || '-'}</td>
        <td><span class="badge ${b.status==='Returned'?'badge-emerald':'badge-indigo'}">${b.status}</span></td>
        <td>${b.status !== 'Returned' ? `<button class="btn btn-sm btn-primary" onclick="app.processReturn('${b.id}')">Return</button>` : ''}</td>
      </tr>
    `).join('');
    
    // populate issue modal dropdowns
    document.getElementById('issue-student').innerHTML = this.data.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    document.getElementById('issue-book').innerHTML = this.data.books.filter(b=>b.availableCopies>0).map(b => `<option value="${b.id}">${b.title}</option>`).join('');
  },

  processReturn(borrowId) {
    const b = this.data.borrows.find(x => x.id === borrowId);
    if(b) {
      b.status = 'Returned';
      b.returnDate = new Date().toISOString().split('T')[0];
      const bk = this.data.books.find(x => x.id === b.bookId);
      if(bk) bk.availableCopies++;
      this.saveData('borrows'); this.saveData('books');
      this.toast('Processed return successfully', 'success');
      this.renderAdminIssueReturn();
    }
  },

  renderAdminFines() {
    document.querySelector('#admin-fine-table tbody').innerHTML = this.data.fines.map(f => `
      <tr>
        <td>${f.id}</td><td>${f.studentName || 'Student'}</td><td>${f.reason}</td>
        <td>$${f.amount}</td><td><span class="badge ${f.status==='Paid'?'badge-emerald':'badge-amber'}">${f.status}</span></td>
        <td>${f.status==='Pending' ? `<button class="btn btn-sm btn-emerald" onclick="app.waiveFine('${f.id}')">Waive</button>` : '-'}</td>
      </tr>
    `).join('');
    document.getElementById('fine-student').innerHTML = this.data.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  },

  waiveFine(id) {
    const f = this.data.fines.find(x => x.id === id);
    if(f) { f.status = 'Paid'; this.saveData('fines'); this.toast('Fine Waived', 'success'); this.renderAdminFines(); }
  },

  renderMaterials(role) {
    const y = document.getElementById('mat-year-filter')?.value;
    const s = document.getElementById('mat-sem-filter')?.value;
    
    if(role === 'admin') {
      document.querySelector('#admin-mat-table tbody').innerHTML = this.data.materials.map(m => `
        <tr>
          <td>${m.title}<br/><small>${m.subject}</small></td>
          <td>${m.year} / ${m.semester}</td>
          <td><span class="badge badge-indigo">${m.type}</span></td>
          <td><button class="btn btn-sm btn-secondary" onclick="app.deleteMat('${m.id}')">Trash</button></td>
        </tr>
      `).join('');
    } else {
      let mats = this.data.materials;
      if (y && y !== 'All') mats = mats.filter(m => m.year === y);
      if (s && s !== 'All') mats = mats.filter(m => m.semester === s);
      
      document.getElementById('materials-grid').innerHTML = mats.map(m => `
        <div class="glass-panel stat-card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h3 style="margin-bottom:0.5rem">${m.title}</h3>
            <p style="font-size:0.8rem; color:var(--text-muted)">${m.subject} • ${m.year} (${m.semester})</p>
            <span class="badge badge-indigo" style="margin-top:0.5rem">${m.type}</span>
          </div>
          <button class="btn btn-sm btn-primary" style="margin-top:1rem" onclick="app.toast('Downloading...', 'success')">Download (${m.fileSize})</button>
        </div>
      `).join('');
    }
  },

  deleteMat(id) {
    this.data.materials = this.data.materials.filter(m => m.id !== id);
    this.saveData('materials'); this.toast('Material deleted', 'success'); this.renderMaterials('admin');
  },

  renderProfile() {
    const s = this.data.students.find(x => x.id === this.currentStudentId);
    if(s) {
      document.getElementById('prof-name').value = s.name;
      document.getElementById('prof-email').value = s.email;
      document.getElementById('prof-roll').value = s.rollNo;
      document.getElementById('prof-dept').value = s.department;
      document.getElementById('prof-year').value = s.year;
      document.getElementById('prof-sem').value = s.semester;
    }
  },

  init() {
    document.getElementById('auth-btn').onclick = () => this.openModal('auth-modal');
    document.getElementById('catalog-search')?.addEventListener('input', () => this.renderCatalog());
    document.getElementById('mat-year-filter')?.addEventListener('change', () => this.renderMaterials('student'));
    document.getElementById('mat-sem-filter')?.addEventListener('change', () => this.renderMaterials('student'));
    
    document.getElementById('login-form').onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const role = document.getElementById('login-role').value;
      this.loginDemo(email, role);
    };

    document.getElementById('book-form').onsubmit = (e) => {
      e.preventDefault();
      this.data.books.push({
        id: 'b-' + Date.now(),
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        isbn: document.getElementById('book-isbn').value,
        category: document.getElementById('book-category').value,
        totalCopies: parseInt(document.getElementById('book-copies').value),
        availableCopies: parseInt(document.getElementById('book-copies').value),
        shelfLocation: document.getElementById('book-shelf').value,
        cover: document.getElementById('book-cover').value || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
      });
      this.saveData('books'); this.closeModal('book-modal'); this.toast('Book Added', 'success'); this.renderAdminInventory();
    };

    document.getElementById('issue-form').onsubmit = (e) => {
      e.preventDefault();
      const stId = document.getElementById('issue-student').value;
      const bkId = document.getElementById('issue-book').value;
      const s = this.data.students.find(x => x.id === stId);
      const b = this.data.books.find(x => x.id === bkId);
      if(b && b.availableCopies > 0) {
        b.availableCopies--;
        this.data.borrows.push({
          id: 'brw-' + Date.now(), bookId: bkId, bookTitle: b.title,
          studentId: stId, studentName: s.name,
          issueDate: document.getElementById('issue-date').value,
          expDate: document.getElementById('issue-due').value,
          returnDate: null, status: 'Issued', fineAmount: 0
        });
        this.saveData('books'); this.saveData('borrows');
        this.closeModal('issue-modal'); this.toast('Book Issued', 'success'); this.renderAdminIssueReturn();
      } else {
        this.toast('Book unavailable', 'error');
      }
    };

    document.getElementById('make-fine-form').onsubmit = (e) => {
      e.preventDefault();
      const stId = document.getElementById('fine-student').value;
      this.data.fines.push({
        id: 'f-' + Date.now(), studentId: stId,
        studentName: this.data.students.find(x=>x.id===stId).name,
        reason: document.getElementById('fine-reason').value,
        amount: parseFloat(document.getElementById('fine-amount').value),
        status: 'Pending', createdDate: new Date().toISOString().split('T')[0]
      });
      this.saveData('fines'); this.closeModal('make-fine-modal'); this.toast('Fine Assessed', 'success'); this.renderAdminFines();
    };

    document.getElementById('mat-form').onsubmit = (e) => {
      e.preventDefault();
      this.data.materials.push({
        id: 'mat-' + Date.now(),
        title: document.getElementById('mat-title').value,
        year: document.getElementById('mat-year').value,
        semester: document.getElementById('mat-sem').value,
        subject: document.getElementById('mat-subject').value,
        type: document.getElementById('mat-type').value,
        fileSize: '2.1 MB', uploadDate: new Date().toISOString().split('T')[0], downloads: 0
      });
      this.saveData('materials'); this.closeModal('mat-modal'); this.toast('Material Uploaded', 'success'); this.renderMaterials('admin');
    };

    document.getElementById('profile-form').onsubmit = (e) => {
      e.preventDefault();
      const s = this.data.students.find(x => x.id === this.currentStudentId);
      if(s) {
        s.name = document.getElementById('prof-name').value;
        s.email = document.getElementById('prof-email').value;
        s.rollNo = document.getElementById('prof-roll').value;
        s.department = document.getElementById('prof-dept').value;
        s.year = document.getElementById('prof-year').value;
        s.semester = document.getElementById('prof-sem').value;
        this.saveData('students'); this.toast('Profile Updated', 'success'); this.renderStudentDashboard();
      }
    };

    this.renderNavbar();
    this.switchTab(this.activeTab);
  }
};

window.onload = () => app.init();
