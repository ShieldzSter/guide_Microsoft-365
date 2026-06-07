const root = document.documentElement;
const topbar = document.querySelector(".topbar");
const searchInput = document.querySelector("#guideSearch");
const searchResults = document.querySelector("#searchResults");
const sections = [...document.querySelectorAll(".guide-section")];
const sidebar = document.querySelector("#guideNav");
const navToggle = document.querySelector("#navToggle");
const navList = document.querySelector("#guideNavList");
const navSortButtons = [...document.querySelectorAll("[data-nav-sort]")];
let navLinks = [...document.querySelectorAll(".sidebar a")];
const toTop = document.querySelector(".to-top");
const expandAll = document.querySelector("#expandAll");
const themeToggle = document.querySelector("#themeToggle");
const printButton = document.querySelector("#printButton");
const workflowButtons = [...document.querySelectorAll("[data-hotspot]")];
const workflowStepNumber = document.querySelector("#workflowStepNumber");
const workflowStepTitle = document.querySelector("#workflowStepTitle");
const workflowStepText = document.querySelector("#workflowStepText");
const roleButtons = [...document.querySelectorAll("[data-role-tab]")];
const rolePanelEyebrow = document.querySelector("#rolePanelEyebrow");
const rolePanelTitle = document.querySelector("#rolePanelTitle");
const rolePanelText = document.querySelector("#rolePanelText");
const rolePanelList = document.querySelector("#rolePanelList");
const imageHotspotButtons = [...document.querySelectorAll("[data-image-hotspot]")];
const hotspotEyebrow = document.querySelector("#hotspotEyebrow");
const hotspotTitle = document.querySelector("#hotspotTitle");
const hotspotText = document.querySelector("#hotspotText");
const mediaButtons = [...document.querySelectorAll("[data-media-tab]")];
const mediaPanels = [...document.querySelectorAll("[data-media-panel]")];
const statusChoiceButtons = [...document.querySelectorAll("[data-status-choice]")];
const statusDetailEyebrow = document.querySelector("#statusDetailEyebrow");
const statusDetailTitle = document.querySelector("#statusDetailTitle");
const statusDetailText = document.querySelector("#statusDetailText");
const reportTabButtons = [...document.querySelectorAll("[data-report-tab]")];
const reportPanelEyebrow = document.querySelector("#reportPanelEyebrow");
const reportPanelTitle = document.querySelector("#reportPanelTitle");
const reportPanelText = document.querySelector("#reportPanelText");
const reportPanelList = document.querySelector("#reportPanelList");
const imageLightbox = document.querySelector("#imageLightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxClose = document.querySelector(".lightbox-close");
const tileDetailModal = document.querySelector("#tileDetailModal");
const tileDetailClose = document.querySelector("#tileDetailClose");
const tileDetailSection = document.querySelector("#tileDetailSection");
const tileDetailTitle = document.querySelector("#tileDetailTitle");
const tileDetailBody = document.querySelector("#tileDetailBody");
const tileDetailList = document.querySelector("#tileDetailList");
let modalReturnFocus = null;

const savedTheme = localStorage.getItem("guide-theme");
if (savedTheme) {
  root.dataset.theme = savedTheme;
}

if (["#customize", "#sources"].includes(location.hash)) {
  history.replaceState(null, "", "#overview");
}

function setTopbarOffset() {
  const height = Math.ceil(topbar?.getBoundingClientRect().height || 67);
  document.body.style.setProperty("--topbar-offset", `${height}px`);
}

setTopbarOffset();

if ("ResizeObserver" in window && topbar) {
  new ResizeObserver(setTopbarOffset).observe(topbar);
}

window.addEventListener("resize", setTopbarOffset);

function setNavCollapsed(isCollapsed, persist = true) {
  document.body.classList.toggle("nav-collapsed", isCollapsed);
  navToggle.setAttribute("aria-expanded", String(!isCollapsed));
  navToggle.setAttribute("aria-label", isCollapsed ? "Show navigation" : "Hide navigation");
  sidebar.setAttribute("aria-hidden", String(isCollapsed));
  if ("inert" in sidebar) {
    sidebar.inert = isCollapsed;
  }
  if (persist) {
    localStorage.setItem("guide-nav-collapsed", isCollapsed ? "true" : "false");
  }
}

setNavCollapsed(localStorage.getItem("guide-nav-collapsed") === "true", false);

const navEntries = navLinks.map((link, index) => ({
  href: link.getAttribute("href"),
  index,
  section: link.dataset.section,
  title: link.dataset.title || link.textContent.trim()
}));

function setActiveNav(hash) {
  navLinks.forEach((item) => item.classList.toggle("active", item.getAttribute("href") === hash));
}

function getSectionFromHash(hash) {
  if (!hash || !hash.startsWith("#")) return null;
  return document.getElementById(decodeURIComponent(hash.slice(1)));
}

function scrollToSection(hash, updateHash = true) {
  const target = getSectionFromHash(hash);
  if (!target) return false;
  setTopbarOffset();
  const topbarHeight = Math.ceil(topbar?.getBoundingClientRect().height || 0);
  const targetTop = target.getBoundingClientRect().top + window.scrollY - topbarHeight - 22;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  if (updateHash && location.hash !== hash) {
    history.pushState(null, "", hash);
  }
  return true;
}

function closestElement(target, selector) {
  return target instanceof Element ? target.closest(selector) : target?.parentElement?.closest(selector);
}

function makeNavLink(entry) {
  const link = document.createElement("a");
  link.href = entry.href;
  link.dataset.section = entry.section;
  link.dataset.title = entry.title;
  link.title = entry.title;
  link.textContent = entry.title;
  return link;
}

function renderNavigation(sortMode = "section") {
  const activeHref = document.querySelector(".sidebar a.active")?.getAttribute("href") || location.hash || "#overview";
  navList.replaceChildren();
  const groups = sortMode === "title"
    ? [["Title A-Z", [...navEntries].sort((a, b) => a.title.localeCompare(b.title))]]
    : [...new Set(navEntries.map((entry) => entry.section))].map((section) => [
        section,
        navEntries.filter((entry) => entry.section === section).sort((a, b) => a.index - b.index)
      ]);

  groups.forEach(([groupTitle, entries]) => {
    const group = document.createElement("div");
    group.className = "nav-group";
    group.dataset.navGroup = groupTitle;
    const heading = document.createElement("h2");
    heading.textContent = groupTitle;
    group.append(heading);
    entries.forEach((entry) => group.append(makeNavLink(entry)));
    navList.append(group);
  });

  navLinks = [...document.querySelectorAll(".sidebar a")];
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === activeHref);
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const currentNavScroll = sidebar.scrollTop;
      const href = link.getAttribute("href");
      setActiveNav(href);
      scrollToSection(href);
      requestAnimationFrame(() => {
        sidebar.scrollTop = currentNavScroll;
      });
      window.setTimeout(() => {
        sidebar.scrollTop = currentNavScroll;
      }, 80);
    });
  });
}

navSortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navSortButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderNavigation(button.dataset.navSort);
  });
});

renderNavigation(localStorage.getItem("guide-nav-sort") || "section");
navSortButtons.forEach((button) => {
  button.classList.toggle("active", button.dataset.navSort === (localStorage.getItem("guide-nav-sort") || "section"));
  button.addEventListener("click", () => {
    localStorage.setItem("guide-nav-sort", button.dataset.navSort);
  });
});

window.addEventListener("load", () => {
  setTopbarOffset();
  if (getSectionFromHash(location.hash)) {
    window.setTimeout(() => {
      setActiveNav(location.hash);
      scrollToSection(location.hash, false);
    }, 80);
  }
});

window.addEventListener("popstate", () => {
  if (getSectionFromHash(location.hash)) {
    setActiveNav(location.hash);
    scrollToSection(location.hash, false);
  }
});

window.addEventListener("hashchange", () => {
  if (getSectionFromHash(location.hash)) {
    setActiveNav(location.hash);
    scrollToSection(location.hash, false);
  }
});

const checkboxKey = "entrata-guide-checks";
const savedChecks = JSON.parse(localStorage.getItem(checkboxKey) || "{}");
document.querySelectorAll(".checklist input[type='checkbox']").forEach((box, index) => {
  const key = `check-${index}`;
  box.checked = Boolean(savedChecks[key]);
  box.addEventListener("change", () => {
    savedChecks[key] = box.checked;
    localStorage.setItem(checkboxKey, JSON.stringify(savedChecks));
  });
});

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function clearMarks(section) {
  section.querySelectorAll("mark[data-search-mark]").forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent));
  });
}

function markMatches(section, query) {
  if (!query) return;
  const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "MARK"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return normalize(node.textContent).includes(query)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  const matches = [];
  while (walker.nextNode()) matches.push(walker.currentNode);
  matches.slice(0, 10).forEach((node) => {
    const text = node.textContent;
    const index = text.toLowerCase().indexOf(query);
    if (index < 0) return;
    const range = document.createRange();
    range.setStart(node, index);
    range.setEnd(node, index + query.length);
    const mark = document.createElement("mark");
    mark.dataset.searchMark = "true";
    range.surroundContents(mark);
  });
}

