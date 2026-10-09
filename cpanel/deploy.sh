#!/bin/bash
set -euo pipefail
# Set the exact destination in deploy-path.txt (one absolute path).
# Keep this file local to your cPanel Git checkout.
if [ ! -f deploy-path.txt ]; then
  echo 'Create deploy-path.txt in this Git checkout with the absolute domain document-root path.'
  exit 1
fi
IFS= read -r target < deploy-path.txt || true
case "$target" in
 "$HOME"/public_html|"$HOME"/public_html/*) ;;
 *) echo 'Destination must be inside your public_html directory.'; exit 1;;
esac
if [ ! -f deploy/index.html ]; then echo 'Prebuilt deploy files missing.'; exit 1; fi
mkdir -p "$target"
# Existing credentials and enquiry data are intentionally preserved.
cp -R deploy/. "$target/"
echo "K-Boom deployed to $target"
