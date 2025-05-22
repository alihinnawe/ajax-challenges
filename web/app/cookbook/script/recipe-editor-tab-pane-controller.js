import TabPaneController from "../../../share/tab-pane-controller.js";
import COOKBOOK_SERVICE from "../../../share/cookbook-service.js";
import ELEMENT_FACTORY from "../../../share/element-factory.js";
import { CATEGORY, DIET, UNIT } from "./enums.js"


/**
 * Recipe editor tab pane controller type.
 */
class RecipeEditorTabPaneController extends TabPaneController {
	#victuals;


	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.recipe-editor");
		this.#victuals = [];

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get sessionOwner () { return this.sharedProperties["session-owner"]; }

	get recipesViewerSection () { return this.center.querySelector("section.recipes-viewer"); }
	get recipesViewerTableBody () { return this.recipesViewerSection.querySelector("div.recipes>table>tbody"); }
	get recipesViewerControlDivision () { return this.recipesViewerSection.querySelector("div.control"); }
	get recipesViewerCreateButton () { return this.recipesViewerControlDivision.querySelector("button.create"); }

	get recipeEditorSection () { return this.center.querySelector("section.recipe-editor"); }
	get recipeEditorAvatarButton () { return this.recipeEditorSection.querySelector("span.avatar>button"); }
	get recipeEditorAvatarViewer () { return this.recipeEditorAvatarButton.querySelector("img"); }
	get recipeEditorAvatarChooser () { return this.recipeEditorSection.querySelector("span.avatar>input"); }
	get recipeEditorTitleInput () { return this.recipeEditorSection.querySelector("div.title>input"); }
	get recipeEditorDietOutput () { return this.recipeEditorSection.querySelector("div.diet>input"); }
	get recipeEditorCategorySelector () { return this.recipeEditorSection.querySelector("div.category>select"); }
	get recipeEditorDescriptionArea () { return this.recipeEditorSection.querySelector("div.description>textarea"); }
	get recipeEditorInstructionArea () { return this.recipeEditorSection.querySelector("div.instruction>textarea"); }
	get recipeEditorSubmitButton () { return this.recipeEditorSection.querySelector("div.control>button.submit"); }
	get recipeEditorDeleteButton () { return this.recipeEditorSection.querySelector("div.control>button.delete"); }
	get recipeEditorCancelButton () { return this.recipeEditorSection.querySelector("div.control>button.cancel"); }
	get recipeEditorIngredientsDivision () { return this.recipeEditorSection.querySelector("div.ingredients"); }
	get recipeEditorIngredientsTableBody () { return this.recipeEditorIngredientsDivision.querySelector("table>tbody"); }
	get recipeEditorAddButton () { return this.recipeEditorIngredientsDivision.querySelector("button.add"); }
	get recipeEditorIllustrationsDivision () { return this.recipeEditorSection.querySelector("div.illustrations"); }
	get recipeEditorIllustrationsTableBody () { return this.recipeEditorIllustrationsDivision.querySelector("span.left>table>tbody"); }
	get recipeEditorDropTargetButton () { return this.recipeEditorIllustrationsDivision.querySelector("span.right>button"); }
	get recipeEditorDropTargetViewer () { return this.recipeEditorDropTargetButton.querySelector("img"); }
	get recipeEditorDropTargetChooser () { return this.recipeEditorIllustrationsDivision.querySelector("span.right>input"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const recipesViewerSectionTemplate = await this.queryTemplate("recipes-viewer");
			this.center.append(recipesViewerSectionTemplate.content.firstElementChild.cloneNode(true));
			this.recipesViewerControlDivision.append(ELEMENT_FACTORY.createHtmlElement("button", { type: "button", innerText: "neu" }, {}, "create"));

			// register basic event listeners
			this.recipesViewerCreateButton.addEventListener("click", event => this.processDisplayRecipeEditor());

			await this.#displayEditableRecipes();

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries the recipes that can be edited by the
	 * requester, and displays them within the root section.
	 */
	async #displayEditableRecipes () {
		const victualsPromise = COOKBOOK_SERVICE.queryVictuals();
		const recipes = await COOKBOOK_SERVICE.queryEditableRecipes(this.sessionOwner);

		this.recipesViewerTableBody.innerHTML = "";
		const recipesViewerTableRowTemplate = await this.queryTemplate("recipes-viewer-row");
		for (const recipe of recipes) {
			const tableRow = recipesViewerTableRowTemplate.content.firstElementChild.cloneNode(true);
			this.recipesViewerTableBody.append(tableRow);

			const accessButton = tableRow.querySelector("td.access>button");
			accessButton.addEventListener("click", event => this.processDisplayRecipeEditor(recipe));
			accessButton.querySelector("img").src = COOKBOOK_SERVICE.documentsURI + "/" + recipe.attributes["avatar-reference"];
			tableRow.querySelector("td.title").innerText = recipe.title || "";
			tableRow.querySelector("td.diet").innerText = DIET[recipe.attributes["diet"]] || "";
			tableRow.querySelector("td.category").innerText = CATEGORY[recipe.category] || "";
			tableRow.querySelector("td.ingredient-count").innerText = recipe.attributes["ingredient-count"].toString();
			tableRow.querySelector("td.modified").innerText = new Date(recipe.modified).toLocaleDateString();
		}

		this.#victuals = await victualsPromise;
	}


	/**
	 * Displays the given recipe in a new editor section.
	 * @param recipe the recipe, or a new object for none
	 */
	async processDisplayRecipeEditor (recipe = {}) {
		if (!recipe.attributes) recipe.attributes = { "avatar-reference": 1 };
		this.recipesViewerSection.classList.add("hidden");

		try {
			const recipeEditorSectionTemplate = await this.queryTemplate("recipe-editor");
			this.center.append(recipeEditorSectionTemplate.content.firstElementChild.cloneNode(true));

			this.recipeEditorSubmitButton.addEventListener("click", event => this.processSubmitRecipe(recipe));
			this.recipeEditorDeleteButton.addEventListener("click", event => this.processDeleteRecipe(recipe.identity));
			this.recipeEditorCancelButton.addEventListener("click", event => this.processCancel());
			this.recipeEditorAddButton.addEventListener("click", event => this.processSubmitIngredient(recipe.identity));

			this.recipeEditorAvatarButton.addEventListener("click", event => this.recipeEditorAvatarChooser.click());
			this.recipeEditorAvatarViewer.addEventListener("dragover", event => this.processAvatarTransferValidation(event.dataTransfer));
			this.recipeEditorAvatarViewer.addEventListener("drop", event => this.processSubmitAvatar(recipe, event.dataTransfer.files[0]));
			this.recipeEditorAvatarChooser.addEventListener("change", event => this.processSubmitAvatar(recipe, event.currentTarget.files[0]));

			this.recipeEditorDropTargetButton.addEventListener("click", event => this.recipeEditorDropTargetChooser.click());
			this.recipeEditorDropTargetViewer.addEventListener("dragover", event => this.processIllustrationTransferValidation(event.dataTransfer));
			this.recipeEditorDropTargetViewer.addEventListener("drop", event => this.processAddIllustrations(recipe.identity, event.dataTransfer.files));
			this.recipeEditorDropTargetChooser.addEventListener("change", event => this.processAddIllustrations(recipe.identity, event.currentTarget.files));

			this.recipeEditorAvatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + recipe.attributes["avatar-reference"];
			this.recipeEditorTitleInput.value = recipe.title || "";
			this.recipeEditorDietOutput.value = DIET[recipe.attributes["diet"] || "VEGAN"];
			this.recipeEditorCategorySelector.value = recipe.category || "MAIN_COURSE";
			this.recipeEditorDescriptionArea.value = recipe.description || "";
			this.recipeEditorInstructionArea.value = recipe.instruction || "";

			if (recipe.identity) {
				await Promise.all([
					this.#displayRecipeIngredients(recipe.identity),
					this.#displayRecipeIllustrations(recipe.identity)
				]);
			} else {
				this.recipeEditorIngredientsDivision.classList.add("hidden");
				this.recipeEditorIllustrationsDivision.classList.add("hidden");
			}

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries the given recipe's ingredients, and populates the associated table.
	 * @param recipeIdentity the recipe identity
	 * @return { Promise } an execution promise
	 */
	async #displayRecipeIngredients (recipeIdentity) {
		const ingredients = await COOKBOOK_SERVICE.queryRecipeIngredients(recipeIdentity);

		this.recipeEditorIngredientsTableBody.innerHTML = "";
		const recipeEditorIngredientsTableRowTemplate = await this.queryTemplate("recipe-editor-ingredient-row");
		for (const ingredient of ingredients) {
			const tableRow = recipeEditorIngredientsTableRowTemplate.content.firstElementChild.cloneNode(true);
			this.recipeEditorIngredientsTableBody.append(tableRow);

			tableRow.querySelector("td.action>button.submit").addEventListener("click", event => this.processSubmitIngredient(recipeIdentity, ingredient));
			tableRow.querySelector("td.action>button.remove").addEventListener("click", event => this.processDeleteIngredient(recipeIdentity, ingredient.identity));

			const unitSelector = tableRow.querySelector("td.unit>select");
			unitSelector.value = ingredient.unit || "PIECE";
			unitSelector.addEventListener("change", event => ingredient.unit = event.currentTarget.value.trim());

			const amountInput = tableRow.querySelector("td.amount>input");
			amountInput.value = ingredient.amount.toString();
			amountInput.addEventListener("change", event => ingredient.amount = window.parseFloat(event.currentTarget.value.trim()) || 0);

			const recipeEditorAvatarViewer = tableRow.querySelector("td.avatar>img");
			recipeEditorAvatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + ingredient.victual.attributes["avatar-reference"];

			const recipeEditorDietOutput = tableRow.querySelector("td.diet>output");
			recipeEditorDietOutput.value = DIET[ingredient.victual.diet || "VEGAN"];

			const aliasSelector = tableRow.querySelector("td.alias>select");
			for (const victual of this.#victuals) {
				const aliasOption = ELEMENT_FACTORY.createHtmlElement("option");
				aliasOption.value = victual.identity.toString();
				aliasOption.innerText = victual.alias;
				aliasSelector.append(aliasOption);
			}

			aliasSelector.value = ingredient.victual.identity.toString();
			aliasSelector.addEventListener("change", event => this.processChangeIngredientVictual(tableRow, ingredient, event.currentTarget.value));
		}
	}


	/**
	 * Queries the given recipe's illustrations, and repopulates the associated table.
	 * @param recipeIdentity the recipe identity
	 * @return { Promise } an execution promise
	 */
	async #displayRecipeIllustrations (recipeIdentity) {
		const illustrations = await COOKBOOK_SERVICE.queryRecipeIllustrations(recipeIdentity);

		this.recipeEditorIllustrationsTableBody.innerHTML = "";
		const recipeEditorIllustrationsTableRowTemplate = await this.queryTemplate("recipe-editor-illustration-row");
		for (const illustration of illustrations) {
			const tableRow = recipeEditorIllustrationsTableRowTemplate.content.firstElementChild.cloneNode(true);
			this.recipeEditorIllustrationsTableBody.append(tableRow);

			const anchor = tableRow.querySelector("td.content>a");
			anchor.href = COOKBOOK_SERVICE.documentsURI + "/" + illustration.identity;
			anchor.innerText = illustration.description || illustration.type;
			tableRow.querySelector("td.size").innerText = illustration.attributes["size"].toString();
			tableRow.querySelector("td.action>button.remove").addEventListener("click", event => this.processRemoveIllustration(recipeIdentity, illustration.identity));
		}
	}


	/**
	 * Validates the given data transfer, solely allowing drops of image files.
	 * @param dataTransfer the data transfer
	 */
	async processAvatarTransferValidation (dataTransfer) {
		const primaryItem = dataTransfer.items[0];
		dataTransfer.dropEffect = primaryItem.kind === "file" && primaryItem.type && primaryItem.type.startsWith("image/") ? "copy" : "none";
	}


	/**
	 * Submits the given avatar file, and registers it as the given recipe's avatar.
	 * @param recipe the recipe
	 * @param avatarFile the avatar image file
	 */
	async processSubmitAvatar (recipe, avatarFile) {
		try {
			if (!avatarFile.type || !avatarFile.type.startsWith("image/")) throw new RangeError();
			recipe.attributes["avatar-reference"] = await COOKBOOK_SERVICE.insertOrUpdateDocument(avatarFile);
			this.recipeEditorAvatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + recipe.attributes["avatar-reference"];

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Submits the given recipe.
	 * @param recipe the recipe
	 */
	async processSubmitRecipe (recipe) {
		try {
			recipe.category = this.recipeEditorCategorySelector.value.trim() || null;
			recipe.title = this.recipeEditorTitleInput.value.trim() || null;
			recipe.description = this.recipeEditorDescriptionArea.value.trim() || null;
			recipe.instruction = this.recipeEditorInstructionArea.value.trim() || null;

			recipe.identity = await COOKBOOK_SERVICE.insertOrUpdateRecipe(recipe);
			recipe.version = (recipe.version || 0) + 1;
			this.recipeEditorIngredientsDivision.classList.remove("hidden");
			this.recipeEditorIllustrationsDivision.classList.remove("hidden");

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Removes the given recipe.
	 * @param recipeIdentity the recipe identity, or null for none
	 */
	async processDeleteRecipe (recipeIdentity) {
		try {
			if (recipeIdentity)
				await COOKBOOK_SERVICE.deleteRecipe(recipeIdentity);

			this.recipeEditorCancelButton.click();
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Removes the editor section and re-displays the root section.
	 */
	async processCancel () {
		try {
			this.recipeEditorSection.remove();
			await this.#displayEditableRecipes();
			this.recipesViewerSection.classList.remove("hidden");

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Changes an ingredient's victual.
	 * @param ingredientRow the ingredient's row element
	 * @param ingredient the ingredient
	 * @param victualIdentity the victual identity
	 */
	async processChangeIngredientVictual (ingredientRow, ingredient, victualIdentity) {
		try {
			ingredient.victual = this.#victuals.find(victual => victual.identity == victualIdentity);
			if (!ingredient.victual) throw new Error("assertion failed!");

			const recipeEditorAvatarViewer = ingredientRow.querySelector("td.avatar>img");
			recipeEditorAvatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + ingredient.victual.attributes["avatar-reference"];

			const recipeEditorDietOutput = ingredientRow.querySelector("td.diet>output");
			recipeEditorDietOutput.value = DIET[ingredient.victual.diet];

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Submits the given recipe ingredient.
	 * @param recipeIdentity the recipe identity
	 * @param ingredient the recipe ingredient, or a new object for none
	 */
	async processSubmitIngredient (recipeIdentity, ingredient = {}) {
		try {
			if (!ingredient.victual) ingredient.victual = this.#victuals[0];
			await COOKBOOK_SERVICE.insertOrUpdateIngredient(recipeIdentity, ingredient);

			this.messageOutput.value = "ok.";
			await this.#displayRecipeIngredients(recipeIdentity);
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Removes the given recipe ingredient.
	 * @param recipeIdentity the recipe identity, or null for none
	 * @param ingredientIdentity the recipe ingredient identity
	 */
	async processDeleteIngredient (recipeIdentity, ingredientIdentity) {
		try {
			if (ingredientIdentity)
				await COOKBOOK_SERVICE.deleteIngredient(recipeIdentity, ingredientIdentity);

			this.messageOutput.value = "ok.";
			await this.#displayRecipeIngredients(recipeIdentity);
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Validates the given data transfer, solely allowing drops of non-JSON files.
	 * @param dataTransfer the data transfer
	 */
	async processIllustrationTransferValidation (dataTransfer) {
		const items = Array.from(dataTransfer.items).filter(item => item.kind === "file" && item.type && item.type !== "application/json");
		dataTransfer.dropEffect = items.length > 0 ? "copy" : "none";
	}


	/**
	 * Submits the given illustration files, and associates the resulting illustrations with the given recipe.
	 * @param recipeIdentity the recipe identity
	 * @param illustrationFiles the illustration files
	 */
	async processAddIllustrations (recipeIdentity, illustrationFiles) {
		try {
			for (const file of illustrationFiles) {
				if (!file.type || file.type === "application/json") continue;

				const illustrationIdentity = await COOKBOOK_SERVICE.insertOrUpdateDocument(file);
				await COOKBOOK_SERVICE.addRecipeIllustration(recipeIdentity, illustrationIdentity);
			}

			this.messageOutput.value = "ok.";
			return this.#displayRecipeIllustrations(recipeIdentity);
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Removes the association between the given illustration and the given recipe.
	 * @param recipeIdentity the recipe identity
	 * @param illustrationIdentity the illustration identity
	 */
	async processRemoveIllustration (recipeIdentity, illustrationIdentity) {
		try {
			await COOKBOOK_SERVICE.removeRecipeIllustration(recipeIdentity, illustrationIdentity);

			this.messageOutput.value = "ok.";
			await this.#displayRecipeIllustrations(recipeIdentity);
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}
}


/**
 * Registers an event listener for the browser window's load event.
 */
window.addEventListener("load", event => {
	const controller = new RecipeEditorTabPaneController();
	console.log(controller);
});
