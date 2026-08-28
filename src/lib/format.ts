const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const num = new Intl.NumberFormat('en-US');

export const dollars = (n: number) => usd0.format(n);
export const cents = (n: number) => usd2.format(n);
export const count = (n: number) => num.format(n);
export const percent = (fraction: number) => `${(fraction * 100).toFixed(1).replace(/\.0$/, '')}%`;
