window.ENROTSTAR_GOOGLE_ADS = {
  googleTagId: "AW-644015086",
  conversions: {
    jobApplication: {
      sendTo: "AW-644015086/VdobCILbo5gcEO7Hi7MC"
    },
    whatsappContact: {
      sendTo: "AW-644015086/ionjCIXbo5gcEO7Hi7MC"
    },
    phoneClick: {
      sendTo: "AW-644015086/8HodCIjbo5gcEO7Hi7MC"
    }
  }
};

(function initEnrotStarGoogleAdsTracking(config) {
  if (!config || !config.googleTagId) {
    return;
  }

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  const existingLoader = document.querySelector(
    'script[data-google-ads-tag="' + config.googleTagId + '"]'
  );

  if (!existingLoader) {
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(config.googleTagId);
    script.dataset.googleAdsTag = config.googleTagId;
    document.head.appendChild(script);
  }

  window.gtag("js", new Date());
  window.gtag("config", config.googleTagId);

  window.enrotstarTrackGoogleAdsConversion = function enrotstarTrackGoogleAdsConversion(
    conversionKey,
    options
  ) {
    const callback = options && typeof options.callback === "function" ? options.callback : null;
    const conversion = config.conversions && config.conversions[conversionKey];

    if (!conversion || !conversion.sendTo || typeof window.gtag !== "function") {
      if (callback) callback();
      return;
    }

    let callbackCalled = false;
    const done = function done() {
      if (callbackCalled) return;
      callbackCalled = true;
      if (callback) callback();
    };

    window.gtag("event", "conversion", {
      send_to: conversion.sendTo,
      value: 1,
      currency: "USD",
      event_callback: done
    });

    window.setTimeout(done, 800);
  };
})(window.ENROTSTAR_GOOGLE_ADS);
