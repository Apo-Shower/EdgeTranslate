/**
 * Transform xhtml source into Javascript function.
 *
 * @param {String} source xhtml source
 */
module.exports = function (source) {
    // process the template in advance
    let template = source.toString().replace(/\n+|\s{2,}|\r+/g, " ");

    // 匹配模板中的待填充部分
    const CONTENT_REGEX = /<%\s*(.*?)\s*%>/g;

    // 匹配空白串
    const SPACE_REGEX = /^(\s+)$/g;

    // 匹配模板中的逻辑表达式
    const EXPRESSION_REGEX = /(if|while|for)\s*\(.+\)\s*\{|else(\s+if\s*\(.+\))?\s*\{|}/;

    // 上次匹配结束后剩余子串在template中的起始位置
    let lastIndex = 0;
    let code = ["let result = new Array();"];
    let match;

    // 依次匹配所有待填充项
    while ((match = CONTENT_REGEX.exec(template))) {
        // 从当前剩余子串的起始位置到本次匹配到的待填充项的起始位置之间的部分，若不是空白串，直接保留。
        if (match.index > lastIndex) {
            let str = template.substring(lastIndex, match.index);
            if (!SPACE_REGEX.test(str)) {
                code.push(`result.push('${str}');`);
            }
        }

        let expression = match[1];
        // 如果是逻辑表达式，将其作为一行代码插入到渲染函数中。
        if (EXPRESSION_REGEX.test(expression)) {
            code.push(expression);
        } else {
            // 如果是一个变量，获取它的值用于填充它所在的位置
            code.push(`result.push(${expression});`);
        }

        lastIndex = match.index + match[0].length;
    }

    // 处理模板末尾的非待填充文本。
    if (lastIndex < template.length - 1) {
        code.push(`result.push('${template.substring(lastIndex, template.length)}');`);
    }

    code.push("return result.join('');");

    return `export default function() {${code.join("").replace(/\n|\r/g, "")}}`;
};
