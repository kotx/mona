FROM gitpod/workspace-full

RUN npx --yes playwright install
RUN npx --yes playwright install-deps
