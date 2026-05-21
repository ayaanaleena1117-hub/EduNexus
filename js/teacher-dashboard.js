(function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const announcementForm = document.getElementById("announcement-form");
  const announcementList = document.getElementById("announcement-list");
  const assignmentForm = document.getElementById("assignment-form");
  const assignmentCreate = document.getElementById("assignment-create");
  const toggleAssignmentForm = document.getElementById("toggle-assignment-form");
  const cancelAssignmentForm = document.getElementById("cancel-assignment-form");
  const assignmentTableBody = document.getElementById("assignment-table-body");

  const classLabels = {
    "ap-bio": "AP Biology",
    "bio-ii": "Biology II",
    "bio-i": "Biology I",
    "env-sci": "Environmental Science",
    all: "All classes",
  };

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

  if (announcementForm && announcementList) {
    announcementForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!announcementForm.checkValidity()) {
        announcementForm.reportValidity();
        return;
      }

      const classSelect = document.getElementById("announcement-class");
      const messageInput = document.getElementById("announcement-message");
      const classValue = classSelect.value;
      const className = classLabels[classValue] || classValue;
      const message = messageInput.value.trim();

      const item = document.createElement("li");
      item.className = "announcement-item";

      const isAll = classValue === "all";
      const tagClass = isAll ? "announcement-tag announcement-tag--accent" : "announcement-tag";

      const today = new Date();
      const dateStr = today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      item.innerHTML =
        '<div class="announcement-item-header">' +
        '<span class="' +
        tagClass +
        '">' +
        className +
        "</span>" +
        "<time datetime=\"" +
        today.toISOString().slice(0, 10) +
        "\">" +
        dateStr +
        "</time>" +
        "</div>" +
        "<p></p>";
      item.querySelector("p").textContent = message;

      announcementList.insertBefore(item, announcementList.firstChild);
      announcementForm.reset();
    });
  }

  function showAssignmentForm() {
    assignmentCreate.hidden = false;
    toggleAssignmentForm.setAttribute("aria-expanded", "true");
  }

  function hideAssignmentForm() {
    assignmentCreate.hidden = true;
    toggleAssignmentForm.setAttribute("aria-expanded", "false");
    assignmentForm.reset();
  }

  if (toggleAssignmentForm) {
    toggleAssignmentForm.addEventListener("click", function () {
      if (assignmentCreate.hidden) {
        showAssignmentForm();
      } else {
        hideAssignmentForm();
      }
    });
  }

  if (cancelAssignmentForm) {
    cancelAssignmentForm.addEventListener("click", hideAssignmentForm);
  }

  if (assignmentForm && assignmentTableBody) {
    assignmentForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!assignmentForm.checkValidity()) {
        assignmentForm.reportValidity();
        return;
      }

      const title = document.getElementById("assignment-title").value.trim();
      const classValue = document.getElementById("assignment-class-select").value;
      const className = classLabels[classValue] || classValue;
      const dueInput = document.getElementById("assignment-due");
      const points = document.getElementById("assignment-points").value;
      const dueDate = new Date(dueInput.value);
      const dueFormatted = dueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const row = document.createElement("tr");
      row.innerHTML =
        "<td><strong></strong><span class=\"table-sub\"></span></td>" +
        "<td></td>" +
        "<td></td>" +
        "<td>0 / —</td>" +
        "<td><span class=\"status-badge status-badge--draft\">Draft</span></td>" +
        "<td><div class=\"table-actions\">" +
        "<button type=\"button\" class=\"btn-icon\" aria-label=\"Edit assignment\">Edit</button>" +
        "<button type=\"button\" class=\"btn-icon btn-icon--danger\" aria-label=\"Delete assignment\">Delete</button>" +
        "</div></td>";

      row.querySelector("strong").textContent = title;
      row.querySelector(".table-sub").textContent = points + " pts";
      row.cells[1].textContent = className;
      row.cells[2].textContent = dueFormatted;

      const deleteBtn = row.querySelector(".btn-icon--danger");
      deleteBtn.addEventListener("click", function () {
        row.remove();
      });

      assignmentTableBody.insertBefore(row, assignmentTableBody.firstChild);
      hideAssignmentForm();
    });
  }

  if (assignmentTableBody) {
    assignmentTableBody.querySelectorAll(".btn-icon--danger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const row = btn.closest("tr");
        if (row && window.confirm("Delete this assignment?")) {
          row.remove();
        }
      });
    });
  }
})();
