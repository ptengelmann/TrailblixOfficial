#!/bin/bash

# Fix TypeScript error handling patterns across all files

echo "Fixing TypeScript error handling patterns..."

# Find all TypeScript/JavaScript files and fix error.message patterns
find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    if grep -q "error\.message" "$file"; then
        echo "Fixing $file..."
        # Replace patterns where error.message is used without proper type checking
        sed -i '' 's/error: error\.message/error: error instanceof Error ? error.message : "Unknown error"/g' "$file"
        sed -i '' 's/, error: error\.message/, error: error instanceof Error ? error.message : "Unknown error"/g' "$file"
        sed -i '' 's/{ error: error\.message/{ error: error instanceof Error ? error.message : "Unknown error"/g' "$file"

        # Add proper error message extraction where needed
        sed -i '' '/} catch (error[^}]*{$/,/^[[:space:]]*}/ {
            s/logger\.\(error\|warn\|info\).*error\.message/const errorMessage = error instanceof Error ? error.message : "Unknown error"\
      &/
            s/error\.message/errorMessage/g
        }' "$file"
    fi
done

echo "Fixed error handling patterns!"
echo "Note: Some manual fixes may still be needed for complex cases."