$(document).ready(function () {
	const $tableBody = $("#exerciseTableBody");
	const $topicButtons = $(".topic-filter .segment-btn");
	const $levelButtons = $(".level-filter .segment-btn");
	const $pagination = $("#paginationPages");
	const $prevBtn = $("#prevPage");
	const $nextBtn = $("#nextPage");
	const $popup = $("#popupOverlay");
	const ROWS_PER_PAGE = 10;

	let allExercises = [];
	let filteredExercises = [];
	let currentPage = 1;
	let totalPages = 1;
	let sortState = []; // simpan multi-sort aktif

	async function loadExercises() {
		try {
			const res = await fetch("/api/exercise");
			const data = await res.json();
			if (!res.ok) throw new Error(data.errors || "Failed to load exercises.");

			allExercises = (data.data || []).map((e) => ({
				...e,
				date: formatDate(e.date),
			}));

			filteredExercises = allExercises;
			renderTable();
		} catch (err) {
			$tableBody.html(
				`<tr><td colspan="4" class="no-data">${err.message}</td></tr>`
			);
		}
	}

	function formatDate(epochMillis) {
		if (!epochMillis) return "-";
		const d = new Date(epochMillis);
		const day = String(d.getDate()).padStart(2, "0");
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	}

	loadExercises();

	function renderTable() {
		if (filteredExercises.length === 0) {
			$tableBody.html(
				`<tr><td colspan="4" class="no-data">No exercises found.</td></tr>`
			);
			return;
		}

		totalPages = Math.ceil(filteredExercises.length / ROWS_PER_PAGE);
		const start = (currentPage - 1) * ROWS_PER_PAGE;
		const end = start + ROWS_PER_PAGE;
		const pageData = filteredExercises.slice(start, end);

		const rows = pageData
			.map(
				(e) => `
				<tr class="exercise-row ${e.status === "active" ? "exercise-active-row" : ""}" 
					 data-id="${e.exercise_id}">
					<td>${e.date || "-"}</td>
					<td>${e.score ?? "-"}</td>
					<td>${e.topic || "-"}</td>
					<td>${e.level || "-"}</td>
				</tr>`
			)
			.join("");

		$tableBody.html(rows);
		renderPagination();

		$(".exercise-row").on("click", function () {
			const id = $(this).data("id");
			if (id) window.location.href = `/exercise/${id}`;
		});
	}

	$(".exercise-table th").on("click", function () {
		const column = $(this).data("sort");
		if (!column) return;

		const existingIndex = sortState.findIndex((s) => s.column === column);
		if (existingIndex > -1) {
			sortState[existingIndex].direction =
				sortState[existingIndex].direction === "asc" ? "desc" : "asc";
		} else {
			sortState.push({ column, direction: "asc" });
		}

		applySort();
		updateSortIndicators();
		renderTable();
	});

	function applySort() {
		filteredExercises.sort((a, b) => {
			for (const { column, direction } of sortState) {
				let valA = a[column];
				let valB = b[column];

				if (column === "date") {
					valA = a.date;
					valB = b.date;
				}

				if (typeof valA === "string") valA = valA.toLowerCase();
				if (typeof valB === "string") valB = valB.toLowerCase();

				if (valA < valB) return direction === "asc" ? -1 : 1;
				if (valA > valB) return direction === "asc" ? 1 : -1;
			}
			return 0;
		});
	}

	function updateSortIndicators() {
		$(".exercise-table th").removeClass("sorted-asc sorted-desc");

		sortState.forEach(({ column, direction }) => {
			const th = $(`.exercise-table th[data-sort='${column}']`);
			th.addClass(direction === "asc" ? "sorted-asc" : "sorted-desc");
		});
	}

	function applyFilters() {
		const topic = $(".topic-filter .segment-btn.active").data("topic");
		const level = $(".level-filter .segment-btn.active").data("level");

		filteredExercises = allExercises.filter((e) => {
			const matchTopic = topic === "all" || e.topic === topic;
			const matchLevel = level === "all" || e.level === level;
			return matchTopic && matchLevel;
		});

		currentPage = 1;
		applySort();
		renderTable();
	}

	$topicButtons.on("click", function () {
		$topicButtons.removeClass("active");
		$(this).addClass("active");
		applyFilters();
	});

	$levelButtons.on("click", function () {
		$levelButtons.removeClass("active");
		$(this).addClass("active");
		applyFilters();
	});

	function renderPagination() {
		$pagination.empty();
		if (totalPages <= 1) {
			$prevBtn.prop("disabled", true);
			$nextBtn.prop("disabled", true);
			return;
		}

		let start = Math.max(currentPage - 2, 1);
		let end = Math.min(start + 4, totalPages);
		if (end - start < 4) start = Math.max(end - 4, 1);

		for (let i = start; i <= end; i++) {
			const btn = $(`
				<button class="pagination-btn ${i === currentPage ? "active" : ""}">
					${i}
				</button>
			`);
			btn.on("click", function () {
				currentPage = i;
				renderTable();
			});
			$pagination.append(btn);
		}

		$prevBtn.prop("disabled", currentPage === 1);
		$nextBtn.prop("disabled", currentPage === totalPages);
	}

	$prevBtn.on("click", function () {
		if (currentPage > 1) {
			currentPage--;
			renderTable();
		}
	});

	$nextBtn.on("click", function () {
		if (currentPage < totalPages) {
			currentPage++;
			renderTable();
		}
	});

	$("#btnNewExercise").on("click", async () => {
		try {
			const res = await fetch("/api/exercise/active");

			if (res.status === 200) {
				showNotification("alert", "You still have an active exercise!");
				return setTimeout(() => {
					window.location.href = "/exercise/form";
				}, 1200);
			}

			$("#popupOverlay").removeClass("hidden");
		} catch (err) {
			showNotification("error", "Failed to check active exercise.");
		}
	});

	// CLOSE POPUP
	$("#popupCancel").on("click", () => {
		$("#popupOverlay").addClass("hidden");
	});

	// START NEW EXERCISE
	$("#popupStart").on("click", async () => {
		const topic = $("#popupTopic").val();
		const level = $("#popupLevel").val();

		try {
			const res = await fetch("/api/exercise", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ topic, level }),
			});

			const data = await res.json();

			if (!res.ok) throw new Error(data.errors);

			showNotification("success", "Exercise created!");

			setTimeout(() => {
				window.location.href = "/exercise/form";
			}, 800);
		} catch (err) {
			showNotification("error", err.message);
		}
	});
});
