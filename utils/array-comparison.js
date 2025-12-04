function arrayComparison(a, b) {
	// harus array
	if (!Array.isArray(a) || !Array.isArray(b)) return false;

	// array tidak boleh kosong
	if (a.length === 0 || b.length === 0) return false;

	// jumlah berbeda maka langsung false
	if (a.length !== b.length) return false;

	// cek apakah elemen sama
	const setA = new Set(a);
	for (const item of b) {
		if (!setA.has(item)) return false;
	}

	return true;
}

module.exports = arrayComparison;
