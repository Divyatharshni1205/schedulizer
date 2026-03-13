document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('timetableForm').addEventListener('submit', generateTimetable);
    addClass();
});

function addClass() {
    let classContainer = document.getElementById('classInputs');

    let classBlock = document.createElement('div');
    classBlock.classList.add('class-block');
    classBlock.innerHTML = `
        <h2>Class Information</h2>
        <label>Class Name:</label>
        <input type="text" name="className[]" required>

        <label>Room Number:</label>
        <input type="text" name="roomNumber[]" required>

        <label>Number of Lab Rooms:</label>
        <input type="number" name="labRooms[]" required min="1">

        <div class="subject-container"></div>
        <button type="button" onclick="addSubject(this)">Add Subject</button>
    `;

    classContainer.appendChild(classBlock);
}

function addSubject(button) {
    let subjectContainer = button.previousElementSibling;

    let subjectBlock = document.createElement('div');
    subjectBlock.classList.add('class-block');
    subjectBlock.innerHTML = `
        <h3>Subject Details</h3>
        <label>Subject Name:</label>
        <input type="text" name="subjectName[]" required>

        <label>Subject Code:</label>
        <input type="text" name="subjectCode[]" required>

        <label>Credits:</label>
        <input type="number" name="credits[]" required>

        <label>Lab Hours/Week:</label>
        <input type="number" name="labHours[]" required>

        <label>Normal Hours/Week:</label>
        <input type="number" name="normalHours[]" required>

        <label>Teacher Name:</label>
        <input type="text" name="teacherName[]" required>

        <label>Teacher ID:</label>
        <input type="text" name="teacherID[]" required>
    `;

    subjectContainer.appendChild(subjectBlock);
}

function generateTimetable(event) {
    event.preventDefault();

    let subjects = document.querySelectorAll('.class-block .subject-container input[name="subjectName[]"]');
    let outputContainer = document.getElementById('outputContainer');
    outputContainer.innerHTML = '<h2>Generated Timetable</h2>';

    let timetable = `
        <table>
            <thead>
                <tr>
                    <th class="timetable-header">Day</th>
                    <th class="timetable-header">09 AM - 10 AM</th>
                    <th class="timetable-header">10 AM - 11 AM</th>
                    <th class="timetable-header">11 AM - 12 PM</th>
                    <th class="timetable-header">12 PM - 01 PM (Lunch)</th>
                    <th class="timetable-header">01 PM - 02 PM</th>
                    <th class="timetable-header">02 PM - 03 PM</th>
                    <th class="timetable-header">03 PM - 04 PM</th>
                    <th class="timetable-header">04 PM - 05 PM</th>
                </tr>
            </thead>
            <tbody>
    `;

    let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let index = 0;

    days.forEach(day => {
        timetable += `<tr><td>${day}</td>`;
        for (let i = 0; i < 8; i++) {
            if (i === 3) {
                timetable += `<td><b>Lunch</b></td>`;
            } else {
                let subject = subjects[index] ? subjects[index].value : 'Free';
                timetable += `<td>${subject}</td>`;
                index++;
            }
        }
        timetable += `</tr>`;
    });

    timetable += `</tbody></table>`;
    outputContainer.innerHTML += timetable;
}
