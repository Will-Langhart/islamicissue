"use client";

export default function ChatSidebar({
  conversations,
  activeId,
  onNew,
  onSelect,
  onDelete,
  open,
  onClose,
  collapsed,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
        />
      )}
      <aside
        className={`fixed z-30 flex h-full w-72 shrink-0 flex-col overflow-hidden border-r border-line bg-surface transition-all duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-0 md:border-r-0" : "md:w-72"}`}
      >
        <div className="border-b border-line p-3">
          <button
            onClick={onNew}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--grad-brand)] px-3 py-2 text-sm font-semibold text-oncolor shadow-sm transition hover:opacity-95"
          >
            <span className="text-base leading-none">+</span> New chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted">
              Your conversations will appear here.
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.id}>
                  <div
                    className={`group flex items-center gap-1 rounded-lg px-2 py-2 text-sm ${
                      c.id === activeId
                        ? "bg-accentbg text-heading"
                        : "text-ink hover:bg-page"
                    }`}
                  >
                    <button
                      onClick={() => onSelect(c.id)}
                      className="flex-1 truncate text-left"
                      title={c.title}
                    >
                      {c.title}
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      aria-label="Delete conversation"
                      className="shrink-0 rounded p-1 text-muted opacity-0 transition hover:text-ember group-hover:opacity-100"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4h8v2m-9 0v14a2 2 0 002 2h6a2 2 0 002-2V6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <div className="border-t border-line p-3 text-[11px] leading-relaxed text-muted">
          Answers are grounded in the compendium's reviewed issues and argue its
          thesis. Every claim links to its source issue.
        </div>
      </aside>
    </>
  );
}
