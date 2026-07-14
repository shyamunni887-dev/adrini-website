import re

with open('index.html', 'r') as f:
    html = f.read()

# We need to extract the Meta Pixel and GA4 blocks and put them in a delayed loader function.
# Let's just find the Meta Pixel block and GA4 block.
# Actually, the user says "without affecting Meta Pixel event tracking". If we delay it, it MIGHT affect tracking.
# A safe way is to move them to the end of the body or leave them async. They are already async.
# I'll just move the Meta Pixel and GA4 to just before </body> to ensure they don't block the head parser.
pass
