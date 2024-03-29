import { PUBLIC_SERVER_API_URL } from '$env/static/public';

/**
 * @param {string} userName
 */
export function loadUserData(userName, year = 2022, fetch = window.fetch) {
  const m = userName.match(/\w+/);
  if (m) userName = m[0];
  const u = new URL(`https://user-data-api.matters.one/${userName}`);
  if (year) {
    u.searchParams.set('year', year);
  }

  return fetch(u.toString(), {
    headers: { Accept: 'application/json' }
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error('fetching userData error:', err);
      return {};
    });
}

const InfoQueryFrag = `fragment UserInfoFrag on User {
  id userName displayName avatar
  info {
    createdAt
    description
    badges{type}
    cryptoWallet{address hasNFTs}
  }
}`;
const getViewerInfoQuery = `## get viewer's own info
{
  user: viewer {...UserInfoFrag}
}

${InfoQueryFrag}`;

const getUserInfoQuery = `## get another user's info
query GetUserInfo($userName:String!) {
  user(input:{userName:$userName}) {...UserInfoFrag}
}

${InfoQueryFrag}`;

// import { SERVER_URL } from './consts';
export function loadViewerData(userName, fetch = window.fetch) {
  const params = {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      query: userName ? getUserInfoQuery : getViewerInfoQuery,
      variables: { userName }
    }),
    credentials: 'include'
  };
  console.log('fetch with graphql:', PUBLIC_SERVER_API_URL, params);

  return fetch(PUBLIC_SERVER_API_URL, params)
    .then(async (res) => {
      console.log('fetching viewerData:', res.ok, res.status, res.statusText, res.headers);
      const data = await res.json();
      console.log("fetch'ed viewerData:", data);
      return data; // res.json();
    })
    .catch((err) => {
      console.error('fetching viewerData error:', err);
      return {};
    });
}

/**
 * @param {string} strId
 */
export function fromGlobalId(strId) {
  if (strId) return +atob(strId).split(':').slice(-1)[0];
}

/**
 * @param {number} width
 * @param {number} height
 */
// from https://github.com/observablehq/stdlib/blob/main/src/dom/context2d.js
export function context2d(width, height, dpi) {
  if (dpi == null) dpi = window.devicePixelRatio;
  var canvas = document.createElement('canvas');
  canvas.width = width * dpi;
  canvas.height = height * dpi;
  canvas.style.width = width + 'px';
  var context = canvas.getContext('2d');
  context.scale(dpi, dpi);
  return context;
}

// "https://assets.matters.news/avatar/02429947-5f2a-408e-8ab3-c543272d2821.webp"
export async function imgToCanvas(src) {
  const img = new Image();
  img.crossOrigin = '*';
  img.src = src; // await seasonalHolidays202267536518371098314S.url();
  await new Promise((resolve, reject) => {
    img.onerror = reject;
    img.onload = resolve;
    // img.addEventListener('load', resolve);
    // img.addEventListener('error', reject);
  });
  const ctx = context2d(img.width, img.height);
  ctx.drawImage(img, 0, 0);
  return ctx.canvas;
}

const xmlns = 'http://www.w3.org/2000/xmlns/';
const xlinkns = 'http://www.w3.org/1999/xlink';
const svgns = 'http://www.w3.org/2000/svg';

// from https://observablehq.com/@mbostock/saving-svg
export function serialize(svg) {
  svg = svg.cloneNode(true);
  const fragment = window.location.href + '#';
  const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    for (const attr of walker.currentNode.attributes) {
      if (attr.value.includes(fragment)) {
        attr.value = attr.value.replace(fragment, '#');
      }
    }
  }
  svg.setAttributeNS(xmlns, 'xmlns', svgns);
  svg.setAttributeNS(xmlns, 'xmlns:xlink', xlinkns);

  const serializer = new window.XMLSerializer();
  const string = serializer.serializeToString(svg);
  return string;

  // return new Blob([string], { type: 'image/svg+xml' });
}

