const containerEl = document.getElementById('container');

const handleSidebar = () => {
	const btnSidebarOpen = document.querySelector('.btn-sidebar__open');
	const btnSidebarClose = document.querySelector('.btn-sidebar__close');
	const sidebarEl = document.querySelector('.sidebar');

	btnSidebarOpen.addEventListener('click', () => {
		sidebarEl.classList.add('active');
		containerEl.classList.add('active');
	});
	btnSidebarClose.addEventListener('click', () => {
		sidebarEl.classList.remove('active');
		containerEl.classList.remove('active');
	});
};

const renderRandomRecipe = async () => {
	const randomRecipeContainer = document.getElementById('random-recipe');
	randomRecipeContainer.innerHTML = `<div class="lds-dual-ring"></div>`;

	const getRandomRecipe = async () => {
		const RANDOM_RECIPE_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';
		const res = await fetch(RANDOM_RECIPE_URL);
		const resData = await res.json();
		const randomMeal = resData.meals[0];
		return randomMeal;
	};
	const randomMealData = await getRandomRecipe();

	const loadedState = () => {
		randomRecipeContainer.innerHTML = `
		<div class="random-recipe-container">
			<div class="random-recipe-img">
				<img
				src="${randomMealData.strMealThumb}"
				alt="${randomMealData.strMeal}"
				/>
			</div>
			<div class="random-bottom">
				<h3>${randomMealData.strMeal}</h3>
				<button class="btn fav-add"><i class="fa-solid fa-heart"></i></button>
			</div>
		</div>
		`;

		const mealId = randomMealData.idMeal;
		const imgBtn = randomRecipeContainer.querySelector('.random-recipe-img');
		imgBtn.addEventListener('click', handleRecipeDetails(imgBtn, randomMealData, mealId));

		const favBtn = randomRecipeContainer.querySelector('.fav-add');
		favBtn.addEventListener('click', () => {
			setFav(mealId);
			renderRandomRecipe();
			handleFavs();
		});
	};
	setTimeout(loadedState, 1000);
};

const handleRecipeDetails = (imgBtn, randomMealData, mealId) => {
	const recipePopup = document.querySelector('.recipe-popup');

	imgBtn.addEventListener('click', () => {
		recipePopup.classList.add('active');
		containerEl.classList.add('active');
	});

	const recipePopupTop = recipePopup.querySelector('.recipe-popup__top');
	recipePopupTop.innerHTML = `				
	<div class="recipe-popup__btns">
		<button class="btn btn-popup__close">&lt;</button>
		<button class="btn popup-fav-add"><i class="fa-solid fa-heart"></i></button>
	</div>
	<div class="recipe-popup__info">
		<div>
			<h4 class="recipe-popup__title">${randomMealData.strMeal}</h4>
			<p>${randomMealData.strCategory}</p>
		</div>
		<img class='recipe-popup__img' 
		src="${randomMealData.strMealThumb}" 
		alt="${randomMealData.strMeal}" />
	</div>
	`;

	const btnPopupClose = recipePopup.querySelector('.btn-popup__close');
	btnPopupClose.addEventListener('click', () => {
		recipePopup.classList.remove('active');
		containerEl.classList.remove('active');
	});

	const btnPopupFav = recipePopup.querySelector('.popup-fav-add');
	btnPopupFav.addEventListener('click', () => {
		const mealsIds = getFav();

		if (mealsIds.includes(mealId) === false) {
			setFav(mealId);
			btnPopupFav.classList.add('added');
			handleFavs();
		} else {
			removeFav(mealId);
			btnPopupFav.classList.remove('added');
			handleFavs();
		}
	});

	const renderRecipeDetails = () => {
		const recipePopupBottom = document.querySelector('.recipe-popup__bottom');

		const handleIngredientsAndMeasures = () => {
			const ingredientsData = [];
			const measuresData = [];

			Object.entries(randomMealData).forEach(([key, value]) => {
				if (key.match(/strIngredient*/) && value !== '') {
					ingredientsData.push(value);
				}
				if (key.match(/strMeasure*/) && value !== '') {
					measuresData.push(value);
				}
			});

			const measuredIngredients = ingredientsData.map((ingredient, i) => {
				const measure = measuresData[i];
				return {
					ingredient: ingredient,
					measure: measure,
				};
			});

			const ingredientsDiv = document.createElement('div');
			ingredientsDiv.classList.add('ingredients-div');
			for (let i = 0; i < measuredIngredients.length; i++) {
				const ingredientsList = document.createElement('div');
				ingredientsList.innerHTML = `
				<span style='color: #ff8450'>&bull;</span> 
				${measuredIngredients[i].ingredient} 
				${measuredIngredients[i].measure !== undefined ? '-' : ''} 
				${measuredIngredients[i].measure !== undefined ? measuredIngredients[i].measure : ''}
				`;

				ingredientsDiv.appendChild(ingredientsList);
			}
			recipePopupBottom.appendChild(ingredientsDiv);
		};
		handleIngredientsAndMeasures();

		const directionsDiv = document.createElement('div');
		directionsDiv.innerHTML = `<h4>Directions:</h4>
		${randomMealData.strInstructions}`;
		recipePopupBottom.appendChild(directionsDiv);
	};
	renderRecipeDetails();
};

