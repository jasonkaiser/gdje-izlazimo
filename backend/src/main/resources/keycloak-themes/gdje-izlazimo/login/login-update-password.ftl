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
        <h1 class="gi-title">Nova lozinka</h1>
        <p class="gi-sub">Odaberite novu lozinku za vaš nalog</p>
      </div>

      <#if message?? && message.type = 'error'>
        <div class="gi-alert gi-alert-error">
          <svg class="gi-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v4m0 4h.01" stroke-linecap="round"/>
          </svg>
          <span>${message.summary}</span>
        </div>
      </#if>

      <form id="kc-passwd-update-form" action="${url.loginAction}" method="post">
        <input type="hidden" id="username" name="username" value="${username}" autocomplete="username"/>

        <div class="gi-field">
          <label class="gi-label" for="password-new">Nova lozinka</label>
          <div class="gi-input-wrap">
            <input
              id="password-new" name="password-new" type="password"
              autocomplete="new-password" autofocus
              placeholder="Unesite novu lozinku"
              class="gi-input <#if messagesPerField?? && messagesPerField.existsError('password-new')>gi-input-error</#if>"
            />
            <button type="button" class="gi-input-icon gi-eye-btn"
                    onclick="togglePassword('password-new','gi-eye-1')" aria-label="Prikaži lozinku">
              <svg id="gi-eye-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="15" height="15">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <#if messagesPerField?? && messagesPerField.existsError('password-new')>
            <span class="gi-field-error">${messagesPerField.getFirstError('password-new')}</span>
          </#if>
        </div>

        <div class="gi-field">
          <label class="gi-label" for="password-confirm">Potvrdi lozinku</label>
          <div class="gi-input-wrap">
            <input
              id="password-confirm" name="password-confirm" type="password"
              autocomplete="new-password"
              placeholder="Ponovite novu lozinku"
              class="gi-input <#if messagesPerField?? && messagesPerField.existsError('password-confirm')>gi-input-error</#if>"
            />
            <button type="button" class="gi-input-icon gi-eye-btn"
                    onclick="togglePassword('password-confirm','gi-eye-2')" aria-label="Prikaži lozinku">
              <svg id="gi-eye-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="15" height="15">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <#if messagesPerField?? && messagesPerField.existsError('password-confirm')>
            <span class="gi-field-error">${messagesPerField.getFirstError('password-confirm')}</span>
          </#if>
        </div>

        <#if isAppInitiatedAction??>
          <div style="display:flex;">
            <label class="gi-check-label">
              <input type="checkbox" id="logout-sessions" name="logout-sessions" class="gi-check-input" value="on" checked/>
              <span class="gi-check-box"></span>
              <span class="gi-check-text">Odjavi me sa svih uređaja</span>
            </label>
          </div>
        </#if>

        <button type="submit" class="gi-btn">Sačuvaj lozinku</button>
      </form>
    </div>

    <script>
      function togglePassword(inputId, iconId) {
        var inp = document.getElementById(inputId);
        var ico = document.getElementById(iconId);
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