function buildSvgImageUrl(svg) {
  // TODO need better solutions;
  const b64 = window // btoa(svg);
    .btoa(unescape(encodeURIComponent(svg)));
  return 'data:image/svg+xml;base64,' + b64;
}

export function rasterize(
  svg,
  {
    // scale = 1.0,
    width = 2000,
    height = 2000
  } = {}
) {
  // let resolve, reject;
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = function (err) {
      console.error(`image.onerror:`, this, err);
      reject(err);
    };
    image.onload = () => {
      // const rect = svg.getBoundingClientRect();
      width /= window.devicePixelRatio;
      height /= window.devicePixelRatio;
      const context = context2d(width, height);
      context.drawImage(image, 0, 0, width, height);
      context.canvas.toBlob(resolve);
    };
    image.src = buildSvgImageUrl(serialize(svg)); // URL.createObjectURL(serialize(svg));
  });
}

export function* tryNextAvatarFormat(src) {
  const isLegacyUrl = src.startsWith('https://assets.matters.news/');
  const isCloudflareImageUrl = src.startsWith(
    'https://imagedelivery.net/kDRCweMmqLnTPNlbum-pYA/prod'
  );

  if (isCloudflareImageUrl) {
    yield src.replace(/public$/, '540w');
    yield src.replace(/public$/, '360w');
    yield src;
  }

  // some old examples: 'avatar/c98ec27c-c870-40ed-8cf4-eceaa950af2f/asset-KtxI.jpeg'
  let filename = isLegacyUrl ? src.replace('https://assets.matters.news/', '') : src; // src.split('/').slice(-1)[0];

  if (isLegacyUrl) {
    // 'https://matters.town/cdn-cgi/imagedelivery/kDRCweMmqLnTPNlbum-pYA/prod/avatar/c98ec27c-c870-40ed-8cf4-eceaa950af2f/asset-KtxI.jpeg/540w'
    yield `https://matters.town/cdn-cgi/imagedelivery/kDRCweMmqLnTPNlbum-pYA/prod/${filename}/540w`;
    yield `https://matters.town/cdn-cgi/imagedelivery/kDRCweMmqLnTPNlbum-pYA/prod/${filename}/360w`;

    // 'https://imagedelivery.net/kDRCweMmqLnTPNlbum-pYA/prod/avatar/0633ba18-f161-4f91-8459-bdb2ac9d4f67.jpeg/public'
    yield `https://imagedelivery.net/kDRCweMmqLnTPNlbum-pYA/prod/${filename}/540w`;
    yield `https://imagedelivery.net/kDRCweMmqLnTPNlbum-pYA/prod/${filename}/360w`;
    // yield `https://imagedelivery.net/kDRCweMmqLnTPNlbum-pYA/prod/avatar/${filename}/144w`;

    yield `https://assets.matters.news/processed/540w/${filename.replace(/.\w+$/, '.webp')}`;
    yield `https://assets.matters.news/processed/360w/${filename.replace(/.\w+$/, '.webp')}`;
  }

  yield src.replace(/avatar/, 'processed/540w/avatar').replace(/.\w+$/, '.webp');
  yield src.replace(/avatar/, 'processed/540w/avatar');
  yield src.replace(/.\w+$/, '.webp');
  yield src.replace(/avatar/, 'processed/144w/avatar').replace(/.\w+$/, '.webp');
  yield src.replace(/avatar/, 'processed/144w/avatar');
  yield src;
}

export async function loadImageToDataUri(src) {
  const canvas = await imgToCanvas(src);
  // console.log(`got user avatar canvas:`, canvas);
  return canvas.toDataURL();
}

export async function loadAvatarDataUri(src) {
  if (!src) return;
  for (const formatAvatar of tryNextAvatarFormat(src)) {
    try {
      return loadImageToDataUri(formatAvatar);
    } catch (err) {
      console.error(`cors request failed:`, err);
    }
  }
}

export function formatId(id) {
  const str = `0000000${id}`.slice(-7);
  return `${str.slice(0, 4)} ${str.slice(4)}`;
}

