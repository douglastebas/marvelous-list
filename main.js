const apiParams =
  "?ts=1&apikey=38deea23ffa44d1057365eeb86404f4e&hash=b10c8b62d302ea1de95b2bc0c482b151&limit=10";
const apiUrl = "http://gateway.marvel.com/v1/public";

let characterDetails = new Object();
let listOfCharacters = [];
let series = [];
let events = [];
let perPage = 10;
let dataLenght = 1493;
let offset = 0;
let nameSearch = "";

if (!location.hash) {
  location.hash = "#home";
}

const state = {
  page: 1,
  perPage,
  totalPage: Math.ceil(dataLenght / perPage),
  maxVisibleButton: 5,
};

const html = {
  get(element) {
    return document.querySelector(element);
  },
};

const controls = {
  next() {
    stage.page++;

    const lastpage = state.page > state.totalPage;
    if (lastpage) {
      state.page--;
    }
  },
  prev() {
    stage.page--;

    if (state.page < 1) {
      state.page++;
    }
  },
  goto(page) {
    if (page < 1) {
      page = 1;
    }

    state.page = +page;

    if (page > state.totalPage) {
      state.page = state.totalPage;
    }
  },
  createListeners() {
    html.get(".first").addEventListener("click", () => {
      offset = 0;
      controls.goto(1);
      getAllCharacters();
    });

    html.get(".last").addEventListener("click", () => {
      offset = state.totalPage - 1;
      controls.goto(state.totalPage);
      getAllCharacters();
    });

    html.get(".next").addEventListener("click", () => {
      offset = state.page;
      controls.goto(state.page + 1);
      getAllCharacters();
    });

    html.get(".prev").addEventListener("click", () => {
      offset = state.page - 2;
      controls.goto(state.page - 1);
      getAllCharacters();
    });
  },
};

function showElement(boolean, id) {
  const element = document.getElementById(id);
  switch (boolean) {
    case true:
      element.style.display = "block";
      break;
    default:
      element.style.display = "none";
      break;
  }
}
const screen = {
  showLoading() {
    showElement(true, "divLoading");
  },
  hideLoading() {
    showElement(false, "divLoading");
  },
  showList() {
    showElement(true, "divSearch");
    showElement(true, "paginate");
  },
  hideList() {
    showElement(false, "divSearch");
    showElement(false, "paginate");
  },

  showDetails() {
    showElement(true, "divDetails");
  },
  hideDetails() {
    showElement(false, "divDetails");
    let appearanceDiv = document.getElementById("divAppearances");
    appearanceDiv.innerHTML = "";
    let infosDiv = document.getElementById("divInfos");
    infosDiv.innerHTML = "";
  },
};

const list = {
  create(item) {
    let card = `
        <div class="row" onclick="seeDetails(${item.id})">
          <div class="column">
            <div class="card">
              <table>
                <tr>
                  <td class="thumbnail">
                    <img src="${item.thumbnail.path}/standard_medium.${
      item.thumbnail.extension
    }" alt="Thumbnail">
                  </td>
                  <td class="nameTd">
                    <strong>${item.name}</strong>
                  </td>
                  <td class="info-font seriesTd d-none-mobile">
                    <p>${
                      item.series.items.length > 0
                        ? item.series.items[0].name
                        : "Não informado"
                    }</p>
                    <p>${
                      item.series.items.length > 1
                        ? item.series.items[1].name
                        : ""
                    }</p>
                  </td>
                  <td class="info-font eventsTd d-none-mobile">
                    <p>${
                      item.events.items.length > 0
                        ? item.events.items[0].name
                        : "Não informado"
                    }</p>
                    <p>${
                      item.events.items.length > 1
                        ? item.events.items[1].name
                        : ""
                    }</p>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      `;

    let infosDiv = document.getElementById("divListOfCharacter");
    infosDiv.innerHTML += card;
  },
  update(data) {
    html.get(".list").innerHTML = "";

    let page = state.page - 1;
    let start = page * state.perPage;
    let end = start + state.perPage;
    const paginatedItems = data;

    paginatedItems.forEach(list.create);

    screen.showList();
    screen.hideLoading();
  },
  clean() {
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = "";
  },
};

const buttons = {
  element: html.get(".pagination .numbers"),
  create(number) {
    const button = document.createElement("div");

    button.innerHTML = number;

    if (state.page == number) {
      button.classList.add("active");
    }

    button.addEventListener("click", (event) => {
      const page = event.target.innerText;
      offset = page - 1;
      controls.goto(page);
      getAllCharacters();
    });

    buttons.element.appendChild(button);
  },
  update() {
    buttons.element.innerHTML = "";
    const { maxLeft, maxRight } = buttons.calculateMaxVisible();

    for (let page = maxLeft; page <= maxRight; page++) {
      buttons.create(page);
    }
  },
  calculateMaxVisible() {
    const { maxVisibleButton } = state;
    let maxLeft = state.page - Math.floor(maxVisibleButton / 2);
    let maxRight = state.page + Math.floor(maxVisibleButton / 2);

    if (maxLeft < 1) {
      maxLeft = 1;
      maxRight = 5;
    }

    if (maxRight > state.totalPage) {
      maxLeft = state.totalPage - (maxVisibleButton - 1);
      maxRight = state.totalPage;
    }

    return { maxLeft, maxRight };
  },
};

