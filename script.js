

'use strict';

let teachers   = JSON.parse(localStorage.getItem('scs-teachers')   || '[]');
let subjects   = JSON.parse(localStorage.getItem('scs-subjects')   || '[]');
let classrooms = JSON.parse(localStorage.getItem('scs-classrooms') || '[]');
let timetable  = JSON.parse(localStorage.getItem('scs-timetable')  || 'null');

// ── Time grid constants ──
const DAYS  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS = ['9-10', '10-11', '11-12', '1-2', '2-3']; // 5 slots / day

// persistent storage helper
function save() {
  localStorage.setItem('scs-teachers',   JSON.stringify(teachers));
  localStorage.setItem('scs-subjects',   JSON.stringify(subjects));
  localStorage.setItem('scs-classrooms', JSON.stringify(classrooms));
  localStorage.setItem('scs-timetable',  JSON.stringify(timetable));
}

// navigation helper
// Show the requested section and highlight the matching nav link.
function navigateTo(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  // Deactivate all nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById('section-' + sectionId);
  const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);

  if (target)   target.classList.add('active');
  if (navItem)  navItem.classList.add('active');

  // On mobile, close the sidebar after navigation
  document.getElementById('sidebar').classList.remove('open');

  // Run section-specific render on entry
  if (sectionId === 'dashboard')  renderDashboard();
  if (sectionId === 'teachers')   renderTeachers();
  if (sectionId === 'subjects')   { populateTeacherSelect(); renderSubjects(); }
  if (sectionId === 'classrooms') renderClassrooms();
  if (sectionId === 'timetable')  renderTimetable();
}

// Attach click handlers to nav items
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.section);
  });
});

// Mobile hamburger
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});
// dashboard stats
function renderDashboard() {
  document.getElementById('stat-teachers').textContent   = teachers.length;
  document.getElementById('stat-subjects').textContent   = subjects.length;
  document.getElementById('stat-classrooms').textContent = classrooms.length;

  // Count how many slots are actually filled in the timetable
  let slotCount = 0;
  if (timetable) {
    DAYS.forEach(day => SLOTS.forEach(slot => {
      if (timetable[day]?.[slot]) slotCount++;
    }));
  }
  document.getElementById('stat-slots').textContent = slotCount;
}


// teacher management
function addTeacher() {
  const name    = document.getElementById('t-name').value.trim();
  const subject = document.getElementById('t-subject').value.trim();
  const dayBoxes = document.querySelectorAll('#t-days input[type="checkbox"]');
  const days    = [...dayBoxes].filter(cb => cb.checked).map(cb => cb.value);

  // Validation
  if (!name)            return showToast('Enter teacher name', 'error');
  if (!subject)         return showToast('Enter subject expertise', 'error');
  if (!days.length)     return showToast('Select at least one available day', 'warn');

  // Create teacher object (FCFS — pushed to end of array)
  const teacher = { id: Date.now(), name, subject, days };
  teachers.push(teacher);
  save();

  renderTeachers();
  populateTeacherSelect();
  showToast(`Teacher "${name}" added`, 'success');

  // Reset form
  document.getElementById('t-name').value    = '';
  document.getElementById('t-subject').value = '';
  dayBoxes.forEach(cb => cb.checked = true);
}

function deleteTeacher(id) {
  teachers = teachers.filter(t => t.id !== id);
  save();
  renderTeachers();
  populateTeacherSelect();
  showToast('Teacher removed', 'warn');
}

