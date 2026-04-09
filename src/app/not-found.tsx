import Link from 'next/link';

/**
 * Custom 404 page — displayed when no route matches.
 */
export default function NotFound(): React.ReactElement {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 px-4'>
      <h2 className='text-2xl font-bold'>Page Not Found</h2>
      <p className='text-gray-600'>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        className='rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        href='/'
      >
        Return Home
      </Link>
    </div>
  );
}