function update(data) {
  list.update(data);
  buttons.update(data);
}

let timeout;
function search() {
  nameSearch = document.getElementById("inputSearch").value;
  clearTimeout(timeout);
  timeout = setTimeout(getAllCharacters, 1000);
}

function init() {
  controls.createListeners();
  screen.showLoading();
  screen.hideDetails();
  screen.hideList();

  getAllCharacters();
}

init();

function createCard(char) {
  const card =
    `
      <div class="card">
        <h4>` +
    char.name +
    `</h4>
        <p>` +
    char.description +
    `</p>
        <p>Some text</p>
      </div>
    `;
  return card;
}

function request() {
  fetch(apiUrl + "/characters" + apiParams).then((res) => {});
}

async function getAllCharacters() {
  let path = `/characters`;
  let url = apiUrl + path + apiParams + `&offset=${offset}`;
  if (nameSearch != "") url += `&nameStartsWith=${nameSearch}`;
  fetch(url)
    .then((response) => {
      response.json().then((resJson) => {
        sessionStorage.setItem("list", JSON.stringify(resJson.data));
        update(resJson.data.results);
      });
    })
    .catch(function (err) {
      console.error("Failed retrieving information", err);
    });
}

async function getCharactersByName(name) {
  let path = `/characters`;
  const url =
    apiUrl + path + apiParams + `&offset=${offset}&nameStartsWith=${name}`;
  fetch(url)
    .then((response) => {
      response.json().then((resJson) => {
        sessionStorage.setItem("list", JSON.stringify(resJson.data));
        update(resJson.data.results);
      });
    })
    .catch(function (err) {
      console.error("Failed retrieving information", err);
    });
}

async function getCharacterById(id) {
  let path = `/characters/${id}`;
  const url = apiUrl + path + apiParams;
  fetch(url)
    .then((response) => {
      response.json().then((resJson) => {
        loadDetails(resJson.data.results[0]);
      });
    })
    .catch(function (err) {
      console.error("Failed retrieving information", err);
    });
}

async function getCharacterSeries(id) {
  let path = `/characters/${id}/series`;
  const url = apiUrl + path + apiParams;
  fetch(url)
    .then((response) => {
      response.json().then((resJson) => {
        append.serie(resJson.data.results);
      });
    })
    .catch(function (err) {
      console.error("Failed retrieving information", err);
    });
}

async function getCharacterEvents(id) {
  let path = `/characters/${id}/events`;
  const url = apiUrl + path + apiParams;
  fetch(url)
    .then((response) => {
      response.json().then((resJson) => {
        append.event(resJson.data.results);
      });
    })
    .catch(function (err) {
      console.error("Failed retrieving information", err);
    });
}

function getRequest(path) {
  const url = `http://gateway.marvel.com/v1/public${path}${apiParams}`;
  fetch(url)
    .then((response) => {
      response.json().then((resJson) => {
        return resJson.data;
      });
    })
    .catch(function (err) {
      console.error("Failed retrieving information", err);
    });
}

// Details
async function seeDetails(id) {
  screen.showLoading();
  screen.hideList();
  getCharacterById(id);
}

function loadDetails(obj) {
  screen.hideLoading();
  screen.showDetails();
  append.charDetails(obj);
  getCharacterEvents(obj.id);
  getCharacterSeries(obj.id);
}

function backToList() {
  screen.hideDetails();
  screen.showList();
  // init();
}

const append = {
  charDetails(char) {
    let details = `
        <div class="col">
          <div class="row">
            <div class="divTitle">
              ${char.name}
            </div>
          </div>
          <div class="row">
            <div class="appearanceCard">
              <img src="${char.thumbnail.path}/portrait_uncanny.${
      char.thumbnail.extension
    }" alt="${char.title}" style="width:100%">
            </div>
          </div>
          <div class="row">
            <div class="col">
              <p class="info-font left">${
                char.description != null ? char.description : ""
              }</p>
            </div>
          </div>
        </div>
      `;

    let infosDiv = document.getElementById("divInfos");
    infosDiv.innerHTML += details;
  },

  event(list) {
    list.forEach((obj) => {
      let event = `
        <div class="col col-3">
          <div class="appearanceCard">
            <img src="${obj.thumbnail.path}/portrait_uncanny.${
        obj.thumbnail.extension
      }" alt="${obj.title}" style="width:100%">
            <h2>${obj.title}</h2>
            <a href="${obj.urls[0].url}" target="_blank">Ir ao site</a>
          </div>
        </div>
        `;
      let contentDiv = document.getElementById("divAppearances");
      contentDiv.innerHTML += event;
    });
  },

  serie(list) {
    list.forEach((obj) => {
      let serie = `
          <div class="col col-3">
            <div class="appearanceCard">
              <img src="${obj.thumbnail.path}/portrait_large.${
        obj.thumbnail.extension
      }" alt="${obj.title}" style="width:100%">
              <h2>${obj.title}</h2>
              <a href="${obj.urls[0].url}" target="_blank">Ir ao site</a>
            </div>
          </div>
        `;
      let contentDiv = document.getElementById("divAppearances");
      contentDiv.innerHTML += serie;
    });
  },
};
