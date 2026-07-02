"use client";

/**
 * Placeholder for the Phaser game mount.
 *
 * The real Phaser boot + RoomScene land in M2 (the birthday room). For M0 this
 * is an intentionally inert placeholder so the integration point exists without
 * pulling Phaser into the bundle yet. It is not rendered anywhere in M0.
 */
export function PhaserGame() {
  return (
    <div
      role="img"
      aria-label="Birthday room canvas placeholder"
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
        color: "var(--c-text-muted)",
        fontFamily: "var(--font-ui)",
      }}
    >
      Phaser canvas mounts here in M2.
    </div>
  );
}
