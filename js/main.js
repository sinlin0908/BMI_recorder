{
  // Variables
  let lastStatusClass = null;
  const bmiHistoryFromLocalStorage = localStorage.getItem("bmiHistory");
  const bmiHistory = bmiHistoryFromLocalStorage
    ? JSON.parse(bmiHistoryFromLocalStorage)
    : [];
  const resultBtn = document.querySelector(".js-submitBtn");
  const heightTag = document.querySelector(".js-height");
  const weightTag = document.querySelector(".js-weight");
  const listTag = document.querySelector(".js-list");

  const status2class = {
    理想: "good",
    過輕: "thin",
    過重: "fat",
    輕度肥胖: "middleFat",
    中度肥胖: "middleFat",
    重度肥胖: "veryFat",
  };

  // Functions
  const showBmiHistory = (data) => {
    if (!data) {
      return;
    }
    data.forEach((element) => {
      const { id, status, weight, height, bmi, date } = element;
      listTag.innerHTML += getListItemHTML({
        id: id,
        weight: weight,
        height: height,
        bmi: bmi,
        status: status,
        date: date,
      });
    });
  };
  const getListItemHTML = (data) => {
    const { id, weight, height, bmi, status, date } = data;
    return `
      <li class="list__item list__item--${status2class[status]}" data-id=${id}>
        <p class="status js-status">${status}</p>
        <p>BMI: <span class="value">${bmi}</span></p>
        <p>weight: <span class="value">${weight}</span></p>
        <p>height: <span class="value">${height}</span></p>
        <p class="time">${date}$</p>
        <button class="btn deleteBtn">
            <i class="fas fa-trash"></i>
        </button>
    </li>
    `;
  };
  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) {
      return "過輕";
    }
    if (bmi >= 18.5 && bmi < 24) {
      return "理想";
    }
    if (bmi >= 24 && bmi < 27) {
      return "過重";
    }
    if (bmi >= 27 && bmi < 30) {
      return "輕度肥胖";
    }
    if (bmi >= 30 && bmi < 35) {
      return "中度肥胖";
    }
    if (bmi >= 35) {
      return "重度肥胖";
    }
  };
  const computeBMI = (weight, height) => {
    height /= 100;
    let bmi = weight / (height * height);
    bmi = Math.round(bmi * 100) / 100;
    return bmi;
  };
  const showResultStatus = (resultTag, status) => {
    resultBtn.classList.add("submitBtn--hide");

    const resultClassList = resultTag.classList;
    resultClassList.remove("result--hide");

    if (lastStatusClass) {
      resultClassList.remove(`result--${lastStatusClass}`);
    }
    const statusClass = status2class[status];
    lastStatusClass = statusClass;

    resultClassList.add(`result--${statusClass}`);
  };
  const redo = (resultTag) => {
    heightTag.value = "";
    weightTag.value = "";
    const resultClassList = resultTag.classList;
    resultClassList.add("result--hide");
    resultBtn.classList.remove("submitBtn--hide");
  };
  const appendToList = (data) => {
    const { weight, height, bmi, status } = data;
    const date = moment().format("MM-DD-YYYY");
    const id = moment().format("YYYYMMDDHHmmss");

    listTag.innerHTML += getListItemHTML({
      id: id,
      weight: weight,
      height: height,
      bmi: bmi,
      status: status,
      date: date,
    });
    bmiHistory.push({
      id: id,
      status: status,
      weight: weight,
      height: height,
      bmi: bmi,
      date: date,
    });
    localStorage.setItem("bmiHistory", JSON.stringify(bmiHistory));
  };

  const showResult = (bmi, status) => {
    const resultTag = document.querySelector(".js-result");
    const bmiValueTag = document.querySelector(".js-result__value");
    const bmiStatusTag = document.querySelector(".js-result__status");
    const resultRedoBtn = document.querySelector(".js-redoBtn");

    bmiStatusTag.textContent = `${status}`;
    bmiValueTag.textContent = `${bmi}`;

    showResultStatus(resultTag, status);
    resultRedoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      redo(resultTag);
    });
  };
  const deleteRecord = (id, targetNode) => {
    const index = bmiHistory.findIndex((ele) => ele.id === id);
    bmiHistory.splice(index, 1);
    localStorage.setItem("bmiHistory", JSON.stringify(bmiHistory));
    listTag.removeChild(targetNode);
  };

  // Main

  showBmiHistory(bmiHistory);
  resultBtn.addEventListener("click", (e) => {
    e.preventDefault();

    let height = heightTag.value;
    let weight = weightTag.value;

    if (!height || !weight) {
      alert("請填入數字!!");
      return;
    }

    height = parseFloat(height);
    weight = parseFloat(weight);

    if (height <= 0 || weight <= 0) {
      alert("不要填負數!!");
      return;
    }

    const bmi = computeBMI(weight, height);

    if (bmi > 100) {
      alert(`BMI ${bmi} 你不是人....`);
      return;
    }

    const status = getBMIStatus(bmi);

    showResult(bmi, status);
    appendToList({
      weight: weight,
      height: height,
      bmi: bmi,
      status: status,
    });
  });

  listTag.addEventListener("click", (e) => {
    e.preventDefault();
    const currentNode = e.target;
    const currentNodeName = currentNode.nodeName;
    if (currentNodeName !== "BUTTON" && currentNodeName !== "I") {
      return;
    }
    let id = null;
    let LiNode = null;
    if (currentNodeName === "BUTTON") {
      LiNode = currentNode.parentNode;
      id = LiNode.dataset.id;
    } else {
      LiNode = currentNode.parentNode.parentNode;
      id = LiNode.dataset.id;
    }
    deleteRecord(id, LiNode);
  });
}
