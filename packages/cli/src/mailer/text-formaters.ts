import { FormatCallback } from "html-to-text";

export const formatImageAlt: FormatCallback = (elem, _walk, builder) => {
    const attribs = elem.attribs || {};
    const alt = (attribs.alt)
      ? attribs.alt
      : '';
    const text = alt;
    builder.addInline(text, { noWordTransform: true });
  }
export const formatListSection: FormatCallback = (elem, walk, builder, formatOptions) => {
    const prefix = formatOptions.itemPrefix || ' - ';
    const isNestedList = true;
    const nextPrefixCallback = () => prefix;
    let maxPrefixLength = 0;
    const children = (elem.children || [])
    .filter(child => (child.type !== 'text' || !/^\s*$/.test(child.data ?? "")))
    .filter(child => {
        if (child.name !== 'tr' && child.name !== 'td') {
            return true;
        }
        let tds = child.name === "tr" ? child.children.filter(sub => (sub.type !== 'text' || !/^\s*$/.test(sub.data ?? ""))) : [child];
        return !tds.every(td => td.children.filter(sub => (sub.type !== 'text' || !/^\s*$/.test(sub.data ?? ""))).every(sub => sub.name === 'img'));

    })
    .map((child) => {
        if (child.name !== 'tr' && child.name !== 'td') {
            return { node: child, prefix: '' };
        }
      const prefix = (isNestedList)
        ? nextPrefixCallback().trimStart()
        : nextPrefixCallback();
      if (prefix.length > maxPrefixLength) { maxPrefixLength = prefix.length; }
      return { node: child, prefix: prefix };
    });
    builder.openList({
        interRowLineBreaks: 1,
        prefixAlign: 'left'
    });

    for (const { node, prefix } of children) {
        builder.openListItem({ prefix: prefix });
        walk([node], builder);
        builder.closeListItem();
      }
      builder.closeList({ trailingLineBreaks: isNestedList ? 1 : (formatOptions.trailingLineBreaks || 2) });
  }