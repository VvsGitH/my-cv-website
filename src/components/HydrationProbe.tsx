import { useState } from 'react';

/**
 * Scaffold-only React island that proves client hydration works.
 * Replaced by the real Toolbar island in ticket 07 — safe to delete then.
 */
export default function HydrationProbe() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      island clicks: {count}
    </button>
  );
}
