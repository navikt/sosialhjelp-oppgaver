FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim@sha256:e2a25eee46661e5ec73707856e5d6221818353addd21cf6916ffdcfea358dea1 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY .next/standalone ./
COPY .next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["node"]
CMD ["server.js"]
