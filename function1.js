const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = ["09 AM - 10 AM", "10 AM - 11 AM", "11 AM - 12 PM", "12 PM - 01 PM", "01 PM - 02 PM", "02 PM - 03 PM", "03 PM - 04 PM", "04 PM - 05 PM"];

let globalTeacherTimetable = {};
let globalLabTimetable = {};
let numLabs = 0;
let CLASS_LUNCH_HOURS = {};
let TEACHER_LUNCH_HOURS = {};
let BLOCKED_SLOTS = {};

document.getElementById("timetableForm").addEventListener("submit", function(event) {
    event.preventDefault();
    numLabs = parseInt(document.getElementById("numLabs").value);
    initializeSchedules();
    generateSchedules();
});

function initializeSchedules() {
    globalTeacherTimetable = {};
    globalLabTimetable = {};
    CLASS_LUNCH_HOURS = {};
    TEACHER_LUNCH_HOURS = {};
    BLOCKED_SLOTS = {};
    
    for (let i = 1; i <= numLabs; i++) {
        globalLabTimetable[`Lab ${i}`] = Array.from({ length: 5 }, () => Array(8).fill(null));
    }
}

function addClass() {
    const classBlock = document.createElement("div");
    classBlock.classList.add("class-block");
    classBlock.innerHTML = `
        <h3>Class Details</h3>
        <label>Class Name:</label>
        <input type="text" name="className" required>
        <label>Room Number:</label>
        <input type="text" name="roomNumber" required>
        <div class="subjects"></div>
        <button type="button" onclick="addSubject(this)">Add Subject</button>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove Class</button>
    `;
    document.getElementById("classInputs").appendChild(classBlock);
}

function addSubject(button) {
    const subjectBlock = document.createElement("div");
    subjectBlock.classList.add("subject-block");
    subjectBlock.innerHTML = `
        <h4>Subject Details</h4>
        <label>Subject Name:</label>
        <input type="text" name="subjectName" required>
        <label>Teacher Name:</label>
        <input type="text" name="teacherName" required>
        <label>Normal Hours/Week:</label>
        <input type="number" name="normalHours" min="0" required>
        <label>Lab Hours/Week:</label>
        <input type="number" name="labHours" min="0" required>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove Subject</button>
    `;
    button.previousElementSibling.appendChild(subjectBlock);
    
    const slots = subjectBlock.querySelectorAll('.time-slot');
    slots.forEach((slot, index) => {
        slot.addEventListener('click', function() {
            const teacherInput = subjectBlock.querySelector('input[name="teacherName"]');
            const teacherName = teacherInput.value;
            
            if (!teacherName) {
                alert('Please enter teacher name first');
                return;
            }
            
            this.classList.toggle('blocked');
            this.textContent = this.classList.contains('blocked') ? 'BLOCKED' : '';
            
            const day = Math.floor(index / 8);
            const hour = index % 8;
            
            if (!BLOCKED_SLOTS[teacherName]) {
                BLOCKED_SLOTS[teacherName] = Array.from({ length: 5 }, () => Array(8).fill(false));
            }
            BLOCKED_SLOTS[teacherName][day][hour] = this.classList.contains('blocked');
        });
    });

    const teacherInput = subjectBlock.querySelector('input[name="teacherName"]');
    teacherInput.addEventListener('change', function() {
        const oldTeacher = this.dataset.previousValue;
        const newTeacher = this.value;
        
        if (oldTeacher && BLOCKED_SLOTS[oldTeacher]) {
            BLOCKED_SLOTS[newTeacher] = JSON.parse(JSON.stringify(BLOCKED_SLOTS[oldTeacher]));
            delete BLOCKED_SLOTS[oldTeacher];
        }
        
        this.dataset.previousValue = newTeacher;
    });
}

function assignLunchHours() {
    document.querySelectorAll('.class-block').forEach(classBlock => {
        const className = classBlock.querySelector('input[name="className"]').value;
        CLASS_LUNCH_HOURS[className] = Array(5).fill().map(() => 
            Math.floor(Math.random() * 3) + 3);
    });

    const teachers = new Set();
    document.querySelectorAll('input[name="teacherName"]').forEach(input => 
        teachers.add(input.value));
    
    teachers.forEach(teacher => {
        TEACHER_LUNCH_HOURS[teacher] = Array(5).fill().map(() => 
            Math.floor(Math.random() * 3) + 3);
    });
}

