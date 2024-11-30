import type {
    QRL
 } from '@builder.io/qwik';
import { 
    component$,
    $
 } from '@builder.io/qwik';
import styles from "./imageBestActions.module.css";
 
interface ImageActionProps {
    src: string;
    deleted$: QRL<() => void>;
    unselect$: QRL<() => void>;
  }

export default component$<ImageActionProps>((prop) => {
  const handleClick = $(async ()  => {
      await fetch(`http://localhost:8000/entries?url=${encodeURI(prop.src)}`, {
        method: "DELETE"
      });
      prop.deleted$();
    });
  const handleUnselect = $(async ()  => {
    prop.unselect$();
  });

  return <div class={styles["container-column"]}>
    <button class={styles.action} title="Blur" onClick$={handleClick}>OUT</button>
    <button class={styles.action} title="Unselect" onClick$={handleUnselect}>Unselect</button>
  </div>
});