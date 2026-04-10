'use strict';

let teachers = [];
let subjects = [];
let classrooms = [];

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

function addTeacher() {
  const name = document.getElementById('t-name').value.trim();
  const subject = document.getElementById('t-subject').value.trim();

  if (!name || !subject) {
    alert('Enter teacher name and subject');
    return;
  }

  teachers.push({ name, subject });
  document.getElementById('t-name').value = '';
  document.getElementById('t-subject').value = '';
  renderTeachers();
  updateDashboard();
}

function renderTeachers() {
  const list = document.getElementById('teacher-list');

  if (teachers.length === 0) {
    list.innerHTML = '<div class="empty-state">No teachers added</div>';
    return;
  }

  list.innerHTML = teachers.map(t => `
    <div class="list-item">${t.name} - ${t.subject}</div>
  `).join('');
}

function addSubject() {
  const name = document.getElementById('s-name').value.trim();
  const teacher = document.getElementById('s-teacher').value.trim();

  if (!name || !teacher) {
    alert('Enter subject name and teacher');
    return;
  }

  subjects.push({ name, teacher });
  document.getElementById('s-name').value = '';
  document.getElementById('s-teacher').value = '';
  renderSubjects();
  updateDashboard();
}

function renderSubjects() {
  const list = document.getElementById('subject-list');

  if (subjects.length === 0) {
    list.innerHTML = '<div class="empty-state">No subjects added</div>';
    return;
  }

  list.innerHTML = subjects.map(s => `
    <div class="list-item">${s.name} - ${s.teacher}</div>
  `).join('');
}

function addClassroom() {
  const room = document.getElementById('c-room').value.trim();
  const capacity = document.getElementById('c-capacity').value.trim();

  if (!room || !capacity) {
    alert('Enter room and capacity');
    return;
  }

  classrooms.push({ room, capacity });
  document.getElementById('c-room').value = '';
  document.getElementById('c-capacity').value = '';
  renderClassrooms();
  updateDashboard();
}

function renderClassrooms() {
  const list = document.getElementById('classroom-list');

  if (classrooms.length === 0) {
    list.innerHTML = '<div class="empty-state">No classrooms added</div>';
    return;
  }

  list.innerHTML = classrooms.map(c => `
    <div class="list-item">${c.room} - Capacity: ${c.capacity}</div>
  `).join('');
}

function updateDashboard() {
  document.getElementById('teacher-count').textContent = teachers.length;
  document.getElementById('subject-count').textContent = subjects.length;
  document.getElementById('classroom-count').textContent = classrooms.length;
}

updateDashboard();