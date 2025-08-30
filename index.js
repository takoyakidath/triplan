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
    btn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);  // ← これで今回のデータを消す
      document.querySelector("#form").reset(); // ← 入力欄もリセットしておく
      showScreen(0);
    });
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
  
  function toArray(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }
  
  function showConfirm() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
  
    const confirm = document.getElementById("confirm");
    confirm.innerHTML = `
      <label>行き先: 
        <input type="text" name="destination" value="${data.destination || ""}">
      </label><br>
      <label>出発日: 
        <input type="date" name="go-date" value="${data["go-date"] || ""}">
      </label><br>
      <label>宿泊: 
        <input type="text" name="stay" value="${data.stay || ""}">
      </label><br>
      <label>その他泊数: 
        <input type="number" name="stay-others" value="${data["stay-others"] || ""}">
      </label><br>
      <label>行きの交通手段: 
        <input type="text" name="transport-go" value="${toArray(data["transport-go"]).join(", ")}">
      </label><br>
      <label>帰りの交通手段: 
        <input type="text" name="transport-return" value="${toArray(data["transport-return"]).join(", ")}">
      </label><br>
      <label>予定: 
        <textarea name="plans">${toArray(data.plans).join(", ")}</textarea>
      </label>
    `;
  }
  
  

  function showScreen(index) {
    if (index < 0) index = 0;
    if (index >= screens.length) index = screens.length - 1;
    screens.forEach(s => (s.style.display = "none"));
    screens[index].style.display = "block";
    current = index;
  
    // 確認画面に来たら一覧を表示
    if (screens[index].classList.contains("screen-7")) {
      showConfirm();
    }
  }

  document.querySelector("#form").addEventListener("submit", e => {
    e.preventDefault();
    saveForm();
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(raw);
  
    // ホーム画面のログに追加
    const logs = document.querySelector(".logs");
    const div = document.createElement("div");
    div.textContent = `${data.destination} (${data["go-date"]})`;
    logs.appendChild(div);
  
    showScreen(8); // 共有画面へ
  });
  
  function renderLogs() {
    const logs = document.querySelector(".logs");
    logs.innerHTML = "";
  
    let plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    plans.forEach((plan, index) => {
      const row = document.createElement("div");
      row.className = "log-item";
  
      const title = document.createElement("span");
      title.textContent = `${plan.destination || "未設定"} (${plan["go-date"] || "日付未定"})`;
  
      // 編集ボタン
      const btn = document.createElement("button");
      btn.className = "editbtn";
      btn.textContent = "編集";
      btn.addEventListener("click", () => {
        loadPlanToForm(index);
        localStorage.setItem("triplan:editId", index);
        showScreen(1); // フォームの最初に戻る
      });
  
      row.appendChild(title);
      row.appendChild(btn);
      logs.appendChild(row);
    });
  }
  
  
});
