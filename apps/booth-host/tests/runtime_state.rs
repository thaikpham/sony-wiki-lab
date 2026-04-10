#[path = "../src/runtime.rs"]
mod runtime;

use runtime::{BoothRuntime, BoothState};

#[test]
fn default_runtime_starts_idle() {
    let runtime = BoothRuntime::default();

    assert_eq!(runtime.state, BoothState::Idle);
    assert!(runtime.storage_path.contains("SonyPhotobooth"));
}
