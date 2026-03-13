function showSection(section) {
    document.getElementById('timetableSection').style.display = 'none';
    document.getElementById('leaveSection').style.display = 'none';
    document.getElementById(`${section}Section`).style.display = 'block';
}

// Initialize the system
document.addEventListener('DOMContentLoaded', function() {
    showSection('timetable');
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = ["09 AM - 10 AM", "10 AM - 11 AM", "11 AM - 12 PM", "12 PM - 01 PM", 
               "01 PM - 02 PM", "02 PM - 03 PM", "03 PM - 04 PM", "04 PM - 05 PM"];