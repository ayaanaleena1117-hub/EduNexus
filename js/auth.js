(function () {
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = document.querySelectorAll(".auth-panel");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginSuccess = document.getElementById("login-success");
  const signupSuccess = document.getElementById("signup-success");

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
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateTab(tab);
    });
  });

  function handleSubmit(form, successEl) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      form.reset();
      successEl.hidden = false;

      setTimeout(function () {
        successEl.hidden = true;
      }, 5000);
    });
  }

  if (loginForm) {
    handleSubmit(loginForm, loginSuccess);
  }

  if (signupForm) {
    handleSubmit(signupForm, signupSuccess);
  }
})();
