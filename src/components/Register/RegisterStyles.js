export const registerStyles = `

.reg-root {
  display: flex;
  height: 100vh;
  width: 100%;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  overflow: hidden;
  background: #f8fafc;
}

.reg-left-panel {
  width: 45%;
  position: relative;
  overflow: hidden;
  display: none;
}

@media (min-width: 1024px) {
  .reg-left-panel {
    display: block;
  }
}

/* Framer-motion image wrapper */
.reg-bg-img-wrapper {
  position: absolute;
  inset: 0;
}

.reg-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Gradient overlays */
.reg-overlay-primary {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,92,85,0.45) 0%, rgba(0,40,35,0.85) 100%);
}

.reg-overlay-secondary {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15,118,110,0.25) 0%, transparent 50%);
}

/* Content layer */
.reg-left-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 44px;
}

/* position:relative lets the badge be anchored    */
/* absolutely, completely outside animation flow.  */
.reg-middle-section {
  position: relative;
  padding-top: 50px; /* visual gap for the absolute badge (~30px tall + 20px gap) */
}

.reg-badge {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(110,231,183,0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(110,231,183,0.25);
  border-radius: 999px;
  padding: 6px 16px;
  /* margin-bottom removed — padding-top on parent provides the gap */
}

.reg-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6EE7B7;
  flex-shrink: 0;
}

.reg-badge-text {
  color: #A7F3D0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.reg-slide-text-container {
  position: relative;
  min-height: 220px;
}

/* Framer animates opacity/y; position is static */
.reg-slide-text-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.reg-slide-title {
  color: #fff;
  font-size: 40px;
  font-weight: 900;
  line-height: 1.2;
  margin: 0 0 16px;
  letter-spacing: -0.03em;
  max-width: 380px;
}

.reg-slide-desc {
  color: rgba(255,255,255,0.75);
  font-size: 15px;
  line-height: 1.65;
  margin: 0;
  max-width: 340px;
}

.reg-stats-row {
  display: flex;
  gap: 28px;
  margin-top: 32px;
}

.reg-stat-value {
  color: #fff;
  font-size: 26px;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.02em;
}

.reg-stat-label {
  color: rgba(255,255,255,0.6);
  font-size: 11px;
  margin: 2px 0 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.reg-social-proof {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.reg-avatar-stack {
  display: flex;
  align-items: center;
}

.reg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,0.5);
  object-fit: cover;
}

/* Every avatar after the first overlaps left */
.reg-avatar-stack .reg-avatar + .reg-avatar {
  margin-left: -12px;
}

.reg-avatar-extra {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0f766e;
  border: 2.5px solid rgba(255,255,255,0.5);
  margin-left: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.reg-proof-title {
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  margin: 0;
}

.reg-proof-sub {
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  margin: 2px 0 0;
}

.reg-indicators {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.reg-indicator-dot {
  height: 6px;
  width: 6px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  padding: 0;
  background: rgba(255,255,255,0.35);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}

/* Active slide indicator */
.reg-indicator-dot.is-active {
  width: 24px;
  background: #6EE7B7;
}

.reg-right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #ffffff;
}

.reg-topbar {
  padding: 28px 40px 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.reg-back-link {
  font-size: 13px;
  color: #64748b;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

/* Main form centering wrapper */
.reg-form-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 40px;
}

.reg-form-inner {
  width: 100%;
  max-width: 560px;
}

.reg-form-header {
  margin-bottom: 32px;
}

.reg-form-title {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 8px;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.reg-form-subtitle {
  font-size: 15px;
  color: #475569;
  margin: 0;
}

.reg-progress-wrapper {
  margin-bottom: 28px;
}

.reg-steps-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.reg-step-col {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.reg-step-col--first { align-items: flex-start; }
.reg-step-col--last  { align-items: flex-end; }
.reg-step-col--mid   { align-items: center; }

/* Step circle — base */
.reg-step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* Step circle — state modifiers */
.reg-step-circle--done,
.reg-step-circle--active {
  background: #0f766e;
}

.reg-step-circle--pending {
  background: #f1f5f9;
}

.reg-step-circle--active {
  border: 2.5px solid #5EEAD4;
  box-shadow: 0 0 0 4px rgba(15,118,110,0.15);
}

.reg-step-circle--done,
.reg-step-circle--pending {
  border: 2px solid transparent;
  box-shadow: none;
}

/* Step number — state modifiers */
.reg-step-number {
  font-size: 12px;
  font-weight: 700;
}

.reg-step-number--active  { color: #fff; }
.reg-step-number--pending { color: #94a3b8; }

/* Progress track */
.reg-progress-track {
  height: 3px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

/* Progress fill — framer animates width */
.reg-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0f766e, #14b8a6);
  border-radius: 999px;
}

.reg-progress-label {
  font-size: 12px;
  color: #64748b;
  margin: 8px 0 0;
  font-weight: 600;
}

.reg-field-wrapper {
  margin-bottom: 20px;
}

.reg-field-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 10px;
}

.reg-input-wrap {
  position: relative;
}

.reg-input {
  width: 100%;
  height: 56px;
  padding: 0 48px 0 18px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 15px;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.reg-input:focus {
  border-color: #0f766e;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(15,118,110,0.08);
}

.reg-eye-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  line-height: 1;
}

.reg-field-hint {
  font-size: 12px;
  color: #64748b;
  margin: 8px 0 0 2px;
}

.reg-pw-checks {
  display: flex;
  gap: 18px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.reg-pw-check-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reg-pw-check-label {
  font-size: 13px;
  font-weight: 600;
}

/* State modifiers */
.reg-pw-check-label--valid   { color: #0f766e; }
.reg-pw-check-label--invalid { color: #94a3b8; }

.reg-preview-card {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px 18px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.reg-preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
}

.reg-preview-row--bordered {
  border-bottom: 1px solid #e2e8f0;
}

.reg-preview-key {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.reg-preview-val-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reg-preview-val {
  font-size: 13px;
  color: #0f172a;
  font-weight: 600;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reg-preview-edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #0f766e;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.reg-cta-btn {
  width: 100%;
  height: 54px;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 8px 28px rgba(15,23,42,0.2);
  transition: all 0.3s;
}

/* State modifiers */
.reg-cta-btn--default   { background: #0f172a; cursor: pointer; }
.reg-cta-btn--weak      { background: #cbd5e1; cursor: pointer; }
.reg-cta-btn--submitted { background: #94a3b8; cursor: default; }

/* Loading spinner inside CTA */
@keyframes reg-spin {
  to { transform: rotate(360deg); }
}
.reg-cta-spinner {
  animation: reg-spin 0.8s linear infinite;
  flex-shrink: 0;
}

/* Arrow icon sits after the label text */
.reg-cta-arrow { flex-shrink: 0; }

.reg-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 22px 0;
}

.reg-divider-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.reg-divider-text {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.reg-google-btn {
  width: 100%;
  height: 54px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.reg-google-btn:hover {
  background: #eaf0fb;
  border-color: #4285f4;
  box-shadow: 0 4px 16px rgba(66,133,244,0.18);
  transform: translateY(-1px);
}

.reg-signin-text {
  text-align: center;
  font-size: 14px;
  color: #64748b;
  margin-top: 22px;
}

.reg-signin-link {
  color: #0f766e;
  font-weight: 700;
  text-decoration: none;
}

.reg-toast-wrapper {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  min-width: 360px;
  max-width: 460px;
}

.reg-toast-card {
  border-radius: 16px;
  padding: 16px 22px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.3);
}

.reg-toast-card--error {
  background: #ffffff;
  border: 1px solid #ffcdd2;
}

.reg-toast-card--success {
  background: #ffffff;
  border: 1px solid #c8e6c9;
}

.reg-toast-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Background AND SVG stroke color via currentColor */
.reg-toast-icon-wrap--error {
  background: rgba(186,26,26,0.1);
  color: #ba1a1a;
}

.reg-toast-icon-wrap--success {
  background: rgba(16,185,129,0.1);
  color: #10b981;
}

.reg-toast-body {
  flex: 1;
}

.reg-toast-msg {
  color: #0f172a;
  font-weight: 700;
  font-size: 14px;
  margin: 0;
}

.reg-toast-desc {
  color: #475569;
  font-size: 13px;
  margin: 3px 0 0;
}

.reg-toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  border-radius: 6px;
  line-height: 1;
}
`;