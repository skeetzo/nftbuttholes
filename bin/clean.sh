#!/usr/bin/env bash
rm -r build log yarn-error.log
# git filter-branch -f --tree-filter 'rm -rf .env' HEAD