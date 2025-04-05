// contentScript.js
// ---------------------------------------------------------
// 概要:
//   - Chrome Storage から多くのキーを取得し、ページのフォームや
//     jQTransform カスタムUIを更新する最終版サンプル
// ---------------------------------------------------------

console.log("[DEBUG] contentScript.js loaded");

const hiraganaToKatakana = {
  // あ行
  "あ": "ア",
  "い": "イ",
  "う": "ウ",
  "え": "エ",
  "お": "オ",

  // か行（濁音があるので併記）
  "か": "カガ",
  "き": "キギ",
  "く": "クグ",
  "け": "ケゲ",
  "こ": "コゴ",

  // さ行（濁音があるので併記）
  "さ": "サザ",
  "し": "シジ",
  "す": "スズ",
  "せ": "セゼ",
  "そ": "ソゾ",

  // た行（濁音があるので併記）
  "た": "タダ",
  "ち": "チヂ",
  "つ": "ツヅ",
  "て": "テデ",
  "と": "トド",

  // な行（濁点・半濁点なし）
  "な": "ナ",
  "に": "ニ",
  "ぬ": "ヌ",
  "ね": "ネ",
  "の": "ノ",

  // は行（濁音・半濁音あり: ハバパ）
  "は": "ハバパ",
  "ひ": "ヒビピ",
  "ふ": "フブプ",
  "へ": "ヘベペ",
  "ほ": "ホボポ",

  // ま行
  "ま": "マ",
  "み": "ミ",
  "む": "ム",
  "め": "メ",
  "も": "モ",

  // や行（小書きや拗音は省略、清音のみ）
  "や": "ヤ",
  "ゆ": "ユ",
  "よ": "ヨ",

  // ら行
  "ら": "ラ",
  "り": "リ",
  "る": "ル",
  "れ": "レ",
  "ろ": "ロ",

  // わ行 + ん
  "わ": "ワ",
  "を": "ヲ",
  "ん": "ン"
};


// [A] 都道府県名 → コード
const prefectureNameToCode = {
  "北海道": "01",
  "青森県": "02",
  "岩手県": "03",
  "宮城県": "04",
  "秋田県": "05",
  "山形県": "06",
  "福島県": "07",
  "茨城県": "08",
  "栃木県": "09",
  "群馬県": "10",
  "埼玉県": "11",
  "千葉県": "12",
  "東京都": "13",
  "神奈川県": "14",
  "新潟県": "15",
  "富山県": "16",
  "石川県": "17",
  "福井県": "18",
  "山梨県": "19",
  "長野県": "20",
  "岐阜県": "21",
  "静岡県": "22",
  "愛知県": "23",
  "三重県": "24",
  "滋賀県": "25",
  "京都府": "26",
  "大阪府": "27",
  "兵庫県": "28",
  "奈良県": "29",
  "和歌山県": "30",
  "鳥取県": "31",
  "島根県": "32",
  "岡山県": "33",
  "広島県": "34",
  "山口県": "35",
  "徳島県": "36",
  "香川県": "37",
  "愛媛県": "38",
  "高知県": "39",
  "福岡県": "40",
  "佐賀県": "41",
  "長崎県": "42",
  "熊本県": "43",
  "大分県": "44",
  "宮崎県": "45",
  "鹿児島県": "46",
  "沖縄県": "47"
};

// [B] 学校種別: ユーザー入力 "大学" → コード "3" のマッピング
const schoolTypeToValue = {
  "大学": "3",
  "大学院(修士)": "2",
  "大学院(博士)": "1",
  "短期大学": "4",
  "高等専門学校": "7",
  "外国大学日本校": "A",
  "外国大学": "B"
};

// ページロード完了で main() を実行
if (document.readyState === "complete" || document.readyState === "interactive") {
  main();
} else {
  window.addEventListener("DOMContentLoaded", main);
}

