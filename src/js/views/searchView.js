import { elements } from "./base";

export const getInput = () => elements.searchField.value;

export const clearInput = () => {
  elements.searchField.value = "";
};

export const clearResults = () => {
  elements.searchResList.innerHTML = "";
  elements.searchResPage.innerHTML = "";
};

export const highlightSelector = id => {
  const resultsArr = Array.from(document.querySelectorAll(".results__link"));
  resultsArr.forEach(el => el.classList.remove("results__link--active"));

  if (document.querySelector(`a[class="results__link"]`)) {
    document
      .querySelector(`.results__link[href*="#${id}"]`)
      .classList.add("results__link--active");
  }
};

/**
 * pho la mon an viet nam
 * acc = 0 / cur = pho / acc + cur.length = 3
 * acc = 3 / cur = la / acc + cur.length = 5
 */
export const limitRecipeTitle = (title, limit = 17) => {
  const newTitle = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);
    return `${newTitle.join(" ")} ...`;
  }
  return title;
};

const renderRecipe = recipe => {
  const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(
                      recipe.title
                    )}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
  elements.searchResList.insertAdjacentHTML("beforeend", markup);
};

const creatButton = (page, type) => `
  <button class="btn-inline results__btn--${type}" data-goto=${
  type === "prev" ? page - 1 : page + 1
}>
    <svg class="search__icon">
      <use href="img/icons.svg#icon-triangle-${
        type === "prev" ? "left" : "right"
      }"></use>
    </svg>
    <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
  </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
  const pages = Math.ceil(numResults / resPerPage);
  let button;
  if (page === 1 && pages > 1) {
    // chi render button phai
    button = creatButton(page, "next");
  } else if (page < pages) {
    // render ca hai button
    button = `
      ${creatButton(page, "prev")}
      ${creatButton(page, "next")}
      `;
  } else if (page === pages && pages > 1) {
    // chi render button trai
    button = creatButton(page, "prev");
  }
  elements.searchResPage.insertAdjacentHTML("afterbegin", button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;
  if (recipes.length !== 0) {
    recipes.slice(start, end).forEach(renderRecipe);
    renderButtons(page, recipes.length, resPerPage);
  }

};
