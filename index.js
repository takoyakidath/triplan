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
    btn.addEventListener("click", () => {
      // 今の画面の入力要素を集める
      const inputs = screens[current].querySelectorAll("input, select, textarea");
      let valid = true;
  
      inputs.forEach(input => {
        if (!input.checkValidity()) {
          input.reportValidity(); // ブラウザ標準のエラー表示を出す
          valid = false;
        }
      });
  
      if (valid) {
        showScreen(current + 1);
      }
    });
  });

  document.querySelectorAll(".returnbtn").forEach(btn => {
    btn.addEventListener("click", () => showScreen(current - 1));
  });

  document.querySelectorAll(".homebtn").forEach(btn => {
    btn.addEventListener("click", () => showScreen(0));
  });

  const STORAGE_KEY = "triplan:form";

  function saveForm() {
    const form = document.querySelector("#form");
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (data[key]) {
        if (!Array.isArray(data[key])) data[key] = [data[key]];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function loadForm() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
  
    Object.entries(data).forEach(([key, value]) => {
      const elems = document.querySelectorAll(`[name="${key}"]`);
      elems.forEach(elem => {
        if (elem.type === "checkbox" || elem.type === "radio") {
          if (Array.isArray(value)) {
            elem.checked = value.includes(elem.value);
          } else {
            elem.checked = elem.value === value;
          }
        } else {
          elem.value = value;
        }
      });
    });
  }
  document.querySelectorAll("#form input, #form select, #form textarea").forEach(el => {
    el.addEventListener("change", saveForm);
  });
  loadForm();  
  
});
