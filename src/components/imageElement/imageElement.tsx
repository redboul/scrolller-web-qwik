import type {
  QRL
} from '@builder.io/qwik';
import { 
    component$,
    useSignal,
    $,
    Slot
 } from '@builder.io/qwik';
import styles from "./imageElement.module.css";
 
interface ImageElementProps {
    src: string;
    id: string;
    clicked?: boolean;
    saved?: boolean;
    click$?: QRL<() => void>;
    hidden?:boolean;
  }

export default component$<ImageElementProps>((prop) => {
  const showImage = useSignal(true);

  const removeSelf = $(()  => {
    showImage.value = false;
  });
  const handleClick = $(async ()  => {
    if(prop.click$) {
      prop.click$();
    }
  });
  if(showImage.value) {
  return <div class={`${styles["container"]} ${prop.clicked ? styles["saved"] : ''} ${prop.hidden ? styles["hidden"] : ''}`}>
    <img
        width="20"
        height="20"
        loading="lazy"
        class={styles["image-item"]}
        src={prop.src}
        alt="kikou"
        onError$={removeSelf}
        onClick$={handleClick}
    ></img>
    <div class={`${styles["overlay"]} ${prop.clicked && !prop.saved ? styles["clicked"] : ''}`}>
      <Slot/>
    </div>
    </div>
  } else {
    return <></>
  }
});