const searchIndex = sections.map((section) => {
  const title = section.querySelector("h1, h2")?.textContent.trim() || section.id;
  const label = section.querySelector(".section-label")?.textContent.trim() || "Guide section";
  const text = section.textContent.replace(/\s+/g, " ").trim();
  return {
    id: section.id,
    hash: `#${section.id}`,
    label,
    section,
    text,
    title,
    normalizedLabel: normalize(label),
    normalizedText: normalize(text),
    normalizedTitle: normalize(title)
  };
});

const searchTerms = [...new Set(searchIndex.flatMap((entry) =>
  `${entry.title} ${entry.label} ${entry.text}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 3)
))].sort();

function getSearchScore(entry, query) {
  const words = query.split(" ").filter(Boolean);
  if (!words.length) return 0;
  const wholeQueryScore =
    (entry.normalizedTitle.includes(query) ? 90 : 0) +
    (entry.normalizedLabel.includes(query) ? 45 : 0) +
    (entry.normalizedText.includes(query) ? 20 : 0);
  const wordScore = words.reduce((score, word) => {
    if (entry.normalizedTitle.includes(word)) return score + 30;
    if (entry.normalizedLabel.includes(word)) return score + 16;
    if (entry.normalizedText.includes(word)) return score + 7;
    return score;
  }, 0);
  return words.every((word) => entry.normalizedText.includes(word))
    ? wholeQueryScore + wordScore
    : wholeQueryScore;
}

function makeSnippet(text, query) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  const index = cleanText.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) {
    return cleanText.length > 150 ? `${cleanText.slice(0, 150)}...` : cleanText;
  }
  const start = Math.max(0, index - 58);
  const end = Math.min(cleanText.length, index + query.length + 92);
  return `${start > 0 ? "..." : ""}${cleanText.slice(start, end)}${end < cleanText.length ? "..." : ""}`;
}

function getEditDistance(first, second) {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  const current = Array(second.length + 1).fill(0);
  for (let i = 1; i <= first.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= second.length; j += 1) {
      current[j] = first[i - 1] === second[j - 1]
        ? previous[j - 1]
        : Math.min(previous[j - 1], previous[j], current[j - 1]) + 1;
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[second.length];
}

function getSuggestions(query) {
  const queryWords = query.split(" ").filter(Boolean);
  const termToCheck = queryWords.at(-1) || query;
  if (termToCheck.length < 3) return [];
  return searchTerms
    .map((term) => {
      const distance = Math.abs(term.length - termToCheck.length) > 4 ? 9 : getEditDistance(termToCheck, term);
      const startsWith = term.startsWith(termToCheck) || termToCheck.startsWith(term);
      const includes = term.includes(termToCheck) || termToCheck.includes(term);
      return {
        term,
        score: (startsWith ? 0 : includes ? 1 : distance) + Math.abs(term.length - termToCheck.length) / 10
      };
    })
    .filter((item) => item.score <= 2.6)
    .sort((a, b) => a.score - b.score || a.term.localeCompare(b.term))
    .slice(0, 6)
    .map((item) => item.term);
}

function showSearchPanel() {
  searchResults.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
}

function hideSearchPanel() {
  searchResults.hidden = true;
  searchInput.setAttribute("aria-expanded", "false");
}

function openSearchTarget(hash) {
  if (!scrollToSection(hash)) return;
  setActiveNav(hash);
  hideSearchPanel();
}

function runSearch() {
  const query = normalize(searchInput.value);
  sections.forEach((section) => {
    section.hidden = false;
    clearMarks(section);
  });

  document.body.classList.toggle("searching", Boolean(query));

  if (!query) {
    hideSearchPanel();
    searchResults.replaceChildren();
    return;
  }

  const results = searchIndex
    .map((entry) => ({ ...entry, score: getSearchScore(entry, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 8);

  searchResults.replaceChildren();

  if (results.length) {
    const summary = document.createElement("p");
    summary.className = "search-summary";
    summary.textContent = `${results.length} result${results.length === 1 ? "" : "s"} for "${searchInput.value.trim()}"`;
    const list = document.createElement("ul");
    list.className = "search-result-list";
    results.forEach((entry) => {
      markMatches(entry.section, query);
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-result";
      button.dataset.searchTarget = entry.hash;
      const label = document.createElement("span");
      label.textContent = entry.label;
      const title = document.createElement("strong");
      title.textContent = entry.title;
      const snippet = document.createElement("p");
      snippet.textContent = makeSnippet(entry.text, query);
      button.append(label, title, snippet);
      item.append(button);
      list.append(item);
    });
    searchResults.append(summary, list);
    showSearchPanel();
    return;
  }

  const empty = document.createElement("div");
  empty.className = "search-no-results";
  const suggestions = getSuggestions(query);
  const emptyMessage = document.createElement("p");
  emptyMessage.textContent = `No exact results for "${searchInput.value.trim()}". Check spelling or try a related term.`;
  empty.append(emptyMessage);
  if (suggestions.length) {
    const suggestionWrap = document.createElement("div");
    suggestionWrap.className = "search-suggestions";
    suggestions.forEach((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.suggestion = suggestion;
      button.textContent = suggestion;
      suggestionWrap.append(button);
    });
    empty.append(suggestionWrap);
  }
  searchResults.append(empty);
  showSearchPanel();
}

searchInput.addEventListener("input", runSearch);
searchInput.addEventListener("focus", () => {
  if (normalize(searchInput.value)) runSearch();
});
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideSearchPanel();
    return;
  }
  if (event.key === "Enter") {
    const firstResult = searchResults.querySelector("[data-search-target]");
    if (firstResult) {
      event.preventDefault();
      openSearchTarget(firstResult.dataset.searchTarget);
    }
  }
});

searchResults.addEventListener("click", (event) => {
  event.stopPropagation();
  const suggestion = closestElement(event.target, "[data-suggestion]");
  if (suggestion) {
    event.preventDefault();
    searchInput.value = suggestion.dataset.suggestion;
    runSearch();
    searchInput.focus();
    return;
  }
  const result = closestElement(event.target, "[data-search-target]");
  if (result) {
    event.preventDefault();
    openSearchTarget(result.dataset.searchTarget);
  }
});

document.addEventListener("click", (event) => {
  if (!closestElement(event.target, ".search-shell")) {
    hideSearchPanel();
  }
});

navToggle.addEventListener("click", () => {
  setNavCollapsed(!document.body.classList.contains("nav-collapsed"));
});

function setText(element, value) {
  if (element) element.textContent = value;
}

function renderBulletList(element, items = []) {
  if (!element) return;
  element.replaceChildren(...items.map((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  }));
}

function syncModalState() {
  const hasOpenModal = Boolean((imageLightbox && !imageLightbox.hidden) || (tileDetailModal && !tileDetailModal.hidden));
  document.body.classList.toggle("modal-open", hasOpenModal);
}

function getImageCaption(image) {
  const figure = image.closest("figure");
  const card = image.closest(".screenshot-card, .video-card");
  return figure?.querySelector("figcaption")?.textContent.trim()
    || card?.querySelector("h4, h3, strong")?.textContent.trim()
    || image.alt
    || "Guide image";
}

function openLightbox(image) {
  if (!imageLightbox || !lightboxImage) return;
  modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || "";
  setText(lightboxCaption, getImageCaption(image));
  imageLightbox.hidden = false;
  syncModalState();
  lightboxClose?.focus({ preventScroll: true });
}

function closeLightbox() {
  if (!imageLightbox || imageLightbox.hidden) return;
  imageLightbox.hidden = true;
  lightboxImage?.removeAttribute("src");
  syncModalState();
  modalReturnFocus?.focus?.({ preventScroll: true });
}

function getTileTitle(tile) {
  return tile.querySelector("h3, h4, strong")?.textContent.trim()
    || tile.getAttribute("aria-label")
    || "Guide detail";
}

function getTileBody(tile) {
  const paragraphs = [...tile.querySelectorAll("p")]
    .map((item) => item.textContent.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (paragraphs.length) {
    return paragraphs.slice(0, 2).join(" ");
  }

  const listItems = [...tile.querySelectorAll("li")]
    .map((item) => item.textContent.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (listItems.length) {
    return "Use this tile as a working checklist. Items that are incomplete, aging, missing an owner, or outside normal policy should be corrected before the workflow advances.";
  }

  return tile.textContent.replace(/\s+/g, " ").trim() || "Review this item in the context of the current section and confirm the next owner before moving on.";
}

function getTileGuidance(title, sectionTitle, tile) {
  const words = normalize(`${title} ${sectionTitle} ${tile.className} ${tile.dataset.status || ""}`);
  const generic = [
    "Confirm the audience, owner, sensitivity, final storage location, and expected next step before sharing.",
    "Look for duplicate files, stale versions, unclear permissions, missing meeting notes, and decisions that live only in chat.",
    "When permissions, retention, guest access, or records requirements are unclear, use your approved manager, site owner, or IT support path."
  ];

  if (words.includes("teams") || words.includes("chat") || words.includes("channel") || words.includes("post")) {
    return [
      "Use channel posts when the whole team may need the conversation later; use chat for short-lived or private coordination.",
      "Name the topic clearly, attach the file from the correct location, and summarize the decision in the thread.",
      "Move repeatable work into a channel, tab, Planner plan, Loop component, list, or SharePoint page instead of letting it stay buried in messages."
    ];
  }

  if (words.includes("meeting") || words.includes("call") || words.includes("calendar") || words.includes("recording") || words.includes("transcript")) {
    return [
      "Invite the right audience, include an agenda, attach the working file, and choose whether the meeting belongs in a channel.",
      "Capture decisions, owners, and due dates during the meeting so the recording or transcript is supporting evidence, not the only record.",
      "After the meeting, post a recap and move deliverables into OneDrive or SharePoint where collaborators can continue working."
    ];
  }

  if (words.includes("onedrive") || words.includes("personal") || words.includes("draft") || words.includes("my files")) {
    return [
      "Use OneDrive for files you own, private drafts, and limited collaboration before the content is ready for a team library.",
      "Move team-owned or long-lived content to SharePoint before the owner leaves, changes roles, or becomes a bottleneck.",
      "Check sharing links, version history, recycle bin, and sync health before recreating or resending files."
    ];
  }

  if (words.includes("sync") || words.includes("shortcut") || words.includes("offline") || words.includes("files on-demand")) {
    return [
      "Sync only the libraries or folders you need often; very large libraries can slow devices and confuse file ownership.",
      "Use Files On-Demand or Add shortcut to OneDrive when you need easy access without downloading everything.",
      "Resolve sync errors promptly and avoid editing duplicate local copies when a file is waiting to upload."
    ];
  }

  if (words.includes("share") || words.includes("link") || words.includes("permission") || words.includes("guest") || words.includes("external")) {
    return [
      "Prefer Specific people links for controlled collaboration and avoid broad links when files contain sensitive information.",
      "Choose view-only or edit deliberately, set expiration when appropriate, and confirm whether external sharing is allowed.",
      "Review who has access before forwarding links, especially when a file moved from OneDrive to SharePoint or Teams."
    ];
  }

  if (words.includes("sharepoint") || words.includes("site") || words.includes("library") || words.includes("intranet")) {
    return [
      "Use SharePoint for team-owned content, official files, pages, lists, and information that needs a durable home.",
      "Keep libraries organized with metadata, views, naming standards, and ownership instead of deep folder sprawl.",
      "Publish pages and news only when content has an owner, audience, review cycle, and source of truth."
    ];
  }

  if (words.includes("version") || words.includes("recovery") || words.includes("restore") || words.includes("recycle") || words.includes("deleted")) {
    return [
      "Check version history before rebuilding a document or asking others to send old copies.",
      "Use the recycle bin for recently deleted content and escalate quickly if a business-critical file is missing.",
      "Tell collaborators when you restore or roll back a file so active edits do not get overwritten."
    ];
  }

  if (words.includes("list") || words.includes("metadata") || words.includes("view") || words.includes("column")) {
    return [
      "Use columns when people need to filter, group, sort, report, or automate the work.",
      "Create views for real audiences: active work, overdue items, my items, leadership summary, or archive.",
      "Avoid storing process status only in filenames when a list or library column can make the work visible."
    ];
  }

  if (words.includes("task") || words.includes("planner") || words.includes("loop") || words.includes("workflow") || words.includes("project")) {
    return [
      "Translate conversation into owners, due dates, task status, and a visible place for updates.",
      "Use the simplest tracking tool that the team will maintain: Planner, Lists, Loop, a channel post, or a shared document.",
      "Review aging tasks in meetings so updates happen in the source system instead of only in conversation."
    ];
  }

  if (words.includes("page") || words.includes("news") || words.includes("knowledge") || words.includes("publish")) {
    return [
      "Use pages for instructions, announcements, reference material, and process knowledge that people should read in context.",
      "Keep pages short, scannable, and linked to the files or lists that support the process.",
      "Add a review owner and refresh date so outdated guidance does not become the unofficial process."
    ];
  }

  if (words.includes("governance") || words.includes("retention") || words.includes("label") || words.includes("sensitivity") || words.includes("security") || words.includes("privacy")) {
    return [
      "Follow organizational rules for sensitivity labels, retention, guest access, meeting recordings, and records management.",
      "Keep business-critical content in team-owned locations with at least two owners.",
      "Clean stale links, old teams, duplicate libraries, and ownerless content on a regular schedule."
    ];
  }

  if (words.includes("troubleshoot") || words.includes("error") || words.includes("missing") || words.includes("problem")) {
    return [
      "Check whether the issue is access, sync, browser cache, desktop app state, a sharing link, or a policy restriction.",
      "Test from the web version before reinstalling apps or recreating files.",
      "Capture the file or meeting link, error message, browser/app version, and time of issue before contacting support."
    ];
  }

  if (words.includes("manager") || words.includes("approval") || words.includes("owner")) {
    return [
      "Managers should watch ownership, access, stale files, meeting discipline, and whether decisions are recorded where the team can find them.",
      "Review high-risk sharing, external guest workspaces, and ownerless teams before they become clean-up projects.",
      "Coach teams to use Microsoft 365 as a workflow system, not just a place to store files."
    ];
  }

  return generic;
}

function openTileDetail(tile) {
  if (!tileDetailModal) return;
  const section = tile.closest(".guide-section");
  const sectionTitle = section?.querySelector("h2")?.textContent.trim() || "Guide detail";
  const title = getTileTitle(tile);

  modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setText(tileDetailSection, sectionTitle);
  setText(tileDetailTitle, title);
  setText(tileDetailBody, getTileBody(tile));
  renderBulletList(tileDetailList, getTileGuidance(title, sectionTitle, tile));
  tileDetailModal.hidden = false;
  syncModalState();
  tileDetailClose?.focus({ preventScroll: true });
}

function closeTileDetail() {
  if (!tileDetailModal || tileDetailModal.hidden) return;
  tileDetailModal.hidden = true;
  syncModalState();
  modalReturnFocus?.focus?.({ preventScroll: true });
}

function setupImageLightbox() {
  const images = [...document.querySelectorAll("main img")];
  images.forEach((image) => {
    image.classList.add("clickable-media");
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Zoom image: ${getImageCaption(image)}`);
    image.addEventListener("click", (event) => {
      event.stopPropagation();
      openLightbox(image);
    });
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });
}

