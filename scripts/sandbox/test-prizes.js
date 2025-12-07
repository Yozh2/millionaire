const CLASSIC_MULTIPLIERS_15 = [
  0.0001, 0.0002, 0.0003, 0.0005, 0.001,
  0.002, 0.004, 0.008, 0.016, 0.032,
  0.064, 0.125, 0.25, 0.5, 1.0
];

const niceNumbers = [
  100, 200, 300, 400, 500, 600, 700, 800, 900,
  1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000,
  10000, 12000, 15000, 16000, 20000, 25000, 30000, 32000, 40000, 50000,
  60000, 64000, 75000, 80000, 100000, 125000, 150000, 200000, 250000,
  300000, 400000, 500000, 600000, 750000, 800000,
  1000000, 1500000, 2000000, 2500000, 3000000
];

const roundToNice = (v) => niceNumbers.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);

const interpolate = (n) => {
  if (n === 15) return [...CLASSIC_MULTIPLIERS_15];
  const m = [];
  for (let i = 0; i < n; i++) {
    const pos = (i / (n - 1)) * 14;
    const lo = Math.floor(pos), hi = Math.min(lo + 1, 14);
    const f = pos - lo;
    m.push(CLASSIC_MULTIPLIERS_15[lo] * Math.pow(CLASSIC_MULTIPLIERS_15[hi] / CLASSIC_MULTIPLIERS_15[lo], f));
  }
  return m;
};

const generate = (n, max) => {
  const mults = interpolate(n);
  let prev = 0;
  return mults.map((m, i) => {
    let v = roundToNice(max * m);
    if (v <= prev) v = prev + (prev < 1000 ? 100 : prev < 10000 ? 500 : prev < 100000 ? 1000 : 10000);
    if (i === n - 1) v = max;
    prev = v;
    return v;
  });
};

console.log('15 questions, 1M max:');
console.log(generate(15, 1000000).map(v => v.toLocaleString('ru')).join(', '));

console.log('\n12 questions, 1M max:');
console.log(generate(12, 1000000).map(v => v.toLocaleString('ru')).join(', '));

console.log('\n10 questions, 1M max:');
console.log(generate(10, 1000000).map(v => v.toLocaleString('ru')).join(', '));

console.log('\n15 questions, 3M gold max:');
console.log(generate(15, 3000000).map(v => v.toLocaleString('ru')).join(', '));
