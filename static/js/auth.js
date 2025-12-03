(function () {
  const form = document.querySelector('form[data-auth="signup"]');
  if (!form) return;

  const email = form.querySelector('[data-email]');
  const sendCodeBtn = form.querySelector('[data-send-code]');
  const pw = form.querySelector('[data-pw]');
  const pw2 = form.querySelector('[data-pw2]');
  const agree = form.querySelector('[data-agree]');
  const continueBtn = form.querySelector('[data-continue]');
  const pwErr = form.querySelector("[data-pw-error]");

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

  function validatePw() {
    if (!pw || !pwErr) return true;

    const val = pw.value || "";
    if (val.length === 0) {
      pw.classList.remove("is-invalid");
      pw.setAttribute("aria-invalid", "false");
      pwErr.textContent = "";
      return false; 
    }
    if (val.length < 8) {
      pw.classList.add("is-invalid");
      pw.setAttribute("aria-invalid", "true");
      pwErr.textContent = "Password must be at least 8 characters long.";
      return false;
    }
    pw.classList.remove("is-invalid");
    pw.setAttribute("aria-invalid", "false");
    pwErr.textContent = "";
    return true;
  }

  function refresh() {
    const emailOk = isValidEmail(email?.value);
    if (sendCodeBtn) sendCodeBtn.disabled = !emailOk;

    const pwOk = validatePw();
    const match = (pw?.value || "") === (pw2?.value || "");
    const agreeOk = !!agree?.checked;

    if (continueBtn) continueBtn.disabled = !(emailOk && pwOk && match && agreeOk);
  }

  email?.addEventListener("input", refresh);
  pw?.addEventListener("input", refresh);
  pw2?.addEventListener("input", refresh);
  agree?.addEventListener("change", refresh);

  sendCodeBtn?.addEventListener("click", () => {
    sendCodeBtn.textContent = "Verification code sent ✓";
    sendCodeBtn.disabled = true;
    setTimeout(() => {
      sendCodeBtn.textContent = "Send verification code";
      refresh();
    }, 2500);
  });

  form.addEventListener("submit", (e) => {
    if (!validatePw()) e.preventDefault();
  });

  refresh();
})();
