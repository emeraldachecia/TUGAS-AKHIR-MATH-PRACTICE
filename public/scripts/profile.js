document.addEventListener("DOMContentLoaded", () => {
	const btnEdit = document.getElementById("btnEdit");
	const btnSave = document.getElementById("btnSave");
	const btnSignout = document.getElementById("btnSignout");
	const form = document.getElementById("profile-form");

	const userIdInput = document.getElementById("userId");
	const nameInput = document.getElementById("name");
	const emailInput = document.getElementById("email");
	const oldPasswordInput = document.getElementById("oldPassword");
	const newPasswordInput = document.getElementById("newPassword");
	const passwordFields = document.querySelectorAll(".password-fields");

	let editMode = false;

	// TOGGLE EDIT MODE 
	btnEdit.addEventListener("click", () => {
		editMode = !editMode;

		if (editMode) {
			btnEdit.classList.remove("inactive");
			btnEdit.classList.add("active");
			btnEdit.textContent = "Cancel";

			nameInput.disabled = false;
			emailInput.disabled = false;
			passwordFields.forEach((f) => f.classList.remove("hidden"));
			btnSave.classList.remove("hidden");
		} else {
			resetFormState();
		}
	});

	function resetFormState() {
		editMode = false;
		btnEdit.classList.remove("active");
		btnEdit.classList.add("inactive");
		btnEdit.textContent = "Update";
		btnSave.classList.add("hidden");
		passwordFields.forEach((f) => f.classList.add("hidden"));
		nameInput.disabled = true;
		emailInput.disabled = true;
		oldPasswordInput.value = "";
		newPasswordInput.value = "";
	}

	// SAVE PROFILE 
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const userId = userIdInput.value.trim();
		const name = nameInput.value.trim();
		const email = emailInput.value.trim();
		const oldPassword = oldPasswordInput.value.trim();
		const newPassword = newPasswordInput.value.trim();

		if ((oldPassword && !newPassword) || (!oldPassword && newPassword)) {
			showNotification(
				"alert",
				"Both old and new password must be provided together."
			);
			return;
		}

		const payload = { user_id: userId };

		if (name) payload.name = name;
		if (email) payload.email = email;
		if (oldPassword && newPassword) {
			payload.password = { old: oldPassword, new: newPassword };
		}

		try {
			const res = await fetch("/api/user", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.errors || "Failed to update profile.");

			showNotification("success", "Profile updated successfully!");
			
			resetFormState();
		} catch (err) {
			showNotification("error", err.message);
		}
	});

	// SIGN OUT
	btnSignout.addEventListener("click", async () => {
		try {
			const res = await fetch("/api/user/auth/signout", { method: "DELETE" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.errors || "Failed to sign out.");

			showNotification("success", "Signed out successfully!");
			setTimeout(() => (window.location.href = "/auth"), 1000);
		} catch (err) {
			showNotification("error", err.message);
		}
	});
});
