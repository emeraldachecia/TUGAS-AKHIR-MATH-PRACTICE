document.addEventListener("DOMContentLoaded", () => {
	const templateId = window.location.pathname.split("/").pop();

	// FIX UTAMA DI SINI !!!
	const form = document.getElementById("templateDetailForm");

	const btnEdit = document.getElementById("btnEdit");
	const btnSave = document.getElementById("btnSave");
	const btnDelete = document.getElementById("btnDelete");

	const imageInput = document.getElementById("image");
	const imagePreviewContainer = document.getElementById(
		"imagePreviewContainer"
	);
	const btnRemoveImage = document.getElementById("btnRemoveImage");

	const inputs = form.querySelectorAll(
		"textarea, select, input[type='text'], input[type='file']"
	);

	let isEditing = false;
	let removeImageFlag = false;

	// ==================================
	// LOAD TEMPLATE
	// ==================================
	async function loadTemplate() {
		try {
			const res = await fetch(`/api/template/${templateId}`);
			const body = await res.json();
			if (!res.ok) throw new Error(body.errors || "Failed to load template.");
			fillForm(body.data);
		} catch (err) {
			showNotification("error", err.message);
		}
	}

	loadTemplate();

	function fillForm(template) {
		document.getElementById("content").value = template.content || "";
		document.getElementById("formula").value = template.formula || "";
		document.getElementById("topic").value = template.topic || "";
		document.getElementById("level").value = template.level || "";

		imagePreviewContainer.innerHTML = "";
		removeImageFlag = false;

		if (template.image) {
			console.log(template.image);
			
			imagePreviewContainer.innerHTML = `
				<img src="/images/templates/${template.image}" class="template-preview" />
			`;
			btnRemoveImage.classList.add("hidden");
		} else {
			imagePreviewContainer.innerHTML = `<p class="no-image">No image uploaded.</p>`;
			btnRemoveImage.classList.add("hidden");
		}
	}

	// ==================================
	// EDIT MODE
	// ==================================
	btnEdit.addEventListener("click", () => {
		isEditing = !isEditing;

		if (isEditing) {
			btnEdit.textContent = "Cancel";
			btnEdit.classList.add("active");

			inputs.forEach((el) => (el.disabled = false));
			imageInput.classList.remove("hidden");
			btnSave.classList.remove("hidden");

			if (imagePreviewContainer.querySelector("img")) {
				btnRemoveImage.classList.remove("hidden");
			}
		} else {
			resetFormState();
			loadTemplate();
		}
	});

	function resetFormState() {
		isEditing = false;
		removeImageFlag = false;

		btnEdit.classList.remove("active");
		btnEdit.textContent = "Edit";

		inputs.forEach((el) => (el.disabled = true));
		imageInput.classList.add("hidden");
		btnSave.classList.add("hidden");
		btnRemoveImage.classList.add("hidden");
	}

	// ==================================
	// REMOVE IMAGE
	// ==================================
	btnRemoveImage.addEventListener("click", () => {
		removeImageFlag = true;
		imageInput.value = "";
		imagePreviewContainer.innerHTML = `<p class="no-image">No image uploaded.</p>`;
		btnRemoveImage.classList.add("hidden");
	});

	// ==================================
	// FILE PREVIEW
	// ==================================
	imageInput.addEventListener("change", () => {
		const file = imageInput.files[0];

		if (!file) {
			imagePreviewContainer.innerHTML = `<p class="no-image">No image selected.</p>`;
			btnRemoveImage.classList.add("hidden");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreviewContainer.innerHTML = `
				<img src="${e.target.result}" class="template-preview" />
			`;
		};
		reader.readAsDataURL(file);

		btnRemoveImage.classList.remove("hidden");
	});

	// ==================================
	// SAVE
	// ==================================
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const content = document.getElementById("content").value.trim();
		const formula = document.getElementById("formula").value.trim();
		const topic = document.getElementById("topic").value;
		const level = document.getElementById("level").value;
		const imageFile = imageInput.files[0];

		if (!content || !topic || !level) {
			showNotification("alert", "Please fill all required fields.");
			return;
		}

		const formData = new FormData();
		formData.append("template_id", templateId);
		formData.append("content", content);
		formData.append("topic", topic);
		formData.append("level", level);
		if (formula) formData.append("formula", formula);

		if (imageFile) formData.append("image", imageFile);
		if (removeImageFlag) formData.append("remove_image", true);

		try {
			const res = await fetch("/api/template", {
				method: "PATCH",
				body: formData,
			});

			const body = await res.json();
			if (!res.ok) throw new Error(body.errors || "Failed to update template.");

			showNotification("success", "Template updated successfully!");
			setTimeout(() => {
				resetFormState();
				loadTemplate();
			}, 800);
		} catch (err) {
			showNotification("error", err.message);
		}
	});

	// ==================================
	// DELETE
	// ==================================
	btnDelete.addEventListener("click", async () => {
		if (!confirm("Delete this template?")) return;

		try {
			const res = await fetch(`/api/template/${templateId}`, {
				method: "DELETE",
			});

			const body = await res.json();
			if (!res.ok) throw new Error(body.errors || "Failed to delete template.");

			showNotification("success", "Template deleted successfully!");

			setTimeout(() => (window.location.href = "/template"), 800);
		} catch (err) {
			showNotification("error", err.message);
		}
	});
});