async function main() {
  console.log("[DEBUG] main() start");

  // [1] 取得する全キー
  const keys = [
    "kname1","kname2","yname1","yname2",
    "ybirth","mbirth","dbirth",
    "gyubin1","gyubin2",
    "gadrs1","gadrs2",
    "gtel1","gtel2","gtel3",
    "ktel1","ktel2","ktel3",
    "kttel1","kttel2","kttel3",
    "gken",     // 都道府県(ユーザー入力: "東京都"など)
    "gkbn",     // 学校種別(ユーザー入力: "大学"など)
    "gon", 
    "dken",
    "gkbcd", "gkkcd", "sBrkbn",
    "account1","domain1","account2","domain2",
    "account3","domain3","account4","domain4",
    "adch"
  ];

  // [2] Chrome Storageからまとめて取得
  const storedData = await new Promise((resolve) => {
    chrome.storage.local.get(keys, (data) => resolve(data));
  });
  console.log("[DEBUG] storedData:", storedData);

  // 3. 氏名
  setInputValue("kname1", storedData.kname1);
  setInputValue("kname2", storedData.kname2);
  setInputValue("yname1", storedData.yname1);
  setInputValue("yname2", storedData.yname2);

  // 4. 生年月日
  updateYearSelect(storedData.ybirth);
  updateMonthSelect(storedData.mbirth);
  updateDaySelect(storedData.dbirth);

  // 5. その他の項目
  setInputValue("gyubin1", storedData.gyubin1);
  setInputValue("gyubin2", storedData.gyubin2);
  setInputValue("gadrs1", storedData.gadrs1);
  setInputValue("gadrs2", storedData.gadrs2);
  setInputValue("gtel1", storedData.gtel1);
  setInputValue("gtel2", storedData.gtel2);
  setInputValue("gtel3", storedData.gtel3);
  setInputValue("ktel1", storedData.ktel1);
  setInputValue("ktel2", storedData.ktel2);
  setInputValue("ktel3", storedData.ktel3);

  setInputValue("kttel1", storedData.kttel1);
  setInputValue("kttel2", storedData.kttel2);
  setInputValue("kttel3", storedData.kttel3);

  setInputValue("account1", storedData.account1);
  setInputValue("domain1",  storedData.domain1);
  setInputValue("account2", storedData.account2);
  setInputValue("domain2",  storedData.domain2);
  setInputValue("account3", storedData.account3);
  setInputValue("domain3",  storedData.domain3);
  setInputValue("account4", storedData.account4);
  setInputValue("domain4",  storedData.domain4);

  // 7. 都道府県 (ユーザー入力: "東京都" => コード "13")
  updatePrefectureSelect(storedData.gken);

  // 8. 学校種別ラジオボタン ("大学" => "3")
  updateSchoolRadio(storedData.gkbn);

  // (F) 学校頭文字ラジオ (ひらがな => カタカナ)
  updateSchoolInitialRadio(storedData.gon);

  // 大学所在地ラジオの更新
  updateLocationRadio(storedData.dken);

  // 2) 学部名を updateFacultyRadio でラジオボタンに反映
  updateFacultyRadio(storedData.gkbcd);

  // 学科ラジオ
  updateGkkcdRadio(storedData.gkkcd);

  // 文理区分ラジオ
  updateSBrkbnRadio(storedData.sBrkbn);

  // 9. jqTransformCheckbox
  updateTransformCheckbox("adch", !!storedData.adch);
}

/**
 * <input name="..."> に newValue をセット
 */
function setInputValue(nameAttr, newValue) {
  if (!newValue) return;
  const el = document.querySelector(`input[name="${nameAttr}"]`);
  if (el) {
    el.value = newValue;
    console.log(`[DEBUG] setInputValue: ${nameAttr} => ${newValue}`);
  } else {
    console.log(`[DEBUG] <input name="${nameAttr}"> not found`);
  }
}

/**
 * 都道府県: ユーザーが "東京都" → コード "13" → <select name="gken">.value="13" + jQTransform
 */
