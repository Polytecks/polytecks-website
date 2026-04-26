import styles from "./philosophy.module.css";

export function Philosophy() {
  return (
    <section className={styles.section}>
      <p className={styles.copy}>
        {/* TODO: rewrite as: one sensor platform, many bioelectronic applications.
            Starting with veterinary cardiology where the regulatory path is fastest,
            then extending into human ECG, EEG, and EMG as clinical validation matures.
            The technology beneath is the same — what changes is what we ask it to listen for. */}
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
    </section>
  );
}
