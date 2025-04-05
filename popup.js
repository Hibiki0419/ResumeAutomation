// popup.js
// ---------------------------------------------------------
//  - 各入力項目（氏名、生年月日、郵便番号、住所、電話番号、携帯電話番号、追加携帯番号、E-mail・携帯アドレス）
//    および、チェックボックス（自動入力ON/OFF, jqTransformCheckbox）を取得・保存する。
//  - ページ読み込み時に保存済みデータを各入力欄に復元し、「保存」ボタン押下時に
//    すべての入力値を chrome.storage.local に保存する。
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    console.log("[DEBUG] popup.js - DOMContentLoaded");
  
    // チェックボックス
    const autoFillCheckbox = document.getElementById("autoFillEnabled");
    const adchCheckbox = document.getElementById("adch");
    const ktelContainer = document.getElementById("ktelContainer");
    // 学校種別セレクト
    const gkbnSelect = document.getElementById("gkbnSelect");

    // 頭文字セレクト
    const gonSelect = document.getElementById("gonSelect");

    // 大学所在地セレクト
    const dkenSelect = document.getElementById("dkenSelect");

    const gkbcdInput = document.getElementById("gkbcdInput");
    const gkkcdInput = document.getElementById("gkkcdInput"); // 学部名テキスト
  const sBrkbnSelect = document.getElementById("sBrkbnSelect"); // 文理区分select


    // 氏名
    const kname1Input = document.getElementById("kname1");
    const kname2Input = document.getElementById("kname2");
    const yname1Input = document.getElementById("yname1");
    const yname2Input = document.getElementById("yname2");
  
    // 生年月日
    const ybirthInput = document.getElementById("ybirth");
    const mbirthInput = document.getElementById("mbirth");
    const dbirthInput = document.getElementById("dbirth");
  
    // 郵便番号
    const gyubin1Input = document.getElementById("gyubin1");
    const gyubin2Input = document.getElementById("gyubin2");
  
    // 住所
    const gkenInput = document.getElementById("gken");
    const gadrs1Input = document.getElementById("gadrs1");
    const gadrs2Input = document.getElementById("gadrs2");
  
    // 電話番号
    const gtel1Input = document.getElementById("gtel1");
    const gtel2Input = document.getElementById("gtel2");
    const gtel3Input = document.getElementById("gtel3");
  
    // 携帯電話番号
    const ktel1Input = document.getElementById("ktel1");
    const ktel2Input = document.getElementById("ktel2");
    const ktel3Input = document.getElementById("ktel3");
  
    // 追加携帯番号 (kttel)
    const kttel1Input = document.getElementById("kttel1");
    const kttel2Input = document.getElementById("kttel2");
    const kttel3Input = document.getElementById("kttel3");
  
    // E-mailアドレス（確認用）
    const account1Input = document.getElementById("account1");
    const domain1Input = document.getElementById("domain1");
    const account2Input = document.getElementById("account2");
    const domain2Input = document.getElementById("domain2");
  
    // 携帯アドレス（確認用）
    const account3Input = document.getElementById("account3");
    const domain3Input = document.getElementById("domain3");
    const account4Input = document.getElementById("account4");
    const domain4Input = document.getElementById("domain4");
  
    // 保存ボタン
    const saveButton = document.getElementById("saveButton");
  
    // 読み込む全キー
    const keys = [
      "autoFillEnabled",
      "adch",
      "kname1", "kname2", "yname1", "yname2",
      "ybirth", "mbirth", "dbirth",
      "gyubin1", "gyubin2",
      "gken", 
      "gadrs1", "gadrs2",
      "gtel1", "gtel2", "gtel3",
      "ktel1", "ktel2", "ktel3",
      "kttel1", "kttel2", "kttel3",
      "account1", "domain1", "account2", "domain2",
      "account3", "domain3", "account4", "domain4",
      "gkbn", "gon", "dken",
      "gkbnSelect",
      "gonSelect",
      "dkenSelect",
      "gkbcd", "gkkcd", "sBrkbn"
    ];
  
    chrome.storage.local.get(keys, (storedData) => {
      console.log("[DEBUG] popup.js - 初期読み込み:", storedData);
  
      // 自動入力ON/OFF（デフォルト true）
      if (typeof storedData.autoFillEnabled === "boolean") {
        autoFillCheckbox.checked = storedData.autoFillEnabled;
      } else {
        autoFillCheckbox.checked = true;
      }
  
      // jqTransformCheckbox用（adch）チェック（デフォルト false）
      if (typeof storedData.adch === "boolean") {
        adchCheckbox.checked = storedData.adch;
      } else {
        adchCheckbox.checked = false;
      }
  
      // 氏名
      if (storedData.kname1) kname1Input.value = storedData.kname1;
      if (storedData.kname2) kname2Input.value = storedData.kname2;
      if (storedData.yname1) yname1Input.value = storedData.yname1;
      if (storedData.yname2) yname2Input.value = storedData.yname2;
  
      // 生年月日
      if (storedData.ybirth) ybirthInput.value = storedData.ybirth;
      if (storedData.mbirth) mbirthInput.value = storedData.mbirth;
      if (storedData.dbirth) dbirthInput.value = storedData.dbirth;
  
      // 郵便番号
      if (storedData.gyubin1) gyubin1Input.value = storedData.gyubin1;
      if (storedData.gyubin2) gyubin2Input.value = storedData.gyubin2;
      
      //都道府県
      if (storedData.gken) gkenInput.value = storedData.gken;
      // 住所
      if (storedData.gadrs1) gadrs1Input.value = storedData.gadrs1;
      if (storedData.gadrs2) gadrs2Input.value = storedData.gadrs2;
  
      // 電話番号
      if (storedData.gtel1) gtel1Input.value = storedData.gtel1;
      if (storedData.gtel2) gtel2Input.value = storedData.gtel2;
      if (storedData.gtel3) gtel3Input.value = storedData.gtel3;
  
      // 携帯電話番号
      if (storedData.ktel1) ktel1Input.value = storedData.ktel1;
      if (storedData.ktel2) ktel2Input.value = storedData.ktel2;
      if (storedData.ktel3) ktel3Input.value = storedData.ktel3;
  
      // 追加携帯番号（kttel）- こちらは通常の場合、チェックが入っていれば結合して1回のみセット
        if (storedData.kttel1) kttel1Input.value = storedData.kttel1;
        if (storedData.kttel2) kttel2Input.value = storedData.kttel2;
        if (storedData.kttel3) kttel3Input.value = storedData.kttel3;

  
      // E-mailアドレス（確認用）
      if (storedData.account1) account1Input.value = storedData.account1;
      if (storedData.domain1) domain1Input.value = storedData.domain1;
      if (storedData.account2) account2Input.value = storedData.account2;
      if (storedData.domain2) domain2Input.value = storedData.domain2;
  
      // 携帯アドレス（確認用）
      if (storedData.account3) account3Input.value = storedData.account3;
      if (storedData.domain3) domain3Input.value = storedData.domain3;
      if (storedData.account4) account4Input.value = storedData.account4;
      if (storedData.domain4) domain4Input.value = storedData.domain4;

      // 学校種別
        if (storedData.gkbn) {
            // 例: "大学" など
            gkbnSelect.value = storedData.gkbn;
            setSelectOptionSelected(gkbnSelect, storedData.gkbn);
        } else {
            gkbnSelect.value = ""; // 未選択
        }

        // 頭文字 gon
        if (storedData.gon) {
            gonSelect.value = storedData.gon;  // 例: "け"
            setSelectOptionSelected(gonSelect, storedData.gon);
        } else {
            gonSelect.value = ""; // 未選択
        }

        if (storedData.dken) {
            dkenSelect.value = storedData.dken;
            setSelectOptionSelected(dkenSelect, storedData.dken);
            console.log(`[DEBUG] 復元: 大学所在地 => ${storedData.dken}`);
        } else {
            dkenSelect.value = ""; // 未選択
        }

        // 学部名
        if (storedData.gkbcd) {
            gkbcdInput.value = storedData.gkbcd;  // 例: "法学部"
        }

        // 学科名
        if (storedData.gkkcd) {
            gkkcdInput.value = storedData.gkkcd;  // 例: "環境情報学科"
        }

        // 文理区分
        if (storedData.sBrkbn) {
            sBrkbnSelect.value = storedData.sBrkbn; // 例: "文系" or "理系"
        }

        // adch の状態に応じて ktelContainer を表示/非表示
        updateKtelVisibility();
    });
  
    // チェックボックス変更イベント
    autoFillCheckbox.addEventListener("change", () => {
      const isEnabled = autoFillCheckbox.checked;
      chrome.storage.local.set({ autoFillEnabled: isEnabled }, () => {
        console.log("[DEBUG] autoFillEnabled updated:", isEnabled);
      });
    });
    adchCheckbox.addEventListener("change", () => {
      updateKtelVisibility();
      const isChecked = adchCheckbox.checked;
      chrome.storage.local.set({ adch: adchCheckbox.checked }, () => {
        console.log("[DEBUG] adch updated:", adchCheckbox.checked);
      });
    });
  
    // 保存ボタン押下時
    saveButton.addEventListener("click", () => {
      const facultyName = gkbcdInput.value;
      const dataToSave = {
        autoFillEnabled: autoFillCheckbox.checked,
        adch: adchCheckbox.checked,
        kname1: kname1Input.value,
        kname2: kname2Input.value,
        yname1: yname1Input.value,
        yname2: yname2Input.value,
        ybirth: ybirthInput.value,
        mbirth: mbirthInput.value,
        dbirth: dbirthInput.value,
        gyubin1: gyubin1Input.value,
        gyubin2: gyubin2Input.value,
        gken: gkenInput.value,
        gadrs1: gadrs1Input.value,
        gadrs2: gadrs2Input.value,
        gtel1: gtel1Input.value,
        gtel2: gtel2Input.value,
        gtel3: gtel3Input.value,
        ktel1: ktel1Input.value,
        ktel2: ktel2Input.value,
        ktel3: ktel3Input.value,
        kttel1: kttel1Input.value,
        kttel2: kttel2Input.value,
        kttel3: kttel3Input.value,
        account1: account1Input.value,
        domain1: domain1Input.value,
        account2: account2Input.value,
        domain2: domain2Input.value,
        account3: account3Input.value,
        domain3: domain3Input.value,
        account4: account4Input.value,
        domain4: domain4Input.value,
        gkbn: gkbnSelect.value,
        gon: gonSelect.value,
        dken: dkenSelect.value,
        gkbcd: facultyName,
        gkkcd: gkkcdInput.value.trim(),
        sBrkbn: sBrkbnSelect.value,
      };

      if (!facultyName) {
        alert("学部名を入力してください。");
        return;
      }
  
      chrome.storage.local.set(dataToSave, () => {
        console.log("[DEBUG] All input data saved:", dataToSave);
        alert("保存しました！");
      });
    });

    /**
   * adch が true なら ktelContainer を非表示、false なら表示
   */
    function updateKtelVisibility() {
        if (adchCheckbox.checked) {
        // 非表示
        ktelContainer.style.display = "none";
        } else {
        // 表示
        ktelContainer.style.display = "block";
        }
    }
  });

  /**
 * 指定した <select> 要素内で、value に合致する option に selected 属性を付与する。
 * @param {HTMLSelectElement} selectEl - 対象の <select> 要素
 * @param {string} value - 設定したい値
 */
function setSelectOptionSelected(selectEl, value) {
    if (selectEl && selectEl.options) {
      for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].value === value) {
          selectEl.options[i].selected = true;
        } else {
          selectEl.options[i].selected = false;
        }
      }
    }
  }