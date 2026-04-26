import styles from "./placeholder-grid.module.css";

export type PlaceholderItem = {
  label: string;
  title: string;
  body: string;
};

export function PlaceholderGrid({ items }: { items: ReadonlyArray<PlaceholderItem> }) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item.title} className={styles.card}>
          <div className={styles.label}>{item.label}</div>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}
