document.addEventListener("DOMContentLoaded", () => {
    // Container info dan soal
    const infoContainer = document.getElementById("exerciseInfo");
    const questionsContainer = document.getElementById("questionsContainer");
    const btnSubmit = document.getElementById("btnSubmit");

    let activeExercise = null;      // Menyimpan data exercise aktif
    let selectedAnswers = {};       // Menyimpan jawaban yang dipilih
    let isSubmitting = false;       // Flag mencegah submit ganda
    let countdownInterval = null;   // Interval countdown

    init();

    // Inisialisasi halaman
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

            renderInfo();      // Tampilkan info exercise
            renderQuestions(); // Tampilkan soal
        } catch (err) {
            showNotification("error", err.message);
        }
    }

    // Render info exercise
    function renderInfo() {
        const ex = activeExercise;
        const start = formatDateTime(ex.start_time);

        startCountdown(ex.start_time); // Mulai countdown

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

    // Render semua soal dan opsinya
    function renderQuestions() {
        questionsContainer.innerHTML = "";

        activeExercise.questions.forEach((q, index) => {
            const qCard = document.createElement("div");
            qCard.classList.add("question-card");

            // Membuat HTML opsi
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

            // Jika soal ada gambar
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

        // Event klik opsi → pilih jawaban
        document.querySelectorAll(".option-card").forEach((el) => {
            el.addEventListener("click", () => {
                const qid = el.dataset.question;
                const oid = el.dataset.option;

                selectedAnswers[qid] = oid; // Simpan jawaban

                // Hilangkan highlight pada opsi lain
                document
                    .querySelectorAll(`.option-card[data-question='${qid}']`)
                    .forEach((c) => c.classList.remove("option-selected"));

                el.classList.add("option-selected"); // Highlight opsi terpilih
            });
        });
    }

    // Event klik submit
    btnSubmit.addEventListener("click", submitExercise);

    async function submitExercise() {
        // Validasi: semua soal harus dijawab
        if (Object.keys(selectedAnswers).length !== activeExercise.questions.length) {
            showNotification("alert", "Please answer all questions before submitting.");
            return; // hentikan submit
        }

        // Cegah double submission
        if (isSubmitting) return;

        isSubmitting = true;
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Submitting...";

        // Hentikan countdown
        if (countdownInterval) clearInterval(countdownInterval);

        // Siapkan jawaban untuk dikirim
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

    // Countdown timer
    function startCountdown(startEpoch) {
        const total = 20 * 60 * 1000; // 20 menit

        countdownInterval = setInterval(() => {
            const elapsed = Date.now() - startEpoch;
            const remaining = total - elapsed;

            if (remaining <= 0) {
                clearInterval(countdownInterval);
                document.getElementById("countdownValue").textContent = "00:00";
                submitExercise(); // auto-submit saat waktu habis
                return;
            }

            const min = String(Math.floor(remaining / 60000)).padStart(2, "0");
            const sec = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

            document.getElementById("countdownValue").textContent = `${min}:${sec}`;
        }, 1000);
    }

    // Format tanggal & waktu
    function formatDateTime(epoch) {
        const d = new Date(epoch);
        return `${String(d.getDate()).padStart(2, "0")}/${String(
            d.getMonth() + 1
        ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
            2,
            "0"
        )}:${String(d.getMinutes()).padStart(2, "0")}`;
    }

    // Capitalize string
    function capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : "-";
    }
});