function setupClickableTiles() {
  const tileSelectors = [
    ".quick-grid > article",
    ".callout",
    ".decision-grid > article",
    ".approval-panel > article",
    ".approval-actions > article",
    ".expense-grid > article",
    ".principles > article",
    ".glossary > article",
    ".status-grid > article",
    ".match-grid > article",
    ".match-infographic > article",
    ".report-capabilities > article",
    ".report-grid > article",
    ".supplier-process > article",
    ".automation-flow > article",
    ".screenshot-card",
    ".video-card"
  ];
  const excludedSelectors = ".workflow-detail, .role-panel, .image-hotspot-detail, .status-detail, .report-tab-panel";
  const tiles = [...document.querySelectorAll(tileSelectors.join(","))]
    .filter((tile) => !tile.matches(excludedSelectors) && !tile.closest(excludedSelectors));

  tiles.forEach((tile) => {
    tile.classList.add("click-tile");
    tile.tabIndex = 0;
    tile.setAttribute("role", "button");
    tile.setAttribute("aria-label", `Open details: ${getTileTitle(tile)}`);
    tile.addEventListener("click", (event) => {
      if (closestElement(event.target, "a, button, input, select, textarea, label, summary, video, .clickable-media")) return;
      openTileDetail(tile);
    });
    tile.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target === tile) {
        event.preventDefault();
        openTileDetail(tile);
      }
    });
  });
}

