import re
import os

with open('app_logic.php', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'<script type="text/babel">(.*?)</script>', content, re.DOTALL)
if match:
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(match.group(1))
    print("Extracted to app.js")
else:
    print("No match found")
