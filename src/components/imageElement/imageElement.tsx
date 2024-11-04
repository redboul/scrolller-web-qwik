import { 
    component$,
    useSignal,
    $
 } from '@builder.io/qwik';
import styles from "./imageElement.module.css";
 
interface ImageElementProps {
    src: string;
    id: string;
  }

export default component$<ImageElementProps>((prop) => {
  const showImage = useSignal(true);
  const saved = useSignal(false);

  const removeSelf = $(()  => {
    showImage.value = false;
  });
  const save = $(async ()  => {
    await fetch(`http://localhost:8000/entries?url=${encodeURI(prop.src)}`, {
      method: "POST"
    });
    saved.value = true;
  });

  if(showImage.value) {
  return <div class={`${styles["container"]} ${saved.value ? styles["saved"] : ''}`}>
    <img
        width="20"
        height="20"
        loading="lazy"
        class={styles["image-item"]}
        src={prop.src}
        alt="kikou"
        onError$={removeSelf}
        onClick$={save}
    ></img></div>
  } else {
    return <></>
  }
});