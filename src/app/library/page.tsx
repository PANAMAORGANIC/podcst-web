import { redirect } from 'next/navigation';

/** Library is the homepage. Old /library bookmarks land on /. */
export default function LibraryRedirectPage() {
  redirect('/');
}
