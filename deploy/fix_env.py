#!/usr/bin/env python3
import re

with open('/var/www/atlasuniversalis.com/.env', 'r') as f:
    content = f.read()

# Fix ALLOWED_ORIGINS
content = re.sub(
    r"ALLOWED_ORIGINS=.*",
    'ALLOWED_ORIGINS=["https://atlasuniversalis.com","https://www.atlasuniversalis.com","https://apply.atlasuniversalis.com"]',
    content
)

with open('/var/www/atlasuniversalis.com/.env', 'w') as f:
    f.write(content)

print("Fixed ALLOWED_ORIGINS!")
