// ── 邮箱复制按钮 ─────────────────────────────────────
// 邮箱不在 JS 里硬编码，而是从页面上的 mailto 链接读取。
// 这样"页面上显示的地址"和"复制到剪贴板的地址"永远是同一个来源，
// 改邮箱只需改 index.html 一处；也不会出现明文邮箱藏在 JS 里被一眼看穿。
const mailBtn = document.getElementById("mail-btn");
const mailHint = document.getElementById("mail-hint");

function readEmail() {
  const a = document.querySelector(".mail-addr");
  if (!a) return "";
  const href = a.getAttribute("href") || "";
  if (href.indexOf("mailto:") === 0) return href.slice(7).trim();
  const text = (a.textContent || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text : "";
}

let hintTimer;

function setHint(text) {
  if (mailHint) mailHint.textContent = text;
}

function copyViaTextarea(value) {
  const ta = document.createElement("textarea");
  ta.value = value;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.top = "-1000px";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

function showCopied() {
  if (mailBtn) mailBtn.classList.add("copied");
  const prev = mailHint ? mailHint.textContent : "";
  setHint("已复制 ✓");
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    if (mailBtn) mailBtn.classList.remove("copied");
    setHint(prev || "点「复制」可以把地址复制走。");
  }, 1800);
}

if (mailBtn) {
  mailBtn.addEventListener("click", async () => {
    const email = readEmail();
    if (!email) {
      setHint("复制失败，请手动选中地址");
      return;
    }
    // 优先用异步剪贴板 API（需要 https，本站有）
    try {
      await navigator.clipboard.writeText(email);
      showCopied();
      return;
    } catch {
      // 退路：旧浏览器或非安全上下文
    }
    if (copyViaTextarea(email)) showCopied();
    else setHint("复制失败，请手动选中地址");
  });
}

// ── 滚动淡入 ─────────────────────────────────────────
// 用 rootMargin 而非 threshold：若某个 section 比视口还高，
// threshold 可能永远触发不了，那块内容就会永久停在 opacity:0。
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0, rootMargin: "0px 0px -10% 0px" }
  );

  document.querySelectorAll("section").forEach((el) => {
    el.classList.add("fade-in");
    io.observe(el);
  });
}
