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
import ImgLine from "../../media/line.png.png?jsx";
 
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

  const removeSelf = $(() => {
    showImage.value = false;
  });
  const handleClick = $(async ()  => {
    if(prop.click$) {
      prop.click$();
    }
  });
  if(showImage.value) {
  return <div class={`${styles["container"]} ${prop.clicked ? styles["saved"] : ''} ${prop.hidden ? styles["hidden"] : ''}`}>
    <object
      type="image/png"
      data={prop.src}
      width="100%"
      height="100%"
      class={styles["image-item"]}
      aria-label="This image should exist, but alas it does not"
      onClick$={handleClick}
      onError$={removeSelf}
    >
      <ImgLine/>
    </object>
    
    <div class={`${styles["overlay"]} ${prop.clicked && !prop.saved ? styles["clicked"] : ''}`}>
      <Slot/>
    </div>
    </div>
  } else {
    return <></>
  }
});