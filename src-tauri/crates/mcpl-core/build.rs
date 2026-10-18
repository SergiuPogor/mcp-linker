use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    // license.rs reads these with option_env!; rebuild when they change.
    for var in [
        "MCP_LINKER_POLAR_ORG_ID",
        "MCP_LINKER_POLAR_PLUS_BENEFIT_ID",
        "MCP_LINKER_POLAR_PRO_BENEFIT_ID",
    ] {
        println!("cargo:rerun-if-env-changed={var}");
    }

    // A Plus or Pro key unlocks builds made within its year of updates.
    // Release builds run this script fresh; an incremental dev build may keep
    // an older time, which only makes the check more lenient.
    let build_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|elapsed| elapsed.as_secs())
        .unwrap_or(0);
    println!("cargo:rustc-env=MCP_LINKER_BUILD_TIME={build_time}");
}
