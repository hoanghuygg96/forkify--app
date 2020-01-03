import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views//listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";

/**
 * global state of app
 * - search object
 * - current recipe object
 * - shopping list object
 * - like recipe
 */
const state = {};
window.state = state;
/**
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
  // 1.get query từ view
  const query = searchView.getInput();

  if (query) {
    // 2.new đối tượng search và add vào view
    state.search = new Search(query);

    // 3.chuẩn bị ui cho kết quả
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      // 4.search công thưc
      await state.search.getResults();

      // 5.render ui
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      console.log(err);
      alert("Unfortunately, Food2Fork is down :((");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchRes.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const gotoPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, gotoPage);
  }
});

/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
  // lay id tu su kien click window
  const id = window.location.hash.replace("#", "");
  console.log(id);
  if (id) {
    // clean giao dien
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // highlight
    searchView.highlightSelector(id);

    // tao doi tuong recipe moi
    state.recipe = new Recipe(id);

    try {
      // lay chi tiet recipe va su ly data cong thuc
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // tinh thoi gian servings va time
      state.recipe.calcTime();
      state.recipe.calcServings();
      console.log("TCL: controlRecipe -> state.recipe", state.recipe);

      // render UI
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (err) {
      console.log(err);
      alert("error");
    }
  }
};

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

/**
 * LIST CONTROLLER
 */

const controlList = () => {
  if (!state.list) state.list = new List();

  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

/**
 * LIKES CONTROLLER
 */

const controlLikes = () => {
  // check state
  // if (!state.likes) state.likes = new Likes();
  const currentId = state.recipe.id;

  if (!state.likes.isLiked(currentId)) {
    // add like
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    // UI
    likesView.toggleLikeBtn(true);

    likesView.renderLike(newLike);
    console.log(state.likes);
  } else {
    // remove like
    state.likes.deleteLike(currentId);

    // UI
    likesView.toggleLikeBtn(false);

    likesView.deleteLike(currentId);
    console.log(state.likes);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

window.addEventListener("load", () => {
  state.likes = new Likes();

  state.likes.readStorage();

  likesView.toggleLikeMenu(state.likes.getNumLikes());

  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// handle delete and update
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    // delete in ui
    listView.deleteItem(id);

    // delete in state
    state.list.deleteItem(id);
  } else if (e.target.matches(".shopping__count--value")) {
    const val = parseFloat(e.target.value, 10);

    state.list.updateCount(id, val);
  }
});

// hanlde event recipe
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // target btn decrease
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // target btn increase
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLikes();
  }
  console.log(state.recipe);
});