setupImageLightbox();
setupClickableTiles();

imageLightbox?.addEventListener("click", (event) => {
  if (!closestElement(event.target, "#lightboxImage, .lightbox-close")) {
    closeLightbox();
  }
});

lightboxClose?.addEventListener("click", closeLightbox);

tileDetailModal?.addEventListener("click", (event) => {
  if (event.target === tileDetailModal) closeTileDetail();
});

tileDetailClose?.addEventListener("click", closeTileDetail);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (imageLightbox && !imageLightbox.hidden) {
    closeLightbox();
    return;
  }
  if (tileDetailModal && !tileDetailModal.hidden) {
    closeTileDetail();
  }
});

const workflowDetails = {
  plan: {
    number: "Step 1",
    title: "Plan the workspace",
    text: "Decide whether the work needs a Teams chat, Teams channel, OneDrive draft, SharePoint library, SharePoint list, or SharePoint page. Name the owner, audience, deadline, and final home before files scatter."
  },
  meet: {
    number: "Step 2",
    title: "Meet with a purpose",
    text: "Use Teams meetings for discussion that needs people together. Add an agenda, attach or link the working file, capture notes, and decide where the recording, transcript, recap, and action items should live."
  },
  draft: {
    number: "Step 3",
    title: "Draft in OneDrive",
    text: "Use OneDrive when one person owns the working copy or when a small group is shaping a draft. Share with specific people, use version history, and move the final file before ownership becomes unclear."
  },
  share: {
    number: "Step 4",
    title: "Collaborate in Teams",
    text: "Discuss the work in the right channel, keep the file attached from the correct location, and summarize decisions in the thread. Use chats for private or short-lived coordination only."
  },
  publish: {
    number: "Step 5",
    title: "Publish to SharePoint",
    text: "Move official team-owned content into a SharePoint library, page, news post, or list. Add metadata, permissions, and links so the content is findable and maintainable."
  },
  govern: {
    number: "Step 6",
    title: "Govern access and retention",
    text: "Review owners, sharing links, guests, sensitivity, retention, and stale content. Keep business records in team-owned locations and remove access that is no longer needed."
  },
  improve: {
    number: "Step 7",
    title: "Improve the workflow",
    text: "Use search, Teams activity, file activity, list views, feedback, and recurring cleanups to find friction. Turn repeated questions into pages, lists, templates, or channel norms."
  }
};

workflowButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const detail = workflowDetails[button.dataset.hotspot];
    workflowButtons.forEach((item) => item.classList.toggle("active", item === button));
    workflowStepNumber.textContent = detail.number;
    workflowStepTitle.textContent = detail.title;
    workflowStepText.textContent = detail.text;
  });
});

const roleDetails = {
  teams: {
    eyebrow: "Teams user",
    title: "Keep conversations actionable",
    text: "Teams users reduce scattered email by choosing the right place to talk. The goal is to make the team conversation searchable and connect it to shared files, notes, and tasks.",
    items: [
      "Use channel posts for topics the team needs to see later.",
      "Use chats for short-lived private coordination.",
      "Recap decisions, owners, and due dates in the thread."
    ]
  },
  onedrive: {
    eyebrow: "File owner",
    title: "Move drafts from personal to durable",
    text: "File owners should use OneDrive intentionally. It is excellent for personal work and small-group drafting, but final team content should not depend on one person's account.",
    items: [
      "Share with specific people when collaboration is limited.",
      "Use version history instead of saving many final-final copies.",
      "Move official content to SharePoint when the team owns it."
    ]
  },
  sharepoint: {
    eyebrow: "Site member",
    title: "Keep team knowledge findable",
    text: "SharePoint members help maintain the shared source of truth. Libraries, pages, lists, and news should make it easy for people to find current information without asking around.",
    items: [
      "Use metadata and views when folders are not enough.",
      "Keep pages linked to the files and lists that support the process.",
      "Ask site owners before changing permissions or structure."
    ]
  },
  manager: {
    eyebrow: "Manager",
    title: "Set habits that scale",
    text: "Managers should focus on access risk, clean meeting habits, ownerless content, stale sites, and whether decisions are being stored where the team can find them.",
    items: [
      "Review guest access, broad links, and sensitive files regularly.",
      "Make meeting recaps, task owners, and final file locations non-negotiable.",
      "Schedule cleanups for old teams, duplicate libraries, and inactive content."
    ]
  }
};

roleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const detail = roleDetails[button.dataset.roleTab];
    if (!detail) return;
    roleButtons.forEach((item) => item.classList.toggle("active", item === button));
    setText(rolePanelEyebrow, detail.eyebrow);
    setText(rolePanelTitle, detail.title);
    setText(rolePanelText, detail.text);
    renderBulletList(rolePanelList, detail.items);
  });
});

const imageHotspotDetails = {
  rail: {
    eyebrow: "App rail",
    title: "Start from the workspace, not the app icon",
    text: "The left app rail gives quick access to Activity, Chat, Teams, Calendar, Calls, Files, and pinned apps. Choose the app based on the work: conversation, meeting, file, task, or reference."
  },
  channel: {
    eyebrow: "Team and channel",
    title: "Use channels for shared context",
    text: "Channels are best when a group needs to follow a topic over time. They keep posts, meetings, files, tabs, and decisions together so new team members can understand the history."
  },
  posts: {
    eyebrow: "Posts",
    title: "Write posts like durable notes",
    text: "A good channel post has a clear subject, one topic, named owners, links to the right files, and a decision or next step. Replies should stay threaded so search results make sense."
  },
  files: {
    eyebrow: "Files tab",
    title: "Channel files are SharePoint files",
    text: "Files shared in a standard channel live in the connected SharePoint site. Use the Files tab for team-owned files and open in SharePoint when you need library views, metadata, or advanced permissions."
  }
};

imageHotspotButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const detail = imageHotspotDetails[button.dataset.imageHotspot];
    if (!detail) return;
    imageHotspotButtons.forEach((item) => item.classList.toggle("active", item === button));
    setText(hotspotEyebrow, detail.eyebrow);
    setText(hotspotTitle, detail.title);
    setText(hotspotText, detail.text);
  });
});

mediaButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.mediaTab;
    const group = button.closest(".media-tabs");
    const scopedButtons = group ? [...group.querySelectorAll("[data-media-tab]")] : mediaButtons;
    const scopedPanels = group ? [...group.querySelectorAll("[data-media-panel]")] : mediaPanels;
    scopedButtons.forEach((item) => item.classList.toggle("active", item === button));
    scopedPanels.forEach((panel) => {
      const isActive = panel.dataset.mediaPanel === target;
      panel.hidden = !isActive;
      panel.classList.toggle("active", isActive);
      if (!isActive) {
        panel.querySelectorAll("video").forEach((video) => video.pause());
      }
    });
  });
});

