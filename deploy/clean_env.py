#!/usr/bin/env python3
"""Clean up .env file and fix ALLOWED_ORIGINS"""

env_path = '/var/www/atlasuniversalis.com/.env'

with open(env_path, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Remove any leading/trailing quotes or weird characters
    line = line.strip()
    if line.startswith("'"):
        line = line[1:]
    
    # Skip lines that are just the allowed_origins value - we'll add it fresh
    if line.startswith('ALLOWED_ORIGINS'):
        continue
    
    new_lines.append(line)

# Add the correct ALLOWED_ORIGINS
new_lines.append('ALLOWED_ORIGINS=["https://atlasuniversalis.com","https://www.atlasuniversalis.com","https://apply.atlasuniversalis.com"]')

with open(env_path, 'w') as f:
    f.write('\n'.join(new_lines) + '\n')

print("Cleaned up .env!")
