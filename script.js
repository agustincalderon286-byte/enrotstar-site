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

const ENROTSTAR_RECRUITMENT = {
  defaultCoachApiBase: "https://ventas-ia.onrender.com",
  defaultShareCode: "7d637252",
};

let googleAdsTrackingPromise = null;

function getGoogleAdsTrackingUrl() {
  if (document.currentScript?.src) {
    return new URL("google-ads-tracking.js", document.currentScript.src).toString();
  }

  return `${window.location.origin}/google-ads-tracking.js`;
}

function ensureGoogleAdsTracking() {
  if (typeof window.enrotstarTrackGoogleAdsConversion === "function") {
    return Promise.resolve(window.ENROTSTAR_GOOGLE_ADS || null);
  }

  if (googleAdsTrackingPromise) {
    return googleAdsTrackingPromise;
  }

  googleAdsTrackingPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[data-enrotstar-google-ads="true"]');

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.ENROTSTAR_GOOGLE_ADS || null), {
        once: true,
      });
      existingScript.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = getGoogleAdsTrackingUrl();
    script.dataset.enrotstarGoogleAds = "true";
    script.addEventListener("load", () => resolve(window.ENROTSTAR_GOOGLE_ADS || null), {
      once: true,
    });
    script.addEventListener("error", () => resolve(null), { once: true });
    document.head.appendChild(script);
  });

  return googleAdsTrackingPromise;
}

function fireGoogleAdsConversion(conversionKey, callback) {
  const done = typeof callback === "function" ? callback : () => {};

  if (typeof window.enrotstarTrackGoogleAdsConversion === "function") {
    window.enrotstarTrackGoogleAdsConversion(conversionKey, { callback: done });
    return;
  }

  ensureGoogleAdsTracking().then(() => {
    if (typeof window.enrotstarTrackGoogleAdsConversion === "function") {
      window.enrotstarTrackGoogleAdsConversion(conversionKey, { callback: done });
      return;
    }

    done();
  });
}

function getRecruitmentConfig() {
  const body = document.body;
  const apiBase = String(body?.dataset.coachApiBase || ENROTSTAR_RECRUITMENT.defaultCoachApiBase)
    .trim()
    .replace(/\/+$/, "");
  const shareCode = String(
    body?.dataset.coachRecruitmentShareCode || ENROTSTAR_RECRUITMENT.defaultShareCode
  ).trim();

  return {
    apiBase,
    shareCode,
    endpoint:
      apiBase && shareCode
        ? `${apiBase}/api/public/recruitment-share/${encodeURIComponent(shareCode)}/applications`
        : "",
  };
}

function getNamedFieldValue(form, names = []) {
  for (const name of names) {
    const field = form.querySelector(`[name="${name}"]`);

    if (!field) {
      continue;
    }

    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      return field.checked ? String(field.value || "si").trim() : "";
    }

    return String(field.value || "").trim();
  }

  return "";
}

function getSelectedFileNames(form) {
  return Array.from(form.querySelectorAll('input[type="file"]')).flatMap((input) =>
    Array.from(input.files || [])
      .map((file) => String(file.name || "").trim())
      .filter(Boolean)
  );
}

function readCampaignTrackingParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get("utm_source")?.trim() || "",
    utmMedium: params.get("utm_medium")?.trim() || "",
    utmCampaign: params.get("utm_campaign")?.trim() || "",
    utmTerm: params.get("utm_term")?.trim() || "",
    utmContent: params.get("utm_content")?.trim() || "",
    gclid: params.get("gclid")?.trim() || "",
    fbclid: params.get("fbclid")?.trim() || "",
    ttclid: params.get("ttclid")?.trim() || "",
  };
}

function inferRecruitmentSource(tracking) {
  if (tracking.utmSource) {
    return tracking.utmSource.toLowerCase();
  }

  if (tracking.gclid) {
    return "google_ads";
  }

  if (tracking.fbclid) {
    return "facebook_ads";
  }

  if (tracking.ttclid) {
    return "tiktok_ads";
  }

  return "enrotstar_site";
}

