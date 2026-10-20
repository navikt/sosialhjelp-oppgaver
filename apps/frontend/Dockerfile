FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim@sha256:1a593ff8981b9e8462d37b833d4403eabe5bccfbdbef97bb7759ab70ea10e297 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY .next/standalone ./
COPY .next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["node"]
CMD ["server.js"]
