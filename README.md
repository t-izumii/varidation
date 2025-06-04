# Varidation

**Form validation library for Japanese web applications with accessibility support**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)

Varidationは、日本のWebアプリケーションに特化したフォームバリデーションライブラリです。アクセシビリティサポート、日本語特有のバリデーション（ひらがな、カタカナ、郵便番号、電話番号）、豊富なカスタマイズオプションを提供します。

## ✨ 特徴

- 🇯🇵 **日本語対応**: ひらがな、カタカナ、郵便番号、電話番号の日本固有のバリデーション
- ♿ **アクセシビリティ**: WAI-ARIA準拠、スクリーンリーダー対応
- 🎨 **柔軟なUI**: CSS完全制御、アニメーション自由度
- 📱 **レスポンシブ**: モバイル・デスクトップ対応
- 🔧 **高いカスタマイズ性**: カスタムバリデーター、条件付きバリデーション
- 🚀 **軽量・高性能**: デバウンス処理、効率的なDOM操作
- 📦 **TypeScript対応**: 完全な型サポート

## 🚀 クイックスタート

### セットアップ

FormValidator.jsファイルをHTMLに読み込んでください：

```html
<script src="path/to/FormValidator.js"></script>
```

### 基本的な使い方

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Varidation Example</title>
</head>
<body>
    <form id="contactForm">
        <!-- 名前（必須） -->
        <div>
            <label for="name">お名前</label>
            <input type="text" id="name" name="name" data-validate="required,name">
            <div class="error-text" data-text="error"></div>
        </div>

        <!-- メールアドレス（必須） -->
        <div>
            <label for="email">メールアドレス</label>
            <input type="email" id="email" name="email" data-validate="required,email">
            <div class="error-text" data-text="error"></div>
        </div>

        <!-- 電話番号（必須、ハイフンなし） -->
        <div>
            <label for="tel">電話番号</label>
            <input type="text" id="tel" name="tel" data-validate="required,tel">
            <div class="error-text" data-text="error"></div>
        </div>

        <button type="submit">送信</button>
    </form>

    <script>
        FormValidator.init({
            validationOptions: {
                tel: {
                    allowHyphens: false  // ハイフンなしの電話番号のみ許可
                }
            },
            count: true,
            disableSubmitUntilValid: true
        });
    </script>
</body>
</html>
```

## 📚 バリデーションルール

### 基本ルール

| ルール | 説明 | 例 |
|--------|------|-----|
| `required` | 必須入力 | `data-validate="required"` |
| `email` | メールアドレス形式 | `data-validate="required,email"` |
| `tel` | 電話番号形式 | `data-validate="required,tel"` |
| `postal-code` | 郵便番号形式 | `data-validate="required,postal-code"` |

### 日本語特化ルール

| ルール | 説明 | 例 |
|--------|------|-----|
| `hiragana` | ひらがなのみ | `data-validate="required,hiragana"` |
| `katakana` | カタカナのみ | `data-validate="required,katakana"` |
| `name` | 日本人の名前形式 | `data-validate="required,name"` |
| `furigana` | ふりがな | `data-validate="required,furigana,hiragana"` |

### 数値ルール

| ルール | 説明 | 例 |
|--------|------|-----|
| `number` | 数値（全角・半角対応） | `data-validate="required,number"` |
| `halfWidth` | 半角数字のみ | `data-validate="required,halfWidth"` |
| `replace` | 自動全角→半角変換 | `data-validate="required,number,replace"` |

### その他のルール

| ルール | 説明 | 例 |
|--------|------|-----|
| `password` | パスワード形式 | `data-validate="required,password"` |
| `text` | 一般的なテキスト | `data-validate="required,text"` |

## ⚙️ 設定オプション

### 基本設定

```javascript
FormValidator.init({
    // バリデーション動作
    validation: {
        validateOnInput: false,    // 入力中のバリデーション
        validateOnBlur: true,      // フォーカスアウト時のバリデーション
        debounceDelay: 300         // デバウンス遅延（ミリ秒）
    },
    
    // エラー表示
    errorDisplay: {
        showOnValidation: true,    // バリデーション時にエラー表示
        clearOnFocus: true         // フォーカス時にエラークリア
    },
    
    // カスタムメッセージ
    customMessages: {
        required: '必須項目です',
        email: '正しいメールアドレスを入力してください'
    },
    
    // UI制御
    count: true,                   // 残り項目数表示
    disableSubmitUntilValid: true  // バリデーション完了まで送信ボタン無効
});
```

### バリデーター個別設定

```javascript
FormValidator.init({
    validationOptions: {
        // 電話番号設定
        tel: {
            allowHyphens: false     // true: ハイフン必須, false: ハイフンなし, null: 両方許可
        },
        
        // 郵便番号設定
        postalCode: {
            allowHyphens: true      // true: 123-4567, false: 1234567, null: 両方
        }
    }
});
```

## 🎛️ 高度な機能

### グループバリデーション

```html
<!-- チェックボックスグループ -->
<div data-check_validate="required">
    <input type="checkbox" name="contact[]" value="email">メール
    <input type="checkbox" name="contact[]" value="phone">電話
    <input type="checkbox" name="contact[]" value="mail">郵送
</div>
<div class="error-text" data-text="error"></div>

<!-- ラジオボタングループ -->
<div data-radio_validate="required">
    <input type="radio" name="gender" value="male">男性
    <input type="radio" name="gender" value="female">女性
