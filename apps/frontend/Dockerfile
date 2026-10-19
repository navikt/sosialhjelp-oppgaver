FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim@sha256:f0042df01fb6e41b8472a3540cb87bd6a0472a431f76b085ffab855d87641d6c AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY .next/standalone ./
COPY .next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["node"]
CMD ["server.js"]
