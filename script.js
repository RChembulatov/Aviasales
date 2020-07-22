const inputСitiesFrom = document.querySelector(".input__cities-from");
const dropdownCitiesFrom = document.querySelector(".dropdown__cities-from");
const inputCitiesTo = document.querySelector(".input__cities-to");
const dropdownCitiesTo = document.querySelector(".dropdown__cities-to");
const formSearch = document.querySelector(".form-search");
const inputDateDepart = document.querySelector(".input__date-depart");
const cheapestTicket = document.getElementById("cheapest-ticket");
const otherCheapTickets = document.getElementById("other-cheap-tickets");
const body = document.querySelector("body");

// Список городов из базы данных
const url = "http://api.travelpayouts.com/data/ru/cities.json";
const proxy = "https://cors-anywhere.herokuapp.com/";
// API токен
const apiKey = "453e7953a2adaead5a1c5a2dac1abe22";
// Получение минимальных цен на перелёт для указанных даты вылета и городов вылета и назначения.
const calendar = "http://min-prices.aviasales.ru/calendar_preload";
const maxCards = 10;
let city = [];

// Функция получения данных
function getData(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

// Функция показа города
function showCity(input, list) {
  list.textContent = "";
  if (input.value !== "") {
    const filterCity = city.filter((item) => {
      const fixItem = item.name.toLowerCase();
      // Сравнивание список городов по первой букве
      return fixItem.startsWith(input.value.toLowerCase());
    });
    filterCity.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("dropdown__city");
      li.textContent = item.name;
      list.appendChild(li);
    });
  }
}

// Функция выбора города из выпадающего списка
function selectCityInDropdown(dropdown, inputCities) {
  dropdown.addEventListener("click", (event) => {
    const target = event.target;
    if (target.tagName.toLowerCase() === "li") {
      inputCities.value = target.textContent;
      dropdown.textContent = "";
    }
  });
}

// Функция получения даты в другом формате
const getDate = (date) => {
  const dateNew = new Date(date).toLocaleString("ru", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return dateNew;
};

// Функция получения названия городов
const getNameCity = (code) => {
  const objCity = city.find((item) => item.code === code);
  return objCity.name;
};

// Функция получения числа пересадок
const getChanges = (num) => {
  if (num) {
    return num === 1 ? "Одна пересадка" : "Две пересадки";
  } else {
    return "Без пересадок";
  }
};

// Функция покупки билета
const getLink = (data) => {
  let link = "https://www.aviasales.ru/search/";
  const date = new Date(data.depart_date);
  let day = date.getDate();
  let mounth = date.getMonth() + 1;
  // Получаем день и проверяем на первую цифру
  day = day < 10 ? "0" + day : day.toString();
  // Получаем месяц и проверяем на первую цифру
  mounth = mounth < 10 ? "0" + mounth : mounth.toString();
  link += data.origin + day + mounth + data.destination + "1";
  return link;
};

// Функция создания карточки
const createCard = (data) => {
  const ticket = document.createElement("article");
  ticket.classList.add("ticket");
  let deep;
  if (data) {
    deep = `
      <h3 class="agent">${data.gate}</h3>
      <div class="ticket__wrapper">
        <div class="left-side">
          <a href=${getLink(
            data
          )} target="_blank" class="button button__buy">Купить
            за ${data.value}₽</a>
        </div>
        <div class="right-side">
          <div class="block-left">
            <div class="city__from">Вылет из города
              <span class="city__name">${getNameCity(data.origin)}</span>
            </div>
            <div class="date">${getDate(data.depart_date)}</div>
          </div>
      
          <div class="block-right">
            <div class="changes">${getChanges(data.number_of_changes)}</div>
            <div class="city__to">Город назначения:
              <span class="city__name">${getNameCity(data.destination)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    deep = "<h3>На текущую дату билетов не нашлось</h3>";
  }
  ticket.insertAdjacentHTML("afterbegin", deep);

  return ticket;
};

// Функция вывода карточки
const renderCheapDay = (cheapTicket) => {
  // Перезаписываем карточку
  cheapestTicket.style.display = "block";
  cheapestTicket.innerHTML = "<h2>Самый дешевый билет на выбранную дату</h2>";

  const ticket = createCard(cheapTicket[0]);
  cheapestTicket.append(ticket);
};
// Функция вывода карточки
const renderCheapYear = (cheapTickets) => {
  // Перезаписываем карточку
  otherCheapTickets.style.display = "block";
  otherCheapTickets.innerHTML = "<h2>Самые дешевые билеты на другие даты</h2>";
  // Сортируем города по цене
  cheapTickets.sort((a, b) => a.value - b.value);

  for (let i = 0; i < cheapTickets.length && i < maxCards; i++) {
    const ticket = createCard(cheapTickets[i]);
    otherCheapTickets.append(ticket);
  }
};
// Собираем данные на самые дешевые билеты за месяц
const renderCheap = (response, date) => {
  const cheapTicketYear = response.best_prices;
  const cheapTicketDay = cheapTicketYear.filter((item) => {
    return item.depart_date === date;
  });

  renderCheapDay(cheapTicketDay);
  renderCheapYear(cheapTicketYear);
};

// Закрыть список городов при клике на любое место экрана
body.addEventListener("click", (e) => {
  if (
    !dropdownCitiesFrom.contains(e.target) ||
    !dropdownCitiesTo.contains(e.target)
  ) {
    dropdownCitiesFrom.innerHTML = "";
    dropdownCitiesTo.innerHTML = "";
  }
});

inputСitiesFrom.addEventListener("input", () => {
  showCity(inputСitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener("input", () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener("submit", (event) => {
  event.preventDefault();

  const cityFrom = city.find((item) => inputСitiesFrom.value === item.name);
  const cityTo = city.find((item) => inputCitiesTo.value === item.name);

  // Создаем объект, чтобы получить код города
  const formData = {
    from: cityFrom,
    to: cityTo,
    when: inputDateDepart.value,
  };

  // Проверка на правильность города
  if (formData.from && formData.to) {
    const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true=`;
    inputСitiesFrom.value = "";
    inputCitiesTo.value = "";

    // Получаем данные
    getData(proxy + calendar + requestData + apiKey)
      .then((response) => {
        renderCheap(response, formData.when);
      })
      .catch((err) => {
        cheapestTicket.style.display = "block";
        cheapestTicket.innerHTML = "<h2>В этом направлении нет рейсов</h2>";
        otherCheapTickets.innerHTML = "";
        console.log(err);
      });
  } else {
    cheapestTicket.innerHTML = "<h2>Введите правильное название города</h2>";
    otherCheapTickets.innerHTML = "";
  }
});

selectCityInDropdown(dropdownCitiesFrom, inputСitiesFrom);
selectCityInDropdown(dropdownCitiesTo, inputCitiesTo);

//Получаем города
getData(proxy + url).then((data) => {
  city = data.filter((item) => item.name);

  //Сортируем города по названию
  city.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    // a должно быть равным b
    return 0;
  });
});
