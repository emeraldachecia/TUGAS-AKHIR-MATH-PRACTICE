$(document).ready(function () {
	const $tableBody = $("#userTableBody");
	const $searchInput = $("#searchInput");
	const $roleButtons = $(".segment-btn");
	const $pagination = $("#paginationPages");
	const $prevBtn = $("#prevPage");
	const $nextBtn = $("#nextPage");
	const ROWS_PER_PAGE = 15;

	let allUsers = [];
	let filteredUsers = [];
	let currentPage = 1;
	let totalPages = 1;

	// ================= LOAD DATA =================
	async function loadUsers() {
		try {
			const res = await fetch("/api/user");

			const data = await res.json();

			if (!res.ok) throw new Error(data.errors || "Failed to load users.");

			allUsers = data.data || [];

			filteredUsers = allUsers;

			renderTable();
			renderPagination();
		} catch (err) {
			$tableBody.html(
				`<tr><td colspan="3" class="no-data">${err.message}</td></tr>`
			);
		}
	}

	loadUsers();

	// ================= RENDER TABLE =================
	function renderTable() {
		if (filteredUsers.length === 0) {
			$tableBody.html(
				`<tr><td colspan="3" class="no-data">No users found.</td></tr>`
			);
			return;
		}

		totalPages = Math.ceil(filteredUsers.length / ROWS_PER_PAGE);
		const start = (currentPage - 1) * ROWS_PER_PAGE;
		const end = start + ROWS_PER_PAGE;
		const pageData = filteredUsers.slice(start, end);

		const rows = pageData
			.map(
				(u) => `
				<tr class="user-row" data-id="${u.user_id}">
					<td>${u.name}</td>
					<td>${u.email}</td>
					<td>${u.role}</td>
				</tr>
			`
			)
			.join("");

		$tableBody.html(rows);
		renderPagination();

		// ================= Add click event for rows =================
		$(".user-row").on("click", function () {
			const userId = $(this).data("id");
			if (userId) {
				window.location.href = `/user/${userId}`;
			}
		});
	}

	// ================= SEARCH =================
	$searchInput.on("input", function () {
		const keyword = $(this).val().toLowerCase();
		filteredUsers = allUsers.filter(
			(u) =>
				u.name.toLowerCase().includes(keyword) ||
				u.email.toLowerCase().includes(keyword)
		);
		currentPage = 1;
		renderTable();
	});

	// ================= ROLE FILTER =================
	$roleButtons.on("click", function () {
		$roleButtons.removeClass("active");
		$(this).addClass("active");

		const role = $(this).data("role");
		if (role === "all") filteredUsers = allUsers;
		else filteredUsers = allUsers.filter((u) => u.role === role);

		currentPage = 1;
		renderTable();
	});

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
			const btn = $(
				`<button class="pagination-btn ${
					i === currentPage ? "active" : ""
				}">${i}</button>`
			);
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

	// ================= NEW ADMIN =================
	$("#btnNewAdmin").on("click", () => {
		window.location.href = "/user/form";
	});
});