function updatePrefectureSelect(prefName) {
  if (!prefName) return;
  const code = prefectureNameToCode[prefName];
  if (!code) {
    console.log(`[DEBUG] updatePrefectureSelect: 未対応の都道府県 => ${prefName}`);
    return;
  }
  const selectEl = document.querySelector('select[name="gken"]');
  if (!selectEl) {
    console.log("[DEBUG] <select name='gken'> not found");
    return;
  }
  selectEl.value = code;
  console.log(`[DEBUG] <select name="gken"> set to code="${code}" (prefName="${prefName}")`);
  // jQTransform更新: index=code, displayText=prefName
  updateTransformUI(selectEl, code, prefName, "gken");
}

/**
 * 学校種別ラジオボタン: ユーザーが "大学" → "3"
 * <input type="radio" name="gkbn" value="3">
 */
function updateSchoolRadio(schoolName) {
  if (!schoolName) return;
  const code = schoolTypeToValue[schoolName];
  if (!code) {
    console.log(`[DEBUG] updateSchoolRadio: 未対応の学校種別 => ${schoolName}`);
    return;
  }
  // 対象のラジオ
  const radioEl = document.querySelector(`input[type="radio"][name="gkbn"][value="${code}"]`);
  if (!radioEl) {
    console.log(`[DEBUG] radio not found => name="gkbn" value="${code}"`);
    return;
  }
  // ラジオを checked に
  radioEl.checked = true;
  console.log(`[DEBUG] set radio checked => gkbn value="${code}" for school="${schoolName}"`);

  // jQTransform更新
  // (a) 全ての .jqTransformRadioWrapper から "jqTransformChecked" を外す
  const allWrappers = document.querySelectorAll(".jqTransformRadioWrapper");
  allWrappers.forEach((wrapper) => {
    const anchor = wrapper.querySelector("a.jqTransformRadio");
    if (anchor) {
      anchor.classList.remove("jqTransformChecked");
    }
  });
    // 対象ラッパ
    const wrapper = radioEl.closest(".jqTransformRadioWrapper");
    if (!wrapper) return;
    const customRadio = wrapper.querySelector("a.jqTransformRadio");
    if (!customRadio) return;
    customRadio.classList.add("jqTransformChecked");
    console.log(`[DEBUG] updateSchoolRadio => school="${schoolName}", value="${code}"`);
}

/**
 * [関数] 学校頭文字ラジオ (ユーザーが "け" → "ケ")
 * <input type="radio" name="gon" value="ケ">
 */
function updateSchoolInitialRadio(hiragana) {
  if (!hiragana) {
    console.log("[DEBUG] updateSchoolInitialRadio => no input");
    return;
  }

  // 例: "け" => "ケ"
  const katakana = hiraganaToKatakana[hiragana];
  if (!katakana) {
    console.log(`[DEBUG] 未対応のひらがな => ${hiragana}`);
    return;
  }

  // ラジオ要素 <input type="radio" name="gon" value="ケ">
  const radioEl = document.querySelector(`input[type="radio"][name="gon"][value="${katakana}"]`);
  if (!radioEl) {
    console.log(`[DEBUG] radioEl not found => name="gon" value="${katakana}"`);
    return;
  }
  // 選択
  radioEl.checked = true;


  // 対象ラッパ
  const wrapper = radioEl.closest(".jqTransformRadioWrapper");
  if (!wrapper) {
    console.log("[DEBUG] .jqTransformRadioWrapper not found for gon radio");
    return;
  }
  const customRadio = wrapper.querySelector("a.jqTransformRadio");
  if (!customRadio) {
    console.log("[DEBUG] <a class='jqTransformRadio'> not found");
    return;
  }
  customRadio.classList.add("jqTransformChecked");
  console.log(`[DEBUG] updateSchoolInitialRadio => "${hiragana}" => "${katakana}" selected`);
}

/**
 * 大学所在地ラジオ: dkenName -> code -> <input type="radio" name="dken" value="XX">
 */
