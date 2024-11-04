import {
  component$,
  useSignal,
  $,
} from "@builder.io/qwik";
import styles from "./login.module.css";
import { prettyPrintList } from "./tsil";
import { Select } from '@qwik-ui/headless';
import ImageElement from '~/components/imageElement/imageElement';
import { after } from "node:test";


interface Post {
  id: string;
  url: string;
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

export function getScrollTop(element) {
  return element.scrollTop;
}

export function getScrollHeight(element) {
  return element.scrollHeight;
}

export function getElementHeight(element) {
  return element.clientHeight;
}

export function isScrollAtBottom(element) {
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
      .map((col) => document.querySelector(`#${col} button`))
      .filter((col) => !!col)
      .reduce(
        (acc, col) => Math.min(acc, col?.getBoundingClientRect()?.top || 0),
        100000
      ) - getElementHeight(main);
  return minDistToButton <= 100;
}

const nbOfItems = 100;

const listingOptions = ["new", "best", "hot", "rising", "top"];

export default component$(() => {
  const encodedList = prettyPrintList();
  const subreddit = useSignal("JuJutsuKaisen");
  const categoryValue = useSignal<string | string[]>([]);
  const sortOrder = useSignal("new");
  const isRequestInProgress = useSignal(false);
  const queryParams = useSignal('');
  const postList = useSignal({
    posts: [] as Post[],
    postsList: [] as Post[][],
    after: "",
  });

  const getMoreItems = $(async () => {
    if (!isRequestInProgress.value && isScrollBottomCloseToClosestButton()) {
      isRequestInProgress.value = true;
      const category = categoryValue.value ? categoryValue.value : subreddit.value;
      const response = await fetch(
        `https://www.reddit.com/r/${category}/${sortOrder.value}.json?limit=${nbOfItems}&count=${postList.value?.posts?.length ?? 100}&after=${postList.value.after}&f=${queryParams.value}`
      );
      const data = await response.json();
      const posts = [...postList.value.posts, ...parseDataToPostList(data)];
      postList.value = {
        posts,
        postsList: postColumns(posts),
        after: data?.data?.after,
      };
      isRequestInProgress.value = false;
    }
  });

  interface Entry {
    url: string;
  }

  const getItems = $(async (categoryVal: any) => {
    if(subreddit.value === "best") {
      const response = await fetch(
        `http://localhost:8000/entries`
      );
      const data = await response.json();
      postList.value = {
        posts: [],
        postsList: postColumns(data.map((entry: Entry) => ({id: entry.url, url: entry.url}))),
        after: '',
      };
    } else {
      const category = categoryVal && categoryVal.length > 0 ? categoryVal : subreddit.value;
      const response = await fetch(
        `https://www.reddit.com/r/${category}/${sortOrder.value}.json?limit=${nbOfItems}&${queryParams.value}"`
      );
      const data = await response.json();
      const posts = parseDataToPostList(data);
      postList.value = {
        posts,
        postsList: postColumns(posts),
        after: data?.data?.after,
      };
      const main = document.querySelector("#main");
      if (main) {
        main.scrollTop = 0;
      }
      getMoreItems();
    }
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
          {postList.value.postsList.map((posts, i) => (
            <div id={columns[i]} key={i} class={styles["container-column"]}>
              {posts.map((post) => (
                <ImageElement
                  key={post.id}
                  src={post.url}
                  id={post.id}
                ></ImageElement>
              ))}
              <div></div>
              <button class={styles["button"]} onClick$={getMoreItems}>
                Next
              </button>
            </div>
          ))}
        </div>
        <p>{postList.value.after}</p>
      </div>
    </>
  );
});