function renderTeachers() {
  const container = document.getElementById('teacher-list');
  if (!teachers.length) {
    container.innerHTML = '<div class="empty-state">No teachers added yet.</div>';
    return;
  }
  container.innerHTML = teachers.map(t => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-title">◉ ${t.name}</div>
        <div class="list-item-sub">
          <span class="tag green">${t.subject}</span>
          ${t.days.map(d => `<span class="tag">${d.slice(0,3)}</span>`).join('')}
        </div>
      </div>
      <button class="delete-btn" onclick="deleteTeacher(${t.id})">✕</button>
    </div>
  `).join('');
}


// subject management
function populateTeacherSelect() {
  const sel = document.getElementById('s-teacher');
  const current = sel.value;
  sel.innerHTML = '<option value="">-- Select Teacher --</option>' +
    teachers.map(t => `<option value="${t.id}" ${t.id == current ? 'selected' : ''}>${t.name} (${t.subject})</option>`).join('');
}

function addSubject() {
  const name      = document.getElementById('s-name').value.trim();
  const teacherId = parseInt(document.getElementById('s-teacher').value);
  const hours     = parseInt(document.getElementById('s-hours').value);

  if (!name)      return showToast('Enter subject name', 'error');
  if (!teacherId) return showToast('Select a teacher', 'error');
  if (!hours || hours < 1) return showToast('Enter valid hours per week (≥1)', 'error');

  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher)   return showToast('Teacher not found', 'error');

  // FCFS — new subject appended to queue
  const subject = { id: Date.now(), name, teacherId, teacherName: teacher.name, hours };
  subjects.push(subject);
  save();

  renderSubjects();
  showToast(`Subject "${name}" added`, 'success');

  document.getElementById('s-name').value  = '';
  document.getElementById('s-teacher').value = '';
  document.getElementById('s-hours').value = '3';
}

function deleteSubject(id) {
  subjects = subjects.filter(s => s.id !== id);
  save();
  renderSubjects();
  showToast('Subject removed', 'warn');
}

function renderSubjects() {
  const container = document.getElementById('subject-list');
  if (!subjects.length) {
    container.innerHTML = '<div class="empty-state">No subjects added yet.</div>';
    return;
  }
  container.innerHTML = subjects.map(s => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-title">◎ ${s.name}</div>
        <div class="list-item-sub">
          <span class="tag green">👤 ${s.teacherName}</span>
          <span class="tag">${s.hours} hrs/week</span>
        </div>
      </div>
      <button class="delete-btn" onclick="deleteSubject(${s.id})">✕</button>
    </div>
  `).join('');
}

// classroom management
function addClassroom() {
  const num = document.getElementById('c-num').value.trim();
  const cap = parseInt(document.getElementById('c-cap').value);

  if (!num)        return showToast('Enter room number/name', 'error');
  if (!cap || cap < 1) return showToast('Enter valid capacity', 'error');

  const classroom = { id: Date.now(), num, cap };
  classrooms.push(classroom);
  save();

  renderClassrooms();
  showToast(`Classroom "${num}" added`, 'success');

  document.getElementById('c-num').value = '';
  document.getElementById('c-cap').value = '60';
}

function deleteClassroom(id) {
  classrooms = classrooms.filter(c => c.id !== id);
  save();
  renderClassrooms();
  showToast('Classroom removed', 'warn');
}

