
  const logStore = [];
  async function sha256(msg) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(msg),
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  function nowISO() {
    return new Date().toISOString().replace("T", " ").slice(0, 19);
  }
  function shortH(h) {
    return h ? h.slice(0, 10) + "…" + h.slice(-6) : "GENESIS";
  }
  async function computeHash(e, ph) {
    return await sha256(
      [e.seq, e.timestamp, e.type, e.user, e.description, ph].join("|"),
    );
  }
  async function addEntry() {
    const type = document.getElementById("evt-type").value;
    const user = document.getElementById("evt-user").value.trim() || "system";
    const desc =
      document.getElementById("evt-desc").value.trim() || "(no description)";
    const ph = logStore.length
      ? logStore[logStore.length - 1].hash
      : "0".repeat(64);
    const e = {
      seq: logStore.length + 1,
      timestamp: nowISO(),
      type,
      user,
      description: desc,
      prevHash: ph,
    };
    e.hash = await computeHash(e, ph);
    logStore.push(e);
    document.getElementById("evt-desc").value = "";
    render();
    updateStats();
  }
  function chainOkAt(i) {
    if (i === 0) return true;
    return logStore[i].prevHash === logStore[i - 1].hash;
  }
  function countBroken() {
    let n = 0;
    for (let i = 1; i < logStore.length; i++) if (!chainOkAt(i)) n++;
    return n;
  }
  function render() {
    const empty = document.getElementById("empty-msg");
    const table = document.getElementById("log-table");
    const tbody = document.getElementById("log-tbody");
    if (!logStore.length) {
      empty.style.display = "";
      table.style.display = "none";
      return;
    }
    empty.style.display = "none";
    table.style.display = "";
    tbody.innerHTML = logStore
      .map((e, i) => {
        const ok = chainOkAt(i);
        return `<tr class="${ok ? "" : "tampered"}">
      <td class="seq-num">${e.seq}</td>
      <td style="white-space:nowrap;font-size:10px">${e.timestamp}</td>
      <td><span class="evt evt-${e.type}">${e.type}</span></td>
      <td>${e.user}</td>
      <td style="max-width:180px;font-size:11px">${e.description}</td>
      <td class="hash-val" title="${e.hash}">${shortH(e.hash)}</td>
      <td class="hash-val" title="${e.prevHash}">${shortH(e.prevHash)}</td>
      <td>${ok ? '<span class="chain-ok">✓ VALID</span>' : '<span class="chain-bad">✗ BROKEN</span>'}</td>
    </tr>`;
      })
      .join("");
    document.getElementById("verify-banner").style.display = "none";
  }
  function updateStats() {
    const b = countBroken();
    document.getElementById("s-total").textContent = logStore.length;
    document.getElementById("s-tampered").textContent = b;
    const s = document.getElementById("s-status");
    if (b) {
      s.textContent = "COMPROMISED";
      s.className = "stat-val bad";
    } else {
      s.textContent = "INTACT";
      s.className = "stat-val ok";
    }
  }
  async function verifyChain() {
    if (!logStore.length) {
      alert("No entries to verify.");
      return;
    }
    const issues = [];
    for (let i = 0; i < logStore.length; i++) {
      const e = logStore[i];
      const expectedPrev = i === 0 ? "0".repeat(64) : logStore[i - 1].hash;
      const recomputed = await computeHash(e, e.prevHash);
      if (recomputed !== e.hash)
        issues.push(`Entry #${e.seq}: hash mismatch — data was altered`);
      if (e.prevHash !== expectedPrev)
        issues.push(
          `Entry #${e.seq}: prevHash mismatch — deletion/reorder detected`,
        );
    }
    const banner = document.getElementById("verify-banner");
    banner.style.display = "block";
    document.getElementById("s-time").textContent =
      new Date().toLocaleTimeString();
    if (issues.length) {
      banner.className = "verify-banner verify-fail";
      banner.textContent = `CHAIN INTEGRITY FAILED — ${issues.length} issue(s): ${issues.slice(0, 3).join(" | ")}`;
    } else {
      banner.className = "verify-banner verify-ok";
      banner.textContent = `CHAIN VERIFIED — All ${logStore.length} entries are cryptographically intact and correctly linked.`;
    }
    updateStats();
    render();
  }
  function simulateAlter() {
    if (logStore.length < 2) {
      alert("Add at least 2 entries first.");
      return;
    }
    logStore[0].description = "[TAMPERED] " + logStore[0].description;
    render();
    updateStats();
    const b = document.getElementById("verify-banner");
    b.style.display = "block";
    b.className = "verify-banner verify-fail";
    b.textContent =
      'ATTACK SIMULATED: Entry #1 data altered. Hash now stale — chain broken. Click "Verify integrity" to confirm.';
  }
  function simulateDelete() {
    if (logStore.length < 3) {
      alert("Add at least 3 entries first.");
      return;
    }
    const removed = logStore.splice(1, 1)[0];
    render();
    updateStats();
    const b = document.getElementById("verify-banner");
    b.style.display = "block";
    b.className = "verify-banner verify-fail";
    b.textContent = `ATTACK SIMULATED: Entry #${removed.seq} deleted. All subsequent prevHash links now broken.`;
  }
  function simulateReorder() {
    if (logStore.length < 3) {
      alert("Add at least 3 entries first.");
      return;
    }
    [logStore[1], logStore[2]] = [logStore[2], logStore[1]];
    render();
    updateStats();
    const b = document.getElementById("verify-banner");
    b.style.display = "block";
    b.className = "verify-banner verify-fail";
    b.textContent =
      "ATTACK SIMULATED: Entries #2 and #3 swapped. prevHash chain immediately detects the reorder.";
  }
  function resetLog() {
    logStore.length = 0;
    document.getElementById("verify-banner").style.display = "none";
    render();
    updateStats();
  }
  (async () => {
    const seeds = [
      ["LOGIN", "akash", "Login from 10.0.0.5"],
      ["ACCESS", "akash", "Accessed /admin/dashboard"],
      ["TRANSACTION", "akash", "Transfer ₹5000 to acc#9182"],
      ["LOGOUT", "akash", "Session ended after 22 min"],
    ];
    for (const [t, u, d] of seeds) {
      document.getElementById("evt-type").value = t;
      document.getElementById("evt-user").value = u;
      document.getElementById("evt-desc").value = d;
      await addEntry();
    }
  })();
