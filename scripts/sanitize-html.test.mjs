import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeRichHtml } from '../lib/runtime.js';

const ALLOWED_TAGS = 'a|blockquote|br|em|h2|h3|h4|img|li|ol|p|strong|ul';
const ATTR = '(?:alt|title|href|src)="[^"<>]*"';
const CANONICAL_TAG = new RegExp(`^<(?:/(?:${ALLOWED_TAGS})|(?:${ALLOWED_TAGS})(?: ${ATTR})*(?: /)?)>$`);
const SAFE_URL = /^(?:https?:|mailto:|tel:|\/|#|\?|[^:]*$)/i;

function decodeAttribute(value) {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

/**
 * Parser-independent check of the sanitiser's canonical output: every tag must be an
 * allowlisted tag with only allowlisted, double-quoted attributes, no raw < or > may
 * appear in text, and every href/src must resolve to a safe scheme. A browser can
 * build nothing executable from markup of this shape, whatever the input was.
 */
function assertInert(output, label) {
  const tags = output.match(/<[^>]*>/g) ?? [];
  for (const tag of tags) assert.match(tag, CANONICAL_TAG, `${label}: non-canonical tag ${tag} in ${output}`);
  const text = output.replace(/<[^>]*>/g, '');
  assert.equal(/[<>]/.test(text), false, `${label}: raw angle bracket in text -> ${output}`);
  for (const [, , value] of output.matchAll(/ (href|src)="([^"]*)"/g)) {
    // Browsers ignore ASCII whitespace/control characters inside a scheme.
    const url = decodeAttribute(value).replace(/[\u0000-\u0020\u007f]/g, '');
    assert.match(url, SAFE_URL, `${label}: unsafe URL ${value} in ${output}`);
  }
}

const PAYLOADS = {
  'slash-separated onerror (the reported bypass)': '<img src="x"/onerror=alert(1)>',
  'unquoted slash onerror': '<img src=x/onerror=alert(1)>',
  'tab separator': '<img\tsrc="https://cdn.shopify.com/a.jpg"\tonerror="alert(1)">',
  'newline separator': '<img\nsrc="https://cdn.shopify.com/a.jpg"\nonerror="alert(1)">',
  'form-feed separator': '<img\fsrc=x\fonerror=alert(1)>',
  'mixed case handler': '<p OnMouseOver="alert(1)">x</p>',
  'javascript href': '<a href="javascript:alert(1)">x</a>',
  'mixed case javascript href': '<a href="JaVaScRiPt:alert(1)">x</a>',
  'leading whitespace javascript href': '<a href="  javascript:alert(1)">x</a>',
  'tab inside scheme': '<a href="java\tscript:alert(1)">x</a>',
  'newline inside scheme': '<a href="java\nscript:alert(1)">x</a>',
  'entity-encoded tab inside scheme': '<a href="jav&#x09;ascript:alert(1)">x</a>',
  'decimal entity-encoded scheme': '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">x</a>',
  'hex entity-encoded scheme no semicolons': '<a href="&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A;alert(1)">x</a>',
  'named entity colon': '<a href="javascript&colon;alert(1)">x</a>',
  'vbscript href': '<a href="vbscript:msgbox(1)">x</a>',
  'data html href': '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
  'data svg img': '<img src="data:image/svg+xml,<svg onload=alert(1)>">',
  'svg onload': '<svg onload=alert(1)><circle /></svg>',
  'svg script': '<svg><script>alert(1)</script></svg>',
  'svg foreignObject': '<svg><foreignObject><img src=x onerror=alert(1)></foreignObject></svg>',
  'svg animate href': '<svg><a><animate attributeName=href values=javascript:alert(1) /><text>x</text></a></svg>',
  'math mxss': '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
  'math href': '<math href="javascript:alert(1)">x</math>',
  'script tag': '<script>alert(1)</script><p>after</p>',
  'unterminated script': '<p>a</p><script>alert(1)',
  'nested script split': '<scr<script>ipt>alert(1)</scr</script>ipt>',
  'double open bracket': '<<script>script>alert(1)<</script>/script>',
  'iframe srcdoc': '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  'iframe javascript': '<iframe src="javascript:alert(1)"></iframe>',
  'object data': '<object data="javascript:alert(1)"></object>',
  'embed': '<embed src="javascript:alert(1)">',
  'form action': '<form action="javascript:alert(1)"><button>x</button></form>',
  'base href hijack': '<base href="https://evil.example/">',
  'meta refresh': '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
  'style tag': '<style>@import "https://evil.example/x.css";</style>',
  'style attribute': '<p style="background:url(javascript:alert(1))">x</p>',
  'comment-wrapped payload': '<!--><img src=x onerror=alert(1)>-->',
  'conditional comment': '<!--[if gte IE 4]><script>alert(1)</script><![endif]-->',
  'cdata': '<![CDATA[<img src=x onerror=alert(1)>]]>',
  'noscript mxss': '<noscript><p title="</noscript><img src=x onerror=alert(1)>"></noscript>',
  'title attribute breakout': '<p title="&quot;><img src=x onerror=alert(1)>">x</p>',
  'unclosed attribute quote': '<a href="https://ok.example/ onmouseover=alert(1) x=">x</a>',
  'malformed nesting': '<p><strong><em>x</p></strong><img src=x onerror=alert(1)<p>',
  'template': '<template><img src=x onerror=alert(1)></template>',
  'textarea breakout': '<textarea></textarea><img src=x onerror=alert(1)></textarea>',
  'xmp': '<xmp><img src=x onerror=alert(1)></xmp>',
  'null byte in tag': '<img src=x o\u0000nerror=alert(1)>',
  'details ontoggle': '<details open ontoggle=alert(1)>x</details>',
};

for (const [label, payload] of Object.entries(PAYLOADS)) {
  test(`sanitizer neutralises: ${label}`, () => {
    const output = sanitizeRichHtml(payload);
    assertInert(output, label);
    // Re-sanitising is stable (no mutation-XSS through a second parse).
    assert.equal(sanitizeRichHtml(output), output, `${label}: output not stable on re-sanitise`);
  });
}

test('normal Shopify rich text survives intact', () => {
  const input = [
    '<h2>Drop 03</h2>',
    '<h3>Specs</h3>',
    '<h4>Care</h4>',
    '<p>Made in <strong>Beirut</strong>, finished in <em>Paris</em>.<br>Second line.</p>',
    '<ul><li>Heavy cotton</li><li>Hand-printed</li></ul>',
    '<ol><li>One</li><li>Two</li></ol>',
    '<blockquote>Born from revolt.</blockquote>',
    '<p><a href="https://www.lapropagande.net/products/eyes" title="Eyes">Eyes jacket</a></p>',
    '<p><a href="mailto:lapropagandeparisbey@outlook.com">mail</a> <a href="tel:+9611234567">call</a> <a href="/locations">locations</a></p>',
    '<p><img src="https://cdn.shopify.com/s/files/1/x.jpg" alt="Jacket back"></p>',
  ].join('');
  const output = sanitizeRichHtml(input);
  for (const fragment of [
    '<h2>Drop 03</h2>',
    '<h3>Specs</h3>',
    '<h4>Care</h4>',
    '<strong>Beirut</strong>',
    '<em>Paris</em>',
    '<br />',
    '<ul><li>Heavy cotton</li><li>Hand-printed</li></ul>',
    '<ol><li>One</li><li>Two</li></ol>',
    '<blockquote>Born from revolt.</blockquote>',
    '<a href="https://www.lapropagande.net/products/eyes" title="Eyes">Eyes jacket</a>',
    '<a href="mailto:lapropagandeparisbey@outlook.com">mail</a>',
    '<a href="tel:+9611234567">call</a>',
    '<a href="/locations">locations</a>',
    '<img src="https://cdn.shopify.com/s/files/1/x.jpg" alt="Jacket back" />',
  ]) {
    assert.ok(output.includes(fragment), `missing ${fragment} in ${output}`);
  }
});

test('disallowed wrappers are dropped but their text is kept and escaped', () => {
  assert.equal(sanitizeRichHtml('<div class="x"><span style="color:red">Hello</span> &lt;b&gt;</div>'), 'Hello &lt;b&gt;');
  assert.equal(sanitizeRichHtml('<p id="x" class="y" data-x="1">t</p>'), '<p>t</p>');
  assert.equal(sanitizeRichHtml('<p href="https://x.example">t</p>'), '<p>t</p>', 'href only allowed on <a>');
  assert.equal(sanitizeRichHtml('<a src="https://x.example/a.png">t</a>'), '<a>t</a>', 'src only allowed on <img>');
  assert.equal(sanitizeRichHtml(''), '');
  assert.equal(sanitizeRichHtml(null), '');
  assert.equal(sanitizeRichHtml(undefined), '');
});
