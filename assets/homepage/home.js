(function () {
  "use strict";

  var metadata = {
    zh: {
      lang: "zh-CN",
      title: "HUARUI ZHANG",
      description: "张华睿的个人主页，记录 GNSS/INS、深度学习定位、智能车竞赛、中国机器人大赛暨 RoboCup 中国赛和嵌入式开发经历。",
      ogDescription: "GNSS/INS、深度学习定位、智能车竞赛与嵌入式开发经历。"
    },
    en: {
      lang: "en",
      title: "HUARUI ZHANG",
      description: "Huarui Zhang's research and competition work in GNSS/INS, learning-based positioning, intelligent cars, robotics, and embedded systems.",
      ogDescription: "Research and competition work in GNSS/INS, intelligent cars, robotics, and embedded systems."
    }
  };

  function readStoredLanguage() {
    try {
      return window.localStorage.getItem("homepage-language");
    } catch (error) {
      return null;
    }
  }

  function storeLanguage(language) {
    try {
      window.localStorage.setItem("homepage-language", language);
    } catch (error) {
      return;
    }
  }

  function initialLanguage() {
    var query = new URLSearchParams(window.location.search).get("lang");
    var stored = readStoredLanguage();

    if (query === "zh" || query === "en") {
      return query;
    }

    if (stored === "zh" || stored === "en") {
      return stored;
    }

    return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  function setMeta(selector, value) {
    var element = document.querySelector(selector);
    if (element) {
      element.setAttribute("content", value);
    }
  }

  function setLanguage(language, updateUrl) {
    var copy = metadata[language];

    document.documentElement.lang = copy.lang;
    document.title = copy.title;

    document.querySelectorAll(".i18n").forEach(function (element) {
      var value = element.dataset[language];
      if (value) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-lang-copy]").forEach(function (element) {
      element.hidden = element.dataset.langCopy !== language;
    });

    document.querySelectorAll("[data-lang-option]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.langOption === language));
    });

    setMeta('meta[name="description"]', copy.description);
    setMeta('meta[property="og:title"]', copy.title);
    setMeta('meta[property="og:description"]', copy.ogDescription);
    setMeta('meta[property="og:locale"]', language === "zh" ? "zh_CN" : "en_US");
    setMeta('meta[name="twitter:title"]', copy.title);
    setMeta('meta[name="twitter:description"]', copy.ogDescription);

    storeLanguage(language);

    if (updateUrl) {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", language);
      window.history.replaceState({}, "", url);
    }
  }

  document.querySelectorAll("[data-lang-option]").forEach(function (button) {
    button.addEventListener("click", function () {
      setLanguage(button.dataset.langOption, true);
    });
  });

  document.querySelectorAll("[data-carousel-direction]").forEach(function (button) {
    button.addEventListener("click", function () {
      var track = document.getElementById("news-track");
      var direction = Number(button.dataset.carouselDirection);
      track.scrollBy({ left: direction * 430, behavior: "smooth" });
    });
  });

  setLanguage(initialLanguage(), false);
})();