function updateLocationRadio(dkenName) {
  if (!dkenName) {
    console.log("[DEBUG] updateLocationRadio: no input => skip");
    return;
  }
  const code = prefectureNameToCode[dkenName];
  if (!code) {
    console.log(`[DEBUG] updateLocationRadio: 未対応の所在地 => ${dkenName}`);
    return;
  }
  const radioEl = document.querySelector(`input[type="radio"][name="dken"][value="${code}"]`);
  if (!radioEl) {
    console.log(`[DEBUG] radio not found => name="dken" value="${code}"`);
    return;
  }
  // 選択
  radioEl.checked = true;
  console.log(`[DEBUG] set radio checked => dkenName="${dkenName}" => code="${code}"`);

  // 対象ラッパ
  const wrapper = radioEl.closest(".jqTransformRadioWrapper");
  if (!wrapper) return;
  const customRadio = wrapper.querySelector("a.jqTransformRadio");
  if (!customRadio) return;
  customRadio.classList.add("jqTransformChecked");
  console.log(`[DEBUG] added jqTransformChecked => dkenName="${dkenName}" (value="${code}")`);
}

/**
 * 学部ラジオボタンを学部名テキストで選択
 * 例: userInput = "法学部" → label.textContent === "法学部" の radio を checked
 */
function updateFacultyRadio(facultyName) {
  if (!facultyName) {
    console.log("[DEBUG] updateFacultyRadio: no input => skip");
    return;
  }

  // (A) <ul class="chekwrap4 clearfix"> 内の <li> を全て取得
  const ulEl = document.querySelector("ul.chekwrap4.clearfix");
  if (!ulEl) {
    console.log("[DEBUG] updateFacultyRadio: <ul.chekwrap4.clearfix> not found");
    return;
  }
  const liItems = ulEl.querySelectorAll("li");
  if (!liItems.length) {
    console.log("[DEBUG] updateFacultyRadio: no <li> found in .chekwrap4");
    return;
  }

  let foundMatch = false;

  // (C) 各 li を走査し、label のテキストが facultyName と一致するか判定
  liItems.forEach((li) => {
    const radioEl = li.querySelector('input[type="radio"][name="gkbcd"]');
    const labelEl = li.querySelector('label[for="radio"]'); 
    // ↑ label[for="radio"] ではなく、li.querySelector("label") でもOK
    if (radioEl && labelEl) {
      const labelText = labelEl.textContent.trim();
      if (labelText === facultyName) {
        // (1) これが該当ラジオ => checked = true
        radioEl.checked = true;
        console.log(`[DEBUG] updateFacultyRadio: matched => "${facultyName}" => radio value="${radioEl.value}"`);

        // (2) jQTransformRadio にクラスを付与
        const wrapper = radioEl.closest(".jqTransformRadioWrapper");
        if (wrapper) {
          const customRadio = wrapper.querySelector("a.jqTransformRadio");
          if (customRadio) {
            customRadio.classList.add("jqTransformChecked");
          }
        }
        foundMatch = true;
      }
    }
  });

  if (!foundMatch) {
    console.log(`[DEBUG] updateFacultyRadio: no matching label for "${facultyName}"`);
  }
}


/**
 * 学部ラジオ: label.textContent === userInput (例:"環境情報学科") を探す
 * 見つからなければ "その他学部" (例: value="9Z8") をchecked
 */
