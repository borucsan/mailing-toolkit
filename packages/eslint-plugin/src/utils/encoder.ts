import regenerate from "regenerate";
import { encodeMap } from "./encodeMap";
import { regexEncodeNonAscii } from "./nonAsciiRegex";

const regexEscape = /["&'<>`]/g;

var object = {};
var hasOwnProperty = object.hasOwnProperty;

const has = function(object: any, propertyName: any) {
    return hasOwnProperty.call(object, propertyName);
};

const hexEscape = function (codePoint: number) {
  return "&#x" + codePoint.toString(16).toUpperCase() + ";";
};

const decEscape = function (codePoint: number) {
  return "&#" + codePoint + ";";
};

export const regexAstralSymbol = regenerate()
  .addRange(0x010000, 0x10ffff)
  .toRegExp();

export const regexAsciiWhitelist = regenerate()
  // Add all ASCII symbols (not just printable ASCII).
  .addRange(0x0, 0x7f)
  // Remove code points listed in the first column of the overrides table.
  // https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides
  .remove([
    0, 128, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 142, 145,
    146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 158, 159,
  ])
  .toRegExp();

export const regexBmpWhitelist = regenerate()
  // Add all BMP symbols.
  .addRange(0x0, 0xffff)
  // Remove ASCII newlines.
  .remove("\r", "\n")
  // Remove printable ASCII symbols.
  .removeRange(0x20, 0x7e)
  // Remove code points listed in the first column of the overrides table.
  // https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides
  .remove([
    0, 128, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 142, 145,
    146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 158, 159,
  ])
  .remove([
    211, 260, 261, 262, 263, 280, 281, 322, 321, 324, 323, 243, 347, 346,
    377, 378, 380, 379,
  ])
  .toString({ bmpOnly: true });

/**
 * Part of he library
 * @param string
 * @param options
 * @returns string
 */
export const encode = (
  string: string,
  options: {
    useNamedReferences?: boolean;
    encodeEverything?: boolean;
    allowUnsafeSymbols?: boolean;
    decimal?: boolean;
  } = {useNamedReferences: true, encodeEverything: false, allowUnsafeSymbols: false, decimal: false}
) => {
  var encodeEverything = options.encodeEverything ?? false;
  var useNamedReferences = options.useNamedReferences ?? false;
  var allowUnsafeSymbols = options.allowUnsafeSymbols ?? false;
  var escapeCodePoint = options.decimal ? decEscape : hexEscape;

  var escapeBmpSymbol = function (symbol: string) {
    return escapeCodePoint(symbol.charCodeAt(0));
  };

  if (encodeEverything) {
    // Encode ASCII symbols.
    string = string.replace(regexAsciiWhitelist, function (symbol) {
      // Use named references if requested & possible.
      if (useNamedReferences && has(encodeMap, symbol)) {
        return "&" + encodeMap[symbol] + ";";
      }
      return escapeBmpSymbol(symbol);
    });
    // Shorten a few escapes that represent two symbols, of which at least one
    // is within the ASCII range.
    if (useNamedReferences) {
      string = string
        .replace(/&gt;\u20D2/g, "&nvgt;")
        .replace(/&lt;\u20D2/g, "&nvlt;")
        .replace(/&#x66;&#x6A;/g, "&fjlig;");
    }
    
    // Encode non-ASCII symbols.
    if (useNamedReferences) {
      // Encode non-ASCII symbols that can be replaced with a named reference.
      string = string.replace(regexEncodeNonAscii, function (string) {
        // Note: there is no need to check `has(encodeMap, string)` here.
        return "&" + encodeMap[string] + ";";
      });
    }
    // Note: any remaining non-ASCII symbols are handled outside of the `if`.
  } else if (useNamedReferences) {
    console.debug(useNamedReferences);
    // Apply named character references.
    // Encode `<>"'&` using named character references.
    if (!allowUnsafeSymbols) {
      string = string.replace(regexEscape, function (string) {
        return "&" + encodeMap[string] + ";"; // no need to check `has()` here
      });
    }
    // Shorten escapes that represent two symbols, of which at least one is
    // `<>"'&`.
    string = string
      .replace(/&gt;\u20D2/g, "&nvgt;")
      .replace(/&lt;\u20D2/g, "&nvlt;");
    // Encode non-ASCII symbols that can be replaced with a named reference.
    string = string.replace(new RegExp(regexEncodeNonAscii), (string) => {
        
      // Note: there is no need to check `has(encodeMap, string)` here.
      return "&" + encodeMap[string] + ";";
    });
  } else if (!allowUnsafeSymbols) {
    // Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
    // using named character references.
    string = string.replace(regexEscape, escapeBmpSymbol);
  }
  return (
    string
      // Encode astral symbols.
      .replace(regexAstralSymbol, function ($0) {
        // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var high = $0.charCodeAt(0);
        var low = $0.charCodeAt(1);
        var codePoint = (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000;
        return escapeCodePoint(codePoint);
      })
      // Encode any remaining BMP symbols that are not printable ASCII symbols
      // using a hexadecimal escape.
      .replace(new RegExp(regexBmpWhitelist), escapeBmpSymbol)
  );
};
