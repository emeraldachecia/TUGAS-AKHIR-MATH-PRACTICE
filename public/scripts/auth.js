document.addEventListener("DOMContentLoaded", () => {
	const signinCard = document.getElementById("signin-card");
	const signupCard = document.getElementById("signup-card");
	const showSignup = document.getElementById("show-signup");
	const showSignin = document.getElementById("show-signin");

	const signinForm = document.getElementById("signin-form");
	const signupForm = document.getElementById("signup-form");

	showSignup?.addEventListener("click", (e) => {
		e.preventDefault();
		signinCard.classList.add("hidden");
		signupCard.classList.remove("hidden");
	});

	showSignin?.addEventListener("click", (e) => {
		e.preventDefault();
		signupCard.classList.add("hidden");
		signinCard.classList.remove("hidden");
	});

	signinForm?.addEventListener("submit", async (e) => {
		e.preventDefault();

		const btn = signinForm.querySelector("button");
		btn.disabled = true;

		const formData = Object.fromEntries(new FormData(signinForm));
		const apiUrl = "/api/user/auth/signin";

		try {
			const res = await fetch(apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.errors || "Sign in failed.");

			showNotification("success", "Sign in successful! Redirecting...");

			setTimeout(() => {
				window.location.href = "/dashboard";
			}, 1200);
		} catch (err) {
			showNotification("error", err.message);
		} finally {
			btn.disabled = false;
		}
	});

	// ================= Sign Up Handler =================
	signupForm?.addEventListener("submit", async (e) => {
		e.preventDefault();

		const btn = signupForm.querySelector("button");
		btn.disabled = true;

		const formData = Object.fromEntries(new FormData(signupForm));
		const apiUrl = "/api/user/auth/signup";

		try {
			const res = await fetch(apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();
			
			if (!res.ok) throw new Error(data.errors || "Sign up failed.");

			showNotification("success", "Account created successfully!");

			setTimeout(() => {
				signupCard.classList.add("hidden");
				signinCard.classList.remove("hidden");
			}, 1500);
		} catch (err) {
			showNotification("error", err.message);
		} finally {
			btn.disabled = false;
		}
	});
});
