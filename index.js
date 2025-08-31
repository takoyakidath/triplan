document.addEventListener("DOMContentLoaded", () => {
  // 定数
  const STORAGE_KEY = "triplan:plans";
  const EDIT_KEY = "triplan:editId";

  // DOM要素
  const screens = document.querySelectorAll(".screen");
  const form = document.querySelector("#form");
  const confirmArea = document.getElementById("confirm");
  const logsArea = document.querySelector(".logs");
  const plansContainer = document.getElementById("plans-container");
  const addPlanBtn = document.getElementById("add-plan");
  const staySelect = document.querySelector("[name='stay']");
  const inputOthers = document.querySelector(".input-others");

  let currentScreen = 0;

  // ----------------------------
  // 画面制御
  // ----------------------------
  function showScreen(index) {
    if (index < 0) index = 0;
    if (index >= screens.length) index = screens.length - 1;

    screens.forEach(s => (s.style.display = "none"));
    screens[index].style.display = "block";
    currentScreen = index;

    if (screens[index].classList.contains("screen-7")) {
      showConfirm();
    }
  }

  // ----------------------------
  // データ収集
  // ----------------------------
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

    // 予定欄
    const plans = [];
    plansContainer.querySelectorAll("[name='plan']").forEach(input => {
      if (input.value.trim()) plans.push(input.value.trim());
    });
    data.plans = plans;

    return data;
  }

  function toArray(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  // ----------------------------
  // 保存・読込
  // ----------------------------
  function savePlan(data) {
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const editId = localStorage.getItem(EDIT_KEY);
  
    if (editId !== null) {
      saved[parseInt(editId, 10)] = data;
      localStorage.removeItem(EDIT_KEY);
    } else {
      saved.push(data);
    }
  
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  
    // 履歴を更新
    renderLogs();
  }
  

  function loadPlanToForm(id) {
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    let data = saved[id];
    if (!data) return;

    form.reset();
    plansContainer.innerHTML = "";

    Object.entries(data).forEach(([key, value]) => {
      if (key === "plans") {
        toArray(value).forEach(v => addPlanItem(v));
      } else {
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
      }
    });
  }

  // ----------------------------
  // 表示
  // ----------------------------
  function showConfirm() {
    const data = collectFormData();
  
    // 宿泊の表示を整形
    let stayText = "";
    if (data.stay === "others") {
      stayText = `${data["stay-others"] || ""}泊`;
    } else {
      stayText = data.stay || "";
    }
  
    confirmArea.innerHTML = `
      <p><strong>行き先:</strong> ${data.destination || ""}</p>
      <p><strong>出発日:</strong> ${data["go-date"] || ""}</p>
      <p><strong>宿泊:</strong> ${stayText}</p>
      <p><strong>行きの交通手段:</strong> ${toArray(data["transport-go"]).join(", ")}</p>
      <p><strong>帰りの交通手段:</strong> ${toArray(data["transport-return"]).join(", ")}</p>
      <p><strong>予定:</strong> ${data.plans.length ? data.plans.join(", ") : "（なし）"}</p>
    `;
  }
  

  function renderLogs() {
    logsArea.innerHTML = "";
  
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    saved.forEach((plan, index) => {
      if (!plan) return; // nullをスキップ
  
      const row = document.createElement("button"); // ←divじゃなくてbuttonにする
      row.className = "log-item";
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.width = "100%";
  
      // タイトル部分
      const title = document.createElement("span");
      title.textContent = `${plan.destination || "未設定"} (${plan["go-date"] || "未定"})`;
  
      // ＞マーク
      const arrow = document.createElement("span");
      arrow.textContent = "編集";
  
      // クリックイベント
      row.addEventListener("click", () => {
        loadPlanToForm(index);
        localStorage.setItem(EDIT_KEY, index);
        showScreen(1);
        showConfirm();
      });
  
      row.appendChild(title);
      row.appendChild(arrow);
      logsArea.appendChild(row);
    });
  }
  
  

  // ----------------------------
  // 入力欄追加
  // ----------------------------
  function addPlanItem(defaultValue = "") {
    const newInput = document.createElement("div");
    newInput.className = "plan-item";
    newInput.innerHTML = `
      <input type="text" name="plan" value="${defaultValue}" placeholder="例：観光、食事、買い物、温泉など" required />
      <button type="button" class="remove-plan">-</button>
    `;
    plansContainer.appendChild(newInput);

    newInput.querySelector(".remove-plan").addEventListener("click", () => {
      newInput.remove();
    });
  }

  // ----------------------------
  // 各種イベント処理
  // ----------------------------
  function toggleStayOthers() {
    inputOthers.style.display = staySelect.value === "others" ? "block" : "none";
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const data = collectFormData();
    savePlan(data);
    renderLogs();
    showScreen(8);
  }

  function handleShare() {
    const data = collectFormData();
    const text = `
## 旅行プラン

- **行き先**: ${data.destination || ""}
- **出発日**: ${data["go-date"] || ""}
- **宿泊**: ${data.stay || ""} ${data["stay-others"] || ""}
- **行きの交通手段**: ${toArray(data["transport-go"]).join(", ")}
- **帰りの交通手段**: ${toArray(data["transport-return"]).join(", ")}
- **予定**: ${data.plans.length ? data.plans.join(", ") : "（なし）"}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      alert("プランをコピーしました");
    }).catch(err => {
      console.error("コピー失敗:", err);
    });
  }

  function handleHome() {
    localStorage.removeItem(EDIT_KEY);
    form.reset();
    plansContainer.innerHTML = "";
    addPlanItem();
    confirmArea.innerHTML = "";
    showScreen(0);
  }

  function setupEventListeners() {
    // 次へ
    document.querySelectorAll(".nextbtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const inputs = screens[currentScreen].querySelectorAll("input, select, textarea");
        let valid = true;
        inputs.forEach(input => {
          if (!input.checkValidity()) {
            input.reportValidity();
            valid = false;
          }
        });
        if (valid) showScreen(currentScreen + 1);
      });
    });
    document.querySelectorAll(".startbtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const inputs = screens[currentScreen].querySelectorAll("input, select, textarea");
        let valid = true;
        inputs.forEach(input => {
          if (!input.checkValidity()) {
            input.reportValidity();
            valid = false;
          }
        });
        if (valid) showScreen(currentScreen + 1);
      });
    });

    // 戻る
    document.querySelectorAll(".returnbtn").forEach(btn =>
      btn.addEventListener("click", () => showScreen(currentScreen - 1))
    );

    // ホーム
    document.querySelectorAll(".homebtn").forEach(btn =>
      btn.addEventListener("click", handleHome)
    );

    // フォーム送信
    form.addEventListener("submit", handleFormSubmit);

    // 共有
    document.querySelectorAll(".sharebtn").forEach(btn =>
      btn.addEventListener("click", handleShare)
    );

    // 予定追加
    addPlanBtn.addEventListener("click", () => addPlanItem());

    // 宿泊選択
    staySelect.addEventListener("change", toggleStayOthers);
  }

  // ----------------------------
  // 初期化
  // ----------------------------
  function initialize() {
    setupEventListeners();
    toggleStayOthers();
    renderLogs();
    plansContainer.innerHTML = "";
    addPlanItem(); // 初期予定欄を1つ
    showScreen(0);
  }

  initialize();
});
