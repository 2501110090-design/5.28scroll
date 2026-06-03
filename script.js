(function () {
  var revealGroups = Array.prototype.slice.call(document.querySelectorAll(".reveal-group"));
  var carouselSection = document.querySelector(".carousel-section");
  var carouselRing = document.querySelector("#carouselRing");
  var carouselProgress = document.querySelector("#carouselProgress");
  var orbitCards = Array.prototype.slice.call(document.querySelectorAll(".orbit-card"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealItems(group) {
    if (group.dataset.revealed === "true") {
      return;
    }

    group.dataset.revealed = "true";
    var items = Array.prototype.slice.call(group.querySelectorAll(".reveal-item"));

    items.forEach(function (item, index) {
      window.setTimeout(function () {
        item.classList.add("is-visible");
      }, reduceMotion ? 0 : index * 180);
    });
  }

  function showEverything() {
    document.querySelectorAll(".reveal-item").forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  function setupScrollMagicReveal() {
    if (reduceMotion) {
      showEverything();
      return;
    }

    setupAlwaysOnScrollFallback();

    if (!window.ScrollMagic) {
      return;
    }

    var controller = new ScrollMagic.Controller();

    setupScrollCarousel(controller);

    revealGroups.forEach(function (group) {
      new ScrollMagic.Scene({
        triggerElement: group,
        triggerHook: 0.82,
        reverse: false
      })
        .on("enter", function () {
          revealItems(group);
        })
        .addTo(controller);
    });

  }

  function setupScrollCarousel(controller) {
    if (!carouselSection || !carouselRing) {
      return;
    }

    new ScrollMagic.Scene({
      triggerElement: carouselSection,
      triggerHook: 0,
      duration: carouselSection.offsetHeight - window.innerHeight
    })
      .on("progress", function (event) {
        rotateCarousel(event.progress);
      })
      .addTo(controller);
  }

  function rotateCarousel(progress) {
    var safeProgress = Math.max(0, Math.min(1, progress));
    var step = 60;
    var rotation = safeProgress * step * Math.max(orbitCards.length - 1, 1);

    carouselRing.style.transform = "rotateX(" + rotation + "deg)";
    updateActiveCard(rotation, step);

    if (carouselProgress) {
      carouselProgress.style.width = safeProgress * 100 + "%";
    }
  }

  function updateActiveCard(rotation, step) {
    var closestCard = null;
    var closestAngle = Infinity;

    orbitCards.forEach(function (card, index) {
      var angle = normalizeAngle(index * step + rotation);
      var distance = Math.abs(angle);

      if (distance < closestAngle) {
        closestAngle = distance;
        closestCard = card;
      }

      if (distance < 34) {
        card.style.opacity = "1";
        card.style.filter = "none";
        card.style.zIndex = "6";
      } else if (distance < 92) {
        card.style.opacity = "0.42";
        card.style.filter = "blur(2px) saturate(0.86)";
        card.style.zIndex = "3";
      } else {
        card.style.opacity = "0.12";
        card.style.filter = "blur(6px) saturate(0.72)";
        card.style.zIndex = "1";
      }

      card.classList.remove("is-active");
    });

    if (closestCard) {
      closestCard.classList.add("is-active");
    }
  }

  function normalizeAngle(angle) {
    return ((angle + 180) % 360 + 360) % 360 - 180;
  }

  function setupCarouselFallback() {
    if (!carouselSection || !carouselRing) {
      return;
    }

    var ticking = false;

    function update() {
      var start = carouselSection.offsetTop;
      var distance = carouselSection.offsetHeight - window.innerHeight;
      var progress = distance <= 0 ? 0 : (window.scrollY - start) / distance;

      rotateCarousel(progress);
      ticking = false;
    }

    function requestUpdate() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", requestUpdate);
    window.addEventListener("resize", requestUpdate);
    requestUpdate();
  }

  function setupAlwaysOnScrollFallback() {
    var ticking = false;

    function checkGroups() {
      revealGroups.forEach(function (group) {
        var rect = group.getBoundingClientRect();

        if (rect.top < window.innerHeight * 0.78) {
          revealItems(group);
        }
      });

      ticking = false;
    }

    function requestCheck() {
      if (!ticking) {
        window.requestAnimationFrame(checkGroups);
        ticking = true;
      }
    }

    window.addEventListener("scroll", requestCheck);
    window.addEventListener("resize", requestCheck);
    requestCheck();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupCarouselFallback();
    setupScrollMagicReveal();
    window.addEventListener("resize", function () {
      rotateCarousel(getCarouselProgress());
    });
  });

  function getCarouselProgress() {
    if (!carouselSection) {
      return 0;
    }

    var distance = carouselSection.offsetHeight - window.innerHeight;

    if (distance <= 0) {
      return 0;
    }

    return (window.scrollY - carouselSection.offsetTop) / distance;
  }
})();
