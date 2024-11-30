import type {
    QRL
 } from '@builder.io/qwik';
import { 
    component$,
    $
 } from '@builder.io/qwik';
import styles from "./imageSaveActions.module.css";
 
interface ImageActionProps {
    src: string;
    saved$: QRL<() => void>;
    unselect$: QRL<() => void>;
  }

export default component$<ImageActionProps>((prop) => {
  const handleClick = $(async (type: string)  => {
      await fetch(`http://localhost:8000/entries?type=${type}&url=${encodeURI(prop.src)}`, {
        method: "POST"
      });
      prop.saved$();
    });
  const handleBlur = $(async ()  => {
    await handleClick('blur');
  });
  const handleSlipknot = $(async ()  => {
    await handleClick('slipknot');
  });
  const handleUnselect = $(async ()  => {
    prop.unselect$();
  });

  return <div class={styles["container-column"]}>
    <button class={styles.action} title="Blur" onClick$={handleBlur}>Blur</button>
    <button class={styles.action} title="Slipknot" onClick$={handleSlipknot}>Slipknot</button>
    <button class={styles.action} title="Unselect" onClick$={handleUnselect}>Unselect</button>
  </div>
});