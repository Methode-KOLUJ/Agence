document.addEventListener("DOMContentLoaded", function () {
  const menuIcon = document.getElementById("menu-icon");
  const menu = document.querySelector(".menu");

  menuIcon.addEventListener("click", function () {
    menu.classList.toggle("active");
  });

  document.addEventListener("click", function (event) {
    if (!menu.contains(event.target) && event.target !== menuIcon) {
      menu.classList.remove("active");
    }
  });
});

// scroll reveal

ScrollReveal({
  reset: true,
  distance: "100px",
  duration: 2000,
  delay: 200,
});

ScrollReveal().reveal(".hero, .contact-container", { origin: "top" });
ScrollReveal().reveal("#zones-tarifs, #contact h2, iframe", {
  origin: "bottom",
});

ScrollReveal().reveal("#a-propos, table, #message, #email", { origin: "left" });

ScrollReveal().reveal("#services, #need, #phone, #name", { origin: "right" });
