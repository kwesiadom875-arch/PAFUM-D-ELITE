
async function testAuth() {
  const email = 'fixed_email_' + Date.now() + '@example.com';
  const password = 'password123456';

  console.log("--- Testing Register (First Attempt) ---");
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'user_fixed_1_' + Date.now(),
        email: email,
        password: password
      })
    });
    const data = await res.json();
    console.log("Register 1 Status:", res.status);
    console.log("Register 1 Data:", data);
  } catch (err) {
    console.error("Register 1 Fetch Error:", err);
  }

  console.log("\n--- Testing Register (Second Attempt - Should Fail with 400) ---");
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'user_fixed_2_' + Date.now(),
        email: email,
        password: password
      })
    });
    const data = await res.json();
    console.log("Register 2 Status:", res.status);
    console.log("Register 2 Data:", data);
  } catch (err) {
    console.error("Register 2 Fetch Error:", err);
  }
}

testAuth();
