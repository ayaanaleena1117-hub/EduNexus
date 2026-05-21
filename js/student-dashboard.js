(function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const sidebarToggle = document.querySelector(".sidebar-toggle");

  function openSidebar() {
    sidebar.classList.add("is-open");
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    sidebarToggle.setAttribute("aria-expanded", "true");
    sidebarToggle.setAttribute("aria-label", "Close navigation menu");
  }

  function closeSidebar() {
    sidebar.classList.remove("is-open");
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    sidebarToggle.setAttribute("aria-expanded", "false");
    sidebarToggle.setAttribute("aria-label", "Open navigation menu");
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      if (sidebar.classList.contains("is-open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeSidebar();
    }
  });
})();