function isSlotBlocked(teacher, day, hour) {
    return BLOCKED_SLOTS[teacher]?.[day]?.[hour] === true;
}

function canScheduleLab(schedule, day, hour, labNum, teacher, className) {
    if (hour >= 7) return false;
    
    if (isSlotBlocked(teacher, day, hour) || isSlotBlocked(teacher, day, hour + 1)) {
        return false;
    }
    
    if (schedule[day][hour] !== 'Free' || schedule[day][hour + 1] !== 'Free') {
        return false;
    }
    
    const classLunch = CLASS_LUNCH_HOURS[className]?.[day];
    const teacherLunch = TEACHER_LUNCH_HOURS[teacher]?.[day];
    
    if (classLunch === hour || classLunch === hour + 1 || 
        teacherLunch === hour || teacherLunch === hour + 1) {
        return false;
    }
    
    return globalLabTimetable[`Lab ${labNum}`][day][hour] === null &&
           globalLabTimetable[`Lab ${labNum}`][day][hour + 1] === null;
}

function canScheduleNormal(schedule, day, hour, teacher, className) {
    if (isSlotBlocked(teacher, day, hour)) {
        return false;
    }
    
    if (schedule[day][hour] !== 'Free') {
        return false;
    }
    
    const classLunch = CLASS_LUNCH_HOURS[className]?.[day];
    const teacherLunch = TEACHER_LUNCH_HOURS[teacher]?.[day];
    
    return !(classLunch === hour || teacherLunch === hour);
}

function assignLabHours(schedule, subject, teacher, hours, className, roomNumber) {
    let currentLab = 1;
    let remainingHours = hours;
    let attempts = 0;
    const maxAttempts = 100;

    while (remainingHours > 0 && currentLab <= numLabs && attempts < maxAttempts) {
        for (let day = 0; day < 5 && remainingHours > 0; day++) {
            for (let hour = 0; hour < 7 && remainingHours > 0; hour++) {
                if (canScheduleLab(schedule, day, hour, currentLab, teacher, className)) {
                    schedule[day][hour] = `${subject} Lab ${currentLab} (${teacher})`;
                    schedule[day][hour + 1] = `${subject} Lab ${currentLab} (${teacher})`;
                    
                    globalLabTimetable[`Lab ${currentLab}`][day][hour] = 
                        `${subject} (${className}-${roomNumber}, ${teacher})`;
                    globalLabTimetable[`Lab ${currentLab}`][day][hour + 1] = 
                        `${subject} (${className}-${roomNumber}, ${teacher})`;
                    
                    remainingHours -= 2;
                    break;
                }
            }
        }
        if (remainingHours > 0) {
            currentLab++;
        }
        attempts++;
    }
    
    if (remainingHours > 0) {
        alert(`Unable to schedule all lab hours for ${subject} due to conflicts or blocked slots`);
    }
}

function assignNormalHours(schedule, subject, teacher, hours, className, roomNumber) {
    let remainingHours = hours;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (remainingHours > 0 && attempts < maxAttempts) {
        for (let day = 0; day < 5 && remainingHours > 0; day++) {
            for (let hour = 0; hour < 8 && remainingHours > 0; hour++) {
                if (canScheduleNormal(schedule, day, hour, teacher, className)) {
                    schedule[day][hour] = `${subject} (${teacher})`;
                    remainingHours--;
                    break;
                }
            }
        }
        attempts++;
        if (attempts === maxAttempts && remainingHours > 0) {
            alert(`Unable to schedule all hours for ${subject} due to conflicts or blocked slots`);
            break;
        }
    }
}

function updateTeacherSchedule(teacher, subject, schedule, className, roomNumber) {
    if (!globalTeacherTimetable[teacher]) {
        globalTeacherTimetable[teacher] = Array.from({ length: 5 }, () => Array(8).fill(null));
    }
    
    for (let day = 0; day < 5; day++) {
        for (let hour = 0; hour < 8; hour++) {
            if (schedule[day][hour].includes(subject)) {
                globalTeacherTimetable[teacher][day][hour] = 
                    `${subject} (${className}-${roomNumber})`;
            }
        }
    }
}

