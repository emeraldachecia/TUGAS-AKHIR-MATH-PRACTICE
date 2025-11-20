$(document).ready(function () {
	const $tableBody = $("#templateTableBody");
	const $searchInput = $("#searchInput");
	const $topicButtons = $(".template-topic-filter .segment-btn");
	const $levelButtons = $(".template-level-filter .segment-btn");
	const $pagination = $("#paginationPages");
	const $prevBtn = $("#prevPage");
	const $nextBtn = $("#nextPage");
	const ROWS_PER_PAGE = 15;

	let allTemplates = [];
	let filteredTemplates = [];
	let currentPage = 1;
	let totalPages = 1;

	// ================= LOAD DATA =================
	async function loadTemplates() {
		try {
			const res = await fetch("/api/template");
			const data = await res.json();

			if (!res.ok) throw new Error(data.errors || "Failed to load templates.");

			allTemplates = data.data || [];
			filteredTemplates = allTemplates;

			renderTable();
			renderPagination();
		} catch (err) {
			$tableBody.html(
				`<tr><td colspan="3" class="no-data">${err.message}</td></tr>`
			);
		}
	}

	loadTemplates();

	// ================= RENDER TABLE =================
	function renderTable() {
		if (filteredTemplates.length === 0) {
			$tableBody.html(
				`<tr><td colspan="3" class="no-data">No templates found.</td></tr>`
			);
			return;
		}

		totalPages = Math.ceil(filteredTemplates.length / ROWS_PER_PAGE);
		const start = (currentPage - 1) * ROWS_PER_PAGE;
		const end = start + ROWS_PER_PAGE;
		const pageData = filteredTemplates.slice(start, end);

		const rows = pageData
			.map(
				(t) => `
				<tr class="template-row" data-id="${t.template_id}">
					<td>${t.content}</td>
					<td>${capitalize(t.topic)}</td>
					<td>${capitalize(t.level)}</td>
				</tr>
			`
			)
			.join("");

		$tableBody.html(rows);
		renderPagination();

		// klik baris → ke detail template
		$(".template-row").on("click", function () {
			const id = $(this).data("id");
			window.location.href = `/template/${id}`;
		});
	}

	// helper untuk kapital huruf pertama
	function capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	// ================= SEARCH =================
	$searchInput.on("input", function () {
		const keyword = $(this).val().toLowerCase();
		filterTemplates();
	});

	// ================= FILTER =================
	$topicButtons.on("click", function () {
		$topicButtons.removeClass("active");
		$(this).addClass("active");
		filterTemplates();
	});

	$levelButtons.on("click", function () {
		$levelButtons.removeClass("active");
		$(this).addClass("active");
		filterTemplates();
	});

	function filterTemplates() {
		const keyword = $searchInput.val().toLowerCase();
		const activeTopic = $(".template-topic-filter .active").data("topic");
		const activeLevel = $(".template-level-filter .active").data("level");

		filteredTemplates = allTemplates.filter((t) => {
			const matchKeyword = t.content.toLowerCase().includes(keyword);
			const matchTopic = activeTopic === "all" ? true : t.topic === activeTopic;
			const matchLevel = activeLevel === "all" ? true : t.level === activeLevel;
			return matchKeyword && matchTopic && matchLevel;
		});

		currentPage = 1;
		renderTable();
	}

	// ================= PAGINATION =================
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
				<button class="pagination-btn ${
					i === currentPage ? "active" : ""
				}">${i}</button>
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

	// ================= NEW TEMPLATE =================
	$("#btnNewTemplate").on("click", () => {
		window.location.href = "/template/form";
	});
});
