<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="bs">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Gdje Izlazimo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      height: 100%;
      background: #08070F;
      font-family: 'DM Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* ── Blobs ── */
    .gi-bg-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
    .gi-blob { position: absolute; border-radius: 50%; }
    .gi-blob-tl {
      top: -160px; left: -160px; width: 560px; height: 560px;
      background: radial-gradient(circle, rgba(124,58,237,0.30) 0%, rgba(109,40,217,0.10) 35%, transparent 70%);
      filter: blur(70px); opacity: 0.7;
    }
    .gi-blob-br {
      bottom: -120px; right: -120px; width: 480px; height: 480px;
      background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%);
      filter: blur(70px); opacity: 0.5;
    }
    .gi-blob-center {
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 900px; height: 500px;
      background: radial-gradient(ellipse, rgba(91,33,182,0.12) 0%, transparent 60%);
      filter: blur(80px); opacity: 0.8;
    }

    /* ── Page ── */
    .gi-page {
      position: relative; z-index: 1;
      min-height: 100vh;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 24px 16px;
    }

    /* ── Card ── */
    .gi-card {
      position: relative;
      width: 100%; max-width: 440px;
      background: #0A0909;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 26px;
      padding: 44px 40px 40px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03) inset;
      animation: card-in 0.55s cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes card-in {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .gi-shine {
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      width: 65%; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(124,58,237,0.55), rgba(124,58,237,0.55), transparent);
    }

    /* ── Brand ── */
    .gi-brand { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 28px; }
    .gi-dot {
      display: inline-block; width: 7px; height: 7px; border-radius: 50%;
      background: #7c3aed; box-shadow: 0 0 10px rgba(124,58,237,0.7);
      animation: dot-pulse 2.4s ease-in-out infinite;
      flex-shrink: 0;
    }
    @keyframes dot-pulse {
      0%,100% { box-shadow: 0 0 6px rgba(124,58,237,0.6); }
      50%      { box-shadow: 0 0 16px rgba(124,58,237,1.0); }
    }
    .gi-brand-name {
      font-size: 10px; font-weight: 500; letter-spacing: 0.22em;
      text-transform: uppercase; color: rgba(255,255,255,0.22);
    }

    /* ── Heading ── */
    .gi-heading { margin-bottom: 28px; }
    .gi-title {
      font-family: 'Sora', sans-serif;
      font-size: clamp(26px, 5vw, 34px);
      font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; margin: 0 0 6px;
      background: linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.70) 100%);
      background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .gi-sub {
      font-size: 10px; font-weight: 500; letter-spacing: 0.18em;
      text-transform: uppercase; color: rgba(255,255,255,0.22);
    }

    /* ── Alert ── */
    .gi-alert {
      display: flex; align-items: flex-start; gap: 10px;
      border-radius: 13px; border: 1px solid; padding: 12px 14px;
      margin-bottom: 18px; font-size: 13px; line-height: 1.5;
    }
    .gi-alert-icon { flex-shrink: 0; width: 16px; height: 16px; margin-top: 1px; }
    .gi-alert-error { border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.07); color: rgba(252,165,165,0.9); }
    .gi-alert-error .gi-alert-icon { color: #f87171; }

    /* ── Form ── */
    form { display: flex; flex-direction: column; gap: 16px; }

    /* ── Field ── */
    .gi-field { display: flex; flex-direction: column; gap: 7px; }
    .gi-label {
      font-size: 10px; font-weight: 500; letter-spacing: 0.14em;
      text-transform: uppercase; color: rgba(255,255,255,0.40);
    }
    .gi-field-row { display: flex; align-items: center; justify-content: space-between; }
    .gi-forgot { font-size: 11px; color: rgba(255,255,255,0.22); text-decoration: none; transition: color 0.2s; }
    .gi-forgot:hover { color: rgba(167,139,250,0.85); }

    /* ── Input ── */
    .gi-input-wrap { position: relative; }
    .gi-input {
      width: 100%; height: 50px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 13px;
      padding: 0 46px 0 16px;
      font-family: 'DM Sans', sans-serif; font-size: 14px;
      color: rgba(255,255,255,0.85); outline: none;
      transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
      caret-color: rgba(139,92,246,0.85);
    }
    .gi-input::placeholder { color: rgba(255,255,255,0.20); }
    .gi-input:hover { border-color: rgba(255,255,255,0.16); background: rgba(255,255,255,0.05); }
    .gi-input:focus {
      border-color: rgba(124,58,237,0.5);
      background: rgba(255,255,255,0.06);
      box-shadow: 0 0 0 3px rgba(124,58,237,0.12), 0 4px 16px rgba(124,58,237,0.08);
    }

    /* ── Input icon ── */
    .gi-input-icon {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      width: 18px; height: 18px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.22); pointer-events: none;
    }
    .gi-input-icon svg { width: 15px; height: 15px; display: block; }

    .gi-eye-btn {
      pointer-events: all; background: none; border: none;
      cursor: pointer; padding: 0; border-radius: 5px;
      transition: color 0.15s;
    }
    .gi-eye-btn:hover { color: rgba(255,255,255,0.55); }

    /* ── Remember ── */
    .gi-remember { display: flex; }
    .gi-check-label { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; }
    .gi-check-input { display: none; }
    .gi-check-box {
      width: 16px; height: 16px; border-radius: 5px; flex-shrink: 0;
      border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.03);
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.15s, background 0.15s;
    }
    .gi-check-input:checked + .gi-check-box { background: #7c3aed; border-color: #7c3aed; }
    .gi-check-input:checked + .gi-check-box::after {
      content: ''; display: block;
      width: 9px; height: 5px;
      border-left: 1.8px solid #fff; border-bottom: 1.8px solid #fff;
      transform: rotate(-45deg) translateY(-1px);
    }
    .gi-check-text { font-size: 13px; color: rgba(255,255,255,0.40); }

    /* ── Submit ── */
    .gi-btn {
      margin-top: 4px; width: 100%; height: 52px;
      border: none; border-radius: 13px;
      background: #ffffff; color: #08070F;
      font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 600;
      cursor: pointer; letter-spacing: 0.01em;
      position: relative; overflow: hidden;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
      box-shadow: 0 4px 24px rgba(255,255,255,0.08);
    }
    .gi-btn::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
      transform: translateX(-100%); transition: transform 0.5s ease;
    }
    .gi-btn:hover { transform: translateY(-1px) scale(1.008); box-shadow: 0 8px 32px rgba(255,255,255,0.14); }
    .gi-btn:hover::before { transform: translateX(100%); }
    .gi-btn:active { transform: scale(0.98); }
    .gi-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    /* ── Register ── */
    .gi-register { margin-top: 22px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.22); }
    .gi-register-link { color: rgba(167,139,250,0.80); text-decoration: none; font-weight: 500; transition: color 0.2s; }
    .gi-register-link:hover { color: rgba(196,181,253,1); text-decoration: underline; text-underline-offset: 3px; }

    .gi-field-error { font-size: 11px; color: rgba(252,165,165,0.85); margin-top: 3px; }
    .gi-field-hint { font-size: 11px; color: rgba(255,255,255,0.22); margin-top: 3px; }
    .gi-input-error { border-color: rgba(239,68,68,0.45) !important; }
    .gi-input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; }

    /* ── Success alert ── */
    .gi-alert-success { border-color: rgba(34,197,94,0.25); background: rgba(34,197,94,0.07); color: rgba(134,239,172,0.9); }
    .gi-alert-success .gi-alert-icon { color: #4ade80; }

    /* ── Verify email page ── */
    .gi-email-icon {
      display: flex; align-items: center; justify-content: center;
      margin: 4px 0 20px;
    }
    .gi-verify-text {
      font-size: 14px; line-height: 1.65; color: rgba(255,255,255,0.55);
      margin-bottom: 14px;
    }
    .gi-verify-email {
      display: block; margin-top: 4px;
      font-weight: 600; color: rgba(167,139,250,0.9);
      font-style: normal; word-break: break-all;
    }
    .gi-verify-hint {
      font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.28);
      margin-bottom: 20px;
    }
    .gi-verify-divider {
      height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 20px;
    }


    /* ── Override Keycloak native forms (reset, verify email, update password) ── */
    #kc-reset-password-form,
    #kc-passwd-update-form,
    .form-horizontal {
      display: flex; flex-direction: column; gap: 16px;
      width: 440px; max-width: 100%;
      background: #0A0909;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 26px;
      padding: 44px 40px 40px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03) inset;
      animation: card-in 0.55s cubic-bezier(0.22,1,0.36,1) both;
      position: relative;
    }

    .form-group { display: flex; flex-direction: column; gap: 7px; }

    .pf-c-form__label,
    .pf-c-form__label-text,
    label[for="username"],
    label[for="password"],
    label[for="password-new"],
    label[for="password-confirm"] {
      font-size: 10px !important; font-weight: 500 !important;
      letter-spacing: 0.14em !important; text-transform: uppercase !important;
      color: rgba(255,255,255,0.40) !important; font-family: 'DM Sans', sans-serif !important;
    }

    .pf-c-form-control,
    input[type="text"].pf-c-form-control,
    input[type="email"].pf-c-form-control,
    input[type="password"].pf-c-form-control {
      width: 100% !important; height: 50px !important;
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      border-radius: 13px !important;
      padding: 0 16px !important;
      font-family: 'DM Sans', sans-serif !important; font-size: 14px !important;
      color: rgba(255,255,255,0.85) !important; outline: none !important;
      transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease !important;
      caret-color: rgba(139,92,246,0.85) !important;
      box-shadow: none !important;
    }

    .pf-c-form-control:hover {
      border-color: rgba(255,255,255,0.16) !important;
      background: rgba(255,255,255,0.05) !important;
    }

    .pf-c-form-control:focus {
      border-color: rgba(124,58,237,0.5) !important;
      background: rgba(255,255,255,0.06) !important;
      box-shadow: 0 0 0 3px rgba(124,58,237,0.12), 0 4px 16px rgba(124,58,237,0.08) !important;
    }

    .pf-c-button.pf-m-primary,
    input[type="submit"].pf-c-button {
      margin-top: 4px !important; width: 100% !important; height: 52px !important;
      border: none !important; border-radius: 13px !important;
      background: #ffffff !important; color: #08070F !important;
      font-family: 'Sora', sans-serif !important; font-size: 15px !important;
      font-weight: 600 !important; cursor: pointer !important;
      letter-spacing: 0.01em !important;
      box-shadow: 0 4px 24px rgba(255,255,255,0.08) !important;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease !important;
    }

    .pf-c-button.pf-m-primary:hover,
    input[type="submit"].pf-c-button:hover {
      transform: translateY(-1px) scale(1.008) !important;
      box-shadow: 0 8px 32px rgba(255,255,255,0.14) !important;
    }

    #kc-form-options a,
    .login-pf-settings a {
      font-size: 11px !important; color: rgba(167,139,250,0.80) !important;
      text-decoration: none !important; font-weight: 500 !important;
    }

    #kc-form-options a:hover { color: rgba(196,181,253,1) !important; }

    /* PatternFly grid overrides */
    .col-xs-12, .col-sm-12, .col-md-12, .col-lg-12 {
      width: 100% !important; padding: 0 !important; float: none !important;
    }

    .login-pf-settings {
      display: flex !important; flex-direction: column !important; gap: 12px !important;
    }

    @media (max-width: 480px) {
      .gi-card { padding: 36px 24px 32px; border-radius: 22px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .gi-card, .gi-dot { animation: none !important; }
      .gi-btn, .gi-input { transition: none !important; }
    }
  </style>
</head>
<body>
  <div class="gi-bg-blobs" aria-hidden="true">
    <div class="gi-blob gi-blob-tl"></div>
    <div class="gi-blob gi-blob-br"></div>
    <div class="gi-blob gi-blob-center"></div>
  </div>
  <main class="gi-page">
    <#nested "form">
    <#nested "info">
  </main>
</body>
</html>
</#macro>
