import {
  component$,
  useSignal,
  $,
  useStore,
} from "@builder.io/qwik";
import styles from "./settings.module.css";
import ImageElement from '~/components/imageElement/imageElement';
import ImageBestActions from "../imageBestActions/imageBestActions";


interface Post {
  id: string;
  url: string;
  selected:boolean;
  deleted:boolean;
}

function postColumns(posts: Post[] = []) {
  return [0, 1, 2].map((mod) => posts.filter((_, i) => i % 3 === mod));
}

export function getScrollTop(element: HTMLElement) {
  return element.scrollTop;
}

export function getScrollHeight(element: HTMLElement) {
  return element.scrollHeight;
}

export function getElementHeight(element: HTMLElement) {
  return element.clientHeight;
}

export function isScrollAtBottom(element: HTMLElement | undefined) {
  if (!element) {
    return false;
  }
  const scrollHeight = getScrollHeight(element);
  const scrollTop = getScrollTop(element);
  const elementHeight = getElementHeight(element);

  // calculation coming from https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled
  const distanceToBottom = Math.abs(scrollHeight - elementHeight - scrollTop);
  const buffer = 20; // height before considering it is the end of the scroll
  return distanceToBottom < buffer;
}

const columns = ["col1", "col2", "col3"];

function isScrollBottomCloseToClosestButton() {
  const main = document.querySelector("#main");
  const minDistToButton =
    columns
      .map((col) => document.querySelector(`#${col} button.more`))
      .filter((col) => !!col)
      .reduce(
        (acc, col) => Math.min(acc, col?.getBoundingClientRect().top || 0),
        Number.MAX_SAFE_INTEGER
      ) - getElementHeight(main);
  return minDistToButton <= 100;
}

export default component$(() => {
  const seed = useSignal("0");
  const page = useSignal(0);
  const pageSize = useSignal("100");
  const isRequestInProgress = useSignal(false);
  const type = useSignal("blur");
  const postList = useStore({ state:{
      posts: [] as Post[],
      postsList: [] as Post[][],
      after: "",
    }
  });

  interface Entry {
    url: string;
  }

  const listingOptions = ["blur", 'slipknot'];


  const fetchItems = $(async(type: string, seed: string, page: number, pageSize: string) => {
    const response = await fetch(
      `http://localhost:8000/entries?type=${type}&seed=${seed}&page=${page}&pageSize=${pageSize}`
    );
    const data = await response.json();
    return data;
  });

  const getItems = $(async () => {
      page.value = 0;
      const data = await fetchItems(type.value, seed.value, page.value, pageSize.value);
      const posts = data.map((entry: Entry) => ({id: entry.url, url: entry.url}));
      postList.state = {
        posts,
        postsList: postColumns(posts),
        after: '',
      };
  });

  const getMoreItems = $(async () => {
    if (!isRequestInProgress.value && isScrollBottomCloseToClosestButton()) {
      isRequestInProgress.value = true;
      page.value = +page.value + 1;
      const data = await fetchItems(type.value, seed.value, page.value, pageSize.value);
      const newPosts: Post[] = data.map((entry: Entry) => ({id: entry.url, url: entry.url} as Post));
      const posts = [...postList.state.posts, ...newPosts];

      postList.state = {
        posts,
        postsList: postColumns(posts),
        after: '',
      };
      isRequestInProgress.value = false;
    }
  });

  return (
    <>
      <div class={styles["header"]}>
        <h1 class={styles["title"]}>Scrolller</h1>
        <div class={styles["form"]}>
          <input type="number" class={styles["input"]} bind:value={seed} />
          <select class={styles["input"]} bind:value={type}>
            {listingOptions.map((listing) => (
              <option key={listing} value={listing}>
                {listing}
              </option>
            ))}
          </select>
          <button class={styles["button"]} onClick$={getItems}>
            GO
          </button>
        </div>
      </div>
      <div onScroll$={getMoreItems} id="main" class={styles["main"]}>
      {/* <div id="main" class={styles["main"]}> */}
        <div class={styles["container"]}>
          {postList.state.postsList.map((posts, i) => (
            <div id={columns[i]} key={i} class={styles["container-column"]}>
              {posts.map((post) => (
                <ImageElement
                  key={post.id}
                  src={post.url}
                  id={post.id}
                  clicked={post.selected}
                  saved={false}
                  click$={() => {post.selected = true;}}
                  hidden={post.deleted}
                >
                <ImageBestActions
                  src={post.url}
                  deleted$={() =>  post.deleted=true}
                  unselect$={() => post.selected=false}
                  >
                  </ImageBestActions>
                </ImageElement>
              ))}
              <div></div>
              <button class={`${styles["button"]} more`}  onClick$={getMoreItems}>
                Next
              </button>
            </div>
          ))}
        </div>
        <p>{postList.state.after}</p>
      </div>
    </>
  );
});

