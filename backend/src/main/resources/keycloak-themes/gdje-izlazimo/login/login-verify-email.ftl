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
        <h1 class="gi-title">Potvrdite email</h1>
        <p class="gi-sub">Jedan korak do izlaska!</p>
      </div>

      <div class="gi-email-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
          <rect x="4" y="12" width="56" height="40" rx="6" fill="rgba(124,58,237,0.10)" stroke="rgba(124,58,237,0.35)" stroke-width="1.5"/>
          <polyline points="4,16 32,36 60,16" stroke="rgba(124,58,237,0.55)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>

      <p class="gi-verify-text">
        Poslali smo vam email na adresu
        <strong class="gi-verify-email">${user.email!''}</strong>.
        Kliknite na link u emailu kako biste potvrdili vaš nalog.
      </p>

      <p class="gi-verify-hint">
        Niste dobili email? Provjerite spam folder ili
        <a href="${url.loginAction}" class="gi-register-link">pošaljite ponovo</a>.
      </p>

      <div class="gi-verify-divider"></div>

      <p class="gi-register">
        Pogrešan nalog?
        <a href="${url.loginUrl}" class="gi-register-link">Vrati se na prijavu</a>
      </p>
    </div>

  </#if>
</@layout.registrationLayout>
