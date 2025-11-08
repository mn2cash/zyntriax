document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("messages-status");
  const tbody = document.getElementById("messages-body");

  // 🔐 Check if user is logged in
  const { data: { user }, error: authError } = await window.supabase.auth.getUser();
  if (!user) {
    localStorage.setItem("redirectAfterLogin", "view-messages.html");
    window.location.href = "login.html";
    return;
  }

  try {
    const { data, error } = await window.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      status.textContent = "❌ Error: " + error.message;
      return;
    }

    if (!data || data.length === 0) {
      status.textContent = "No messages found.";
      return;
    }

    data.forEach(msg => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${msg.name}</td>
        <td>${msg.email}</td>
        <td>${msg.message}</td>
        <td>${new Date(msg.created_at).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    status.textContent = "❌ Unexpected error: " + err.message;
  }
});