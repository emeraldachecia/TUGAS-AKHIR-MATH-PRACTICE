const { Worker } = require("worker_threads");
const path = require("path");

class GeneratePool {
    // constructor menerima size yaitu jumlah worker (default 4)
    constructor(size = 4) {
        // menyimpan jumlah worker
        this.size = size;
        // menyimpan instance worker dalam array
        this.workers = [];
        // queue untuk menyimpan tugas yang belum dikerjakan
        this.queue = [];
        // menandai worker sedang aktif atau tidak
		this.active = new Array(size).fill(false);

        // membuat worker sesuai jumlah size
        for (let i = 0; i < size; i++) {
            
            // membuat worker baru
			this.workers[i] = new Worker(path.join(__dirname, "generate-worker.js"));
		}
	}

    // method untuk menjalankan tugas baru
    runTask(templates) {
        return new Promise((resolve, reject) => {
            // simpan tugas dalam queue (dalam bentuk object)
			this.queue.push({ templates, resolve, reject });
			this.processQueue();
		});
	}

    // method untuk memproses antrian tugas
    processQueue() {
        // loop semua worker
        for (let i = 0; i < this.size; i++) {
            // jika worker sedang idle dan masih ada tugas
            if (!this.active[i] && this.queue.length > 0) {
                
                // ambil 1 tugas dari queue
				const { templates, resolve, reject } = this.queue.shift();

                // tandai worker ini sedang sibuk
				this.active[i] = true;

                // tunggu pesan hasil dari worker
                this.workers[i].once("message", (msg) => {
                    
                    // setelah selesai, tandai worker kembali idle
					this.active[i] = false;

                    // jika worker berhasil memproses
					if (msg.ok) {
                        resolve(msg.result);
                        
                    // jika worker gagal
					} else {
						reject(new Error(msg.error));
					}

                    // cek lagi apakah masih ada antrian tugas
					this.processQueue();
				});

                // kirim data tugas ke worker untuk diproses
				this.workers[i].postMessage(templates);
			}
		}
	}
}

// export dengan 4 worker
module.exports = new GeneratePool(4);
