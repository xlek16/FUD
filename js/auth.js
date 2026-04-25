// Auth state management
let isSignUp = false;

const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const submitBtn = document.getElementById('submit-btn');
const toggleAuth = document.getElementById('toggle-auth');
const footerText = document.getElementById('footer-text');
const usernameGroup = document.getElementById('username-group');
const errorMsg = document.getElementById('error-msg');
const successMsg = document.getElementById('success-msg');

// Function to update UI based on isSignUp state
function updateUI() {
  if (isSignUp) {
    authTitle.textContent = "Create an account";
    authSubtitle.textContent = "Join the community and find your duo.";
    submitBtn.textContent = "Sign Up";
    footerText.textContent = "Already have an account?";
    toggleAuth.textContent = "Log in";
    usernameGroup.style.display = "flex";
  } else {
    authTitle.textContent = "Welcome back";
    authSubtitle.textContent = "Login to find your next teammate.";
    submitBtn.textContent = "Log In";
    footerText.textContent = "Don't have an account?";
    toggleAuth.textContent = "Sign up";
    usernameGroup.style.display = "none";
  }
  
  errorMsg.style.display = "none";
  successMsg.style.display = "none";
  
  // Hide strength indicator when switching to login
  const strengthWrapper = document.getElementById('password-strength-wrapper');
  if (strengthWrapper) strengthWrapper.style.display = 'none';
}

// Initial check for mode parameter
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('mode') === 'signup') {
  isSignUp = true;
  updateUI();
}

// Toggle between Login and Sign Up
toggleAuth.addEventListener('click', () => {
  isSignUp = !isSignUp;
  updateUI();
});

// Handle Form Submission
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value;
  
  errorMsg.style.display = "none";
  successMsg.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.textContent = isSignUp ? "Creating account..." : "Logging in...";

  try {
    if (isSignUp) {
      // Check if username exists first
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
        
      if (existing) {
        throw new Error("nome já utilizado");
      }

      // Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: username // Using username as full name for now
          }
        }
      });
      
      if (error) throw error;
      
      successMsg.textContent = "Registration successful! You can now log in.";
      successMsg.style.display = "block";
      
      // Since we disabled email confirmation, we can redirect to login or just tell them to log in
      // Actually, many users expect to be logged in automatically. 
      // With Supabase, signUp might return a session if confirmation is off.
      if (data.session) {
        successMsg.textContent = "Registration successful! Redirecting...";
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        // Toggle back to login form
        setTimeout(() => {
          isSignUp = false;
          updateUI();
          authForm.reset();
        }, 2000);
      }
      
    } else {
      // Log In
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      successMsg.textContent = "Login successful! Redirecting...";
      successMsg.style.display = "block";
      
      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
  } catch (error) {
    errorMsg.textContent = error.message;
    errorMsg.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isSignUp ? "Sign Up" : "Log In";
  }
});

// Password strength indicator
const passwordInput = document.getElementById('password');
const strengthWrapper = document.getElementById('password-strength-wrapper');
const strengthText = document.getElementById('password-strength');

passwordInput.addEventListener('input', () => {
  if (!isSignUp) {
    strengthWrapper.style.display = 'none';
    return;
  }
  
  const val = passwordInput.value;
  if (!val) {
    strengthWrapper.style.display = 'none';
    return;
  }
  
  strengthWrapper.style.display = 'block';
  
  // Simple strength check logic
  let strength = 0;
  if (val.length >= 8) strength++;
  if (/[A-Z]/.test(val)) strength++;
  if (/[0-9]/.test(val)) strength++;
  if (/[^A-Za-z0-9]/.test(val)) strength++;
  
  if (strength <= 1) {
    strengthText.textContent = 'Pouco segura';
    strengthText.style.color = '#f87171'; // Red
  } else if (strength <= 2) {
    strengthText.textContent = 'Média';
    strengthText.style.color = '#fbbf24'; // Amber
  } else {
    strengthText.textContent = 'Segura';
    strengthText.style.color = '#34d399'; // Green
  }
});

// Handle Google Login
const googleBtn = document.getElementById('google-btn');
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/index.html'
        }
      });
      if (error) throw error;
    } catch (error) {
      errorMsg.textContent = error.message;
      errorMsg.style.display = "block";
    }
  });
}

// Check if user is already logged in
async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    window.location.href = "index.html";
  }
}

checkUser();
