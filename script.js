const ENROTSTAR_SITE = {
  phoneRaw: "12245739444",
  phoneDisplay: "224 573 9444",
  address: "800 Enterprise Dr, Oak Brook, IL 60523, EE. UU.",
  logo: "https://img1.wsimg.com/isteam/ip/025dc71a-2735-4fd6-99f8-be8e0f11c960/blob-58e5e4f.png",
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/676483075558148" },
    { label: "Instagram", href: "https://www.instagram.com/enrotstar1_vip?igsh=ZHdybjFjeTU1ZHYw&utm_source=qr" },
    { label: "X", href: "https://www.x.com/enrotstar?s=21" },
    { label: "YouTube", href: "https://www.youtube.com/@enrotstar?si=sGBlqfaNKj9tMh2Y" }
  ],
  nav: [
    { key: "home", label: "Inicio", href: "/" },
    { key: "about", label: "Nosotros", href: "/nosotros/" },
    { key: "products", label: "Productos", href: "/productos/" },
    { key: "gallery", label: "Galeria", href: "/galeria/" },
    { key: "contact", label: "Contacto", href: "/contacto/" },
    { key: "careers", label: "Unete", href: "/unete-a-nosotros/" },
    { key: "promo", label: "Promo", href: "/promo/" }
  ]
};

function buildNav(currentPage) {
  return ENROTSTAR_SITE.nav
    .map(
      (item) =>
        `<a href="${item.href}" ${item.key === currentPage ? 'aria-current="page"' : ""}>${item.label}</a>`
    )
    .join("");
}

function buildSocials() {
  return ENROTSTAR_SITE.socials
    .map((item) => `<a href="${item.href}" target="_blank" rel="noopener">${item.label}</a>`)
    .join("");
}

function injectSharedChrome() {
  const currentPage = document.body.dataset.page || "";
  const headerSlots = document.querySelectorAll("[data-site-header]");
  const footerSlots = document.querySelectorAll("[data-site-footer]");

  headerSlots.forEach((slot) => {
    slot.innerHTML = `
      <header class="header-shell">
        <div class="container header-bar">
          <a class="brand" href="/">
            <img src="${ENROTSTAR_SITE.logo}" alt="Enrot Star" />
            <span class="footer-brand">
              <strong>Enrot Star</strong>
              <small>Perfeccion Extraordinaria</small>
            </span>
          </a>

          <nav class="desktop-nav" aria-label="Principal">
            ${buildNav(currentPage)}
          </nav>

          <div class="header-cta">
            <a class="btn btn-secondary" href="tel:${ENROTSTAR_SITE.phoneRaw}">${ENROTSTAR_SITE.phoneDisplay}</a>
            <a class="btn btn-primary" href="https://wa.me/${ENROTSTAR_SITE.phoneRaw}" target="_blank" rel="noopener">WhatsApp</a>
          </div>

          <button class="mobile-toggle" type="button" aria-label="Abrir menu" data-menu-toggle>Menu</button>
        </div>

        <div class="mobile-drawer">
          <div class="container mobile-drawer-inner">
            <nav class="mobile-nav" aria-label="Movil">
              ${buildNav(currentPage)}
            </nav>
            <div class="mobile-actions">
              <a class="btn btn-secondary" href="tel:${ENROTSTAR_SITE.phoneRaw}">${ENROTSTAR_SITE.phoneDisplay}</a>
              <a class="btn btn-primary" href="https://wa.me/${ENROTSTAR_SITE.phoneRaw}" target="_blank" rel="noopener">Escribenos por WhatsApp</a>
            </div>
          </div>
        </div>
      </header>
    `;
  });

  footerSlots.forEach((slot) => {
    slot.innerHTML = `
      <footer class="footer">
        <div class="container stack">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="brand-badge">
                <img src="${ENROTSTAR_SITE.logo}" alt="Enrot Star" />
                <div>
                  <strong>Enrot Star</strong>
                  <small>Oak Brook, Illinois</small>
                </div>
              </div>
              <p>Productos de cocina de alta gama, experiencias memorables y una marca enfocada en elegancia, servicio y crecimiento.</p>
              <p>${ENROTSTAR_SITE.address}</p>
              <p><a href="tel:${ENROTSTAR_SITE.phoneRaw}">${ENROTSTAR_SITE.phoneDisplay}</a></p>
            </div>

            <div class="stack">
              <div class="footer-links">
                ${buildNav(currentPage)}
                <a href="/reclutamiento/">Oportunidades</a>
              </div>
              <div class="social-row">
                ${buildSocials()}
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <p class="footer-note">Copyright © 2026 Enrot Star - All Rights Reserved.</p>
        </div>
      </footer>
    `;
  });
}

function setupMenuToggle() {
  const button = document.querySelector("[data-menu-toggle]");
  if (!button) return;

  button.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });
}

function getWhatsAppMessage(form) {
  const kind = form.dataset.formType || "contacto";
  const pairs = Array.from(form.querySelectorAll("[name]"))
    .map((field) => {
      if (field.type === "file") {
        return `${field.dataset.label || field.name}: ${field.files.length} archivo(s) seleccionado(s)`;
      }
      return `${field.dataset.label || field.name}: ${field.value.trim() || "-"}`;
    })
    .filter(Boolean);

  const intro =
    kind === "empleo"
      ? "Hola Enrot Star, quiero postularme a una vacante."
      : "Hola Enrot Star, quiero mas informacion.";

  const outro =
    kind === "empleo"
      ? "Adjuntare mi CV en el siguiente mensaje si es necesario."
      : "Me interesa recibir seguimiento por este medio.";

  return `${intro}\n\n${pairs.join("\n")}\n\n${outro}`;
}

function setupWhatsAppForms() {
  const forms = document.querySelectorAll("[data-whatsapp-form]");
  forms.forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    const fileInput = form.querySelector('input[type="file"]');
    const fileCount = form.querySelector("[data-file-count]");

    if (fileInput && fileCount) {
      fileInput.addEventListener("change", () => {
        fileCount.textContent = `${fileInput.files.length} archivo(s) seleccionado(s)`;
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = getWhatsAppMessage(form);
      const url = `https://wa.me/${ENROTSTAR_SITE.phoneRaw}?text=${encodeURIComponent(message)}`;

      if (status) {
        status.textContent = "Abriendo WhatsApp...";
      }

      window.open(url, "_blank", "noopener");
    });
  });
}

injectSharedChrome();
setupMenuToggle();
setupWhatsAppForms();
