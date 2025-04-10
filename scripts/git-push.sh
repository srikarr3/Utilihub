#!/bin/bash

# Check if Git is installed
if ! [ -x "$(command -v git)" ]; then
  echo 'Error: Git is not installed.' >&2
  exit 1
fi

# Check if repository is initialized
if ! [ -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
  
  # Set default branch to main
  git checkout -b main
fi

# Add all files
git add .

# Prompt for commit message
echo "Enter commit message:"
read commit_message

# Default message if none provided
if [ -z "$commit_message" ]; then
  commit_message="Update project files"
fi

# Commit changes
git commit -m "$commit_message"

# Check if remote origin exists
if ! git remote | grep -q "origin"; then
  echo "Enter GitHub repository URL (e.g., https://github.com/username/repo.git):"
  read repo_url
  
  if [ -z "$repo_url" ]; then
    echo "No repository URL provided. Changes are committed locally only."
    exit 0
  fi
  
  git remote add origin "$repo_url"
fi

# Push to GitHub
echo "Pushing changes to GitHub..."
git push -u origin main

echo "Changes successfully pushed to GitHub!"
