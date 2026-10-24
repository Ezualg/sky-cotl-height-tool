const versionData = [
    {
        ver: "v2.3",
        date: "2026.10.24",
        changes: {
            "zh-Hant": [
                "身高進度條改以「最高」為終點，越接近最高填充越多",
                "超過 50% 顯示距離最高還有多少，50% 以下顯示距離最矮還有多少",
                "詳細資訊改為預設折疊",
                "詳細資訊與歷史紀錄位置對調",
                "修正歷史備註無法編輯的問題（改為行內輸入）",
                "頁腳新增 EzualG 個人主頁連結",
                "新增手機端響應式排版與觸控優化",
                "新增剪貼簿圖片貼上支援（貼上圖片按鈕／Ctrl+V）",
                "修正語系判斷：自動偵測簡繁並記住手動選擇"
            ],
            "zh-Hans": [
                "身高进度条改以「最高」为终点，越接近最高填充越多",
                "超过 50% 显示距离最高还有多少，50% 以下显示距离最矮还有多少",
                "详细信息改为默认折叠",
                "详细信息与历史记录位置对调",
                "修正历史备注无法编辑的问题（改为行内输入）",
                "页脚新增 EzualG 个人主页链接",
                "新增手机端响应式排版与触控优化",
                "新增剪贴板图片粘贴支持（粘贴图片按钮／Ctrl+V）",
                "修正语言判断：自动识别简繁并记住手动选择"
            ],
            "en": [
                "Height progress bar now fills toward the tallest height",
                "Above 50% shows distance to tallest, at or below 50% shows distance to shortest",
                "Details section is now collapsed by default",
                "Swapped the positions of Details and History",
                "Fixed note editing in history (now uses an inline input)",
                "Added an EzualG homepage link in the footer",
                "Added responsive mobile layout and touch optimizations",
                "Added clipboard image paste support (Paste Image button / Ctrl+V)",
                "Fixed language detection: auto-detect Simplified/Traditional and remember manual choice"
            ],
            "ja": [
                "身長プログレスバーが「最高」に向かって伸びるようになりました",
                "50% 超は最高までの残り、50% 以下は最矮までの残りを表示",
                "詳細情報はデフォルトで折りたたまれるようになりました",
                "詳細情報と履歴の位置を入れ替え",
                "履歴メモを編集できない問題を修正（インライン入力に変更）",
                "フッターに EzualG ホームページリンクを追加",
                "モバイル向けレスポンシブ表示とタッチ操作を最適化",
                "クリップボードの画像貼り付けに対応（ボタン／Ctrl+V）",
                "言語判定を修正：簡体字／繁体字を自動判定し、手動選択を記憶"
            ]
        }
    },
    {
        ver: "v2.2",
        date: "2026.10.24",
        changes: {
            "zh-Hant": [
                "新增當前身高進度條",
                "歷史紀錄支援進度顯示與匯出"
            ],
            "zh-Hans": [
                "新增当前身高进度条",
                "历史记录支持进度显示与导出"
            ],
            "en": [
                "Added a current height progress bar",
                "History now supports progress display and export"
            ],
            "ja": [
                "現在の身長プログレスバーを追加",
                "履歴の進捗表示とエクスポートに対応"
            ]
        }
    },
    {
        ver: "v2.1",
        date: "2026.06.09",
        changes: {
            "zh-Hant": [
                "再次修正 QR Code 掃描失敗的問題",
                "新增對於數值異常的錯誤訊息",
                "移動計算提示訊息位置"
            ],
            "zh-Hans": [
                "再次修正 QR Code 扫描失败的问题",
                "新增对于数值异常的错误信息",
                "移动计算提示信息位置"
            ],
            "en": [
                "Fixed QR code scanning issues again",
                "Added error messages for abnormal values",
                "Moved calculation hint message position"
            ],
            "ja": [
                "QRコードのスキャンに失敗する問題を再度修正",
                "数値異常に関するエラーメッセージを追加",
                "計算ヒントメッセージの位置を移動"
            ]
        }
    },
    {
        ver: "v2.0",
        date: "2025.12.02",
        changes: {
            "zh-Hant": [
                "兼容遊戲版本 0.31.5 新格式",
                "重新設計網頁介面"
            ],
            "zh-Hans": [
                "兼容游戏版本 0.31.5 新格式",
                "重新设计网页界面"
            ],
            "en": [
                "Compatible with game version 0.31.5 format",
                "Redesigned web interface"
            ],
            "ja": [
                "ゲームバージョン0.31.5の形式に対応",
                "ウェブインターフェースをリニューアル"
            ]
        }
    },
    {
        ver: "v1.3",
        date: "2025.10.27",
        changes: {
            "zh-Hant": ["修正 QR Code 掃描失敗的問題"
            ],
            "zh-Hans": ["修正 QR Code 扫描失败的问题"
            ],
            "en": ["Fixed an issue where QR code scanning failed"
            ],
            "ja": [
                "QRコードのスキャンに失敗する問題を修正"
            ]
        }
    },
    {
        ver: "v1.2",
        date: "2025.10.24",
        changes: {
            "zh-Hant": [
                "移除過時的常見問題區塊",
                "新增測量須知與範圍說明",
                "修正身高數值為非標準格式時的計算錯誤"
            ],
            "zh-Hans": [
                "移除过时的常见问题区块",
                "新增测量须知与范围说明",
                "修正身高数值为非标准格式时的计算错误"
            ],
            "en": [
                "Removed outdated FAQ section",
                "Added measurement notice and range explanation",
                "Fixed calculation errors for non-standard height formats"
            ],
            "ja": [
                "古いFAQセクションを削除",
                "測定に関する注意事項と範囲説明を追加",
                "非標準フォーマットの数値における計算エラーを修正"
            ]
        }
    },
    {
        ver: "v1.1",
        date: "2025.09.21",
        changes: {
            "zh-Hant": ["修正身高數值為科學記號時導致無法計算的問題"
            ],
            "zh-Hans": ["修正身高数值为科学记数法时导致无法计算的问题"
            ],
            "en": ["Fixed calculation failure when height values are in scientific notation"
            ],
            "ja": [
                "身長値が指数表記の場合に計算できない問題を修正"
            ]
        }
    },
    {
        ver: "v1.0",
        date: "2025.09.01",
        changes: {
            "zh-Hant": [
                "工具正式發布",
                "新增功能：直接上傳 QR Code 截圖、日語翻譯、重塑藥水模擬器",
                "修正負數 Scale 值辨識與藥水模擬器顯示問題",
            ],
            "zh-Hans": [
                "工具正式发布",
                "新增功能：直接上传 QR Code 截图、日语翻译、重塑药水模拟器",
                "修正负数 Scale 值识别与药水模拟器显示问题",
            ],
            "en": [
                "Initial release",
                "New features: Direct image upload, Japanese translation, Resize Potion Simulator",
                "Fixed negative scale recognition and simulator display issues",
            ],
            "ja": [
                "ツール正式公開",
                "新機能：画像アップロード機能、日本語翻訳、リサイズドリンクシミュレーター",
                "負のスケール値認識とシミュレーター表示の問題を修正",
            ]
        }
    }
];