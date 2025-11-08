// assets/js/contact.js
import { supabaseClient } from './supabase-client.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector("[name='name']").value.trim();
    const email = form.querySelector("[name='email']").value.trim();
    const message = form.querySelector("[name='message']").value.trim();

    if (!isValidEmail(email)) {
      status.textContent = "❌ Please enter a valid email address.";
      return;
    }

    const { error } = await supabaseClient
      .from("contact_messages")
      .insert({ name, email, message });

    if (error) {
      status.textContent = "❌ Error: " + error.message;
    } else {
      status.textContent = "✅ Message sent successfully!";
      form.reset();
    }
  });
});