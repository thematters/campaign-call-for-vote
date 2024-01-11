<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  // import { browser } from '$app/environment';

  import { Telegram, Facebook, X, Line } from 'svelte-share-buttons-component';

  import {
    // PUBLIC_CAMPAIGN_LINK,
    PUBLIC_CANONICAL_ORIGIN,
    PUBLIC_SITE_DESCRIPTION,
    PUBLIC_SITE_NAME
  } from '$env/static/public';

  import { loadViewerData, rasterize } from '$lib/utils';
  import CallForVote from './CallForVote.svelte';

  /** @type {import('./$types').PageData} */
  export let data;

  let userName = data?.searchParams?.userName?.trim()?.replace(/^@+/, '');

  let viewerData;
  onMount(() => {
    (async function () {
      if (!userName) {
        viewerData = await loadViewerData();
        console.log('no input, fetch viewer data:', viewerData);
        userName = viewerData?.data?.user?.userName || '';
      }
    })();
  });

  let callForVoteText = (data?.searchParams?.text || '').substring(0, 40);
  let showAvatar = data?.searchParams?.showAvatar || 'off'; // !!('showAvatar' in (data?.searchParams || {}));
  let campaignUrl = data?.searchParams?.campaignUrl || '';
  let gesture = data?.searchParams?.gesture || '1';

  $: displayName = (data?.data?.user?.displayName ?? data?.data?.displayName)?.trim() || '';
  $: updatedTitle = PUBLIC_SITE_NAME + (displayName ? ` - ${displayName.trim()}` : '');
  $: shareUrl = `${PUBLIC_CANONICAL_ORIGIN}/${$page.url.search}`;

  let dataSvgEl;
  async function downloadAsPng() {
    // event
    // console.log('event is:', event, dataSvgEl, data);
    // const blob = await rasterize(dataSvgEl, { scale: 1.25, width: 1200, height: 754 });
    const blob = await rasterize(dataSvgEl, { scale: 2, width: 2000, height: 2000 });
    // console.log(`got blob:`, blob);
    const blobUrl = URL.createObjectURL(blob);
    // console.log('got blobUrl:', blobUrl);
    const link = document.createElement('a');
    link.download = `${displayName ?? 'untitled'}.png`;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    // always revoke, avoid leaking
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  }
  function shortenUrl(url) {
    // or call recurl.cc ;...
    const m = url.match(/(^https:\/\/matters\.town\/@\w+\/\d+)(&referral=\w+)?/);
    if (!m) return url;
    const [, part1, part2] = m;
    if (part1) {
      return `${part1}?${part2 || `referral=${userName}`}`;
    }
    return url;
  }
</script>

