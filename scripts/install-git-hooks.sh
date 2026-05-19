#!/bin/sh
set -eu

cd "$(git rev-parse --show-toplevel)"

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit .githooks/pre-push

printf '%s\n' 'Installed git hooks from .githooks.'
