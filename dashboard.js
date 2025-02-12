// dashboard.js
let applications = JSON.parse(localStorage.getItem('applications')) || [];

// Sort by application date by default (newest first)
applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));

// Check if user is logged in
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

// Store the original submit handler
const originalSubmitHandler = (e) => {
    e.preventDefault();
    
    const newApplication = {
        id: Date.now(),
        company: document.getElementById('company').value,
        jobLink: document.getElementById('jobLink').value,
        jobDescription: document.getElementById('jobDescription').value,
        applicationDate: document.getElementById('applicationDate').value,
        status: document.getElementById('status').value
    };
    
    applications.push(newApplication);
    // Sort by application date after adding new entry
    applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
    saveApplications();
    renderApplications();
    e.target.reset();
};

// Add new application
document.getElementById('applicationForm').addEventListener('submit', originalSubmitHandler);

// Save to localStorage
function saveApplications() {
    localStorage.setItem('applications', JSON.stringify(applications));
}

// Render applications table
function renderApplications(filteredApps = null) {
    let appsToRender = filteredApps || [...applications];
    
    // Default sort by application date (newest first)
    if (!currentSort.column) {
        appsToRender.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
    }
    
    const tbody = document.getElementById('applicationsBody');
    tbody.innerHTML = '';
    
    appsToRender.forEach(app => {
        const row = document.createElement('tr');
        // First row with main information
        row.innerHTML = `
            <td>${app.company}</td>
            <td>${app.applicationDate}</td>
            <td><a href="${app.jobLink}" target="_blank">View Job</a></td>
            <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editApplication(${app.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteApplication(${app.id})">Delete</button>
                <button class="action-btn jd-btn" onclick="toggleJD(${app.id}, this)">Show JD</button>
            </td>
        `;
        tbody.appendChild(row);

        // Create a hidden row for Job Description
        const jdRow = document.createElement('tr');
        jdRow.className = 'jd-row';
        jdRow.id = `jd-${app.id}`;
        jdRow.style.display = 'none';
        jdRow.innerHTML = `
            <td colspan="5" class="jd-content">
                <div class="jd-text">${app.jobDescription || 'No job description available.'}</div>
            </td>
        `;
        tbody.appendChild(jdRow);
    });
}

// Filter functions
function filterApplications() {
    const companySearch = document.getElementById('searchCompany').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let filtered = applications.filter(app => {
        const matchCompany = app.company.toLowerCase().includes(companySearch);
        const matchStatus = !statusFilter || app.status === statusFilter;
        const matchDate = !dateFilter || app.applicationDate === dateFilter;
        return matchCompany && matchStatus && matchDate;
    });
    
    renderApplications(filtered);
}

// Sort function
let currentSort = { column: null, ascending: true };

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = column;
        currentSort.ascending = true;
    }
    
    applications.sort((a, b) => {
        let comparison = 0;
        if (column === 'applicationDate') {
            comparison = new Date(a[column]) - new Date(b[column]);
        } else {
            if (a[column] > b[column]) comparison = 1;
            if (a[column] < b[column]) comparison = -1;
        }
        return currentSort.ascending ? comparison : -comparison;
    });
    
    renderApplications();
}

// Function to toggle Job Description visibility
function toggleJD(id, button) {
    const jdRow = document.getElementById(`jd-${id}`);
    if (jdRow.style.display === 'none') {
        jdRow.style.display = 'table-row';
        button.textContent = 'Hide JD';
        button.classList.add('active');
    } else {
        jdRow.style.display = 'none';
        button.textContent = 'Show JD';
        button.classList.remove('active');
    }
}

// Edit function
function editApplication(id) {
    const app = applications.find(a => a.id === id);
    if (!app) return;
    
    // Fill the form with existing data
    document.getElementById('company').value = app.company;
    document.getElementById('jobLink').value = app.jobLink;
    document.getElementById('jobDescription').value = app.jobDescription;
    document.getElementById('applicationDate').value = app.applicationDate;
    document.getElementById('status').value = app.status;
    
    // Change the form submit button
    const submitBtn = document.querySelector('#applicationForm button[type="submit"]');
    submitBtn.textContent = 'Update Application';
    
    // Remove any existing edit handler
    const form = document.getElementById('applicationForm');
    form.onsubmit = null;
    
    // Update the form submit handler
    form.onsubmit = (e) => {
        e.preventDefault();
        
        // Update the application
        app.company = document.getElementById('company').value;
        app.jobLink = document.getElementById('jobLink').value;
        app.jobDescription = document.getElementById('jobDescription').value;
        app.applicationDate = document.getElementById('applicationDate').value;
        app.status = document.getElementById('status').value;
        
        // Save and render
        saveApplications();
        renderApplications();
        
        // Reset form and button
        form.reset();
        submitBtn.textContent = 'Add Application';
        
        // Reset form handler to original
        form.onsubmit = originalSubmitHandler;
        
        return false; // Prevent form submission
    };
}

// Delete function
function deleteApplication(id) {
    if (confirm('Are you sure you want to delete this application?')) {
        applications = applications.filter(a => a.id !== id);
        saveApplications();
        renderApplications();
    }
}

// Clear filters
function clearFilters() {
    document.getElementById('searchCompany').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = '';
    renderApplications();
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Add event listeners for filters
document.getElementById('searchCompany').addEventListener('input', filterApplications);
document.getElementById('statusFilter').addEventListener('change', filterApplications);
document.getElementById('dateFilter').addEventListener('input', filterApplications);

// Initial render
renderApplications();