function updateGkkcdRadio(facultyName) {
  if (!facultyName) {
    console.log("[DEBUG] updateGkkcdRadio: no input => skip");
    return;
  }

  const ulEl = document.querySelector("ul.chekwrap4.clearfix");
  if (!ulEl) {
    console.log("[DEBUG] updateGkkcdRadio: .chekwrap4.clearfix not found");
    return;
  }
  const liItems = ulEl.querySelectorAll("li");

  // 全ラッパから jqTransformChecked を外す
  const allWrappers = document.querySelectorAll(".jqTransformRadioWrapper");
  allWrappers.forEach((wrapper) => {
    const anchor = wrapper.querySelector("a.jqTransformRadio");
    if (anchor) anchor.classList.remove("jqTransformChecked");
  });

  let found = false;
  let radioToCheck = null;

  liItems.forEach((li) => {
    const radioEl = li.querySelector('input[type="radio"][name="gkkcd"]');
    const labelEl = li.querySelector('label[for="radio"]');
    if (radioEl && labelEl) {
      const labelText = labelEl.textContent.trim();
      if (labelText === facultyName) {
        found = true;
        radioToCheck = radioEl;
      }
    }
  });

  if (!found) {
    // 見つからなければ "その他学部" を選択
    console.log(`[DEBUG] updateGkkcdRadio: no match for "${facultyName}", fallback => その他学部`);
    // 例: value="9Z8" が "その他学部"
    radioToCheck = ulEl.querySelector('input[type="radio"][name="gkkcd"][value="9Z8"]');
  }

  if (radioToCheck) {
    radioToCheck.checked = true;
    // jQTransformRadioWrapper 内の <a> にクラス付与
    const wrapper = radioToCheck.closest(".jqTransformRadioWrapper");
    if (wrapper) {
      const customRadio = wrapper.querySelector("a.jqTransformRadio");
      if (customRadio) customRadio.classList.add("jqTransformChecked");
    }
    console.log(`[DEBUG] updateGkkcdRadio: checked => value="${radioToCheck.value}"`);
  }
}

/**
 * 文理区分ラジオ: userInput "文系" => value="1", "理系" => value="2"
 */
function updateSBrkbnRadio(bunri) {
  if (!bunri) {
    console.log("[DEBUG] updateSBrkbnRadio: no input => skip");
    return;
  }
  // 例: "文系" => "1", "理系" => "2"
  let code = "";
  if (bunri === "文系") code = "1";
  else if (bunri === "理系") code = "2";
  else {
    console.log(`[DEBUG] updateSBrkbnRadio: 未対応 => ${bunri}`);
    return;
  }

  // 該当ラジオを checked
  const radioEl = document.querySelector(`input[type="radio"][name="s_brkbn"][value="${code}"]`);
  if (!radioEl) {
    console.log(`[DEBUG] updateSBrkbnRadio: radio not found => value="${code}"`);
    return;
  }
  radioEl.checked = true;

  // jQTransformRadioWrapper 内の <a> から全解除 & 付与
  const allWrappers = document.querySelectorAll('input[type="radio"][name="s_brkbn"]').forEach((input) => {
    const wrap = input.closest(".jqTransformRadioWrapper");
    if (wrap) {
      const anchor = wrap.querySelector("a.jqTransformRadio");
      if (anchor) anchor.classList.remove("jqTransformChecked");
    }
  });
  const wrapper = radioEl.closest(".jqTransformRadioWrapper");
  if (!wrapper) return;
  const customRadio = wrapper.querySelector("a.jqTransformRadio");
  if (customRadio) {
    customRadio.classList.add("jqTransformChecked");
  }
  console.log(`[DEBUG] updateSBrkbnRadio: set radio => bunri="${bunri}", value="${code}"`);
}

/**
 * 年の更新 ("1991" => index="1")
 */
function updateYearSelect(ybirthValue) {
  if (!ybirthValue) return;
  const yearNum = parseInt(ybirthValue, 10);
  if (isNaN(yearNum)) {
    console.log("[DEBUG] updateYearSelect: invalid ybirthValue:", ybirthValue);
    return;
  }
  const indexNumber = yearNum - 1990;
  const indexString = String(indexNumber);

  const selectEl = document.querySelector('select[name="ybirth"]');
  if (selectEl) {
    selectEl.value = ybirthValue;
    console.log(`[DEBUG] <select name="ybirth"> set to ${ybirthValue}`);
  } else {
    console.log("[DEBUG] <select name='ybirth'> not found");
  }
  updateTransformUI(selectEl, indexString, ybirthValue, "year");
}

/**
 * 月の更新 ("04" => "4")
 */
function updateMonthSelect(mbirthValue) {
  if (!mbirthValue) return;
  const monthNum = parseInt(mbirthValue, 10);
  if (isNaN(monthNum)) {
    console.log("[DEBUG] updateMonthSelect: invalid mbirthValue:", mbirthValue);
    return;
  }
  const indexString = String(monthNum);

  const selectEl = document.querySelector('select[name="mbirth"]');
  if (selectEl) {
    selectEl.value = mbirthValue;
    console.log(`[DEBUG] <select name="mbirth"> set to ${mbirthValue}`);
  } else {
    console.log("[DEBUG] <select name='mbirth'> not found");
  }
  updateTransformUI(selectEl, indexString, mbirthValue, "month");
}

