/**
 * 入力値の正規化を行うクラス
 */
export class Normalizer {
    /**
     * 全角数字を半角に変換
     * @param value 変換する値
     * @returns 変換後の値
     */
    static normalizeNumber(value: string): string {
        return value
            .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
            .replace(/[ー－—―]/g, '-')
            .replace(/[．。]/g, '.');
    }

    /**
     * 全角英字を半角に変換
     * @param value 変換する値
     * @returns 変換後の値
     */
    static normalizeAlphabet(value: string): string {
        return value.replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
    }

    /**
     * 全角英数字を半角に変換
     * @param value 変換する値
     * @returns 変換後の値
     */
    static normalizeAlphanumeric(value: string): string {
        return this.normalizeNumber(this.normalizeAlphabet(value));
    }

    /**
     * 全角スペースを半角に変換
     * @param value 変換する値
     * @returns 変換後の値
     */
    static normalizeSpace(value: string): string {
        return value.replace(/　/g, ' ');
    }

    /**
     * 全角記号を半角に変換
     * @param value 変換する値
     * @returns 変換後の値
     */
    static normalizeSymbols(value: string): string {
        const symbolMap: { [key: string]: string } = {
            '！': '!', '＂': '"', '＃': '#', '＄': '$', '％': '%',
            '＆': '&', '＇': "'", '（': '(', '）': ')', '＊': '*',
            '＋': '+', '，': ',', '－': '-', '．': '.', '／': '/',
            '：': ':', '；': ';', '＜': '<', '＝': '=', '＞': '>',
            '？': '?', '＠': '@', '［': '[', '＼': '\\', '］': ']',
            '＾': '^', '＿': '_', '｀': '`', '｛': '{', '｜': '|',
            '｝': '}', '～': '~'
        };

        return value.replace(/[！-～]/g, (char) => symbolMap[char] || char);
    }

    /**
     * 半角カナを全角カナに変換
     * @param value 変換する値
     * @returns 変換後の値
     */
    static normalizeKana(value: string): string {
        const kanaMap: { [key: string]: string } = {
            'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
            'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
            'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
            'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
            'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
            'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
            'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
            'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
            'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
            'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
            'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
            'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
            'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
            'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
            'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
            'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
            'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
            'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ', 'ｯ': 'ッ',
            'ｰ': 'ー', '｡': '。', '｢': '「', '｣': '」', '､': '、', '･': '・'
        };

        // 濁点・半濁点の結合処理
        value = value.replace(/ｶﾞ|ｷﾞ|ｸﾞ|ｹﾞ|ｺﾞ|ｻﾞ|ｼﾞ|ｽﾞ|ｾﾞ|ｿﾞ|ﾀﾞ|ﾁﾞ|ﾂﾞ|ﾃﾞ|ﾄﾞ|ﾊﾞ|ﾋﾞ|ﾌﾞ|ﾍﾞ|ﾎﾞ|ﾊﾟ|ﾋﾟ|ﾌﾟ|ﾍﾟ|ﾎﾟ|ｳﾞ|ﾜﾞ|ｦﾞ/g, (match) => kanaMap[match] || match);

        // 通常の半角カナ変換
        return value.replace(/[ｦ-ﾟ]/g, (char) => kanaMap[char] || char);
    }

    /**
     * トリミング（前後の空白を削除）
     * @param value トリミングする値
     * @returns トリミング後の値
     */
    static trim(value: string): string {
        return value.trim().replace(/^[\s　]+|[\s　]+$/g, '');
    }

    /**
     * 連続する空白を1つに正規化
     * @param value 正規化する値
     * @returns 正規化後の値
     */
    static normalizeWhitespace(value: string): string {
        return value.replace(/[\s　]+/g, ' ');
    }

    /**
     * 電話番号の正規化
     * @param value 電話番号
     * @returns 正規化後の電話番号
     */
    static normalizeTel(value: string): string {
        // 全角を半角に変換
        value = this.normalizeAlphanumeric(value);
        // 記号を統一
        value = this.normalizeSymbols(value);
        // 空白を削除
        value = value.replace(/[\s　]/g, '');
        
        return value;
    }

    /**
     * 郵便番号の正規化
     * @param value 郵便番号
     * @returns 正規化後の郵便番号
     */
    static normalizePostalCode(value: string): string {
        // 全角を半角に変換
        value = this.normalizeNumber(value);
        // 記号を統一
        value = this.normalizeSymbols(value);
        // 空白を削除
        value = value.replace(/[\s　]/g, '');
        
        return value;
    }

    /**
     * メールアドレスの正規化
     * @param value メールアドレス
     * @returns 正規化後のメールアドレス
     */
    static normalizeEmail(value: string): string {
        // 全角英数字を半角に変換
        value = this.normalizeAlphanumeric(value);
        // 記号を半角に変換
        value = this.normalizeSymbols(value);
        // 前後の空白を削除
        value = this.trim(value);
        // 小文字に統一
        value = value.toLowerCase();
        
        return value;
    }
}
