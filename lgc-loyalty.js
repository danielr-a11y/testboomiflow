/*!
 * London Goods Co. — Boomi Flow Custom Component
 * Version: 2.0.0 | Self-contained bundle (no build step required)
 * 
 * SETUP INSTRUCTIONS:
 * ═══════════════════════════════════════════════════════
 * 1. Host this file at a public HTTPS URL
 *    e.g. https://your-cdn.com/lgc-loyalty.js
 *    OR upload to AWS S3 with public-read policy
 *    OR use GitHub Pages / Netlify / any static host
 *
 * 2. In Boomi Flow: Admin → Custom Components → Add URL of this file
 *
 * 3. On EACH page in Flow Designer, add a component:
 *    - Type: Custom
 *    - Developer Name: lgc-loyalty-app
 *    - (For shop page) Data Source binding: MasterCatalog value
 *    - (For dashboard/success) Data Source: ResponseCustomerArray value
 *
 * 4. Screen is auto-detected from page/outcome names.
 *    Override by setting attribute "data-screen" on the component:
 *    login | dashboard | shop | payment | success
 * ═══════════════════════════════════════════════════════
 */

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['react', 'react-dom'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('react'), require('react-dom'));
  } else {
    // Browser global — works with Boomi Flow which loads React globally
    root.LGCLoyalty = factory(root.React, root.ReactDOM);
  }
}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function (React, ReactDOM) {
  'use strict';

  const { useState, useEffect, useCallback, useRef } = React;

  // ─── CSS injection ──────────────────────────────────────────────────────────
  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.lgc-root*,.lgc-root*::before,.lgc-root*::after{box-sizing:border-box;margin:0;padding:0}
.lgc-root{
  --navy:#0f2347;--navy-l:#1a3460;--gold:#c9a84c;--gold-l:#e8c96a;
  --gold-pale:#fdf6e3;--cream:#f5f0e8;--white:#ffffff;--border:#e2d9c8;
  --tx-dark:#0f2347;--tx-mid:#4a5568;--tx-light:#8a95a8;
  --green:#1a6e4a;--red:#e53e3e;--silver:#94a3b8;
  font-family:'DM Sans',system-ui,sans-serif;width:100%;
}

/* ── Screen ── */
.lgc-screen{width:100%;background:#fff;display:flex;flex-direction:column}
.lgc-bg{background:var(--cream)!important}

/* ── Brand Header ── */
.lgc-bh{background:linear-gradient(160deg,var(--navy) 0%,var(--navy-l) 100%);padding:26px 22px 20px;text-align:center}
.lgc-crown{font-size:26px;display:block;margin-bottom:5px}
.lgc-brand-name{font-family:'Playfair Display',Georgia,serif;font-size:25px;color:var(--gold-l);font-weight:700;letter-spacing:-.3px;margin-bottom:3px}
.lgc-brand-sub{font-size:10px;color:rgba(255,255,255,.45);letter-spacing:3px;text-transform:uppercase;margin-bottom:18px}

/* ── Auth Tabs ── */
.lgc-tabs{display:flex;background:rgba(255,255,255,.08);border-radius:10px;padding:4px;gap:4px}
.lgc-tab{flex:1;padding:10px;background:transparent;border:none;color:rgba(255,255,255,.5);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border-radius:7px;transition:all .2s;border-bottom:2px solid transparent}
.lgc-tab.on{background:#fff;color:var(--navy);border-bottom-color:var(--gold)}

/* ── Form ── */
.lgc-fb{padding:22px;flex:1}
.lgc-helper{font-size:13px;color:var(--tx-mid);margin-bottom:18px;line-height:1.6}
.lgc-field{margin-bottom:15px}
.lgc-lbl{display:block;font-size:11px;font-weight:600;color:var(--tx-mid);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px}
.lgc-req{color:var(--red);font-size:11px}
.lgc-inp{width:100%;padding:13px 15px;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--tx-dark);background:#fff;outline:none;transition:border-color .2s,box-shadow .2s}
.lgc-inp:focus{border-color:var(--navy);box-shadow:0 0 0 3px rgba(15,35,71,.08)}
.lgc-inp::placeholder{color:#ccc}
.lgc-hint{margin-top:16px;padding:13px 15px;background:var(--gold-pale);border-left:3px solid var(--gold);border-radius:8px;font-size:12px;color:var(--tx-mid);line-height:1.6}
.lgc-err{background:#fff5f5;border:1px solid #feb2b2;border-radius:8px;padding:9px 13px;font-size:13px;color:var(--red);margin-bottom:14px}

/* ── Buttons ── */
.lgc-btn{width:100%;padding:15px;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;margin-top:4px}
.lgc-btn:disabled{opacity:.65;cursor:default;transform:none!important}
.lgc-btn-navy{background:var(--navy);color:#fff}
.lgc-btn-navy:hover:not(:disabled){background:var(--navy-l);transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,35,71,.25)}
.lgc-btn-gold{background:linear-gradient(135deg,var(--gold),var(--gold-l));color:var(--navy);box-shadow:0 4px 14px rgba(201,168,76,.3)}
.lgc-btn-gold:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 7px 22px rgba(201,168,76,.45)}
.lgc-btn-outline{background:var(--cream);color:var(--navy);border:2px solid var(--navy)}
.lgc-btn-outline:hover:not(:disabled){background:var(--navy);color:#fff}

/* ── Dashboard Header ── */
.lgc-dh{background:linear-gradient(160deg,var(--navy),var(--navy-l));padding:20px 20px 44px}
.lgc-dh-row{display:flex;justify-content:space-between;align-items:flex-start}
.lgc-greeting{font-family:'Playfair Display',serif;font-size:20px;color:#fff;font-weight:600}
.lgc-cust-id{font-size:11px;color:rgba(255,255,255,.45);margin-top:2px;letter-spacing:1px}
.lgc-dash-sub{font-size:11px;color:rgba(255,255,255,.35);margin-top:6px;letter-spacing:1px;text-transform:uppercase}
.lgc-avatar{width:44px;height:44px;background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:var(--navy);flex-shrink:0}

/* ── Tier Card ── */
.lgc-tc{margin:0 16px;transform:translateY(-28px);background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(15,35,71,.12);overflow:hidden}
.lgc-tb{padding:17px;display:flex;justify-content:space-between;align-items:center}
.lgc-tb-s{background:linear-gradient(135deg,#64748b,#94a3b8,#cbd5e1)}
.lgc-tb-g{background:linear-gradient(135deg,var(--gold),var(--gold-l),#f5d98a)}
.lgc-tb-p{background:linear-gradient(135deg,#4a4a6a,#7c7ca0,#b0b0d0)}
.lgc-tl{display:flex;align-items:center;gap:12px}
.lgc-te{font-size:30px}
.lgc-tey{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--navy);opacity:.6;margin-bottom:2px}
.lgc-tn{font-family:'Playfair Display',serif;font-size:21px;color:var(--navy);font-weight:700;letter-spacing:1px;text-transform:uppercase}
.lgc-tr{text-align:right}
.lgc-pb{font-family:'Playfair Display',serif;font-size:24px;color:var(--navy);font-weight:700}
.lgc-pl{font-size:10px;color:var(--navy);opacity:.6;letter-spacing:1px;text-transform:uppercase}

.lgc-tp{padding:13px 17px 16px}
.lgc-pt{font-size:12px;color:var(--tx-mid);margin-bottom:9px}
.lgc-pt strong{color:var(--gold)}
.lgc-pg{height:6px;background:var(--border);border-radius:99px;overflow:hidden}
.lgc-pf{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-l));border-radius:99px;transition:width 1.2s cubic-bezier(.22,1,.36,1)}

/* ── Dash Body ── */
.lgc-db{padding:0 16px 24px;margin-top:-12px}
.lgc-sec{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--tx-light);margin-bottom:11px}
.lgc-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.lgc-stat{background:#fff;border:1.5px solid var(--border);border-radius:10px;padding:15px;text-align:center;box-shadow:0 2px 8px rgba(15,35,71,.06)}
.lgc-si{font-size:22px;margin-bottom:5px}
.lgc-sn{font-family:'Playfair Display',serif;font-size:22px;color:var(--navy);font-weight:700}
.lgc-sl{font-size:11px;color:var(--tx-light);margin-top:2px}

/* ── Offers ── */
.lgc-os{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;margin-bottom:18px}
.lgc-os::-webkit-scrollbar{display:none}
.lgc-oc{flex-shrink:0;width:152px;background:#fff;border:1.5px solid var(--border);border-left:4px solid var(--gold);border-radius:10px;padding:12px;box-shadow:0 2px 8px rgba(15,35,71,.06)}
.lgc-ob{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:3px}
.lgc-ot{font-size:12px;font-weight:600;color:var(--tx-dark);line-height:1.3;margin-bottom:5px}
.lgc-op{font-size:11px;color:var(--tx-light)}
.lgc-op strong{color:var(--navy)}
.lgc-ov{font-size:10px;color:var(--tx-light);margin-top:3px}

/* ── Products ── */
.lgc-ph{background:linear-gradient(160deg,var(--navy),var(--navy-l));padding:19px 20px 23px}
.lgc-ph-row{display:flex;align-items:center;gap:11px}
.lgc-ph2{font-family:'Playfair Display',serif;font-size:20px;color:#fff;font-weight:700}
.lgc-ps{font-size:10px;color:rgba(255,255,255,.45);letter-spacing:2px;text-transform:uppercase;margin-top:3px}
.lgc-cb{display:flex;justify-content:space-between;align-items:center;padding:11px 18px;background:var(--gold-pale);border-bottom:1px solid var(--border);flex-shrink:0}
.lgc-cbl{font-size:12px;color:var(--tx-mid);font-weight:500;text-transform:uppercase;letter-spacing:.5px}
.lgc-cbv{font-family:'Playfair Display',serif;font-size:17px;color:var(--navy);font-weight:700}
.lgc-pl-list{flex:1;overflow-y:auto;padding:6px 16px}
.lgc-pr{display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid #f0ebe0}
.lgc-pr:last-child{border-bottom:none}
.lgc-pimg{width:62px;height:62px;background:var(--cream);border:1.5px solid var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.lgc-pimg img{width:100%;height:100%;object-fit:contain}
.lgc-pem{font-size:28px}
.lgc-pi{flex:1;min-width:0}
.lgc-pbrand{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:2px}
.lgc-pname{font-size:13px;font-weight:600;color:var(--tx-dark);line-height:1.3;margin-bottom:3px}
.lgc-pprice{font-family:'Playfair Display',serif;font-size:14px;color:var(--navy);font-weight:700}
.lgc-qc{display:flex;align-items:center;gap:9px;flex-shrink:0}
.lgc-qb{width:30px;height:30px;border-radius:8px;border:1.5px solid var(--border);background:#fff;color:var(--navy);font-size:17px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.lgc-qb:hover{border-color:var(--navy);background:var(--navy);color:#fff}
.lgc-qbp{border-color:var(--navy);background:var(--navy);color:#fff}
.lgc-qbp:hover{background:var(--navy-l)}
.lgc-qn{font-size:15px;font-weight:700;color:var(--tx-dark);min-width:20px;text-align:center}
.lgc-cobar{padding:13px 16px 18px;border-top:1px solid var(--border);background:#fff;flex-shrink:0}

/* ── Payment ── */
.lgc-payhdr{background:linear-gradient(160deg,var(--navy),var(--navy-l));padding:19px 20px 25px}
.lgc-payh2{font-family:'Playfair Display',serif;font-size:22px;color:#fff;font-weight:700}
.lgc-pays{font-size:12px;color:rgba(255,255,255,.45);margin-top:4px}
.lgc-paybody{padding:18px 16px;flex:1;overflow-y:auto}
.lgc-pey{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--tx-light);margin-bottom:9px}
.lgc-os2{background:var(--gold-pale);border:1.5px solid var(--border);border-radius:10px;padding:13px;margin-bottom:7px}
.lgc-or{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px dashed var(--border)}
.lgc-or:last-child{border-bottom:none}
.lgc-ok{font-size:12px;color:var(--tx-mid)}
.lgc-ov2{font-size:12px;color:var(--tx-dark);font-weight:600}
.lgc-free{color:var(--green)!important}
.lgc-otr{padding-top:10px!important}
.lgc-otk{font-size:14px;font-weight:700;color:var(--navy)}
.lgc-otv{font-family:'Playfair Display',serif;font-size:19px;color:var(--navy);font-weight:700}

/* ── Payment methods ── */
.lgc-pm{background:#fff;border:2px solid var(--border);border-radius:10px;margin-bottom:9px;cursor:pointer;transition:all .2s;overflow:hidden}
.lgc-pm:hover{border-color:var(--navy)}
.lgc-pms{border-color:var(--navy)!important}
.lgc-pmh{display:flex;align-items:center;gap:11px;padding:13px 15px}
.lgc-rad{width:18px;height:18px;border-radius:50%;border:2px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s}
.lgc-rad-on{border-color:var(--navy);background:var(--navy);box-shadow:inset 0 0 0 3px #fff}
.lgc-pmi{font-size:22px}
.lgc-pmn{font-size:14px;font-weight:600;color:var(--tx-dark)}
.lgc-pmsub{font-size:11px;color:var(--tx-light)}
.lgc-cf{padding:0 15px 15px}
.lgc-cfr{display:flex;gap:11px}
.lgc-fl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--tx-mid);margin-bottom:5px;margin-top:10px}
.lgc-fi{width:100%;padding:10px 11px;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--tx-dark);outline:none;background:#fff;transition:border-color .2s}
.lgc-fi:focus{border-color:var(--navy)}

/* ── Reward Preview ── */
.lgc-rp{display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,var(--navy),var(--navy-l));border-radius:10px;padding:13px 15px;margin-top:15px}
.lgc-rpic{font-size:28px;flex-shrink:0}
.lgc-rpt{flex:1}
.lgc-rpl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5)}
.lgc-rpp{font-family:'Playfair Display',serif;font-size:19px;color:var(--gold-l);font-weight:700}
.lgc-rps{font-size:11px;color:rgba(255,255,255,.4);margin-top:2px}
.lgc-spin{width:15px;height:15px;border:2px solid rgba(15,35,71,.25);border-top-color:var(--navy);border-radius:50%;display:inline-block;animation:lgcspin .7s linear infinite}
@keyframes lgcspin{to{transform:rotate(360deg)}}

/* ── Success ── */
.lgc-suc{padding:26px 18px 30px;text-align:center;opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .5s ease}
.lgc-suc-vis{opacity:1!important;transform:translateY(0)!important}
.lgc-chk-w{margin-bottom:16px}
.lgc-chk{width:74px;height:74px;background:linear-gradient(135deg,var(--green),#22c55e);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;color:#fff;box-shadow:0 8px 26px rgba(26,110,74,.3);animation:lgcpop .5s cubic-bezier(.175,.885,.32,1.275) both}
@keyframes lgcpop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.lgc-st{font-family:'Playfair Display',serif;font-size:23px;color:var(--navy);font-weight:700;margin-bottom:4px}
.lgc-so{font-size:12px;color:var(--tx-light);letter-spacing:.5px;margin-bottom:22px}
.lgc-rc{background:linear-gradient(135deg,var(--navy),var(--navy-l));border-radius:15px;padding:19px 17px;text-align:left;margin-bottom:13px}
.lgc-re{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:13px;text-align:center}
.lgc-tur{display:flex;align-items:center;justify-content:space-around;margin-bottom:14px}
.lgc-tui{text-align:center}
.lgc-tul{font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.lgc-tun{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.lgc-tus{color:var(--silver)}
.lgc-tug{color:var(--gold-l)}
.lgc-cong{font-size:10px;color:var(--gold-l);margin-top:2px;font-style:italic}
.lgc-arr{font-size:22px;color:var(--gold-l);margin:0 8px}
.lgc-psum{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.07);border-radius:9px;padding:11px 15px}
.lgc-psul{font-size:12px;color:rgba(255,255,255,.55)}
.lgc-psue{font-size:11px;color:#4ade80;font-weight:600;margin-top:2px}
.lgc-psut{font-family:'Playfair Display',serif;font-size:17px;color:var(--gold-l);font-weight:700}
.lgc-jfy{background:var(--gold-pale);border:1.5px solid var(--border);border-left:4px solid var(--gold);border-radius:14px;padding:15px 17px;text-align:left;margin-bottom:18px}
.lgc-jfye{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:5px}
.lgc-jfyt{font-family:'Playfair Display',serif;font-size:15px;color:var(--navy);font-weight:700;margin-bottom:4px}
.lgc-jfyv{font-size:11px;color:var(--tx-light)}
.lgc-jfyb{display:inline-block;background:var(--gold);color:var(--navy);font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;margin-top:7px}
`;

  // ─── Inject CSS once ──────────────────────────────────────────────────────
  let cssInjected = false;
  function injectCSS() {
    if (cssInjected) return;
    const style = document.createElement('style');
    style.id = 'lgc-loyalty-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
    cssInjected = true;
  }

  // ─── Boomi SDK helpers ────────────────────────────────────────────────────
  const MW = () => window.manywho || null;

  function getObjectData(flowKey, valueId) {
    try {
      const state = MW()?.state?.getComponent(flowKey, valueId);
      if (state?.objectData) return state.objectData;
      const model = MW()?.model?.getComponent(valueId, flowKey);
      if (model?.objectData) return model.objectData;
    } catch(e) {}
    return null;
  }

  function getProp(item, name) {
    if (!item) return null;
    const p = (item.properties || []).find(x =>
      x.developerName === name || x.typeElementPropertyId === name
    );
    return p ? p.contentValue : null;
  }

  function getNestedProp(item, parentName, childName) {
    if (!item) return null;
    const parent = (item.properties || []).find(x => x.developerName === parentName);
    if (!parent?.objectData?.[0]) return null;
    return getProp(parent.objectData[0], childName);
  }

  function fireOutcome(flowKey, outcomes, name) {
    const mw = MW();
    if (!mw) return;
    const match = (outcomes || []).find(o =>
      (o.developerName || '').toUpperCase().includes(name.toUpperCase())
    ) || (outcomes || [])[0];
    if (match) {
      try { mw.engine.move(match, null, flowKey); } catch(e) {}
    }
  }

  // ══════════════════════════════════════════════════════
  // SCREEN 1 — LOGIN / SIGN UP
  // ══════════════════════════════════════════════════════
  function LoginScreen({ flowKey, outcomes }) {
    const [tab, setTab] = useState('login');
    const [custId, setCustId] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = () => {
      if (!custId.trim()) { setError('Please enter your Customer ID'); return; }
      setLoading(true); setError('');
      try {
        MW()?.state?.setComponent(flowKey, '9d671ec1-7668-4a8d-801b-b630347b4531', {
          objectData: [{ properties: [
            { developerName:'identifier_value', contentValue: custId.trim() },
            { developerName:'identifier_type',  contentValue: 'CUSTOMER_ID' },
          ]}]
        });
      } catch(e) {}
      setTimeout(() => fireOutcome(flowKey, outcomes, 'LOGIN'), 400);
    };

    const handleSignup = () => {
      if (!name.trim() || !phone.trim()) { setError('Name and phone number are required'); return; }
      setLoading(true); setError('');
      try {
        MW()?.state?.setComponent(flowKey, '9d671ec1-7668-4a8d-801b-b630347b4531', {
          objectData: [{ properties: [
            { developerName:'customer_name',    contentValue: name.trim() },
            { developerName:'identifier_value', contentValue: phone.trim() },
            { developerName:'customer_mail',    contentValue: email.trim() },
            { developerName:'identifier_type',  contentValue: 'PHONE' },
          ]}]
        });
      } catch(e) {}
      setTimeout(() => fireOutcome(flowKey, outcomes, 'SIGNUP'), 400);
    };

    return React.createElement('div', { className: 'lgc-screen' },
      // Brand Header
      React.createElement('div', { className: 'lgc-bh' },
        React.createElement('span', { className: 'lgc-crown' }, '👑'),
        React.createElement('h1', { className: 'lgc-brand-name' }, 'London Goods Co.'),
        React.createElement('p', { className: 'lgc-brand-sub' }, 'PREMIUM BRITISH IMPORTS'),
        React.createElement('div', { className: 'lgc-tabs' },
          React.createElement('button', {
            className: `lgc-tab${tab==='login'?' on':''}`,
            onClick: () => { setTab('login'); setError(''); }
          }, 'LOGIN'),
          React.createElement('button', {
            className: `lgc-tab${tab==='signup'?' on':''}`,
            onClick: () => { setTab('signup'); setError(''); }
          }, 'SIGN UP')
        )
      ),
      // Form body
      React.createElement('div', { className: 'lgc-fb' },
        error && React.createElement('div', { className: 'lgc-err' }, error),
        tab === 'login' ? React.createElement(React.Fragment, null,
          React.createElement('p', { className: 'lgc-helper' }, 'To log in, please enter your unique Customer ID.'),
          React.createElement('div', { className: 'lgc-field' },
            React.createElement('label', { className: 'lgc-lbl' }, 'Customer ID:'),
            React.createElement('input', {
              className: 'lgc-inp', type: 'text', value: custId,
              onChange: e => setCustId(e.target.value),
              onKeyDown: e => e.key==='Enter' && handleLogin(),
              placeholder: 'e.g., CUST-8932'
            })
          ),
          React.createElement('button', {
            className: 'lgc-btn lgc-btn-navy', onClick: handleLogin, disabled: loading
          }, loading ? '⏳ Logging in...' : '[ LOGIN TO ACCOUNT ]'),
          React.createElement('div', { className: 'lgc-hint' },
            '🆔 New here? Switch to ', React.createElement('strong', null, 'Sign Up'), ' to register and get your Customer ID!'
          )
        ) : React.createElement(React.Fragment, null,
          React.createElement('p', { className: 'lgc-helper' }, 'Create your loyalty account to start earning rewards.'),
          React.createElement('div', { className: 'lgc-field' },
            React.createElement('label', { className: 'lgc-lbl' }, 'Name* ', React.createElement('span', { className: 'lgc-req' }, '(Required)')),
            React.createElement('input', { className: 'lgc-inp', type: 'text', value: name, onChange: e=>setName(e.target.value), placeholder: 'James Smith' })
          ),
          React.createElement('div', { className: 'lgc-field' },
            React.createElement('label', { className: 'lgc-lbl' }, 'Phone Number* ', React.createElement('span', { className: 'lgc-req' }, '(Required)')),
            React.createElement('input', { className: 'lgc-inp', type: 'tel', value: phone, onChange: e=>setPhone(e.target.value), placeholder: '+44 7700 900000' })
          ),
          React.createElement('div', { className: 'lgc-field' },
            React.createElement('label', { className: 'lgc-lbl' }, 'Email Address'),
            React.createElement('input', { className: 'lgc-inp', type: 'email', value: email, onChange: e=>setEmail(e.target.value), placeholder: 'james@example.com' })
          ),
          React.createElement('button', {
            className: 'lgc-btn lgc-btn-gold', onClick: handleSignup, disabled: loading
          }, loading ? '⏳ Creating account...' : '[ CREATE ACCOUNT ]')
        )
      )
    );
  }

  // ══════════════════════════════════════════════════════
  // SCREEN 2 — CUSTOMER DASHBOARD
  // ══════════════════════════════════════════════════════
  function DashboardScreen({ flowKey, outcomes, objectData }) {
    const item = objectData?.[0] || null;
    const customerName = getProp(item, 'full_name') || 'James Smith';
    const customerId   = getProp(item, 'customer_id') || 'CUST-8932';
    const tier         = getProp(item, 'tier') || 'SILVER';
    const initials     = customerName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    const pts          = getNestedProp(item, 'points', 'balance_after') || getNestedProp(item, 'points', 'balance_before') || '1,250';
    const ptsToNext    = getNestedProp(item, 'tier_progress', 'points_to_next_tier') || '250';
    const nextTier     = getNestedProp(item, 'tier_progress', 'next_tier') || 'GOLD';
    const progress     = getNestedProp(item, 'tier_progress', 'progress_pct') || '83';
    const isGold = tier.toUpperCase().includes('GOLD');
    const isPlatinum = tier.toUpperCase().includes('PLAT');
    const tierClass = isPlatinum ? 'lgc-tb-p' : isGold ? 'lgc-tb-g' : 'lgc-tb-s';
    const tierEmoji = isPlatinum ? '💎' : isGold ? '🥇' : '🥈';
    const nextEmoji = nextTier.toUpperCase().includes('PLAT') ? '💎' : '🥇';

    const offers = [
      { brand:'Twinings', title:'Earl Grey Luxury Set',    pts:200, valid:'Jun 30' },
      { brand:'Walkers',  title:'Shortbread Bundle',       pts:150, valid:'Jul 15' },
      { brand:'Special',  title:'Free Delivery All Month', pts:0,   valid:'Jun 30' },
    ];

    const [progW, setProgW] = useState(0);
    useEffect(() => { setTimeout(() => setProgW(Math.min(100, Number(progress)||83)), 300); }, [progress]);

    return React.createElement('div', { className: 'lgc-screen lgc-bg' },
      // Header
      React.createElement('div', { className: 'lgc-dh' },
        React.createElement('div', { className: 'lgc-dh-row' },
          React.createElement('div', null,
            React.createElement('div', { className: 'lgc-greeting' }, customerName),
            React.createElement('div', { className: 'lgc-cust-id' }, 'ID: ' + customerId),
            React.createElement('div', { className: 'lgc-dash-sub' }, 'Customer Dashboard')
          ),
          React.createElement('div', { className: 'lgc-avatar' }, initials)
        )
      ),
      // Tier card
      React.createElement('div', { className: 'lgc-tc' },
        React.createElement('div', { className: 'lgc-tb ' + tierClass },
          React.createElement('div', { className: 'lgc-tl' },
            React.createElement('span', { className: 'lgc-te' }, tierEmoji),
            React.createElement('div', null,
              React.createElement('div', { className: 'lgc-tey' }, 'LOYALTY STATUS'),
              React.createElement('div', { className: 'lgc-tn' }, tier.toUpperCase())
            )
          ),
          React.createElement('div', { className: 'lgc-tr' },
            React.createElement('div', { className: 'lgc-pb' }, pts),
            React.createElement('div', { className: 'lgc-pl' }, 'Loyalty Points')
          )
        ),
        React.createElement('div', { className: 'lgc-tp' },
          React.createElement('div', { className: 'lgc-pt' },
            'Earn ', React.createElement('strong', null, ptsToNext + ' more points'), ' to reach ' + nextEmoji + ' ' + nextTier
          ),
          React.createElement('div', { className: 'lgc-pg' },
            React.createElement('div', { className: 'lgc-pf', style: { width: progW + '%' } })
          )
        )
      ),
      // Body
      React.createElement('div', { className: 'lgc-db' },
        React.createElement('div', { className: 'lgc-sec' }, 'YOUR ACTIVITY'),
        React.createElement('div', { className: 'lgc-stats' },
          React.createElement('div', { className: 'lgc-stat' },
            React.createElement('div', { className: 'lgc-si' }, '🛍️'),
            React.createElement('div', { className: 'lgc-sn' }, '14'),
            React.createElement('div', { className: 'lgc-sl' }, 'Total Orders')
          ),
          React.createElement('div', { className: 'lgc-stat' },
            React.createElement('div', { className: 'lgc-si' }, '💎'),
            React.createElement('div', { className: 'lgc-sn' }, '£342'),
            React.createElement('div', { className: 'lgc-sl' }, 'Total Spend')
          )
        ),
        React.createElement('div', { className: 'lgc-sec', style:{marginTop:18} }, '🎁 AVAILABLE OFFERS'),
        React.createElement('div', { className: 'lgc-os' },
          ...offers.map((o, i) =>
            React.createElement('div', { key: i, className: 'lgc-oc' },
              React.createElement('div', { className: 'lgc-ob' }, o.brand),
              React.createElement('div', { className: 'lgc-ot' }, o.title),
              React.createElement('div', { className: 'lgc-op' }, 'Need ', React.createElement('strong', null, o.pts + ' pts')),
              React.createElement('div', { className: 'lgc-ov' }, 'Valid to ' + o.valid)
            )
          )
        ),
        React.createElement('button', {
          className: 'lgc-btn lgc-btn-navy',
          onClick: () => fireOutcome(flowKey, outcomes, 'PLACE ORDER')
        }, '🛒 Shop London Favourites')
      )
    );
  }

  // ══════════════════════════════════════════════════════
  // SCREEN 3 — SHOP / LONDON FAVOURITES
  // ══════════════════════════════════════════════════════
  function ShopScreen({ flowKey, outcomes, objectData }) {
    const defaultProducts = [
      { id:'1', name:'Twinings Earl Grey Tea (50 bags)', price:8.50,  brand:'Twinings',   img:'🍵' },
      { id:'2', name:'Walkers Shortbread Fingers (150g)', price:5.25, brand:'Walkers',    img:'🍪' },
      { id:'3', name:'Paddington Bear Classic Plush',    price:24.99, brand:'Paddington', img:'🧸' },
      { id:'4', name:'Marmite Original (500g)',          price:7.99,  brand:'Marmite',    img:'🫙' },
      { id:'5', name:"Cadbury Roses Box (420g)",         price:12.49, brand:'Cadbury',    img:'🍫' },
    ];

    const [products, setProducts] = useState([]);
    const [qty, setQty] = useState({});

    useEffect(() => {
      if (objectData && objectData.length > 0) {
        const parsed = objectData.map(item => ({
          id:    item.externalId || item.internalId || String(Math.random()),
          name:  getProp(item,'ProductName') || '',
          price: parseFloat(getProp(item,'UnitPrice')) || 0,
          brand: getProp(item,'Brand') || '',
          img:   getProp(item,'ImageURL') || '📦',
          rawItem: item,
        }));
        setProducts(parsed);
        const q = {}; parsed.forEach(p => { q[p.id] = parseInt(getProp(p.rawItem,'SelectedQuantity'))||0; });
        setQty(q);
      } else {
        setProducts(defaultProducts);
        setQty({1:1, 2:2, 3:0, 4:0, 5:0});
      }
    }, [objectData]);

    const changeQty = (id, delta) => setQty(prev => ({ ...prev, [id]: Math.max(0,(prev[id]||0)+delta) }));
    const total = products.reduce((s,p) => s + p.price*(qty[p.id]||0), 0);
    const itemCount = products.filter(p=>(qty[p.id]||0)>0).length;

    const handleCheckout = () => {
      if (total === 0) { alert('Please add at least one item to your cart'); return; }
      try {
        const sel = products.filter(p=>(qty[p.id]||0)>0).map(p => ({
          ...(p.rawItem || {}),
          properties: [
            { developerName:'ProductName',           contentValue: p.name },
            { developerName:'UnitPrice',             contentValue: String(p.price) },
            { developerName:'Brand',                 contentValue: p.brand },
            { developerName:'SelectedQuantity',      contentValue: String(qty[p.id]||0) },
            { developerName:'CalculatedTotalPrice',  contentValue: (p.price*(qty[p.id]||0)).toFixed(2) },
          ]
        }));
        MW()?.state?.setComponent(flowKey, '8366f127-889e-455c-89fe-85bd780c8a20', { objectData: sel });
      } catch(e) {}
      fireOutcome(flowKey, outcomes, 'PLACE ORDER');
    };

    return React.createElement('div', { className: 'lgc-screen', style:{background:'#fff'} },
      React.createElement('div', { className: 'lgc-ph' },
        React.createElement('div', { className: 'lgc-ph-row' },
          React.createElement('span', { style:{fontSize:22} }, '🇬🇧'),
          React.createElement('div', null,
            React.createElement('h2', { className: 'lgc-ph2' }, 'London Favourites'),
            React.createElement('div', { className: 'lgc-ps' }, 'PREMIUM BRITISH IMPORTS')
          )
        )
      ),
      React.createElement('div', { className: 'lgc-cb' },
        React.createElement('span', { className: 'lgc-cbl' }, '🛒 Cart Total'),
        React.createElement('span', { className: 'lgc-cbv' }, '$' + total.toFixed(2) + ' USD')
      ),
      React.createElement('div', { className: 'lgc-pl-list' },
        ...products.map(p =>
          React.createElement('div', { key: p.id, className: 'lgc-pr' },
            React.createElement('div', { className: 'lgc-pimg' },
              p.img && p.img.startsWith('http')
                ? React.createElement('img', { src: p.img, alt: p.name })
                : React.createElement('span', { className: 'lgc-pem' }, p.img)
            ),
            React.createElement('div', { className: 'lgc-pi' },
              React.createElement('div', { className: 'lgc-pbrand' }, p.brand),
              React.createElement('div', { className: 'lgc-pname' }, p.name),
              React.createElement('div', { className: 'lgc-pprice' }, '$' + p.price.toFixed(2) + ' USD')
            ),
            React.createElement('div', { className: 'lgc-qc' },
              React.createElement('button', { className: 'lgc-qb', onClick: ()=>changeQty(p.id,-1) }, '−'),
              React.createElement('span', { className: 'lgc-qn' }, qty[p.id]||0),
              React.createElement('button', { className: 'lgc-qb lgc-qbp', onClick: ()=>changeQty(p.id,1) }, '+')
            )
          )
        )
      ),
      React.createElement('div', { className: 'lgc-cobar' },
        React.createElement('button', { className: 'lgc-btn lgc-btn-navy', onClick: handleCheckout },
          'Proceed to Payment (' + itemCount + ' item' + (itemCount!==1?'s':'') + ') →'
        )
      )
    );
  }

  // ══════════════════════════════════════════════════════
  // SCREEN 4 — PAYMENT
  // ══════════════════════════════════════════════════════
  function PaymentScreen({ flowKey, outcomes }) {
    const [pm, setPm] = useState('card');
    const [cn, setCn] = useState('');
    const [exp, setExp] = useState('');
    const [cvv, setCvv] = useState('');
    const [upi, setUpi] = useState('');
    const [loading, setLoading] = useState(false);
    const total = 23.00; // In production: read from Selected_Products_List sum
    const estPts = Math.round(total * 10);

    const confirm = () => {
      if (pm==='card' && (!cn||!exp||!cvv)) { alert('Please fill in all card details'); return; }
      if (pm==='upi' && !upi) { alert('Please enter your UPI ID'); return; }
      setLoading(true);
      try {
        MW()?.state?.setComponent(flowKey, '91ae520b-dd53-4ff0-a372-9631ea2edf56', {
          objectData: [{properties:[
            { developerName:'payment_method', contentValue: pm.toUpperCase() },
          ]}]
        });
      } catch(e) {}
      setTimeout(() => fireOutcome(flowKey, outcomes, 'CONFIRM'), 2200);
    };

    const PM = ({ id, icon, name, sub, children }) =>
      React.createElement('div', {
        className: 'lgc-pm' + (pm===id?' lgc-pms':''),
        onClick: () => setPm(id)
      },
        React.createElement('div', { className: 'lgc-pmh' },
          React.createElement('div', { className: 'lgc-rad' + (pm===id?' lgc-rad-on':'') }),
          React.createElement('span', { className: 'lgc-pmi' }, icon),
          React.createElement('div', null,
            React.createElement('div', { className: 'lgc-pmn' }, name),
            React.createElement('div', { className: 'lgc-pmsub' }, sub)
          )
        ),
        pm===id && children
      );

    return React.createElement('div', { className: 'lgc-screen lgc-bg' },
      React.createElement('div', { className: 'lgc-payhdr' },
        React.createElement('h2', { className: 'lgc-payh2' }, 'Secure Payment'),
        React.createElement('p', { className: 'lgc-pays' }, 'Confirm your order details below')
      ),
      React.createElement('div', { className: 'lgc-paybody' },
        React.createElement('div', { className: 'lgc-pey' }, 'ORDER SUMMARY'),
        React.createElement('div', { className: 'lgc-os2' },
          React.createElement('div', { className: 'lgc-or' },
            React.createElement('span', { className: 'lgc-ok' }, 'Subtotal'),
            React.createElement('span', { className: 'lgc-ov2' }, '$' + total.toFixed(2) + ' USD')
          ),
          React.createElement('div', { className: 'lgc-or' },
            React.createElement('span', { className: 'lgc-ok' }, 'Delivery'),
            React.createElement('span', { className: 'lgc-ov2 lgc-free' }, 'Free')
          ),
          React.createElement('div', { className: 'lgc-or lgc-otr' },
            React.createElement('span', { className: 'lgc-otk' }, 'Total Due'),
            React.createElement('span', { className: 'lgc-otv' }, '$' + total.toFixed(2) + ' USD')
          )
        ),
        React.createElement('div', { className: 'lgc-pey', style:{marginTop:18} }, 'SELECT PAYMENT METHOD:'),
        // Card
        React.createElement(PM, { id:'card', icon:'💳', name:'Credit/Debit Card', sub:'Visa, Mastercard, Amex' },
          React.createElement('div', { className: 'lgc-cf' },
            React.createElement('div', { className: 'lgc-fl' }, 'Card Number:'),
            React.createElement('input', { className:'lgc-fi', placeholder:'**** **** **** 1234', value:cn, onChange:e=>setCn(e.target.value), maxLength:19 }),
            React.createElement('div', { className: 'lgc-cfr' },
              React.createElement('div', { style:{flex:1} },
                React.createElement('div', { className:'lgc-fl' }, 'Expiry:'),
                React.createElement('input', { className:'lgc-fi', placeholder:'MM/YY', value:exp, onChange:e=>setExp(e.target.value), maxLength:5 })
              ),
              React.createElement('div', { style:{flex:1} },
                React.createElement('div', { className:'lgc-fl' }, 'CVV:'),
                React.createElement('input', { className:'lgc-fi', placeholder:'***', value:cvv, onChange:e=>setCvv(e.target.value), maxLength:4, type:'password' })
              )
            )
          )
        ),
        // UPI
        React.createElement(PM, { id:'upi', icon:'📱', name:'UPI', sub:'(Unified Payments Interface)' },
          React.createElement('div', { className:'lgc-cf' },
            React.createElement('div', { className:'lgc-fl' }, 'UPI ID:'),
            React.createElement('input', { className:'lgc-fi', placeholder:'yourname@upi', value:upi, onChange:e=>setUpi(e.target.value) })
          )
        ),
        // Wallet
        React.createElement(PM, { id:'wallet', icon:'👛', name:'Digital Wallet', sub:'Apple Pay, Google Pay' }),
        // Reward preview
        React.createElement('div', { className:'lgc-rp' },
          React.createElement('span', { className:'lgc-rpic' }, '⭐'),
          React.createElement('div', { className:'lgc-rpt' },
            React.createElement('div', { className:'lgc-rpl' }, "YOU'LL EARN"),
            React.createElement('div', { className:'lgc-rpp' }, '+' + estPts + ' Points'),
            React.createElement('div', { className:'lgc-rps' }, 'after this purchase')
          )
        ),
        React.createElement('button', {
          className:'lgc-btn lgc-btn-gold', onClick:confirm, disabled:loading,
          style:{marginTop:14,display:'flex',alignItems:'center',justifyContent:'center',gap:6}
        },
          loading
            ? [React.createElement('span', { key:'s', className:'lgc-spin' }), ' Processing...']
            : '🔒 CONFIRM PAYMENT'
        )
      )
    );
  }

  // ══════════════════════════════════════════════════════
  // SCREEN 5 — PAYMENT SUCCESS
  // ══════════════════════════════════════════════════════
  function SuccessScreen({ flowKey, outcomes, objectData }) {
    const [vis, setVis] = useState(false);
    useEffect(() => { const t = setTimeout(()=>setVis(true),120); return ()=>clearTimeout(t); }, []);

    const item = objectData?.[0] || null;
    const fullName  = getProp(item,'full_name') || 'James Smith';
    const newTier   = getProp(item,'tier') || 'GOLD';
    const prevTier  = getNestedProp(item,'tier_progress','current_tier') || 'SILVER';
    const balAfter  = getNestedProp(item,'points','balance_after') || '1,480';
    const earned    = getNestedProp(item,'points','earned_this_transaction') || '230';
    const offerTitle= getProp(item,'title') || 'Twinings Earl Grey Luxury Set';
    const offerValid= getProp(item,'valid_to') || '30 Jun 2026';
    const orderId   = 'LON-' + (Math.floor(Math.random()*90000)+10000);
    const isGold    = newTier.toUpperCase().includes('GOLD');
    const tierEmoji = isGold ? '🥇' : '💎';

    return React.createElement('div', { className:'lgc-screen', style:{background:'#fff'} },
      React.createElement('div', { className:'lgc-suc' + (vis?' lgc-suc-vis':'') },
        React.createElement('div', { className:'lgc-chk-w' },
          React.createElement('div', { className:'lgc-chk' }, '✓')
        ),
        React.createElement('h2', { className:'lgc-st' }, 'Payment Successful!'),
        React.createElement('p', { className:'lgc-so' }, 'Order #' + orderId + ' has been placed.'),
        // Rewards card
        React.createElement('div', { className:'lgc-rc' },
          React.createElement('div', { className:'lgc-re' }, '🎉 YOUR REWARDS UPDATED'),
          React.createElement('div', { className:'lgc-tur' },
            React.createElement('div', { className:'lgc-tui' },
              React.createElement('div', { className:'lgc-tul' }, 'Was'),
              React.createElement('div', { className:'lgc-tun lgc-tus' }, '🥈 ' + prevTier.toUpperCase())
            ),
            React.createElement('span', { className:'lgc-arr' }, '→'),
            React.createElement('div', { className:'lgc-tui' },
              React.createElement('div', { className:'lgc-tul' }, 'Now'),
              React.createElement('div', { className:'lgc-tun lgc-tug' }, tierEmoji + ' ' + newTier.toUpperCase()),
              React.createElement('div', { className:'lgc-cong' }, '(Congratulations!)')
            )
          ),
          React.createElement('div', { className:'lgc-psum' },
            React.createElement('div', null,
              React.createElement('div', { className:'lgc-psul' }, 'New Loyalty Points'),
              React.createElement('div', { className:'lgc-psue' }, '+' + earned + ' pts earned this order')
            ),
            React.createElement('div', { className:'lgc-psut' }, balAfter + ' pts')
          )
        ),
        // JFY Offer
        React.createElement('div', { className:'lgc-jfy' },
          React.createElement('div', { className:'lgc-jfye' }, '🎁 Exclusive Offer Just For You'),
          React.createElement('div', { className:'lgc-jfyt' }, offerTitle),
          React.createElement('div', { className:'lgc-jfyv' }, 'Valid until: ' + offerValid),
          React.createElement('div', { className:'lgc-jfyb' }, 'GOLD EXCLUSIVE')
        ),
        React.createElement('button', {
          className:'lgc-btn lgc-btn-outline',
          onClick: () => fireOutcome(flowKey, outcomes, 'HOME')
        }, '← Back to Dashboard')
      )
    );
  }

  // ══════════════════════════════════════════════════════
  // ROOT — screen detector
  // ══════════════════════════════════════════════════════
  function LGCApp({ flowKey, model, outcomes, objectData }) {
    const pageName = (model?.pageElement?.developerName || model?.developerName || '').toUpperCase();
    const outNames = (outcomes||[]).map(o=>(o.developerName||'').toUpperCase());
    const attr = model?.attributes?.screen || '';

    const detect = () => {
      if (attr) return attr.toLowerCase();
      if (pageName.includes('LOGIN') || pageName.includes('AUTH') || pageName.includes('SIGN'))   return 'login';
      if (pageName.includes('SUCCESS') || pageName.includes('DISPLAY') || pageName.includes('RESPONSE')) return 'success';
      if (pageName.includes('PAYMENT') || pageName.includes('PAY') || outNames.some(o=>o.includes('CONFIRM'))) return 'payment';
      if (pageName.includes('SHOP') || pageName.includes('PRODUCT') || pageName.includes('CATALOG') || outNames.some(o=>o.includes('PLACE ORDER') || o.includes('EDIT ITEM'))) return 'shop';
      if (pageName.includes('DASHBOARD') || pageName.includes('HOME') || pageName.includes('LOYALTY')) return 'dashboard';
      if (outNames.some(o=>o.includes('LOGIN') || o.includes('SIGNUP'))) return 'login';
      return 'login';
    };

    const screen = detect();
    const props = { flowKey, outcomes, objectData };

    return React.createElement('div', { className:'lgc-root' },
      screen==='login'     && React.createElement(LoginScreen,     props),
      screen==='dashboard' && React.createElement(DashboardScreen, props),
      screen==='shop'      && React.createElement(ShopScreen,      props),
      screen==='payment'   && React.createElement(PaymentScreen,   props),
      screen==='success'   && React.createElement(SuccessScreen,   props)
    );
  }

  // ══════════════════════════════════════════════════════
  // BOOMI FLOW COMPONENT REGISTRATION
  // ══════════════════════════════════════════════════════
  const COMP_NAME = 'lgc-loyalty-app';
  const roots = new Map();

  function mountApp(container, props) {
    injectCSS();
    const el = React.createElement(LGCApp, props);
    if (!roots.has(container)) {
      // React 18
      if (ReactDOM.createRoot) {
        roots.set(container, ReactDOM.createRoot(container));
      }
    }
    const root = roots.get(container);
    if (root) {
      root.render(el);
    } else {
      // React 16/17 fallback
      ReactDOM.render(el, container);
    }
  }

  function register() {
    const mw = window.manywho;
    if (!mw?.component) { setTimeout(register, 150); return; }

    mw.component.register(COMP_NAME, class extends React.Component {
      constructor(props) {
        super(props);
        this._div = null;
      }

      getData() {
        const { id, flowKey } = this.props;
        const mw2 = window.manywho;
        try {
          const model    = mw2.model.getComponent(id, flowKey) || {};
          const state    = mw2.state.getComponent(id, flowKey) || {};
          const outcomes = mw2.model.getOutcomes(id, flowKey) || [];
          const od       = state.objectData || model.objectData || null;
          return { model, outcomes, objectData: od };
        } catch(e) {
          return { model:{}, outcomes:[], objectData:null };
        }
      }

      mount() {
        if (!this._div) return;
        const { flowKey } = this.props;
        const d = this.getData();
        mountApp(this._div, { flowKey, ...d });
      }

      componentDidMount()  { this.mount(); }
      componentDidUpdate() { this.mount(); }

      componentWillUnmount() {
        if (this._div && roots.has(this._div)) {
          roots.get(this._div).unmount?.();
          roots.delete(this._div);
        }
      }

      render() {
        return React.createElement('div', {
          ref: el => { this._div = el; },
          style: { width:'100%', minHeight:'300px' }
        });
      }
    });

    console.log('[LGC Loyalty] ✅ Custom component "' + COMP_NAME + '" registered');
  }

  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', register);
    } else {
      register();
    }
  }

  return { LGCApp, COMP_NAME };
}));
