document.addEventListener("DOMContentLoaded", () => {
  // 定数定義
  const STORAGE_KEY = "triplan:plans";
  const EDIT_KEY = "triplan:editId";
  
  // DOM要素の取得
  const screens = document.querySelectorAll(".screen");
  const form = document.querySelector("#form");
  const confirm = document.getElementById("confirm");
  const logs = document.querySelector(".logs");
  const plansContainer = document.getElementById("plans-container");
  const addPlanBtn = document.getElementById("add-plan");
  const staySelect = document.querySelector("[name='stay']");
  const inputOthers = document.querySelector(".input-others");
  
  let current = 0;

  // 画面表示管理
  function showScreen(index) {
    if (index < 0) index = 0;
    if (index >= screens.length) index = screens.length - 1;

    screens.forEach(s => (s.style.display = "none"));
    screens[index].style.display = "block";
    current = index;

    if (screens[index].classList.contains("screen-7")) {
      showConfirm();
    }
  }

  // 初期画面表示
  showScreen(0);

  // フォームデータ収集
  function collectFormData() {
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (data[key]) {
        if (!Array.isArray(data[key])) data[key] = [data[key]];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    // プラン項目の特別処理
    const plans = [];
    const planInputs = form.querySelectorAll("[name='plan']");
    planInputs.forEach(input => {
      if (input.value.trim()) {
        plans.push(input.value.trim());
      }
    });
    data.plans = plans;

    return data;
  }

  function toArray(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  function savePlan(data) {
    let plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const editId = localStorage.getItem(EDIT_KEY);

    if (editId !== null) {
      plans[parseInt(editId, 10)] = data;
      localStorage.removeItem(EDIT_KEY);
    } else {
      plans.push(data);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }

  function loadPlanToForm(id) {
    let plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    let data = plans[id];
    if (!data) return;

    form.reset();
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
          elem.value = Array.isArray(value) ? value[0] : value;
        }
      });
    });
  }

  function showConfirm() {
    const data = collectFormData();
    confirm.innerHTML = `
      <p><strong>行き先:</strong> ${data.destination || ""}</p>
      <p><strong>出発日:</strong> ${data["go-date"] || ""}</p>
      <p><strong>宿泊:</strong> ${data.stay || ""} ${data["stay-others"] || ""}</p>
      <p><strong>行きの交通手段:</strong> ${toArray(data["transport-go"]).join(", ")}</p>
      <p><strong>帰りの交通手段:</strong> ${toArray(data["transport-return"]).join(", ")}</p>
      <p><strong>予定:</strong> ${toArray(data.plans).join(", ")}</p>
    `;
  }

  function renderLogs() {
    logs.innerHTML = "";

    let plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    plans.forEach((plan, index) => {
      const row = document.createElement("div");
      row.className = "log-item";

      const title = document.createElement("span");
      title.textContent = `${plan.destination || "未設定"} (${plan["go-date"] || "未定"})`;

      const btn = document.createElement("button");
      btn.className = "editbtn";
      btn.textContent = "編集";
      btn.addEventListener("click", () => {
        loadPlanToForm(index);
        localStorage.setItem(EDIT_KEY, index);
        showScreen(1);
        showConfirm();
      });

      row.appendChild(title);
      row.appendChild(btn);
      logs.appendChild(row);
    });
  }

  function addPlanItem(defaultValue = "") {
    const newInput = document.createElement("div");
    newInput.className = "plan-item";
  
    newInput.innerHTML = `
      <input type="text" name="plan" value="${defaultValue}" placeholder="例：観光、食事、買い物、温泉など" required />
      <button type="button" class="remove-plan">-</button>
    `;
    plansContainer.appendChild(newInput);
  
    const removeBtn = newInput.querySelector(".remove-plan");
    removeBtn.addEventListener("click", () => {
      newInput.remove();
    });
  }
  

  function toggleStayOthers() {
    if (staySelect.value === "others") {
      inputOthers.style.display = "block";
    } else {
      inputOthers.style.display = "none";
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const data = collectFormData();
    savePlan(data);
    renderLogs();
    showScreen(8);
  }

  // 共有ボタン処理
  function handleShare() {
    const data = collectFormData();

    const text = `
## 旅行プラン

- **行き先**: ${data.destination || ""}
- **出発日**: ${data["go-date"] || ""}
- **宿泊**: ${data.stay || ""} ${data["stay-others"] || ""}
- **行きの交通手段**: ${toArray(data["transport-go"]).join(", ")}
- **帰りの交通手段**: ${toArray(data["transport-return"]).join(", ")}
- **予定**: ${toArray(data.plans).join(", ")}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      alert("プランをコピーしました");
    }).catch(err => {
      console.error("コピー失敗:", err);
    });
  }

  // ホームボタン処理
  function handleHome() {
    localStorage.removeItem(EDIT_KEY);
    form.reset();
    if (confirm) confirm.innerHTML = "";
    showScreen(0);
  }

  // イベントリスナーの設定
  function setupEventListeners() {
    // 次へボタン
    document.querySelectorAll(".nextbtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const inputs = screens[current].querySelectorAll("input, select, textarea");
        let valid = true;
        inputs.forEach(input => {
          if (!input.checkValidity()) {
            input.reportValidity();
            valid = false;
          }
        });
        if (valid) showScreen(current + 1);
      });
    });

    // 戻るボタン
    document.querySelectorAll(".returnbtn").forEach(btn =>
      btn.addEventListener("click", () => showScreen(current - 1))
    );

    // ホームボタン
    document.querySelectorAll(".homebtn").forEach(btn =>
      btn.addEventListener("click", handleHome)
    );

    // フォーム送信
    form.addEventListener("submit", handleFormSubmit);

    document.querySelectorAll(".sharebtn").forEach(btn => {
      btn.addEventListener("click", handleShare);
    });

    // プラン追加ボタン
    addPlanBtn.addEventListener("click", addPlanItem);

    // 宿泊選択変更
    staySelect.addEventListener("change", toggleStayOthers);
  }

  function initialize() {
    setupEventListeners();
    toggleStayOthers();
    renderLogs();
    addPlanItem();
  }

  initialize();
});
