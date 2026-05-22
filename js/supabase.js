(function (global) {
  let client = null;

  function isConfigured() {
    const cfg = global.EDUNEXUS_SUPABASE;
    if (!cfg || !cfg.url || !cfg.anonKey) {
      return false;
    }
    return (
      !cfg.url.includes("YOUR_") && !cfg.anonKey.includes("YOUR_")
    );
  }

  function getConfigError() {
    if (!global.EDUNEXUS_SUPABASE) {
      return "Missing js/supabase-config.js. Copy js/supabase-config.example.js and add your Supabase URL and key.";
    }
    if (!isConfigured()) {
      return "Supabase is not configured. Set your Project URL and publishable key in js/supabase-config.js.";
    }
    return null;
  }

  function getClient() {
    const configError = getConfigError();
    if (configError) {
      throw new Error(configError);
    }
    if (!client && global.supabase) {
      client = global.supabase.createClient(
        global.EDUNEXUS_SUPABASE.url,
        global.EDUNEXUS_SUPABASE.anonKey
      );
    }
    if (!client) {
      throw new Error("Supabase client library failed to load.");
    }
    return client;
  }

  function getUserRole(user) {
    if (!user) {
      return null;
    }
    const role = user.user_metadata && user.user_metadata.role;
    if (role === "teacher" || role === "student") {
      return role;
    }
    return null;
  }

  function dashboardPathForRole(role) {
    if (role === "teacher") {
      return "teacher-dashboard.html";
    }
    if (role === "student") {
      return "student-dashboard.html";
    }
    return "login.html";
  }

  function redirectToDashboard(user) {
    const role = getUserRole(user);
    const path = dashboardPathForRole(role);
    if (path === "login.html") {
      throw new Error("Your account does not have a student or teacher role. Contact your administrator.");
    }
    global.location.href = path;
  }

  global.EduNexusSupabase = {
    isConfigured: isConfigured,
    getConfigError: getConfigError,
    getClient: getClient,
    getUserRole: getUserRole,
    dashboardPathForRole: dashboardPathForRole,
    redirectToDashboard: redirectToDashboard,
  };
})(window);
