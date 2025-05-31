# 除外エリア機能 (data-validate-hidden)

FormValidatorに実装された除外エリア機能により、特定のフォーム要素をバリデーション対象から動的に除外できます。

## 機能概要

`data-validate-hidden` 属性を持つ要素で囲まれた範囲内のフィールドは、以下の条件から除外されます：

- **必須項目のカウント** (`count: true`)
- **送信ボタンの活性制御** (`disableSubmitUntilValid: true`)

## 使用方法

### 1. エリア全体を除外

```html
<div data-validate-hidden>
    <input type="text" name="company" data-validate="required">
    <input type="text" name="department" data-validate="required">
    <!-- この範囲内の必須項目は除外される -->
</div>
```

### 2. 個別フィールドを除外

```html
<input type="text" name="address" data-validate="required" data-validate-hidden>
```

### 3. ネスト構造での除外

```html
<div data-validate-hidden>
    <div class="form-group">
        <input type="text" name="nested-field" data-validate="required">
        <!-- 親要素に data-validate-hidden があるため除外される -->
    </div>
</div>
```

## 動的な切り替え

JavaScript で動的に除外状態を切り替えることができます：

```javascript
const formManager = FormValidator.init({
    count: true,
    disableSubmitUntilValid: true
});

function toggleExcludeArea() {
    const area = document.getElementById('excludeArea');
    
    if (area.hasAttribute('data-validate-hidden')) {
        // バリデーション対象に含める
        area.removeAttribute('data-validate-hidden');
    } else {
        // バリデーション対象から除外
        area.setAttribute('data-validate-hidden', '');
    }
    
    // カウントを手動で更新
    formManager.updateValidationCount();
}
```

## 適用対象

この機能は以下のバリデーション要素に適用されます：

- 通常のフィールド (`data-validate="required"`)
- グループバリデーション (`data-check_validate`, `data-radio_validate`, `data-select_validate`)

## 実装例

### 基本的な使用例

```html
<form id="testForm">
    <!-- 通常の必須項目 -->
    <input type="text" name="name" data-validate="required">
    
    <!-- 除外エリア -->
    <div data-validate-hidden>
        <input type="text" name="company" data-validate="required">
        <div data-check_validate="required">
            <input type="checkbox" name="services[]" value="service1">
            <input type="checkbox" name="services[]" value="service2">
        </div>
    </div>
    
    <button type="submit">送信</button>
</form>

<script>
FormValidator.init({
    count: true,
    disableSubmitUntilValid: true
});
</script>
```

### 切り替えボタン付きの例

```html
<button onclick="toggleArea()">除外エリアの切り替え</button>

<div id="toggleArea" data-validate-hidden>
    <input type="text" name="optional-field" data-validate="required">
</div>

<script>
function toggleArea() {
    const area = document.getElementById('toggleArea');
    const formManager = FormValidator.getInstance();
    
    if (area.hasAttribute('data-validate-hidden')) {
        area.removeAttribute('data-validate-hidden');
        console.log('バリデーション対象に含めました');
    } else {
        area.setAttribute('data-validate-hidden', '');
        console.log('バリデーション対象から除外しました');
    }
    
    formManager.updateValidationCount();
}
</script>
```

## API Reference

### FormManager.updateValidationCount()

除外エリアの状態を動的に変更した後、カウント表示と送信ボタンの状態を手動で更新します。

```javascript
const formManager = FormValidator.getInstance();
formManager.updateValidationCount();
```

## 使用例ファイル

プロジェクトには以下のサンプルファイルが含まれています：

- `examples/test-exclude-area.html` - 除外エリア機能の基本テスト
- `examples/test-all-patterns-exclude.html` - 全パターン + 除外エリア機能

## 注意事項

1. **動的切り替え後の更新**: `data-validate-hidden` 属性を動的に追加/削除した場合は、必ず `updateValidationCount()` を呼び出してください。

2. **ネスト構造**: 除外エリア内にさらに除外エリアがある場合、内側の要素も除外されます。

3. **エラー表示の自動クリア**: 除外エリアが有効になった時、そのエリア内のフィールドのエラー表示は自動的にクリアされます。

4. **バリデーション実行**: 除外されたフィールドは必須項目のカウントから除外され、バリデーションも実行されません。

5. **初期化時の処理**: 除外エリア内のフィールドは初期化時から有効な状態として扱われます。

## ビルドと使用

```bash
# プロジェクトをビルド
npm run build

# 生成されたファイルを使用
<script src="dist/FormValidator.js"></script>
```

ビルド後、`examples/test-exclude-area.html` をブラウザで開いて機能をテストできます。
