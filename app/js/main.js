'use strict';

const form = document.querySelector('.form');
const formInput = form.querySelector('.form__input');
const formBtn = form.querySelector('.form__btn');
const usersList = document.querySelector('.users__list');
const usersContainer = document.querySelector('.users');

const urlUsers = 'https://api.github.com/search/users?q=';
const urlUser = 'https://api.github.com/users/';

let users = [];

const getData = async searchQuery => {
  try {
    const { items } = await fetch(`${urlUsers}${searchQuery}&per_page=10`).then(
      response => response.json()
    );

    const users = items.map(item => item.login);
    getUsers(users);
  } catch (err) {
    alert(err);
    console.error(err);
    throw err;
  }
};

const getUsers = async names => {
  let responses = [];

  for (let name of names) {
    let response = fetch(`${urlUser}${name}`).then(
      successResponse => {
        if (successResponse.status != 200) {
          return null;
        } else {
          return successResponse.json();
        }
      },
      failResponse => {
        return null;
      }
    );
    responses.push(response);
  }

  users = await Promise.all(responses);

  checkEmptyList();

  users.map(item => renderCard(item));
};

const handleFormSubmit = () => {
  const querySubstring = formInput.value;

  if (querySubstring.length < 3) {
    usersList.style.display = 'none';

    formInput.parentElement.insertAdjacentHTML(
      'beforeend',
      `<span class="alert">Недостаточно символов для поиска</span>`
    );
    return;
  }

  getData(querySubstring);
  formInput.value = '';
};

const renderCard = user => {
  const cardHTML = `
  <li class="users__list-item">
                  <div class="user">
                    <div class="user__info">
                      <div class="user__image">
                        <img
                          width="100"
                          src=${
                            user.avatar_url
                              ? user.avatar_url
                              : './images/avatar.png'
                          }
                          alt="Аватар пользователя"
                        />
                      </div>
                      <div class="user__data">
                        <h1 class="user__name">
                          Имя
                          <a href=${user.html_url}>@${user.login}</a>
                        </h1>
                        <p class="user__about">${
                          user.bio && user.bio !== null ? user.bio : ''
                        }</p>
                      </div>
                    </div>
                    <ul class="user__stats">
                      <li class="user__stats-item">
                        Репозитории
                        <span>${user.public_repos}</span>
                      </li>
                      <li class="user__stats-item">
                        Подписчиков
                        <span>${user.followers}</span>
                      </li>
                      <li class="user__stats-item">
                        Подписок
                        <span>${user.following}</span>
                      </li>
                    </ul>
                    <ul class="user__location">
                      <li class="user__location-item">${
                        user.location ? user.location : 'Локация не опознана'
                      }</li>
                      <li class="user__location-item">
                        <a href="#">${user.blog ? user.blog : ''}</a>
                      </li>
                    </ul>
                  </div>
                </li>
  `;

  usersList.insertAdjacentHTML('beforeend', cardHTML);
};

/* Helpers */

const clearAlert = () => {
  const alert = form.querySelector('.alert');
  if (alert) {
    alert.remove();
  }
};

const checkEmptyList = () => {
  if (users.length === 0) {
    const emptyListHTML = `<div className="user__info" id="emptyList">
    <h2>Ничего не найдено</h2>
  </div>`;
    usersContainer.insertAdjacentHTML('afterbegin', emptyListHTML);
  }

  if (users.length > 0) {
    const emptyListEl = document.querySelector('#emptyList');
    emptyListEl ? emptyListEl.remove() : null;
  }

  usersList.style.display = 'block';
  usersList.textContent = '';
};

/* Handlers */
form.addEventListener('submit', e => {
  e.preventDefault();
  handleFormSubmit();
});

formInput.addEventListener('input', clearAlert);
