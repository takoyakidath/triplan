document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");
  let current = 0;

  function showScreen(index) {
    if (index < 0) index = 0;
    if (index >= screens.length) index = screens.length - 1;
    screens.forEach(s => (s.style.display = "none"));
    screens[index].style.display = "block";
    current = index;
  }

  showScreen(current);

  document.querySelectorAll(".nextbtn").forEach(btn => {
    btn.addEventListener("click", () => showScreen(current + 1));
  });

  document.querySelectorAll(".returnbtn").forEach(btn => {
    btn.addEventListener("click", () => showScreen(current - 1));
  });

  document.querySelectorAll(".homebtn").forEach(btn => {
    btn.addEventListener("click", () => showScreen(0));
  });
});
