import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { Button, EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Page not found"
      description="The page you are looking for doesn't exist or has been moved."
      action={
        <Link to="/">
          <Button>Back to home</Button>
        </Link>
      }
    />
  );
}
