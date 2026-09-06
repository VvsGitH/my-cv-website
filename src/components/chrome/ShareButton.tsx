import { useEffect, useRef, useState } from 'preact/hooks';

const COPIED_FEEDBACK_MS = 2000;

interface Props {
  share: string;
  shared: string;
}

export default function ShareButton({ share, shared }: Props) {
  const [copied, setCopied] = useState(false);
  const revert = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(revert.current), []);

  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Denied, or an insecure origin — confirming nothing is the honest outcome.
      return;
    }

    setCopied(true);
    clearTimeout(revert.current);
    revert.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <>
      <button
        type="button"
        class="toolbar-button toolbar-share"
        title={copied ? shared : share}
        aria-label={copied ? shared : share}
        onClick={copyLink}
      >
        <span class={copied ? 'icon-check-circle' : 'icon-share-2'} aria-hidden="true"></span>
      </button>

      {/* Empty until copied: a live region announces a change, so there must be one. */}
      <p class="toolbar-toast" role="status" data-visible={copied ? '' : undefined}>
        {copied ? shared : null}
      </p>
    </>
  );
}
