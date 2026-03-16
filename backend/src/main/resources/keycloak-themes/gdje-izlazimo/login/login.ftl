<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
<#if section = "form">

  <div class="gi-card">
    <div class="gi-shine"></div>

    <div class="gi-brand">
      <span class="gi-dot"></span>
      <span class="gi-brand-name">gdje izlazimo</span>
    </div>

    <div class="gi-heading">
      <h1 class="gi-title">Dobrodošli nazad</h1>
      <p class="gi-sub">Jeste spremni za izlazak?!</p>
    </div>

    <#if messagesPerField?? && messagesPerField.existsError('username','password')>
      <div class="gi-alert gi-alert-error">
        <svg class="gi-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8v4m0 4h.01" stroke-linecap="round"/>
        </svg>
        <span>${messagesPerField.getFirstError('username','password')}</span>
      </div>
    </#if>

    <form id="kc-form-login" action="${url.loginAction}" method="post"
          onsubmit="document.getElementById('kc-login').disabled=true;">

      <div class="gi-field">
        <label class="gi-label" for="username">Email</label>
        <div class="gi-input-wrap">
          <input
            id="username" name="username" type="text"
            autocomplete="username" autofocus
            value="${(login.username!'')}"
            placeholder="Upišite vašu e-mail adresu"
            class="gi-input"
          />
          <span class="gi-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="15" height="15">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </span>
        </div>
      </div>

      <div class="gi-field">
        <div class="gi-field-row">
          <label class="gi-label" for="password">Password</label>
          <#if realm.resetPasswordAllowed>
            <a href="${url.loginResetCredentialsUrl}" class="gi-forgot">Zaboravili ste lozinku?</a>
          </#if>
        </div>
        <div class="gi-input-wrap">
          <input
            id="password" name="password" type="password"
            autocomplete="current-password"
            placeholder="Upišite vašu šifru"
            class="gi-input"
          />
          <button type="button" class="gi-input-icon gi-eye-btn"
                  onclick="togglePassword()" aria-label="Prikaži lozinku">
            <svg id="gi-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="15" height="15">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>

      <#if realm.rememberMe?? && realm.rememberMe>
        <div class="gi-remember">
          <label class="gi-check-label">
            <input type="checkbox" name="rememberMe" class="gi-check-input"
              <#if login.rememberMe??>checked</#if>/>
            <span class="gi-check-box"></span>
            <span class="gi-check-text">Zapamti me</span>
          </label>
        </div>
      </#if>

      <button id="kc-login" type="submit" class="gi-btn">Uloguj se</button>

    </form>

    <#if realm.registrationAllowed?? && realm.registrationAllowed>
      <p class="gi-register">
        Ukoliko nemate nalog, kliknite na
        <a href="${url.registrationUrl}" class="gi-register-link">Register</a>
      </p>
    </#if>
  </div>

  <script>
    function togglePassword() {
      var inp = document.getElementById('password');
      var ico = document.getElementById('gi-eye');
      if (inp.type === 'password') {
        inp.type = 'text';
        ico.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>';
      } else {
        inp.type = 'password';
        ico.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/>';
      }
    }
  </script>

</#if>
</@layout.registrationLayout>
