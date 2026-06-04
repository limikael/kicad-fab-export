function rotate([x, y], deg) {
	const rad = deg * Math.PI / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);

	return [
		x * cos - y * sin,
		x * sin + y * cos
	];
}