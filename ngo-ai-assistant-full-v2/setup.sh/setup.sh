#!/bin/bash


cd "$(dirname "$0")/backend" || exit


if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi


echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt


echo "Starting backend server..."
uvicorn app.main:app --reload --port 8000