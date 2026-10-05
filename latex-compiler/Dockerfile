# Place this at latex-compiler/Dockerfile
#
# Minimal, sandboxed LaTeX compile microservice. Accepts a .tex string over
# HTTP, runs pdflatex with shell-escape disabled, and returns the PDF.
# Runtime resource/network limits are enforced in docker-compose.yml
# (mem_limit, cpus, read_only, internal network) — this file only sets up
# the image and a non-root user.

FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    && rm -rf /var/lib/apt/lists/*

# Run as non-root
RUN useradd -m compiler
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .

USER compiler

EXPOSE 5001
# server.js should shell out to:
#   pdflatex -interaction=nonstopmode -no-shell-escape -halt-on-error <file>.tex
# with a timeout (~10s) wrapped around the child process.
CMD ["node", "server.js"]