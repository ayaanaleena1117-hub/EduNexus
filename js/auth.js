(function () {
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = document.querySelectorAll(".auth-panel");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginSuccess = document.getElementById("login-success");
  const signupSuccess = document.getElementById("signup-success");
  const loginError = document.getElementById("login-error");
  const signupError = document.getElementById("signup-error");
  const configBanner = document.getElementById("auth-config-banner");

  function activateTab(tab) {
    const targetId = tab.getAttribute("aria-controls");

    tabs.forEach(function (t) {
      const isActive = t === tab;
      t.classList.toggle("is-active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    panels.forEach(function (panel) {
      const isActive = panel.id === targetId;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });

    hideMessages();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateTab(tab);
    });
  });

  function hideMessages() {
    [loginSuccess, signupSuccess, loginError, signupError].forEach(function (el) {
      if (el) {
        el.hidden = true;
      }
    });
  }

  function showError(el, message) {
    hideMessages();
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
  }

  function showSuccess(el, message) {
    hideMessages();
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
  }

  function setFormLoading(form, loading) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) {
      return;
    }
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = btn.dataset.loadingText || "Please wait…";
    } else {
      btn.disabled = false;
      if (btn.dataset.originalText) {
        btn.textContent = btn.dataset.originalText;
      }
    }
    form.querySelectorAll("input, textarea, select").forEach(function (input) {
      input.disabled = loading;
    });
  }

  function initConfigBanner() {
    const err = window.EduNexusSupabase.getConfigError();
    if (configBanner) {
      if (err) {
        configBanner.textContent = err;
        configBanner.hidden = false;
        if (loginForm) {
          loginForm.querySelector("button[type=submit]").disabled = true;
        }
        if (signupForm) {
          signupForm.querySelector("button[type=submit]").disabled = true;
        }
      } else {
        configBanner.hidden = true;
      }
    }
  }

  async function checkExistingSession() {
    if (!window.EduNexusSupabase.isConfigured()) {
      return;
    }
    try {
      const supabase = window.EduNexusSupabase.getClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && window.EduNexusSupabase.getUserRole(session.user)) {
        window.EduNexusSupabase.redirectToDashboard(session.user);
      }
    } catch (_) {
      /* stay on login page */
    }
  }

  if (loginForm) {
    loginForm.querySelector('button[type="submit"]').dataset.loadingText = "Signing in…";

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      hideMessages();

      if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
      }

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      try {
        setFormLoading(loginForm, true);
        const supabase = window.EduNexusSupabase.getClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          showError(loginError, error.message);
          return;
        }

        if (!data.user) {
          showError(loginError, "Sign in failed. Please try again.");
          return;
        }

        const role = window.EduNexusSupabase.getUserRole(data.user);
        if (!role) {
          await supabase.auth.signOut();
          showError(
            loginError,
            "Your account is missing a role. Please sign up again or contact support."
          );
          return;
        }

        showSuccess(loginSuccess, "Welcome back! Redirecting to your dashboard…");
        setTimeout(function () {
          window.EduNexusSupabase.redirectToDashboard(data.user);
        }, 600);
      } catch (err) {
        showError(loginError, err.message || "Unable to sign in.");
      } finally {
        setFormLoading(loginForm, false);
      }
    });
  }

  if (signupForm) {
    signupForm.querySelector('button[type="submit"]').dataset.loadingText =
      "Creating account…";

    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      hideMessages();

      if (!signupForm.checkValidity()) {
        signupForm.reportValidity();
        return;
      }

      const name = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      const roleInput = signupForm.querySelector('input[name="role"]:checked');
      const role = roleInput ? roleInput.value : "student";

      if (role !== "student" && role !== "teacher") {
        showError(signupError, "Please select Student or Teacher.");
        return;
      }

      try {
        setFormLoading(signupForm, true);
        const supabase = window.EduNexusSupabase.getClient();
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: name,
              role: role,
            },
          },
        });

        if (error) {
          showError(signupError, error.message);
          return;
        }

        if (data.session && data.user) {
          showSuccess(signupSuccess, "Account created! Redirecting to your dashboard…");
          setTimeout(function () {
            window.EduNexusSupabase.redirectToDashboard(data.user);
          }, 800);
          return;
        }

        showSuccess(
          signupSuccess,
          "Account created! Check your email to confirm your address, then log in."
        );
        signupForm.reset();
        const studentRadio = signupForm.querySelector('input[value="student"]');
        if (studentRadio) {
          studentRadio.checked = true;
        }
      } catch (err) {
        showError(signupError, err.message || "Unable to create account.");
      } finally {
        setFormLoading(signupForm, false);
      }
    });
  }

  initConfigBanner();
  checkExistingSession();
})();
