FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY .next/standalone ./
COPY .next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["node"]
CMD ["server.js"]
