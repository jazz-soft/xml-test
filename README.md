# xml-test
Testing browser-native XML functions (using Playwright)

## Command line:

`node test` - run all tests from `tests.json` in `chromium`/`firefox`/`webkit`

`node test msedge` - run all tests in specified browser(s)

`node test xpath` - run test group(s) from `tests.json`

`node test xpath/local-name-wildcard` - run individual test(s) from `tests.json`

`node test xml/unicode-tag-chinese chrome` - run individual test(s) in specified browser(s)

`node test data1.xml data2.xml` - test XML file(s)

`node test query1.xpath query2.xpath` - test XPath expression(s)

`node test data1.xml data2.xml query1.xpath query2.xpath` - test XPath expression(s) vs XML file(s)

`node test --xpath "/*"` - input XPath expression(s) directly in the command line

etc...

## Results:
<table>
<tr><th>❌ chromium</th><th>✅ chromium</th><th>❌ firefox</th><th>✅ firefox</th><th>❌ webkit</th><th>✅ webkit</th></tr>
<tr><td colspan="6">DOMParser / XMLSerializer: Unicode characters in the tag name (4E00-9FFF)</td></tr>
<tr><td></td><td>✅ 131.0</td><td></td><td>✅ 132.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">DOMParser / XMLSerializer: Unicode characters in the tag name (1780-17FF)</td></tr>
<tr><td></td><td>✅ 131.0</td><td>❌ 134.0</td><td></td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">DOMParser / XMLSerializer: Unicode characters in the attribute name (4E00-9FFF)</td></tr>
<tr><td></td><td>✅ 131.0</td><td></td><td>✅ 132.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">DOMParser / XMLSerializer: Unicode characters in the attribute name (1780-17FF)</td></tr>
<tr><td></td><td>✅ 131.0</td><td>❌ 134.0</td><td></td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">DOMParser / XMLSerializer: Unicode characters in the text node (4E00-9FFF)</td></tr>
<tr><td></td><td>✅ 131.0</td><td></td><td>✅ 132.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">DOMParser / XMLSerializer: Unicode characters in the text node (1780-17FF)</td></tr>
<tr><td></td><td>✅ 131.0</td><td></td><td>✅ 132.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">DOMParser / XMLSerializer: Unicode characters in the attribute value (4E00-9FFF)</td></tr>
<tr><td></td><td>✅ 131.0</td><td></td><td>✅ 132.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">DOMParser / XMLSerializer: Unicode characters in the attribute value (1780-17FF)</td></tr>
<tr><td></td><td>✅ 131.0</td><td></td><td>✅ 132.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">Evaluate XPath expression: Simple math expression</td></tr>
<tr><td></td><td>✅ 131.0</td><td></td><td>✅ 132.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">Evaluate XPath expression: Simple boolean expression</td></tr>
<tr><td></td><td>✅ 131.0</td><td></td><td>✅ 132.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">Evaluate XPath expression: local-name(dummy)</td></tr>
<tr><td>❌ 133.0</td><td></td><td></td><td>✅ 134.0</td><td>❌ 18.2</td><td></td></tr>
<tr><td colspan="6">Evaluate XPath expression: local-name(/dummy)</td></tr>
<tr><td>❌ 133.0</td><td></td><td></td><td>✅ 134.0</td><td>❌ 18.2</td><td></td></tr>
<tr><td colspan="6">Evaluate XPath expression: local-name(*)</td></tr>
<tr><td></td><td>✅ 133.0</td><td></td><td>✅ 134.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">Evaluate XPath expression: local-name(/*)</td></tr>
<tr><td></td><td>✅ 133.0</td><td></td><td>✅ 134.0</td><td></td><td>✅ 18.2</td></tr>
<tr><td colspan="6">Evaluate XPath expression: local-name(/*:dummy)</td></tr>
<tr><td>❌ 133.0</td><td></td><td>❌ 134.0</td><td></td><td>❌ 18.2</td><td></td></tr>
</table>
to be continued...