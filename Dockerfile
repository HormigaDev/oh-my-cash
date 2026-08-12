FROM rust:1.97-bookworm AS builder

WORKDIR /build

COPY Cargo.toml Cargo.lock rust-toolchain.toml ./
COPY src ./src
COPY migration ./migration

RUN cargo build --release --bin oh-my-cash
RUN cargo build --release -p migration --bin migration


FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd \
    --system \
    --uid 10001 \
    --no-create-home \
    --shell /usr/sbin/nologin \
    omc

COPY --from=builder \
    /build/target/release/oh-my-cash \
    /usr/local/bin/oh-my-cash

COPY --from=builder \
    /build/target/release/migration \
    /usr/local/bin/omc-migration

USER omc

CMD ["oh-my-cash"]