/**
 * 日の更新 ("15" => "15")
 */
function updateDaySelect(dbirthValue) {
  if (!dbirthValue) return;
  const dayNum = parseInt(dbirthValue, 10);
  if (isNaN(dayNum)) {
    console.log("[DEBUG] updateDaySelect: invalid dbirthValue:", dbirthValue);
    return;
  }
  const indexString = String(dayNum);

  const selectEl = document.querySelector('select[name="dbirth"]');
  if (selectEl) {
    selectEl.value = dbirthValue;
    console.log(`[DEBUG] <select name="dbirth"> set to ${dbirthValue}`);
  } else {
    console.log("[DEBUG] <select name='dbirth'> not found");
  }
  updateTransformUI(selectEl, indexString, dbirthValue, "day");
}

/**
 * jQTransformカスタムUIの更新 (<select>版)
 * @param {HTMLElement} selectEl
 * @param {string} indexString
 * @param {string} displayText
 * @param {string} type
 */
function updateTransformUI(selectEl, indexString, displayText, type) {
  if (!selectEl) return;
  const wrapper = selectEl.closest(".jqTransformSelectWrapper");
  if (!wrapper) {
    console.log(`[DEBUG] .jqTransformSelectWrapper not found for ${type}`);
    return;
  }

  // 既に selected の付いた <a> を解除
  const oldSelected = wrapper.querySelector("a.selected");
  if (oldSelected) {
    oldSelected.classList.remove("selected");
    console.log(`[DEBUG] removed .selected for ${type}`);
  }

  // <a index="xx"> を selected
  const newItem = wrapper.querySelector(`a[index="${indexString}"]`);
  if (newItem) {
    newItem.classList.add("selected");
    console.log(`[DEBUG] set .selected => index="${indexString}" for ${type}`);
  } else {
    console.log(`[DEBUG] <a index="${indexString}"> not found for ${type}`);
  }

  // トップラベルの更新
  const topDiv = wrapper.querySelector("div");
  if (topDiv) {
    const topLabel = topDiv.querySelector("span");
    if (topLabel) {
      topLabel.textContent = displayText;
      console.log(`[DEBUG] top label for ${type} => ${displayText}`);
    } else {
      console.log(`[DEBUG] top label <span> not found for ${type}`);
    }
  } else {
    console.log(`[DEBUG] no <div> in wrapper for ${type}`);
  }
}

/**
 * jqTransformCheckbox の更新 (<input type="checkbox" name="adch">)
 */
function updateTransformCheckbox(checkboxName, shouldCheck) {
  const checkboxEl = document.querySelector(`input[type="checkbox"][name="${checkboxName}"]`);
  if (!checkboxEl) {
    console.log(`[DEBUG] <input name="${checkboxName}"> not found`);
    return;
  }
  checkboxEl.checked = !!shouldCheck;
  console.log(`[DEBUG] <input name="${checkboxName}"> => ${checkboxEl.checked}`);

  const wrapper = checkboxEl.closest(".jqTransformCheckboxWrapper");
  if (!wrapper) {
    console.log(`[DEBUG] .jqTransformCheckboxWrapper not found for ${checkboxName}`);
    return;
  }
  const customCheckbox = wrapper.querySelector("a.jqTransformCheckbox");
  if (!customCheckbox) {
    console.log("[DEBUG] <a class='jqTransformCheckbox'> not found in wrapper");
    return;
  }
  if (shouldCheck) {
    customCheckbox.classList.add("jqTransformChecked");
    console.log(`[DEBUG] Added "jqTransformChecked" for ${checkboxName}`);
  } else {
    customCheckbox.classList.remove("jqTransformChecked");
    console.log(`[DEBUG] Removed "jqTransformChecked" for ${checkboxName}`);
  }
}