const anonSvg = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 72 72">
  <g fill-rule="evenodd">
    <circle fill="#E8C891" cx="36" cy="36.11" r="36"/>
    <path d="M17.53 26.51s-3.28 3.44-3.64 5.16c-.36 1.72 3.18 4 3.18 4s4.9-5.06.46-9.16z" fill="#FFF"/>
    <path d="M16.02 28.23s1.18 4.88-.85 6.67c0 0-3.71-.6-2.94-4.45.78-3.86 3.79-2.22 3.79-2.22z" fill="currentColor"/>
    <path d="M15.18 35.02h-.02c-.07-.01-1.75-.28-2.65-1.6-.54-.8-.67-1.81-.39-3.01.31-1.31.87-2.15 1.68-2.49.94-.41 1.91 0 2.2.15l1.44-1.64c.04-.05.12-.06.18-.01.05.04.06.12.01.18l-1.51 1.72c-.04.05-.1.06-.16.03-.01-.01-1.08-.61-2.07-.18-.72.31-1.24 1.09-1.53 2.32-.27 1.12-.15 2.07.35 2.81.83 1.23 2.46 1.49 2.48 1.5.07.01.12.07.11.14a.14.14 0 01-.12.08z" fill="#333"/>
    <path d="M16.24 32.86c-.02 0-.04 0-.05-.01-.06-.03-.09-.11-.06-.17 1.02-2.08-.2-4.37-.21-4.4-.03-.06-.01-.14.05-.17.06-.03.14-.01.17.05.05.1 1.29 2.43.21 4.62-.02.06-.07.08-.11.08z" fill="#333"/>
    <path d="M13.37 29.91c-.73.88.29 1.95 1.17 1.22.88-.73.57-3.32-1.17-1.22zM54.25 26.51s3.28 3.44 3.64 5.16c.36 1.72-3.18 4-3.18 4s-4.9-5.06-.46-9.16z" fill="#FFF"/>
    <path d="M55.76 28.23s-1.18 4.88.85 6.67c0 0 3.71-.6 2.94-4.45s-3.79-2.22-3.79-2.22z" fill="currentColor"/>
    <path d="M56.61 35.02c-.06 0-.11-.04-.12-.11-.01-.07.04-.13.11-.14.02 0 1.65-.26 2.48-1.5.5-.74.62-1.69.35-2.81-.29-1.23-.8-2.01-1.53-2.32-.99-.43-2.06.18-2.07.18-.05.03-.12.02-.16-.03l-1.51-1.72c-.05-.05-.04-.13.01-.18.05-.05.13-.04.18.01l1.44 1.64c.3-.15 1.26-.55 2.2-.15.8.35 1.37 1.18 1.68 2.49.28 1.19.15 2.21-.39 3.01-.9 1.33-2.58 1.59-2.65 1.6-.01.03-.02.03-.02.03z" fill="#333"/>
    <path d="M55.86 32.82a.13.13 0 01-.12-.08c-.75-2.21-.13-4.45-.1-4.54.02-.07.09-.1.15-.09.07.02.11.09.09.15-.01.02-.63 2.26.1 4.4.02.07-.01.14-.08.16h-.04z" fill="#333"/>
    <path d="M58.41 29.91c.73.88-.29 1.95-1.17 1.22-.87-.73-.57-3.32 1.17-1.22zM34.72 42.82c-19.17 0-24.74 10.15-26.36 16.26 6.6 7.95 16.56 13.01 27.7 13.01 11.07 0 20.98-5 27.58-12.87-2.5-6.08-9.59-16.4-28.92-16.4z" fill="#FFF"/>
    <path d="M24.4 44.11l-5.87-6.59a4.778 4.778 0 01-1.22-3.07c-.14-5.74.82-23.14 17.59-23.14 18.78 0 20.11 14.65 19.9 23.25-.03 1.1-.44 2.15-1.15 2.98l-5.54 6.5a4.824 4.824 0 01-3.66 1.69H28a4.8 4.8 0 01-3.6-1.62z" fill="#FFF"/>
    <path d="M51.51 29.71c0-1.95.29-7.2-5.04-9.09-3.75-1.32-19-1.32-22.75 0-5.34 1.88-5.04 7.13-5.04 9.09 0 3.28-.59 5.45 5.61 8.56 3.57 1.8 18.05 1.8 21.62 0 6.19-3.11 5.6-5.28 5.6-8.56z" fill="currentColor"/>
    <path d="M51.51 29.86c0-1.62.19-5.51-2.79-7.86 1.8 2.32 1.67 5.35 1.67 6.73 0 3.28.59 5.45-5.61 8.56-3.57 1.8-18.05 1.8-21.62 0-1.49-.75-2.59-1.45-3.39-2.11.8 1.02 2.17 2.06 4.52 3.25 3.57 1.8 18.05 1.8 21.62 0 6.19-3.12 5.6-5.28 5.6-8.57z" fill="#094C47"/>
    <path d="M47.79 29.7c0-1.19.12-3.77-1.37-5.78-.37.66-.96 1.56-1.87 2.53-1.83 1.97-2.96 2.43-2.96 4.1v4.19l3.11 1.43c3.48-2.21 3.09-3.97 3.09-6.47z" fill="#000"/>
    <path d="M41.6 30.55c0-1.67 1.13-2.13 2.96-4.1.91-.98 1.5-1.87 1.87-2.53-.64-.87-1.58-1.64-2.97-2.13-3.22-1.15-16.33-1.15-19.55 0-.76.27-1.38.63-1.89 1.03.57.7 1.46 1.41 2.83 1.78 3.24.86 9.8 4.4 8.84 5.03-.96.62-.03 3.36 0 4.88s-1.38.69-5.32 1.1c-2.39.25-5.41-.31-7.42-.79.72.73 1.8 1.49 3.45 2.33 3.07 1.56 15.51 1.56 18.58 0 .66-.34 1.24-.66 1.73-.98l-3.11-1.43v-4.19z" fill="#000"/>
    <path d="M28.37 35.61c3.94-.41 5.35.41 5.32-1.1-.03-1.52-.96-4.26 0-4.88.96-.62-5.6-4.16-8.84-5.03-1.37-.36-2.25-1.08-2.83-1.78-2.61 2.05-2.44 5.46-2.44 6.88 0 1.97-.24 3.48 1.37 5.12 2.01.48 5.03 1.04 7.42.79zM35.11 52.51c-3.29 0-8.09-1.92-8.32-2.01a.135.135 0 01-.07-.16c.03-.06.1-.09.16-.07.06.02 5.95 2.38 9.1 1.93 3.19-.44 11.45-1.93 11.54-1.94.08-.01.13.03.15.1.01.07-.03.13-.1.15-.08.01-8.36 1.5-11.55 1.95-.29.03-.59.05-.91.05z" fill="#333"/>
    <path d="M24.85 24.6c-1.49 2.55 1.38 5.67 1.83 4.65.45-1.02 2.7-4.71 1.29-5.33-1.41-.62-2.16-.97-3.12.68z" fill="#FFF"/>
    <path d="M47.19 38.89c-.05 0-.09-.03-.11-.07-.03-.06 0-.14.06-.17 5.11-2.53 6.61-6.17 5.34-12.96-1.23-6.57-5.72-7.3-14.98-7.3h-.06c-8.72 0-12.36 1.06-12.4 1.07a.131.131 0 01-.16-.08c-.02-.07.02-.14.08-.16.04-.01 3.71-1.08 12.47-1.08h.1c8.55 0 13.86.38 15.19 7.5 1.29 6.93-.24 10.64-5.47 13.23-.03.02-.05.02-.06.02zM26.68 42.94c-.05 0-.09-.03-.11-.07-.69-1.52-1.34-2-1.77-2.15-.37-.12-.62 0-.63.01-.06.03-.14.01-.17-.05-.03-.06-.01-.13.05-.17.01-.01.33-.19.82-.03.7.22 1.34.99 1.93 2.29.03.06 0 .14-.06.17-.03-.01-.05 0-.06 0zM45.28 43.06h-.04c-.07-.02-.1-.09-.08-.16.73-2.45 1.61-2.48 2.14-2.48h.06c.06 0 .11 0 .16-.01.08-.01.13.03.15.1.01.07-.03.13-.1.15-.07.01-.14.01-.24.01h-.02c-.46 0-1.23.03-1.91 2.3-.02.06-.07.09-.12.09zM8.36 59.2h-.02c-.07-.01-.11-.08-.1-.14.01-.07 1.31-7.44 7.1-10.85.06-.04.14-.02.17.04.04.06.02.14-.04.17-5.69 3.35-6.98 10.6-6.99 10.68-.01.06-.06.1-.12.1zM63.64 59.34c-.05 0-.09-.03-.11-.07-.02-.05-2.39-5.4-5.1-7.79-.05-.05-.06-.12-.01-.18.04-.05.12-.06.18-.01 2.75 2.43 5.14 7.83 5.16 7.88.03.06 0 .14-.06.17h-.06z" fill="#333"/>
    <path d="M53.65 37.66c-.03 0-.06-.01-.08-.03-.05-.04-.06-.12-.01-.18 2.12-2.49 1.66-10.9-2.14-18.43-1.68-3.34-5.59-6.05-10.46-7.26-5.75-1.42-11.68-.49-15.89 2.5-8.58 6.09-7.66 18.02-7.64 18.14.01.07-.05.13-.11.14-.07 0-.13-.04-.14-.11-.01-.12-.94-12.19 7.75-18.37 4.26-3.03 10.28-3.98 16.09-2.54 4.93 1.22 8.91 3.99 10.62 7.39 1.77 3.51 2.94 7.46 3.31 11.14.35 3.5-.09 6.26-1.21 7.57-.02.03-.05.04-.09.04zM19.94 39.23c-.03 0-.06-.01-.08-.03-3.76-3.24-2.69-4.76-2.64-4.82.04-.05.12-.07.17-.02.05.04.07.12.03.17-.01.01-.95 1.42 2.61 4.48.05.04.06.12.01.18-.03.02-.07.04-.1.04zM22.26 44.66s1.18 3.72 10.61 4.84c9.43 1.13 19.73-2.62 19.73-2.62s-3.24-1.76-4.11-1.94c0 0-7.02 2.26-12.47 2.03-5.44-.23-13.76-2.31-13.76-2.31z" fill="#333"/>
    <path d="M35.41 45.63c-2.16-.03-11.55-2.33-12.34-1.74-.8.59-1.47.88.28 1.92 1.75 1.03 5.81 3.26 13.23 2.82 7.42-.44 11.26-2.45 12.85-3.26 1.04-.53-.36-2.11-2.06-1.25-2.8 1.43-10.03 1.53-11.96 1.51z" fill="currentColor"/>
    <path d="M38.62 45.9c-6.83 0-14.14-1.64-14.25-1.67-.07-.02-.11-.08-.09-.15.02-.07.08-.11.15-.09.16.04 16.56 3.72 23.05.01.06-.04.13-.01.17.05.03.06.01.14-.05.17-2.2 1.26-5.53 1.68-8.98 1.68z" fill="#333"/>
    <path d="M18.66 56.75s6.21 3.1 8.14 3.17c5.63.2 19.03 0 19.03 0l-.25 10.88s5.82-1.39 9.24-4.12V58.3c0-2.01-2.02-3.17-4.49-2.98-2.47.19-22.59 0-24.94 0-2.35 0-5.62.24-6.73 1.43z" fill="#EFEFEF"/>
    <g stroke="#333" stroke-linecap="round" stroke-width=".25">
      <path d="M28.42 61.06h3.33M54.82 66.68V58.3c0-2.47-3.36-3-5.83-3H26.43c-6.36 0-8.75 1.1-8.77 2.58-.02 1.48-.35 8.94-.35 8.94"/>
      <path d="M17.5 61.61l4.52 1.19c.92.24 1.56 1.07 1.56 2.02v5.05M54.57 61.61l-4.52 1.19c-.92.24-1.56 1.07-1.56 2.02v5.05M18.15 56.84s7.45 2.99 8.65 3.08c1.2.09 18.28 0 19.03 0s7.32-3.91 7.32-3.91M28.42 59.96v11.39M31.75 59.96v11.87M28.42 62.16h3.33M28.42 63.26h3.33M28.42 64.35h3.33M28.42 65.45h3.33M28.42 66.55h3.33M28.42 67.64h3.33M28.42 68.74h3.33M28.42 69.84h3.33M28.42 70.94h3.33"/>
    </g>
    <path d="M18.17 55.3s-1.44-5.92-1.83-7.68c-.39-1.76 4.83-4.09 5.92-2.95 1.09 1.14 2.61 9.79 2.61 9.79s-4.47.6-6.7.84z" stroke="#333" stroke-width=".25" fill="#FFF" stroke-linecap="round"/>
    <path d="M18.93 57.82l6.42-1.89c.95-.28 1.37-1.38.84-2.22l-.74-1.19c-.34-.55-.99-.81-1.62-.66l-5.63 1.36c-.65.16-1.12.73-1.14 1.4l-.05 1.72c-.02 1.02.95 1.77 1.92 1.48zM17.3 51.26s2.3-1.22 4.42-1.54M16.63 48.87s2.9-1.74 4.32-1.68M54.71 55.88s1.44-5.92 1.83-7.68c.39-1.76-4.83-4.09-5.92-2.95-1.09 1.14-2.61 9.79-2.61 9.79s4.47.6 6.7.84z" stroke="#333" stroke-width=".25" fill="#FFF" stroke-linecap="round"/>
    <path d="M53.95 58.4l-6.42-1.89a1.484 1.484 0 01-.84-2.22l.74-1.19c.34-.55.99-.81 1.62-.66l5.63 1.36c.65.16 1.12.73 1.14 1.4l.05 1.72c.02 1.02-.95 1.77-1.92 1.48zM55.58 51.84s-2.3-1.22-4.42-1.54M56.25 49.45s-2.9-1.74-4.32-1.68" stroke="#333" stroke-width=".25" fill="#FFF" stroke-linecap="round"/>
    <g transform="translate(23 53)" fill="#FFF" stroke="#333" stroke-linecap="round" stroke-width=".25">
      <path d="M1.62.69h1.62c.18 0 .34.12.39.29l.69 2.49c.04.16-.01.33-.14.43-.51.37-1.85 1.12-3.32-.01a.415.415 0 01-.15-.4l.51-2.47c.05-.19.21-.33.4-.33z"/>
      <ellipse cx="2.39" cy=".8" rx="1.1" ry="1"/>
    </g>
    <g transform="translate(29 53)" fill="#FFF" stroke="#333" stroke-linecap="round" stroke-width=".25">
      <path d="M1.09.69h1.62c.18 0 .34.12.39.29l.69 2.49c.04.16-.01.33-.14.43-.51.37-1.85 1.12-3.32-.01a.415.415 0 01-.15-.4l.51-2.47C.74.83.9.69 1.09.69z"/>
      <ellipse cx="1.86" cy=".8" rx="1.1" ry="1"/>
    </g>
    <path d="M37.91 59.95s-.42 7.69 7.74 7.69M40.19 67.64s.93 2.02 5.43 1.66" stroke="#333" stroke-width=".25" fill="#FFF" stroke-linecap="round"/>
  </g>
</svg>
`;

export const defaultImg = `data:image/svg+xml;utf8,${anonSvg
  // .replaceAll(/\n/gm, '')
  .replaceAll(/\s+/g, ' ')
  .replaceAll(/[<>#\n]/g, (m) => {
    switch (m) {
      case '<': // return '%3c';
      case '>': // return '%3e';
      case '#': // return '%23';
        return '%' + m.codePointAt(0).toString(16);
      default:
        return '';
    }
  })}`;
