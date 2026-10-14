import type { PrismaService } from "../infrastructure/prisma.service";

export const eventSelect = {
  id: true,
  type: true,
  actorRole: true,
  actorUserId: true,
  reason: true,
  fromStartsAt: true,
  toStartsAt: true,
  createdAt: true,
} as const;

export type EventRow = {
  id: string;
  type: string;
  actorRole: string;
  actorUserId: string | null;
  reason: string | null;
  fromStartsAt: Date | null;
  toStartsAt: Date | null;
  createdAt: Date;
};

export type VisitEventDto = {
  id: string;
  type: string;
  actorRole: string;
  actorName: string | null;
  reason: string | null;
  fromStartsAt: Date | null;
  toStartsAt: Date | null;
  createdAt: Date;
};

/** Maps stored actors to public names without exposing user ids. */
export async function namedEventsForVisits(
  prisma: PrismaService,
  visits: { events: EventRow[] }[],
): Promise<VisitEventDto[][]> {
  const names = await actorNames(
    prisma,
    visits.flatMap((visit) => visit.events.map((event) => event.actorUserId)),
  );
  return visits.map((visit) => visit.events.map((event) => presentEvent(event, names)));
}

export function omitEvents<T extends { events: unknown }>(row: T): Omit<T, "events"> {
  const { events, ...card } = row;
  void events;
  return card;
}

export function presentEvent(event: EventRow, names: Map<string, string>): VisitEventDto {
  return {
    id: event.id,
    type: event.type,
    actorRole: event.actorRole,
    actorName: event.actorUserId ? (names.get(event.actorUserId) ?? null) : null,
    reason: event.reason,
    fromStartsAt: event.fromStartsAt,
    toStartsAt: event.toStartsAt,
    createdAt: event.createdAt,
  };
}

async function actorNames(prisma: PrismaService, ids: (string | null)[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, displayName: true },
  });
  return new Map(users.map((user) => [user.id, user.displayName]));
}

