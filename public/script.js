const apiUrl = '/api/data';

const dataForm = document.getElementById('dataForm');
const tableBody = document.getElementById('tableBody');
const formMessage = document.getElementById('formMessage');

// Initialize Map
const map = L.map('map').setView([20.5937, 78.9629], 5); // Default to India center
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const markers = L.layerGroup().addTo(map);

// Simple fetch geocoding from Nominatim (OpenStreetMap)
const geocodeCache = {};
const getCoordinates = async (address) => {
    if (geocodeCache[address]) return geocodeCache[address];
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data && data.length > 0) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            geocodeCache[address] = coords;
            return coords;
        }
    } catch (err) {
        console.error("Geocoding failed for", address);
    }
    return null;
};

// Fetch and display data
const fetchData = async () => {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        displayData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Failed to load data. Ensure the backend is running and database is connected.</td></tr>';
    }
};

// Format date
const formatDate = (dateString) => {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Display data in the table
const displayData = async (data) => {
    tableBody.innerHTML = ''; // Clear loader
    markers.clearLayers(); // Clear old map markers

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No monitoring data available.</td></tr>';
        return;
    }

    for (const item of data) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.location}</td>
            <td><span style="font-weight: 500; color: #3b82f6;">${item.pollutantType}</span></td>
            <td>${item.value}</td>
            <td style="color: #6b7280; font-size: 0.9em;">${formatDate(item.timestamp)}</td>
        `;
        tableBody.appendChild(row);

        // Add to map
        const coords = await getCoordinates(item.location);
        if (coords) {
            L.marker(coords).addTo(markers)
                .bindPopup(`<b>${item.location}</b><br>${item.pollutantType}: ${item.value}`);
        }
    }
    
    // Auto-fit map to bounds if markers exist
    if (markers.getLayers().length > 0) {
        const group = new L.featureGroup(markers.getLayers());
        map.fitBounds(group.getBounds().pad(0.1));
    }
};

// Handle form submission
dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const location = document.getElementById('location').value;
    const pollutantType = document.getElementById('pollutantType').value;
    const value = document.getElementById('value').value;
    const submitBtn = document.querySelector('.btn-submit');

    // Disable button and change text
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const payload = {
        location,
        pollutantType,
        value: Number(value)
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit data');
        }

        // Show success message
        showMessage('Data submitted successfully!', 'success');
        
        // Reset form
        dataForm.reset();

        // Refresh data table (and map)
        await fetchData();

    } catch (error) {
        console.error('Submission error:', error);
        showMessage(error.message, 'error');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Data';
    }
});

// Show status message
const showMessage = (text, type) => {
    formMessage.textContent = text;
    formMessage.className = `message ${type}`;
    
    // Hide message after 3 seconds
    setTimeout(() => {
        formMessage.className = 'message';
        formMessage.textContent = '';
    }, 3000);
};

// --- Authentication & Session Management --- //
const checkAuth = () => {
    const userString = localStorage.getItem('envUser');
    
    if (!userString) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const user = JSON.parse(userString);
        const headerBtns = document.querySelector('header div');
        if (headerBtns) {
            headerBtns.innerHTML = `
                <span style="margin-right: 1rem; font-weight: 500;">Welcome, <b>${user.username}</b></span>
                <button onclick="logout()" style="background: transparent; border: 1px solid #ef4444; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #ef4444; font-weight: 600;">Logout</button>
            `;
        }
        
        const formInputs = document.querySelectorAll('#dataForm input, #dataForm select, #dataForm button');
        formInputs.forEach(el => el.disabled = false);
        document.querySelector('.btn-submit').textContent = 'Submit Data';
    } catch (e) {
        logout();
    }
};

window.logout = () => {
    localStorage.removeItem('envUser');
    window.location.href = 'index.html';
};

// Initial fetch on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('envUser')) {
        checkAuth();
        fetchData();
    } else {
        window.location.href = 'index.html';
    }
});
