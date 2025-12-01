(function () {
  const signupForm = document.querySelector('form[data-auth="signup"]');
  if (!signupForm) return;

  const email = signupForm.querySelector('[data-email]');
  const sendCodeBtn = signupForm.querySelector('[data-send-code]');
  const pw = signupForm.querySelector('[data-pw]');
  const pw2 = signupForm.querySelector('[data-pw2]');
  const agree = signupForm.querySelector('[data-agree]');
  const continueBtn = signupForm.querySelector('[data-continue]');

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

  function refresh() {
    const emailOk = isValidEmail(email?.value);
    if (sendCodeBtn) sendCodeBtn.disabled = !emailOk;

    const pwOk = (pw?.value || "").length >= 6;
    const match = (pw?.value || "") === (pw2?.value || "");
    const agreeOk = !!agree?.checked;

    if (continueBtn) continueBtn.disabled = !(emailOk && pwOk && match && agreeOk);
  }

  email?.addEventListener("input", refresh);
  pw?.addEventListener("input", refresh);
  pw2?.addEventListener("input", refresh);
  agree?.addEventListener("change", refresh);

  sendCodeBtn?.addEventListener("click", () => {
    // Fake client-side behavior (replace with real email verification later)
    sendCodeBtn.textContent = "Verification code sent ✓";
    sendCodeBtn.disabled = true;
    setTimeout(() => {
      sendCodeBtn.textContent = "Send verification code";
      refresh();
    }, 2500);
  });

  refresh();
})();
/* =========================
   END auth.js
   ========================= */
   