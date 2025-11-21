// ==UserScript==
// @name        Website Utilities with Styles
// @description Revolutionary 2026 design with bento grid layouts, spatial UI, and kinetic interactions
// @version     5.1
// @author      Pratik Chabria
// @match       *://*/*
// @grant       none
// ==/UserScript==

(function () {
    "use strict";

    // ============================================================================
    // SECTION 1: GLOBAL VARIABLES & STATE MANAGEMENT
    // ============================================================================
    let blocksShown = false;
    let closeAllButtonRef = null;
    let deviceDropdownVisible = false;
    let deviceDropdownRef = null;
    let overridesDropdownVisible = false;
    let overridesDropdownRef = null;
    let currentButtonState = 'original'; //

    // ============================================================================
    // SECTION 2: CONFIGURATION DATA (Device Presets & Features)
    // ============================================================================
    const devicePresets = [
        { name: "iPhone SE", width: 375, height: 667 },
        { name: "iPhone 12/13/14", width: 390, height: 844 },
        { name: "iPhone 12/13/14 Pro Max", width: 428, height: 926 },
        { name: "iPad", width: 768, height: 1024 },
        { name: "iPad Pro 11\"", width: 834, height: 1194 },
        { name: "iPad Pro 12.9\"", width: 1024, height: 1366 },
        { name: "Pixel 7", width: 412, height: 915 },
        { name: "Samsung Galaxy S22", width: 360, height: 780 },
        { name: "Samsung Galaxy Tab S8", width: 800, height: 1280 }
    ];

    const overrideFeatures = [
        { name: "BTS", param: "do_bts", info: "BTS will be turned off" },
        { name: "Call Tracking", param: "do_ct", info: "Call Tracking will be turned off" },
        { name: "Chat Code", param: "do_chat", info: "Chat Provider Code will be turned off" },
        { name: "Custom Code", param: "do_cc", info: "All Custom Code will be turned off" },
        { name: "Google Maps", param: "do_gmaps", info: "Google Maps will be turned off" },
        { name: "GTM", param: "do_gtm", info: "All GTMs will be turned off" },
        { name: "Mobile Lead Driver", param: "do_mld", info: "Mobile Lead Driver will be turned off" },
        { name: "OEM Settings", param: "do_oem", info: "OEM Settings will be turned off" },
        { name: "Page Block Content", param: "do_pbc", info: "Page Block Content will be turned off" },
        { name: "TPI", param: "do_tpi", info: "All TPIs will be turned off" },
    ];

    // ============================================================================
    // SECTION 3: STYLES & ANIMATIONS
    // ============================================================================
    function injectStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes slideInFromLeft {
                from {
                    opacity: 0;
                    transform: translateX(-100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes morphIn {
                0% {
                    opacity: 0;
                    transform: scale(0.8) rotateX(10deg);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) rotateX(0);
                }
            }

            @keyframes glow {
                0%, 100% {
                    box-shadow: 0 0 5px rgba(251, 116, 28, 0.5);
                }
                50% {
                    box-shadow: 0 0 20px rgba(251, 116, 28, 0.8), 0 0 30px rgba(251, 116, 28, 0.4);
                }
            }

            .bento-grid {
                display: grid;
                gap: 6px;
                animation: morphIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .bento-item {
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
            }

            .bento-item::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }

            .bento-item:hover::after {
                left: 100%;
            }

            .bento-item:hover {
                transform: translateY(-2px) scale(1.02);
            }

            .bento-item:active {
                transform: scale(0.98);
            }

            .spatial-dropdown {
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                animation: morphIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .kinetic-text {
                display: inline-block;
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .kinetic-text:hover {
                transform: scale(1.1) rotate(-2deg);
            }

            .overlay-highlight {
                animation: morphIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            @media (max-width: 768px) {
                .bento-grid {
                    gap: 4px;
                }
                .bento-item {
                    font-size: 10px !important;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }

        // ============================================================================
    // SECTION 4: UTILITY FUNCTIONS (URL Params, Data Fetching, Helpers)
    // ============================================================================
    function updateURLParam(param, value) {
        let url = new URL(window.location.href);
        if (value === "off") {
            url.searchParams.set(param, value);
        } else {
            url.searchParams.delete(param);
        }
        window.location.href = url.toString();
    }

    function clearAllParams() {
        let url = new URL(window.location.href);
        overrideFeatures.forEach(feature => {
            url.searchParams.delete(feature.param);
        });
        window.location.href = url.toString();
    }

    function checkFeatureState(param) {
        let url = new URL(window.location.href);
        return url.searchParams.get(param) === "off";
    }

    function fetchDealerData() {
        try {
            const dataElement = document.querySelector('#dealeron_tagging_data');
            if (dataElement) {
                const dealerData = JSON.parse(dataElement.textContent);
                return { dealerId: dealerData.dealerId, pageId: dealerData.pageId };
            }
        } catch (error) {
            console.error("Error fetching Dealer data:", error);
        }
        return { dealerId: null, pageId: null };
    }

    function getPageUrl() {
        try {
            const metaElement = document.querySelector('meta[property="og:url"]');
            return metaElement ? metaElement.content : window.location.href;
        } catch (error) {
            console.error("Error fetching page URL:", error);
        }
        return null;
    }

    function addButtonHoverEffects(button, originalColor, hoverColor) {
        button.classList.add('bento-item');
        button.addEventListener('mouseenter', function () {
            this.style.background = `linear-gradient(135deg, ${hoverColor} 0%, ${originalColor} 100%)`;
        });
        button.addEventListener('mouseleave', function () {
            this.style.background = originalColor;
        });
    }

          // NEW FUNCTION: Swap between original and custom button sets
    function swapButtonSets(bentoGrid2, bentoGrid3, dealerId, cmsUrl, showCustom) {
        // Prevent re-swapping if already in desired state
        const targetState = showCustom ? 'custom' : 'original';
        if (currentButtonState === targetState) return;
        currentButtonState = targetState;

        // Quick fade
        bentoGrid2.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
        bentoGrid3.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
        bentoGrid2.style.opacity = '0';
        bentoGrid3.style.opacity = '0';
        bentoGrid2.style.transform = 'scale(0.97)';
        bentoGrid3.style.transform = 'scale(0.97)';

        // Rebuild immediately
        bentoGrid2.innerHTML = '';
        bentoGrid3.innerHTML = '';

        if (showCustom) {
            // ---------------- CUSTOM BUTTONS (Dash, Header, TBD x4) ----------------
            bentoGrid2.style.gridTemplateColumns = 'repeat(3, 1fr)';
            bentoGrid3.style.gridTemplateColumns = 'repeat(3, 1fr)';

            const dashButton = document.createElement('button');
            dashButton.textContent = 'Dash';
            dashButton.style.cssText = `
                padding: 8px;
                font-size: 11px;
                cursor: pointer;
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-family: inherit;
            `;
            addButtonHoverEffects(dashButton, 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', '#3b82f6');
            dashButton.addEventListener('click', () => window.open(cmsUrl, '_blank'));

            const headerButton = document.createElement('button');
            headerButton.textContent = 'IntroWidget';
            headerButton.style.cssText = `
                padding: 8px;
                font-size: 11px;
                cursor: pointer;
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-family: inherit;
            `;
            addButtonHoverEffects(headerButton, 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', '#3b82f6');
            headerButton.addEventListener('click', () => {
                window.open(`https://cms.dealeron.com/dash/dist/cms/#/${dealerId}/headerWidget`, '_blank');
            });

            const buttons = [dashButton, headerButton];
            for (let i = 0; i < 4; i++) {
                const tbd = document.createElement('button');
                tbd.textContent = 'TBD';
                tbd.style.cssText = `
                    padding: 8px;
                    font-size: 11px;
                    cursor: not-allowed;
                    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
                    color: rgba(255, 255, 255, 0.6);
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-family: inherit;
                    opacity: 0.7;
                `;
                buttons.push(tbd);
            }

            // First 3 in row 2
            bentoGrid2.appendChild(buttons[0]);
            bentoGrid2.appendChild(buttons[1]);
            bentoGrid2.appendChild(buttons[2]);
            // Last 3 in row 3
            bentoGrid3.appendChild(buttons[3]);
            bentoGrid3.appendChild(buttons[4]);
            bentoGrid3.appendChild(buttons[5]);
        } else {
            // ---------------- ORIGINAL BUTTONS (CMS, Refresh, Blocks / Mobile, Styles, Overrides) ----------------
            bentoGrid2.style.gridTemplateColumns = 'repeat(3, 1fr)';
            bentoGrid3.style.gridTemplateColumns = 'repeat(3, 1fr)';

            // CMS (hover-only, no click link)
            const cmsButton = document.createElement('button');
            cmsButton.id = 'cmsButton';
            cmsButton.textContent = 'CMS';
            cmsButton.style.cssText = `
                padding: 8px;
                font-size: 11px;
                cursor: pointer;
                background: #19325d;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-family: inherit;
                position: relative;
            `;
            const hoverIndicator = document.createElement('span');
            hoverIndicator.innerHTML = ' ▼';
            hoverIndicator.style.cssText = `
                font-size: 8px;
                opacity: 0.6;
                margin-left: 2px;
            `;
            cmsButton.appendChild(hoverIndicator);
            addButtonHoverEffects(cmsButton, '#19325d', '#2a4a8d');
            // Note: no click handler

            const refreshButton = document.createElement('button');
            refreshButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`;
            refreshButton.style.cssText = `
                padding: 8px;
                font-size: 11px;
                cursor: pointer;
                background: #19325d;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: inherit;
            `;
            addButtonHoverEffects(refreshButton, '#19325d', '#2a4a8d');
            refreshButton.addEventListener('click', () => {
                refreshButton.style.transform = 'rotate(360deg)';
                const varchar = location.href.indexOf('?') > 0 ? '&' : '?';
                const randomStr = Math.random().toString(36).substring(2, 7);
                location.href = location.href + varchar + 'pc=' + randomStr;
            });

            const showBlocksButton = document.createElement('button');
            showBlocksButton.textContent = 'Blocks';
            showBlocksButton.style.cssText = `
                padding: 8px;
                font-size: 11px;
                cursor: pointer;
                background: #19325d;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-family: inherit;
            `;
            addButtonHoverEffects(showBlocksButton, '#19325d', '#2a4a8d');
            showBlocksButton.addEventListener('click', () => {
                if (blocksShown) {
                    removeBlockOverlays();
                    showBlocksButton.textContent = 'Blocks';
                    return;
                }
                showBlocksButton.textContent = 'Hide';
                blocksShown = true;

                closeAllButtonRef = document.createElement('div');
                closeAllButtonRef.textContent = '✕ Close All';
                closeAllButtonRef.style.cssText = `
                    position: fixed;
                    top: 15px;
                    right: 15px;
                    padding: 12px 18px;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(10px);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    z-index: 10000;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 12px;
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    letter-spacing: 0.3px;
                `;
                closeAllButtonRef.addEventListener('mouseenter', function () {
                    this.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
                    this.style.transform = 'scale(1.08) rotate(-2deg)';
                });
                closeAllButtonRef.addEventListener('mouseleave', function () {
                    this.style.background = 'rgba(0, 0, 0, 0.9)';
                    this.style.transform = 'scale(1) rotate(0)';
                });
                closeAllButtonRef.addEventListener('click', () => {
                    removeBlockOverlays();
                    showBlocksButton.textContent = 'Blocks';
                });
                document.body.appendChild(closeAllButtonRef);

                const homepageBlocks = document.querySelectorAll("[id^='block'], [class^='contentSection']");
                homepageBlocks.forEach(el => highlightBlock(el, el.id || el.className));

                const vdpSelectors = [
                    { selector: '#cBlock1', label: 'Block 1' },
                    { selector: '#cBlock-2', label: 'Block 2' },
                    { selector: '#vehicle-details > section > div.vehicle-details__title-pricing.vehicle-details__card.vehicle-details__card-- > div.vehicle-details__pricing.vehicle-details__pricing-- > div > div:nth-child(3)', label: 'Block 3' },
                    { selector: '#cBlock-4', label: 'Block 4' },
                    { selector: '#cBlock5', label: 'Block 5' }
                ];
                vdpSelectors.forEach(item => {
                    const el = document.querySelector(item.selector);
                    if (el) highlightBlock(el, item.label);
                });

                function highlightBlock(element, labelText) {
                    element.style.position = 'relative';
                    const overlay = document.createElement('div');
                    overlay.className = 'overlay-highlight';
                    overlay.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        border: 3px solid #ff3b30;
                        background: linear-gradient(135deg, rgba(255, 59, 48, 0.12), rgba(255, 149, 0, 0.12));
                        z-index: 9999;
                        pointer-events: none;
                        box-shadow: 0 0 30px rgba(255, 59, 48, 0.3);
                    `;
                    const label = document.createElement('div');
                    label.textContent = labelText;
                    label.style.cssText = `
                        position: absolute;
                        top: -30px;
                        left: 0;
                        background: linear-gradient(135deg, #ff3b30 0%, #ff6b58 100%);
                        color: white;
                        padding: 8px 14px;
                        z-index: 10000;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 11px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                    `;
                    overlay.appendChild(label);
                    element.appendChild(overlay);
                }
            });

            bentoGrid2.appendChild(cmsButton);
            bentoGrid2.appendChild(refreshButton);
            bentoGrid2.appendChild(showBlocksButton);

            // Mobile, Styles, Overrides – same as original createPopup
            const mobileButton = document.createElement('button');
            mobileButton.id = 'mobileButton';
            mobileButton.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 3px;"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>Mobile`;
            mobileButton.style.cssText = `
                padding: 8px;
                font-size: 11px;
                cursor: pointer;
                background: #19325d;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: inherit;
            `;
            addButtonHoverEffects(mobileButton, '#19325d', '#2a4a8d');
            attachMobileListener(mobileButton);

            const stylesButton = document.createElement('button');
            stylesButton.textContent = 'Styles';
            stylesButton.style.cssText = `
                padding: 8px;
                font-size: 11px;
                cursor: pointer;
                background: #19325d;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-family: inherit;
            `;
            addButtonHoverEffects(stylesButton, '#19325d', '#2a4a8d');
            stylesButton.addEventListener('click', function () {
                // your existing styles modal code unchanged
                (function () {
                    $('body').append($('<div>').html('<div class="modal fade" id="buttontester" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"><div class="modal-dialog modal-lg" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h3 class="modal-title" style="color:#000!important" id="myModalLabel">Dealer Buttons & Backgrounds</h3></div><div class="modal-body"><p class="h4" style="color:#000!important">DealerOn Buttons:</p><p><button type="button" class="btn btn-cta copyText" data-copyfrom="#test-btn0" id="test-btn0">btn-cta</button> <button type="button" class="btn btn-main copyText" data-copyfrom="#test-btn1" id="test-btn1">btn-main</button> <button type="button" class="btn btn-alt1 copyText" data-copyfrom="#test-btn2" id="test-btn2">btn-alt1</button> <button type="button" class="btn btn-alt2 copyText" data-copyfrom="#test-btn3" id="test-btn3">btn-alt2</button> <button type="button" class="btn btn-alt3 copyText" data-copyfrom="#test-btn4" id="test-btn4">btn-alt3</button> <button type="button" class="btn btn-pricing copyText" data-copyfrom="#test-btn5" id="test-btn5">btn-pricing</button> <button type="button" class="btn btn-secondary copyText" data-copyfrom="#test-btn6" id="test-btn6">btn-secondary</button></p><p class="h4 margin-top-2x" style="color:#000!important">Bootstrap 3 Buttons:</p><p><button type="button" class="btn btn-default copyText" data-copyfrom="#test-btn8" id="test-btn8">btn-default</button> <button type="button" class="btn btn-primary copyText" data-copyfrom="#test-btn9" id="test-btn9">btn-primary</button> <button type="button" class="btn btn-success copyText" data-copyfrom="#test-btn10" id="test-btn10">btn-success</button> <button type="button" class="btn btn-info copyText" data-copyfrom="#test-btn11" id="test-btn11">btn-info</button> <button type="button" class="btn btn-warning copyText" data-copyfrom="#test-btn12" id="test-btn12">btn-warning</button> <button type="button" class="btn btn-danger copyText" data-copyfrom="#test-btn13" id="test-btn13">btn-danger</button> <button type="button" class="btn btn-link copyText" data-copyfrom="#test-btn14" id="test-btn14">btn-link</button></p><p class="h4 margin-top-2x" style="color:#000!important">DealerOn Text Colors:</p><p><button type="button" class="btn btn-link text-cta copyText" data-copyfrom="#test-btn19" id="test-btn19">text-cta</button> <button type="button" class="btn btn-link text-main copyText" data-copyfrom="#test-btn20" id="test-btn20">text-main</button> <button type="button" class="btn btn-link text-default copyText" data-copyfrom="#test-btn21" id="test-btn21">text-default</button> <button type="button" class="btn btn-link text-muted copyText" data-copyfrom="#test-btn22" id="test-btn22">text-muted</button></p><p class="h4 margin-top-2x" style="color:#000!important">Backgrounds</p><div class="row"><div class="col-md-12 pad-1x bg-cta margin-bottom-1x text-white"><button type="button" class="btn bg-cta copyText" data-copyfrom="#test-btn15" id="test-btn15">bg-cta</button></div><div class="col-md-12 pad-1x bg-main margin-bottom-1x text-white"><button type="button" class="btn bg-main copyText" data-copyfrom="#test-btn16" id="test-btn16">bg-main</button></div><div class="col-md-12 pad-1x bg-alt1 margin-bottom-1x"><button type="button" class="btn bg-alt1 copyText" data-copyfrom="#test-btn17" id="test-btn17">bg-alt1</button></div><div class="col-md-12 pad-1x bg-alt2 margin-bottom-1x"><button type="button" class="btn bg-alt2 copyText" data-copyfrom="#test-btn18" id="test-btn18">bg-alt2</button></div></div></div></div></div></div>'));
                    $('#buttontester').modal().show();
                    function fallbackCopyTextToClipboard(text) {
                        var textArea = document.createElement('textarea');
                        textArea.value = text;
                        textArea.style.top = '0';
                        textArea.style.left = '0';
                        textArea.style.position = 'fixed';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                            document.execCommand('copy');
                        } catch (err) {}
                        document.body.removeChild(textArea);
                    }
                    function copyTextToClipboard(text) {
                        if (!navigator.clipboard) {
                            fallbackCopyTextToClipboard(text);
                            return;
                        }
                        navigator.clipboard.writeText(text);
                    }
                    function copyText(e) {
                        copyTextToClipboard($($(e.target).data('copyfrom')).text());
                    }
                    $(document).on('click', 'button.copyText', copyText);
                })();
            });

            const overridesButton = document.createElement('button');
            overridesButton.id = 'overridesButton';
            overridesButton.textContent = 'Overrides';
            overridesButton.style.cssText = `
                padding: 8px;
                font-size: 11px;
                cursor: pointer;
                background: #19325d;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-family: inherit;
            `;
            addButtonHoverEffects(overridesButton, '#19325d', '#2a4a8d');
            attachOverridesListener(overridesButton);

            bentoGrid3.appendChild(mobileButton);
            bentoGrid3.appendChild(stylesButton);
            bentoGrid3.appendChild(overridesButton);
        }

        // Fade back in
        setTimeout(() => {
            bentoGrid2.style.opacity = '1';
            bentoGrid3.style.opacity = '1';
            bentoGrid2.style.transform = 'scale(1)';
            bentoGrid3.style.transform = 'scale(1)';
        }, 10);
    }

    // ============================================================================
    // SECTION 5: BLOCKS HIGHLIGHTER FUNCTIONS
    // ============================================================================
    function removeBlockOverlays() {
        const overlays = document.querySelectorAll(".overlay-highlight");
        overlays.forEach(overlay => overlay.parentNode.removeChild(overlay));
        if (closeAllButtonRef && closeAllButtonRef.parentNode) {
            closeAllButtonRef.parentNode.removeChild(closeAllButtonRef);
            closeAllButtonRef = null;
        }
        blocksShown = false;
    }

    // ============================================================================
    // SECTION 6: DEVICE DROPDOWN FUNCTIONS
    // ============================================================================
    function hideDeviceDropdown() {
        if (deviceDropdownRef && deviceDropdownRef.parentNode) {
            deviceDropdownRef.style.animation = 'morphIn 0.2s reverse';
            setTimeout(() => {
                if (deviceDropdownRef && deviceDropdownRef.parentNode) {
                    deviceDropdownRef.parentNode.removeChild(deviceDropdownRef);
                }
                deviceDropdownRef = null;
                deviceDropdownVisible = false;
            }, 200);
        }
    }

    function openMobileView(deviceWidth, deviceHeight, deviceName) {
        const mobileWindow = window.open(
            window.location.href,
            'mobileView',
            `width=${deviceWidth},height=${deviceHeight + 80},resizable=yes,scrollbars=yes,status=yes`
        );

        if (mobileWindow) {
            mobileWindow.addEventListener('load', function () {
                try {
                    let viewport = mobileWindow.document.createElement('meta');
                    viewport.name = 'viewport';
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                    mobileWindow.document.head.appendChild(viewport);

                    let mobileStyle = mobileWindow.document.createElement('style');
                    mobileStyle.textContent = `
                        body {
                            width: ${deviceWidth}px !important;
                            overflow-x: hidden;
                        }
                    `;
                    mobileWindow.document.head.appendChild(mobileStyle);

                    let mobileIndicator = mobileWindow.document.createElement('div');
                    mobileIndicator.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        background: linear-gradient(135deg, #fb741c 0%, #ff8c42 100%);
                        color: white;
                        padding: 6px 12px;
                        font-size: 11px;
                        z-index: 9999999;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        font-weight: 700;
                        border-radius: 0 0 10px 0;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        letter-spacing: 0.3px;
                    `;
                    mobileIndicator.textContent = `${deviceName} ${deviceWidth}×${deviceHeight}`;
                    mobileWindow.document.body.appendChild(mobileIndicator);
                } catch (e) {
                    console.error("Error setting up mobile view:", e);
                }
            });
        }
    }

    function attachMobileListener(mobileButton) {
        if (!mobileButton) return;
        mobileButton.removeEventListener('click', mobileButtonClickHandler);
        mobileButton.addEventListener('click', mobileButtonClickHandler);
    }

    function mobileButtonClickHandler(e) {
        e.stopPropagation();
        const mobileButton = e.currentTarget;
        if (deviceDropdownVisible) {
            hideDeviceDropdown();
        } else {
            const buttonRect = mobileButton.getBoundingClientRect();
            const dropdown = document.createElement('div');
            dropdown.className = 'spatial-dropdown';

            const dropdownWidth = 200;
            const viewportWidth = window.innerWidth;

            let leftPos = buttonRect.left;

            if (leftPos + dropdownWidth > viewportWidth - 10) {
                leftPos = viewportWidth - dropdownWidth - 10;
            }

            if (leftPos < 10) {
                leftPos = 10;
            }

            dropdown.style.cssText = `
                position: fixed;
                top: ${buttonRect.bottom + 8}px;
                left: ${leftPos}px;
                transform: none;
                background: linear-gradient(145deg, rgba(25, 50, 93, 0.98) 0%, rgba(26, 56, 100, 0.98) 100%);
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.1) inset;
                border-radius: 12px;
                z-index: 10001;
                width: ${dropdownWidth}px;
                max-height: 360px;
                overflow-y: auto;
                padding: 10px 0;
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
            `;

            const header = document.createElement('div');
            header.innerHTML = '<span class="kinetic-text">📱 Select Device</span>';
            header.style.cssText = `
                font-weight: 700;
                padding: 8px 14px 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 8px;
                color: white;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1.2px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            `;
            dropdown.appendChild(header);

            devicePresets.forEach(device => {
                const option = document.createElement('div');
                option.innerHTML = `
                    <span style="font-weight: 600;">${device.name}</span>
                    <span style="opacity: 0.7; font-size: 10px;">${device.width}×${device.height}</span>
                `;
                option.style.cssText = `
                    padding: 10px 14px;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 11px;
                    border-radius: 8px;
                    margin: 3px 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: transparent;
                `;
                option.addEventListener('mouseenter', function () {
                    this.style.background = 'linear-gradient(90deg, rgba(251, 116, 28, 0.2) 0%, transparent 100%)';
                    this.style.transform = 'translateX(6px) scale(1.02)';
                    this.style.borderLeft = '3px solid #fb741c';
                    this.style.paddingLeft = '11px';
                });
                option.addEventListener('mouseleave', function () {
                    this.style.background = 'transparent';
                    this.style.transform = 'translateX(0) scale(1)';
                    this.style.borderLeft = 'none';
                    this.style.paddingLeft = '14px';
                });
                option.addEventListener('click', function (e) {
                    e.stopPropagation();
                    openMobileView(device.width, device.height, device.name);
                    hideDeviceDropdown();
                });
                dropdown.appendChild(option);
            });

            document.body.appendChild(dropdown);
            deviceDropdownRef = dropdown;
            deviceDropdownVisible = true;

            setTimeout(() => {
                document.addEventListener('click', function closeDropdown(e) {
                    if (deviceDropdownVisible && !dropdown.contains(e.target) && e.target !== mobileButton) {
                        hideDeviceDropdown();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }, 100);
        }
    }

    // ============================================================================
    // SECTION 7: OVERRIDES DROPDOWN FUNCTIONS
    // ============================================================================
    function hideOverridesDropdown() {
        if (overridesDropdownRef && overridesDropdownRef.parentNode) {
            overridesDropdownRef.style.animation = 'morphIn 0.2s reverse';
            setTimeout(() => {
                if (overridesDropdownRef && overridesDropdownRef.parentNode) {
                    overridesDropdownRef.parentNode.removeChild(overridesDropdownRef);
                }
                overridesDropdownRef = null;
                overridesDropdownVisible = false;
            }, 200);
        }
    }

    function attachOverridesListener(overridesButton) {
        if (!overridesButton) return;
        overridesButton.removeEventListener('click', overridesButtonClickHandler);
        overridesButton.addEventListener('click', overridesButtonClickHandler);
    }

    function overridesButtonClickHandler(e) {
        e.stopPropagation();
        const overridesButton = e.currentTarget;
        if (overridesDropdownVisible) {
            hideOverridesDropdown();
        } else {
            const buttonRect = overridesButton.getBoundingClientRect();
            const dropdown = document.createElement('div');
            dropdown.className = 'spatial-dropdown';

            const dropdownWidth = 280;
            const viewportWidth = window.innerWidth;

            let leftPos = buttonRect.left;

            if (leftPos + dropdownWidth > viewportWidth - 10) {
                leftPos = viewportWidth - dropdownWidth - 10;
            }

            if (leftPos < 10) {
                leftPos = 10;
            }

            dropdown.style.cssText = `
                position: fixed;
                top: ${buttonRect.bottom + 8}px;
                left: ${leftPos}px;
                transform: none;
                background: linear-gradient(145deg, rgba(25, 50, 93, 0.98) 0%, rgba(26, 56, 100, 0.98) 100%);
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.1) inset;
                border-radius: 12px;
                z-index: 10001;
                width: ${dropdownWidth}px;
                max-height: 420px;
                overflow-y: auto;
                padding: 10px 0;
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
            `;

            const clearAllOption = document.createElement('div');
            clearAllOption.innerHTML = '<span class="kinetic-text">🔄 Clear All Overrides</span>';
            clearAllOption.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                color: white;
                font-size: 11px;
                text-align: center;
                border-radius: 8px;
                margin: 6px 10px 10px;
                font-weight: 700;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                letter-spacing: 0.3px;
                text-transform: uppercase;
                font-size: 10px;
            `;
            clearAllOption.addEventListener('mouseenter', function () {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
            });
            clearAllOption.addEventListener('mouseleave', function () {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });
            clearAllOption.addEventListener('click', function (e) {
                e.stopPropagation();
                clearAllParams();
            });
            dropdown.appendChild(clearAllOption);

            const separator1 = document.createElement('div');
            separator1.style.cssText = `
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 8px 16px 12px;
            `;
            dropdown.appendChild(separator1);

            const header = document.createElement('div');
            header.innerHTML = '<span class="kinetic-text">⚙️ Feature Overrides</span>';
            header.style.cssText = `
                font-weight: 700;
                padding: 0px 16px 10px;
                color: rgba(255, 255, 255, 0.95);
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1.2px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            `;
            dropdown.appendChild(header);

            overrideFeatures.forEach(feature => {
                const isActive = checkFeatureState(feature.param);
                const option = document.createElement('div');
                option.style.cssText = `
                    padding: 11px 16px;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 11px;
                    display: grid;
                    grid-template-columns: 1fr auto auto;
                    gap: 10px;
                    align-items: center;
                    border-radius: 8px;
                    margin: 3px 10px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: ${isActive ? 'linear-gradient(90deg, rgba(251, 116, 28, 0.15) 0%, transparent 100%)' : 'transparent'};
                    border-left: ${isActive ? '3px solid #fb741c' : '3px solid transparent'};
                `;

                const nameSpan = document.createElement('span');
                nameSpan.textContent = `Turn OFF ${feature.name}`;
                nameSpan.style.cssText = 'font-weight: 500;';
                option.appendChild(nameSpan);

                const infoIcon = document.createElement('span');
                infoIcon.innerHTML = '?';
                infoIcon.title = feature.info;
                infoIcon.style.cssText = `
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: rgba(52, 152, 219, 0.3);
                    border: 1px solid rgba(52, 152, 219, 0.6);
                    color: #3498db;
                    font-size: 10px;
                    font-weight: 700;
                    cursor: help;
                    transition: all 0.2s;
                `;
                infoIcon.addEventListener('mouseenter', function() {
                    this.style.background = 'rgba(52, 152, 219, 0.5)';
                    this.style.transform = 'scale(1.2)';
                });
                infoIcon.addEventListener('mouseleave', function() {
                    this.style.background = 'rgba(52, 152, 219, 0.3)';
                    this.style.transform = 'scale(1)';
                });
                option.appendChild(infoIcon);

                const statusBadge = document.createElement('span');
                statusBadge.textContent = isActive ? 'OFF' : 'ON';
                statusBadge.style.cssText = `
                    font-size: 9px;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    background: ${isActive ? 'linear-gradient(135deg, #fb741c 0%, #ff8c42 100%)' : 'rgba(46, 204, 113, 0.2)'};
                    color: white;
                    border: 1px solid ${isActive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(46, 204, 113, 0.3)'};
                    transition: all 0.2s;
                `;
                option.appendChild(statusBadge);

                option.addEventListener('mouseenter', function () {
                    this.style.transform = 'translateX(4px) scale(1.02)';
                    if (!isActive) {
                        this.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                });
                option.addEventListener('mouseleave', function () {
                    this.style.transform = 'translateX(0) scale(1)';
                    if (!isActive) {
                        this.style.background = 'transparent';
                    }
                });
                option.addEventListener('click', function (e) {
                    e.stopPropagation();
                    updateURLParam(feature.param, isActive ? null : 'off');
                });
                dropdown.appendChild(option);
            });

            document.body.appendChild(dropdown);
            overridesDropdownRef = dropdown;
            overridesDropdownVisible = true;

            setTimeout(() => {
                document.addEventListener('click', function closeDropdown(e) {
                    if (overridesDropdownVisible && !dropdown.contains(e.target) && e.target !== overridesButton) {
                        hideOverridesDropdown();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }, 100);
        }
    }

       // ============================================================================
    // SECTION 8: MAIN POPUP CREATION (UI ASSEMBLY)
    // ============================================================================
    function createPopup(dealerData) {
        if (document.getElementById('dealerPopup')) return;

        const dealerId = dealerData.dealerId;
        const pageId = dealerData.pageId;
        if (!dealerId) {
            console.error("Dealer ID not found.");
            return;
        }

        const pageUrl = getPageUrl();
        let cmsUrl;
        if (pageUrl && pageUrl.includes("staff")) {
            cmsUrl = `https://staff.dealeron.com/#/${dealerId}/staff-directory-legacy`;
        } else {
            cmsUrl = `https://cms.dealeron.com/dash/dist/cms/#/${dealerId}/dashboard`;
        }

        let pageContentUrl = null;
        if (pageId) {
            pageContentUrl = `https://cms.dealeron.com/dash/dist/page/#/${dealerId}/page/${pageId}`;
        }

        const popup = document.createElement('div');
        popup.id = "dealerPopup";
        popup.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
            backdrop-filter: blur(30px) saturate(180%);
            -webkit-backdrop-filter: blur(30px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.4);
            padding: 12px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(255,255,255,0.5) inset;
            border-radius: 16px;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            width: 260px;
            font-size: 12px;
            animation: slideInFromLeft 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

        // Close Button
        const closeButton = document.createElement('span');
        closeButton.innerHTML = "✕";
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 14px;
            cursor: pointer;
            color: #666;
            font-weight: 700;
            line-height: 1;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            background: transparent;
        `;
        closeButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0, 0, 0, 0.08)';
            this.style.transform = 'rotate(90deg) scale(1.1)';
            this.style.color = '#333';
        });
        closeButton.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            this.style.transform = 'rotate(0) scale(1)';
            this.style.color = '#666';
        });
        closeButton.addEventListener('click', () => {
            popup.style.animation = 'slideInFromLeft 0.3s reverse';
            setTimeout(() => popup.style.display = 'none', 300);
        });
        popup.appendChild(closeButton);

        // Toggle Arrow
        const toggleArrow = document.createElement('div');
        toggleArrow.style.cssText = `
            position: absolute;
            top: 50%;
            left: -20px;
            transform: translateY(-50%);
            width: 20px;
            height: 50px;
            background: linear-gradient(135deg, #19325d 0%, #1a3864 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: 700;
            font-size: 12px;
            border-radius: 6px 0 0 6px;
            box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;
        toggleArrow.innerHTML = "◀";

        let isHidden = false;
        toggleArrow.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #2a4a8d 0%, #3b5a9d 100%)';
            this.style.transform = 'translateY(-50%) translateX(-3px)';
        });
        toggleArrow.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, #19325d 0%, #1a3864 100%)';
            this.style.transform = 'translateY(-50%) translateX(0)';
        });
        toggleArrow.addEventListener('click', () => {
            isHidden = !isHidden;
            if (isHidden) {
                popup.style.transform = 'translateX(270px)';
                toggleArrow.innerHTML = "▶";
                toggleArrow.style.left = '-20px';
            } else {
                popup.style.transform = 'translateX(0)';
                toggleArrow.innerHTML = "◀";
            }
        });
        popup.appendChild(toggleArrow);

        // BENTO GRID ROW 1: Dealer ID + Copy + CC
        const bentoGrid1 = document.createElement('div');
        bentoGrid1.className = 'bento-grid';
        bentoGrid1.style.cssText = `
            grid-template-columns: 2fr 1fr 1fr;
            margin-bottom: 6px;
        `;

        const dealerIdLabel = document.createElement('span');
        dealerIdLabel.textContent = `ID: ${dealerId}`;
        dealerIdLabel.style.cssText = `
            font-size: 12px;
            font-weight: 700;
            color: #1a202c;
            display: flex;
            align-items: center;
            padding: 5px 8px;
            background: rgba(25, 50, 93, 0.05);
            border-radius: 6px;
            letter-spacing: 0.3px;
        `;

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.style.cssText = `
            padding: 5px 8px;
            font-size: 11px;
            cursor: pointer;
            background: #19325d;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            font-family: inherit;
        `;
        addButtonHoverEffects(copyButton, '#19325d', '#2a4a8d');
        copyButton.addEventListener('click', function () {
            navigator.clipboard.writeText(dealerId).then(() => {
                const original = this.textContent;
                this.textContent = '✓';
                this.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
                setTimeout(() => {
                    this.textContent = original;
                    this.style.background = '#19325d';
                }, 1500);
            });
        });

        const ccButton = document.createElement('button');
        ccButton.textContent = 'CC';
        ccButton.style.cssText = `
            padding: 5px 8px;
            font-size: 11px;
            cursor: pointer;
            background: #19325d;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            font-family: inherit;
        `;
        addButtonHoverEffects(ccButton, '#19325d', '#2a4a8d');
        ccButton.addEventListener('click', function () {
            window.open(`https://cms.dealeron.com/dash/dist/cms/#/${dealerId}/CustomCode`, "_blank");
        });

        bentoGrid1.appendChild(dealerIdLabel);
        bentoGrid1.appendChild(copyButton);
        bentoGrid1.appendChild(ccButton);
        popup.appendChild(bentoGrid1);

        // Page Content Button (conditional)
        if (pageContentUrl) {
            const pageButton = document.createElement('button');
            pageButton.innerHTML = 'Open Page Content →';
            pageButton.style.cssText = `
                width: 100%;
                padding: 8px;
                font-size: 11px;
                cursor: pointer;
                background: linear-gradient(135deg, #fb741c 0%, #ff8c42 100%);
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 700;
                margin-bottom: 6px;
                font-family: inherit;
                letter-spacing: 0.3px;
            `;
            addButtonHoverEffects(pageButton, '#fb741c', '#ff8c42');
            pageButton.addEventListener('click', () => {
                window.open(pageContentUrl, "_blank");
            });
            popup.appendChild(pageButton);
        }

        // BENTO GRID ROW 2: CMS, Refresh, Blocks (created directly - no swap delay)
        const bentoGrid2 = document.createElement('div');
        bentoGrid2.className = 'bento-grid';
        bentoGrid2.style.cssText = `
            grid-template-columns: repeat(3, 1fr);
            margin-bottom: 6px;
        `;

               const cmsButton = document.createElement('button');
        cmsButton.id = 'cmsButton';
        cmsButton.textContent = 'CMS';
        cmsButton.style.cssText = `
            padding: 8px;
            font-size: 11px;
            cursor: pointer;
            background: #19325d;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-family: inherit;
            position: relative;
        `;

        const hoverIndicator = document.createElement('span');
        hoverIndicator.innerHTML = ' ▼';
        hoverIndicator.style.cssText = `
            font-size: 8px;
            opacity: 0.6;
            margin-left: 2px;
            transition: transform 0.3s ease;
        `;
        cmsButton.appendChild(hoverIndicator);

        addButtonHoverEffects(cmsButton, '#19325d', '#2a4a8d');

        // IMPORTANT: first‑time hover wiring done here so first entry always works
        cmsButton.onmouseenter = () => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                swapButtonSets(bentoGrid2, bentoGrid3, dealerId, cmsUrl, true);
                isHoveringToolbox = true;
            }, 30);
        };


        const refreshButton = document.createElement('button');
        refreshButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`;
        refreshButton.style.cssText = `
            padding: 8px;
            font-size: 11px;
            cursor: pointer;
            background: #19325d;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: inherit;
        `;
        addButtonHoverEffects(refreshButton, '#19325d', '#2a4a8d');
        refreshButton.addEventListener('click', () => {
            refreshButton.style.transform = 'rotate(360deg)';
            var varchar = location.href.indexOf("?") > 0 ? '&' : '?';
            const randomStr = Math.random().toString(36).substring(2, 7);
            location.href = location.href + varchar + 'pc=' + randomStr;
        });

        const showBlocksButton = document.createElement('button');
        showBlocksButton.textContent = 'Blocks';
        showBlocksButton.style.cssText = `
            padding: 8px;
            font-size: 11px;
            cursor: pointer;
            background: #19325d;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-family: inherit;
        `;
        addButtonHoverEffects(showBlocksButton, '#19325d', '#2a4a8d');
        showBlocksButton.addEventListener('click', () => {
            if (blocksShown) {
                removeBlockOverlays();
                showBlocksButton.textContent = 'Blocks';
                return;
            }
            showBlocksButton.textContent = 'Hide';
            blocksShown = true;

            closeAllButtonRef = document.createElement('div');
            closeAllButtonRef.textContent = '✕ Close All';
            closeAllButtonRef.style.cssText = `
                position: fixed;
                top: 15px;
                right: 15px;
                padding: 12px 18px;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(10px);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
                cursor: pointer;
                z-index: 10000;
                border-radius: 10px;
                font-weight: 700;
                font-size: 12px;
                transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                letter-spacing: 0.3px;
            `;
            closeAllButtonRef.addEventListener('mouseenter', function() {
                this.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
                this.style.transform = 'scale(1.08) rotate(-2deg)';
            });
            closeAllButtonRef.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(0, 0, 0, 0.9)';
                this.style.transform = 'scale(1) rotate(0)';
            });
            closeAllButtonRef.addEventListener('click', () => {
                removeBlockOverlays();
                showBlocksButton.textContent = 'Blocks';
            });
            document.body.appendChild(closeAllButtonRef);

            const homepageBlocks = document.querySelectorAll("[id^='block'], [class^='contentSection']");
            homepageBlocks.forEach(el => highlightBlock(el, el.id || el.className));

            const vdpSelectors = [
                { selector: "#cBlock1", label: "Block 1" },
                { selector: "#cBlock-2", label: "Block 2" },
                { selector: "#vehicle-details > section > div.vehicle-details__title-pricing.vehicle-details__card.vehicle-details__card-- > div.vehicle-details__pricing.vehicle-details__pricing-- > div > div:nth-child(3)", label: "Block 3" },
                { selector: "#cBlock-4", label: "Block 4" },
                { selector: "#cBlock5", label: "Block 5" }
            ];

            vdpSelectors.forEach((item) => {
                const element = document.querySelector(item.selector);
                if (element) {
                    highlightBlock(element, item.label);
                }
            });

            function highlightBlock(element, labelText) {
                element.style.position = 'relative';
                const overlay = document.createElement('div');
                overlay.className = 'overlay-highlight';
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border: 3px solid #ff3b30;
                    background: linear-gradient(135deg, rgba(255, 59, 48, 0.12), rgba(255, 149, 0, 0.12));
                    z-index: 9999;
                    pointer-events: none;
                    box-shadow: 0 0 30px rgba(255, 59, 48, 0.3);
                `;

                const label = document.createElement('div');
                label.textContent = labelText;
                label.style.cssText = `
                    position: absolute;
                    top: -30px;
                    left: 0;
                    background: linear-gradient(135deg, #ff3b30 0%, #ff6b58 100%);
                    color: white;
                    padding: 8px 14px;
                    z-index: 10000;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 11px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                `;
                overlay.appendChild(label);
                element.appendChild(overlay);
            }
        });

        bentoGrid2.appendChild(cmsButton);
        bentoGrid2.appendChild(refreshButton);
        bentoGrid2.appendChild(showBlocksButton);

        // BENTO GRID ROW 3: Mobile, Styles, Overrides (created directly - no swap delay)
        const bentoGrid3 = document.createElement('div');
        bentoGrid3.className = 'bento-grid';
        bentoGrid3.style.cssText = `
            grid-template-columns: repeat(3, 1fr);
        `;

        const mobileButton = document.createElement('button');
        mobileButton.id = 'mobileButton';
        mobileButton.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 3px;"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>Mobile`;
        mobileButton.style.cssText = `
            padding: 8px;
            font-size: 11px;
            cursor: pointer;
            background: #19325d;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: inherit;
        `;
        addButtonHoverEffects(mobileButton, '#19325d', '#2a4a8d');
        attachMobileListener(mobileButton);

        const stylesButton = document.createElement('button');
        stylesButton.textContent = 'Styles';
        stylesButton.style.cssText = `
            padding: 8px;
            font-size: 11px;
            cursor: pointer;
            background: #19325d;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-family: inherit;
        `;
        addButtonHoverEffects(stylesButton, '#19325d', '#2a4a8d');
        stylesButton.addEventListener('click', function() {
            (function(){
                $('body').append($('<div>').html('<div class="modal fade" id="buttontester" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"><div class="modal-dialog modal-lg" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h3 class="modal-title" style="color:#000!important" id="myModalLabel">Dealer Buttons & Backgrounds</h3></div><div class="modal-body"><p class="h4" style="color:#000!important">DealerOn Buttons:</p><p><button type="button" class="btn btn-cta copyText" data-copyfrom="#test-btn0" id="test-btn0">btn-cta</button> <button type="button" class="btn btn-main copyText" data-copyfrom="#test-btn1" id="test-btn1">btn-main</button> <button type="button" class="btn btn-alt1 copyText" data-copyfrom="#test-btn2" id="test-btn2">btn-alt1</button> <button type="button" class="btn btn-alt2 copyText" data-copyfrom="#test-btn3" id="test-btn3">btn-alt2</button> <button type="button" class="btn btn-alt3 copyText" data-copyfrom="#test-btn4" id="test-btn4">btn-alt3</button> <button type="button" class="btn btn-pricing copyText" data-copyfrom="#test-btn5" id="test-btn5">btn-pricing</button> <button type="button" class="btn btn-secondary copyText" data-copyfrom="#test-btn6" id="test-btn6">btn-secondary</button></p><p class="h4 margin-top-2x" style="color:#000!important">Bootstrap 3 Buttons:</p><p><button type="button" class="btn btn-default copyText" data-copyfrom="#test-btn8" id="test-btn8">btn-default</button> <button type="button" class="btn btn-primary copyText" data-copyfrom="#test-btn9" id="test-btn9">btn-primary</button> <button type="button" class="btn btn-success copyText" data-copyfrom="#test-btn10" id="test-btn10">btn-success</button> <button type="button" class="btn btn-info copyText" data-copyfrom="#test-btn11" id="test-btn11">btn-info</button> <button type="button" class="btn btn-warning copyText" data-copyfrom="#test-btn12" id="test-btn12">btn-warning</button> <button type="button" class="btn btn-danger copyText" data-copyfrom="#test-btn13" id="test-btn13">btn-danger</button> <button type="button" class="btn btn-link copyText" data-copyfrom="#test-btn14" id="test-btn14">btn-link</button></p><p class="h4 margin-top-2x" style="color:#000!important">DealerOn Text Colors:</p><p><button type="button" class="btn btn-link text-cta copyText" data-copyfrom="#test-btn19" id="test-btn19">text-cta</button> <button type="button" class="btn btn-link text-main copyText" data-copyfrom="#test-btn20" id="test-btn20">text-main</button> <button type="button" class="btn btn-link text-default copyText" data-copyfrom="#test-btn21" id="test-btn21">text-default</button> <button type="button" class="btn btn-link text-muted copyText" data-copyfrom="#test-btn22" id="test-btn22">text-muted</button></p><p class="h4 margin-top-2x" style="color:#000!important">Backgrounds</p><div class="row"><div class="col-md-12 pad-1x bg-cta margin-bottom-1x text-white"><button type="button" class="btn bg-cta copyText" data-copyfrom="#test-btn15" id="test-btn15">bg-cta</button></div><div class="col-md-12 pad-1x bg-main margin-bottom-1x text-white"><button type="button" class="btn bg-main copyText" data-copyfrom="#test-btn16" id="test-btn16">bg-main</button></div><div class="col-md-12 pad-1x bg-alt1 margin-bottom-1x"><button type="button" class="btn bg-alt1 copyText" data-copyfrom="#test-btn17" id="test-btn17">bg-alt1</button></div><div class="col-md-12 pad-1x bg-alt2 margin-bottom-1x"><button type="button" class="btn bg-alt2 copyText" data-copyfrom="#test-btn18" id="test-btn18">bg-alt2</button></div></div></div></div></div></div>'));
                $('#buttontester').modal().show();
                function fallbackCopyTextToClipboard(text) {
                    var textArea = document.createElement("textarea");
                    textArea.value = text;
                    textArea.style.top = "0";
                    textArea.style.left = "0";
                    textArea.style.position = "fixed";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        console.log('Fallback: Copying text command was ' + msg);
                    } catch (err) {
                        console.error('Fallback: Oops, unable to copy', err);
                    }
                    document.body.removeChild(textArea);
                };
                function copyTextToClipboard(text) {
                    if (!navigator.clipboard) {
                        fallbackCopyTextToClipboard(text);
                        return;
                    }
                    navigator.clipboard.writeText(text).then(function() {
                        console.log('Async: Copying to clipboard was successful!');
                    }, function(err) {
                        console.error('Async: Could not copy text: ', err);
                    });
                };
                function copyText(e) {
                    copyTextToClipboard($($(e.target).data('copyfrom')).text());
                };
                $(document).on('click', 'button.copyText', copyText);
            })();
        });

        const overridesButton = document.createElement('button');
        overridesButton.id = 'overridesButton';
        overridesButton.textContent = 'Overrides';
        overridesButton.style.cssText = `
            padding: 8px;
            font-size: 11px;
            cursor: pointer;
            background: #19325d;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-family: inherit;
        `;
        addButtonHoverEffects(overridesButton, '#19325d', '#2a4a8d');
        attachOverridesListener(overridesButton);

        bentoGrid3.appendChild(mobileButton);
        bentoGrid3.appendChild(stylesButton);
        bentoGrid3.appendChild(overridesButton);

        // Wrap grids in toolbox container
        const toolboxArea = document.createElement('div');
        toolboxArea.style.cssText = 'position: relative;';
        toolboxArea.appendChild(bentoGrid2);
        toolboxArea.appendChild(bentoGrid3);
        popup.appendChild(toolboxArea);

        let hoverTimeout;
        let isHoveringToolbox = false;

        function attachCmsHoverListener() {
            const cmsBtn = document.getElementById('cmsButton');
            if (!cmsBtn) return;
            cmsBtn.onmouseenter = () => {
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    swapButtonSets(bentoGrid2, bentoGrid3, dealerId, cmsUrl, true);
                    isHoveringToolbox = true;
                }, 30); // feels instant
            };
        }

        attachCmsHoverListener();

        toolboxArea.addEventListener('mouseenter', () => {
            isHoveringToolbox = true;
            clearTimeout(hoverTimeout);
        });

        toolboxArea.addEventListener('mouseleave', () => {
            isHoveringToolbox = false;
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                if (!isHoveringToolbox) {
                    swapButtonSets(bentoGrid2, bentoGrid3, dealerId, cmsUrl, false);
                    attachCmsHoverListener(); // make sure CMS hover works again
                }
            }, 80);
        });

        document.body.appendChild(popup);
    }



    // ============================================================================
    // SECTION 9: INITIALIZATION & EVENT LISTENERS
    // ============================================================================
    function init() {
        injectStyles();
        const dealerData = fetchDealerData();
        if (dealerData.dealerId) {
            createPopup(dealerData);
        }

        const popupObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                const mobileButton = document.getElementById('mobileButton');
                if (mobileButton) {
                    attachMobileListener(mobileButton);
                }
                const overridesButton = document.getElementById('overridesButton');
                if (overridesButton) {
                    attachOverridesListener(overridesButton);
                }
            });
        });
        const dealerPopup = document.getElementById('dealerPopup');
        if (dealerPopup) {
            popupObserver.observe(dealerPopup, { childList: true, subtree: true });
        }
    }

    document.addEventListener('click', (e) => {
        if (deviceDropdownVisible) {
            const mobileButton = document.getElementById('mobileButton');
            const dropdown = deviceDropdownRef;
            if (dropdown && !dropdown.contains(e.target) && e.target !== mobileButton) {
                hideDeviceDropdown();
            }
        }
        if (overridesDropdownVisible) {
            const overridesButton = document.getElementById('overridesButton');
            const dropdown = overridesDropdownRef;
            if (dropdown && !dropdown.contains(e.target) && e.target !== overridesButton) {
                hideOverridesDropdown();
            }
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
