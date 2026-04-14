'use strict';

// load from localStorage
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
let classrooms = JSON.parse(localStorage.getItem('classrooms')) || [];

// save function
function saveData() {
  localStorage.setItem('teachers', JSON.stringify(teachers));
  localStorage.setItem('subjects', JSON.stringify(subjects));
  localStorage.setItem('classrooms', JSON.stringify(classrooms));
}

// navigation
function navigateTo(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('section-' + sectionId).classList.add('active');
  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

  updateDashboard();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.section);
  });
});

// teacher
function addTeacher() {
  const name = document.getElementById('t-name').value.trim();
  const subject = document.getElementById('t-subject').value.trim();

  if (!name || !subject) return alert('Enter all fields');

  teachers.push({ id: Date.now(), name, subject });
  saveData();

  renderTeachers();
  updateDashboard();
}

function renderTeachers() {
  const list = document.getElementById('teacher-list');

  if (!teachers.length) {
    list.innerHTML = '<div class="empty-state">No teachers added</div>';
    return;
  }

  list.innerHTML = teachers.map(t => `
    <div class="list-item">${t.name} - ${t.subject}</div>
  `).join('');
}

// subject
function addSubject() {
  const name = document.getElementById('s-name').value.trim();
  const teacher = document.getElementById('s-teacher').value.trim();

  if (!name || !teacher) return alert('Enter all fields');

  subjects.push({ id: Date.now(), name, teacher });
  saveData();

  renderSubjects();
  updateDashboard();
}

function renderSubjects() {
  const list = document.getElementById('subject-list');

  if (!subjects.length) {
    list.innerHTML = '<div class="empty-state">No subjects added</div>';
    return;
  }

  list.innerHTML = subjects.map(s => `
    <div class="list-item">${s.name} - ${s.teacher}</div>
  `).join('');
}

// classroom
function addClassroom() {
  const room = document.getElementById('c-room').value.trim();
  const capacity = document.getElementById('c-capacity').value.trim();

  if (!room || !capacity) return alert('Enter all fields');

  classrooms.push({ id: Date.now(), room, capacity });
  saveData();

  renderClassrooms();
  updateDashboard();
}

function renderClassrooms() {
  const list = document.getElementById('classroom-list');

  if (!classrooms.length) {
    list.innerHTML = '<div class="empty-state">No classrooms added</div>';
    return;
  }

  list.innerHTML = classrooms.map(c => `
    <div class="list-item">${c.room} - ${c.capacity}</div>
  `).join('');
}

// dashboard
function updateDashboard() {
  document.getElementById('teacher-count').textContent = teachers.length;
  document.getElementById('subject-count').textContent = subjects.length;
  document.getElementById('classroom-count').textContent = classrooms.length;
}

// initial render
renderTeachers();
renderSubjects();
renderClassrooms();
updateDashboard();