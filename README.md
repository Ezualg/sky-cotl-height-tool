# 光遇身高查看工具 (Sky cotl height tool)

一个为《Sky光·遇》玩家制作的身高查看工具。
A height checker tool made for players of *Sky: Children of the Light*.

所有计算都在你的浏览器上进行，不会上传任何资料，可以安心使用。
All calculations are done in your browser. No data is uploaded, so you can use it with peace of mind.

[**➡️ 点此前往网页 (Click here to visit the web tool)**](https://sky.ezulag.cc.cd/)

---
## 该版本的修改
 该版本使用蓝色大肥鱼结合我的一点想法 将原本的每个语言一个html合并为一个HTML 优化了架构
 添加了对移动版的支持
 添加了简体中文
 优化了界面的布局 给身高显示添加了进度条

## 如何使用

1.  在国际服游戏中，前往 **设置 > 账号 > 账号信息 > 造型 QR code**。
    在国服游戏中 ，前往 **设置 > 更多 >  线下活动二维码
2.  将该画面**截图**。（请注意：并非加好友用的 QR Code/二维码）
3.  取得截图后，请选择以下其中一种方式：

    **方法一：直接上传截图**
    * 点击「选择图片」按钮，或直接将截图文件拖拽至上传区域。

    **方法二：粘贴网址**
    * 使用扫码工具读取截图，将取得的 `https://sky.thatg.co/o=` 开头网址，完整复制并粘贴到工具的输入框。

    **方法三：从剪贴板粘贴图片**
    * 截图后直接按 `Ctrl+V`（macOS 为 `Cmd+V`），或点击「粘贴图片」按钮。

## How to Use

1.  In the game, go to **Settings > Account > Account Info > Outfit QR Code**.
2.  **Take a screenshot** of the QR Code. (Note: NOT the friend invite QR code)
3.  Choose one of the following methods:

    **Method 1: Upload Screenshot**
    * Click "Select Image" or drag and drop your screenshot into the upload area.

    **Method 2: Paste URL**
    * Use a scanner to read the screenshot. Copy the URL starting with `https://sky.thatg.co/o=` and paste it into the tool's input box.

    **Method 3: Paste from Clipboard**
    * After taking a screenshot, press `Ctrl+V` (or `Cmd+V` on macOS), or click "Paste Image".

---

## 🐳 开发协助 / Development Assistance

<a href="https://www.deepseek.com" target="_blank">
    <img src="https://img.shields.io/badge/Assisted%20by-DeepSeek%20%F0%9F%90%B3-1E6FFF?style=for-the-badge" alt="Assisted by DeepSeek">
</a>

本项目的界面调整、简体中文支持、身高进度条与历史记录功能，由 **DeepSeek（蓝色大肥鱼 🐳）** 协助完成。

Interface refinements, Simplified Chinese support, the height progress bar and history features were built with the help of **DeepSeek (the blue whale 🐳)**.

本分支由 **EzualG** 维护 · [个人主页](https://ezualg.cc.cd)

Maintained by **EzualG** · [Homepage](https://ezualg.cc.cd)

---

## 部署注意 / Deployment Note

修改 `css/` 或 `js/` 后，请同步更新 `index.html` 与 `css/style.css` 中的 `?v=` 版本号（目前为 `1.0.0`），否则 CDN（Cloudflare）可能继续向用户返回旧缓存文件。

After changing `css/` or `js/`, bump the `?v=` version in `index.html` and `css/style.css` (currently `1.0.0`), otherwise the CDN may keep serving stale cached files.
