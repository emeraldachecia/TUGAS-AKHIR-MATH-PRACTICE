document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("user-form");
	const btnCancel = document.getElementById("btnCancel");
	const btnSubmit = document.getElementById("btnSubmit");

	// ================== CANCEL ==================
	btnCancel.addEventListener("click", () => {
		window.location.href = "/user";
	});

	// ================== SUBMIT ==================
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		btnSubmit.disabled = true;

		const formData = Object.fromEntries(new FormData(form));
		const payload = {
			name: formData.name,
			email: formData.email,
			password: formData.password,
			role: "admin",
		};

		try {
			const res = await fetch("/api/user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();

			if (!res.ok) throw new Error(data.errors || "Failed to create admin.");

			showNotification("success", "New admin account created successfully!");
         
			setTimeout(() => {
				window.location.href = "/user";
			}, 1200);
		} catch (err) {
			showNotification("error", err.message);
		} finally {
			btnSubmit.disabled = false;
		}
	});
});
