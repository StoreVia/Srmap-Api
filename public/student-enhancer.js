(function () {
  "use strict";

  (function blockGeolocationPrompt() {
    const deniedError = {
      code: 1,
      message: "User denied Geolocation",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    try {
      if (window.navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition = function (success, error) {
          if (typeof error === "function") error(deniedError);
        };
        navigator.geolocation.watchPosition = function (success, error) {
          if (typeof error === "function") error(deniedError);
          return 0;
        };
      }
    } catch (e) {}
  })();

  const STORAGE_KEY_USER = "srm_enhancer_user";
  const STORAGE_KEY_PASS = "srm_enhancer_pass";
  const DEFAULT_AVATAR_SVG =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

  function injectEnhancerStyles() {
    if (document.getElementById("srm-enhancer-styles")) return;

    const style = document.createElement("style");
    style.id = "srm-enhancer-styles";
    style.textContent = `
      html, body {
        overflow-x: hidden !important;
        max-width: 100vw !important;
      }

      .top_nav .nav_menu {
        position: relative !important;
      }

      .nav.navbar-right, .top_nav .navbar-right {
        float: right !important;
        margin-right: 15px !important;
      }

      .dropdown-menu.srm-enhanced-menu, .user-profile + .dropdown-menu {
        right: 0 !important;
        left: auto !important;
        min-width: 160px !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
        border-radius: 8px !important;
        padding: 6px 0 !important;
      }

      .dropdown-menu.srm-enhanced-menu.show {
        display: block !important;
      }

      @media (max-width: 767px) {
        .srm-table-wrapper, .table-responsive {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: auto !important;
          overflow-y: visible !important;
          -webkit-overflow-scrolling: touch !important;
          touch-action: pan-y pan-x !important;
          display: block !important;
          margin-bottom: 15px !important;
          box-sizing: border-box !important;
          border-radius: 6px;
        }

        .srm-table-wrapper > table, .table-responsive > table {
          min-width: 550px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function replaceFooter() {
    const allDivs = document.querySelectorAll("div, footer, p, span");
    allDivs.forEach((el) => {
      if (el.children.length === 0 && el.textContent && el.textContent.includes("Firstline Infotech")) {
        el.innerHTML =
          'Developed by: <a href="https://srmapi.mrpan.in" target="_blank" style="color: #60a5fa; text-decoration: underline;">Srmapi</a>, <a href="https://srmapi.mrpan.in" target="_blank" style="color: #60a5fa; text-decoration: underline;">https://srmapi.mrpan.in</a>';
      } else if (el.classList.contains("navbar-fixed-bottom") && el.textContent.includes("Firstline Infotech")) {
        el.innerHTML =
          'Developed by: <a href="https://srmapi.mrpan.in" target="_blank" style="color: #60a5fa; text-decoration: underline;">Srmapi</a>, <a href="https://srmapi.mrpan.in" target="_blank" style="color: #60a5fa; text-decoration: underline;">https://srmapi.mrpan.in</a>';
      }
    });
  }

  function wrapScrollableTables() {
    const tables = document.querySelectorAll("table");
    tables.forEach((table) => {
      const parent = table.parentElement;
      if (!parent) return;

      const isAlreadyWrapped =
        parent.classList.contains("srm-table-wrapper") ||
        parent.classList.contains("table-responsive") ||
        window.getComputedStyle(parent).overflowX === "auto" ||
        window.getComputedStyle(parent).overflowX === "scroll";

      if (!isAlreadyWrapped) {
        const wrapper = document.createElement("div");
        wrapper.className = "srm-table-wrapper";
        parent.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }

  function enhanceExistingProfileAndLogout() {
    const duplicateWidget = document.getElementById("srm-top-profile-widget");
    if (duplicateWidget) duplicateWidget.remove();

    let validPhotoSrc = null;
    const photoImgs = document.querySelectorAll('img[src*="resources/photos/"], img[src*="photos/"]');
    for (let img of photoImgs) {
      if (img.src && !img.src.includes("img.jpg")) {
        validPhotoSrc = img.src;
        break;
      }
    }

    const brokenImgs = document.querySelectorAll(
      'img[src*="images/img.jpg"], img[src*="img.jpg"], img[src$="img.jpg"]'
    );
    brokenImgs.forEach((img) => {
      img.src = validPhotoSrc || DEFAULT_AVATAR_SVG;
    });

    const profileTriggers = document.querySelectorAll(
      ".user-profile, .profile_info, a[data-toggle='dropdown'], li.dropdown > a"
    );

    profileTriggers.forEach((trigger) => {
      const img = trigger.querySelector("img");
      if (img && (!img.src || img.src.includes("img.jpg"))) {
        img.src = validPhotoSrc || DEFAULT_AVATAR_SVG;
      }

      const parentLi = trigger.closest("li") || trigger.parentElement;
      if (!parentLi) return;

      let dropdownMenu = parentLi.querySelector(".dropdown-menu, .dropdown-usermenu");
      if (!dropdownMenu) {
        dropdownMenu = document.createElement("ul");
        dropdownMenu.className = "dropdown-menu dropdown-usermenu pull-right srm-enhanced-menu";
        parentLi.appendChild(dropdownMenu);
      } else {
        dropdownMenu.classList.add("srm-enhanced-menu");
      }

      const existingLinks = Array.from(dropdownMenu.querySelectorAll("a"));
      const hasLogout = existingLinks.some(
        (a) =>
          (a.href && a.href.includes("StudentLogout")) ||
          a.textContent.toLowerCase().includes("log out") ||
          a.textContent.toLowerCase().includes("logout")
      );

      if (!hasLogout) {
        const logoutLi = document.createElement("li");
        logoutLi.innerHTML = `
          <a href="/student/srmapstudentcorner/StudentLogout" style="color: #dc2626 !important; font-weight: 600; padding: 10px 16px; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log Out
          </a>
        `;
        dropdownMenu.appendChild(logoutLi);
      }

      if (!trigger.dataset.srmHandlerAttached) {
        trigger.dataset.srmHandlerAttached = "true";
        trigger.addEventListener("click", function (e) {
          e.stopPropagation();
          const isCurrentlyVisible =
            dropdownMenu.classList.contains("show") || window.getComputedStyle(dropdownMenu).display === "block";

          document.querySelectorAll(".dropdown-menu").forEach((m) => {
            m.classList.remove("show");
            m.style.display = "";
          });

          if (!isCurrentlyVisible) {
            dropdownMenu.classList.add("show");
            dropdownMenu.style.display = "block";
          }
        });
      }
    });

    if (!window.srmOutsideClickListenerAttached) {
      window.srmOutsideClickListenerAttached = true;
      document.addEventListener("click", function () {
        document.querySelectorAll(".dropdown-menu").forEach((m) => {
          m.classList.remove("show");
          m.style.display = "";
        });
      });
    }
  }

  function initLoginEnhancements() {
    const ccodeInput = document.getElementById("ccode");
    const userInput = document.getElementById("UserName");
    const passInput = document.getElementById("AuthKey");
    const loginForm = document.getElementById("frmSL");

    if (!ccodeInput || !loginForm) return;

    if (userInput && passInput) {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      const savedPass = localStorage.getItem(STORAGE_KEY_PASS);

      if (savedUser && !userInput.value) userInput.value = savedUser;
      if (savedPass && !passInput.value) passInput.value = savedPass;
    }

    loginForm.addEventListener(
      "submit",
      function () {
        if (userInput && userInput.value) {
          localStorage.setItem(STORAGE_KEY_USER, userInput.value);
        }
        if (passInput && passInput.value && passInput.value !== ".......") {
          localStorage.setItem(STORAGE_KEY_PASS, passInput.value);
        }
      },
      true
    );

    const captchaImg = document.querySelector('img[src*="captchas"]');
    if (!captchaImg) return;

    const statusBadge = document.createElement("span");
    statusBadge.id = "srm-captcha-status";
    statusBadge.style.cssText = "margin-left: 8px; font-weight: 500; font-size: 12px; vertical-align: middle;";
    captchaImg.parentNode.insertBefore(statusBadge, captchaImg.nextSibling);

    async function solveCurrentCaptcha() {
      statusBadge.textContent = "";

      try {
        const canvas = document.createElement("canvas");
        canvas.width = captchaImg.naturalWidth || 120;
        canvas.height = captchaImg.naturalHeight || 25;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(captchaImg, 0, 0);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("Failed to capture captcha image.");

        const formData = new FormData();
        formData.append("file", blob, "captcha.png");

        const response = await fetch("/api/captcha/solve", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`Server returned ${response.status}`);

        const solvedText = (await response.text()).trim();

        if (solvedText) {
          ccodeInput.value = solvedText;
          ccodeInput.dispatchEvent(new Event("input", { bubbles: true }));
          statusBadge.textContent = "";
        } else {
          throw new Error("Empty captcha text");
        }
      } catch (err) {
        statusBadge.textContent = "❌ Captcha auto-solve failed";
        statusBadge.style.color = "#dc2626";
      }
    }

    if (captchaImg.complete && captchaImg.naturalWidth > 0) {
      solveCurrentCaptcha();
    } else {
      captchaImg.addEventListener("load", solveCurrentCaptcha);
    }

    captchaImg.style.cursor = "pointer";
    captchaImg.title = "Click to refresh captcha";
    captchaImg.addEventListener("click", function () {
      ccodeInput.value = "";
      captchaImg.src = "/student/srmapstudentcorner/captchas?" + new Date().getTime();
    });
  }

  function runEnhancerPasses() {
    replaceFooter();
    wrapScrollableTables();
    enhanceExistingProfileAndLogout();
  }

  function initEnhancer() {
    injectEnhancerStyles();
    runEnhancerPasses();
    initLoginEnhancements();

    const observer = new MutationObserver(function () {
      runEnhancerPasses();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEnhancer);
  } else {
    initEnhancer();
  }
})();