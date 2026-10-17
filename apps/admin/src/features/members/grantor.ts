export function grantorEmail(
  createdBy: string | null,
  members: readonly { userId: string; email: string }[],
): string {
  if (createdBy == null || createdBy.trim() === '') return '—';
  const id = createdBy.trim();
  const byId = members.find((member) => member.userId === id);
  if (byId) return byId.email;
  const byEmail = members.find((member) => member.email === id);
  return byEmail?.email ?? '—';
}
