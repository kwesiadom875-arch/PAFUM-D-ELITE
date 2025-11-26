const argon2 = require('argon2');
(async () => {
  try {
    const hash = await argon2.hash("password");
    console.log("Hash:", hash);
    const verify = await argon2.verify(hash, "password");
    console.log("Verify:", verify);
  } catch (err) {
    console.error("Argon2 Error:", err);
  }
})();
