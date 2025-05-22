import TabPaneController from "../../../share/tab-pane-controller.js";
import COOKBOOK_SERVICE from "../../../share/cookbook-service.js";
import { CATEGORY, DIET, UNIT } from "./enums.js"


/**
 * Recipe viewer tab pane controller type.
 */
class RecipeViewerTabPaneController extends TabPaneController {

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.recipe-viewer");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get recipesQuerySection () { return this.center.querySelector("section.recipes-query"); }
	get recipesQueryTitleInput () { return this.recipesQuerySection.querySelector("div.title>input"); }
	get recipesQueryDescriptionInput () { return this.recipesQuerySection.querySelector("div.description>input"); }
	get recipesQueryInstructionInput () { return this.recipesQuerySection.querySelector("div.instruction>input"); }
	get recipesQueryMinIngredientCountInput () { return this.recipesQuerySection.querySelector("div.min-ingredient-count>input"); }
	get recipesQueryCategorySelector () { return this.recipesQuerySection.querySelector("div.category>select"); }
	get recipesQueryDietsSelector () { return this.recipesQuerySection.querySelector("div.diets>select"); }
	get recipesQueryAuthorshipSelector () { return this.recipesQuerySection.querySelector("div.authorship>select"); }
	get recipesQueryButton () { return this.recipesQuerySection.querySelector("div.control>button.query"); }

	get recipesViewerSection () { return this.center.querySelector("section.recipes-viewer"); }
	get recipesViewerTableBody () { return this.recipesViewerSection.querySelector("div.recipes>table>tbody"); }

