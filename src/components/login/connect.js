export async function getAccessToken() {
  const clientId = "-TE4JxnIcNvPlR8fCVLHiw";
  const clientSecret = "KeN-ecfjLZ6qKyreIulZM07IfMpOvQ";
  const username = "Equal_Ad5222";
  const password = "reddit.C0M";

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(`${clientId}:${clientSecret}`),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "MyRedditApp/0.1 by Equal_Ad5222"
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: username,
      password: password
    })
  });

  const data = await response.json();
  return data.access_token;
}

async function getHotPosts() {
  const token = await getAccessToken();

  const response = await fetch("https://oauth.reddit.com/r/braless/hot?limit=5", {
    method: "GET",
    headers: {
      "Authorization": `bearer ${token}`,
      "User-Agent": "MyRedditApp/0.1 by Equal_Ad5222"
    }
  });

  const data = await response.json();
  console.log(data);
}

getHotPosts();