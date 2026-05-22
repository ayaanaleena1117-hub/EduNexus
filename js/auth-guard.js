(function () {
  const requiredRole = document.body.getAttribute("data-required-role");

  function showConfigError(message) {
    document.body.innerHTML =
      '<div style="font-family:Inter,system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:2rem;text-align:center;">' +
      "<h1 style=\"font-size:1.25rem;margin-bottom:0.75rem;\">Configuration required</h1>" +
      "<p style=\"color:#64748b;line-height:1.6;\">" +
      message +
      "</p>" +
      "<p style=\"margin-top:1.5rem;\"><a href=\"login.html\">Back to login</a></p>" +
      "</div>";
  }

  async function init() {
    const configError = window.EduNexusSupabase.getConfigError();
    if (configError) {
      showConfigError(configError);
      return;
    }

    const supabase = window.EduNexusSupabase.getClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.replace("login.html");
      return;
    }

    const role = window.EduNexusSupabase.getUserRole(session.user);

    if (requiredRole && role !== requiredRole) {
      window.location.replace(window.EduNexusSupabase.dashboardPathForRole(role));
      return;
    }

    document.body.classList.add("auth-ready");

    const name =
      (session.user.user_metadata && session.user.user_metadata.full_name) ||
      session.user.email ||
      "User";
    const initials = name
      .split(" ")
      .map(function (part) {
        return part[0];
      })
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const firstName = name.split(" ")[0] || name;

    document.querySelectorAll("[data-user-name]").forEach(function (el) {
      el.textContent = name;
    });

    document.querySelectorAll("[data-user-greeting]").forEach(function (el) {
      el.textContent = firstName;
    });

    document.querySelectorAll("[data-user-initials]").forEach(function (el) {
      el.textContent = initials;
    });

    document.querySelectorAll("[data-sign-out]").forEach(function (el) {
      el.addEventListener("click", async function (e) {
        e.preventDefault();
        await supabase.auth.signOut();
        window.location.replace("login.html");
      });
    });
  }

  init();
})();
