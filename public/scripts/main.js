// ================== GLOBAL SCRIPT ==================
document.addEventListener("DOMContentLoaded", () => {
	console.log("Main script loaded.");

    // Highlight active link di navbar
    // Mengambil path URL kita yang sekarang
    const currentPath = window.location.pathname;
    
    // loop semua link yang ada class 'nav-link'
	document.querySelectorAll(".nav-link").forEach((link) => {
		if (link.getAttribute("href") === currentPath) {
			link.classList.add("active");
		}
	});

	// Init Lucide Icons globally (biar bisa dipakai di notification)
	if (window.lucide) lucide.createIcons();
});

/**
 * Menampilkan notifikasi global.
 * @param {"error"|"alert"|"success"|"info"} type - jenis notifikasi
 * @param {string} message - pesan yang ditampilkan
 */
function showNotification(type, message) {
	const overlay = document.getElementById("global-notification");
	if (!overlay) return;

	const card = overlay.querySelector(".notification-card");
	const title = overlay.querySelector(".notification-title");
	const iconContainer = overlay.querySelector("#notification-icon");
	const msg = overlay.querySelector(".notification-message");
	const closeBtn = overlay.querySelector("#notification-close");

	// Bersihkan tipe lama
	card.classList.remove(
		"notification-error",
		"notification-alert",
		"notification-success",
		"notification-info"
	);

	// Default values
	let titleText = "Information";
	let iconName = "info";
	let colorClass = "notification-info";

	switch (type) {
		case "error":
			titleText = "Error";
			iconName = "x-circle";
			colorClass = "notification-error";
			break;
		case "alert":
			titleText = "Alert";
			iconName = "alert-triangle";
			colorClass = "notification-alert";
			break;
		case "success":
			titleText = "Success";
			iconName = "check-circle";
			colorClass = "notification-success";
			break;
		case "info":
		default:
			titleText = "Information";
			iconName = "info";
			colorClass = "notification-info";
			break;
	}

	card.classList.add(colorClass);
	title.textContent = titleText;
	msg.textContent = message;

	// Ganti ikon menggunakan Lucide
	iconContainer.innerHTML = `<i data-lucide="${iconName}"></i>`;
	if (window.lucide) lucide.createIcons();

	overlay.classList.remove("hidden");

	// Tutup manual
	closeBtn.onclick = hideNotification;

	// Auto close setelah 4 detik
	setTimeout(() => hideNotification(), 4000);
}

/** Menyembunyikan notifikasi global */
function hideNotification() {
	const overlay = document.getElementById("global-notification");
	if (overlay) overlay.classList.add("hidden");
}