</div>
<div class="error-text" data-text="error"></div>
```

### 除外エリア（条件付きバリデーション）

```html
<!-- この領域内のフィールドはバリデーション対象外 -->
<div data-validate-hidden>
    <input type="text" name="optional" data-validate="required,email">
</div>

<script>
// 動的に除外エリアの表示/非表示を切り替え
function toggleArea() {
    const area = document.querySelector('[data-validate-hidden]');
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
    FormValidator.update(); // バリデーション状態を更新
}
</script>
```

## 🎨 CSSスタイリング

Varidationは、CSS側で完全にスタイルを制御できます：

```css
/* エラー状態のフィールド */
input.error {
    border: 2px solid #e74c3c;
    background-color: #fdf2f2;
}

/* エラーメッセージ */
.error-text {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    transition: all 0.3s ease;
}

/* エラーメッセージのアニメーション */
.error-text:empty {
    opacity: 0;
    transform: translateY(-10px);
}

.error-text:not(:empty) {
    opacity: 1;
    transform: translateY(0);
}

/* 送信ボタンの無効状態 */
button[type="submit"]:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
}
```

## 📊 イベント・コールバック

```javascript
FormValidator.init({
    // フィールドバリデーション完了時
    onFieldValidated: (data) => {
        console.log(`Field ${data.fieldId}: ${data.isValid ? 'Valid' : 'Invalid'}`);
    },
    
    // フォーム全体バリデーション完了時
    onFormValidated: (data) => {
        console.log(`Form is ${data.isValid ? 'valid' : 'invalid'}`);
    },
    
    // 残り項目数更新時
    onCountUpdated: (data) => {
        console.log(`${data.valid}/${data.total} fields completed`);
    }
});
```

## ♿ アクセシビリティ

Varidationは、アクセシビリティを重視して設計されています：

- **WAI-ARIA準拠**: `aria-invalid`、`aria-describedby`の自動設定
- **スクリーンリーダー対応**: `role="alert"`、`aria-live`でエラー読み上げ
- **キーボードナビゲーション**: フォーカス管理とタブ順序最適化
- **Motion設定対応**: `prefers-reduced-motion`でアニメーション制御

```css
/* motion設定対応 */
@media (prefers-reduced-motion: reduce) {
    .error-text {
        transition: none;
        animation: none;
    }
}
```

## 🔧 API リファレンス

### FormValidator

| メソッド | 説明 |
|----------|------|
| `FormValidator.init(options)` | ライブラリを初期化 |
| `FormValidator.update()` | バリデーション状態を手動更新 |
| `FormValidator.check()` | 全フィールドを一括バリデーション |
| `FormValidator.getInstance()` | 現在のインスタンスを取得 |

### FormManager（高度な使用）

```javascript
const manager = FormValidator.getInstance();

// フィールド状態取得
const fieldState = manager.getFieldState('email');
console.log(fieldState.isValid, fieldState.errors);

// デバッグ情報
console.log(manager.getDebugInfo());

// イベントリスナー追加
manager.on('field:validated', (data) => {
    console.log('Field validated:', data);
});
```

## 📱 実用例

### お問い合わせフォーム

```html
<form>
    <div>
        <label for="company">会社名</label>
        <input type="text" name="company" data-validate="required">
        <div class="error-text" data-text="error"></div>
    </div>
    
    <div>
        <label for="name">担当者名</label>
        <input type="text" name="name" data-validate="required,name">
        <div class="error-text" data-text="error"></div>
    </div>
    
    <div>
        <label for="furigana">ふりがな</label>
        <input type="text" name="furigana" data-validate="required,furigana,hiragana">
        <div class="error-text" data-text="error"></div>
    </div>
    
    <div>
        <label for="email">メールアドレス</label>
        <input type="email" name="email" data-validate="required,email">
        <div class="error-text" data-text="error"></div>
    </div>
    
    <div>
        <label for="tel">電話番号</label>
        <input type="text" name="tel" data-validate="required,tel">
        <div class="error-text" data-text="error"></div>
    </div>
    
    <div>
        <label for="message">お問い合わせ内容</label>
        <textarea name="message" data-validate="required,text"></textarea>
        <div class="error-text" data-text="error"></div>
    </div>
    
    <div data-check_validate="required,agree">
        <input type="checkbox" name="agree" value="1">
        <label>個人情報保護方針に同意する</label>
    </div>
    <div class="error-text" data-text="error"></div>
    
    <button type="submit">送信</button>
</form>
```

## 🛠️ 開発・ビルド

```bash
# 依存関係インストール
npm install

# 開発モード（ファイル監視）
npm run dev

# ビルド
npm run build

# 全ビルド（TypeScript型定義あり）
npm run build:with-types

# テスト実行
npm test

# クリーンアップ
npm run clean
```

## 🤝 貢献

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🔗 リンク

- [GitHub Repository](https://github.com/t-izumii/varidation)
- [Issue Tracker](https://github.com/t-izumii/varidation/issues)
- [Examples](https://github.com/t-izumii/varidation/tree/main/docs/examples)

## 📞 サポート

質問やバグ報告は [GitHub Issues](https://github.com/t-izumii/varidation/issues) でお願いします。

---

**Varidation** - Making Japanese web forms accessible and user-friendly 🇯🇵