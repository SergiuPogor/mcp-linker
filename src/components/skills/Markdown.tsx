import { cn } from "@/lib/utils";
import { openUrl } from "@tauri-apps/plugin-opener";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: props => <h1 className="mb-3 mt-6 text-2xl font-semibold first:mt-0" {...props} />,
  h2: props => <h2 className="mb-2 mt-6 text-xl font-semibold" {...props} />,
  h3: props => <h3 className="mb-2 mt-4 text-base font-semibold" {...props} />,
  p: props => <p className="my-3 leading-relaxed" {...props} />,
  ul: props => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
  ol: props => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
  blockquote: props => <blockquote className="my-3 border-l-2 pl-4 text-muted-foreground" {...props} />,
  hr: () => <hr className="my-6" />,
  pre: props => <pre className="my-3 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs" {...props} />,
  code: ({ className, ...props }) => <code className={cn("rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] [pre_&]:bg-transparent [pre_&]:p-0", className)} {...props} />,
  table: props => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: props => <th className="border px-3 py-1.5 text-left font-medium" {...props} />,
  td: props => <td className="border px-3 py-1.5" {...props} />,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2"
      onClick={event => {
        event.preventDefault();
        if (href && /^https?:/.test(href)) openUrl(href);
      }}
    >
      {children}
    </a>
  ),
};

/** A SKILL.md body. Links open in the browser; raw HTML is not rendered. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("text-sm", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
