document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("templateForm");
	const btnCancel = document.getElementById("btnCancel");

	const imageInput = document.getElementById("image");
	const imagePreviewContainer = document.getElementById(
		"imagePreviewContainer"
	);
	const btnRemoveImage = document.getElementById("btnRemoveImage");

	// CANCEL
	btnCancel.addEventListener("click", () => {
		window.location.href = "/template";
	});

	// IMAGE PREVIEW
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

	// REMOVE IMAGE
	btnRemoveImage.addEventListener("click", () => {
		imageInput.value = "";
		imagePreviewContainer.innerHTML = `<p class="no-image">No image selected.</p>`;
		btnRemoveImage.classList.add("hidden");
	});

	// SUBMIT
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
		formData.append("content", content);
		formData.append("topic", topic);
		formData.append("level", level);
		if (formula) formData.append("formula", formula);
		if (imageFile) formData.append("image", imageFile);

		try {
			const res = await fetch("/api/template", {
				method: "POST",
				body: formData,
			});

			const body = await res.json();
			if (!res.ok) throw new Error(body.errors || "Failed to create template.");

			showNotification("success", "Template created successfully!");
			setTimeout(() => (window.location.href = "/template"), 1000);
		} catch (err) {
			showNotification("error", err.message);
		}
	});
});