function renderClassrooms() {
  const container = document.getElementById('classroom-list');
  if (!classrooms.length) {
    container.innerHTML = '<div class="empty-state">No classrooms added yet.</div>';
    return;
  }
  container.innerHTML = classrooms.map(c => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-title">▣ ${c.num}</div>
        <div class="list-item-sub">
          <span class="tag">Capacity: ${c.cap} seats</span>
          <span class="tag green">Available</span>
        </div>
      </div>
      <button class="delete-btn" onclick="deleteClassroom(${c.id})">✕</button>
    </div>
  `).join('');
}

function generateTimetable() {
  const statusEl = document.getElementById('gen-status');

  // ── Pre-flight checks ──
  if (!subjects.length)   return setStatus(statusEl, 'No subjects found. Please add subjects first.', 'error');
  if (!classrooms.length) return setStatus(statusEl, 'No classrooms found. Please add classrooms first.', 'error');

  setStatus(statusEl, '⏳ Scheduling in progress…', '');

  const grid = {};
  DAYS.forEach(day => {
    grid[day] = {};
    SLOTS.forEach(slot => { grid[day][slot] = null; });
  });

  const maxHours = Math.max(...subjects.map(s => s.hours));
  const queue = []; // Round Robin ready-queue

  for (let pass = 0; pass < maxHours; pass++) {
    subjects.forEach(sub => {
      if (pass < sub.hours) {
        queue.push({ ...sub }); // push one time-unit for this subject in this pass
      }
    });
  }

  
  const allSlots = [];
  DAYS.forEach(day => SLOTS.forEach(slot => allSlots.push([day, slot])));

  let slotPointer = 0; // Points to current position in the time grid

  
  for (const item of queue) {
    const teacher = teachers.find(t => t.id === item.teacherId);
    let assigned = false;
    let attempts = 0; // Prevent infinite loop (safety valve)

    while (!assigned && attempts < allSlots.length) {
      const [day, slot] = allSlots[slotPointer % allSlots.length];
      slotPointer++;
      attempts++;

      // ── CONFLICT CHECK A: Teacher availability by day ──
      // (Teacher declared they don't work on this day)
      if (teacher && !teacher.days.includes(day)) continue;

      // ── CONFLICT CHECK B: Teacher already scheduled here ──
      // (Mutex: teacher is a non-sharable resource)
      const teacherBusy = DAYS.some(d =>
        SLOTS.some(s => grid[d][s]?.teacherId === item.teacherId && d === day && s === slot)
      );
      // Simpler direct check:
      const teacherConflict = Object.values(grid[day]).some(
        cell => cell && cell.teacherId === item.teacherId
      ) && grid[day][slot] !== null;

      const teacherInSlot = grid[day][slot]?.teacherId === item.teacherId;
      const teacherBusyInSlot = DAYS.some(d =>
        grid[d][slot] && grid[d][slot].teacherId === item.teacherId && d !== day
          ? false // different day is fine
          : (d === day && grid[d][slot] && grid[d][slot].teacherId === item.teacherId)
      );

      // Final check: is teacher already in THIS day+slot?
      if (grid[day][slot] !== null) continue; // slot already taken by something

      // Check if teacher is already used elsewhere this day in the same slot:
      const teacherUsedInSlot = Object.entries(grid).some(([d, slots]) =>
        d === day && slots[slot] && slots[slot].teacherId === item.teacherId
      );
      if (teacherUsedInSlot) continue;

      // ── CONFLICT CHECK C: Find an available classroom ──
      // (Classroom = shared critical resource, like a shared memory segment)
      const occupiedRooms = Object.values(
        Object.fromEntries(
          Object.entries(grid).map(([d, slots]) => [d, d === day ? slots[slot] : null])
        )
      ).filter(Boolean).map(c => c.roomId);

      const availableRoom = classrooms.find(c => !occupiedRooms.includes(c.id));

      if (!availableRoom) continue; // All classrooms busy — context switch to next slot

      // ── ASSIGNMENT — Critical section entered ──
      grid[day][slot] = {
        subject:     item.name,
        teacherId:   item.teacherId,
        teacherName: item.teacherName,
        roomId:      availableRoom.id,
        roomNum:     availableRoom.num,
      };

      assigned = true;
    }

    // If not assigned after full grid traversal, log it (process starvation)
    if (!assigned) {
      console.warn(`[Scheduler] Could not assign slot for subject: ${item.name} (starvation / no available slot)`);
    }
  }

  // ── Save & display ──
  timetable = grid;
  save();
  renderDashboard(); // Update slot count on dashboard

  // Count filled slots for feedback
  let filled = 0;
  DAYS.forEach(day => SLOTS.forEach(slot => { if (grid[day][slot]) filled++; }));

  setStatus(statusEl,
    `✓ Timetable generated! ${filled} slot(s) assigned across ${DAYS.length} days × ${SLOTS.length} periods.`,
    'success'
  );

  showToast('Timetable generated successfully!', 'success');
}

/* helper */
function setStatus(el, msg, type) {
  el.textContent = msg;
  el.className   = 'gen-status ' + type;
}

// timetable display
function renderTimetable() {
  const container = document.getElementById('timetable-container');

  if (!timetable) {
    container.innerHTML = '<div class="empty-state">No timetable generated yet. Go to <strong>Generate Timetable</strong> first.</div>';
    return;
  }

  // Build an HTML table: rows = Days, cols = Time Slots
  let html = '<table class="tt-table"><thead><tr>';
  html += '<th class="day-col">Day \\ Slot</th>';
  SLOTS.forEach(slot => {
    html += `<th>${slot}</th>`;
  });
  html += '</tr></thead><tbody>';

  DAYS.forEach(day => {
    html += `<tr><td class="day-label">${day.slice(0,3).toUpperCase()}</td>`;
    SLOTS.forEach(slot => {
      const cell = timetable[day]?.[slot];
      html += `<td class="tt-cell">`;
      if (cell) {
        html += `
          <div class="slot-filled">
            <div>
              <div class="slot-subject">${cell.subject}</div>
              <div class="slot-teacher">👤 ${cell.teacherName}</div>
            </div>
            <div class="slot-room">▣ ${cell.roomNum}</div>
          </div>`;
      } else {
        html += `<div class="slot-empty">—</div>`;
      }
      html += `</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function clearTimetable() {
  if (!confirm('Clear the generated timetable?')) return;
  timetable = null;
  save();
  renderTimetable();
  renderDashboard();
  showToast('Timetable cleared', 'warn');
}

// simple toast notification system
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'toast ' + type;
  }, 3000);
}

// Initialize app
(function init() {
  // Start on dashboard and render initial state
  navigateTo('dashboard');
})();