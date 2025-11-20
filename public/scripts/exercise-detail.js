document.addEventListener("DOMContentLoaded", () => {
	const exerciseId = window.location.pathname.split("/").pop();
	const infoContainer = document.getElementById("exerciseInfo");
	const questionsContainer = document.getElementById("questionsContainer");

	loadExercise();

	// ===================== LOAD EXERCISE =====================
	async function loadExercise() {
		try {
			const res = await fetch(`/api/exercise/${exerciseId}`);
			const data = await res.json();

			if (!res.ok) throw new Error(data.errors || "Failed to load exercise.");

			// 🔹 kalau status masih aktif → redirect ke halaman form
			if (data.data.status === "active") {
				window.location.href = "/exercise/form";
				return;
			}

			renderExercise(data.data);
		} catch (err) {
			showNotification("error", err.message);
		}
	}

	// ===================== RENDER DETAIL =====================
	function renderExercise(ex) {
		const start = formatDateTime(ex.start_time);
		const end = formatDateTime(ex.end_time);

		// ============ INFO CARD ============
		infoContainer.innerHTML = `
		<div class="info-item">
			<span class="label">Start Time</span>
			<span class="value">${start}</span>
		</div>
		<div class="info-item">
			<span class="label">Topic</span>
			<span class="value">${capitalize(ex.topic)}</span>
		</div>
		<div class="info-item">
			<span class="label">End Time</span>
			<span class="value">${end}</span>
		</div>
		<div class="info-item">
			<span class="label">Level</span>
			<span class="value">${capitalize(ex.level)}</span>
		</div>
		<div class="info-item">
			<span class="label">Status</span>
			<span class="value status-${ex.status}">${capitalize(ex.status)}</span>
		</div>
		<div class="info-item">
			<span class="label">Score</span>
			<span class="value">${ex.score ?? "-"}</span>
		</div>
	`;

		// ============ QUESTIONS ============
		questionsContainer.innerHTML = "";

		ex.questions.forEach((q, i) => {
			const qCard = document.createElement("div");
			qCard.classList.add("question-card");

			// HEADER
			const qHeader = `
			<div class="question-header">
				<div class="question-number">${i + 1}</div>
				<div class="question-content">${q.content}</div>
			</div>
		`;

			// ============ IMAGE BLOCK (OPTIONAL) ============
			let imgHTML = "";
			if (q.image) {
				imgHTML = `
				<div class="question-image">
					<img src="/images/templates/${q.image}" alt="question image">
				</div>
			`;
			}

			// ============ OPTIONS ============
			const opts = q.options
				.map((opt, idx) => {
					const label = String.fromCharCode(97 + idx); // a,b,c,d...

					let optionClass = "option-normal";
					if (opt.is_correct) optionClass = "option-correct";
					else if (opt.is_selected && !opt.is_correct)
						optionClass = "option-wrong-selected";

					return `
					<div class="option-card ${optionClass}">
						<div class="option-label">${label}</div>
						<div class="option-content">${opt.content}</div>
					</div>
				`;
				})
				.join("");

			// FINAL CARD
			qCard.innerHTML = `
			${qHeader}
			${imgHTML}
			<div class="options-container">
				${opts}
			</div>
		`;

			questionsContainer.appendChild(qCard);
		});
	}

	// ===================== UTILITIES =====================
	function formatDateTime(epoch) {
		if (!epoch) return "-";
		const d = new Date(epoch);
		const day = String(d.getDate()).padStart(2, "0");
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const year = d.getFullYear();
		const hh = String(d.getHours()).padStart(2, "0");
		const mm = String(d.getMinutes()).padStart(2, "0");
		return `${day}/${month}/${year} ${hh}:${mm}`;
	}

	function capitalize(str) {
		return str ? str.charAt(0).toUpperCase() + str.slice(1) : "-";
	}
});
