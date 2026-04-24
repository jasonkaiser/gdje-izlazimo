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
      <h1 class="gi-title">Kreiraj nalog</h1>
      <p class="gi-sub">Pridruži se i pronađi gdje izaći!</p>
    </div>

    <#if messagesPerField??>
      <#if messagesPerField.existsError('username','email','password','password-confirm','user.attributes.phone')>
        <div class="gi-alert gi-alert-error">
          <svg class="gi-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v4m0 4h.01" stroke-linecap="round"/>
          </svg>
          <span>Molimo ispravite greške u formi.</span>
        </div>
      </#if>
    </#if>

    <form id="kc-register-form" action="${url.registrationAction}" method="post">

      <!-- Username -->
      <div class="gi-field">
        <label class="gi-label" for="username">Korisničko ime</label>
        <div class="gi-input-wrap">
          <input
            id="username"
            name="username"
            type="text"
            autocomplete="username"
            value="${(register.formData.username!'')}"
            placeholder="Unesite korisničko ime"
            class="gi-input <#if messagesPerField?? && messagesPerField.existsError('username')>gi-input-error</#if>"
          />
          <span class="gi-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="15" height="15">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
        </div>
        <#if messagesPerField?? && messagesPerField.existsError('username')>
          <span class="gi-field-error">${messagesPerField.getFirstError('username')}</span>
        </#if>
      </div>



      <!-- Email -->
      <div class="gi-field">
        <label class="gi-label" for="email">Email</label>
        <div class="gi-input-wrap">
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            value="${(register.formData.email!'')}"
            placeholder="Upišite vašu e-mail adresu"
            class="gi-input <#if messagesPerField?? && messagesPerField.existsError('email')>gi-input-error</#if>"
          />
          <span class="gi-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="15" height="15">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </span>
        </div>
        <#if messagesPerField?? && messagesPerField.existsError('email')>
          <span class="gi-field-error">${messagesPerField.getFirstError('email')}</span>
        </#if>
      </div>

      <!-- Phone -->
      <div class="gi-field">
        <label class="gi-label" for="user.attributes.phone">Broj telefona</label>
        <div class="gi-input-wrap">
          <input
            id="user.attributes.phone"
            name="user.attributes.phone"
            type="tel"
            autocomplete="tel"
            inputmode="tel"
            value="${(register.formData['user.attributes.phone']!'')}"
            placeholder="065052080 ili +38765052080"
            maxlength="16"
            class="gi-input <#if messagesPerField?? && messagesPerField.existsError('user.attributes.phone')>gi-input-error</#if>"
          />
          <span class="gi-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="15" height="15">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
        <#if messagesPerField?? && messagesPerField.existsError('user.attributes.phone')>
          <span class="gi-field-error">${messagesPerField.getFirstError('user.attributes.phone')}</span>
        </#if>
      </div>

      <!-- Password -->
      <div class="gi-field">
        <label class="gi-label" for="password">Lozinka</label>
        <div class="gi-input-wrap">
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            placeholder="Kreirajte lozinku"
            class="gi-input <#if messagesPerField?? && messagesPerField.existsError('password')>gi-input-error</#if>"
          />
          <button type="button" class="gi-input-icon gi-eye-btn"
                  onclick="togglePassword('password','gi-eye-1')" aria-label="Prikaži lozinku">
            <svg id="gi-eye-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="15" height="15">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <#if messagesPerField?? && messagesPerField.existsError('password')>
          <span class="gi-field-error">${messagesPerField.getFirstError('password')}</span>
        </#if>
      </div>

      <!-- Confirm Password -->
      <div class="gi-field">
        <label class="gi-label" for="password-confirm">Potvrdi lozinku</label>
        <div class="gi-input-wrap">
          <input
            id="password-confirm"
            name="password-confirm"
            type="password"
            autocomplete="new-password"
            placeholder="Ponovite lozinku"
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

      <button id="kc-register" type="submit" class="gi-btn" style="margin-top:4px;">
        Registruj se
      </button>

    </form>

    <p class="gi-register">
      Već imate nalog?
      <a href="${url.loginUrl}" class="gi-register-link">Uloguj se</a>
    </p>

  </div>

  <script>
    // Phone input — allow only digits, +, spaces
    (function() {
      var ph = document.getElementById('user.attributes.phone');
      if (!ph) return;
      ph.addEventListener('input', function() {
        // strip anything that isn't digit, +, or space
        var pos = this.selectionStart;
        var oldLen = this.value.length;
        this.value = this.value.replace(/[^0-9+\s]/g, '');
        // keep + only at position 0
        this.value = this.value.replace(/(?!^)\+/g, '');
        // restore cursor
        var diff = oldLen - this.value.length;
        this.setSelectionRange(pos - diff, pos - diff);
      });
      ph.addEventListener('keydown', function(e) {
        // allow: backspace, delete, tab, escape, enter, arrows, home, end
        var allowed = [8,9,13,27,46,37,38,39,40,35,36];
        if (allowed.indexOf(e.keyCode) !== -1) return;
        // allow + only as first char
        if (e.key === '+' && this.selectionStart === 0 && this.value.indexOf('+') === -1) return;
        // allow digits
        if (e.key >= '0' && e.key <= '9') return;
        // allow space
        if (e.key === ' ') return;
        e.preventDefault();
      });
    })();

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
