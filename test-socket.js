// Quick Socket.IO integration test
const { io } = require("socket.io-client");

async function getToken(username, password) {
  const resp = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!resp.ok) {
    // If already registered, login instead
    const loginResp = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await loginResp.json();
    return data.token;
  }
  const data = await resp.json();
  return data.token;
}

async function main() {
  // Get tokens for two users
  const token1 = await getToken("socketuser1", "password123");
  const token2 = await getToken("socketuser2", "password123");

  console.log("[test] got tokens for both users");

  // Connect user1
  const socket1 = io("http://localhost:3000", { auth: { token: token1 } });
  // Connect user2
  const socket2 = io("http://localhost:3000", { auth: { token: token2 } });

  let passed = 0;
  const expected = 3;

  socket1.on("connect", () => {
    console.log("[test] user1 connected");
    passed++;
  });

  socket2.on("connect", () => {
    console.log("[test] user2 connected");
    passed++;
  });

  socket1.on("history", (history) => {
    console.log(`[test] user1 received history (${history.length} messages)`);
  });

  // user2 should receive the message broadcast from user1
  socket2.on("message", (msg) => {
    console.log(`[test] user2 received broadcast: ${JSON.stringify(msg)}`);
    if (msg.username === "socketuser1" && msg.content === "Hello from user1!") {
      passed++;
      console.log(`[test] PASSED (${passed}/${expected})`);
      socket1.disconnect();
      socket2.disconnect();
      process.exit(0);
    }
  });

  // Wait for both to connect, then send a message from user1
  setTimeout(() => {
    console.log("[test] user1 sending message...");
    socket1.emit("message", { content: "Hello from user1!" });
  }, 500);

  // Timeout
  setTimeout(() => {
    console.log(`[test] TIMEOUT - passed ${passed}/${expected}`);
    process.exit(1);
  }, 5000);

  // Test unauthenticated connection
  const badSocket = io("http://localhost:3000", { auth: {} });
  badSocket.on("connect_error", (err) => {
    console.log(`[test] unauthenticated correctly rejected: ${err.message}`);
    badSocket.disconnect();
  });
}

main().catch((err) => {
  console.error("[test] error:", err);
  process.exit(1);
});
