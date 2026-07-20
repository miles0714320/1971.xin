// ── Copy-to-clipboard email button ──────────────────
const mailBtn = document.getElementById("mail-btn");
const mailHint = document.getElementById("mail-hint");
const EMAIL = "luoxiang@agent.qq.com";

if (mailBtn) {
  mailBtn.addEventListener("click", async () => {
    try {
      // Modern async clipboard API (needs https, we have it via Cloudflare)
      await navigator.clipboard.writeText(EMAIL);
      showCopied();
    } catch {
      // Fallback: temporary textarea + execCommand
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        showCopied();
      } catch {
        // Last resort: just show the address selected
        mailHint.textContent = "请手动复制";
      } finally {
        document.body.removeChild(ta);
      }
    }
  });
}

function showCopied() {
  mailBtn.classList.add("copied");
  const prev = mailHint.textContent;
  mailHint.textContent = "已复制 ✓";
  setTimeout(() => {
    mailBtn.classList.remove("copied");
    mailHint.textContent = prev;
  }, 1800);
}

// ── Fade sections in ────────────────────────────────
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    }
  },
  { threshold: 0.12 }
);

document.querySelectorAll("section").forEach((el) => {
  el.classList.add("fade-in");
  io.observe(el);
});
