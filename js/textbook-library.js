(function () {
  const textbooks = {
    "campbell-ap": {
      title: "Campbell Biology AP Edition",
      subject: "Biology",
      grade: "Grades 11–12",
      publisher: "Pearson · 12th Edition",
      chapters: {
        textbook: [
          "The Chemistry of Life",
          "The Cell",
          "Cellular Energetics",
          "Cell Communication and Cell Cycle",
          "Heredity",
          "Gene Expression and Regulation",
          "Natural Selection",
          "Ecology",
        ],
        "answer-key": [
          "Chapter 1 Solutions",
          "Chapter 2 Solutions",
          "Chapter 3 Solutions",
          "Chapter 4 Solutions",
          "Chapter 5 Solutions",
          "Chapter 6 Solutions",
          "Chapter 7 Solutions",
          "Chapter 8 Solutions",
        ],
      },
      previews: {
        textbook: {
          "The Chemistry of Life":
            "Introduction to biological chemistry, water properties, and macromolecules. Includes guided reading on carbon bonding and polymer formation.",
          "The Cell":
            "Explores prokaryotic and eukaryotic cell structure, membrane transport, and organelle functions with annotated diagrams.",
        },
        "answer-key": {
          "Chapter 1 Solutions":
            "1. B  2. D  3. A  4. C — Water's polarity enables hydrogen bonding. Full worked solutions for practice problems 1–24.",
          "Chapter 2 Solutions":
            "1. C  2. A  3. B — Endomembrane system pathways. Rubric for lab: Microscopy and Cell Structure.",
        },
      },
    },
    "living-science": {
      title: "Biology: The Living Science",
      subject: "Biology",
      grade: "Grades 9–10",
      publisher: "McGraw-Hill · 4th Edition",
      chapters: {
        textbook: ["Introduction to Biology", "Cells", "Genetics", "Evolution", "Ecology"],
        "answer-key": ["Ch. 1 Key", "Ch. 2 Key", "Ch. 3 Key", "Ch. 4 Key", "Ch. 5 Key"],
      },
      previews: {
        textbook: {
          "Introduction to Biology":
            "Scientific method, lab safety, and characteristics of life. Inquiry lab: Observing living vs. non-living specimens.",
        },
        "answer-key": {
          "Ch. 1 Key": "Review questions 1–15 with answer explanations. Standard rubric for scientific method lab report.",
        },
      },
    },
    "bio-ii-concepts": {
      title: "Biology II: Concepts & Connections",
      subject: "Biology",
      grade: "Grade 10",
      publisher: "Houghton Mifflin · 2nd Edition",
      chapters: {
        textbook: ["Photosynthesis", "Cellular Respiration", "Mitosis & Meiosis", "DNA & RNA"],
        "answer-key": ["Photosynthesis Key", "Respiration Key", "Cell Division Key", "Molecular Genetics Key"],
      },
      previews: {
        textbook: {
          Photosynthesis:
            "Light-dependent and light-independent reactions, chloroplast structure, and factors affecting photosynthetic rate.",
        },
        "answer-key": {
          "Photosynthesis Key":
            "Short-answer key for Calvin cycle diagram. Multiple-choice answers: 1-B, 2-C, 3-A, 4-D.",
        },
      },
    },
    "env-today": {
      title: "Environmental Science Today",
      subject: "Environmental Science",
      grade: "Grades 10–11",
      publisher: "National Geographic Learning · 5th Edition",
      chapters: {
        textbook: ["Ecosystems", "Population Dynamics", "Energy Resources", "Climate Change", "Conservation"],
        "answer-key": ["Ecosystems Key", "Populations Key", "Energy Key", "Climate Key", "Conservation Key"],
      },
      previews: {
        textbook: {
          Ecosystems:
            "Food webs, energy pyramids, and biogeochemical cycles. Case study: Local watershed health assessment.",
        },
        "answer-key": {
          "Ecosystems Key":
            "Data analysis answer sheet for energy pyramid lab. Essay rubric: Human impact on local ecosystems.",
        },
      },
    },
    "chem-matter": {
      title: "Chemistry: Matter and Change",
      subject: "Chemistry",
      grade: "Grades 10–11",
      publisher: "Glencoe · 3rd Edition",
      chapters: {
        textbook: ["Matter and Change", "Atoms", "The Periodic Table", "Chemical Reactions"],
        "answer-key": ["Ch. 1 Key", "Ch. 2 Key", "Ch. 3 Key", "Ch. 4 Key"],
      },
      previews: {
        textbook: {
          "Matter and Change":
            "Properties of matter, physical vs. chemical changes, and introduction to measurement and significant figures.",
        },
        "answer-key": {
          "Ch. 1 Key": "Calculation answers with units. Stoichiometry practice set solutions 1–20.",
        },
      },
    },
    "algebra-ii": {
      title: "Algebra II: Structure and Method",
      subject: "Mathematics",
      grade: "Grades 10–11",
      publisher: "McDougal Littell · 2nd Edition",
      chapters: {
        textbook: ["Linear Equations", "Quadratic Functions", "Polynomials", "Rational Expressions"],
        "answer-key": ["Unit 1 Key", "Unit 2 Key", "Unit 3 Key", "Unit 4 Key"],
      },
      previews: {
        textbook: {
          "Quadratic Functions":
            "Graphing parabolas, vertex form, and applications. Practice problems with real-world modeling scenarios.",
        },
        "answer-key": {
          "Unit 2 Key": "Odd-numbered problems 1–45. Step-by-step factoring and quadratic formula solutions.",
        },
      },
    },
  };

  const grid = document.getElementById("textbook-grid");
  const searchInput = document.getElementById("library-search");
  const filters = document.querySelectorAll(".library-filter");
  const emptyState = document.getElementById("library-empty");
  const countEl = document.getElementById("library-count");
  const modal = document.getElementById("library-modal");
  const modalBackdrop = document.getElementById("library-modal-backdrop");
  const modalClose = document.getElementById("library-modal-close");
  const modalCloseFooter = document.getElementById("library-modal-close-footer");
  const modalOpenFull = document.getElementById("library-modal-open-full");
  const modalType = document.getElementById("library-modal-type");
  const modalTitle = document.getElementById("library-modal-title");
  const modalMeta = document.getElementById("library-modal-meta");
  const modalChapters = document.getElementById("library-modal-chapters");
  const previewLabel = document.getElementById("library-preview-label");
  const previewText = document.getElementById("library-preview-text");
  const modalDialog = modal && modal.querySelector(".library-modal-dialog");

  let activeFilter = "all";
  let lastFocus = null;

  if (!grid) {
    return;
  }

  function getCards() {
    return grid.querySelectorAll(".textbook-card");
  }

  function updateVisibility() {
    const query = (searchInput && searchInput.value.trim().toLowerCase()) || "";
    let visible = 0;

    getCards().forEach(function (card) {
      const subject = card.getAttribute("data-subject") || "";
      const title = (card.getAttribute("data-title") || "").toLowerCase();
      const matchesFilter = activeFilter === "all" || subject === activeFilter;
      const matchesSearch = !query || title.includes(query) || subject.includes(query);
      const show = matchesFilter && matchesSearch;

      card.classList.toggle("is-hidden", !show);
      if (show) {
        visible += 1;
      }
    });

    if (countEl) {
      countEl.textContent = visible + (visible === 1 ? " textbook" : " textbooks");
    }

    if (emptyState) {
      emptyState.hidden = visible > 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", updateVisibility);
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      activeFilter = btn.getAttribute("data-filter") || "all";
      updateVisibility();
    });
  });

  function getPreview(book, viewType, chapter) {
    const previews = book.previews && book.previews[viewType];
    if (previews && previews[chapter]) {
      return previews[chapter];
    }
    if (viewType === "answer-key") {
      return "Teacher answer key for " + chapter + ". Includes selected-response answers, worked solutions, and grading rubrics for major assignments.";
    }
    return "Digital textbook content for " + chapter + ". Includes readings, visuals, practice problems, and linked resources for your class.";
  }

  function renderChapter(chapter, index, book, viewType) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "library-chapter-btn" + (index === 0 ? " is-active" : "");
    btn.textContent = chapter;
    btn.addEventListener("click", function () {
      modalChapters.querySelectorAll(".library-chapter-btn").forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      previewLabel.textContent = chapter;
      previewText.textContent = getPreview(book, viewType, chapter);
    });
    li.appendChild(btn);
    return li;
  }

  function openViewer(id, viewType) {
    const book = textbooks[id];
    if (!book || !modal) {
      return;
    }

    lastFocus = document.activeElement;
    const isKey = viewType === "answer-key";
    const chapters = book.chapters[viewType] || [];

    modal.hidden = false;
    modalDialog.classList.toggle("library-modal--answer-key", isKey);
    modalType.textContent = isKey ? "Answer Key" : "Textbook";
    modalTitle.textContent = book.title;
    modalMeta.textContent = book.subject + " · " + book.grade;

    modalChapters.innerHTML = "";
    chapters.forEach(function (chapter, i) {
      modalChapters.appendChild(renderChapter(chapter, i, book, viewType));
    });

    if (chapters.length > 0) {
      previewLabel.textContent = chapters[0];
      previewText.textContent = getPreview(book, viewType, chapters[0]);
    }

    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeViewer() {
    if (!modal) {
      return;
    }
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) {
      lastFocus.focus();
    }
  }

  grid.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-id][data-view]");
    if (!btn) {
      return;
    }
    openViewer(btn.getAttribute("data-id"), btn.getAttribute("data-view"));
  });

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeViewer);
  }
  if (modalClose) {
    modalClose.addEventListener("click", closeViewer);
  }
  if (modalCloseFooter) {
    modalCloseFooter.addEventListener("click", closeViewer);
  }
  if (modalOpenFull) {
    modalOpenFull.addEventListener("click", function () {
      alert(
        "Full-screen viewer would open the complete digital " +
          (modalDialog.classList.contains("library-modal--answer-key")
            ? "answer key"
            : "textbook") +
          " in a new tab. Connect to your school's content provider to enable this feature."
      );
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) {
      closeViewer();
    }
  });

  updateVisibility();
})();
