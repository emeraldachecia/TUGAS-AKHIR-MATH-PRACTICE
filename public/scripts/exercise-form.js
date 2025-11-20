document.addEventListener("DOMContentLoaded", () => {
	const infoContainer = document.getElementById("exerciseInfo");
	const questionsContainer = document.getElementById("questionsContainer");
	const btnSubmit = document.getElementById("btnSubmit");

	let activeExercise = null;
	let selectedAnswers = {};
	let isSubmitting = false;
	let countdownInterval = null;

	init();

	async function init() {
		try {
			const res = await fetch("/api/exercise/active");
			const data = await res.json();

			if (res.status === 404) {
				showNotification("alert", data.errors || "No active exercise.");
				return setTimeout(() => (window.location.href = "/exercise"), 1500);
			}

			if (!res.ok) throw new Error(data.errors);

			activeExercise = data.data;

			renderInfo();
			renderQuestions();
		} catch (err) {
			showNotification("error", err.message);
		}
	}

	function renderInfo() {
		const ex = activeExercise;

		const start = formatDateTime(ex.start_time);

		// start countdown
		startCountdown(ex.start_time);

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
				<span class="label">Time Left</span>
				<span class="value" id="countdownValue">--:--</span>
			</div>

			<div class="info-item">
				<span class="label">Level</span>
				<span class="value">${capitalize(ex.level)}</span>
			</div>
		`;
    }
    
	function renderQuestions() {
		questionsContainer.innerHTML = "";

		activeExercise.questions.forEach((q, index) => {
			const qCard = document.createElement("div");
			qCard.classList.add("question-card");

			/* ============ OPTIONS HTML ============ */
			let optsHTML = q.options
				.map((opt, i) => {
					const label = String.fromCharCode(97 + i); // a, b, c, ...
					return `
					<div class="option-card"
						data-question="${q.question_id}"
						data-option="${opt.option_id}">
						<div class="option-label">${label}</div>
						<div class="option-content">${opt.content}</div>
					</div>
				`;
				})
				.join("");

			let imgHTML = "";
			if (q.image) {
				imgHTML = `
				<div class="question-image">
					<img src="/images/templates/${q.image}" alt="question image"/>
				</div>
			`;

            }
			qCard.innerHTML = `
			<div class="question-header">
				<div class="question-number">${index + 1}</div>
				<div class="question-content">${q.content}</div>
			</div>

			${imgHTML}

			<div class="options-container">
				${optsHTML}
			</div>
		`;

			questionsContainer.appendChild(qCard);
		});

		// Klik opsi → pilih jawaban
		document.querySelectorAll(".option-card").forEach((el) => {
			el.addEventListener("click", () => {
				const qid = el.dataset.question;
				const oid = el.dataset.option;

				selectedAnswers[qid] = oid;

				// remove highlight
				document
					.querySelectorAll(`.option-card[data-question='${qid}']`)
					.forEach((c) => c.classList.remove("option-selected"));

				el.classList.add("option-selected");
			});
		});
	}

	btnSubmit.addEventListener("click", submitExercise);

	async function submitExercise() {
		// Prevent double submission
		if (isSubmitting) return;

		isSubmitting = true;
		btnSubmit.disabled = true;
		btnSubmit.textContent = "Submitting...";

		// stop countdown
		if (countdownInterval) clearInterval(countdownInterval);

		// Prepare answers array
		const answers = Object.keys(selectedAnswers).map((qid) => ({
			question_id: qid,
			option_id: selectedAnswers[qid],
		}));

		const payload = {
			exercise_id: activeExercise.exercise_id,
			answers,
		};

		try {
			const res = await fetch("/api/exercise", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.errors);

			showNotification("success", "Exercise submitted!");

			setTimeout(() => {
				window.location.href = `/exercise/${activeExercise.exercise_id}`;
			}, 1200);
		} catch (err) {
			isSubmitting = false; // allow retry
			btnSubmit.disabled = false;
			btnSubmit.textContent = "Submit";

			showNotification("error", err.message);
		}
	}

	function startCountdown(startEpoch) {
		const total = 20 * 60 * 1000; // 20 minutes

		countdownInterval = setInterval(() => {
			const elapsed = Date.now() - startEpoch;
			const remaining = total - elapsed;

			if (remaining <= 0) {
				clearInterval(countdownInterval);
				document.getElementById("countdownValue").textContent = "00:00";
				submitExercise(); // auto-submit once
				return;
			}

			const min = String(Math.floor(remaining / 60000)).padStart(2, "0");
			const sec = String(Math.floor((remaining % 60000) / 1000)).padStart(
				2,
				"0"
			);

			document.getElementById("countdownValue").textContent = `${min}:${sec}`;
		}, 1000);
	}

	function formatDateTime(epoch) {
		const d = new Date(epoch);
		return `${String(d.getDate()).padStart(2, "0")}/${String(
			d.getMonth() + 1
		).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
			2,
			"0"
		)}:${String(d.getMinutes()).padStart(2, "0")}`;
	}

	function capitalize(str) {
		return str ? str.charAt(0).toUpperCase() + str.slice(1) : "-";
	}
});
