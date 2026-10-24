const LANG_STORAGE_KEY = 'skyHeightLang';

function matchLanguageTag(rawTag) {
    const tag = String(rawTag || '').toLowerCase().replace(/_/g, '-');
    if (!tag) return null;

    // 繁體：zh-Hant、台灣、香港、澳門
    if (tag === 'zh-hant' || tag.startsWith('zh-hant-') ||
        tag.startsWith('zh-tw') || tag.startsWith('zh-hk') || tag.startsWith('zh-mo')) {
        return 'zh-Hant';
    }
    // 其餘中文（zh、zh-CN、zh-SG、zh-Hans…）皆視為简体
    if (tag.startsWith('zh')) return 'zh-Hans';
    if (tag === 'ja' || tag.startsWith('ja-')) return 'ja';
    if (tag === 'en' || tag.startsWith('en-')) return 'en';
    return null;
}

function detectLanguage() {
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved && translations[saved]) return saved;
    } catch (e) {
        // localStorage 不可用時忽略
    }

    const candidates = [];
    if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
    if (navigator.language) candidates.push(navigator.language);

    for (const candidate of candidates) {
        const matched = matchLanguageTag(candidate);
        if (matched) return matched;
    }

    return 'zh-Hant';
}

let currentLang = detectLanguage();
document.documentElement.lang = currentLang;
let history = [];
let uploadedImageUrl = null;
let lastResult = null;
let lastCalculatedScale = null;
let potionCounter = 0;

const backgroundImages = [
    { id: 'bg1', path: 'images/bg1.png' },
    { id: 'bg2', path: 'images/bg2.png' },
    { id: 'bg3', path: 'images/bg3.png' },
    { id: 'bg4', path: 'images/bg4.png' },
    { id: 'bg5', path: 'images/bg5.png' },
    { id: 'bg6', path: 'images/bg6.png' },
    { id: 'bg7', path: 'images/bg7.png' },
    { id: 'bg8', path: 'images/bg8.png' }
];

const backgroundGradients = [
    { id: 'daylight', colors: ['#a1c4fd', '#c2e9fb'] },
    { id: 'dawn', colors: ['#f6d365', '#fda085'] },
    { id: 'valley', colors: ['#f093fb', '#f5576c'] },
    { id: 'night', colors: ['#2c3e50', '#1a293f'] },
];

function renderChangelog() {
    const listContainer = document.getElementById('changelog-list');
    if (!listContainer || typeof versionData === 'undefined') return;

    listContainer.innerHTML = versionData.map(item => {
        const contentList = item.changes[currentLang] || item.changes['en'];
        const listHtml = contentList.map(text => `<li>${text}</li>`).join('');

        return `
            <div class="version-item">
                <div class="version-header">
                    <span class="version-tag">${item.ver}</span>
                    <span class="version-date">${item.date}</span>
                </div>
                <ul class="version-content">
                    ${listHtml}
                </ul>
            </div>
        `;
    }).join('');
}

