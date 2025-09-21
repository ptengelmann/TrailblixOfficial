#!/bin/bash

# Fix apostrophes in all files
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/don't/don\\'t/g" {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/couldn't/couldn\\'t/g" {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/you're/you\\'re/g" {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/it's/it\\'s/g" {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/What's/What\\'s/g" {} +

# Remove unused imports
# This requires manual fixing - just comment them out for now

echo "Lint fixes applied! Review changes and commit."