import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 !text-2xl">This node does not exist</h1>
      <p className="mt-2 text-muted">The page you are looking for is not in the tree. Pick a section from the navigation, or start from the beginning.</p>
      <Link to="/" className="btn btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
