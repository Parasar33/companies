// login.js

// Hardcoded credentials
const CREDENTIALS = {
    username: "admin",
    passwordHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"
};

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Convert password to SHA-256 hash
    const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password)
    );
    
    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Check credentials
    if (username === CREDENTIALS.username && hashHex === CREDENTIALS.passwordHash) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'dashboard.html';
    } else {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Invalid username or password!';
        
        // Remove any existing error message
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        document.getElementById('loginForm').appendChild(errorMsg);
        document.getElementById('password').value = '';
    }
});

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'hide';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'show';
    }
}