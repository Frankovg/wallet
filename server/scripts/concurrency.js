// Concurrency test: 10 simultaneous $200 transfers from an account with $1000.
// Expected: exactly 5 successful (201), 5 rejected (422) and a final balance of 0.
// Requires the API running: npm run dev
const API = `http://localhost:${process.env.PORT || 4000}/api`;

async function call(path, { token, ...opts } = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  });
  return { status: res.status, body: await res.json() };
}

const stamp = Date.now();
const register = (name) =>
  call('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email: `${name}-${stamp}@test.com`, password: 'password123' }),
  });

const a = await register('alice');
const b = await register('bob');

const results = await Promise.all(
  Array.from({ length: 10 }, () =>
    call('/transfers', {
      method: 'POST',
      token: a.body.token,
      body: JSON.stringify({ toEmail: b.body.user.email, amount: '200' }),
    })
  )
);

const statuses = results.map((r) => r.status);
const ok = statuses.filter((s) => s === 201).length;
const rejected = statuses.filter((s) => s === 422).length;
const meA = await call('/me', { token: a.body.token });
const meB = await call('/me', { token: b.body.token });

console.log({ statuses, ok, rejected, balanceA: meA.body.account.balance, balanceB: meB.body.account.balance });

const pass = ok === 5 && rejected === 5 && meA.body.account.balance === 0 && meB.body.account.balance === 200000;
console.log(pass ? 'PASS' : 'FAIL');
process.exit(pass ? 0 : 1);
