// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
// export const prerender = true;

export const ssr = true;

import {
  // loadUserData,
  loadViewerData
} from '$lib/utils';

// import moment from 'moment';

/** @type {import('./$types').PageLoad} */
export async function load({
  url,
  fetch
  // route, // params,
}) {
  const searchParams = Object.fromEntries(url.searchParams);

  // const viewerData = await loadViewerData(searchParams?.userName, fetch);
  // console.log('fetched viewerData:', viewerData, viewerData?.errors);

  return {
    // year,
    searchParams, // : Object.fromEntries(url.searchParams.entries()),
    // ...(await loadUserData(searchParams?.userName ?? 'hi176', year, fetch)),
    ...(searchParams?.userName ? await loadViewerData(searchParams?.userName, fetch) : {})
  };
}