function setLanguage(lang, options = {}) {
    if (!translations[lang]) return;
    currentLang = lang;
    if (options.persist !== false) {
        try {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        } catch (e) {
            // 忽略儲存失敗
        }
    }
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (translations[lang][key] !== undefined) {
            const translation = translations[lang][key];
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                el.placeholder = translation;
            } else if (key.startsWith('inst_') || key.startsWith('faq_') || 
                       key === 'status_error_general' || key === 'sim_desc' || 
                       key === 'sim_disclaimer_text' || key === 'measurement_notice_body') {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
    document.querySelectorAll('.lang-option').forEach(span => {
        span.classList.toggle('active', span.dataset.lang === lang);
    });
    renderChangelog();
}

function t(key) {
    return translations[currentLang][key] || key;
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = (progress * (end - start) + start).toFixed(4);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        calculateBtn: document.getElementById('calculate-btn'),
        b64Input: document.getElementById('b64-input'),
        resCurrent: document.getElementById('res-current'),
        resTallest: document.getElementById('res-tallest'),
        resShortest: document.getElementById('res-shortest'),
        resJson: document.getElementById('res-json'),
        heightProgress: document.getElementById('height-progress'),
        heightProgressFill: document.getElementById('height-progress-fill'),
        heightProgressPercent: document.getElementById('height-progress-percent'),
        heightProgressMin: document.getElementById('height-progress-min'),
        heightProgressMax: document.getElementById('height-progress-max'),
        statusEl: document.getElementById('status'),
        copyBtn: document.getElementById('copy-btn'),
        imageBtn: document.getElementById('image-btn'),
        resultActions: document.getElementById('result-actions'),
        langSwitcher: document.getElementById('lang-switcher'),
        langSwitcherHeader: document.getElementById('lang-switcher-header'),
        langMenuHeader: document.getElementById('lang-menu-header'),
        themeSwitcher: document.getElementById('theme-switcher'),
        themeIconLight: document.getElementById('theme-icon-light'),
        themeIconDark: document.getElementById('theme-icon-dark'),
        historyContainer: document.getElementById('history'),
        historyList: document.getElementById('history-list'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        exportHistoryBtn: document.getElementById('export-history-btn'),
        docHtml: document.documentElement,
        bgSelector: document.getElementById('bg-selector'),
        gradientSelector: document.getElementById('gradient-selector'),
        textColorSelector: document.getElementById('text-color-selector'),
        playerNameInput: document.getElementById('player-name'),
        customizationOptions: document.querySelector('.customization-options'),
        uploadBgInput: document.getElementById('upload-bg'),
        uploadedImagePreview: document.getElementById('uploaded-image-preview'),
        previewCanvas: document.getElementById('preview-canvas'),
        textAlignSelector: document.getElementById('text-align-selector'),
        showRangeToggle: document.getElementById('show-range-toggle'),
        simulatorContainer: document.getElementById('simulator-container'),
        drinkPotionBtn: document.getElementById('drink-potion-btn'),
        resetSimBtn: document.getElementById('reset-sim-btn'),
        potionResult: document.getElementById('potion-result'),
        potionCount: document.getElementById('potion-count'),
        potionExtremeNotice: document.getElementById('potion-extreme-notice'),
        qrUploadArea: document.getElementById('qr-upload-area'),
        qrFileInput: document.getElementById('qr-file-input'),
        qrCanvas: document.getElementById('qr-canvas'),
        pasteImageBtn: document.getElementById('paste-image-btn')
    };

    function saveHistory() {
        localStorage.setItem('skyHeightHistory', JSON.stringify(history));
    }

    function loadHistory() {
        const savedHistory = localStorage.getItem('skyHeightHistory');
        history = savedHistory ? JSON.parse(savedHistory) : [];

        // 還原曾以「數值越大越高」儲存的紀錄，避免方向顛倒
        let needsRepair = false;
        history.forEach(item => {
            if (item.heightOrder === 'larger-is-taller') {
                const tallest = item.tallest;
                item.tallest = item.shortest;
                item.shortest = tallest;
                delete item.heightOrder;
                needsRepair = true;
            }
        });
        if (needsRepair) saveHistory();

        if (history.length > 0) {
            dom.historyContainer.style.display = 'block';
            renderHistory();
        }
    }

    function getHeightPercent(result) {
        if (!result || typeof result.current !== 'number' ||
            typeof result.tallest !== 'number' || typeof result.shortest !== 'number') {
            return null;
        }
        const span = result.tallest - result.shortest;
        if (!isFinite(span) || span === 0) return null;
        return Math.max(0, Math.min(100, ((result.current - result.shortest) / span) * 100));
    }

    function stripColon(text) {
        return text.replace(/\s*[:：]\s*$/, '');
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    function updateHeightProgress(result) {
        const percent = getHeightPercent(result);
        if (percent === null) {
            dom.heightProgress.style.display = 'none';
            dom.heightProgress.setAttribute('aria-valuenow', '0');
            dom.heightProgressFill.style.width = '0%';
            dom.heightProgressPercent.textContent = '--';
            dom.heightProgressMin.textContent = '-';
            dom.heightProgressMax.textContent = '-';
            return;
        }
        dom.heightProgress.style.display = 'block';
        dom.heightProgress.setAttribute('aria-valuenow', percent.toFixed(0));
        dom.heightProgressFill.style.width = `${percent.toFixed(1)}%`;
        if (percent > 50) {
            const remaining = (100 - percent).toFixed(2);
            dom.heightProgressPercent.textContent = t('height_progress_remaining').replace('{value}', remaining);
        } else {
            dom.heightProgressPercent.textContent = t('height_progress_to_shortest').replace('{value}', percent.toFixed(2));
        }
        dom.heightProgressMin.textContent = `${stripColon(t('res_shortest'))} ${result.shortest.toFixed(2)}`;
        dom.heightProgressMax.textContent = `${stripColon(t('res_tallest'))} ${result.tallest.toFixed(2)}`;
    }

    function exportHistory() {
        if (!history.length) return;

        const headers = [
            t('history_date_label'),
            stripColon(t('res_current')),
            stripColon(t('res_tallest')),
            stripColon(t('res_shortest')),
            t('history_note_label')
        ];
        const rows = history.map(item => [
            new Date(item.timestamp).toLocaleString(),
            typeof item.current === 'number' ? item.current.toFixed(4) : '',
            typeof item.tallest === 'number' ? item.tallest.toFixed(4) : '',
            typeof item.shortest === 'number' ? item.shortest.toFixed(4) : '',
            item.note || ''
        ]);
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\r\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, '0');
        const link = document.createElement('a');
        link.href = url;
        link.download = `sky-height-history-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function renderHistory() {
        dom.historyList.innerHTML = '';
        history.forEach((item, index) => {
            const currentHeightDisplay = typeof item.current === 'number' ? item.current.toFixed(4) : 'N/A';
            const li = document.createElement('li');
            const date = new Date(item.timestamp).toLocaleString();
            const percent = getHeightPercent(item);
            const progressHtml = percent === null ? '' : `
                <div class="history-progress" title="${percent.toFixed(0)}%">
                    <div class="history-progress-fill" style="width: ${percent.toFixed(1)}%;"></div>
                </div>`;
            li.innerHTML = `
                <button class="delete-history-item" data-index="${index}" title="${t('confirm_delete_item')}">×</button>
                <div class="history-item-main">
                    <span class="history-value">${t('history_current_label')}: ${currentHeightDisplay}</span>
                    <span class="timestamp">${date}</span>
                </div>
                ${progressHtml}
                <button class="history-note" data-index="${index}">${escapeHtml(item.note) || t('history_note_placeholder')}</button>
            `;
            dom.historyList.appendChild(li);
        });
    }

    function applyTheme(theme) {
        dom.docHtml.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        dom.themeIconLight.style.display = theme === 'dark' ? 'none' : 'block';
        dom.themeIconDark.style.display = theme === 'dark' ? 'block' : 'none';
    }

    function populateBgSelectors() {
        dom.bgSelector.innerHTML = '';
        backgroundImages.forEach((img, index) => {
            const imgEl = document.createElement('button');
            imgEl.type = 'button';
            imgEl.style.backgroundImage = `url(${img.path})`;
            imgEl.classList.add('selectable-option', 'bg-selection');
            imgEl.dataset.type = 'image';
            imgEl.dataset.source = img.path;
            if (index === 0) imgEl.classList.add('active');
            dom.bgSelector.appendChild(imgEl);
        });
        dom.gradientSelector.innerHTML = '';
        backgroundGradients.forEach((grad) => {
            const gradEl = document.createElement('button');
            gradEl.type = 'button';
            gradEl.classList.add('selectable-option', 'bg-selection', 'gradient-option');
            gradEl.style.background = `linear-gradient(to bottom right, ${grad.colors[0]}, ${grad.colors[1]})`;
            gradEl.dataset.type = 'gradient';
            gradEl.dataset.colors = grad.colors.join(',');
            dom.gradientSelector.appendChild(gradEl);
        });
    }

    const drawCanvasContent = (ctx, canvas) => {
        if (!lastResult) {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--details-bg');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return;
        }
        const playerName = dom.playerNameInput.value;
        const textColor = document.querySelector('.text-color-option.active').dataset.color;
        const textAlign = document.querySelector('.text-align-option.active').dataset.align;
        
        ctx.fillStyle = textColor === 'white' ? '#FFFFFF' : '#2c3e50';
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'top';
        ctx.shadowColor = textColor === 'white' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
        ctx.shadowBlur = 5;

        let x;
        if (textAlign === 'left') x = 25;
        else if (textAlign === 'right') x = canvas.width - 25;
        else x = canvas.width / 2;

        const baseFont = '"PingFang TC", "Microsoft JhengHei", "Helvetica Neue", sans-serif';
        if (playerName) {
            ctx.font = `20px ${baseFont}`;
            ctx.fillText(playerName, x, 20);
        }
        ctx.font = `bold 30px ${baseFont}`;
        ctx.fillText(t('res_current'), x, playerName ? 60 : 50);

        ctx.font = `bold 70px "Courier New", Courier, monospace`;
        ctx.fillText(lastResult.current.toFixed(4), x, 95);

        if (dom.showRangeToggle.checked) {
            ctx.font = `20px ${baseFont}`;
            const rangeText = `${t('res_tallest')} ${lastResult.tallest.toFixed(4)} | ${t('res_shortest')} ${lastResult.shortest.toFixed(4)}`;
            ctx.fillText(rangeText, x, 180);
        }

        ctx.font = `12px "Arial", sans-serif`;
        ctx.globalAlpha = 0.8;
        ctx.textAlign = 'center';
        ctx.fillText('Generated by sky-cotl-height-tool', canvas.width / 2, 220);
        ctx.globalAlpha = 1.0;
    };

    const updatePreview = () => {
        const ctx = dom.previewCanvas.getContext('2d');
        const activeBg = document.querySelector('.bg-selection.active');

        ctx.clearRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
        if (!activeBg) {
            drawCanvasContent(ctx, dom.previewCanvas);
            return;
        }
        if (activeBg.dataset.type === 'image' || activeBg.dataset.type === 'uploaded') {
            const bgImage = new Image();
            bgImage.crossOrigin = "Anonymous";
            bgImage.src = activeBg.dataset.source;
            bgImage.onload = () => {
                ctx.drawImage(bgImage, 0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                ctx.fillRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
                drawCanvasContent(ctx, dom.previewCanvas);
            };
            bgImage.onerror = () => {
                ctx.fillStyle = 'red';
                ctx.fillRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
                drawCanvasContent(ctx, dom.previewCanvas);
            };
        } else {
            const colors = activeBg.dataset.colors.split(',');
            const gradient = ctx.createLinearGradient(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
            drawCanvasContent(ctx, dom.previewCanvas);
        }
    };

    function startNoteEdit(button) {
        const index = parseInt(button.dataset.index, 10);
        const li = button.closest('li');
        if (!li || li.querySelector('.history-note-editor')) return;

        button.style.display = 'none';
        const editor = document.createElement('div');
        editor.className = 'history-note-editor';
        editor.innerHTML = `
            <input type="text" class="history-note-input" maxlength="100"
                placeholder="${t('history_note_placeholder')}" value="${escapeHtml(history[index].note || '')}">
            <div class="history-note-actions">
                <button type="button" class="history-note-save" data-index="${index}">${t('history_note_save')}</button>
                <button type="button" class="history-note-cancel">${t('history_note_cancel')}</button>
            </div>
        `;
        button.insertAdjacentElement('afterend', editor);

        const input = editor.querySelector('.history-note-input');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                saveNote(index, editor);
            } else if (ev.key === 'Escape') {
                ev.preventDefault();
                renderHistory();
            }
        });
    }

    function saveNote(index, editor) {
        if (!editor) return;
        const input = editor.querySelector('.history-note-input');
        if (!input) return;
        history[index].note = input.value.trim();
        saveHistory();
        renderHistory();
    }

    dom.historyList.addEventListener('click', (e) => {
        const noteBtn = e.target.closest('.history-note');
        if (noteBtn) {
            startNoteEdit(noteBtn);
            return;
        }

        const saveBtn = e.target.closest('.history-note-save');
        if (saveBtn) {
            saveNote(parseInt(saveBtn.dataset.index, 10), saveBtn.closest('.history-note-editor'));
            return;
        }

        if (e.target.closest('.history-note-cancel')) {
            renderHistory();
            return;
        }

        const deleteBtn = e.target.closest('.delete-history-item');
        if (deleteBtn) {
            const index = parseInt(deleteBtn.dataset.index, 10);
            if (confirm(t('confirm_delete_item'))) {
                history.splice(index, 1);
                saveHistory();
                renderHistory();
                dom.statusEl.innerHTML = t('item_deleted');
                if (history.length === 0) {
                    dom.historyContainer.style.display = 'none';
                }
            }
        }
    });

    dom.clearHistoryBtn.addEventListener('click', () => {
        if (confirm(t('confirm_clear_history'))) {
            history = [];
            saveHistory();
            dom.historyContainer.style.display = 'none';
        }
    });

    if (dom.exportHistoryBtn) {
        dom.exportHistoryBtn.addEventListener('click', exportHistory);
    }

    dom.themeSwitcher.addEventListener('click', () => {
        applyTheme(dom.docHtml.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        updatePreview();
    });

    dom.langSwitcher.addEventListener('click', (e) => {
        const langToggle = e.target.closest('.lang-option');
        if (langToggle) {
            setLanguage(langToggle.dataset.lang);
            renderHistory();
            updateHeightProgress(lastResult);
            updatePreview();
        }
    });

    dom.langSwitcherHeader.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = dom.langMenuHeader.style.display === 'none';
        dom.langMenuHeader.style.display = isHidden ? 'block' : 'none';
    });

    dom.langMenuHeader.addEventListener('click', (e) => {
        const langToggle = e.target.closest('.lang-option');
        if (langToggle) {
            setLanguage(langToggle.dataset.lang);
            renderHistory();
            updateHeightProgress(lastResult);
            updatePreview();
            dom.langMenuHeader.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!dom.langMenuHeader.contains(e.target) && !dom.langSwitcherHeader.contains(e.target)) {
            dom.langMenuHeader.style.display = 'none';
        }
    });

    dom.customizationOptions.addEventListener('click', (e) => {
        const target = e.target.closest('.selectable-option');
        if (target) {
            const parent = target.parentElement;
            if (parent.classList.contains('image-selector') || parent.id === 'gradient-selector') {
                document.querySelectorAll('.bg-selection').forEach(btn => btn.classList.remove('active'));
            } else if (parent.id === 'text-color-selector' || parent.id === 'text-align-selector') {
                parent.querySelectorAll('.selectable-option').forEach(btn => btn.classList.remove('active'));
            }
            target.classList.add('active');
            updatePreview();
        }
    });

    dom.uploadBgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImageUrl = event.target.result;
                dom.uploadedImagePreview.innerHTML = '';
                const previewBtn = document.createElement('button');
                previewBtn.type = 'button';
                previewBtn.classList.add('selectable-option', 'bg-selection', 'active');
                previewBtn.dataset.type = 'uploaded';
                previewBtn.dataset.source = uploadedImageUrl;
                previewBtn.style.backgroundImage = `url(${uploadedImageUrl})`;
                dom.uploadedImagePreview.appendChild(previewBtn);
                document.querySelectorAll('.bg-selection').forEach(el => {
                    if (el !== previewBtn) el.classList.remove('active');
                });
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    dom.playerNameInput.addEventListener('input', updatePreview);
    dom.showRangeToggle.addEventListener('change', updatePreview);

    dom.calculateBtn.addEventListener('click', () => {
        dom.resCurrent.textContent = '...'; 
        dom.resTallest.textContent = '...'; 
        dom.resShortest.textContent = '...';
        if (dom.resJson) dom.resJson.textContent = '';
        dom.resultActions.style.display = 'none';
        lastResult = null;
        updateHeightProgress(null);
        dom.statusEl.innerHTML = t('status_calculating'); 
        dom.statusEl.className = '';
        
        const rawData = dom.b64Input.value.trim();
        if (!rawData) {
            dom.statusEl.innerHTML = t('status_error_empty'); 
            dom.statusEl.className = 'status-error';
            return;
        }

        const results = decodeAndCalculate(rawData);

        if (results.error) {
            dom.statusEl.innerHTML = t(results.error); 
            dom.statusEl.className = 'status-error';
            dom.simulatorContainer.style.display = 'none';
            updateHeightProgress(null);
        } else {
            lastResult = results;
            animateValue(dom.resCurrent, parseFloat(dom.resCurrent.textContent) || 0, results.current, 500);
            animateValue(dom.resTallest, parseFloat(dom.resTallest.textContent) || 0, results.tallest, 500);
            animateValue(dom.resShortest, parseFloat(dom.resShortest.textContent) || 0, results.shortest, 500);

            requestAnimationFrame(() => updateHeightProgress(results));

            if (dom.resJson && results.json) {
                if (typeof versionData !== 'undefined' && versionData.length > 0) {
                    results.json.tool_version = versionData[0].ver;
                }
                dom.resJson.textContent = JSON.stringify(results.json, null, 2);
            }

            dom.statusEl.innerHTML = t('status_success'); 
            dom.statusEl.className = 'status-success';
            dom.resultActions.style.display = 'block';

            lastCalculatedScale = results.scale;
            dom.simulatorContainer.style.display = 'block';
            dom.resetSimBtn.click();
            history.unshift(results);
            if (history.length > 10) history.pop();
            saveHistory();
            renderHistory();
            dom.historyContainer.style.display = 'block';
            setTimeout(updatePreview, 100);
        }
    });

    dom.b64Input.addEventListener('paste', (e) => {
        const data = e.clipboardData;
        const hasImage = data && Array.from(data.types || []).some(type => type.startsWith('image/'));
        if (hasImage) return;
        setTimeout(() => { dom.calculateBtn.click(); }, 0);
    });

    dom.copyBtn.addEventListener('click', () => {
        if (!lastResult) {
            dom.statusEl.innerHTML = t('status_copy_empty');
            dom.statusEl.className = 'status-error';
            return;
        }
        const copyText = `${t('res_current')} ${lastResult.current.toFixed(4)}\n${t('res_tallest')} ${lastResult.tallest.toFixed(4)}\n${t('res_shortest')} ${lastResult.shortest.toFixed(4)}`;
        navigator.clipboard.writeText(copyText).then(() => {
            dom.statusEl.innerHTML = t('status_copy_success'); 
            dom.statusEl.className = 'status-success';
            const originalText = t('copy_btn');
            dom.copyBtn.textContent = t('copy_btn_copied');
            setTimeout(() => { dom.copyBtn.textContent = originalText; }, 2000);
        }).catch(err => {
            dom.statusEl.innerHTML = t('status_copy_fail'); 
            dom.statusEl.className = 'status-error';
        });
    });

    dom.imageBtn.addEventListener('click', () => {
        if (!lastResult) return;

        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = 500; 
        downloadCanvas.height = 250;
        const ctx = downloadCanvas.getContext('2d');
        const activeBg = document.querySelector('.bg-selection.active');
        
        const triggerDownload = () => {
            const now = new Date();
            const pad = (num) => num.toString().padStart(2, '0');
            const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
            const link = document.createElement('a');
            link.download = `sky-height-card_${timestamp}.png`;
            link.href = downloadCanvas.toDataURL('image/png');
            link.click();
        };

        if (activeBg && (activeBg.dataset.type === 'image' || activeBg.dataset.type === 'uploaded')) {
            const bgImage = new Image();
            bgImage.crossOrigin = "Anonymous";
            bgImage.src = activeBg.dataset.source;
            bgImage.onload = () => {
                ctx.drawImage(bgImage, 0, 0, downloadCanvas.width, downloadCanvas.height);
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
                drawCanvasContent(ctx, downloadCanvas);
                triggerDownload();
            };
            bgImage.onerror = () => { alert('背景圖片載入失敗!'); };
        } else if (activeBg && activeBg.dataset.type === 'gradient') {
            const colors = activeBg.dataset.colors.split(',');
            const gradient = ctx.createLinearGradient(0, 0, downloadCanvas.width, downloadCanvas.height);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            drawCanvasContent(ctx, downloadCanvas);
            triggerDownload();
        } else {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--details-bg');
            ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            drawCanvasContent(ctx, downloadCanvas);
            triggerDownload();
        }
    });

    dom.drinkPotionBtn.addEventListener('click', () => {
        if (lastCalculatedScale === null) {
            alert(t('sim_error_no_calc'));
            return;
        }
        dom.potionExtremeNotice.textContent = '';
        const newRandomHeight = Math.random() * 4.0 - 2.0;
        const newHeightNumber = 7.6 - (8.3 * lastCalculatedScale) - (3 * newRandomHeight);

        const currentResult = parseFloat(dom.potionResult.textContent) || newHeightNumber;
        animateValue(dom.potionResult, currentResult, newHeightNumber, 300);
        if (newRandomHeight >= 1.96) {
            dom.potionExtremeNotice.textContent = t('sim_extreme_tall');
        } else if (newRandomHeight <= -1.96) {
            dom.potionExtremeNotice.textContent = t('sim_extreme_short');
        }

        potionCounter++;
        dom.potionCount.textContent = potionCounter;
    });

    dom.resetSimBtn.addEventListener('click', () => {
        potionCounter = 0;
        dom.potionResult.textContent = '...';
        dom.potionCount.textContent = '0';
        dom.potionExtremeNotice.textContent = '';
    });

    function loadImageToCanvas(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function preprocessImageData(imageData, contrast, brightness) {
        const data = new Uint8ClampedArray(imageData.data);
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < data.length; i += 4) {
            let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            gray = factor * (gray - 128) + 128 + brightness;
            gray = Math.max(0, Math.min(255, gray));
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
        return new ImageData(data, imageData.width, imageData.height);
    }

    function binarize(imageData, threshold) {
        const data = new Uint8ClampedArray(imageData.data);
        for (let i = 0; i < data.length; i += 4) {
            let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            let val = gray > threshold ? 255 : 0;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
        }
        return new ImageData(data, imageData.width, imageData.height);
    }

    async function handleQrUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            dom.statusEl.innerHTML = t('status_error_general');
            dom.statusEl.className = 'status-error';
            return;
        }

        dom.statusEl.innerHTML = t('status_qr_reading');
        dom.statusEl.className = '';

        if (typeof jsQR === 'undefined') {
            dom.statusEl.innerHTML = "錯誤: QR 掃描庫載入失敗，請重新整理頁面";
            dom.statusEl.className = 'status-error';
            return;
        }

        try {
            dom.statusEl.innerHTML = t('status_qr_scanning');
            const img = await loadImageToCanvas(file);
            const canvas = dom.qrCanvas;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            let code = null;
            const scales = [1, 0.5, 0.25, 0.75, 1.5]; 
            const processings = [
                (imgData) => imgData,
                (imgData) => preprocessImageData(imgData, 50, 0),
                (imgData) => preprocessImageData(imgData, 100, 20),
                (imgData) => preprocessImageData(imgData, 80, -20),
                (imgData) => binarize(imgData, 128),
                (imgData) => binarize(imgData, 100),
                (imgData) => binarize(imgData, 150)
            ];

            for (const scale of scales) {
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                for (const process of processings) {
                    const processedData = process(originalImageData);
                    code = jsQR(processedData.data, processedData.width, processedData.height, {
                        inversionAttempts: "attemptBoth",
                    });
                    if (code && code.data) break;
                }
                if (code && code.data) break;
            }

            if (code && code.data) {
                dom.statusEl.innerHTML = t('status_qr_success');
                dom.statusEl.className = 'status-success';
                dom.b64Input.value = code.data;
                setTimeout(() => { dom.calculateBtn.click(); }, 100);
            } else {
                dom.statusEl.innerHTML = t('status_qr_fail');
                dom.statusEl.className = 'status-error';
            }

        } catch (err) {
            dom.statusEl.innerHTML = `掃描失敗: ${err.message || t('status_error_general')}`;
            dom.statusEl.className = 'status-error';
        }
    }

    dom.qrUploadArea.addEventListener('click', () => dom.qrFileInput.click());

    async function pasteImageFromClipboard() {
        if (!navigator.clipboard || typeof navigator.clipboard.read !== 'function') {
            dom.statusEl.innerHTML = t('status_clipboard_unsupported');
            dom.statusEl.className = 'status-error';
            return;
        }

        try {
            dom.statusEl.innerHTML = t('status_qr_reading');
            dom.statusEl.className = '';
            const clipboardItems = await Promise.race([
                navigator.clipboard.read(),
                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('clipboard-read-timeout')), 15000);
                })
            ]);

            for (const item of clipboardItems) {
                const imageType = (item.types || []).find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    const file = new File([blob], 'clipboard-image', { type: imageType });
                    await handleQrUpload(file);
                    return;
                }
            }

            dom.statusEl.innerHTML = t('status_clipboard_empty');
            dom.statusEl.className = 'status-error';
        } catch (err) {
            dom.statusEl.innerHTML = t('status_clipboard_error');
            dom.statusEl.className = 'status-error';
        }
    }

    if (dom.pasteImageBtn) {
        dom.pasteImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pasteImageFromClipboard();
        });
    }

    dom.qrFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleQrUpload(e.target.files[0]);
        }
    });

    dom.qrUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.qrUploadArea.classList.add('dragover');
    });

    dom.qrUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.qrUploadArea.classList.remove('dragover');
    });

    dom.qrUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.qrUploadArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleQrUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    });

    document.addEventListener('paste', (e) => {
        const data = e.clipboardData;
        if (!data) return;

        let file = null;
        if (data.items) {
            const imageItem = Array.from(data.items).find(item =>
                item.kind === 'file' && item.type && item.type.startsWith('image/')
            );
            if (imageItem) file = imageItem.getAsFile();
        }
        if (!file && data.files && data.files.length) {
            file = Array.from(data.files).find(f => f.type && f.type.startsWith('image/')) || null;
        }

        if (file) {
            e.preventDefault();
            handleQrUpload(file);
        }
    });

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
    
    populateBgSelectors();
    loadHistory();
    setLanguage(currentLang, { persist: false });
    renderChangelog();
    updatePreview();
});