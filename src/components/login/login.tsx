import {
  component$,
  useSignal,
  $,
  useStore,
} from "@builder.io/qwik";
import styles from "./login.module.css";
import { prettyPrintList } from "./tsil";
import { Select } from '@qwik-ui/headless';
import ImageElement from '~/components/imageElement/imageElement';
import ImageSaveActions from "../imageSaveActions/imageSaveActions";

interface Post {
  id: string;
  url: string;
  selected:boolean;
  saved:boolean;
}

function getBestResolution(data: any = {}) {
  const image = data?.preview?.images?.find(
    (image: any) => !!image?.resolutions
  );
  const url =
    image?.resolutions?.find((resolution: any) => resolution?.width > 400)
      ?.url || data?.url_overridden_by_dest;
  return url?.replaceAll("&amp;", "&");
}

function parseDataToPostList(data: any) {
  const posts = data?.data?.children
    ?.map(
      (child: any) =>
        ({
          id: child.data.name,
          url: getBestResolution(child.data),
        } as Post)
    )
    .filter((post: Post) => post.url && !post.url.includes("gallery"));
  return posts;
}

function postColumns(posts: Post[] = []) {
  return [0, 1, 2].map((mod) => posts.filter((_, i) => i % 3 === mod));
}

export function getScrollTop(element: Element) {
  return element.scrollTop;
}

export function getScrollHeight(element: Element) {
  return element.scrollHeight;
}

export function getElementHeight(element: Element) {
  return element.clientHeight;
}

export function isScrollAtBottom(element: Element) {
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
  if(!main) return;
  const minDistToButton =
    columns
      .map((col) => document.querySelector(`#${col} button.more`))
      .filter((col) => !!col)
      .reduce(
        (acc, col) => Math.min(acc, col?.getBoundingClientRect().top || 0),
        Number.MAX_SAFE_INTEGER
      ) - getElementHeight(main);
  console.log(minDistToButton);
  return minDistToButton <= 100;
}

const nbOfItems = 100;

const listingOptions = ["new", "best", "hot", "rising", "top"];

export default component$(() => {
  const encodedList = prettyPrintList();
  const subreddit = useSignal("JuJutsuKaisen");
  const categoryValue = useSignal<string>("");
  const sortOrder = useSignal("new");
  const isRequestInProgress = useSignal(false);
  const queryParams = useSignal('');
  const postList = useStore({ 
    state: {
      posts: [] as Post[],
      postsList: [] as Post[][],
      after: "",
    }
  });

  const getMoreItems = $(async () => {
    if (!isRequestInProgress.value && isScrollBottomCloseToClosestButton()) {
      isRequestInProgress.value = true;
      const category = categoryValue.value ? categoryValue.value : subreddit.value;
      try{
        const response = await fetch(
          `http://localhost:8000/category?category=${category}&sortOrder=${sortOrder.value}&nbOfItems=${nbOfItems}&count=${postList.state?.posts?.length ?? 100}&after=${postList.state.after}&f=${queryParams.value}`);
        const data = await response.json();
        const posts = [...postList.state.posts, ...parseDataToPostList(data)];
        postList.state = {
          posts,
          postsList: postColumns(posts),
          after: data?.data?.after,
        };
      } catch(err) {
        console.error(err);
      } finally {
        isRequestInProgress.value = false;
      }
    }
  });

  const getItems = $(async (categoryVal: any) => {
    const category = categoryVal && categoryVal.length > 0 ? categoryVal : subreddit.value;

    const response = await fetch(
      `http://localhost:8000/category?category=${category}&sortOrder=${sortOrder.value}&nbOfItems=${nbOfItems}`);
    const data = await response.json();
    const posts = parseDataToPostList(data);
    postList.state = {
      posts,
      postsList: postColumns(posts),
      after: data?.data?.after,
    };
    const main = document.querySelector("#main");
    if (main) {
      main.scrollTop = 0;
    }
    getMoreItems();
  });

  const showList = () => {
    if (subreddit.value === "list") {
      return <Select.Root class={styles["select"]} bind:displayValue={categoryValue} onChange$={getItems}>
        <Select.Trigger class={styles["select-trigger"]}>
          <Select.DisplayValue placeholder="Select an category" />
        </Select.Trigger>
        <Select.Popover class="select-popover">
          {encodedList.map((entry) => (
            <Select.Item class="select-item" key={entry}>
              <Select.ItemLabel>{entry}</Select.ItemLabel>
            </Select.Item>
          ))}
        </Select.Popover>
      </Select.Root>
    }
    return <></>
  }

  return (
    <>
      <div class={styles["header"]}>
        <h1 class={styles["title"]}>Scrolller</h1>
        <div class={styles["form"]}>
          <input class={styles["input"]} bind:value={subreddit} />
          {showList()}
          <select class={styles["input"]} bind:value={sortOrder}>
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
        <div class={styles["container"]}>
          {postList.state.postsList.map((posts, i) => (
            <div id={columns[i]} key={i} class={styles["container-column"]}>
              {posts.map((post) => (
                <ImageElement
                  key={post.id}
                  src={post.url}
                  id={post.id}
                  clicked={post.selected}
                  saved={post.saved}
                  click$={() => {post.selected = true;}}
                >
                  <ImageSaveActions 
                    src={post.url}
                    saved$={() => post.saved=true}
                    unselect$={() => post.selected=false}
                    >
                    </ImageSaveActions>
                </ImageElement>
              ))}
              <button class={`${styles["button"]} more`} onClick$={getMoreItems}>
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