<svelte:head>
  <title>{updatedTitle}</title>
  <meta name="description" content={PUBLIC_SITE_DESCRIPTION} />
  <meta name="keywords" content={'matters,identity'} />
  <meta property="og:title" content={updatedTitle} />
  <meta property="og:description" content={PUBLIC_SITE_DESCRIPTION} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content={`${PUBLIC_CANONICAL_ORIGIN}/img/screenshot.png`} />
  <meta property="og:url" content={shareUrl} />
  <meta property="twitter:title" content={updatedTitle} />
  <meta property="twitter:description" content={PUBLIC_SITE_DESCRIPTION} />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:image" content={`${PUBLIC_CANONICAL_ORIGIN}/img/screenshot.png`} />
  <meta property="twitter:url" content={shareUrl} />
  <meta property="meta:userDescription" content={`${data?.user?.info?.description}`} />
  <link rel="canonical" href={shareUrl} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<header>
  <h1 class="my-4 text-4xl leading-12 text-white">{PUBLIC_SITE_DESCRIPTION}</h1>
  <p class="leading-text">
    {#if !data?.searchParams?.userName}
      遊牧者計畫投票將於 1 月 22 日
      23:59（東八區）截止，為自己製作一張拉票海報，爭取更多支持吧！輸入你的 Matters ID
      並任選一款圖片，向世界表達你踏上旅途的決心。
    {:else}
      把這張海報分享給潛在支持者，讓他們成為你遊牧路上的最大助力。最後衝刺時刻，為你加油！
    {/if}
  </p>
</header>

<section class="flex flex-col">
  <div class="flex w-full flex-col content-center items-center gap-4">
    {#if !data?.searchParams?.userName}
      <form data-sveltekit-reload>
        <section class="content-box">
          <div class="row userNameContainer">
            <!-- <label for="userName">用戶名 (@userName):</label> -->
            <input
              type="text"
              name="userName"
              id="userName"
              size={20}
              maxlength={20}
              placeholder="輸入你的 Matters ID"
              pattern="[A-z0-9À-ž]+"
              min-length="2"
              bind:value={userName}
            />
          </div>
          <div class="row">
            <textarea
              rows={2}
              maxlength={40}
              name="text"
              placeholder="寫一段話為自己拉票，最多 40 個中文字"
              bind:value={callForVoteText}
            />
          </div>
          <div class="row">
            <input
              type="text"
              name="campaignUrl"
              id="campaignUrl"
              placeholder="放上你的提案網址"
              bind:value={campaignUrl}
            />
          </div>
          <div class="row">
            <div>是否顯示 Matters 上的頭像？</div>
            <div class="flex w-full gap-4">
              <label
                ><input
                  type="radio"
                  name="showAvatar"
                  bind:group={showAvatar}
                  value="on"
                />顯示</label
              >
              <label
                ><input
                  type="radio"
                  name="showAvatar"
                  bind:group={showAvatar}
                  value="off"
                />不顯示</label
              >
            </div>
          </div>
          <div class="row">
            <div>為自己選定競選風格，三款圖片任你挑</div>
            <div class="flex w-full flex-row content-center justify-between">
              <label>
                <input type="radio" name="gesture" bind:group={gesture} value="1" />
                <img src="vote-1.png" alt="vote-1" />
              </label>
              <label>
                <input type="radio" name="gesture" bind:group={gesture} value="2" />
                <img src="vote-2.png" alt="vote-2" />
              </label>
              <label>
                <input type="radio" name="gesture" bind:group={gesture} value="3" />
                <img src="vote-3.png" alt="vote-3" />
              </label>
            </div>
          </div>
        </section>

        <div class="row">
          <button type="submit" class="btn" disabled={!callForVoteText || !userName}>送出</button>
        </div>
      </form>
    {:else}
      <section class="content-box">
        <div class="tools-group my-4">
          <X
            class="share-button"
            text={updatedTitle}
            url={shareUrl}
            hashtags="nomadmatters"
            via="MattersLab"
            related="MattersLab"
          />
          <Facebook class="share-button" quote={updatedTitle} url={shareUrl} />
          <Telegram class="share-button" text={updatedTitle} url={shareUrl} />
          <Line class="share-button" url={shareUrl} />
          <a href="https://Matters.Town" target="_blank" rel="noreferrer" class="share-link"
            ><div>回到 Matters</div></a
          >
        </div>

        <CallForVote
          userData={data}
          {callForVoteText}
          campaignUrl={shortenUrl(campaignUrl)}
          showAvatar={showAvatar === 'on'}
          {gesture}
          bind:el={dataSvgEl}
        />

        <button class="btn my-10" on:click={downloadAsPng}>下載海報</button>
      </section>
    {/if}
  </div>
</section>

<style>
  :root {
    --theme-background-color: #38288b;
    --theme-highlight-color: #ffa599;
    --theme-button-1-color: #ffa599;
    --theme-button-2-color: #f18071;
    --theme-button-3-color: #f16a58;
    --theme-text-1-color: #38288b;
  }

  .leading-text {
    color: #cbc3f4;
  }

  .content-box {
    @apply my-10 flex w-full flex-col gap-2;
  }

  .tools-group {
    @apply flex w-full flex-row items-center justify-end gap-4 self-end;
  }
  .tools-group :global(.share-button) {
    border-radius: 0.5rem;
  }
  .tools-group :global(.share-button > div) {
    display: flex;
  }
  .tools-group a.share-link {
    margin-left: 0.5rem;
    box-sizing: border-box;
  }

  .row {
    @apply flex flex-col;
  }

  form,
  form .row input[type='text'],
  form .row textarea,
  button {
    @apply block w-full;
  }
  form .row input[type='text'],
  form .row textarea {
    @apply px-4 py-2;
  }

  form .row {
    @apply flex content-center items-baseline;
  }
  form .row input[type='text'],
  form .row textarea {
    background-color: #4d3ab3;

    border: 1px solid black;
    border-radius: 0.5rem;
  }

  form .row.userNameContainer {
    position: relative;

    &:before {
      position: absolute;
      left: 1rem;
      color: grey;
      content: '@';
      line-height: 3rem;
    }
    & input#userName {
      padding-left: 2rem;
      line-height: 2rem;
    }
  }

  button.btn {
    @apply rounded-3xl p-4;

    color: var(--theme-text-1-color);
    background-color: var(--theme-button-1-color);

    &:disabled {
      color: grey;
    }
    &:hover:enabled {
      background-color: var(--theme-button-2-color);
    }
  }

  a {
    color: white;
    &:hover {
      color: #cbc3f4;
    }
    &:visited {
      color: #9584ec;
    }
  }
</style>
