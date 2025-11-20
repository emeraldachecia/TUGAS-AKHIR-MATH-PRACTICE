document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("userDetailForm");
	const btnEdit = document.getElementById("btnEdit");
	const btnSave = document.getElementById("btnSave");
	const btnDelete = document.getElementById("btnDelete");
	
	const userId = window.location.pathname.split("/").pop();
	const nameInput = document.getElementById("name");
	const emailInput = document.getElementById("email");
	const roleInput = document.getElementById("role");
	const userIdInput = document.getElementById("user_id");
	const newPwd = document.getElementById("newPassword");
	const passwordFields = document.querySelectorAll(".password-fields");

	let isEditMode = false;

	// ============ LOAD USER DATA ============

	async function loadUserData() {
		try {
			const res = await fetch(`/api/user/${userId}`);
			const data = await res.json();

			if (!res.ok) throw new Error(data.errors || "Failed to load user.");

			nameInput.value = data.data.name || "";
			emailInput.value = data.data.email || "";
			roleInput.value = data.data.role || "";
			userIdInput.value = data.data.user_id || "";
		} catch (err) {
			showNotification("error", err.message);
		}
	}

	loadUserData();

	// ============ TOGGLE EDIT MODE ============
	btnEdit.addEventListener("click", () => {
		isEditMode = !isEditMode;

		if (isEditMode) {
			// Aktifkan edit mode
			btnEdit.classList.remove("inactive");
			btnEdit.classList.add("active");
			btnEdit.textContent = "Cancel";

			[nameInput, emailInput].forEach((el) => (el.disabled = false));
			passwordFields.forEach((el) => el.classList.remove("hidden"));
			btnSave.classList.remove("hidden");
		} else {
			// Batalkan edit mode
			resetForm();
			loadUserData();
		}
	});

	// ============ RESET FORM ============
	function resetForm() {
		isEditMode = false;
		btnEdit.classList.remove("active");
		btnEdit.classList.add("inactive");
		btnEdit.textContent = "Edit";

		[nameInput, emailInput].forEach((el) => (el.disabled = true));
		passwordFields.forEach((el) => el.classList.add("hidden"));
		btnSave.classList.add("hidden");
		newPwd.value = "";
	}

	// ============ SAVE CHANGES ============
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const payload = {
			user_id: userIdInput.value,
		};

		if (nameInput.value.trim()) payload.name = nameInput.value.trim();
		if (emailInput.value.trim()) payload.email = emailInput.value.trim();
		if (newPwd.value)
			payload.password = { old: "admin-edit", new: newPwd.value };

		try {
			const res = await fetch("/api/user", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();

			if (!res.ok) throw new Error(data.errors || "Failed to update user.");

			showNotification("success", "User updated successfully!");

			resetForm();
			loadUserData();
		} catch (err) {
			showNotification("error", err.message);
		}
	});

	// ============ DELETE USER ============
	btnDelete.addEventListener("click", async () => {
		const confirmDelete = confirm("Are you sure you want to delete this user?");
		if (!confirmDelete) return;

		try {
			const res = await fetch(`/api/user/${userId}`, { method: "DELETE" });
			const data = await res.json();

			if (!res.ok) throw new Error(data.errors || "Failed to delete user.");

			showNotification("success", "User deleted successfully!");
			setTimeout(() => (window.location.href = "/user"), 1000);
		} catch (err) {
			showNotification("error", err.message);
		}
	});
});
