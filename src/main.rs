#[tokio::main]
async fn main() -> anyhow::Result<()> {
    oh_my_cash::run().await
}
