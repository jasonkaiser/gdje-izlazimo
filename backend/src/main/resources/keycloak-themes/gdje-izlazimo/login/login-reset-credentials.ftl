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
        <h1 class="gi-title">Zaboravili ste lozinku?</h1>
        <p class="gi-sub">Poslat ćemo vam link za reset</p>
      </div>

      <#if message??>
        <#if message.type = 'error'>
          <div class="gi-alert gi-alert-error">
            <svg class="gi-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v4m0 4h.01" stroke-linecap="round"/>
            </svg>
            <span>${message.summary}</span>
          </div>
        </#if>
        <#if message.type = 'success'>
          <div class="gi-alert gi-alert-success">
            <svg class="gi-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
              <circle cx="12" cy="12" r="9"/>
              <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Email je poslan! Provjerite inbox.</span>
          </div>
        </#if>
      </#if>

      <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
        <div class="gi-field">
          <label class="gi-label" for="username">Email adresa</label>
          <div class="gi-input-wrap">
            <input
              id="username" name="username" type="email"
              autocomplete="email" autofocus
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

        <button type="submit" class="gi-btn">Pošalji link za reset</button>
      </form>

      <p class="gi-register">
        Sjetili ste se lozinke?
        <a href="${url.loginUrl}" class="gi-register-link">Vrati se na prijavu</a>
      </p>
    </div>

  </#if>
</@layout.registrationLayout>