// Handling favouriteState using localStorage
const getFav = () => {
	const mealsIds = JSON.parse(localStorage.getItem('mealsIds'));
	return mealsIds === null ? [] : mealsIds;
};
const setFav = (mealId) => {
	const mealsIds = getFav();
	if (mealsIds.length < 2) {
		mealsIds.includes(mealId) === false
			? localStorage.setItem('mealsIds', JSON.stringify([...mealsIds, mealId]))
			: null;
	}
};
const removeFav = (mealId) => {
	const mealsIds = getFav();
	localStorage.setItem('mealsIds', JSON.stringify(mealsIds.filter((id) => id !== mealId)));
};
// ---

const handleFavs = async () => {
	const favsEl = document.querySelector('.favs-container');
	favsEl.innerHTML = '';

	const getRecipeById = async (id) => {
		const RECIPE_BY_ID = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';
		const res = await fetch(RECIPE_BY_ID + id);
		const recipeData = await res.json();
		const recipeById = recipeData.meals[0];
		return recipeById;
	};

	const mealsIds = getFav();
	if (mealsIds.length === 0) {
		const favsHeading = document.createElement('h4');
		favsHeading.textContent = 'Your favourite recipes will show up here!';
		favsEl.appendChild(favsHeading);
	} else if (mealsIds.length <= 2) {
		for (let i = 0; i < mealsIds.length; i++) {
			const recipeByIdData = await getRecipeById(mealsIds[i]);
			const favEl = document.createElement('div');
			favEl.classList.add('fav-container');
			favEl.innerHTML = `						
			<button class='btn btn-remove'>&times;</button>
			<div class="img-container">
			<img src="${recipeByIdData.strMealThumb}" alt="${recipeByIdData.strMeal}" />
			</div>
			<h4>${recipeByIdData.strMeal}</h4>`;

			const btnRemove = favEl.querySelector('.btn-remove');
			btnRemove.addEventListener('click', () => {
				removeFav(mealsIds[i]);
				handleFavs();
			});
			favsEl.appendChild(favEl);
		}
	}
};

const handleSearch = async () => {
	const searchInput = document.getElementById('search-input');

	const getRecipeBySearch = async (searchTerm) => {
		searchTerm = searchInput.value;
		const RECIPE_BY_NAME = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
		if (searchTerm !== '') {
			const res = await fetch(RECIPE_BY_NAME + searchTerm);
			const recipeData = await res.json();
			const recipeByName = recipeData.meals;
			return recipeByName;
		} else {
			return '';
		}
	};

	const recipeByNameData = await getRecipeBySearch();
	const resultsDiv = document.querySelector('.search-popup');
	const btnResultsClose = document.createElement('button');
	btnResultsClose.classList.add('btn', 'results-close');
	btnResultsClose.innerHTML = '&times;';

	const showResults = () => {
		resultsDiv.textContent = '';
		if (recipeByNameData !== null) {
			for (let i = 0; i < recipeByNameData.length; i++) {
				const eachRecipe = document.createElement('div');
				eachRecipe.textContent = recipeByNameData[i].strMeal;
				resultsDiv.appendChild(eachRecipe);
			}
			searchInput.value = '';
		} else if (recipeByNameData === null) {
			const noResults = document.createElement('div');
			noResults.textContent = 'No results.';
			resultsDiv.appendChild(noResults);
		}

		searchTerm = searchInput.value;
		if (searchTerm.length === 0) {
			const enterSearch = document.createElement('div');
			enterSearch.textContent = 'Enter any term.';
			resultsDiv.appendChild(enterSearch);
		}
		resultsDiv.appendChild(btnResultsClose);
		resultsDiv.classList.add('active');
	};

	btnResultsClose.addEventListener('click', () => resultsDiv.classList.remove('active'));
	showResults();
};
const searchBtn = document.querySelector('.btn-search');
searchBtn.addEventListener('click', handleSearch);

const init = () => {
	renderRandomRecipe();
	handleSidebar();
	handleFavs();
};
init();