	get recipeViewerSection () { return this.center.querySelector("section.recipe-viewer"); }
	get recipeViewerAvatarViewer () { return this.recipeViewerSection.querySelector("span.avatar>img"); }
	get recipeViewerTitleOutput () { return this.recipeViewerSection.querySelector("div.title>input"); }
	get recipeViewerDietOutput () { return this.recipeViewerSection.querySelector("div.diet>input"); }
	get recipeViewerCategoryOutput () { return this.recipeViewerSection.querySelector("div.category>input"); }
	get recipeViewerDescriptionArea () { return this.recipeViewerSection.querySelector("div.description>textarea"); }
	get recipeViewerInstructionArea () { return this.recipeViewerSection.querySelector("div.instruction>textarea"); }
	get recipeViewerIngredientsDivision () { return this.recipeViewerSection.querySelector("div.ingredients"); }
	get recipeViewerIngredientsTableBody () { return this.recipeViewerIngredientsDivision.querySelector("table>tbody"); }
	get recipeViewerIllustrationsDivision () { return this.recipeViewerSection.querySelector("div.illustrations"); }
	get recipeViewerIllustrationsTableBody () { return this.recipeViewerIllustrationsDivision.querySelector("table>tbody"); }
	get recipeViewerCancelButton () { return this.recipeViewerSection.querySelector("div.control>button.cancel"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const recipesQuerySectionTemplate = await this.queryTemplate("recipes-query");
			this.center.append(recipesQuerySectionTemplate.content.firstElementChild.cloneNode(true));

			// register basic event listeners
			this.recipesQueryButton.addEventListener("click", event => this.processQueryRecipes());

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries the recipes matching the filter criteria
	 * provided, and displays them within a new section.
	 */
	async processQueryRecipes () {
		try {
			const minIngredientCount = window.parseInt(this.recipesQueryMinIngredientCountInput.value.trim()) || null;
			const authorship = this.recipesQueryAuthorshipSelector.value.trim();
			const authored = authorship === "" ? null : authorship === "HAS_AUTHOR";
			const category = this.recipesQueryCategorySelector.value.trim() || null;
			const title = this.recipesQueryTitleInput.value.trim() || null;
			const description = this.recipesQueryDescriptionInput.value.trim() || null;
			const instruction = this.recipesQueryInstructionInput.value.trim() || null;
			const diets = Array.from(this.recipesQueryDietsSelector.selectedOptions).map(optionElement => optionElement.value.trim());

			const recipes = await COOKBOOK_SERVICE.queryRecipes(null, 100, null, null, null, null, category, title, description, instruction, minIngredientCount, null, null, null, authored, diets);
			await this.#displayRecipes(recipes);

			this.messageOutput.value = "ok";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Displays the given recipes within a new section.
	 * @param recipes the recipes
	 */
	async #displayRecipes (recipes) {
		if (!this.recipesViewerSection) {
			const recipesViewerSectionTemplate = await this.queryTemplate("recipes-viewer");
			this.center.append(recipesViewerSectionTemplate.content.firstElementChild.cloneNode(true));
		}

		this.recipesViewerTableBody.innerHTML = "";
		const recipesViewerTableRowTemplate = await this.queryTemplate("recipes-viewer-row");
		for (const recipe of recipes) {
			const tableRow = recipesViewerTableRowTemplate.content.firstElementChild.cloneNode(true);
			this.recipesViewerTableBody.append(tableRow);

			const accessButton = tableRow.querySelector("td.access>button");
			accessButton.addEventListener("click", event => this.processDisplayRecipeViewer(recipe));
			accessButton.querySelector("img").src = COOKBOOK_SERVICE.documentsURI + "/" + recipe.attributes["avatar-reference"];
			tableRow.querySelector("td.title").innerText = recipe.title || "";
			tableRow.querySelector("td.diet").innerText = DIET[recipe.attributes["diet"]];
			tableRow.querySelector("td.category").innerText = CATEGORY[recipe.category];
			tableRow.querySelector("td.ingredient-count").innerText = recipe.attributes["ingredient-count"].toString();
			tableRow.querySelector("td.modified").innerText = new Date(recipe.modified).toLocaleDateString();
		}
	}


	/**
	 * Displays the given recipe within a new section.
	 * @param recipe the recipe
	 */
	async processDisplayRecipeViewer (recipe) {
		this.recipesQuerySection.classList.add("hidden");
		this.recipesViewerSection.classList.add("hidden");

		try {
			const recipeViewerSectionTemplate = await this.queryTemplate("recipe-viewer");
			this.center.append(recipeViewerSectionTemplate.content.firstElementChild.cloneNode(true));

			this.recipeViewerAvatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + recipe.attributes["avatar-reference"];
			this.recipeViewerTitleOutput.value = recipe.title || "";
			this.recipeViewerDietOutput.value = DIET[recipe.attributes["diet"]] || "";
			this.recipeViewerCategoryOutput.value = CATEGORY[recipe.category] || "";
			this.recipeViewerDescriptionArea.value = recipe.description || "";
			this.recipeViewerInstructionArea.value = recipe.instruction || "";
			this.recipeViewerCancelButton.addEventListener("click", event => this.processCancel());

			await Promise.all([
				this.#displayRecipeIngredients(recipe.identity),
				this.#displayRecipeIllustrations(recipe.identity)
			]);

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Removes the recipe view section and re-displays the two hidden ones.
	 */
	async processCancel () {
		try {
			this.recipeViewerSection.remove();
			this.recipesQuerySection.classList.remove("hidden");
			this.recipesViewerSection.classList.remove("hidden");

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Displays the given recipe's ingredients.
	 * @param recipeIdentity the recipe identity
	 */
	async #displayRecipeIngredients (recipeIdentity) {
		const recipeIngredients = await COOKBOOK_SERVICE.queryRecipeIngredients(recipeIdentity);

		this.recipeViewerIngredientsTableBody.innerHTML = "";
		const recipeViewerIngredientsTableRowTemplate = await this.queryTemplate("recipe-viewer-ingredient-row");
		for (const ingredient of recipeIngredients) {
			const tableRow = recipeViewerIngredientsTableRowTemplate.content.firstElementChild.cloneNode(true);
			this.recipeViewerIngredientsTableBody.append(tableRow);

			tableRow.querySelector("td.avatar>img").src = COOKBOOK_SERVICE.documentsURI + "/" + ingredient.victual.attributes["avatar-reference"];
			tableRow.querySelector("td.alias").innerText = ingredient.victual.alias;
			tableRow.querySelector("td.diet").innerText = DIET[ingredient.victual.diet];
			tableRow.querySelector("td.amount").innerText = ingredient.amount.toString();
			tableRow.querySelector("td.unit").innerText = UNIT[ingredient.unit];
		}
	}


	/**
	 * Displays the given recipe's illustrations.
	 * @param recipeIdentity the recipe identity
	 */
	async #displayRecipeIllustrations (recipeIdentity) {
		const recipeIllustrations = await COOKBOOK_SERVICE.queryRecipeIllustrations(recipeIdentity);

		this.recipeViewerIllustrationsTableBody.innerHTML = "";
		const recipeViewerIllustrationsTableRowTemplate = await this.queryTemplate("recipe-viewer-illustration-row");
		for (const illustration of recipeIllustrations) {
			const tableRow = recipeViewerIllustrationsTableRowTemplate.content.firstElementChild.cloneNode(true);
			this.recipeViewerIllustrationsTableBody.append(tableRow);

			const anchor = tableRow.querySelector("td.content>a");
			anchor.href = COOKBOOK_SERVICE.documentsURI + "/" + illustration.identity;
			anchor.innerText = illustration.description || illustration.type;
			tableRow.querySelector("td.size").innerText = illustration.attributes["size"].toString();
		}
	}
}


/**
 * Registers an event listener for the browser window's load event.
 */
window.addEventListener("load", event => {
	const controller = new RecipeViewerTabPaneController();
	console.log(controller);
});
