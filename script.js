"use strict";

//create nessesary nodes
const tagList = {
  gallery: document.querySelector('ul'),
  modal: document.querySelector(".lightbox"),
  image: document.querySelector(".lightbox__image")
};

// state imitation
const state = {
  query: 'all',
  page: 1,
  data: []
};

// listen form submits
const inputNode = document.getElementById('search-form');
inputNode.addEventListener('submit', inputHandler);

// get query parameters
function getQueryParams(query, page = 1) {
  return {
    key: '15249615-5ccf49bef51d4f01888f64cb2',
    image_type: 'photo',
    orientation: 'horizontal',
    q: query,
    page,
    per_page: 20,
  };
}

// makes a GET request for new images
async function getImagesByQuery(query) {
  const queryString = getQueryParamsToString(query);
  const fetchURL = `https://pixabay.com/api/?${queryString}`;

  const data = await fetch(fetchURL)
    .then((response) => response.text())
    .then((result) => JSON.parse(result))
    .catch((error) => console.log('error', error));

  return data;
}

// get a string of query parameters from an object
function getQueryParamsToString(params) {
  const query = [];

  for (const [key, value] of Object.entries(params)) {
    const param = `${key}=${value}`;
    query.push(param);
  }

  return query.join('&');
}

// inputHandler (form submit)
function inputHandler(event) {
  event.preventDefault();
  const inputValue = event.target.elements[0].value;

  state.query = inputValue;
  renderQueryResults(inputValue);
}

// render list elements
async function renderQueryResults(value, page = 1) {
  let queryParams;
  const listNode = document.querySelector('ul');

  if (page < 2) listNode.innerHTML = '';

  queryParams = getQueryParams(value, page);
  const data = await getImagesByQuery(queryParams);
  const result = [...data.hits];
  state.data = result;

  result.map((el) => {
    const imgTag = document.createElement('img');
    imgTag.setAttribute('src', el.webformatURL);
    imgTag.setAttribute('alt', el.tags);
    imgTag.setAttribute('data-source', el.largeImageURL);
    listNode.appendChild(imgTag);
  });

  return result;
}

// handle scroll
window.onscroll = function (ev) {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {

    state.page += 1;
    const nextPage = state.page;

    renderQueryResults(state.query, nextPage);
  }
};

// adding listener
tagList.gallery.addEventListener("click", handleClick);
tagList.modal.addEventListener("click", handleClose);
document.addEventListener("keydown", handleKeyPress);

// modal handlers
function handleClick(event) {

  event.preventDefault();
  tagList.modal.classList.add("is-open");
  tagList.image.src = event.target.dataset.source;
}

function handleClose(event) {
  event.preventDefault();
  if (event.target === tagList.image) {
    return;
  }
  tagList.modal.classList.remove("is-open");
  tagList.image.src = "";
}

function allowedKey(key) {
  const ALLOWED_KEYS = ["Escape", "ArrowRight", "ArrowLeft"];
  return ALLOWED_KEYS.includes(key);
}

 function handleKeyPress(event) {
  if (!allowedKey(event.code)) {
    return;
  }

  if (event.code === "Escape") {
    tagList.modal.classList.remove("is-open");
    tagList.image.src = "";
    return;
  }

  let index;

  const galleryItems = state.data

  galleryItems.find((item, currentIndex) => {
    index = currentIndex;
    return item.largeImageURL === tagList.image.src;
  });

  if (event.code === "ArrowRight") {
    index += 1;
  }
  if (event.code === "ArrowLeft") {
    index -= 1;
  }
  if (index < 0) {
    index = galleryItems.length - 1;
  }
  if (index > galleryItems.length - 1) {
    index = 0;
  }
  tagList.image.src = galleryItems[index].largeImageURL;

}