#!/bin/bash

session="AI4EU"
port=8000

tmux new-session -d -s $session

# JS window
tmux rename-window -t 0 'JS'
tmux send-keys 'vim .' C-m
tmux split-window -d -h
tmux send-keys -t right 'python -m http.server ' $port C-m

# Git window
tmux new-window -t $session -n 'Git'
tmux send-keys 'git log' C-m

tmux select-window -t 'JS'

firefox localhost:$port

