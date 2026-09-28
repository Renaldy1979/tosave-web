"use client";

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { LoadMore } from "@/components/app/load-more";
import { NotificationRow, NotificationRowSkeleton } from "@/components/app/notification-row";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { errorMessage } from "@/lib/api";
import type { NotificationItem } from "@/lib/app-types";
import { listNotifications, markAllNotificationsRead, markNotificationRead, notificationRoute } from "@/lib/notifications";
import { useNotificationsUnread } from "@/lib/notifications-unread";
import { useInfiniteList } from "@/lib/use-infinite-list";

const PAGE_SIZE = 20;

export function NotificacoesView() {
  const router = useRouter();
  const { count: unreadCount, decrement, clear } = useNotificationsUnread();
  const [markingAll, setMarkingAll] = useState(false);

  const { items, setItems, state, hasMore, loadingMore, moreError, loadMore, reload } = useInfiniteList<NotificationItem>(
    "notificacoes",
    (cursor, signal) => listNotifications({ cursor, limit: PAGE_SIZE }, signal).then((page) => ({ items: page.items, nextCursor: page.nextCursor }))
  );

  const handleClick = useCallback(
    (item: NotificationItem) => {
      if (!item.read) {
        setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
        decrement(1);
        markNotificationRead(item.id).catch(() => undefined);
      }
      const route = notificationRoute(item.type, item.targetId);
      if (route) router.push(route);
    },
    [router, setItems, decrement]
  );

  const handleMarkAll = useCallback(async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      clear();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  }, [unreadCount, markingAll, setItems, clear]);

  return (
    <div className="mx-auto max-w-[760px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Notificações</h1>
        {unreadCount > 0 ? (
          <Button variant="ghost" size="sm" leftIcon={CheckCheck} loading={markingAll} onClick={() => void handleMarkAll()}>
            Marcar todas como lidas
          </Button>
        ) : null}
      </div>

      <div className="mt-5 space-y-2 lg:mt-6">
        {state === "loading" ? (
          Array.from({ length: 6 }, (_, i) => <NotificationRowSkeleton key={i} />)
        ) : state === "error" ? (
          <ErrorState onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState kind="no-content" description="Você não tem notificações." />
        ) : (
          <>
            {items.map((item) => (
              <NotificationRow
                key={item.id}
                title={item.title}
                body={item.body}
                type={item.type}
                read={item.read}
                createdAt={item.createdAt}
                onClick={() => handleClick(item)}
              />
            ))}
            <LoadMore hasMore={hasMore} loading={loadingMore} error={moreError} onLoadMore={loadMore} />
          </>
        )}
      </div>
    </div>
  );
}