const statusDetails = {
  specific: {
    eyebrow: "Specific people",
    title: "Best for controlled collaboration",
    text: "Use Specific people links when you know exactly who needs access. This reduces accidental forwarding risk and is usually the safest default for sensitive or draft content."
  },
  org: {
    eyebrow: "Organization link",
    title: "Useful for broad internal access",
    text: "Organization links can be useful for internal announcements and reference files, but they may expose content to more people than intended. Use them only when broad internal visibility is acceptable."
  },
  team: {
    eyebrow: "Existing access",
    title: "Best when permissions are already correct",
    text: "Use links for people with existing access when the file already lives in the right Team or SharePoint site. This avoids creating extra sharing links while still giving people a direct path."
  },
  external: {
    eyebrow: "External guest",
    title: "Requires extra care",
    text: "External sharing depends on your organization's policies. Confirm the recipient, business purpose, expiration, edit rights, and whether the content should instead be shared through a formal guest workspace."
  },
  view: {
    eyebrow: "View only",
    title: "Use when people should not change the file",
    text: "View-only links are best for reference, review, announcements, and published documents. They help protect content when edits should flow through an owner or approval process."
  },
  edit: {
    eyebrow: "Can edit",
    title: "Use only when collaboration is intended",
    text: "Edit access lets recipients change the file. Use it for active collaboration, clarify expectations, and rely on version history when changes need to be compared or restored."
  },
  expire: {
    eyebrow: "Expire link",
    title: "Reduce long-term access risk",
    text: "Expiration dates are useful for temporary projects, external collaboration, review cycles, and short-term file requests. Expiring links do not replace the need to remove access that is no longer appropriate."
  }
};

statusChoiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const detail = statusDetails[button.dataset.statusChoice];
    if (!detail) return;
    statusChoiceButtons.forEach((item) => item.classList.toggle("active", item === button));
    setText(statusDetailEyebrow, detail.eyebrow);
    setText(statusDetailTitle, detail.title);
    setText(statusDetailText, detail.text);
  });
});

const reportDetails = {
  project: {
    eyebrow: "Project launch",
    title: "Create one shared project home",
    text: "Use Teams for conversation and meetings, SharePoint for official files and pages, and OneDrive only for personal drafts before the team takes ownership.",
    items: [
      "Create or choose the Team/channel before documents multiply.",
      "Store final files in the connected SharePoint library.",
      "Use a list or Planner plan for owners, status, dates, and blockers."
    ]
  },
  meeting: {
    eyebrow: "Meeting recap",
    title: "Turn discussion into searchable follow-up",
    text: "A productive meeting leaves a clear trail: decision, owner, due date, file link, and next checkpoint.",
    items: [
      "Post the recap in the Teams channel or shared chat.",
      "Attach notes and files from the final storage location.",
      "Convert action items into Planner, Loop, Lists, or another tracked owner list."
    ]
  },
  cleanup: {
    eyebrow: "File cleanup",
    title: "Reduce duplicate and stale content",
    text: "Cleanup is easier when owners review locations regularly rather than waiting until search results are unusable.",
    items: [
      "Find duplicates, ownerless files, old sharing links, and abandoned drafts.",
      "Move final versions to team-owned SharePoint libraries.",
      "Archive or delete content according to retention and records rules."
    ]
  },
  intranet: {
    eyebrow: "Intranet update",
    title: "Publish information people can trust",
    text: "Use SharePoint pages and news for official guidance, announcements, policies, and reference information that should be easy to find.",
    items: [
      "Confirm the owner, audience, review date, and source materials.",
      "Use headings, links, and summaries so people can scan quickly.",
      "Retire outdated pages instead of leaving conflicting guidance online."
    ]
  }
};

reportTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const detail = reportDetails[button.dataset.reportTab];
    if (!detail) return;
    reportTabButtons.forEach((item) => item.classList.toggle("active", item === button));
    setText(reportPanelEyebrow, detail.eyebrow);
    setText(reportPanelTitle, detail.title);
    setText(reportPanelText, detail.text);
    renderBulletList(reportPanelList, detail.items);
  });
});

window.addEventListener("scroll", () => {
  toTop.classList.toggle("visible", window.scrollY > 700);
}, { passive: true });

toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

expandAll.addEventListener("click", () => {
  const details = [...document.querySelectorAll("details")];
  const shouldOpen = details.some((item) => !item.open);
  details.forEach((item) => {
    item.open = shouldOpen;
  });
});

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "" : "dark";
  if (next) {
    root.dataset.theme = next;
    localStorage.setItem("guide-theme", next);
  } else {
    delete root.dataset.theme;
    localStorage.removeItem("guide-theme");
  }
});

printButton.addEventListener("click", () => {
  window.print();
});
