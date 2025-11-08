import { supabaseClient } from './auth.js'; // your Supabase init file

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  if (!isValidEmail(email)) {
    alert("Please enter a valid email address");
    return;
  }

  const { error } = await supabaseClient
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Message sent successfully!");
    e.target.reset();
  }
});