function displaySchedule(container, title, schedule) {
    const scheduleDiv = document.createElement('div');
    scheduleDiv.classList.add('schedule-section');
    scheduleDiv.innerHTML = `
        <h3 class="schedule-title">${title}</h3>
        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    ${HOURS.map(hour => `<th>${hour}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${DAYS.map((day, i) => `
                    <tr>
                        <td>${day}</td>
                        ${schedule[i].map(slot => `
                            <td class="${slot === 'LUNCH' ? 'lunch-slot' : 
                                      slot?.includes('Lab') ? 'lab-slot' : 
                                      slot === 'BLOCKED' ? 'blocked' : ''}">${slot || 'Free'}</td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.appendChild(scheduleDiv);
}

function generateSchedules() {
    const classSchedules = document.getElementById("classSchedules");
    const teacherSchedules = document.getElementById("teacherSchedules");
    const labSchedules = document.getElementById("labSchedules");
    
    classSchedules.innerHTML = '<h2>Class Schedules</h2>';
    teacherSchedules.innerHTML = '<h2>Teacher Schedules</h2>';
    labSchedules.innerHTML = '<h2>Lab Schedules</h2>';

    assignLunchHours();

    document.querySelectorAll('.class-block').forEach((classBlock) => {
        const className = classBlock.querySelector('input[name="className"]').value;
        const roomNumber = classBlock.querySelector('input[name="roomNumber"]').value;
        const schedule = Array.from({ length: 5 }, () => Array(8).fill('Free'));
        
        // Mark all blocked slots first
        classBlock.querySelectorAll('.subject-block').forEach(subjectBlock => {
            const teacher = subjectBlock.querySelector('input[name="teacherName"]').value;
            if (BLOCKED_SLOTS[teacher]) {
                for (let day = 0; day < 5; day++) {
                    for (let hour = 0; hour < 8; hour++) {
                        if (BLOCKED_SLOTS[teacher][day][hour]) {
                            schedule[day][hour] = 'BLOCKED';
                        }
                    }
                }
            }
        });
        
        classBlock.querySelectorAll('.subject-block').forEach(subjectBlock => {
            const subject = subjectBlock.querySelector('input[name="subjectName"]').value;
            const teacher = subjectBlock.querySelector('input[name="teacherName"]').value;
            const normalHours = parseInt(subjectBlock.querySelector('input[name="normalHours"]').value) || 0;
            const labHours = parseInt(subjectBlock.querySelector('input[name="labHours"]').value) || 0;
            
            if (labHours > 0) {
                assignLabHours(schedule, subject, teacher, labHours, className, roomNumber);
            }
            assignNormalHours(schedule, subject, teacher, normalHours, className, roomNumber);
            updateTeacherSchedule(teacher, subject, schedule, className, roomNumber);
        });
        
        DAYS.forEach((day, dayIndex) => {
            const lunchHour = CLASS_LUNCH_HOURS[className][dayIndex];
            if (schedule[dayIndex][lunchHour] === 'Free') {
                schedule[dayIndex][lunchHour] = 'LUNCH';
            }
        });
        
        displaySchedule(classSchedules, `Class ${className} (Room ${roomNumber})`, schedule);
    });

    Object.entries(globalTeacherTimetable).forEach(([teacher, schedule]) => {
        const teacherSchedule = JSON.parse(JSON.stringify(schedule));
        DAYS.forEach((day, dayIndex) => {
            const lunchHour = TEACHER_LUNCH_HOURS[teacher][dayIndex];
            if (teacherSchedule[dayIndex][lunchHour] === null) {
                teacherSchedule[dayIndex][lunchHour] = 'LUNCH';
            }
            
            if (BLOCKED_SLOTS[teacher]) {
                for (let hour = 0; hour < 8; hour++) {
                    if (BLOCKED_SLOTS[teacher][dayIndex][hour]) {
                        teacherSchedule[dayIndex][hour] = 'BLOCKED';
                    }
                }
            }
        });
        displaySchedule(teacherSchedules, `Teacher: ${teacher}`, teacherSchedule);
    });

    Object.entries(globalLabTimetable).forEach(([labRoom, schedule]) => {
        displaySchedule(labSchedules, labRoom, schedule);
    });
    
}