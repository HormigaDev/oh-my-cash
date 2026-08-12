migrate:
	cargo run --manifest-path migration/Cargo.toml -- up

user:
	cargo run --bin omc-user -- foo@example.com

dev:
	cargo run --bin oh-my-cash