function buildRecruitmentPayload(form) {
  const tracking = readCampaignTrackingParams();
  const role = getNamedFieldValue(form, ["Cargo", "Vacante de interes"]);
  const city = getNamedFieldValue(form, ["Ciudad o zona"]);
  const zipCode = getNamedFieldValue(form, ["Codigo postal"]);
  const experience = getNamedFieldValue(form, ["Experiencia"]);
  const fileNames = getSelectedFileNames(form);
  const aboutParts = [];

  if (experience) {
    aboutParts.push(experience);
  }

  if (fileNames.length) {
    aboutParts.push(`Archivos seleccionados: ${fileNames.join(", ")}`);
  }

  return {
    fullName: getNamedFieldValue(form, ["Nombre"]),
    phone: getNamedFieldValue(form, ["Telefono"]),
    email: getNamedFieldValue(form, ["Correo electronico"]),
    positionApplied: role,
    workPreference: role,
    city,
    zipCode,
    about: aboutParts.join("\n\n"),
    source: inferRecruitmentSource(tracking),
    sourceDetail: window.location.pathname,
    landingPageUrl: window.location.href,
    referrerUrl: document.referrer || "",
    pageTitle: document.title || "",
    website: getNamedFieldValue(form, ["Website", "Empresa"]),
    ...tracking,
  };
}

async function submitRecruitmentForm(form, status, fileCount) {
  const config = getRecruitmentConfig();
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton?.textContent || "";

  if (!config.endpoint) {
    throw new Error("La captura de reclutamiento no esta configurada.");
  }

  const payload = buildRecruitmentPayload(form);

  if (!payload.fullName) {
    throw new Error("Escribe tu nombre.");
  }

  if (!payload.phone && !payload.email) {
    throw new Error("Comparte tu telefono o tu correo.");
  }

  if (status) {
    status.textContent = "Guardando tu solicitud...";
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
  }

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "No pude guardar tu solicitud.");
    }

    form.reset();

    if (fileCount) {
      fileCount.textContent = "0 archivo(s) seleccionado(s)";
    }

    if (status) {
      status.textContent =
        "Tu solicitud ya quedo registrada. Nuestro equipo la revisara y te contactara pronto.";
    }

    fireGoogleAdsConversion("jobApplication");
    return data;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel || "Enviar";
    }
  }
}

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
      const kind = form.dataset.formType || "contacto";

      if (kind === "empleo") {
        submitRecruitmentForm(form, status, fileCount).catch((error) => {
          if (status) {
            status.textContent = error.message || "No pude guardar tu solicitud.";
          }
        });
        return;
      }

      const message = getWhatsAppMessage(form);
      const url = `https://wa.me/${ENROTSTAR_SITE.phoneRaw}?text=${encodeURIComponent(message)}`;
      let hasOpened = false;

      const openWhatsApp = () => {
        if (hasOpened) return;
        hasOpened = true;
        window.open(url, "_blank", "noopener");
      };

      if (status) {
        status.textContent = "Abriendo WhatsApp...";
      }

      window.setTimeout(openWhatsApp, 900);
      fireGoogleAdsConversion(kind === "empleo" ? "jobApplication" : "whatsappContact", openWhatsApp);
    });
  });
}

function setupTrackedContactLinks() {
  const links = document.querySelectorAll('a[href^="tel:"], a[href*="wa.me/"]');

  links.forEach((link) => {
    if (link.dataset.googleAdsTracked === "true") {
      return;
    }

    link.dataset.googleAdsTracked = "true";
    link.addEventListener("click", () => {
      const href = link.getAttribute("href") || "";
      fireGoogleAdsConversion(href.startsWith("tel:") ? "phoneClick" : "whatsappContact");
    });
  });
}

ensureGoogleAdsTracking();
injectSharedChrome();
setupMenuToggle();
setupWhatsAppForms();
setupTrackedContactLinks();
